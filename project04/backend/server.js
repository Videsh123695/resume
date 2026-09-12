const express = require("express");

const cors=require('cors');
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT;
const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const { GoogleGenAI } = require("@google/genai");
const  {QdrantClient} = require('@qdrant/js-client-rest');
const upload = multer({ dest: "uploads/" });

const app = express();

app.use(cors());


app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});



 async function createEmbedding(text){
    const response=await ai.models.embedContent({
        model:'gemini-embedding-2',
        contents:text,
    });
    return response.embeddings[0].values
}



function cosineSimilarity(vecA, vecB){
    let dotProduct= 0;
    for(let i=0; i<vecA.length; i++){
        dotProduct+= vecA[i]*vecB[i];
    }
    return dotProduct;
}

async function generateResumeAnalysis(resumeContext, jobDescription) {
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",

    contents: `
You are an expert ATS Resume Evaluator and Technical Recruiter.

Analyze the candidate's resume against the given job description.

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeContext}

Return ONLY valid JSON in exactly this structure:

{
  "overallScore": 0,
  "categoryScores": {
    "skillsMatch": 0,
    "experience": 0,
    "projects": 0,
    "education": 0,
    "keywords": 0,
    "atsCompatibility": 0
  },
  "strengths": [],
  "missingSkills": [],
  "suggestions": [],
  "focusTopics": [],
  "summary": ""
}

Rules:
- overallScore must be between 0 and 100.
- Every category score must be between 0 and 100.
- Compare the resume ONLY against the supplied job description.
- Identify important missing skills and keywords.
- Give practical suggestions.
- focusTopics should contain technologies, concepts, or areas the candidate should focus on.
- Do not invent experience that is not present in the resume.
- Return JSON only.
`
  });

  let text = response.text.trim();

  // Remove markdown JSON fences if Gemini returns them
  text = text.replace(/```json/g, "").replace(/```/g, "").trim();

  return JSON.parse(text);
}

function createSessionId() {
  return "resume_" + Date.now();
}


const qdrant = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
});

// async function createResumeIdIndex() {
//   try {
//     await qdrant.createPayloadIndex("pdf-docs", {
//       field_name: "resumeId",
//       field_schema: "keyword"
//     });

//     console.log("resumeId index created");

//   } catch (error) {
//     console.log("resumeId index may already exist");
//   }
// }

app.get('/createCollection' ,async(req,res)=>{
     try{
            await qdrant.createCollection('pdf-docs',{
                vectors:{
                    size:3072,
                    distance:"Cosine",
                },
            });

            

            res.send("collection is created");
     }  
     catch(error){
        console.log(error);
        res.status(500).send(error);
     } 
})

app.get("/create-resume-index", async (req, res) => {

  try {

    await qdrant.createPayloadIndex("pdf-docs", {
      field_name: "resumeId",
      field_schema: "keyword"
    });

    res.json({
      success: true,
      message: "resumeId index created"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

});

app.get("/", (req, res) => {
  res.send("server is ruunig successfully");
});

app.post("/upload", upload.single("resume"), async (req, res) => {
  console.log(req.file);
  try {
    
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;

    


const sentences = text.trim().split(/(?<=[.!?])\s+/);
const chunks = [];
let currentParagraph = "";

for (const sentence of sentences) {
  currentParagraph += (currentParagraph ? " " : "") + sentence;

  if (currentParagraph.length >= 300) {
    chunks.push(currentParagraph);
    currentParagraph = "";
  }
}

if (currentParagraph !== "") {
  chunks.push(currentParagraph);
}

console.log(chunks);





    const embedding=await createEmbedding(chunks[0]);
    console.log(embedding);

    const chunkEmbeddings= [];

    for(const chunk of chunks){
        const embedding= await createEmbedding(chunk);

        chunkEmbeddings.push({
            text:chunk,
            embedding
        });
    }

    
    const points= chunkEmbeddings.map((item, index)=>({
        id: index+1,
        vector: item.embedding,
        payload:{
            text:item.text
        }

    }));

    await qdrant.upsert("pdf-docs",{
        points,
    })

    const question = req.body.question;
    const questionEmbedding= await createEmbedding(question);
    console.log(questionEmbedding.length);


    console.log(question);
    

    const searchResult= await qdrant.query('pdf-docs',{
        vector:questionEmbedding,
        limit:1,
        with_payload:true,
    });
    console.log(searchResult);
       let bestChunk = "No matching context found.";
    if (searchResult && searchResult.points && searchResult.points.length > 0) {
        bestChunk = searchResult.points[0].payload.text;
    }

    

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      
      contents: `Answer the question using the context :${bestChunk} and ${question}`,
    });
    



     res.json({
      question: question,
      matched_context: bestChunk,
      response: response.text,

    });
    
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error,
    });
  }

  
});

app.post(
  "/analyze-resume",
  upload.single("resume"),
  async (req, res) => {

    try {

      if (!req.file) {
        return res.status(400).json({
          message: "Resume PDF is required"
        });
      }

      const jobDescription = req.body.jobDescription;

      if (!jobDescription) {
        return res.status(400).json({
          message: "Job description is required"
        });
      }

      // -----------------------------
      // 1. Read Resume PDF
      // -----------------------------

      const dataBuffer = fs.readFileSync(req.file.path);

      const pdfData = await pdfParse(dataBuffer);

      const resumeText = pdfData.text;

      if (!resumeText || resumeText.trim().length === 0) {
        return res.status(400).json({
          message: "Could not extract text from resume"
        });
      }


      // -----------------------------
      // 2. Chunk Resume
      // -----------------------------

      const sentences = resumeText
        .trim()
        .split(/(?<=[.!?])\s+/);

      const chunks = [];

      let currentParagraph = "";

      for (const sentence of sentences) {

        currentParagraph +=
          (currentParagraph ? " " : "") + sentence;

        if (currentParagraph.length >= 300) {

          chunks.push(currentParagraph);

          currentParagraph = "";
        }
      }

      if (currentParagraph !== "") {
        chunks.push(currentParagraph);
      }


      // -----------------------------
      // 3. Generate embeddings
      // -----------------------------

      const chunkEmbeddings = [];

      for (const chunk of chunks) {

        const embedding = await createEmbedding(chunk);

        chunkEmbeddings.push({
          text: chunk,
          embedding
        });

      }


      // -----------------------------
      // 4. Store resume in Qdrant
      // -----------------------------

      const resumeId = crypto.randomUUID();

      const points = chunkEmbeddings.map((item, index) => ({
        id: crypto.randomUUID(),

        vector: item.embedding,

        payload: {
          resumeId: resumeId,
          text: item.text,
          type: "resume"
        }
      }));


      await qdrant.upsert("pdf-docs", {
        points
      });


      // -----------------------------
      // 5. Create Resume Context
      // -----------------------------

      /*
        For the initial analysis we use the
        complete extracted resume text.

        Qdrant is already storing the resume
        chunks for future chat/RAG.
      */

      const resumeContext = resumeText;


      // -----------------------------
      // 6. Analyze Resume against JD
      // -----------------------------

      const analysis = await generateResumeAnalysis(
        resumeContext,
        jobDescription
      );


      // -----------------------------
      // 7. Delete uploaded temporary PDF
      // -----------------------------

      fs.unlinkSync(req.file.path);


      // -----------------------------
      // 8. Return result
      // -----------------------------

      res.json({

        success: true,

        resumeId: resumeId,

        overallScore: analysis.overallScore,

        categoryScores: analysis.categoryScores,

        strengths: analysis.strengths,

        missingSkills: analysis.missingSkills,

        suggestions: analysis.suggestions,

        focusTopics: analysis.focusTopics,

        summary: analysis.summary

      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message: error.message
      });

    }

  }
);


app.post("/chat-resume", async (req, res) => {

  try {

    const { resumeId, question } = req.body;

    if (!resumeId || !question) {

      return res.status(400).json({
        message: "resumeId and question are required"
      });

    }


    // -----------------------------
    // 1. Create question embedding
    // -----------------------------

    const questionEmbedding =
      await createEmbedding(question);


    // -----------------------------
    // 2. Search resume in Qdrant
    // -----------------------------

    const searchResult = await qdrant.query(
      "pdf-docs",
      {
        vector: questionEmbedding,

        filter: {
          must: [
            {
              key: "resumeId",
              match: {
                value: resumeId
              }
            }
          ]
        },

        limit: 5,

        with_payload: true
      }
    );


    // -----------------------------
    // 3. Build context
    // -----------------------------

    let context = "";

    if (
      searchResult &&
      searchResult.points &&
      searchResult.points.length > 0
    ) {

      context = searchResult.points
        .map(point => point.payload.text)
        .join("\n\n");

    }


    if (!context) {

      context = "No relevant resume information found.";

    }


    // -----------------------------
    // 4. Ask Gemini
    // -----------------------------

    const response = await ai.models.generateContent({

      model: "gemini-3.5-flash-lite",

      contents: `
You are a resume assistant.

Answer the user's question using ONLY the resume context below.

RESUME CONTEXT:
${context}

USER QUESTION:
${question}

If the information is not present in the resume context, clearly say that the information is not available in the resume.

Give a helpful and concise answer.
`
    });


    // -----------------------------
    // 5. Return answer
    // -----------------------------

    res.json({

      success: true,

      resumeId: resumeId,

      question: question,

      matched_context: context,

      response: response.text

    });


  } catch (error) {

    console.log(error);

    res.status(500).json({

      message: error.message

    });

  }

});
app.listen(port, () => {
  console.log(`app is running on http://localhost:${port}`);
});

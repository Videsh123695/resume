# AI Resume Checker & RAG Chat API

An AI-powered backend API that evaluates a resume against a job description, stores the resume in a vector database, generates ATS-style scoring and recommendations, and provides a RAG-based chat interface for asking questions about the uploaded resume.

## 🚀 Project Overview

This project combines:

- **Node.js + Express.js** for the backend API
- **PDF parsing** for extracting resume text
- **Google Gemini** for embeddings and LLM-based resume analysis
- **Qdrant Cloud** for vector storage and semantic retrieval
- **Multer** for PDF file uploads
- **Postman** for API testing

The application follows two main workflows:

```text
                  INITIAL RESUME ANALYSIS

Resume PDF + Job Description
            │
            ▼
       PDF Text Extraction
            │
            ▼
          Chunking
            │
            ├───────────────┐
            ▼               ▼
       Full Resume      Generate Embeddings
            │               │
            ▼               ▼
       Gemini LLM         Qdrant
            │               │
            ▼               │
  Resume Evaluation         │
            │               │
            ▼               │
  ┌────────────────────┐    │
  │ Overall Score /100  │    │
  │ Category Scores     │    │
  │ Strengths           │    │
  │ Missing Skills      │    │
  │ Suggestions         │    │
  │ Focus Topics        │    │
  └────────────────────┘    │
                            │
                            ▼
                         resumeId
```

After the initial analysis, the user can chat with the stored resume:

```text
                  RESUME CHAT / RAG

User Question
      │
      ▼
Question Embedding
      │
      ▼
Qdrant Semantic Search
      │
      ▼
Filter by resumeId
      │
      ▼
Top Relevant Resume Chunks
      │
      ▼
Gemini LLM
      │
      ▼
Answer
```

---

## ✨ Features

### 1. Resume PDF Upload

Upload a resume in PDF format through the `/analyze-resume` endpoint.

The backend extracts text from the PDF using `pdf-parse`.

### 2. Resume Chunking

The extracted resume text is divided into smaller chunks before generating embeddings.

These chunks are stored in Qdrant for later semantic retrieval.

### 3. Vector Embeddings

Each resume chunk is converted into an embedding using Google's embedding model.

```text
Resume Chunk
     ↓
Gemini Embedding Model
     ↓
Vector
     ↓
Qdrant
```

### 4. Vector Database Storage

Qdrant stores:

- Resume chunk embeddings
- Resume text
- `resumeId`
- Resume metadata

A `resumeId` is used to associate multiple chunks with the same uploaded resume.

### 5. AI Resume Evaluation

The complete extracted resume is provided to Gemini along with the job description.

The AI evaluates how well the resume matches the job.

The response contains:

- Overall score
- Category-wise scores
- Strengths
- Missing skills
- Suggestions
- Focus topics
- Summary

### 6. Category-Wise Scoring

The evaluator returns scores for categories such as:

```text
Skills Match
Experience
Projects
Education
Keywords
ATS Compatibility
```

Each score is calculated out of 100.

### 7. Missing Skills Detection

The system identifies skills mentioned in the job description that are not sufficiently represented in the resume.

### 8. Improvement Suggestions

The LLM provides practical recommendations for improving the resume according to the target job description.

### 9. Focus Topics

The system suggests technologies, concepts, or areas that the candidate should focus on.

### 10. RAG-Based Resume Chat

After analysis, the returned `resumeId` can be used to chat with the uploaded resume.

The user's question is embedded and searched against the relevant resume chunks in Qdrant.

Only chunks belonging to the selected `resumeId` are retrieved.

---

# 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Backend/API framework |
| Multer | PDF file upload handling |
| pdf-parse | Extract text from PDF |
| Google Gemini | LLM and embeddings |
| Qdrant Cloud | Vector database |
| Postman | API testing |
| dotenv | Environment variable management |

---

# 📁 Project Structure

```text
backend/
│
├── uploads/
│
├── node_modules/
│
├── .env
├── package.json
├── package-lock.json
└── server.js
```

---

# ⚙️ Installation

## 1. Clone the repository

```bash
git clone https://github.com/Videsh123695/resume.git
```

Move into the project directory:

```bash
cd backend
```

## 2. Install dependencies

```bash
npm install
```

Required packages include:

```bash
npm install express dotenv multer pdf-parse @google/genai @qdrant/js-client-rest
```

---

# 🔐 Environment Variables

Create a `.env` file in the backend root directory:

```env
GEMINI_API_KEY=your_gemini_api_key

QDRANT_URL=your_qdrant_cluster_url

QDRANT_API_KEY=your_qdrant_api_key
```

Example:

```env
GEMINI_API_KEY=xxxxxxxxxxxxxxxx

QDRANT_URL=https://your-cluster.aws.cloud.qdrant.io:6333

QDRANT_API_KEY=xxxxxxxxxxxxxxxx
```

> Never commit `.env` to GitHub.

Add this to `.gitignore`:

```gitignore
node_modules/
.env
uploads/
```

---

# ▶️ Run the Server

Start the server:

```bash
node server.js
```

The server runs on:

```text
http://localhost:6700
```

If the server starts correctly:

```text
server is running on http://localhost:6700
```

---

# 🗄️ Qdrant Collection

The application uses a Qdrant collection named:

```text
pdf-docs
```

The collection is configured with:

```text
Vector size: 3072
Distance: Cosine
```

The `resumeId` payload field is indexed as a keyword field so Qdrant can filter resume chunks efficiently.

Conceptually:

```text
pdf-docs
│
├── Chunk 1
│   ├── vector
│   ├── resumeId
│   └── text
│
├── Chunk 2
│   ├── vector
│   ├── resumeId
│   └── text
│
└── Chunk 3
    ├── vector
    ├── resumeId
    └── text
```

---

# 🔌 API Endpoints

## 1. Health Check

### Request

```http
GET /
```

### URL

```text
http://localhost:6700/
```

### Response

```text
server is running successfully
```

---

# 2. Create Qdrant Collection

### Request

```http
GET /createCollection
```

### URL

```text
http://localhost:6700/createCollection
```

This creates the `pdf-docs` collection.

Run this before uploading the first resume if the collection does not already exist.

---

# 3. Create Resume ID Index

If the collection already exists but the `resumeId` payload index has not been created, use:

```http
GET /create-resume-index
```

### URL

```text
http://localhost:6700/create-resume-index
```

This creates a keyword index for:

```text
resumeId
```

The index is required for filtering resume chunks during RAG chat.

---

# 4. Analyze Resume

This is the primary endpoint of the application.

### Request

```http
POST /analyze-resume
```

### URL

```text
http://localhost:6700/analyze-resume
```

### Body

Use:

```text
multipart/form-data
```

Add these fields:

| Key | Type | Value |
|---|---|---|
| `resume` | File | Resume PDF |
| `jobDescription` | Text | Complete job description |

### Example

```text
resume:
Videsh_Kumar_Resume.pdf

jobDescription:
We are looking for a Software Developer with strong
JavaScript, React.js, Node.js, Express.js and MongoDB
skills...
```

### Response

```json
{
  "success": true,
  "resumeId": "550e8400-e29b-41d4-a716-446655440000",
  "overallScore": 82,
  "categoryScores": {
    "skillsMatch": 88,
    "experience": 70,
    "projects": 90,
    "education": 85,
    "keywords": 78,
    "atsCompatibility": 82
  },
  "strengths": [
    "Strong MERN stack knowledge",
    "Relevant Node.js and Express.js projects"
  ],
  "missingSkills": [
    "Docker",
    "AWS",
    "TypeScript"
  ],
  "suggestions": [
    "Add measurable achievements to project descriptions",
    "Include relevant job-specific keywords naturally"
  ],
  "focusTopics": [
    "Docker",
    "AWS",
    "TypeScript",
    "System Design"
  ],
  "summary": "The resume is a strong match for the provided Software Developer role."
}
```

### Important

Save the returned:

```text
resumeId
```

It is required for resume chat.

---

# 5. Chat With Resume

### Request

```http
POST /chat-resume
```

### URL

```text
http://localhost:6700/chat-resume
```

### Headers

```http
Content-Type: application/json
```

### Body

```json
{
  "resumeId": "550e8400-e29b-41d4-a716-446655440000",
  "question": "What Node.js experience does this candidate have?"
}
```

### Response

```json
{
  "success": true,
  "resumeId": "550e8400-e29b-41d4-a716-446655440000",
  "question": "What Node.js experience does this candidate have?",
  "matched_context": "Relevant resume content...",
  "response": "The candidate has experience building backend applications using Node.js and Express.js..."
}
```

---

# 🧠 How RAG Works in This Project

The chat functionality follows the Retrieval-Augmented Generation pattern.

## Step 1 — User asks a question

Example:

```text
What projects are most relevant to this job?
```

## Step 2 — Convert question into embedding

```text
Question
   ↓
Gemini Embedding Model
   ↓
Question Vector
```

## Step 3 — Search Qdrant

Qdrant compares the question vector against stored resume vectors.

The search is also filtered by:

```text
resumeId
```

This prevents chunks from another resume being returned.

## Step 4 — Retrieve relevant chunks

The top relevant chunks are combined into context.

## Step 5 — Send context to Gemini

```text
Resume Context
      +
User Question
      ↓
Gemini
      ↓
Answer
```

This allows the chatbot to answer questions based on the uploaded resume rather than relying only on the model's general knowledge.

---

# 📊 Resume Analysis Logic

The initial analysis intentionally uses the **complete extracted resume text** rather than only one retrieved chunk.

This is important because resume scoring should consider the entire candidate profile.

```text
Complete Resume
      +
Job Description
      ↓
Gemini
      ↓
Resume Evaluation
```

Qdrant retrieval is primarily used for the subsequent chat/RAG workflow.

---

# 🧪 Testing With Postman

## Analyze Resume

```http
POST http://localhost:6700/analyze-resume
```

Postman:

```text
Body
  ↓
form-data

resume           File
jobDescription   Text
```

---

## Chat

```http
POST http://localhost:6700/chat-resume
```

Postman:

```text
Body
  ↓
raw
  ↓
JSON
```

Example:

```json
{
  "resumeId": "YOUR_RESUME_ID",
  "question": "What are the candidate's strongest technical skills?"
}
```

---

# 🔄 Complete Application Flow

```text
                    USER
                     │
                     ▼
              Upload Resume PDF
                     │
                     +
              Job Description
                     │
                     ▼
              /analyze-resume
                     │
                     ▼
                pdf-parse
                     │
                     ▼
              Extract Resume Text
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
   Complete Resume          Resume Chunks
          │                     │
          ▼                     ▼
      Gemini LLM             Embeddings
          │                     │
          │                     ▼
          │                   Qdrant
          │                     │
          ▼                     │
    Resume Analysis             │
          │                     │
          ▼                     │
 ┌──────────────────────┐       │
 │ Overall Score        │       │
 │ Category Scores      │       │
 │ Strengths            │       │
 │ Missing Skills       │       │
 │ Suggestions          │       │
 │ Focus Topics         │       │
 └──────────────────────┘       │
          │                     │
          └─────────┬───────────┘
                    ▼
                resumeId
                    │
                    ▼
              User asks question
                    │
                    ▼
              /chat-resume
                    │
                    ▼
            Question Embedding
                    │
                    ▼
                 Qdrant
                    │
              resumeId filter
                    │
                    ▼
            Relevant Resume Chunks
                    │
                    ▼
                Gemini LLM
                    │
                    ▼
                  Answer
```

---

# 🔒 Security Notes

- Keep API keys inside `.env`.
- Do not upload `.env` to GitHub.
- Do not expose Qdrant API keys in frontend code.
- Validate uploaded files before processing in production.
- Consider adding authentication before allowing users to access stored resumes.
- Consider adding file-size limits to prevent very large uploads.

---

# 🚧 Future Improvements

Possible improvements for the next version:

- Section-aware resume chunking
- Better ATS scoring methodology
- Job-description keyword extraction
- Skill matching using semantic similarity
- Resume improvement recommendations
- Resume history and multiple versions
- User authentication
- Persistent resume metadata
- Chat conversation history
- Streaming LLM responses
- Frontend dashboard
- Resume comparison against multiple job descriptions
- Database for users and resume metadata
- Production logging and monitoring
- Rate limiting
- File validation and security improvements

---

# 📌 Current Architecture

```text
Frontend / Postman
        │
        ▼
    Express API
        │
        ├───────────────┐
        ▼               ▼
   pdf-parse       Google Gemini
        │               │
        │          ┌────┴─────┐
        │          │          │
        │       Embedding     LLM
        │          │          │
        ▼          ▼          ▼
      Resume ───► Qdrant ◄── Analysis
                    │
                    ▼
                 RAG Chat
```

---

# 🎯 Project Goal

The goal of this project is to build an intelligent **AI Resume Checker** that can:

1. Understand a candidate's resume.
2. Compare it against a specific job description.
3. Produce an overall ATS/relevance score out of 100.
4. Provide category-wise evaluation.
5. Identify missing skills and keywords.
6. Recommend areas for improvement.
7. Store the resume as searchable vector data.
8. Allow users to ask follow-up questions about their resume using RAG.

---

# 👨‍💻 Author

**Videsh Kumar**

Computer Science & Engineering Student  
Backend Development | MERN Stack | Machine Learning | Generative AI | RAG

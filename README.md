# AI Resume Checker & RAG Assistant

An AI-powered full-stack application that analyzes a resume against a Job Description, generates an ATS/relevance score, identifies strengths and missing skills, and provides a RAG-based conversational interface for asking questions about the uploaded resume.

> **Project Status:** 🚧 Work in Progress
> This project is part of my hands-on learning journey in Generative AI, RAG, vector databases, LLM evaluation, and benchmarking.

---
LIVE LINK :  https://resume-optimize0.netlify.app/

## 📌 Overview

The platform allows users to:

* Upload a resume in PDF format.
* Provide a Job Description.
* Analyze the resume against the given job requirements.
* Generate an overall ATS/relevance score.
* View category-wise analysis.
* Identify strengths and missing skills.
* Receive suggestions for improving the resume.
* Ask follow-up questions about the resume using a RAG-based chat system.

The project combines a traditional full-stack architecture with Generative AI and vector search to create a practical AI-powered application.

---

## ✨ Features

### Resume Analysis

The application extracts text from the uploaded PDF and evaluates the resume against the provided Job Description.

The analysis provides:

* Overall ATS/Relevance Score
* Skills Match
* Experience Match
* Projects Relevance
* Education Match
* Keyword Match
* ATS Compatibility
* Strengths
* Missing Skills
* Improvement Suggestions
* Focus Areas

### RAG-Based Resume Chat

After analysis, users can ask questions about their resume.

The application:

1. Processes the resume text.
2. Splits the content into meaningful chunks.
3. Generates embeddings.
4. Stores the embeddings in Qdrant.
5. Converts user questions into embeddings.
6. Retrieves relevant resume chunks.
7. Sends the retrieved context to the LLM.
8. Generates a context-aware response.

---

## 🧠 Concepts Explored

This project helped me gain practical exposure to:

* Generative AI
* Large Language Models (LLMs)
* Retrieval-Augmented Generation (RAG)
* Text Embeddings
* Vector Databases
* Semantic Search
* Prompt Engineering
* LLM-based Text Generation
* LLM Evaluation Concepts
* Benchmarking Concepts
* Full-Stack AI Application Development

I have implemented selected concepts in this project and plan to expand the system as I continue learning.

---

## 🏗️ Architecture

```text
                    User
                     │
                     ▼
          ┌─────────────────────┐
          │ React + Vite        │
          │ Frontend            │
          └──────────┬──────────┘
                     │
                     │ REST API
                     ▼
          ┌─────────────────────┐
          │ Node.js + Express   │
          │ Backend             │
          └─────────┬───────────┘
                    │
          ┌─────────┴───────────┐
          │                     │
          ▼                     ▼
    ┌───────────┐        ┌──────────────┐
    │ Gemini API│        │ Qdrant Cloud │
    │ LLM       │        │ Vector DB    │
    └───────────┘        └──────────────┘
```

---

## 🔄 Application Workflow

### 1. Resume Analysis

```text
Resume PDF
    ↓
PDF Text Extraction
    ↓
Resume Text
    +
Job Description
    ↓
Gemini
    ↓
ATS / Relevance Analysis
    ↓
Score + Insights
```

### 2. RAG Chat

```text
Resume
   ↓
Text Chunking
   ↓
Embeddings
   ↓
Qdrant Vector Database
   ↓
User Question
   ↓
Question Embedding
   ↓
Semantic Search
   ↓
Relevant Resume Chunks
   ↓
Gemini
   ↓
Context-Aware Answer
```

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* JavaScript
* CSS
* Lucide React

### Backend

* Node.js
* Express.js
* REST APIs
* Multer
* PDF parsing
* CORS

### AI

* Google Gemini API
* Text generation
* Embeddings
* Prompt-based analysis

### Vector Database

* Qdrant Cloud
* Vector embeddings
* Similarity search
* Metadata filtering

### Deployment

* Netlify — Frontend
* Render — Backend
* Qdrant Cloud — Vector Database

---

## 📁 Project Structure

```text
project04/
    │
    ├── frontend/
    │   ├── src/
    │   │   ├── App.jsx
    │   │   ├── main.jsx
    │   │   └── styles.css
    │   ├── package.json
    │   └── ...
    │
    └── backend/
        ├── server.js
        ├── package.json
        ├── .env
        └── ...
```

---

## ⚙️ Environment Variables

### Backend

Create a `.env` file inside the backend directory:

```env
GEMINI_API_KEY=your_gemini_api_key
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_api_key
PORT=6700
```

### Frontend

Create a `.env` file inside the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:6700
```

For production, use the deployed backend URL:

```env
VITE_API_BASE_URL=https://your-backend.onrender.com
```

> Never commit API keys or `.env` files to GitHub.

---

## 🚀 Local Setup

### Clone the repository

```bash
git clone https://github.com/Videsh123695/resume.git
cd project04
```

### Backend

```bash
cd backend
npm install
npm start
```

Backend runs locally on:

```text
http://localhost:6700
```

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs locally on:

```text
http://localhost:5173
```

---

## 🔌 API Endpoints

### Analyze Resume

```http
POST /analyze-resume
```

Accepts:

* Resume PDF
* Job Description

Returns:

* Resume ID
* Overall score
* Category scores
* Strengths
* Missing skills
* Suggestions
* Focus topics
* Summary

### Resume Chat

```http
POST /chat-resume
```

Request:

```json
{
  "resumeId": "resume-id",
  "question": "What skills am I missing for this job?"
}
```

Returns an AI-generated response based on relevant resume context retrieved from Qdrant.

---

## 📊 Current Learning Focus

The project currently focuses on understanding how AI components can be integrated into a real-world application.

Areas explored include:

```text
Generative AI
     ↓
LLM Text Generation
     ↓
Embeddings
     ↓
Vector Database
     ↓
Semantic Retrieval
     ↓
RAG
     ↓
LLM Response
     ↓
Evaluation & Benchmarking
```

---

## 🔮 Future Improvements

Planned improvements include:

* Better resume-to-JD scoring methodology
* Improved semantic chunking
* More reliable retrieval evaluation
* RAG evaluation metrics
* LLM response evaluation
* Benchmarking different models
* Better prompt optimization
* Hallucination detection
* Resume keyword analysis
* Skill-gap visualization
* Multiple resume comparison
* Job-specific resume recommendations
* Authentication and user history
* Improved UI/UX
* Automated evaluation pipelines

---

## 🎯 Learning Outcome

This project has helped me move from understanding AI concepts theoretically toward implementing them in a working application.

The main goal is not only to build a resume checker, but to continuously improve my understanding of:

**LLMs → Embeddings → Vector Search → RAG → Evaluation → Benchmarking**

and explore how these technologies can be combined with modern full-stack development.

---

## 👨‍💻 Author

**Videsh Kumar**

Computer Science & Engineering Student
Interested in Full-Stack Development, Generative AI, RAG, Machine Learning, and AI Engineering.

---

## ⭐ Future Direction

This project is still evolving.

The next phase will focus on making the analysis more reliable, improving retrieval quality, introducing proper LLM evaluation and benchmarking, and adding more practical AI capabilities.

**Build. Learn. Evaluate. Improve.**

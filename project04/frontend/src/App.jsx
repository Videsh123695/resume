import { useState } from "react";
import {
  Upload,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Send,
  RotateCcw,
  Target,
  Lightbulb,
  BriefcaseBusiness,
  ChevronRight,
  LoaderCircle,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://resume-ycdj.onrender.com";

function App() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");

  const [analysis, setAnalysis] = useState(null);
  const [resumeId, setResumeId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("analysis");

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  const [dragActive, setDragActive] = useState(false);

  // -----------------------------------------
  // Handle Resume File
  // -----------------------------------------

  const handleFile = (file) => {
    setError("");

    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF resume.");
      return;
    }

    setResumeFile(file);
  };

  // -----------------------------------------
  // Drag & Drop
  // -----------------------------------------

  const handleDrop = (event) => {
    event.preventDefault();

    setDragActive(false);

    const file = event.dataTransfer.files?.[0];

    handleFile(file);
  };

  // -----------------------------------------
  // Analyze Resume
  // -----------------------------------------

  const analyzeResume = async (event) => {
    event.preventDefault();

    setError("");

    if (!resumeFile) {
      setError("Please upload your resume PDF.");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Please enter the job description.");
      return;
    }

    const formData = new FormData();

    formData.append("resume", resumeFile);

    formData.append(
      "jobDescription",
      jobDescription
    );

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/analyze-resume`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Resume analysis failed."
        );
      }

      console.log("Analysis response:", data);

      setAnalysis(data);

      setResumeId(data.resumeId || "");

      setMessages([]);

      setActiveTab("analysis");

    } catch (error) {

      console.error(error);

      setError(
        error.message ||
          "Something went wrong while analyzing the resume."
      );

    } finally {

      setLoading(false);

    }
  };

  // -----------------------------------------
  // Chat With Resume
  // -----------------------------------------

  const sendMessage = async (
    event,
    presetQuestion = ""
  ) => {

    if (event) {
      event.preventDefault();
    }

    const text =
      (presetQuestion || question).trim();

    if (!text) return;

    if (!resumeId) {
      setError(
        "Resume ID is missing. Please analyze a resume first."
      );

      return;
    }

    if (chatLoading) return;

    setQuestion("");

    const userMessage = {
      role: "user",
      content: text,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    try {

      setChatLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/chat-resume`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            resumeId: resumeId,
            question: text,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Could not get an answer."
        );
      }

      const assistantMessage = {
        role: "assistant",
        content:
          data.response ||
          "No answer was returned.",
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);

    } catch (error) {

      console.error(error);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          error: true,
          content:
            error.message ||
            "Something went wrong.",
        },
      ]);

    } finally {

      setChatLoading(false);

    }
  };

  // -----------------------------------------
  // Reset
  // -----------------------------------------

  const resetProject = () => {

    setResumeFile(null);

    setJobDescription("");

    setAnalysis(null);

    setResumeId("");

    setMessages([]);

    setQuestion("");

    setError("");

    setActiveTab("analysis");
  };

  const score =
    analysis?.overallScore ?? 0;

  return (
    <div className="app-shell">

      {/* ======================================
          HEADER
      ====================================== */}

      <header className="topbar">

        <div className="brand">

          <div className="brand-mark">
            <Sparkles size={18} />
          </div>

          <div>
            <strong>ResumeAI</strong>

            <span>
              ATS Intelligence
            </span>
          </div>

        </div>

        <div className="topbar-right">

          {analysis && (
            <div className="status-pill">

              <CheckCircle2 size={15} />

              Resume analyzed

            </div>
          )}

          <button
            className="ghost-button"
            onClick={resetProject}
          >

            <RotateCcw size={16} />

            New analysis

          </button>

        </div>

      </header>

      {/* ======================================
          MAIN
      ====================================== */}

      <main className="main-container">

        {!analysis ? (

          /* ==================================
             UPLOAD / ANALYSIS SCREEN
          ================================== */

          <section className="landing-grid">

            <div className="hero-copy">

              <div className="eyebrow">

                <Sparkles size={15} />

                AI-powered resume intelligence

              </div>

              <h1>

                Know exactly how your resume

                <span>
                  matches the job.
                </span>

              </h1>

              <p className="hero-description">

                Upload your resume, add the
                target job description, and get
                a detailed AI evaluation with an
                overall score, category scores,
                missing skills, and actionable
                improvement suggestions.

              </p>

              <div className="feature-row">

                <div>

                  <Target size={17} />

                  <span>
                    ATS match score
                  </span>

                </div>

                <div>

                  <BriefcaseBusiness size={17} />

                  <span>
                    Skill gap analysis
                  </span>

                </div>

                <div>

                  <MessageCircle size={17} />

                  <span>
                    Resume RAG chat
                  </span>

                </div>

              </div>

            </div>

            {/* ANALYSIS FORM */}

            <form
              className="analysis-card"
              onSubmit={analyzeResume}
            >

              <div className="card-heading">

                <div>

                  <h2>
                    Analyze a resume
                  </h2>

                  <p>
                    Upload a PDF and paste
                    the job description.
                  </p>

                </div>

                <div className="step-badge">
                  01
                </div>

              </div>

              <label className="field-label">
                Resume PDF
              </label>

              <div
                className={`dropzone ${
                  dragActive
                    ? "drag-active"
                    : ""
                } ${
                  resumeFile
                    ? "has-file"
                    : ""
                }`}
                onDragOver={(event) => {

                  event.preventDefault();

                  setDragActive(true);

                }}
                onDragLeave={() =>
                  setDragActive(false)
                }
                onDrop={handleDrop}
              >

                <input
                  id="resume-input"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(event) =>
                    handleFile(
                      event.target.files?.[0]
                    )
                  }
                />

                {resumeFile ? (

                  <>

                    <div className="upload-icon success">

                      <CheckCircle2
                        size={25}
                      />

                    </div>

                    <strong>
                      {resumeFile.name}
                    </strong>

                    <span>

                      {(
                        resumeFile.size /
                        1024 /
                        1024
                      ).toFixed(2)}

                      {" MB · PDF"}

                    </span>

                  </>

                ) : (

                  <>

                    <div className="upload-icon">

                      <Upload size={25} />

                    </div>

                    <strong>
                      Drop your resume here
                    </strong>

                    <span>
                      or click to browse · PDF only
                    </span>

                  </>

                )}

                <label
                  htmlFor="resume-input"
                  className="browse-link"
                >

                  {resumeFile
                    ? "Choose another file"
                    : "Browse files"}

                </label>

              </div>

              <label
                className="field-label"
                htmlFor="job-description"
              >
                Job description
              </label>

              <textarea
                id="job-description"
                className="jd-input"
                placeholder="Paste the complete job description here..."
                value={jobDescription}
                onChange={(event) =>
                  setJobDescription(
                    event.target.value
                  )
                }
              />

              {error && (

                <div className="error-box">

                  <AlertCircle size={17} />

                  <span>
                    {error}
                  </span>

                </div>

              )}

              <button
                className="primary-button"
                type="submit"
                disabled={loading}
              >

                {loading ? (

                  <>

                    <LoaderCircle
                      className="spin"
                      size={18}
                    />

                    Analyzing resume...

                  </>

                ) : (

                  <>

                    Analyze resume

                    <ArrowRight size={18} />

                  </>

                )}

              </button>

              <p className="privacy-note">

                Resume processing is handled by
                your configured backend and the
                resume is stored in Qdrant for
                RAG chat.

              </p>

            </form>

          </section>

        ) : (

          /* ==================================
             DASHBOARD
          ================================== */

          <section className="dashboard">

            <div className="dashboard-header">

              <div>

                <div className="eyebrow">

                  <CheckCircle2 size={15} />

                  Analysis complete

                </div>

                <h1>
                  Your resume match report
                </h1>

                <p>
                  AI evaluation based on your
                  uploaded resume and target
                  job description.
                </p>

              </div>

              <div className="dashboard-actions">

                <button
                  className={`tab-button ${
                    activeTab === "analysis"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setActiveTab(
                      "analysis"
                    )
                  }
                >

                  <Target size={17} />

                  Analysis

                </button>

                <button
                  className={`tab-button ${
                    activeTab === "chat"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setActiveTab("chat")
                  }
                >

                  <MessageCircle
                    size={17}
                  />

                  Chat with resume

                </button>

              </div>

            </div>

            {activeTab === "analysis" ? (

              <AnalysisDashboard
                analysis={analysis}
                score={score}
              />

            ) : (

              <ChatPanel
                messages={messages}
                question={question}
                setQuestion={setQuestion}
                sendMessage={sendMessage}
                chatLoading={chatLoading}
                resumeId={resumeId}
              />

            )}

          </section>

        )}

      </main>

      <footer className="footer">

        <span>
          ResumeAI
        </span>

        <span>
          Powered by Gemini + Qdrant
        </span>

      </footer>

    </div>
  );
}


// =================================================
// ANALYSIS DASHBOARD
// =================================================

function AnalysisDashboard({
  analysis,
  score,
}) {

  const categories = [

    [
      "Skills Match",
      analysis?.categoryScores?.skillsMatch,
    ],

    [
      "Experience",
      analysis?.categoryScores?.experience,
    ],

    [
      "Projects",
      analysis?.categoryScores?.projects,
    ],

    [
      "Education",
      analysis?.categoryScores?.education,
    ],

    [
      "Keywords",
      analysis?.categoryScores?.keywords,
    ],

    [
      "ATS Compatibility",
      analysis?.categoryScores?.atsCompatibility,
    ],

  ];

  return (

    <div className="report-grid">

      {/* SCORE */}

      <section className="score-card">

        <div className="score-card-top">

          <div>

            <span className="section-kicker">
              Overall match
            </span>

            <h2>
              Resume score
            </h2>

          </div>

          <Sparkles size={22} />

        </div>

        <div
          className="score-circle"
          style={{
            "--score": `${score}%`,
          }}
        >

          <div className="score-circle-inner">

            <strong>
              {score}
            </strong>

            <span>
              / 100
            </span>

          </div>

        </div>

        <div className="score-caption">

          <strong>

            {score >= 80
              ? "Strong match"
              : score >= 60
              ? "Good potential"
              : "Needs improvement"}

          </strong>

          <span>
            {analysis?.summary ||
              "AI-generated resume evaluation."}
          </span>

        </div>

      </section>

      {/* CATEGORY SCORES */}

      <section className="panel category-panel">

        <div className="panel-heading">

          <div>

            <span className="section-kicker">
              Detailed breakdown
            </span>

            <h2>
              Category scores
            </h2>

          </div>

        </div>

        <div className="category-list">

          {categories.map(
            ([name, value]) => (

              <ScoreBar
                key={name}
                name={name}
                value={Number(
                  value ?? 0
                )}
              />

            )
          )}

        </div>

      </section>

      {/* STRENGTHS */}

      <section className="panel">

        <PanelTitle
          icon={
            <CheckCircle2 size={18} />
          }
          title="Your strengths"
        />

        <BulletList
          items={analysis?.strengths}
          empty="No strengths were returned."
          positive
        />

      </section>

      {/* MISSING SKILLS */}

      <section className="panel">

        <PanelTitle
          icon={
            <AlertCircle size={18} />
          }
          title="Missing skills"
        />

        <BulletList
          items={
            analysis?.missingSkills
          }
          empty="No major missing skills were identified."
        />

      </section>

      {/* SUGGESTIONS */}

      <section className="panel wide-panel">

        <PanelTitle
          icon={
            <Lightbulb size={18} />
          }
          title="How to improve"
        />

        <BulletList
          items={
            analysis?.suggestions
          }
          empty="No additional suggestions were returned."
        />

      </section>

      {/* FOCUS TOPICS */}

      <section className="panel focus-panel">

        <PanelTitle
          icon={
            <Target size={18} />
          }
          title="Focus topics"
        />

        <div className="tag-list">

          {(analysis?.focusTopics ||
            []).map(
              (topic, index) => (

                <span
                  className="topic-tag"
                  key={`${topic}-${index}`}
                >
                  {topic}
                </span>

              )
            )}

        </div>

      </section>

    </div>
  );
}


// =================================================
// SCORE BAR
// =================================================

function ScoreBar({
  name,
  value,
}) {

  return (

    <div className="score-row">

      <div className="score-row-label">

        <span>
          {name}
        </span>

        <strong>
          {value}
        </strong>

      </div>

      <div className="bar-track">

        <div
          className="bar-fill"
          style={{
            width: `${Math.min(
              value,
              100
            )}%`,
          }}
        />

      </div>

    </div>
  );
}


// =================================================
// PANEL TITLE
// =================================================

function PanelTitle({
  icon,
  title,
}) {

  return (

    <div className="panel-heading compact">

      <div className="panel-title-icon">
        {icon}
      </div>

      <h2>
        {title}
      </h2>

    </div>
  );
}


// =================================================
// BULLET LIST
// =================================================

function BulletList({
  items,
  empty,
  positive = false,
}) {

  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {

    return (
      <p className="empty-text">
        {empty}
      </p>
    );
  }

  return (

    <ul
      className={`bullet-list ${
        positive
          ? "positive"
          : ""
      }`}
    >

      {items.map(
        (item, index) => (

          <li
            key={`${item}-${index}`}
          >

            <ChevronRight size={15} />

            <span>
              {item}
            </span>

          </li>

        )
      )}

    </ul>
  );
}


// =================================================
// CHAT PANEL
// =================================================

function ChatPanel({
  messages,
  question,
  setQuestion,
  sendMessage,
  chatLoading,
  resumeId,
}) {

  const suggestions = [

    "What are the strongest skills in my resume?",

    "Which projects are most relevant to this job?",

    "What should I improve before applying?",

    "What experience is missing for this role?",

  ];

  return (

    <section className="chat-layout">

      {/* SIDEBAR */}

      <aside className="chat-sidebar">

        <div className="chat-side-icon">

          <MessageCircle size={22} />

        </div>

        <h2>
          Resume assistant
        </h2>

        <p>

          Ask questions about the resume
          you just analyzed. Answers are
          generated using relevant chunks
          retrieved from Qdrant.

        </p>

        <div className="resume-id-box">

          <span>
            Resume ID
          </span>

          <code>
            {resumeId}
          </code>

        </div>

        <div className="chat-suggestions">

          <span>
            Try asking
          </span>

          {suggestions.map(
            (item) => (

              <button
                key={item}
                onClick={() =>
                  sendMessage(
                    null,
                    item
                  )
                }
              >

                {item}

                <ArrowRight
                  size={14}
                />

              </button>

            )
          )}

        </div>

      </aside>

      {/* CHAT */}

      <div className="chat-window">

        <div className="chat-header">

          <div className="online-dot" />

          <div>

            <strong>
              Resume RAG Assistant
            </strong>

            <span>
              Context-aware resume chat
            </span>

          </div>

        </div>

        <div className="messages">

          {messages.length === 0 ? (

            <div className="empty-chat">

              <div className="empty-chat-icon">

                <Sparkles size={25} />

              </div>

              <h2>
                Ask anything about your resume
              </h2>

              <p>

                I can explain your skills,
                projects, experience, gaps,
                and areas that need improvement.

              </p>

            </div>

          ) : (

            messages.map(
              (message, index) => (

                <div
                  className={`message-row ${
                    message.role ===
                    "user"
                      ? "user"
                      : "assistant"
                  }`}
                  key={index}
                >

                  <div
                    className={`message ${
                      message.error
                        ? "message-error"
                        : ""
                    }`}
                  >

                    {message.content}

                  </div>

                </div>

              )
            )

          )}

          {chatLoading && (

            <div className="message-row assistant">

              <div className="message typing">

                <span />
                <span />
                <span />

              </div>

            </div>

          )}

        </div>

        <form
          className="chat-input-area"
          onSubmit={sendMessage}
        >

          <input
            value={question}
            onChange={(event) =>
              setQuestion(
                event.target.value
              )
            }
            placeholder="Ask a question about your resume..."
            disabled={chatLoading}
          />

          <button
            className="send-button"
            type="submit"
            disabled={
              !question.trim() ||
              chatLoading
            }
          >

            {chatLoading ? (

              <LoaderCircle
                className="spin"
                size={18}
              />

            ) : (

              <Send size={18} />

            )}

          </button>

        </form>

      </div>

    </section>
  );
}

export default App;

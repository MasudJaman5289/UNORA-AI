import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

function Dashboard() {
  /* =========================================================
     SECTION 1 — BASIC SETUP
  ========================================================= */

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const userName = user?.name || "Learner";

  /* =========================================================
     SECTION 2 — STATE MANAGEMENT
  ========================================================= */

  const [question, setQuestion] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const [aiHistory, setAiHistory] = useState([]);
  const [roomActivity, setRoomActivity] = useState([]);

  const [showRoomModal, setShowRoomModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("Physics");
  const [selectedClass, setSelectedClass] = useState("10th");

  /* =========================================================
     SECTION 3 — DATA FETCHING & PERSISTENCE
  ========================================================= */

  useEffect(() => {
    document.title = "UNORA AI | Dashboard";
  }, []);

  useEffect(() => {
    fetchAIHistory();
    fetchRoomActivity();
    
    const savedQuestion = localStorage.getItem("lastQuestion");
    const savedAnswer = localStorage.getItem("lastAnswer");
    
    if (savedQuestion) {
      setLastQuestion(savedQuestion);
      setQuestion(savedQuestion);
    }
    
    if (savedAnswer) {
      setAnswer(savedAnswer);
    }
  }, []);

  const fetchAIHistory = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/ai/history`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAiHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch AI history");
    }
  };

  const fetchRoomActivity = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/rooms/activity`
      );
      setRoomActivity(res.data);
    } catch (err) {
      console.error("Failed to fetch room activity");
    }
  };

  /* =========================================================
     SECTION 4 — ACTION HANDLERS
  ========================================================= */

  const handleAskAI = async () => {
    if (!question.trim()) return alert("Enter question");

    try {
      setLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/ai/ask`,
        { question },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newQuestion = question.trim();
      setLastQuestion(newQuestion);
      setAnswer(res.data.answer);
      
      localStorage.setItem("lastQuestion", newQuestion);
      localStorage.setItem("lastAnswer", res.data.answer);
      
      setQuestion("");
      fetchAIHistory();

    } catch (err) {
      console.error("AI Error:", err);
      alert("AI failed");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = () => {
    const q = question || lastQuestion;
    if (!q) return alert("Ask AI first");

    const roomName = `${selectedSubject}-${selectedClass}`;

    navigate(
      `/room?room=${encodeURIComponent(roomName)}&q=${encodeURIComponent(q)}`
    );

    setShowRoomModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("lastQuestion");
    localStorage.removeItem("lastAnswer");
    navigate("/");
  };

  /* =========================================================
     SECTION 5 — RENDER UI
  ========================================================= */

  return (
    <div
      className="page-fade"
      style={{
        minHeight: "100vh", 
        padding: "40px 20px 60px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxSizing: "border-box",
        width: "100%",
        overflowX: "hidden", 
      }}
    >
      {/* =====================================================
          SECTION 5A — HEADER
      ===================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
          width: "100%",
          maxWidth: "1200px",
          marginBottom: "50px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "30px", 
          flexWrap: "wrap",
          maxWidth: "100%",
        }}>
          <img 
            src="/logo.png" 
            alt="logo" 
            style={{ 
              height: "clamp(80px, 15vw, 120px)", 
              maxWidth: "100%",
            }} 
          />
          <div style={{ maxWidth: "100%" }}>
            <h1
              style={{
                color: "#AFC4A2",
                margin: 0,
                fontSize: "clamp(28px, 5vw, 44px)",
                letterSpacing: "1px",
                wordBreak: "break-word",
              }}
            >
              UNORA AI
            </h1>
            <p style={{ 
              color: "#b7d0b2", 
              marginTop: "6px",
              fontSize: "clamp(14px, 2vw, 16px)",
            }}>
              Where Understanding Meets Collaboration
            </p>
          </div>
        </div>

        <button onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* =====================================================
          SECTION 5B — WELCOME MESSAGE
      ===================================================== */}

      <div style={{ 
        textAlign: "center", 
        marginBottom: "40px" 
      }}>
        <h2 style={{ 
          color: "#AFC4A2", 
          marginBottom: "8px",
          fontWeight: "600"
        }}>
          Welcome back, {userName}
        </h2>

        <p style={{ 
          opacity: 0.6, 
          fontSize: "14px"
        }}>
          What brings you here today?
        </p>
      </div>

      {/* =====================================================
          SECTION 5C — QUESTION INPUT + BUTTONS
      ===================================================== */}
      
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          marginBottom: "70px",
          textAlign: "center",
          padding: "0 10px",
          boxSizing: "border-box",
          position: "relative",
         zIndex: 10,
        }}
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your academic question..."
          onKeyDown={(e) => e.key === 'Enter' && handleAskAI()} 
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "18px 22px",
            borderRadius: "14px",
            background: "rgba(20, 25, 20, 0.85)",
            color: "white",
            border: "1px solid rgba(175,196,162,0.25)",
            fontSize: "16px",
            backdropFilter: "blur(6px)",
            outline: "none",
            transition: "0.3s ease",
            maxWidth: "100%",
          }}
        />
      
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            marginTop: "28px",
            flexWrap: "wrap", 
          }}
        >

          <button
            onClick={handleAskAI}
            disabled={loading}
            style={{
              minWidth: "150px",
              fontWeight: "600",
              flex: "1 1 auto",
              maxWidth: "200px",
            }}
          >
            {loading ? "Generating..." : "Ask AI"}
          </button>
      

          <div style={{ 
            position: "relative", 
            flex: "1 1 auto", 
            maxWidth: "200px",
          }}>
            <button
              style={{
                background: "#5E7C5A",
                minWidth: "150px",
                fontWeight: "600",
                width: "100%",
              }}
              onClick={() => {
                if (!question && !lastQuestion)
                  return alert("Ask AI first");
                setShowRoomModal(!showRoomModal);
              }}
            >
              Ask Room
            </button>

            {showRoomModal && (
              <div
                className="fade-in"
                style={{
                  position: "absolute",
                  top: "calc(100% + 12px)",
                  left: "50%",                     
                  transform: "translateX(-50%)",   
                  margin: "0",
                  background: "rgba(15,20,15,0.98)",
                  padding: "20px",
                  borderRadius: "16px",
                  width: "240px",
                  maxWidth: "calc(100vw - 40px)",  
                  boxSizing: "border-box",
                  border: "1px solid rgba(175,196,162,0.3)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 25px 60px rgba(0,0,0,0.8)",
                  zIndex: 1000,
                }}
              >
                <label style={{ color: "#AFC4A2", fontWeight: "600", display: "block", marginBottom: "8px" }}>
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    background: "rgba(20,25,20,0.9)",
                    color: "white",
                    border: "1px solid rgba(175,196,162,0.3)",
                    marginBottom: "15px",
                    cursor: "pointer",
                  }}
                >
                  {["Physics", "Chemistry", "Mathematics", "Programming"].map((subj) => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
                </select>

                <label style={{ color: "#AFC4A2", fontWeight: "600", display: "block", marginBottom: "8px" }}>
                  Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    background: "rgba(20,25,20,0.9)",
                    color: "white",
                    border: "1px solid rgba(175,196,162,0.3)",
                    marginBottom: "20px",
                    cursor: "pointer",
                  }}
                >
                  {["9th", "10th", "11th", "12th", "Diploma"].map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>

                <button
                  onClick={handleJoinRoom}
                  style={{
                    width: "100%",
                    background: "#AFC4A2",
                    color: "#0f140f",
                    fontWeight: "600",
                    padding: "14px",
                    fontSize: "15px",
                  }}
                >
                  Join Room
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          SECTION 5D — ANSWER DISPLAY
      ===================================================== */}

      {answer && (
        <div
          className="card fade-in"
          style={{
            position: "relative",
            zIndex: "1",
            margin: "0 auto 70px", 
            maxWidth: "950px",
            width: "100%",
            boxSizing: "border-box",
            padding: "30px",
          }}
        >
          <div style={{ marginBottom: "30px" }}>
            <h3 style={{ color: "#AFC4A2", marginBottom: "15px" }}>Question</h3>
            <div
              style={{
                padding: "15px 20px",
                background: "rgba(175,196,162,0.08)",
                borderRadius: "12px",
                border: "1px solid rgba(175,196,162,0.15)",
                wordBreak: "break-word", 
              }}
            >
              {lastQuestion}
            </div>
          </div>

          <div>
            <h3 style={{ color: "#AFC4A2", marginBottom: "15px" }}>Answer</h3>
            <div 
              style={{ 
                marginTop: "15px",
                wordBreak: "break-word", 
                overflowWrap: "break-word",
              }}
            >
              <ReactMarkdown>{answer}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          SECTION 5E — RECENT HISTORY COLUMNS
      ===================================================== */}

      <div
        style={{
          width: "100%",
          maxWidth: "1100px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
          gap: "40px",
          marginTop: "40px",
          padding: "0 20px", 
          boxSizing: "border-box",
        }}
      >
        {/* =====================================================
            SECTION 5E — AI HISTORY
        ===================================================== */}

        <div
          className="card"
          style={{
            width: "100%", 
            maxWidth: "100%",
            padding: "25px",
            borderRadius: "15px",
            maxHeight: "300px", 
            overflowY: "auto",
            boxSizing: "border-box",
          }}
        >
          <h3 style={{ color: "#AFC4A2", marginBottom: "15px" }}>
            Recent AI Questions
          </h3>

          {aiHistory.length === 0 ? (
            <p style={{ color: "#666", fontStyle: "italic" }}>No questions yet</p>
          ) : (
            aiHistory.slice(0, 5).map((item) => (
              <div
                key={item._id}
                style={{ 
                  marginTop: "10px", 
                  cursor: "pointer",
                  padding: "8px",
                  borderRadius: "6px",
                  transition: "background 0.2s",
                }}
                onClick={() => {
                  setLastQuestion(item.question);
                  setAnswer(item.answer);
                  localStorage.setItem("lastQuestion", item.question);
                  localStorage.setItem("lastAnswer", item.answer);
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(175,196,162,0.1)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                • {item.question.length > 50 ? item.question.substring(0, 50) + "..." : item.question}
              </div>
            ))
          )}
        </div>

        {/* =====================================================
            SECTION 5F — ROOM ACTIVITY
        ===================================================== */}

        <div
          className="card"
          style={{
            width: "100%",
            maxWidth: "100%",
            padding: "25px",
            borderRadius: "15px",
            maxHeight: "300px",
            overflowY: "auto",
            boxSizing: "border-box",
          }}
        >
          <h3 style={{ color: "#AFC4A2" }}>
           🌍 Global Room Activity
          </h3>
          <p style={{ opacity: 0.6, marginTop: "5px" }}>
            Join active discussions and contribute to ongoing topics.
          </p>

          {roomActivity.length === 0 ? (
            <p style={{ color: "#666", fontStyle: "italic" }}>No recent activity</p>
          ) : (
            roomActivity.slice(0, 5).map((room) => (
              <div
                key={room._id}
                style={{ 
                  marginTop: "10px", 
                  cursor: "pointer",
                  padding: "8px",
                  borderRadius: "6px",
                  transition: "background 0.2s",
                }}
                onClick={() => navigate(`/room?room=${room._id}`)}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(175,196,162,0.1)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                • {room._id}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
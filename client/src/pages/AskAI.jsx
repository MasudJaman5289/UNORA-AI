import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AskAI() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [questionInput, setQuestionInput] = useState("");
  const [history, setHistory] = useState([]);
  const [activeRoomSelector, setActiveRoomSelector] = useState(null);
  const [loading, setLoading] = useState(false);

  const allowedSubjects = ["Physics", "Math", "Chemistry", "Programming"];
  const allowedClasses = ["6th", "8th", "10th", "12th", "Degree"];

  const askAI = async () => {
    if (!questionInput.trim()) return;

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/ai/ask",
        { question: questionInput },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const newItem = {
        _id: Date.now(),
        question: questionInput,
        answer: res.data.answer
      };

      setHistory((prev) => [newItem, ...prev]);
      setQuestionInput("");

    } catch (err) {
      console.error("AI request failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEnterRoom = (question, subject, classLevel) => {
    navigate(
      `/room?room=${subject}-${classLevel}&q=${encodeURIComponent(question)}`
    );
  };

  return (
    <div style={{ maxWidth: "900px", margin: "auto", padding: "30px" }}>
      
      {/* Ask AI Input */}
      <div style={{ marginBottom: "30px" }}>
        <input
          type="text"
          value={questionInput}
          onChange={(e) => setQuestionInput(e.target.value)}
          placeholder="Ask something..."
          style={{
            width: "75%",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        />
        <button
          onClick={askAI}
          disabled={loading}
          style={{
            marginLeft: "10px",
            padding: "10px 15px"
          }}
        >
          {loading ? "Thinking..." : "Ask AI"}
        </button>
      </div>

      {/* History */}
      {history.map((item) => (
        <div
          key={item._id}
          style={{
            border: "1px solid #ddd",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "20px",
            background: "#fff"
          }}
        >
          {/* Question + Ask Room */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <h4 style={{ margin: 0 }}>{item.question}</h4>

            <button
              onClick={() =>
                setActiveRoomSelector(
                  activeRoomSelector === item._id ? null : item._id
                )
              }
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                background: "#4f46e5",
                color: "white"
              }}
            >
              Ask Room
            </button>
          </div>

          {/* Answer */}
          <p style={{ marginTop: "15px" }}>{item.answer}</p>

          {/* Room Selector */}
          {activeRoomSelector === item._id && (
            <div
              style={{
                marginTop: "15px",
                padding: "15px",
                border: "1px solid #eee",
                borderRadius: "8px",
                background: "#f9f9f9"
              }}
            >
              <h5>Select Room</h5>

              {allowedSubjects.map((subject) =>
                allowedClasses.map((cls) => (
                  <button
                    key={`${subject}-${cls}`}
                    onClick={() =>
                      handleEnterRoom(item.question, subject, cls)
                    }
                    style={{
                      margin: "5px",
                      padding: "6px 10px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      cursor: "pointer",
                      background: "#fff"
                    }}
                  >
                    {subject} - {cls}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default AskAI;
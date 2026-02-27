import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";

function Room() {

  /* =========================================================
     SECTION 1 — ROUTER + QUERY
  ========================================================= */

  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);

  const roomName = query.get("room");
  const questionFromAI = query.get("q");

  const user = JSON.parse(localStorage.getItem("user"));
  const currentUserName = user?.name || "User";

  useEffect(() => {
    document.title = `UNORA AI | ${roomName}`;
  }, [roomName]);

  /* =========================================================
     SECTION 2 — STATE MANAGEMENT
  ========================================================= */

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [aiLoading, setAiLoading] = useState(false);  
  const [isConnected, setIsConnected] = useState(false); 
  const messageContainerRef = useRef(null);
  const socketRef = useRef(null);
  const questionSentRef = useRef(false);

  /* =========================================================
     SECTION 3 — SOCKET CONNECTION
  ========================================================= */

  useEffect(() => {
    const token = localStorage.getItem("token");

    socketRef.current = io(`${import.meta.env.VITE_API_URL}`, {
      auth: { token },
      transports: ["polling"], 
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      upgrade: false, 
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to server via", socketRef.current.io.engine.transport.name);
      setIsConnected(true); 

      socketRef.current.emit("joinRoom", roomName);
      
      if (questionFromAI && !questionSentRef.current) {
        questionSentRef.current = true;
        
        setTimeout(() => {
          socketRef.current.emit("sendMessage", {
            room: roomName,
            message: questionFromAI,
            userName: currentUserName
          });
          
          navigate(`/room?room=${roomName}`, { replace: true });
        }, 500);
      }
    });

    socketRef.current.on("connect_error", (err) => {
      console.log("Connection error:", err.message);
      setIsConnected(false);
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log("Disconnected:", reason);
      setIsConnected(false);
    });

    socketRef.current.on("previousMessages", (msgs) => {
      setMessages(
        msgs.map(msg => ({
          id: msg._id,
          text: msg.message,
          sender: msg.userName,
          type:
            msg.userName === currentUserName
              ? "self"
              : msg.userName === "AI"
              ? "ai"
              : "other"
        }))
      );
    }); 

    socketRef.current.on("receiveMessage", (newMessage) => {
      setMessages((prev) => {
        if (prev.some(m => m.id === newMessage._id)) return prev;
        return [
          ...prev,
          {
            id: newMessage._id, 
            text: newMessage.message, 
            sender: newMessage.userName, 
            type:
              newMessage.userName === currentUserName 
                ? "self"
                : newMessage.userName === "AI" 
                ? "ai"
                : "other"
          }
        ];
      });
    });

    socketRef.current.on("messageDeleted", (messageId) => {
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== messageId)
      );
    });

    return () => {
      socketRef.current.disconnect();
    };

  }, [roomName, navigate, questionFromAI, currentUserName]);

  /* =========================================================
     SECTION 4 — AUTO SCROLL
  ========================================================= */

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  /* =========================================================
     SECTION 5 — BODY SCROLL LOCK
  ========================================================= */

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";
    
    return () => {
      document.body.style.overflow = "";
      document.body.style.height = "";
    };
  }, []);

  /* =========================================================
     SECTION 6 — SEND MESSAGE
  ========================================================= */

  const sendMessage = () => {
    if (!message.trim()) return;

    socketRef.current.emit("sendMessage", {
      room: roomName,
      message,
      userName: currentUserName
    });

    setMessage("");
  };

  const handleAskAIInRoom = async () => {
    if (!message.trim() || aiLoading) return; 

    setAiLoading(true);  

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/ai/ask`,
        { question: message },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      socketRef.current.emit("sendMessage", {
        room: roomName,
        message: res.data.answer,
        userName: "AI",
      });

      setMessage("");

    } catch (err) {
      console.error("AI error:", err);
    } finally {
      setAiLoading(false); 
    }
  };

  /* =========================================================
     SECTION 7 — DELETE MESSAGE
  ========================================================= */

  const handleDelete = (messageId) => {
    socketRef.current.emit("deleteMessage", {
      id: messageId,
      room: roomName
    });
  };

  /* =========================================================
     SECTION 8 — UI
  ========================================================= */

  return (
    <div
      className="page-fade"
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >

      {/* =====================================================
          8A — HEADER
      ===================================================== */}

      <div
        style={{
          padding: "20px clamp(20px, 5vw, 60px)",
          flexShrink: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <img src="/logo.png" style={{ height: "50px" }} alt="logo" />
          <h2
            style={{
              color: "#AFC4A2",
              margin: 0,
              fontWeight: "600",
              letterSpacing: "1px"
            }}
          >
            {roomName}
          </h2>
        </div>

        <button onClick={() => navigate("/dashboard")}>
          Leave Room
        </button>
      </div>

      {/* =====================================================
          8B — MAIN GLASS CARD
      ===================================================== */}

      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          padding: "0 20px 20px 20px",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <div
          className="card fade-in"
          style={{
            width: "100%",
            maxWidth: "1100px",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            flex: 1,
            overflow: "hidden",
            position: "relative", 
          }}
        >

          {/* =================================================
              8C — MESSAGE AREA (SCROLLABLE)
          ================================================= */}

          <div
            ref={messageContainerRef}
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              padding: "clamp(20px, 4vw, 40px)",
              position: "relative",
              minHeight: 0,
              boxSizing: "border-box",
            }}
          >
            {!isConnected && (
              <div style={{ textAlign: "center", opacity: 0.5, marginBottom: "20px" }}>
                Connecting to room...
              </div>
            )}
            
            {messages.length === 0 ? (
              <div style={{ textAlign: "center", opacity: 0.5 }}>
                No messages yet. Start the discussion.
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    textAlign: msg.type === "self" ? "right" : "left",
                    marginBottom: "20px",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.type !== "self" && (
                    <div
                      style={{
                        fontSize: "12px",
                        opacity: 0.7,
                        marginBottom: "5px",
                        color: "#AFC4A2"
                      }}
                    >
                      {msg.sender}
                    </div>
                  )}

                  <span
                    className="message"
                    style={{
                      display: "inline-block",
                      maxWidth: "min(85%, 600px)",
                      padding: "12px 18px",
                      borderRadius: "16px",
                      fontSize: "14px",
                      lineHeight: "1.6",
                      background:
                        msg.type === "self"
                          ? "#8faf8b"
                          : msg.type === "ai" 
                          ? "rgba(120,180,140,0.15)"
                          : "rgba(175,196,162,0.08)",
                      color:
                        msg.type === "self"
                          ? "#ffffff"
                          : msg.type === "ai"
                          ? "#cde9d5"
                          : "#AFC4A2",
                      border:
                        msg.type === "self"
                          ? "none"
                          : msg.type === "ai"
                          ? "1px solid rgba(120,180,140,0.4)"
                          : "1px solid rgba(175,196,162,0.25)",
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                    }}
                  >
                    {msg.text}

                    {msg.type === "self" && (
                      <span
                        onClick={() => handleDelete(msg.id)}
                        style={{
                          marginLeft: "10px",
                          cursor: "pointer",
                          fontSize: "12px",
                          opacity: 0.5,
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.opacity = "1";
                          e.target.style.transform = "scale(1.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.opacity = "0.5";
                          e.target.style.transform = "scale(1)";
                        }}
                        title="Delete"
                      >
                        🗑️
                      </span>
                    )}
                  </span>
                </div>
              ))
            )}
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "80px", 
              left: 0,
              right: 0,
              height: "40px",
              background: "linear-gradient(to top, rgba(10,15,10,0.95), transparent)",
              pointerEvents: "none",
              zIndex: 10,
            }}
          />

          {/* =================================================
              8D — INPUT AREA
          ================================================= */}

          <div
            style={{
              display: "flex",
              gap: "15px",
              padding: "20px clamp(20px, 4vw, 40px)",
              borderTop: "1px solid rgba(175,196,162,0.15)",
              flexShrink: 0,
              boxSizing: "border-box",
              position: "relative", 
              zIndex: 20,
              background: "inherit", 
            }}
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message..."
              disabled={!isConnected}
              style={{
                flex: 1,
                padding: "16px 20px",
                borderRadius: "14px",
                background: "rgba(20,25,20,0.85)",
                color: "white",
                border: "1px solid rgba(175,196,162,0.2)",
                outline: "none",
                fontSize: "15px",
                minWidth: 0,
                opacity: isConnected ? 1 : 0.5,
              }}
            />

            <button
              onClick={handleAskAIInRoom}
              disabled={aiLoading || !isConnected}
              style={{
                minWidth: "120px",
                background: aiLoading ? "#2a3d28" : "#3e5f3b",
                fontWeight: "600",
                opacity: (aiLoading || !isConnected) ? 0.7 : 1,
                cursor: (aiLoading || !isConnected) ? "not-allowed" : "pointer",
              }}
            >
              {aiLoading ? "Thinking..." : "Ask AI"}
            </button>

            <button
              onClick={sendMessage}
              disabled={!isConnected}
              style={{
                minWidth: "100px",
                fontWeight: "600",
                flexShrink: 0,
                opacity: isConnected ? 1 : 0.5,
                cursor: isConnected ? "pointer" : "not-allowed",
              }}
            >
              Send
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Room;
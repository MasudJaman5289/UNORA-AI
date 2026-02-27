// src/pages/RoomSelect.jsx

import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

function RoomSelect() {
  const location = useLocation();
  const navigate = useNavigate();

  const question = location.state?.question || "";

  const [subject, setSubject] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateRoom = async () => {
    if (!subject || !classLevel) return alert("Select subject & class");

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/rooms/create",
        { subject, classLevel, question },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      navigate(`/room/${res.data.room._id}`, {
        state: { initialQuestion: question }
      });

    } catch (err) {
      console.error(err);
      alert("Room creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Create / Join Room</h2>

      <p><strong>Question:</strong> {question}</p>

      <select onChange={(e) => setSubject(e.target.value)}>
        <option value="">Select Subject</option>
        <option value="Physics">Physics</option>
        <option value="Math">Math</option>
        <option value="Chemistry">Chemistry</option>
      </select>

      <br /><br />

      <select onChange={(e) => setClassLevel(e.target.value)}>
        <option value="">Select Class</option>
        <option value="10">Class 10</option>
        <option value="11">Class 11</option>
        <option value="12">Class 12</option>
      </select>

      <br /><br />

      <button onClick={handleCreateRoom} disabled={loading}>
        {loading ? "Creating..." : "Enter Room"}
      </button>
    </div>
  );
}

export default RoomSelect;
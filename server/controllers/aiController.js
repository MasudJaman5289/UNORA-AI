import axios from "axios";
import Question from "../models/Question.js";
import jwt from "jsonwebtoken";

export const generateAnswer = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const prompt = `
You are an academic AI tutor.

Explain the topic in this structured format:

1️⃣ Concept Explanation  
2️⃣ Key Formula / Theory  
3️⃣ Step-by-step Example  
4️⃣ Common Mistakes  
5️⃣ Practice Question  
6️⃣ Quick Summary  

Topic: ${question}
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3-8b-instruct",
        messages: [
          { role: "system", content: "You are a helpful academic tutor." },
          { role: "user", content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://unora-ai-backend.onrender.com",
          "X-Title": "UNORA-AI"
        },
        timeout: 20000
      }
    );

    const aiAnswer = response.data.choices[0].message.content;

    await Question.create({
      userId: decoded.id,
      question,
      answer: aiAnswer
    });

    res.json({ answer: aiAnswer });

  } catch (error) {
    console.error("AI Error:", error.response?.data || error.message);
    res.status(500).json({
      message: "AI temporarily unavailable. Please try again."
    });
  }
};

export const getUserQuestions = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const questions = await Question.find({ userId: decoded.id })
      .sort({ createdAt: -1 });

    res.json(questions);

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
};
export const validateRoomQuestion = async (req, res) => {
  try {
    const { question, subject, classLevel } = req.body;

    if (!question || !subject || !classLevel) {
      return res.status(400).json({ valid: false });
    }

    const prompt = `
Is this question suitable for ${classLevel} ${subject} syllabus?

Question: ${question}

Reply ONLY with:
VALID
or
INVALID
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3-8b-instruct",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 5,
        temperature: 0
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://unora-ai-backend.onrender.com",
          "X-Title": "UNORA-AI"
        }
      }
    );

    const result =
      response.data.choices[0].message.content.trim().toUpperCase();

    res.json({ valid: result.includes("VALID") });

  } catch (error) {
    console.error("Validation Error:", error.message);
    res.json({ valid: false });
  }
};
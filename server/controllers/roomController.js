import RoomMessage from "../models/RoomMessage.js";

export const getRoomMessages = async (req, res) => {
  try {
    const { room } = req.params;

    const messages = await RoomMessage.find({ room })
      .sort({ createdAt: 1 });

    res.json(messages);

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch room messages" });
  }
};

export const getRecentRoomActivity = async (req, res) => {
  try {
    const recent = await RoomMessage.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$room",
          latestMessage: { $first: "$message" },
          createdAt: { $first: "$createdAt" }
        }
      }
    ]);

    res.json(recent);

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch activity" });
  }
};
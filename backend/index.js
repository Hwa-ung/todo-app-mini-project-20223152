require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB 연결 성공"))
  .catch((err) => console.log("❌ MongoDB 연결 실패:", err));

const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  dueDate: { type: String, default: null },
});
const Todo = mongoose.model("Todo", todoSchema);

app.get("/api/todos", async (req, res) => {
  try {
    const todos = await Todo.find().sort({ _id: -1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/todos", async (req, res) => {
  try {
    const newTodo = new Todo({
      title: req.body.title,
      dueDate: req.body.dueDate || null,
    });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put("/api/todos/:id", async (req, res) => {
  try {
    const updateData = {};
    if (req.body.completed !== undefined)
      updateData.completed = req.body.completed;
    if (req.body.dueDate !== undefined) updateData.dueDate = req.body.dueDate;
    if (req.body.title !== undefined) updateData.title = req.body.title;
    const todo = await Todo.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    if (!todo)
      return res.status(404).json({ message: "할 일을 찾을 수 없습니다" });
    res.json(todo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete("/api/todos/:id", async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo)
      return res.status(404).json({ message: "할 일을 찾을 수 없습니다" });
    res.json({ message: "삭제 완료" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
  });
}

module.exports = app;

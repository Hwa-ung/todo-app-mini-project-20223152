require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB 연결 성공'))
  .catch(err => console.log('❌ MongoDB 연결 실패:', err));

// Todo 스키마 & 모델
const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false }
});
const Todo = mongoose.model('Todo', todoSchema);

// ===== API 엔드포인트 =====

// 전체 목록 조회
app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ _id: -1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 새 Todo 추가
app.post('/api/todos', async (req, res) => {
  try {
    const newTodo = new Todo({ title: req.body.title });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Todo 완료 체크 토글
app.put('/api/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { completed: req.body.completed },
      { new: true }
    );
    if (!todo) return res.status(404).json({ message: '할 일을 찾을 수 없습니다' });
    res.json(todo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Todo 삭제
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) return res.status(404).json({ message: '할 일을 찾을 수 없습니다' });
    res.json({ message: '삭제 완료' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 서버 시작
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});

// Vercel 배포용 export
module.exports = app;

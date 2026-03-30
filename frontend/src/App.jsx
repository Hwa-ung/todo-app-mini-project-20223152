import { useState, useEffect, useRef } from "react";
import axios from "axios";

// 백엔드 API 주소 (로컬 개발용)
const API_BASE = "http://localhost:5000/api/todos";

const api = {
  async getAll() {
    const res = await axios.get(API_BASE);
    return res.data;
  },
  async create(title) {
    const res = await axios.post(API_BASE, { title });
    return res.data;
  },
  async toggle(id, completed) {
    const res = await axios.put(`${API_BASE}/${id}`, { completed });
    return res.data;
  },
  async remove(id) {
    await axios.delete(`${API_BASE}/${id}`);
  },
};

// Icons
const PlusIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <line x1="10" y1="4" x2="10" y2="16" />
    <line x1="4" y1="10" x2="16" y2="10" />
  </svg>
);

const TrashIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 4h12M5.33 4V2.67a1.33 1.33 0 011.34-1.34h2.66a1.33 1.33 0 011.34 1.34V4m2 0v9.33a1.33 1.33 0 01-1.34 1.34H4.67a1.33 1.33 0 01-1.34-1.34V4h9.34z" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="2.5 7.5 5.5 10.5 11.5 3.5" />
  </svg>
);

const fontLink =
  "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    api
      .getAll()
      .then((data) => {
        setTodos(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("서버 연결 실패 — 백엔드가 실행 중인지 확인하세요");
        setLoading(false);
      });
  }, []);

  const addTodo = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    try {
      const newTodo = await api.create(trimmed);
      setTodos((prev) => [newTodo, ...prev]);
      setInput("");
      inputRef.current?.focus();
    } catch (err) {
      setError("추가 실패");
    }
  };

  const toggleTodo = async (id, currentCompleted) => {
    try {
      const updated = await api.toggle(id, !currentCompleted);
      setTodos((prev) => prev.map((t) => (t._id === id ? updated : t)));
    } catch (err) {
      setError("업데이트 실패");
    }
  };

  const removeTodo = async (id) => {
    setRemoving(id);
    setTimeout(async () => {
      try {
        await api.remove(id);
        setTodos((prev) => prev.filter((t) => t._id !== id));
      } catch (err) {
        setError("삭제 실패");
      }
      setRemoving(null);
    }, 300);
  };

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "done") return t.completed;
    return true;
  });

  const counts = {
    all: todos.length,
    active: todos.filter((t) => !t.completed).length,
    done: todos.filter((t) => t.completed).length,
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <>
      <link href={fontLink} rel="stylesheet" />
      <style>{`
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        .todo-root {
          min-height: 100vh;
          background: #0a0a0a;
          color: #f5f5f5;
          font-family: 'IBM Plex Mono', monospace;
          display: flex;
          justify-content: center;
          padding: 40px 20px 80px;
          position: relative;
          overflow: hidden;
        }

        .todo-root::before {
          content: '';
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
        }

        .todo-root::after {
          content: '';
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          z-index: 0;
        }

        .todo-container {
          width: 100%;
          max-width: 560px;
          position: relative;
          z-index: 1;
        }

        .todo-header { margin-bottom: 48px; }

        .todo-date {
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #666;
          margin-bottom: 16px;
        }

        .todo-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 52px;
          line-height: 1;
          letter-spacing: -2px;
          color: #fff;
          margin-bottom: 8px;
        }

        .todo-title span {
          display: inline-block;
          background: #fff;
          color: #0a0a0a;
          padding: 2px 12px;
          margin-left: 6px;
          transform: rotate(-1deg);
        }

        .todo-subtitle {
          font-size: 13px;
          color: #555;
          margin-top: 12px;
        }

        .todo-error {
          background: #2a1010;
          border: 1px solid #5a2020;
          color: #ff6b6b;
          padding: 12px 16px;
          font-size: 13px;
          margin-bottom: 20px;
          cursor: pointer;
        }

        .todo-input-row {
          display: flex;
          gap: 0;
          margin-bottom: 32px;
          border: 1px solid #333;
          overflow: hidden;
          transition: border-color 0.2s;
        }

        .todo-input-row:focus-within { border-color: #fff; }

        .todo-input {
          flex: 1;
          background: transparent;
          border: none;
          color: #f5f5f5;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 14px;
          padding: 16px 20px;
          outline: none;
        }

        .todo-input::placeholder { color: #444; }

        .todo-add-btn {
          background: #fff;
          color: #0a0a0a;
          border: none;
          padding: 0 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s, transform 0.1s;
        }

        .todo-add-btn:hover { background: #e0e0e0; }
        .todo-add-btn:active { transform: scale(0.95); }

        .todo-filters {
          display: flex;
          gap: 4px;
          margin-bottom: 24px;
          border-bottom: 1px solid #1a1a1a;
          padding-bottom: 16px;
        }

        .todo-filter-btn {
          background: transparent;
          border: 1px solid transparent;
          color: #555;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          padding: 8px 16px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .todo-filter-btn:hover { color: #999; }
        .todo-filter-btn.active { color: #fff; border-color: #fff; }

        .todo-filter-count {
          display: inline-block;
          background: #222;
          color: #888;
          font-size: 10px;
          padding: 1px 6px;
          margin-left: 6px;
        }

        .todo-filter-btn.active .todo-filter-count {
          background: #fff;
          color: #0a0a0a;
        }

        .todo-list { list-style: none; }

        .todo-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 0;
          border-bottom: 1px solid #1a1a1a;
          animation: slideIn 0.3s ease-out;
          transition: opacity 0.3s, transform 0.3s;
        }

        .todo-item.removing {
          opacity: 0;
          transform: translateX(40px);
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .todo-checkbox {
          width: 22px;
          height: 22px;
          border: 1.5px solid #444;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s;
          padding: 0;
        }

        .todo-checkbox:hover { border-color: #888; }

        .todo-checkbox.checked {
          background: #fff;
          border-color: #fff;
          color: #0a0a0a;
        }

        .todo-checkbox svg {
          opacity: 0;
          transform: scale(0.5);
          transition: all 0.15s;
        }

        .todo-checkbox.checked svg {
          opacity: 1;
          transform: scale(1);
        }

        .todo-text {
          flex: 1;
          font-size: 14px;
          color: #e0e0e0;
          transition: all 0.3s;
          line-height: 1.4;
        }

        .todo-text.done {
          color: #444;
          text-decoration: line-through;
          text-decoration-color: #333;
        }

        .todo-delete {
          background: transparent;
          border: none;
          color: #333;
          cursor: pointer;
          padding: 6px;
          display: flex;
          align-items: center;
          transition: color 0.2s, transform 0.1s;
          opacity: 0;
        }

        .todo-item:hover .todo-delete { opacity: 1; }
        .todo-delete:hover { color: #ff4444; transform: scale(1.1); }

        .todo-empty {
          text-align: center;
          padding: 60px 0;
          color: #333;
        }

        .todo-empty-icon {
          font-size: 40px;
          margin-bottom: 16px;
          opacity: 0.3;
        }

        .todo-empty-text {
          font-size: 13px;
          letter-spacing: 1px;
        }

        .todo-footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #1a1a1a;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .todo-stat {
          font-size: 11px;
          color: #444;
          letter-spacing: 1px;
        }

        .todo-stat strong {
          color: #888;
          font-weight: 500;
        }

        .todo-progress-bar {
          width: 120px;
          height: 3px;
          background: #1a1a1a;
          overflow: hidden;
        }

        .todo-progress-fill {
          height: 100%;
          background: #fff;
          transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .todo-loading {
          display: flex;
          justify-content: center;
          padding: 60px 0;
        }

        .todo-loading-dot {
          width: 6px;
          height: 6px;
          background: #fff;
          margin: 0 4px;
          animation: blink 1.4s infinite both;
        }

        .todo-loading-dot:nth-child(2) { animation-delay: 0.2s; }
        .todo-loading-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes blink {
          0%, 80%, 100% { opacity: 0.1; }
          40% { opacity: 1; }
        }

        .corner-accent {
          position: fixed;
          width: 120px;
          height: 120px;
          border: 1px solid #1a1a1a;
          pointer-events: none;
          z-index: 0;
        }
        .corner-accent.tl { top: 20px; left: 20px; border-right: none; border-bottom: none; }
        .corner-accent.br { bottom: 20px; right: 20px; border-left: none; border-top: none; }

        @media (max-width: 600px) {
          .todo-title { font-size: 36px; letter-spacing: -1px; }
          .todo-root { padding: 24px 16px 60px; }
          .todo-delete { opacity: 1; }
        }
      `}</style>

      <div className="todo-root">
        <div className="corner-accent tl" />
        <div className="corner-accent br" />

        <div className="todo-container">
          <header className="todo-header">
            <p className="todo-date">{dateStr}</p>
            <h1 className="todo-title">
              TO<span>DO</span>
            </h1>
            <p className="todo-subtitle">
              {counts.done}/{counts.all} tasks completed
            </p>
          </header>

          {error && (
            <div className="todo-error" onClick={() => setError(null)}>
              {error} (클릭하여 닫기)
            </div>
          )}

          <div className="todo-input-row">
            <input
              ref={inputRef}
              className="todo-input"
              type="text"
              placeholder="새로운 할 일을 입력하세요..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodo()}
            />
            <button className="todo-add-btn" onClick={addTodo}>
              <PlusIcon />
            </button>
          </div>

          <div className="todo-filters">
            {["all", "active", "done"].map((f) => (
              <button
                key={f}
                className={`todo-filter-btn ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "전체" : f === "active" ? "진행중" : "완료"}
                <span className="todo-filter-count">{counts[f]}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="todo-loading">
              <div className="todo-loading-dot" />
              <div className="todo-loading-dot" />
              <div className="todo-loading-dot" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="todo-empty">
              <div className="todo-empty-icon">□</div>
              <p className="todo-empty-text">
                {filter === "all"
                  ? "할 일을 추가해보세요"
                  : filter === "active"
                    ? "모든 할 일을 완료했습니다"
                    : "아직 완료한 항목이 없습니다"}
              </p>
            </div>
          ) : (
            <ul className="todo-list">
              {filtered.map((todo, i) => (
                <li
                  key={todo._id}
                  className={`todo-item ${removing === todo._id ? "removing" : ""}`}
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <button
                    className={`todo-checkbox ${todo.completed ? "checked" : ""}`}
                    onClick={() => toggleTodo(todo._id, todo.completed)}
                  >
                    <CheckIcon />
                  </button>
                  <span className={`todo-text ${todo.completed ? "done" : ""}`}>
                    {todo.title}
                  </span>
                  <button
                    className="todo-delete"
                    onClick={() => removeTodo(todo._id)}
                  >
                    <TrashIcon />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {todos.length > 0 && (
            <div className="todo-footer">
              <span className="todo-stat">
                <strong>{counts.active}</strong> remaining
              </span>
              <div className="todo-progress-bar">
                <div
                  className="todo-progress-fill"
                  style={{
                    width: `${todos.length ? (counts.done / todos.length) * 100 : 0}%`,
                  }}
                />
              </div>
              <span className="todo-stat">
                <strong>
                  {Math.round(
                    todos.length ? (counts.done / todos.length) * 100 : 0,
                  )}
                  %
                </strong>{" "}
                done
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

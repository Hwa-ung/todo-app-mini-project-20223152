import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API_BASE = "https://to-do-list-beta-ruby-82.vercel.app/api/todos";

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

const PlusIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <line x1="9" y1="3" x2="9" y2="15" />
    <line x1="3" y1="9" x2="15" y2="9" />
  </svg>
);

const TrashIcon = () => (
  <svg
    width="15"
    height="15"
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
    width="12"
    height="12"
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
  "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
    api
      .getAll()
      .then((data) => {
        setTodos(data);
        setLoading(false);
      })
      .catch((_err) => {
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
    } catch (_err) {
      setError("추가 실패");
    }
  };

  const toggleTodo = async (id, currentCompleted) => {
    try {
      const updated = await api.toggle(id, !currentCompleted);
      setTodos((prev) => prev.map((t) => (t._id === id ? updated : t)));
    } catch (_err) {
      setError("업데이트 실패");
    }
  };

  const removeTodo = async (id) => {
    setRemoving(id);
    setTimeout(async () => {
      try {
        await api.remove(id);
        setTodos((prev) => prev.filter((t) => t._id !== id));
      } catch (_err) {
        setError("삭제 실패");
      }
      setRemoving(null);
    }, 400);
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

  const progressPercent = todos.length
    ? Math.round((counts.done / todos.length) * 100)
    : 0;

  return (
    <>
      <link href={fontLink} rel="stylesheet" />
      <style>{`
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        .todo-root {
          min-height: 100vh;
          background: #050505;
          color: #f0f0f0;
          font-family: 'Outfit', sans-serif;
          display: flex;
          justify-content: center;
          padding: 48px 24px 100px;
          position: relative;
          overflow: hidden;
        }

        .todo-root::before {
          content: '';
          position: fixed;
          top: -50%; left: -50%;
          width: 200%; height: 200%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
          animation: grainShift 8s steps(10) infinite;
        }

        @keyframes grainShift {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-2%, -3%); }
          20% { transform: translate(3%, 1%); }
          30% { transform: translate(-1%, 4%); }
          40% { transform: translate(4%, -2%); }
          50% { transform: translate(-3%, 3%); }
          60% { transform: translate(2%, -4%); }
          70% { transform: translate(-4%, 1%); }
          80% { transform: translate(1%, -1%); }
          90% { transform: translate(3%, 2%); }
        }

        .todo-root::after {
          content: '';
          position: fixed;
          top: -20%; left: 50%;
          transform: translateX(-50%);
          width: 800px; height: 600px;
          background: radial-gradient(ellipse, rgba(255,255,255,0.015) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .todo-container {
          width: 100%;
          max-width: 520px;
          position: relative;
          z-index: 1;
        }

        .todo-header {
          margin-bottom: 52px;
          opacity: 0;
          transform: translateY(20px);
          animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
        }

        @keyframes fadeUp {
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          to { opacity: 1; }
        }

        .todo-date {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #4a4a4a;
          margin-bottom: 20px;
        }

        .todo-title-wrap {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .todo-title {
          font-weight: 900;
          font-size: 64px;
          line-height: 0.9;
          letter-spacing: -3px;
          color: #fff;
        }

        .todo-title-accent {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          color: #050505;
          font-weight: 900;
          font-size: 64px;
          letter-spacing: -3px;
          padding: 0 14px;
          line-height: 1.1;
          transform: rotate(-1.5deg);
          margin-left: 4px;
          position: relative;
        }

        .todo-title-accent::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 2px;
          right: -2px;
          height: 100%;
          background: rgba(255,255,255,0.06);
          transform: rotate(-1.5deg);
          z-index: -1;
        }

        .todo-stats-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 20px;
        }

        .todo-stat-pill {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 500;
          color: #666;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          padding: 6px 14px;
          letter-spacing: 0.5px;
        }

        .todo-stat-pill strong {
          color: #999;
          font-weight: 600;
        }

        .progress-ring-wrap {
          width: 40px;
          height: 40px;
          position: relative;
        }

        .progress-ring {
          transform: rotate(-90deg);
          width: 40px;
          height: 40px;
        }

        .progress-ring-bg {
          fill: none;
          stroke: rgba(255,255,255,0.06);
          stroke-width: 3;
        }

        .progress-ring-fill {
          fill: none;
          stroke: #fff;
          stroke-width: 3;
          stroke-linecap: round;
          stroke-dasharray: 100.53;
          stroke-dashoffset: 100.53;
          transition: stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .progress-ring-text {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          font-weight: 600;
          color: #888;
        }

        .todo-error {
          background: rgba(255, 60, 60, 0.06);
          border: 1px solid rgba(255, 60, 60, 0.15);
          color: #ff6b6b;
          padding: 12px 16px;
          font-size: 13px;
          margin-bottom: 20px;
          cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
          transition: opacity 0.3s;
        }

        .todo-error:hover { opacity: 0.8; }

        .todo-input-wrap {
          margin-bottom: 36px;
          opacity: 0;
          transform: translateY(16px);
          animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards;
        }

        .todo-input-row {
          display: flex;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.02);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }

        .todo-input-row:focus-within {
          border-color: rgba(255,255,255,0.25);
          background: rgba(255,255,255,0.04);
          box-shadow: 0 0 0 4px rgba(255,255,255,0.02);
        }

        .todo-input {
          flex: 1;
          background: transparent;
          border: none;
          color: #f0f0f0;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 400;
          padding: 18px 20px;
          outline: none;
          letter-spacing: 0.2px;
        }

        .todo-input::placeholder {
          color: #363636;
          font-weight: 300;
        }

        .todo-add-btn {
          background: #fff;
          color: #050505;
          border: none;
          padding: 0 22px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .todo-add-btn:hover { background: #e8e8e8; }
        .todo-add-btn:active { transform: scale(0.92); }

        .todo-input-hint {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: #2a2a2a;
          margin-top: 8px;
          letter-spacing: 0.5px;
        }

        .todo-input-hint kbd {
          display: inline-block;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 1px 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          color: #555;
          margin: 0 2px;
        }

        .todo-filters {
          display: flex;
          gap: 6px;
          margin-bottom: 28px;
          opacity: 0;
          animation: fadeIn 0.5s 0.6s forwards;
        }

        .todo-filter-btn {
          background: transparent;
          border: 1px solid transparent;
          color: #444;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          padding: 8px 14px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }

        .todo-filter-btn::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 50%;
          width: 0;
          height: 1px;
          background: #fff;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          transform: translateX(-50%);
        }

        .todo-filter-btn:hover { color: #888; }

        .todo-filter-btn.active { color: #fff; }

        .todo-filter-btn.active::after { width: 100%; }

        .todo-filter-count {
          display: inline-block;
          font-size: 9px;
          padding: 2px 6px;
          margin-left: 5px;
          background: rgba(255,255,255,0.04);
          color: #555;
          transition: all 0.25s;
        }

        .todo-filter-btn.active .todo-filter-count {
          background: #fff;
          color: #050505;
        }

        .todo-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.06) 80%, transparent);
          margin-bottom: 8px;
        }

        .todo-list { list-style: none; }

        .todo-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 18px;
          margin-bottom: 4px;
          background: rgba(255,255,255,0.015);
          border: 1px solid rgba(255,255,255,0.03);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          opacity: 0;
          transform: translateY(12px) scale(0.98);
          animation: itemIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .todo-item:hover {
          background: rgba(255,255,255,0.03);
          border-color: rgba(255,255,255,0.06);
        }

        .todo-item.removing {
          opacity: 0;
          transform: translateX(60px) scale(0.95);
          transition: all 0.4s cubic-bezier(0.55, 0, 1, 0.45);
        }

        @keyframes itemIn {
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .todo-checkbox {
          width: 20px;
          height: 20px;
          border: 1.5px solid #333;
          border-radius: 50%;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          padding: 0;
        }

        .todo-checkbox:hover {
          border-color: #666;
          transform: scale(1.1);
        }

        .todo-checkbox.checked {
          background: #fff;
          border-color: #fff;
          color: #050505;
          transform: scale(1);
        }

        .todo-checkbox.checked:hover {
          transform: scale(1.1);
          box-shadow: 0 0 12px rgba(255,255,255,0.15);
        }

        .todo-checkbox svg {
          opacity: 0;
          transform: scale(0) rotate(-45deg);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .todo-checkbox.checked svg {
          opacity: 1;
          transform: scale(1) rotate(0deg);
        }

        .todo-text {
          flex: 1;
          font-size: 14px;
          font-weight: 400;
          color: #d0d0d0;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          line-height: 1.5;
          letter-spacing: 0.1px;
        }

        .todo-text.done {
          color: #333;
          text-decoration: line-through;
          text-decoration-color: #2a2a2a;
          text-decoration-thickness: 1px;
        }

        .todo-delete {
          background: transparent;
          border: none;
          color: #222;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          opacity: 0;
          transform: scale(0.8);
        }

        .todo-item:hover .todo-delete {
          opacity: 1;
          transform: scale(1);
        }

        .todo-delete:hover {
          color: #ff4444;
          background: rgba(255, 68, 68, 0.08);
          transform: scale(1.15);
        }

        .todo-empty {
          text-align: center;
          padding: 72px 0;
          color: #252525;
        }

        .todo-empty-box {
          width: 48px;
          height: 48px;
          border: 1.5px solid #1a1a1a;
          margin: 0 auto 20px;
          animation: emptyFloat 3s ease-in-out infinite;
        }

        @keyframes emptyFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .todo-empty-text {
          font-size: 13px;
          font-weight: 300;
          letter-spacing: 0.5px;
          color: #333;
        }

        .todo-footer {
          margin-top: 40px;
          padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.04);
          display: flex;
          justify-content: space-between;
          align-items: center;
          opacity: 0;
          animation: fadeIn 0.5s 0.8s forwards;
        }

        .todo-footer-stat {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: #333;
          letter-spacing: 1px;
        }

        .todo-footer-stat strong {
          color: #666;
          font-weight: 600;
        }

        .progress-bar-wrap {
          flex: 1;
          max-width: 180px;
          margin: 0 20px;
        }

        .progress-bar {
          height: 2px;
          background: rgba(255,255,255,0.04);
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: #fff;
          transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }

        .progress-bar-fill::after {
          content: '';
          position: absolute;
          right: 0;
          top: -2px;
          width: 6px;
          height: 6px;
          background: #fff;
          border-radius: 50%;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .progress-bar-fill.active::after { opacity: 1; }

        .todo-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          padding: 72px 0;
        }

        .todo-loading-bar {
          width: 3px;
          height: 20px;
          background: #fff;
          animation: loadPulse 1.2s ease-in-out infinite;
        }

        .todo-loading-bar:nth-child(1) { animation-delay: 0s; }
        .todo-loading-bar:nth-child(2) { animation-delay: 0.1s; }
        .todo-loading-bar:nth-child(3) { animation-delay: 0.2s; }
        .todo-loading-bar:nth-child(4) { animation-delay: 0.3s; }

        @keyframes loadPulse {
          0%, 100% { transform: scaleY(0.4); opacity: 0.3; }
          50% { transform: scaleY(1); opacity: 1; }
        }

        .corner {
          position: fixed;
          pointer-events: none;
          z-index: 0;
        }

        .corner-tl {
          top: 24px; left: 24px;
          width: 80px; height: 80px;
          border-top: 1px solid rgba(255,255,255,0.04);
          border-left: 1px solid rgba(255,255,255,0.04);
        }

        .corner-br {
          bottom: 24px; right: 24px;
          width: 80px; height: 80px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          border-right: 1px solid rgba(255,255,255,0.04);
        }

        .corner-dot {
          position: fixed;
          width: 3px; height: 3px;
          background: rgba(255,255,255,0.08);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }

        @media (max-width: 600px) {
          .todo-title, .todo-title-accent { font-size: 44px; letter-spacing: -2px; }
          .todo-root { padding: 28px 16px 60px; }
          .todo-delete { opacity: 1; transform: scale(1); }
          .todo-item { padding: 14px 14px; }
        }
      `}</style>

      <div className={`todo-root ${mounted ? "mounted" : ""}`}>
        <div className="corner corner-tl" />
        <div className="corner corner-br" />
        <div className="corner-dot" style={{ top: 24, left: 24 }} />
        <div className="corner-dot" style={{ bottom: 24, right: 24 }} />

        <div className="todo-container">
          <header className="todo-header">
            <p className="todo-date">{dateStr}</p>
            <div className="todo-title-wrap">
              <h1 className="todo-title">TO</h1>
              <span className="todo-title-accent">DO</span>
            </div>
            <div className="todo-stats-row">
              <div className="progress-ring-wrap">
                <svg className="progress-ring" viewBox="0 0 40 40">
                  <circle className="progress-ring-bg" cx="20" cy="20" r="16" />
                  <circle
                    className="progress-ring-fill"
                    cx="20"
                    cy="20"
                    r="16"
                    style={{
                      strokeDashoffset:
                        100.53 - (100.53 * progressPercent) / 100,
                    }}
                  />
                </svg>
                <span className="progress-ring-text">{progressPercent}%</span>
              </div>
              <div className="todo-stat-pill">
                <strong>{counts.done}</strong> / {counts.all} completed
              </div>
            </div>
          </header>

          {error && (
            <div className="todo-error" onClick={() => setError(null)}>
              {error}
            </div>
          )}

          <div className="todo-input-wrap">
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
            <p className="todo-input-hint">
              <kbd>Enter</kbd> 눌러서 추가
            </p>
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

          <div className="todo-divider" />

          {loading ? (
            <div className="todo-loading">
              <div className="todo-loading-bar" />
              <div className="todo-loading-bar" />
              <div className="todo-loading-bar" />
              <div className="todo-loading-bar" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="todo-empty">
              <div className="todo-empty-box" />
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
                  style={{ animationDelay: `${i * 0.06}s` }}
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
              <span className="todo-footer-stat">
                <strong>{counts.active}</strong> remaining
              </span>
              <div className="progress-bar-wrap">
                <div className="progress-bar">
                  <div
                    className={`progress-bar-fill ${progressPercent > 0 && progressPercent < 100 ? "active" : ""}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              <span className="todo-footer-stat">
                <strong>{progressPercent}%</strong> done
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API_BASE = "https://to-do-list-beta-ruby-82.vercel.app/api/todos";

const api = {
  async getAll() {
    const res = await axios.get(API_BASE);
    return res.data;
  },
  async create(title, dueDate) {
    const res = await axios.post(API_BASE, { title, dueDate: dueDate || null });
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
    width="14"
    height="14"
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

const CalendarIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="3" width="12" height="11" rx="2" />
    <line x1="2" y1="7" x2="14" y2="7" />
    <line x1="5" y1="1" x2="5" y2="4" />
    <line x1="11" y1="1" x2="11" y2="4" />
  </svg>
);

const fontLink =
  "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap";

function formatDueDate(dateStr) {
  if (!dateStr) return null;
  const due = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

  let label = due.toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  });
  let status = "normal";

  if (diff < 0) {
    label = `${label} (지남)`;
    status = "overdue";
  } else if (diff === 0) {
    label = "오늘 마감";
    status = "today";
  } else if (diff === 1) {
    label = "내일 마감";
    status = "soon";
  } else if (diff <= 3) {
    label = `${label} (D-${diff})`;
    status = "soon";
  }

  return { label, status };
}

export default function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [dueDate, setDueDate] = useState("");
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
      .catch((_err) => {
        setError("서버 연결 실패 — 백엔드가 실행 중인지 확인하세요");
        setLoading(false);
      });
  }, []);

  const addTodo = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    try {
      const newTodo = await api.create(trimmed, dueDate);
      setTodos((prev) => [newTodo, ...prev]);
      setInput("");
      setDueDate("");
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
    }, 350);
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
          background: #0a0a0a;
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
          30% { transform: translate(-1%, 4%); }
          50% { transform: translate(-3%, 3%); }
          70% { transform: translate(-4%, 1%); }
          90% { transform: translate(3%, 2%); }
        }

        .todo-container {
          width: 100%;
          max-width: 540px;
          position: relative;
          z-index: 1;
        }

        /* ── Header ── */
        .todo-header {
          margin-bottom: 40px;
          opacity: 0;
          transform: translateY(20px);
          animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards;
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
          margin-bottom: 16px;
        }

        .todo-title-wrap {
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-bottom: 16px;
        }

        .todo-title {
          font-weight: 900;
          font-size: 56px;
          line-height: 0.9;
          letter-spacing: -3px;
          color: #fff;
        }

        .todo-title-accent {
          display: inline-flex;
          background: #fff;
          color: #050505;
          font-weight: 900;
          font-size: 56px;
          letter-spacing: -3px;
          padding: 0 12px;
          line-height: 1.1;
          transform: rotate(-1.5deg);
          margin-left: 4px;
        }

        .todo-stats-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .progress-ring-wrap {
          width: 38px;
          height: 38px;
          position: relative;
        }

        .progress-ring {
          transform: rotate(-90deg);
          width: 38px;
          height: 38px;
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
          stroke-dasharray: 94.25;
          stroke-dashoffset: 94.25;
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

        .todo-stat-pill {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 500;
          color: #666;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          padding: 5px 12px;
        }

        .todo-stat-pill strong {
          color: #999;
        }

        /* ── White card panel ── */
        .todo-panel {
          background: #fff;
          color: #111;
          padding: 28px 24px 24px;
          border-radius: 16px;
          opacity: 0;
          transform: translateY(16px);
          animation: fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
        }

        /* ── Input ── */
        .todo-input-row {
          display: flex;
          border: 1.5px solid #e0e0e0;
          border-radius: 10px;
          overflow: hidden;
          transition: all 0.25s;
          background: #fafafa;
        }

        .todo-input-row:focus-within {
          border-color: #111;
          box-shadow: 0 0 0 3px rgba(0,0,0,0.04);
          background: #fff;
        }

        .todo-input {
          flex: 1;
          background: transparent;
          border: none;
          color: #111;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 400;
          padding: 14px 16px;
          outline: none;
        }

        .todo-input::placeholder {
          color: #bbb;
          font-weight: 300;
        }

        .todo-add-btn {
          background: #111;
          color: #fff;
          border: none;
          padding: 0 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: all 0.15s;
          border-radius: 0 8px 8px 0;
        }

        .todo-add-btn:hover { background: #333; }
        .todo-add-btn:active { transform: scale(0.95); }

        /* ── Date picker row ── */
        .todo-options-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 10px;
        }

        .todo-date-input {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #f5f5f5;
          border: 1px solid #e8e8e8;
          border-radius: 6px;
          padding: 6px 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .todo-date-input:hover {
          border-color: #ccc;
          background: #f0f0f0;
        }

        .todo-date-input input {
          background: transparent;
          border: none;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #555;
          outline: none;
          width: 110px;
          cursor: pointer;
        }

        .todo-date-input input::-webkit-calendar-picker-indicator {
          opacity: 0;
          position: absolute;
        }

        .todo-date-input svg {
          color: #888;
          flex-shrink: 0;
        }

        .todo-input-hint {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: #ccc;
          letter-spacing: 0.5px;
          margin-left: auto;
        }

        .todo-input-hint kbd {
          background: #f0f0f0;
          border: 1px solid #e0e0e0;
          padding: 1px 5px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          color: #888;
          border-radius: 3px;
        }

        /* ── Filters ── */
        .todo-filters {
          display: flex;
          gap: 4px;
          margin: 20px 0 16px;
        }

        .todo-filter-btn {
          background: transparent;
          border: none;
          color: #aaa;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          padding: 6px 12px;
          cursor: pointer;
          transition: all 0.2s;
          border-radius: 6px;
        }

        .todo-filter-btn:hover { color: #666; background: #f5f5f5; }

        .todo-filter-btn.active {
          color: #111;
          background: #f0f0f0;
        }

        .todo-filter-count {
          font-size: 9px;
          padding: 1px 5px;
          margin-left: 4px;
          background: #e8e8e8;
          color: #888;
          border-radius: 3px;
          transition: all 0.2s;
        }

        .todo-filter-btn.active .todo-filter-count {
          background: #111;
          color: #fff;
        }

        /* ── Divider ── */
        .todo-divider {
          height: 1px;
          background: #f0f0f0;
          margin-bottom: 4px;
        }

        /* ── List ── */
        .todo-list { list-style: none; }

        .todo-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 12px;
          margin-bottom: 2px;
          border-radius: 10px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          opacity: 0;
          transform: translateY(10px);
          animation: itemIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .todo-item:hover { background: #f8f8f8; }

        .todo-item.removing {
          opacity: 0;
          transform: translateX(50px) scale(0.95);
          transition: all 0.35s cubic-bezier(0.55, 0, 1, 0.45);
        }

        @keyframes itemIn {
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── Checkbox ── */
        .todo-checkbox {
          width: 20px;
          height: 20px;
          border: 2px solid #d0d0d0;
          border-radius: 50%;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          padding: 0;
          margin-top: 2px;
        }

        .todo-checkbox:hover {
          border-color: #999;
          transform: scale(1.1);
        }

        .todo-checkbox.checked {
          background: #111;
          border-color: #111;
          color: #fff;
        }

        .todo-checkbox.checked:hover {
          transform: scale(1.1);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
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

        /* ── Todo content ── */
        .todo-content {
          flex: 1;
          min-width: 0;
        }

        .todo-text {
          font-size: 14px;
          font-weight: 400;
          color: #222;
          line-height: 1.5;
          transition: all 0.3s;
        }

        .todo-text.done {
          color: #bbb;
          text-decoration: line-through;
          text-decoration-color: #ddd;
        }

        .todo-due {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 500;
          margin-top: 4px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: 4px;
          letter-spacing: 0.3px;
        }

        .todo-due.normal { background: #f0f0f0; color: #888; }
        .todo-due.soon { background: #fff3e0; color: #e65100; }
        .todo-due.today { background: #fff3e0; color: #e65100; font-weight: 600; }
        .todo-due.overdue { background: #fce4ec; color: #c62828; }
        .todo-due.done-date { background: #f5f5f5; color: #ccc; text-decoration: line-through; }

        /* ── Delete — always visible ── */
        .todo-delete {
          background: transparent;
          border: none;
          color: #ccc;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          transition: all 0.2s;
          margin-top: 1px;
          flex-shrink: 0;
        }

        .todo-delete:hover {
          color: #e53935;
          background: #fce4ec;
        }

        /* ── Empty ── */
        .todo-empty {
          text-align: center;
          padding: 56px 0;
        }

        .todo-empty-box {
          width: 44px;
          height: 44px;
          border: 1.5px solid #e0e0e0;
          border-radius: 10px;
          margin: 0 auto 16px;
          animation: emptyFloat 3s ease-in-out infinite;
        }

        @keyframes emptyFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .todo-empty-text {
          font-size: 13px;
          font-weight: 300;
          color: #bbb;
        }

        /* ── Footer ── */
        .todo-panel-footer {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #f0f0f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .footer-stat {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: #bbb;
          letter-spacing: 0.5px;
        }

        .footer-stat strong { color: #888; }

        .progress-bar-wrap {
          flex: 1;
          max-width: 160px;
          margin: 0 16px;
        }

        .progress-bar {
          height: 3px;
          background: #f0f0f0;
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: #111;
          border-radius: 2px;
          transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* ── Loading ── */
        .todo-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 5px;
          padding: 64px 0;
        }

        .todo-loading-bar {
          width: 3px;
          height: 18px;
          background: #ddd;
          border-radius: 2px;
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

        /* ── Corner accents ── */
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

        /* ── Responsive ── */
        @media (max-width: 600px) {
          .todo-title, .todo-title-accent { font-size: 40px; letter-spacing: -2px; }
          .todo-root { padding: 28px 16px 60px; }
          .todo-panel { padding: 20px 16px 16px; }
          .todo-item { padding: 12px 8px; }
        }
      `}</style>

      <div className="todo-root">
        <div className="corner corner-tl" />
        <div className="corner corner-br" />

        <div className="todo-container">
          {/* Header — dark area */}
          <header className="todo-header">
            <p className="todo-date">{dateStr}</p>
            <div className="todo-title-wrap">
              <h1 className="todo-title">TO</h1>
              <span className="todo-title-accent">DO</span>
            </div>
            <div className="todo-stats-row">
              <div className="progress-ring-wrap">
                <svg className="progress-ring" viewBox="0 0 38 38">
                  <circle className="progress-ring-bg" cx="19" cy="19" r="15" />
                  <circle
                    className="progress-ring-fill"
                    cx="19"
                    cy="19"
                    r="15"
                    style={{
                      strokeDashoffset: 94.25 - (94.25 * progressPercent) / 100,
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
            <div
              style={{
                background: "rgba(255,60,60,0.08)",
                border: "1px solid rgba(255,60,60,0.15)",
                color: "#ff6b6b",
                padding: "10px 14px",
                fontSize: 13,
                marginBottom: 16,
                cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace",
              }}
              onClick={() => setError(null)}
            >
              {error}
            </div>
          )}

          {/* White card panel */}
          <div className="todo-panel">
            {/* Input */}
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

            <div className="todo-options-row">
              <div className="todo-date-input">
                <CalendarIcon />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  placeholder="마감일"
                />
              </div>
              <span className="todo-input-hint">
                <kbd>Enter</kbd> 추가
              </span>
            </div>

            {/* Filters */}
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

            {/* List */}
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
                {filtered.map((todo, i) => {
                  const due = formatDueDate(todo.dueDate);
                  return (
                    <li
                      key={todo._id}
                      className={`todo-item ${removing === todo._id ? "removing" : ""}`}
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <button
                        className={`todo-checkbox ${todo.completed ? "checked" : ""}`}
                        onClick={() => toggleTodo(todo._id, todo.completed)}
                      >
                        <CheckIcon />
                      </button>
                      <div className="todo-content">
                        <span
                          className={`todo-text ${todo.completed ? "done" : ""}`}
                        >
                          {todo.title}
                        </span>
                        {due && (
                          <div
                            className={`todo-due ${todo.completed ? "done-date" : due.status}`}
                          >
                            <CalendarIcon />
                            {due.label}
                          </div>
                        )}
                      </div>
                      <button
                        className="todo-delete"
                        onClick={() => removeTodo(todo._id)}
                      >
                        <TrashIcon />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Footer */}
            {todos.length > 0 && (
              <div className="todo-panel-footer">
                <span className="footer-stat">
                  <strong>{counts.active}</strong> remaining
                </span>
                <div className="progress-bar-wrap">
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
                <span className="footer-stat">
                  <strong>{progressPercent}%</strong> done
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

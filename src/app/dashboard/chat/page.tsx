"use client";

import { useChat } from "ai/react";
import { useState, useEffect, useRef, useCallback } from "react";
import {
    Bot,
    Send,
    User,
    Sparkles,
    Plus,
    MessageSquare,
    Trash2,
    Clock,
    PanelLeftOpen,
    PanelLeftClose,
    TrendingUp,
    Package,
    BarChart3,
    Lightbulb,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatSession {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    _count: { messages: number };
}

const PROMPT_CATEGORIES = [
    {
        icon: TrendingUp,
        label: "Penjualan",
        color: "#34d399",
        prompt: "Berapa total revenue minggu ini dan bagaimana trennya?",
    },
    {
        icon: Package,
        label: "Produk",
        color: "#6366f1",
        prompt: "Produk apa yang paling laris dan mana yang stoknya hampir habis?",
    },
    {
        icon: BarChart3,
        label: "Analisis",
        color: "#fbbf24",
        prompt: "Analisis tren penjualan saya dan berikan insight utamanya",
    },
    {
        icon: Lightbulb,
        label: "Strategi",
        color: "#f87171",
        prompt: "Kasih rekomendasi strategi untuk meningkatkan penjualan",
    },
];

export default function ChatPage() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [loadingSessions, setLoadingSessions] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        isLoading,
        append,
        setMessages,
    } = useChat({
        api: "/api/chat",
        body: { sessionId: activeSessionId },
        onResponse(response) {
            // Capture the session ID from the response header
            const newSessionId = response.headers.get("X-Session-Id");
            if (newSessionId && !activeSessionId) {
                setActiveSessionId(newSessionId);
                loadSessions(); // Refresh sidebar
            }
        },
        onFinish() {
            loadSessions(); // Refresh sidebar to update title/count
        },
    });

    // Load sessions on mount
    const loadSessions = useCallback(async () => {
        try {
            const res = await fetch("/api/chat/history");
            const data = await res.json();
            setSessions(data.sessions || []);
        } catch (err) {
            console.error("Failed to load sessions:", err);
        } finally {
            setLoadingSessions(false);
        }
    }, []);

    useEffect(() => {
        loadSessions();
    }, [loadSessions]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Load a session's messages
    const loadSession = async (sessionId: string) => {
        setActiveSessionId(sessionId);
        try {
            const res = await fetch(`/api/chat/history/${sessionId}`);
            const data = await res.json();
            if (data.session?.messages) {
                setMessages(
                    data.session.messages.map(
                        (m: { id: string; role: string; content: string }) => ({
                            id: m.id,
                            role: m.role as "user" | "assistant",
                            content: m.content,
                        })
                    )
                );
            }
        } catch (err) {
            console.error("Failed to load session:", err);
        }
    };

    // Start a new chat
    const startNewChat = () => {
        setActiveSessionId(null);
        setMessages([]);
    };

    // Delete a session
    const deleteSession = async (e: React.MouseEvent, sessionId: string) => {
        e.stopPropagation();
        try {
            await fetch(`/api/chat/history?id=${sessionId}`, { method: "DELETE" });
            setSessions((prev) => prev.filter((s) => s.id !== sessionId));
            if (activeSessionId === sessionId) {
                startNewChat();
            }
        } catch (err) {
            console.error("Failed to delete session:", err);
        }
    };

    // Format relative time
    const formatRelativeTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Baru saja";
        if (diffMins < 60) return `${diffMins} menit lalu`;
        if (diffHours < 24) return `${diffHours} jam lalu`;
        if (diffDays < 7) return `${diffDays} hari lalu`;
        return date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
        });
    };

    return (
        <>
            <div className="page-header">
                <h1>🤖 AI Business Advisor</h1>
                <p>Tanya apa saja soal bisnis Anda — dijawab berdasarkan data nyata.</p>
            </div>

            <div className={`chat-layout ${sidebarOpen ? "sidebar-open" : ""}`}>
                {/* Sidebar */}
                <aside className={`chat-sidebar ${sidebarOpen ? "open" : ""}`}>
                    <button className="chat-new-btn" onClick={startNewChat}>
                        <Plus size={18} />
                        Percakapan Baru
                    </button>

                    <div className="chat-sessions-list">
                        {loadingSessions ? (
                            <div className="chat-sessions-empty">
                                <Clock size={20} />
                                <span>Memuat...</span>
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="chat-sessions-empty">
                                <MessageSquare size={20} />
                                <span>Belum ada percakapan</span>
                            </div>
                        ) : (
                            sessions.map((session) => (
                                <div
                                    key={session.id}
                                    className={`chat-session-item ${activeSessionId === session.id ? "active" : ""}`}
                                    onClick={() => loadSession(session.id)}
                                >
                                    <div className="chat-session-info">
                                        <MessageSquare size={14} />
                                        <div className="chat-session-text">
                                            <span className="chat-session-title">
                                                {session.title}
                                            </span>
                                            <span className="chat-session-meta">
                                                {session._count.messages} pesan · {formatRelativeTime(session.updatedAt)}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        className="chat-session-delete"
                                        onClick={(e) => deleteSession(e, session.id)}
                                        title="Hapus percakapan"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </aside>

                {/* Main Chat Area */}
                <div className="chat-container">
                    {/* Toggle sidebar button */}
                    <div className="chat-topbar">
                        <button
                            className="chat-sidebar-toggle"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            title={sidebarOpen ? "Tutup sidebar" : "Riwayat chat"}
                        >
                            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
                            <span>{sidebarOpen ? "Tutup" : "Riwayat"}</span>
                        </button>
                        {activeSessionId && (
                            <span className="chat-topbar-title">
                                {sessions.find(s => s.id === activeSessionId)?.title || ""}
                            </span>
                        )}
                    </div>
                    <div className="chat-messages">
                        {messages.length === 0 && (
                            <div className="chat-welcome">
                                <div className="chat-welcome-header">
                                    <h3>Halo! Saya AI Advisor Anda 👋</h3>
                                    <p>Tanya apa saja seputar bisnis Anda — saya analisis berdasarkan data real-time.</p>
                                </div>
                                <div className="chat-prompt-grid">
                                    {PROMPT_CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.label}
                                            className="chat-prompt-card"
                                            onClick={() => append({ role: "user", content: cat.prompt })}
                                        >
                                            <div className="chat-prompt-card-icon" style={{ background: `${cat.color}15`, color: cat.color }}>
                                                <cat.icon size={20} />
                                            </div>
                                            <div className="chat-prompt-card-text">
                                                <span className="chat-prompt-card-label">{cat.label}</span>
                                                <span className="chat-prompt-card-desc">{cat.prompt}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg) => (
                            <div key={msg.id} className={`chat-message ${msg.role}`}>
                                <div className={`chat-avatar ${msg.role === "user" ? "user" : "ai"}`}>
                                    {msg.role === "user" ? <User size={18} /> : <Bot size={18} />}
                                </div>
                                <div className="chat-bubble">
                                    {msg.role === "user" ? (
                                        <div>{msg.content}</div>
                                    ) : (
                                        <div className="markdown-content">
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isLoading && messages[messages.length - 1]?.role === "user" && (
                            <div className="chat-message assistant">
                                <div className="chat-avatar ai"><Bot size={18} /></div>
                                <div className="chat-bubble">
                                    <div className="loading-dots">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-input-area">
                        <form onSubmit={handleSubmit} className="chat-input-wrapper">
                            <input
                                className="chat-input"
                                value={input}
                                onChange={handleInputChange}
                                placeholder="Tanya sesuatu tentang bisnis Anda..."
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                className="chat-send-btn"
                                disabled={isLoading || !input.trim()}
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

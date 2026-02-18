"use client";

import { useChat } from "ai/react";
import { useState, useEffect, useRef, useCallback } from "react";
import {
    Bot,
    Send,
    User,
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
    X,
    Quote,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatSession {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    _count: { messages: number };
}

interface TooltipState {
    visible: boolean;
    x: number;
    y: number;
    text: string;
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
    const [quotedText, setQuotedText] = useState<string | null>(null);
    const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, text: "" });
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatMessagesRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const chatInputRef = useRef<HTMLInputElement>(null);

    const {
        messages,
        input,
        handleInputChange,
        handleSubmit: originalHandleSubmit,
        isLoading,
        append,
        setMessages,
        setInput,
    } = useChat({
        api: "/api/chat",
        body: { sessionId: activeSessionId },
        onResponse(response) {
            const newSessionId = response.headers.get("X-Session-Id");
            if (newSessionId && !activeSessionId) {
                setActiveSessionId(newSessionId);
                loadSessions();
            }
        },
        onFinish() {
            loadSessions();
        },
    });

    // Custom submit handler that prepends quoted text
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() && !quotedText) return;

        if (quotedText) {
            const fullMessage = `[Mengenai: "${quotedText}"]\n\n${input}`;
            append({ role: "user", content: fullMessage });
            setInput("");
            setQuotedText(null);
        } else {
            originalHandleSubmit(e);
        }
    };

    // Handle text selection on AI bubbles
    const handleTextSelection = useCallback(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || !selection.toString().trim()) {
            return;
        }

        const selectedText = selection.toString().trim();
        if (selectedText.length < 2) return;

        // Make sure selection is within an AI chat bubble
        const anchorNode = selection.anchorNode;
        if (!anchorNode) return;

        const bubble = (anchorNode as HTMLElement).closest
            ? (anchorNode as HTMLElement).closest(".chat-message.assistant .chat-bubble")
            : (anchorNode.parentElement as HTMLElement)?.closest(".chat-message.assistant .chat-bubble");

        if (!bubble) return;

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Use viewport coordinates directly (fixed positioning)
        const x = rect.left + rect.width / 2;
        const y = rect.top - 10;

        setTooltip({
            visible: true,
            x,
            y,
            text: selectedText.length > 300 ? selectedText.substring(0, 300) + "..." : selectedText,
        });
    }, []);

    // Listen for mouseup on the chat messages container
    useEffect(() => {
        const container = chatMessagesRef.current;
        if (!container) return;

        const handleMouseUp = () => {
            // Small delay to let the selection finalize
            setTimeout(handleTextSelection, 10);
        };

        container.addEventListener("mouseup", handleMouseUp);
        return () => container.removeEventListener("mouseup", handleMouseUp);
    }, [handleTextSelection]);

    // Close tooltip on click outside or scroll
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
                setTooltip((prev) => ({ ...prev, visible: false }));
            }
        };

        const handleScroll = () => {
            setTooltip((prev) => ({ ...prev, visible: false }));
        };

        document.addEventListener("mousedown", handleClickOutside);
        chatMessagesRef.current?.addEventListener("scroll", handleScroll);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            chatMessagesRef.current?.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // When quote is set, focus the input
    const handleQuote = () => {
        setQuotedText(tooltip.text);
        setTooltip((prev) => ({ ...prev, visible: false }));
        window.getSelection()?.removeAllRanges();
        setTimeout(() => chatInputRef.current?.focus(), 50);
    };

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
        setQuotedText(null);
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
        setQuotedText(null);
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
                    <div className="chat-messages" ref={chatMessagesRef}>
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

                    {/* Floating quote tooltip — outside scroll container, fixed to viewport */}
                    {tooltip.visible && (
                        <div
                            ref={tooltipRef}
                            className="chat-quote-tooltip"
                            style={{
                                left: `${tooltip.x}px`,
                                top: `${tooltip.y}px`,
                            }}
                            onClick={handleQuote}
                        >
                            <Quote size={14} />
                            <span>Tanyakan ini</span>
                        </div>
                    )}

                    <div className="chat-input-area">
                        {/* Quote preview */}
                        {quotedText && (
                            <div className="chat-quote-preview">
                                <div className="chat-quote-preview-content">
                                    <Quote size={14} className="chat-quote-preview-icon" />
                                    <span className="chat-quote-preview-text">
                                        &ldquo;{quotedText}&rdquo;
                                    </span>
                                </div>
                                <button
                                    className="chat-quote-clear"
                                    onClick={() => setQuotedText(null)}
                                    title="Hapus kutipan"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="chat-input-wrapper">
                            <input
                                ref={chatInputRef}
                                className="chat-input"
                                value={input}
                                onChange={handleInputChange}
                                placeholder={quotedText ? "Tanyakan lebih lanjut tentang bagian ini..." : "Tanya sesuatu tentang bisnis Anda..."}
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                className="chat-send-btn"
                                disabled={isLoading || (!input.trim() && !quotedText)}
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

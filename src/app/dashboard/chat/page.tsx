"use client";

import { useChat } from "ai/react";
import { Bot, Send, User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

const SUGGESTED_PROMPTS = [
    "Produk apa yang paling laris bulan ini?",
    "Berapa total revenue minggu ini?",
    "Kasih rekomendasi strategi untuk meningkatkan penjualan",
    "Analisis tren penjualan saya",
    "Produk mana yang stoknya hampir habis?",
    "Berapa rata-rata nilai transaksi?",
];

export default function ChatPage() {
    const { messages, input, handleInputChange, handleSubmit, isLoading, append } =
        useChat({ api: "/api/chat" });

    return (
        <>
            <div className="page-header">
                <h1>🤖 AI Business Advisor</h1>
                <p>Tanya apa saja soal bisnis Anda — dijawab berdasarkan data nyata.</p>
            </div>

            <div className="chat-container">
                <div className="chat-messages">
                    {messages.length === 0 && (
                        <div className="empty-state" style={{ padding: "40px 20px" }}>
                            <Sparkles size={48} style={{ color: "var(--accent-primary)" }} />
                            <h3 style={{ margin: "16px 0 8px" }}>Halo! Saya AI Advisor Anda 👋</h3>
                            <p style={{ marginBottom: 24 }}>
                                Saya bisa menjawab pertanyaan seputar bisnis Anda berdasarkan data
                                penjualan, produk, dan pengeluaran.
                            </p>
                            <div className="suggested-prompts">
                                {SUGGESTED_PROMPTS.map((prompt) => (
                                    <button
                                        key={prompt}
                                        className="suggested-prompt"
                                        onClick={() => append({ role: "user", content: prompt })}
                                    >
                                        {prompt}
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
        </>
    );
}

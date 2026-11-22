import React, { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function send(e: React.FormEvent) {
    e.preventDefault();

    const message = draft.trim();

    if (!message || busy) return;

    const previous = messages;

    const updatedMessages = [
      ...previous,
      { role: "user" as const, content: message },
    ];

    setMessages(updatedMessages);
    setDraft("");
    setError("");
    setBusy(true);

    try {
      const base = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

      const token = sessionStorage.getItem("ph_token");

      if (!token) {
        throw new Error("Please log in before using AI.");
      }

      const response = await fetch(`${base}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: updatedMessages.slice(-20),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Chat request failed");
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      style={{
        padding: 20,
        border: "1px solid #d1d5db",
        borderRadius: 12,
        maxWidth: 800,
        background: "#ffffff",
      }}
    >
      <h2>ProjectHealth AI Assistant</h2>

      <p>
        Ask questions about project management, programming, technology, or
        general knowledge.
      </p>

      <div
        style={{
          maxHeight: 380,
          overflowY: "auto",
          display: "grid",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              padding: 12,
              borderRadius: 8,
              background: m.role === "user" ? "#dbeafe" : "#f3f4f6",
              color: "#111827",
              whiteSpace: "pre-wrap",
            }}
          >
            <strong>{m.role === "user" ? "You" : "AI Assistant"}</strong>
            <p>{m.content}</p>
          </div>
        ))}

        {busy && <p>AI is thinking...</p>}
      </div>

      {error && (
        <p role="alert" style={{ color: "#b91c1c" }}>
          {error}
        </p>
      )}

      <form onSubmit={send} style={{ display: "grid", gap: 10 }}>
        <textarea
          aria-label="Ask AI a question"
          rows={3}
          maxLength={4000}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask AI anything..."
          style={{
            width: "100%",
            padding: 10,
            boxSizing: "border-box",
          }}
        />

        <button
          type="submit"
          disabled={busy || !draft.trim()}
          style={{ padding: 10, cursor: "pointer" }}
        >
          {busy ? "Thinking..." : "Send"}
        </button>
      </form>
    </section>
  );
}

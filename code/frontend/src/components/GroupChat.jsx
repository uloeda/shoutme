import { useEffect, useState, useRef } from "react";

const API = "http://127.0.0.1:8000/api";

export default function GroupChat({ eventId, eventHost }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  // Get current user
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") ?? "null");
    } catch {
      return null;
    }
  })();

  // Fetch messages
  async function fetchMessages() {
    try {
      const access = localStorage.getItem("access");
      const headers = access ? { Authorization: `Bearer ${access}` } : {};
      
      const res = await fetch(`${API}/events/${eventId}/messages/`, { headers });
      if (!res.ok) throw new Error("Failed to fetch messages");
      
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : data.results || []);
    } catch (e) {
      console.error("Error fetching messages:", e);
      setError(e.message);
    }
  }

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, [eventId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  async function handleSendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    if (!user) {
      setError("You must be signed in to send messages");
      return;
    }

    try {
      setLoading(true);
      const access = localStorage.getItem("access");
      
      const res = await fetch(`${API}/events/${eventId}/messages/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify({ content: newMessage }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.content?.[0] || "Failed to send message");
      }

      setNewMessage("");
      await fetchMessages(); // Refresh messages immediately
    } catch (e) {
      console.error("Error sending message:", e);
      setError(e.message);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={S.container}>
      {/* Messages Display */}
      <div style={S.messagesBox}>
        {messages.length === 0 ? (
          <div style={S.noMessages}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
            <div style={{ color: "#94a3b8", fontSize: 14 }}>
              No messages yet. Start the conversation!
            </div>
          </div>
        ) : (
          <div style={S.messagesList}>
            {messages.map((msg) => (
              <div key={msg.id} style={S.messageItem}>
                <div style={S.messageHeader}>
                  <div style={S.messageMeta}>
                    <span style={S.username}>{msg.user_username}</span>
                    {msg.is_host && (
                      <span style={S.hostBadge}>HOST</span>
                    )}
                  </div>
                  <span style={S.timestamp}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                <div style={S.messageContent}>{msg.content}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div style={S.errorBox}>
          <span style={{ fontSize: 12, color: "#fca5a5" }}>✗ {error}</span>
        </div>
      )}

      {/* Message input */}
      {user ? (
        <form onSubmit={handleSendMessage} style={S.inputForm}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={loading}
            style={S.input}
          />
          <button
            type="submit"
            disabled={loading || !newMessage.trim()}
            style={{ ...S.sendBtn, opacity: loading || !newMessage.trim() ? 0.5 : 1 }}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </form>
      ) : (
        <div style={S.signInPrompt}>
          <span style={{ color: "#94a3b8", fontSize: 13 }}>
            Sign in to join the conversation
          </span>
        </div>
      )}
    </div>
  );
}

// Styles
const S = {
  container: {
    background: "#0f1219",
    border: "1px solid #1e2535",
    borderRadius: 12,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    height: 500,
    maxHeight: "500px",
  },

  messagesBox: {
    flex: 1,
    overflowY: "auto",
    background: "#0a0d12",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  noMessages: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    color: "#64748b",
    textAlign: "center",
  },

  messagesList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  messageItem: {
    background: "#1e2535",
    border: "1px solid #2d3a4f",
    borderRadius: 8,
    padding: "12px",
    animation: "fadeIn 0.3s ease",
  },

  messageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },

  messageMeta: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  username: {
    color: "#f97316",
    fontWeight: 600,
    fontSize: 13,
  },

  hostBadge: {
    background: "#f97316",
    color: "#0a0d12",
    padding: "2px 8px",
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.05em",
  },

  timestamp: {
    color: "#64748b",
    fontSize: 12,
  },

  messageContent: {
    color: "#e2e8f0",
    fontSize: 14,
    lineHeight: 1.4,
    wordBreak: "break-word",
  },

  errorBox: {
    padding: "8px 12px",
    background: "#2d0a0a",
    borderTop: "1px solid #7f1d1d",
    borderBottom: "1px solid #7f1d1d",
  },

  inputForm: {
    display: "flex",
    gap: "8px",
    padding: "12px",
    borderTop: "1px solid #1e2535",
    background: "#0f1219",
  },

  input: {
    flex: 1,
    padding: "10px 12px",
    background: "#1e2535",
    border: "1px solid #2d3a4f",
    borderRadius: 6,
    color: "#e2e8f0",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.2s",
  },

  sendBtn: {
    padding: "10px 18px",
    background: "#f97316",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.2s",
  },

  signInPrompt: {
    padding: "12px",
    borderTop: "1px solid #1e2535",
    background: "#0f1219",
    textAlign: "center",
  },
};

import React, { useEffect, useState } from "react";
import { getToken, getUserRoles } from "../auth";

const API = "http://localhost:4004/api/notices";
const PRIORITIES = ["Normal", "High", "Urgent"];

const PRIORITY_COLORS = {
  Normal: "#6e655c",
  High: "#6b1e35",
  Urgent: "#b3261e",
};

export default function NoticePage() {
  const [notices, setNotices] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const roles = getUserRoles();
  const hasAccess = roles.includes("notice-access");

  useEffect(() => {
    if (hasAccess) fetchNotices();
    // eslint-disable-next-line
  }, []);

  async function fetchNotices() {
    const res = await fetch(API, { headers: { Authorization: `Bearer ${getToken()}` } });
    if (res.ok) setNotices(await res.json());
  }

  async function handlePost(e) {
    e.preventDefault();
    setError("");
    if (!title || !content) {
      setError("Title and content are required.");
      return;
    }
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ title, content, priority }),
    });
    if (res.ok) {
      setTitle(""); setContent(""); setPriority("Normal");
      fetchNotices();
    } else {
      setError("Failed to post notice.");
    }
  }

  async function handleDelete(id) {
    await fetch(`${API}/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
    setConfirmDeleteId(null);
    fetchNotices();
  }

  if (!hasAccess) {
    return <div style={styles.deniedBox}>🚫 You do not have access to the Notice Board module.</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Notice Board</h2>

      {error && <div style={styles.errorBox}>{error}</div>}

      <form onSubmit={handlePost} style={styles.form}>
        <input style={styles.input} placeholder="Notice title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea style={{ ...styles.input, minHeight: "70px", fontFamily: "inherit" }} placeholder="Notice content" value={content} onChange={(e) => setContent(e.target.value)} />
        <select style={styles.input} value={priority} onChange={(e) => setPriority(e.target.value)}>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <button type="submit" style={styles.postBtn}>Post Notice</button>
      </form>

      <div style={styles.list}>
        {notices.map((n) => (
          <div key={n.id} style={{ ...styles.card, borderLeft: `4px solid ${PRIORITY_COLORS[n.priority]}` }}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>{n.title}</h3>
              <span style={{ ...styles.priorityBadge, color: PRIORITY_COLORS[n.priority], borderColor: PRIORITY_COLORS[n.priority] }}>
                {n.priority}
              </span>
            </div>
            <p style={styles.cardContent}>{n.content}</p>
            <div style={styles.cardFooter}>
              <span style={styles.date} className="mono">
                {new Date(n.posted_at).toLocaleString()}
              </span>
              {confirmDeleteId === n.id ? (
                <span>
                  <button style={styles.confirmBtn} onClick={() => handleDelete(n.id)}>Confirm</button>
                  <button style={styles.cancelBtn} onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                </span>
              ) : (
                <button style={styles.deleteBtn} onClick={() => setConfirmDeleteId(n.id)}>Delete</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "28px", maxWidth: "700px", margin: "0 auto" },
  heading: { marginBottom: "20px" },
  form: { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" },
  input: {
    background: "#faf8f5", border: "1px solid #e4ddd3",
    borderRadius: "6px", padding: "10px 12px", color: "#2b2620", fontSize: "14px", outline: "none",
  },
  postBtn: {
    background: "#6b1e35", border: "none", borderRadius: "6px",
    padding: "10px 18px", color: "#faf8f5", fontWeight: "600", alignSelf: "flex-start",
  },
  list: { display: "flex", flexDirection: "column", gap: "14px" },
  card: {
    background: "#ffffff", border: "1px solid #e4ddd3", borderRadius: "8px", padding: "16px 18px",
  },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
  cardTitle: { margin: 0, fontSize: "16px" },
  priorityBadge: {
    border: "1px solid", padding: "2px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "700",
  },
  cardContent: { color: "#2b2620", fontSize: "14px", lineHeight: "1.5", margin: "0 0 12px 0" },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  date: { color: "#6e655c", fontSize: "12px" },
  deleteBtn: {
    background: "transparent", border: "1px solid #b3261e", color: "#b3261e",
    padding: "4px 10px", borderRadius: "6px", fontSize: "12px",
  },
  confirmBtn: {
    background: "#b3261e", border: "none", color: "#fff",
    padding: "4px 10px", borderRadius: "6px", fontSize: "12px", marginRight: "6px",
  },
  cancelBtn: {
    background: "transparent", border: "1px solid #e4ddd3", color: "#6e655c",
    padding: "4px 10px", borderRadius: "6px", fontSize: "12px",
  },
  errorBox: {
    background: "rgba(217,83,79,0.12)", border: "1px solid #b3261e", color: "#b3261e",
    padding: "10px 12px", borderRadius: "6px", fontSize: "13px", marginBottom: "12px",
  },
  deniedBox: { padding: "60px", textAlign: "center", color: "#b3261e", fontSize: "16px" },
};
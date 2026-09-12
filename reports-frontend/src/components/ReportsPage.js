import React, { useEffect, useState } from "react";
import { getToken, getUserRoles } from "../auth";

const API = "http://localhost:4001/api/reports";

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const roles = getUserRoles();
  const hasAccess = roles.includes("reports-access");

  useEffect(() => {
    if (hasAccess) fetchReports();
    // eslint-disable-next-line
  }, []);

  async function fetchReports() {
    const res = await fetch(API, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (res.ok) {
      const data = await res.json();
      setReports(data);
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title || !file) {
      setError("Title and PDF file are required.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);

    const res = await fetch(API, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    });

    if (res.ok) {
      setSuccess("Report uploaded successfully.");
      setTitle("");
      setFile(null);
      document.getElementById("fileInput").value = "";
      fetchReports();
    } else {
      const data = await res.json();
      setError(data.error || "Upload failed.");
    }
  }

  async function handleDelete(id) {
    await fetch(`${API}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    setConfirmDeleteId(null);
    fetchReports();
  }

  if (!hasAccess) {
    return (
      <div style={styles.deniedBox}>
        🚫 You do not have access to the Reports module.
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Reports</h2>

      {error && <div style={styles.errorBox}>{error}</div>}
      {success && <div style={styles.successBox}>{success}</div>}

      <form onSubmit={handleUpload} style={styles.form}>
        <input
          style={styles.input}
          placeholder="Report title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          id="fileInput"
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
          style={styles.fileInput}
        />
        <button type="submit" style={styles.uploadBtn}>Upload</button>
      </form>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Title</th>
            <th style={styles.th}>Filename</th>
            <th style={styles.th}>Uploaded By</th>
            <th style={styles.th}>Date</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r.id}>
              <td style={styles.td}>{r.title}</td>
              <td style={styles.td} className="mono">{r.filename}</td>
              <td style={styles.td}>{r.uploaded_by}</td>
              <td style={styles.td}>{new Date(r.uploaded_at).toLocaleDateString()}</td>
              <td style={styles.td}>
                
                  <a href={`http://localhost:4001/uploads/${r.filename}`}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.viewBtn}
                >
                  View PDF
                </a>
                {confirmDeleteId === r.id ? (
                  <>
                    <button style={styles.confirmBtn} onClick={() => handleDelete(r.id)}>Confirm</button>
                    <button style={styles.cancelBtn} onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                  </>
                ) : (
                  <button style={styles.deleteBtn} onClick={() => setConfirmDeleteId(r.id)}>Delete</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: { padding: "28px", maxWidth: "900px", margin: "0 auto" },
  heading: { marginBottom: "20px" },
  form: { display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" },
  input: {
    flex: 1, minWidth: "180px", background: "#faf8f5", border: "1px solid #e4ddd3",
    borderRadius: "6px", padding: "10px 12px", color: "#2b2620", fontSize: "14px", outline: "none",
  },
  fileInput: { color: "#6e655c", fontSize: "13px" },
  uploadBtn: {
    background: "#6b1e35", border: "none", borderRadius: "6px",
    padding: "10px 18px", color: "#faf8f5", fontWeight: "600",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left", padding: "10px", borderBottom: "1px solid #e4ddd3",
    color: "#6e655c", fontSize: "12px", textTransform: "uppercase",
  },
  td: { padding: "10px", borderBottom: "1px solid #e4ddd3", fontSize: "14px" },
  viewBtn: { color: "#6b1e35", marginRight: "10px", fontSize: "13px" },
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
  successBox: {
    background: "rgba(95,184,122,0.12)", border: "1px solid #2e7d4f", color: "#2e7d4f",
    padding: "10px 12px", borderRadius: "6px", fontSize: "13px", marginBottom: "12px",
  },
  deniedBox: {
    padding: "60px", textAlign: "center", color: "#b3261e", fontSize: "16px",
  },
};
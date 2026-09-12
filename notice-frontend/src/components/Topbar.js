import React from "react";
import { getUsername, logout } from "../auth";

export default function Topbar({ onBackToDashboard }) {
  const username = getUsername();

  return (
    <div style={styles.topbar}>
      <div style={styles.left}>
        <div style={styles.eyebrow} className="mono">DRDO IAM // NOTICE BOARD</div>
        <button style={styles.backBtn} onClick={onBackToDashboard}>
          ← Back to Dashboard
        </button>
      </div>
      <div style={styles.right}>
        <span style={styles.username} className="mono">{username}</span>
        <button style={styles.signOutBtn} onClick={() => logout()}>
          Sign out
        </button>
      </div>
    </div>
  );
}

const styles = {
  topbar: {
    position: "sticky", top: 0, zIndex: 10, display: "flex",
    justifyContent: "space-between", alignItems: "center",
    padding: "14px 28px", background: "#ffffff", borderBottom: "1px solid #e4ddd3",
  },
  left: { display: "flex", alignItems: "center", gap: "18px" },
  eyebrow: { color: "#6e655c", fontSize: "12px", letterSpacing: "1.5px" },
  backBtn: {
    background: "transparent", border: "1px solid #e4ddd3", color: "#2b2620",
    padding: "6px 14px", borderRadius: "6px", fontSize: "13px",
  },
  right: { display: "flex", alignItems: "center", gap: "16px" },
  username: { color: "#2b2620", fontSize: "13px" },
  signOutBtn: {
    background: "transparent", border: "1px solid #b3261e", color: "#b3261e",
    padding: "6px 14px", borderRadius: "6px", fontSize: "13px",
  },
};
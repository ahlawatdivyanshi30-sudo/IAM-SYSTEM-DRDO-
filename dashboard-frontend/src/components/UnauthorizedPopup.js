import React from "react";

export default function UnauthorizedPopup({ appName, roleName, onClose }) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.card} onClick={(e) => e.stopPropagation()}>
        <div style={styles.icon}>⛔</div>
        <h3 style={styles.title}>Access Denied</h3>
        <p style={styles.message}>
          You are not authorised to access {appName}. Contact your administrator to
          request the <span className="mono">{roleName}</span> role.
        </p>
        <button className="wine-btn" style={styles.closeBtn} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(43,38,32,0.4)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
  },
  card: {
    background: "#ffffff", border: "1px solid #b3261e", borderRadius: "10px",
    padding: "30px", maxWidth: "360px", textAlign: "center",
  },
  icon: { fontSize: "30px", marginBottom: "8px" },
  title: { color: "#b3261e", margin: "0 0 12px 0" },
  message: { color: "#2b2620", fontSize: "14px", lineHeight: "1.5" },
  closeBtn: { marginTop: "18px", padding: "8px 22px", fontSize: "14px" },
};
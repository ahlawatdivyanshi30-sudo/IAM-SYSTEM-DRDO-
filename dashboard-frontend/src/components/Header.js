import React, { useState } from "react";
import { isLoggedIn, getUsername, logout, getUserRoles, buildSSOUrl } from "../auth";
import { IconPhone, IconGrid } from "../icons";
import { APPS } from "../appsConfig";

export default function Header({ onSignInClick }) {
  const [showFrequent, setShowFrequent] = useState(false);
  const loggedIn = isLoggedIn();
  const username = getUsername();
  const roles = getUserRoles();

  function openApp(app) {
    setShowFrequent(false);
    if (loggedIn && roles.includes(app.role)) {
      window.location.href = buildSSOUrl(app.origin);
    }
  }

  return (
    <div style={{ position: "relative" }}>
      {/* Utility strip */}
      <div className="utility-strip" style={styles.utilityStrip}>
        <span className="mono" style={{ fontSize: "11px" }}>Government of India | Ministry of Defence</span>
        <div style={styles.utilityRight}>
          <a href="mailto:iam-support@drdo.gov.in" className="utility-link" style={styles.utilityItem}>
            <IconPhone style={{ width: 12, height: 12 }} /> Contact Us
          </a>
          <span
            className="utility-link"
            style={{ ...styles.utilityItem, cursor: "pointer" }}
            onClick={() => setShowFrequent(!showFrequent)}
          >
            <IconGrid style={{ width: 12, height: 12 }} /> Frequently Used Apps
          </span>
          <span className="utility-link" style={styles.utilityItem}>English</span>
        </div>
      </div>

      {/* Frequently used apps dropdown */}
      {showFrequent && (
        <div style={styles.dropdown}>
          {APPS.map((app) => (
            <div key={app.id} style={styles.dropdownItem} onClick={() => openApp(app)}>
              {app.name}
            </div>
          ))}
        </div>
      )}

      {/* Main identity header */}
      <div className="gov-header-row" style={styles.mainHeader}>
        <div style={styles.brandRow}>
          <img src="/emblem.png" alt="Emblem of India" style={styles.emblemImg} />
          <div>
            <div style={styles.govLine}>Government of India</div>
            <div style={styles.orgLine}>Defence Research and Development Organisation</div>
          </div>
        </div>

        <div style={styles.right}>
          <img src="/drdo-logo.png" alt="DRDO Logo" style={styles.drdoImg} />
          {loggedIn ? (
            <>
              <span className="mono" style={styles.username}>{username}</span>
              <button className="outline-btn" style={styles.signOutBtn} onClick={() => logout()}>Sign Out</button>
            </>
          ) : (
            <button className="wine-btn" style={styles.signInBtn} onClick={onSignInClick}>Sign In</button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  utilityStrip: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "6px 32px", fontSize: "12px",
  },
  utilityRight: { display: "flex", gap: "20px" },
  utilityItem: { display: "flex", alignItems: "center", gap: "5px" },
  dropdown: {
    position: "absolute", top: "34px", right: "32px", zIndex: 20,
    background: "#fff", border: "1px solid #e4ddd3", borderRadius: "8px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)", minWidth: "200px", overflow: "hidden",
  },
  dropdownItem: {
    padding: "10px 16px", fontSize: "13px", cursor: "pointer", borderBottom: "1px solid #f3ede6",
  },
  mainHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "20px 32px", background: "#ffffff", borderBottom: "1px solid #e4ddd3",
  },
  brandRow: { display: "flex", alignItems: "center", gap: "20px" },
  emblemImg: { height: "64px", width: "auto", objectFit: "contain" },
  drdoImg: { height: "56px", width: "auto", objectFit: "contain" },
  govLine: { fontSize: "16px", fontWeight: 700, color: "#2b2620" },
  orgLine: { fontSize: "26px", fontWeight: 800, color: "#2b2620", letterSpacing: "-0.3px" },
  right: { display: "flex", alignItems: "center", gap: "20px" },
  username: { fontSize: "13px", color: "#2b2620" },
  signInBtn: { padding: "9px 22px", fontSize: "13px", fontWeight: 600 },
  signOutBtn: { padding: "8px 18px", fontSize: "13px", fontWeight: 600, background: "transparent" },
};
import React, { useState } from "react";
import { isLoggedIn, getUserRoles, buildSSOUrl } from "../auth";
import { APPS } from "../appsConfig";
import UnauthorizedPopup from "./UnauthorizedPopup";
import StatusStrip from "./StatusStrip";
import { IconDocument, IconArchive, IconShieldTag, IconMegaphone, IconPeople } from "../icons";

const SYSTEM_CODES = {
  reports: "SYS/RPT", inventory: "SYS/INV", asset: "SYS/AST", notice: "SYS/NTC", personnel: "SYS/PER",
};

const ICONS = {
  reports: IconDocument, inventory: IconArchive, asset: IconShieldTag, notice: IconMegaphone, personnel: IconPeople,
};

export default function DashboardHome({ onRequireLogin }) {
  const [popupApp, setPopupApp] = useState(null);
  const loggedIn = isLoggedIn();
  const roles = getUserRoles();

  function handleTileClick(app) {
    if (!loggedIn) { onRequireLogin(app); return; }
    if (roles.includes(app.role)) {
      window.location.href = buildSSOUrl(app.origin);
    } else {
      setPopupApp(app);
    }
  }

  return (
    <div>
      <div style={styles.hero}>
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent}>
          <div style={styles.heroLeft}>
            <div className="mono" style={styles.heroEyebrow}>DEFENCE RESEARCH &amp; DEVELOPMENT ORGANISATION</div>
            <h1 className="display" style={styles.heroTitle}>IAM Access Console</h1>
            <p style={styles.heroSubtitle}>
              A single sign-on gateway for departmental reports, inventory, assets, notices, and personnel systems.
            </p>
          </div>
          <div style={styles.statusWrapper}>
            <StatusStrip />
          </div>
        </div>
      </div>

      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Departmental Modules</h2>
        <span style={styles.sectionHint}>Select a module below to continue</span>
      </div>

      <div style={styles.grid}>
        {APPS.map((app) => {
          const Icon = ICONS[app.id];
          const hasAccess = loggedIn && roles.includes(app.role);
          const statusText = loggedIn ? (hasAccess ? "Access Granted" : "Access Restricted") : "Sign in required";
          const statusColor = loggedIn ? (hasAccess ? "#2e7d4f" : "#b3261e") : "#6b1e35";

          return (
            <div
              key={app.id}
              className="module-card-gov"
              style={styles.card}
              onClick={() => handleTileClick(app)}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => { if (e.key === "Enter") handleTileClick(app); }}
            >
              <div style={styles.cardTop}>
                <div className="module-icon-seal">
                  <Icon style={{ width: 26, height: 26 }} />
                </div>
                <span className="mono" style={styles.cardCode}>{SYSTEM_CODES[app.id]}</span>
              </div>
              <h3 style={styles.cardName}>{app.name}</h3>
              <p style={styles.cardDesc}>{app.description}</p>
              <div style={styles.cardFooter}>
                <div style={{ ...styles.statusPill, color: statusColor, borderColor: statusColor }}>{statusText}</div>
                <span style={styles.arrow}>→</span>
              </div>
            </div>
          );
        })}

        <div style={styles.placeholderCard}>
          <p style={styles.placeholderText}>More departmental modules will appear here as they are added.</p>
        </div>
      </div>

      <div style={styles.helpStrip}>
        <span>Need help? Reach the IT Helpdesk at <span className="mono">1800-11-7800</span> or <span className="mono">iam-support@drdo.gov.in</span></span>
      </div>

      {popupApp && (
        <UnauthorizedPopup appName={popupApp.name} roleName={popupApp.role} onClose={() => setPopupApp(null)} />
      )}
    </div>
  );
}

const styles = {
  hero: {
    position: "relative",
    backgroundImage: "url('/india-gate.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    overflow: "hidden",
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(100deg, rgba(107,30,53,0.92) 0%, rgba(107,30,53,0.82) 45%, rgba(107,30,53,0.55) 100%)",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    flexWrap: "wrap", gap: "20px",
    padding: "48px 32px",
  },
  heroLeft: { maxWidth: "600px" },
  heroEyebrow: { color: "#f2d9e0", fontSize: "11px", letterSpacing: "2px", marginBottom: "10px" },
  heroTitle: { fontSize: "36px", margin: "0 0 12px 0", color: "#ffffff", fontWeight: 700 },
  heroSubtitle: { color: "#f2e5e9", fontSize: "15px", lineHeight: "1.6", margin: 0 },
  statusWrapper: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: "10px",
    padding: "14px 18px",
    backdropFilter: "blur(2px)",
  },
  sectionHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "8px",
    maxWidth: "1200px", margin: "0 auto", padding: "32px 32px 16px 32px",
  },
  sectionTitle: { margin: 0, fontSize: "20px", color: "#2b2620" },
  sectionHint: { color: "#6e655c", fontSize: "13px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "22px",
    maxWidth: "1200px", margin: "0 auto", padding: "0 32px 20px 32px",
  },
  card: { padding: "26px" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" },
  cardCode: { color: "#a89b8c", fontSize: "11px", marginTop: "6px" },
  cardName: { margin: "0 0 8px 0", fontSize: "18px", color: "#2b2620" },
  cardDesc: { color: "#6e655c", fontSize: "13.5px", lineHeight: "1.55", margin: 0, flex: 1 },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" },
  statusPill: {
    border: "1px solid", borderRadius: "12px", padding: "4px 12px",
    fontSize: "11px", fontWeight: "600",
  },
  arrow: { fontSize: "18px", color: "#6b1e35" },
  placeholderCard: {
    border: "1px dashed #d8cfc3", borderRadius: "12px", padding: "26px",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    textAlign: "center", gap: "10px", minHeight: "180px",
  },
  placeholderText: { color: "#a89b8c", fontSize: "12.5px", margin: 0 },
  helpStrip: {
    maxWidth: "1200px", margin: "0 auto", padding: "0 32px 48px 32px",
    color: "#6e655c", fontSize: "13px",
  },
};
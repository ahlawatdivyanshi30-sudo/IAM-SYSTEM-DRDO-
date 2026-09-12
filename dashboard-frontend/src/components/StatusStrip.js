import React, { useEffect, useState } from "react";
import { isKeycloakOnline, isLoggedIn, getUserRoles } from "../auth";
import { APPS } from "../appsConfig";

function formatIST(date) {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false, timeZone: "Asia/Kolkata",
  });
}

export default function StatusStrip() {
  const [time, setTime] = useState(formatIST(new Date()));
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const clockTimer = setInterval(() => setTime(formatIST(new Date())), 1000);
    let mounted = true;
    async function check() {
      const ok = await isKeycloakOnline();
      if (mounted) setOnline(ok);
    }
    check();
    const statusTimer = setInterval(check, 15000);
    return () => { mounted = false; clearInterval(clockTimer); clearInterval(statusTimer); };
  }, []);

  const loggedIn = isLoggedIn();
  const roles = getUserRoles();
  const clearanceCount = APPS.filter((a) => roles.includes(a.role)).length;

  return (
    <div style={styles.strip}>
      <div style={styles.row}>
        <span className="mono" style={styles.label}>IST</span>
        <span className="mono" style={styles.value}>{time}</span>
      </div>
      <div style={styles.row}>
        <span className={`status-dot ${online ? "online" : "offline"}`} />
        <span className="mono" style={styles.value}>{online ? "System Online" : "Offline Mode"}</span>
      </div>
      {loggedIn && (
        <div style={styles.row}>
          <span className="mono" style={styles.label}>ACCESS</span>
          <span className="mono" style={styles.value}>{clearanceCount}/{APPS.length} modules</span>
        </div>
      )}
    </div>
  );
}

const styles = {
  strip: { display: "flex", flexDirection: "column", gap: "6px", minWidth: "190px", textAlign: "right" },
  row: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px", fontSize: "12px" },
  label: { color: "#6e655c", letterSpacing: "1px" },
  value: { color: "#2b2620" },
};
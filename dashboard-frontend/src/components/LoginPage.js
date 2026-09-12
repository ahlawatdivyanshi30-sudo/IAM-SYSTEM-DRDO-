import React, { useState } from "react";
import {
  verifyCredentialsOnly,
  getEmailFromSession,
  saveSession,
  isKeycloakOnline,
  loginWithGoogle,
} from "../auth";

const OTP_API = "http://localhost:4999/api/otp";

export default function LoginPage({ targetApp, onSuccess, onBack }) {
  const [step, setStep] = useState("credentials"); // "credentials" | "otp"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [pendingSession, setPendingSession] = useState(null);
  const [pendingEmail, setPendingEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCredentialsSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const online = await isKeycloakOnline();
    if (!online) {
      setError("Keycloak server is unreachable. Offline mode is limited to previously signed-in sessions.");
      setLoading(false);
      return;
    }

    try {
      const session = await verifyCredentialsOnly(username, password);
      const email = getEmailFromSession(session);
      if (!email) {
        setError("No email on file for this account. Contact your administrator.");
        setLoading(false);
        return;
      }

      const res = await fetch(`${OTP_API}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email }),
      });
      if (!res.ok) throw new Error("otp send failed");

      setPendingSession(session);
      setPendingEmail(email);
      setStep("otp");
    } catch (err) {
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${OTP_API}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Verification failed.");
        setLoading(false);
        return;
      }

      saveSession(pendingSession);
      onSuccess();
    } catch (err) {
      setError("Could not verify code. Try again.");
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <button style={styles.closeBtn} onClick={onBack} title="Back to Dashboard">✕</button>

      <div style={styles.wrapper}>
        <div style={styles.brandSide}>
          <div style={styles.logoRow}>
            <img src="/emblem.png" alt="Emblem of India" style={styles.logoImg} />
            <img src="/drdo-logo.png" alt="DRDO Logo" style={styles.logoImg} />
          </div>
          <div className="mono" style={styles.eyebrow}>DEFENCE RESEARCH &amp; DEVELOPMENT ORGANISATION</div>
          <h1 className="display" style={styles.brandTitle}>IAM Access Console</h1>
          <p style={styles.brandTagline}>
            {targetApp ? `Sign in to continue to ${targetApp}.` : "Sign in to access your authorised modules."}
          </p>
        </div>

        <div style={styles.card}>
          <div style={styles.wineRule} />

          {step === "credentials" ? (
            <>
              <div className="mono" style={styles.cardEyebrow}>SECURE SIGN IN</div>
              <h2 style={styles.cardHeading}>{targetApp ? `Access ${targetApp}` : "Welcome back"}</h2>

              {error && <div style={styles.errorBox}>{error}</div>}

              <form onSubmit={handleCredentialsSubmit}>
                <label style={styles.label}>Username</label>
                <input style={styles.input} value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />

                <label style={styles.label}>Password</label>
                <div style={styles.passwordRow}>
                  <input
                    style={{ ...styles.input, marginBottom: 0 }}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="button" style={styles.toggleBtn} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <button type="submit" style={styles.submitBtn} disabled={loading}>
                  {loading ? "Verifying..." : "Continue"}
                </button>
              </form>

              <div style={styles.dividerRow}>
                <span style={styles.dividerLine} />
                <span style={styles.dividerText}>OR</span>
                <span style={styles.dividerLine} />
              </div>

              <button type="button" style={styles.googleBtn} onClick={loginWithGoogle}>
                Sign in with Google
              </button>
            </>
          ) : (
            <>
              <div className="mono" style={styles.cardEyebrow}>VERIFICATION CODE</div>
              <h2 style={styles.cardHeading}>Check your email</h2>
              <p style={styles.otpHint}>
                We sent a 6-digit code to <span className="mono">{pendingEmail}</span>. It expires in 5 minutes.
              </p>

              {error && <div style={styles.errorBox}>{error}</div>}

              <form onSubmit={handleOtpSubmit}>
                <label style={styles.label}>Enter code</label>
                <input
                  style={{ ...styles.input, letterSpacing: "4px", textAlign: "center", fontSize: "18px" }}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  autoFocus
                />
                <button type="submit" style={styles.submitBtn} disabled={loading}>
                  {loading ? "Checking..." : "Verify & Sign In"}
                </button>
              </form>
              <button style={styles.backBtn} onClick={() => setStep("credentials")}>
                ← Use a different account
              </button>
            </>
          )}

          <button style={styles.backBtn} onClick={onBack}>← Back to Dashboard</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    position: "relative", minHeight: "100vh", background: "#faf8f5",
    display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px",
  },
  closeBtn: {
    position: "fixed", top: "24px", right: "28px", width: "40px", height: "40px",
    borderRadius: "50%", background: "#ffffff", border: "1px solid #e4ddd3",
    color: "#6b1e35", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center",
  },
  wrapper: {
    display: "flex", alignItems: "center", gap: "72px",
    flexWrap: "wrap", maxWidth: "920px", width: "100%", justifyContent: "center",
  },
  brandSide: { maxWidth: "320px" },
  logoRow: { display: "flex", gap: "14px", marginBottom: "18px" },
  logoImg: { height: "48px", width: "auto", objectFit: "contain" },
  eyebrow: { color: "#6b1e35", fontSize: "11px", letterSpacing: "1.5px", marginBottom: "14px", fontWeight: 600 },
  brandTitle: { fontSize: "36px", lineHeight: "1.15", margin: "0 0 14px 0", color: "#2b2620", fontWeight: 700 },
  brandTagline: { color: "#6e655c", fontSize: "14px", lineHeight: "1.6" },
  card: {
    position: "relative", background: "#ffffff", border: "1px solid #e4ddd3",
    borderRadius: "16px", padding: "36px", width: "360px", boxShadow: "0 12px 32px rgba(43,38,32,0.08)",
  },
  wineRule: { height: "3px", width: "60px", background: "#6b1e35", borderRadius: "2px", marginBottom: "20px" },
  cardEyebrow: { color: "#a89b8c", fontSize: "11px", letterSpacing: "1.5px", marginBottom: "8px" },
  cardHeading: { margin: "0 0 14px 0", fontSize: "22px", color: "#2b2620", fontWeight: 700 },
  otpHint: { color: "#6e655c", fontSize: "13px", lineHeight: "1.5", marginBottom: "18px" },
  label: { display: "block", fontSize: "13px", color: "#6e655c", marginBottom: "6px", marginTop: "14px" },
  input: {
    width: "100%", background: "#faf8f5", border: "1px solid #e4ddd3", borderRadius: "8px",
    padding: "11px 12px", color: "#2b2620", fontSize: "14px", outline: "none",
  },
  passwordRow: { display: "flex", gap: "8px" },
  toggleBtn: {
    background: "#faf8f5", border: "1px solid #e4ddd3", borderRadius: "8px",
    color: "#6e655c", fontSize: "12px", padding: "0 14px",
  },
  submitBtn: {
    width: "100%", marginTop: "20px", background: "#6b1e35", border: "none",
    borderRadius: "999px", padding: "12px", color: "#ffffff", fontWeight: "600", fontSize: "14px",
  },
  dividerRow: { display: "flex", alignItems: "center", gap: "10px", margin: "18px 0" },
  dividerLine: { flex: 1, height: "1px", background: "#e4ddd3" },
  dividerText: { color: "#a89b8c", fontSize: "11px" },
  googleBtn: {
    width: "100%", background: "#ffffff", border: "1.5px solid #6b1e35",
    borderRadius: "999px", padding: "11px", color: "#6b1e35", fontSize: "14px", fontWeight: "600",
  },
  backBtn: { marginTop: "14px", background: "transparent", border: "none", color: "#a89b8c", fontSize: "13px" },
  errorBox: {
    background: "rgba(179,38,30,0.08)", border: "1px solid #b3261e", color: "#b3261e",
    padding: "10px 12px", borderRadius: "8px", fontSize: "13px", marginBottom: "8px",
  },
};
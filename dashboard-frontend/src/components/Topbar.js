import React from "react";
import { isLoggedIn, getUsername, logout } from "../auth";
import { IconClose, IconLogin } from "../icons";

export default function Topbar({ onSignInClick }) {
  const loggedIn = isLoggedIn();
  const username = getUsername();

  return (
    <>
      <button
        className="corner-btn signin"
        onClick={loggedIn ? undefined : onSignInClick}
        style={{ cursor: loggedIn ? "default" : "pointer" }}
        title={loggedIn ? username : "Sign in"}
      >
        {loggedIn ? (
          <>
            <span style={styles.avatar}>{username ? username.charAt(0).toUpperCase() : "?"}</span>
            <span className="mono" style={{ fontSize: "12px" }}>{username}</span>
          </>
        ) : (
          <>
            <IconLogin style={{ width: 16, height: 16 }} />
            Sign In
          </>
        )}
      </button>

      <button
        className="corner-btn exit"
        onClick={() => loggedIn && logout()}
        title={loggedIn ? "Sign out" : "No active session"}
        style={{ opacity: loggedIn ? 1 : 0.4, cursor: loggedIn ? "pointer" : "default" }}
      >
        <IconClose style={{ width: 16, height: 16 }} />
      </button>
    </>
  );
}

const styles = {
  avatar: {
    width: "22px", height: "22px", borderRadius: "50%",
    background: "#7c2743", color: "#f4f1ec",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "11px", fontWeight: "700",
  },
};
import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import DashboardHome from "./components/DashboardHome";
import LoginPage from "./components/LoginPage";
import { initSessionFromURL, handleGoogleCallback, isLoggedIn, buildSSOUrl } from "./auth";

function App() {
  const [view, setView] = useState("dashboard");
  const [pendingApp, setPendingApp] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const gotGoogleSession = await handleGoogleCallback();
      initSessionFromURL();
      if (gotGoogleSession) setView("dashboard");
      setReady(true);
    })();
  }, []);

  function handleRequireLogin(app) {
    setPendingApp(app);
    setView("login");
  }

  function handleGenericSignIn() {
    setPendingApp(null);
    setView("login");
  }

  function handleLoginSuccess() {
    if (pendingApp) {
      window.location.href = buildSSOUrl(pendingApp.origin);
    } else {
      setView("dashboard");
    }
  }

  if (!ready) return null;

  if (view === "login") {
    return (
      <LoginPage
        targetApp={pendingApp ? pendingApp.name : null}
        onSuccess={handleLoginSuccess}
        onBack={() => setView("dashboard")}
      />
    );
  }

  return (
    <div>
      <Header onSignInClick={handleGenericSignIn} />
      <DashboardHome onRequireLogin={handleRequireLogin} />
    </div>
  );
}

export default App;
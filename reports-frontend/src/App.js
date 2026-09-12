import React, { useEffect, useState } from "react";
import Topbar from "./components/Topbar";
import ReportsPage from "./components/ReportsPage";
import { initSessionFromURL, isLoggedIn } from "./auth";

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initSessionFromURL();
    setReady(true);
  }, []);

  function goToDashboard() {
    window.location.href = "http://localhost:3000";
  }

  if (!ready) return null;

  if (!isLoggedIn()) {
    // No session at all (e.g. user opened this port directly) — bounce to dashboard
    goToDashboard();
    return null;
  }

  return (
    <div>
      <Topbar onBackToDashboard={goToDashboard} />
      <ReportsPage />
    </div>
  );
}

export default App;
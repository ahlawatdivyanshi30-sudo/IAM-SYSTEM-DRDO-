import React, { useEffect, useState } from "react";
import Topbar from "./components/Topbar";
import InventoryPage from "./components/InventoryPage";
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
    goToDashboard();
    return null;
  }

  return (
    <div>
      <Topbar onBackToDashboard={goToDashboard} />
      <InventoryPage />
    </div>
  );
}

export default App;
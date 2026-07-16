import { useEffect, useState } from "react";
import { useGameStore } from "./store/useGameStore";
import HomeScreen from "./screens/HomeScreen";
import LobbyScreen from "./screens/LobbyScreen";
import GameScreen from "./screens/GameScreen";
import RoundSummaryScreen from "./screens/RoundSummaryScreen";
import FinalScreen from "./screens/FinalScreen";
import Header from "./components/Header";
import Toast from "./components/Toast";
import RulesModal from "./components/RulesModal";

export default function App() {
  const { init, code, view, connecting } = useGameStore();
  const [rulesOpen, setRulesOpen] = useState(false);

  useEffect(() => {
    init();
  }, []);

  if (!code) {
    return (
      <div className="app-shell">
        <HomeScreen onShowRules={() => setRulesOpen(true)} />
        <Toast />
        {rulesOpen && <RulesModal onClose={() => setRulesOpen(false)} />}
      </div>
    );
  }

  if (!view || connecting) {
    return (
      <div className="app-shell">
        <div className="screen" style={{ alignItems: "center", justifyContent: "center" }}>
          <div className="spinner" />
          <p className="muted">Verbinde mit Session...</p>
        </div>
        <Toast />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Header onShowRules={() => setRulesOpen(true)} />
      {view.status === "LOBBY" && <LobbyScreen />}
      {view.status === "IN_ROUND" && <GameScreen />}
      {view.status === "ROUND_SUMMARY" && <RoundSummaryScreen />}
      {view.status === "FINISHED" && <FinalScreen />}
      <Toast />
      {rulesOpen && <RulesModal onClose={() => setRulesOpen(false)} />}
    </div>
  );
}

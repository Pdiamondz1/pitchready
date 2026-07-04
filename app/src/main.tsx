import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { initObservability } from "./lib/observability";
import "./index.css";

// Graceful-off: no-op unless VITE_SENTRY_DSN is configured.
initObservability();

// Prevent unhandled promise rejections from killing the tab.
window.addEventListener("unhandledrejection", (event) => {
  console.error("[Global] Unhandled promise rejection:", event.reason);
  event.preventDefault();
});

const root = document.getElementById("root")!;
createRoot(root).render(<App />);

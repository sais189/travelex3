import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { preloader } from "./lib/preloader";
import { performanceMonitor } from "./lib/performance";

// Initialize performance monitoring
performanceMonitor.init();

// Initialize critical resource preloading
preloader.preloadCriticalResources().catch(console.warn);

createRoot(document.getElementById("root")!).render(<App />);

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App"; // <--- Removida a extensão .tsx
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
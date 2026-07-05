import "./styles/fonts.css";
import "./styles/theme.css";
import "./styles/tailwind.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import { LanguageProvider } from "./app/contexts/LanguageContext";
import { ThemeProvider } from "./app/contexts/ThemeContext";
import { AudioProvider } from "./app/contexts/AudioContext";
import { AnimationProvider } from "./app/contexts/AnimationContext";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LanguageProvider>
      <ThemeProvider>
        <AudioProvider>
          <AnimationProvider>
            <App />
          </AnimationProvider>
        </AudioProvider>
      </ThemeProvider>
    </LanguageProvider>
  </React.StrictMode>
);
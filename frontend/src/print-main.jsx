import { createRoot } from "react-dom/client";
import "./styles.css";
import { PrintApp } from "./components/print-app.jsx";

const el = document.getElementById("root");
createRoot(el).render(<PrintApp />);

// Wait for fonts + a beat for layout, then print.
const triggerPrint = () => {
  setTimeout(() => {
    if (window.__SKIP_AUTOPRINT__) return;
    window.print();
  }, 800);
};
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(triggerPrint);
} else {
  triggerPrint();
}

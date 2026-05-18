import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import "./styles.css";

// Apply persisted theme before React renders to avoid flash
const savedTheme = localStorage.getItem("ff.theme");
if (savedTheme === "dark") {
  document.documentElement.classList.add("dark");
}

const router = getRouter();

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<RouterProvider router={router} />);
}

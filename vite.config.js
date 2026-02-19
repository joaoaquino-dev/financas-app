import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Change 'financas-pessoais' to your actual GitHub repo name
  base: "/financas-app/",
});

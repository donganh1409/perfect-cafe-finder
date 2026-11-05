import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// GitHub Pages serves the site from /perfect-cafe-finder/ out of the docs folder on main.
export default defineConfig({
  base: "/perfect-cafe-finder/",
  server: { host: "::", port: 8080 },
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: {
    outDir: "docs", emptyOutDir: true,
    rollupOptions: { output: { manualChunks: id => (id.includes("node_modules/leaflet") ? "leaflet" : id.includes("src/data/cafes.json") ? "cafes" : id.includes("node_modules") ? "vendor" : undefined) } },
  },
});

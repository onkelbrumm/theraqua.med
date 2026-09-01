import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// GitHub Pages liefert das Projekt unter /theraqua.med/ aus (kein Custom
// Domain), daher braucht der Produktions-Build diesen Unterpfad als Basis.
// Der lokale Dev-Server bleibt auf "/", sonst müsste man immer
// localhost:5180/theraqua.med/ statt localhost:5180/ aufrufen.
// Hinweis: "vite preview" hat denselben command ("serve") wie "vite dev" -
// nur der Modus unterscheidet sich (production vs. development), daher wird
// hier nach mode statt command verzweigt.
export default defineConfig(({ mode }) => ({
  base: mode === 'development' ? '/' : '/theraqua.med/',
  plugins: [react()],
}))

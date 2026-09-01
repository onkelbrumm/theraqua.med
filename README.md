# WP + React Template

Vorlage für Projekte mit WordPress-Backend (gehostet auf Mittwald) und React-Frontend
(gehostet auf GitHub Pages), verbunden über die WordPress REST API.

**Live-Beispiel dieser Vorlage:**
- Frontend: https://react.albuera.de (React, Vite, GitHub Pages)
- Backend: https://wp.albuera.de (WordPress, Mittwald)

## Architektur

```
Browser
  │
  ▼
React-App (GitHub Pages)  ──── REST API (fetch) ────▶  WordPress (Mittwald)
  │                                                        │
  └── Custom Domain via CNAME                              └── wp-content/mu-plugins/cors-config.php
      (z. B. react.kundendomain.de)                            erlaubt die Frontend-Domain per CORS
```

Das Frontend ist rein statisch (HTML/CSS/JS), das Backend liefert Inhalte über
`wp-json/wp/v2/...` aus. Beide Teile sind unabhängig voneinander hostbar.

## Neues Projekt aus dieser Vorlage erstellen

### 1. Repo erstellen
Auf GitHub bei diesem Repo auf **"Use this template"** klicken → neues Repo für das
Kundenprojekt anlegen (privat).

### 2. WordPress auf Mittwald aufsetzen
- Neue WordPress-Installation anlegen (Subdomain z. B. `wp.kundendomain.de`)
- Benötigte Plugins installieren, je nach Bedarf:
  - Core-REST-API ist immer aktiv, kein Plugin nötig
  - **Sticklight Connector** – falls strukturierter Nutzerkontext gebraucht wird
  - **Advanced Custom Fields** + **ACF to REST API** – falls Custom Fields über die API raus sollen
  - **Custom Post Type UI** – falls eigene Post-Types gebraucht werden ("Show in REST" aktivieren)

### 3. CORS einrichten
- `cors-config.php` (liegt in diesem Repo unter `/wp-plugin/`) nach
  `wp-content/mu-plugins/cors-config.php` auf dem Server hochladen
  (Datei muss **direkt** in `mu-plugins` liegen, kein Unterordner)
- In der Datei bei `wp_rest_cors_allowed_origins()` die neue Frontend-Domain eintragen,
  z. B. `https://react.kundendomain.de`

### 4. React-Projekt lokal einrichten
```bash
npm install
```
`.env`-Datei im Projekt-Hauptordner anlegen (wird nicht mit committed):
```
VITE_API_URL=https://wp.kundendomain.de
```
Lokal testen:
```bash
npm run dev
```
→ `http://localhost:5173` – dafür auch `http://localhost:5173` in der CORS-Datei
als erlaubte Origin eintragen (ist in der Vorlage schon vorbereitet).

### 5. GitHub-Repository-Variable setzen
Da `.env` nicht im Repo liegt, kennt der Build-Server die API-URL sonst nicht:
Repo → **Settings → Secrets and variables → Actions → Tab "Variables"** →
**New repository variable** → Name `VITE_API_URL`, Wert `https://wp.kundendomain.de`

### 6. DNS einrichten
Bei Subdomain (empfohlen für Kundenprojekte, z. B. `react.kundendomain.de`):
```
Typ:   CNAME
Host:  react (oder gewünschter Subdomain-Name)
Ziel:  <dein-github-username>.github.io
```
Bei Root-/Apex-Domain stattdessen vier A-Records auf:
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

### 7. GitHub Pages konfigurieren
- Repo → **Settings → Pages** → Source: **"GitHub Actions"**
- Feld "Custom domain" → neue Domain eintragen → Speichern
- Nach erfolgreicher Verifizierung: **"Enforce HTTPS"** aktivieren

### 8. Deployen
```bash
git add .
git commit -m "Initial commit"
git push -u origin main
```
Der Workflow (`.github/workflows/deploy.yml`) baut und veröffentlicht automatisch bei
jedem Push auf `main`. Fortschritt im **Actions**-Tab des Repos verfolgen.

## Lokale Entwicklung

```bash
npm run dev      # Dev-Server mit Hot Reload
npm run build    # Produktions-Build nach /dist
npm run preview  # Build lokal testen
```

## Troubleshooting

| Problem | Lösung |
|---|---|
| `.env` oder `.github`-Ordner "existiert nicht" | Dateien/Ordner mit `.` am Anfang sind im Finder/Explorer standardmäßig versteckt. Prüfen mit `ls -a` (Mac/Linux) bzw. `Get-ChildItem -Force` (Windows). |
| `git push` fragt nach Passwort, das nicht angenommen wird | GitHub akzeptiert seit 2021 keine normalen Passwörter mehr für Git über HTTPS. Personal Access Token erstellen (Settings → Developer settings → Personal access tokens) und als Passwort einfügen. |
| CORS-Fehler im Browser | Domain fehlt in `wp_rest_cors_allowed_origins()` in `cors-config.php`, oder die Datei liegt nicht direkt in `wp-content/mu-plugins/`. |
| `VITE_API_URL` im Build nicht verfügbar | Unter **Settings → Secrets and variables → Actions → Variables** (nicht "Environments") gesetzt? Der Build-Job hat kein `environment:` zugewiesen. |
| Doppelte `function App` / Syntax-Fehler in `App.jsx` | Kompletten alten Vite-Beispielcode löschen, bevor neuer Code eingefügt wird – nicht anhängen. |
| MU-Plugin wird nicht geladen | Datei muss direkt in `wp-content/mu-plugins/` liegen, kein Unterordner (anders als bei normalen Plugins). |

## Kosten-Übersicht dieser Vorlage

- GitHub Pro: 4 $/Monat (für private Repos mit GitHub Pages)
- Mittwald-Hosting: je nach Tarif
- Domain: je nach Registrar

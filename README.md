# tipprunde-spa

Single-Page-App der Tipprunde (Fußball-Tippseite) mit Angular. Zweiter Touchpoint neben der MPA (`tipprunde-web`).
Die SPA spricht ausschließlich mit dem GraphQL-Service (`tipprunde-graphql`), der Vertrag steht dort in
`src/main/resources/graphql/schema.graphqls`.

## Ansichten

| Route | Ansicht | Anmeldung |
|---|---|---|
| `/login` | Anmelden, danach Rücksprung über `?returnUrl=` | nein |
| `/groups` | Meine Tippgruppen | ja |
| `/join/:code` | Einladungsvorschau und Beitritt | Vorschau nein, Beitritt ja |
| `/groups/:id/matchday` | Spieltag mit Tippen | ja |
| `/groups/:id/ranking` | Rangliste | ja |
| `/groups/:id/info` | Gruppe mit Mitgliedern und Einladungslink | ja |

Alle Ansichten werden erst beim Aufruf geladen; beim Wechsel lädt die Seite nie neu.

## Aufbau

```
src/
  environments/          GraphQL-URL lokal (environment.development.ts) und live (environment.ts)
  app/
    core/                GraphqlService, AuthService (sessionStorage), Interceptor, Guard, Typen, Fehlermeldungen
    pages/               eine Standalone-Komponente pro Ansicht
    app.routes.ts        alle Routen
  styles.css             Design-Tokens wie in der MPA
public/                  Logo, Favicon, Schriften (lokal, ohne Google Fonts)
```

## Lokal starten (Windows)

Voraussetzung: Node.js 24 (LTS). Core-Service (Port 8080) und GraphQL-Service (Port 8081) laufen lokal.

```
npm install
npx ng serve
```

Danach http://localhost:4200 öffnen. Die SPA nutzt lokal automatisch `http://localhost:8081/graphql`.

### Wie live testen

```
npm run build
node server.js
```

Danach http://localhost:4000 öffnen. `server.js` liefert den Produktions-Build aus, genau wie auf Heroku
(dabei gilt die Live-GraphQL-URL aus `environment.ts`).

## Deployment (Heroku)

| Datei | Zweck |
|---|---|
| `server.js` | Express liefert `dist/tipprunde-spa/browser` aus; unbekannte Pfade bekommen `index.html`, damit Links wie `/join/ABC123` direkt funktionieren |
| `Procfile` | `web: node server.js` |
| `package.json` | `engines` legt Node 24 fest, `express` steht unter `dependencies` |

Heroku installiert die Pakete, führt `npm run build` aus und startet danach das Procfile. Automatic Deploys von `main`
mit „Wait for CI to pass“, wie beim Core-Service. Die Live-URL des GraphQL-Service steht in
`src/environments/environment.ts`; der GraphQL-Service muss die SPA-URL in seinen erlaubten CORS-Origins haben.

## Anmeldung

Nach dem Login speichert der `AuthService` Token, Ablaufzeit, Benutzer-ID und Benutzername im `sessionStorage` des Tabs.
Der Interceptor hängt das Token als `Authorization: Bearer …` an jede Anfrage. Antwortet der Service mit `UNAUTHORIZED`,
wird die Sitzung gelöscht und die Ansicht leitet zum Login.

## Arbeitsweise

- Eigener Branch pro Aufgabe, Änderungen nur über Pull Requests mit Review.
- Commit-Messages auf Deutsch im Format `feat(bereich): kurze Beschreibung`.
- Keine Zugangsdaten im Repo.

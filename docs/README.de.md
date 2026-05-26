# Terminal Grid

[English](../README.md) | [한국어](./README.ko.md) | [中文](./README.zh-CN.md) | [日本語](./README.ja.md) | [Português (Brasil)](./README.pt-BR.md) | [Español](./README.es.md) | [Français](./README.fr.md) | [Deutsch](./README.de.md)

<p align="center">
  <img src="https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/icon.png" width="128" alt="Terminal Grid">
</p>

> Führen Sie Claude Code, Codex und Ihren Dev-Server nebeneinander aus — in einem einzigen VS Code Tab.

![MCP Demo](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-mcp.gif)

<p align="center"><em>Keine Konfiguration. Sagen Sie Ihrer KI einfach, was sie ausführen soll.</em></p>

## Warum Terminal Grid?

Das integrierte Terminal von VS Code kann Panels teilen, aber das hier nicht:

- **KI steuert Ihre Terminals** — Claude Code oder Codex führen Befehle in jeder Zelle aus und lesen die Ausgabe via MCP
- **Ein Befehl, mehrere Terminals** — „Starte den Server in Zelle 2, Tests in Zelle 3 und überwache Logs in Zelle 4"
- **4×5 Raster-Layout** — 20 Terminals in einem Tab, Zellgrenzen ziehen zum Resize wie in Excel
- **Zusammenführen, Broadcast, Vorlagen** — Zellen kombinieren, an alle senden, Konfigurationen pro Projekt speichern

![Terminal Grid Screenshot](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/screenshot.png)

## MCP-Integration — KI-gesteuerte Terminal-Kontrolle

Terminal Grid enthält einen integrierten [MCP (Model Context Protocol)](https://modelcontextprotocol.io/)-Server. KI-Agenten können Ihr Raster sehen, Befehle in jeder Zelle ausführen und die Ausgabe lesen — alles in natürlicher Sprache.

**Ein Prompt, drei Terminals gleichzeitig:**

> "Führe ls in Zelle 2 aus, zeige git log in Zelle 3 und starte git status in Zelle 4"

Die KI ruft `get_grid_info` auf, um das Layout zu erkennen, dann `send_to_cell` für jedes Ziel — Befehle werden gleichzeitig im gesamten Raster ausgeführt.

### Einrichtung

Keine Konfiguration erforderlich — der MCP-Server registriert sich automatisch bei Aktivierung der Erweiterung. Installieren Sie einfach Terminal Grid und Ihr MCP-Client (Claude Code, etc.) erkennt es automatisch.

### MCP-Werkzeuge

| Werkzeug | Beschreibung |
|----------|-------------|
| `get_grid_info` | Rasterabmessungen, Zellenanzahl und Labels abrufen |
| `send_to_cell` | Text/Befehle an eine Zelle senden |
| `read_cell` | Terminal-Ausgabe einer Zelle lesen |
| `broadcast` | An alle Zellen senden |

### LLM CLI-Unterstützung

Führen Sie LLM-CLI-Tools (Claude Code, Codex, etc.) direkt in Rasterzellen aus. Terminal Grid erkennt automatisch LLM-TUI-Anwendungen und sendet die richtigen Tastatursequenzen (CSI u / Kitty-Tastaturprotokoll) — Enter, Tab und Pfeiltasten funktionieren einfach.

## Funktionen

### Raster-Layout

Bis zu 4x5 (20) Terminals in einem anpassbaren Raster. Ziehen Sie Zellgrenzen zum Ändern der Größe — wie in Excel.

![Grid Layout](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-grid-open.gif)

### Zellen-Zusammenführung

Führen Sie benachbarte Zellen zu einem größeren Terminal zusammen. Wählen Sie Zellen in der Rastervorschau in der Seitenleiste, klicken Sie auf Merge und öffnen Sie das Raster — der zusammengeführte Bereich wird zu einem großen Panel. Nützlich, um dem Hauptterminal mehr Platz zu geben, während kleine Zellen zur Überwachung erhalten bleiben.

### Startbefehle & Vorlagen

Befehle beim Erstellen der Terminals automatisch ausführen. Gesamte Rasterkonfigurationen (Größe, zusammengeführte Bereiche, Farben, Befehle) als Vorlagen speichern — mit automatischem Laden pro Projekt.

![Startup Commands](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-startup-commands.gif)

### Zell-Anpassung

Individuelle Hintergrundfarbe, Textfarbe und Schrift pro Zelle. Auf alle Zellen gleichzeitig anwenden oder einzeln anpassen.

![Cell Customization](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-cell-customize.gif)

### Broadcast

Befehle an alle Terminals oder ausgewählte Zellen gleichzeitig senden.

![Broadcast](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-broadcast.gif)

### Weitere Funktionen

- **Codex CLI-Unterstützung** — Automatische Registrierung in `~/.codex/config.toml` bei Aktivierung
- **Zell-Labels** — Jedes Terminal benennen
- **Kontextmenü** — Rechtsklick zum Einfügen, Löschen, Neustarten, Beenden oder Umbenennen
- **Themes** — 8 integrierte Farbthemen
- **Benutzerdefinierte Schriften** — .ttf/.otf/.woff/.woff2-Dateien laden
- **Projektordner** — Ordner in der Seitenleiste registrieren. Klicken zum Wechseln, Strg+Klick zum Öffnen in neuem Fenster
- **Remote-SSH-kompatibel** — Funktioniert sofort
- **Einklappbare Seitenleiste** — Alle Abschnitte einklappbar, Zustand gespeichert

## Schnellstart

1. Erweiterung installieren
2. `Ctrl+Shift+P` → **Terminal Grid: Open Grid**
3. Ein Terminal-Raster erscheint im Editor-Bereich

## Befehle

| Befehl | Beschreibung |
|--------|-------------|
| `Terminal Grid: Open Grid` | Raster mit Standardgröße öffnen |
| `Terminal Grid: Open 2x2` | 2x2-Raster öffnen |
| `Terminal Grid: Open 2x3` | 2x3-Raster öffnen |
| `Terminal Grid: Open 3x3` | 3x3-Raster öffnen |
| `Terminal Grid: Open Custom Grid` | Raster mit benutzerdefinierten Abmessungen öffnen |

## Einstellungen

| Einstellung | Standard | Beschreibung |
|-------------|----------|-------------|
| `terminalGrid.defaultRows` | `2` | Standard-Zeilenanzahl (1-4) |
| `terminalGrid.defaultCols` | `3` | Standard-Spaltenanzahl (1-5) |
| `terminalGrid.zoomPercent` | `100` | Globaler Schrift-Zoom (50-300%) |
| `terminalGrid.fontFamily` | `""` | Schrift-Überschreibung (leer = IDE-Theme) |
| `terminalGrid.backgroundColor` | `""` | Hintergrundfarbe (leer = IDE-Theme) |
| `terminalGrid.foregroundColor` | `""` | Textfarbe (leer = IDE-Theme) |
| `terminalGrid.apiPort` | `7890` | MCP HTTP-Bridge-Port (0 = deaktiviert) |

## Agent API

Erweiterungen können Terminal Grid programmatisch über VS Code-Befehle steuern:

```typescript
// Raster-Informationen abrufen
const info = await vscode.commands.executeCommand('terminalGrid.getGridInfo');

// Befehl an Zelle 0 senden
await vscode.commands.executeCommand('terminalGrid.sendToCell', 0, 'echo hello\r');

// Ausgabe von Zelle 0 lesen (letzte 10 Zeilen)
const output = await vscode.commands.executeCommand('terminalGrid.readCell', 0, 10);
```

## Sicherheit

Die MCP-Brücke lauscht nur auf `127.0.0.1` (Standardport `7890`, konfigurierbar über `terminalGrid.apiPort`). Remote-Verbindungen werden nicht akzeptiert.

Wenn Sie den MCP-Server in Claude Desktop registrieren, wird ein `terminal-grid`-Eintrag geschrieben, der auf das gebündelte `mcp-server.js` zeigt. Führen Sie vor der Deinstallation **Terminal Grid: MCP von Claude Desktop abmelden** aus, um sauber aufzuräumen. Veraltete Registrierungen (das referenzierte Skript existiert nicht mehr) werden beim nächsten Laden der Erweiterung automatisch entfernt.

## Voraussetzungen

- VS Code 1.80.0+

## Lizenz

[MIT](../LICENSE)

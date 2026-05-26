# Terminal Grid

[English](../README.md) | [한국어](./README.ko.md) | [中文](./README.zh-CN.md) | [日本語](./README.ja.md) | [Português (Brasil)](./README.pt-BR.md) | [Español](./README.es.md) | [Français](./README.fr.md) | [Deutsch](./README.de.md)

<p align="center">
  <img src="https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/icon.png" width="128" alt="Terminal Grid">
</p>

> Ejecuta Claude Code, Codex y tu servidor de desarrollo lado a lado — en una sola pestaña de VS Code.

![MCP Demo](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-mcp.gif)

<p align="center"><em>Sin configuración. Solo dile a tu IA qué ejecutar.</em></p>

## ¿Por qué Terminal Grid?

El terminal integrado de VS Code divide paneles, pero no puede hacer esto:

- **La IA controla tus terminales** — Claude Code o Codex ejecutan comandos en cualquier celda y leen la salida vía MCP
- **Un comando, múltiples terminales** — "Inicia el servidor en la celda 2, tests en la celda 3 y monitorea logs en la celda 4"
- **Layout de cuadrícula 4×5** — 20 terminales en una pestaña, arrastra bordes para redimensionar como en Excel
- **Fusionar, transmitir, preset** — combina celdas, envía a todas a la vez, guarda configuraciones por proyecto

![Terminal Grid Screenshot](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/screenshot.png)

## Integración MCP — Control de Terminal por IA

Terminal Grid incluye un servidor [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) integrado. Agentes de IA pueden ver tu grid, ejecutar comandos en cualquier celda y leer la salida — todo mediante lenguaje natural.

**Un prompt, tres terminales a la vez:**

> "Ejecuta ls en la celda 2, muestra git log en la celda 3 y ejecuta git status en la celda 4"

La IA llama a `get_grid_info` para descubrir el diseño, luego `send_to_cell` para cada objetivo — los comandos se ejecutan simultáneamente en todo el grid.

### Configuración

No se necesita configuración — el servidor MCP se registra automáticamente cuando se activa la extensión. Solo instala Terminal Grid y tu cliente MCP (Claude Code, etc.) lo descubrirá automáticamente.

### Herramientas MCP

| Herramienta | Descripción |
|-------------|-------------|
| `get_grid_info` | Obtener dimensiones, cantidad de celdas y etiquetas |
| `send_to_cell` | Enviar texto/comandos a una celda |
| `read_cell` | Leer salida del terminal de una celda |
| `broadcast` | Enviar a todas las celdas |

### Soporte LLM CLI

Ejecuta herramientas LLM CLI (Claude Code, Codex, etc.) directamente en las celdas del grid. Terminal Grid detecta automáticamente las aplicaciones LLM TUI y envía las secuencias de teclas correctas (CSI u / protocolo de teclado Kitty) — Enter, Tab y flechas funcionan directamente.

## Características

### Diseño en Cuadrícula

Abre hasta 4x5 (20) terminales en una cuadrícula personalizable. Arrastra los bordes de las celdas para redimensionar — como en Excel.

![Grid Layout](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-grid-open.gif)

### Fusión de Celdas

Fusiona celdas adyacentes en un único terminal más grande. Selecciona celdas en la vista previa del grid en la barra lateral, haz clic en Merge y abre el grid — la región fusionada se convierte en un panel grande. Útil para dar más espacio al terminal principal mientras mantienes celdas pequeñas para monitoreo.

### Comandos de Inicio & Presets

Ejecuta comandos automáticamente al crear terminales. Guarda configuraciones completas de la cuadrícula (tamaño, regiones fusionadas, colores, comandos) como presets — con carga automática por proyecto.

![Startup Commands](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-startup-commands.gif)

### Personalización por Celda

Color de fondo, color de texto y fuente individual por celda. Aplica a todas las celdas a la vez o personaliza cada una.

![Cell Customization](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-cell-customize.gif)

### Broadcast

Envía comandos a todos los terminales o celdas seleccionadas a la vez.

![Broadcast](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-broadcast.gif)

### Más Funciones

- **Soporte Codex CLI** — Se auto-registra en `~/.codex/config.toml` al activarse
- **Etiquetas de Celda** — Nombra cada terminal
- **Menú Contextual** — Clic derecho para pegar, limpiar, reiniciar, terminar o renombrar
- **Temas** — 8 temas de colores integrados
- **Fuentes Personalizadas** — Carga archivos .ttf/.otf/.woff/.woff2
- **Carpetas de Proyecto** — Registra carpetas en la barra lateral. Clic para cambiar, Ctrl+Clic para abrir en nueva ventana
- **Compatible con Remote-SSH** — Funciona de forma nativa
- **Panel Lateral Plegable** — Todas las secciones se pliegan, estado persistido

## Inicio Rápido

1. Instala la extensión
2. `Ctrl+Shift+P` → **Terminal Grid: Open Grid**
3. Aparece una cuadrícula de terminales en el área del editor

## Comandos

| Comando | Descripción |
|---------|-------------|
| `Terminal Grid: Open Grid` | Abrir cuadrícula con tamaño predeterminado |
| `Terminal Grid: Open 2x2` | Abrir cuadrícula 2x2 |
| `Terminal Grid: Open 2x3` | Abrir cuadrícula 2x3 |
| `Terminal Grid: Open 3x3` | Abrir cuadrícula 3x3 |
| `Terminal Grid: Open Custom Grid` | Abrir cuadrícula con dimensiones personalizadas |

## Configuración

| Configuración | Predeterminado | Descripción |
|---------------|----------------|-------------|
| `terminalGrid.defaultRows` | `2` | Filas predeterminadas (1-4) |
| `terminalGrid.defaultCols` | `3` | Columnas predeterminadas (1-5) |
| `terminalGrid.zoomPercent` | `100` | Zoom global de fuente (50-300%) |
| `terminalGrid.fontFamily` | `""` | Fuente personalizada (vacío = tema IDE) |
| `terminalGrid.backgroundColor` | `""` | Color de fondo (vacío = tema IDE) |
| `terminalGrid.foregroundColor` | `""` | Color de texto (vacío = tema IDE) |
| `terminalGrid.apiPort` | `7890` | Puerto HTTP del bridge MCP (0 = desactivado) |

## Agent API

Las extensiones pueden controlar Terminal Grid programáticamente vía comandos VS Code:

```typescript
// Obtener información de la cuadrícula
const info = await vscode.commands.executeCommand('terminalGrid.getGridInfo');

// Enviar comando a la celda 0
await vscode.commands.executeCommand('terminalGrid.sendToCell', 0, 'echo hello\r');

// Leer salida de la celda 0 (últimas 10 líneas)
const output = await vscode.commands.executeCommand('terminalGrid.readCell', 0, 10);
```

## Seguridad

El puente MCP escucha solo en `127.0.0.1` (puerto por defecto `7890`, configurable mediante `terminalGrid.apiPort`). No acepta conexiones remotas.

Cuando registras el servidor MCP en Claude Desktop, se escribe una entrada `terminal-grid` que apunta al `mcp-server.js` incluido. Ejecuta **Terminal Grid: Cancelar registro MCP en Claude Desktop** antes de desinstalar para limpiar. Las registraciones obsoletas (cuyo script ya no existe) se eliminan automáticamente al cargar la extensión.

## Requisitos

- VS Code 1.80.0+

## Licencia

[MIT](../LICENSE)

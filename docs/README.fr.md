# Terminal Grid

[English](../README.md) | [한국어](./README.ko.md) | [中文](./README.zh-CN.md) | [日本語](./README.ja.md) | [Português (Brasil)](./README.pt-BR.md) | [Español](./README.es.md) | [Français](./README.fr.md) | [Deutsch](./README.de.md)

<p align="center">
  <img src="https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/icon.png" width="128" alt="Terminal Grid">
</p>

> Exécutez Claude Code, Codex et votre serveur de développement côte à côte — dans un seul onglet VS Code.

![MCP Demo](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-mcp.gif)

<p align="center"><em>Zéro configuration. Dites simplement à votre IA quoi exécuter.</em></p>

## Pourquoi Terminal Grid ?

Le terminal intégré de VS Code permet de diviser les panneaux, mais il ne peut pas faire ceci :

- **L'IA contrôle vos terminaux** — Claude Code ou Codex exécutent des commandes dans n'importe quelle cellule et lisent la sortie via MCP
- **Une commande, plusieurs terminaux** — « Lance le serveur dans la cellule 2, les tests dans la cellule 3 et surveille les logs dans la cellule 4 »
- **Grille jusqu'à 4×5** — 20 terminaux dans un onglet, glissez les bordures pour redimensionner comme dans Excel
- **Fusion, diffusion, préréglages** — combinez des cellules, envoyez à toutes en une fois, sauvegardez les configs par projet

![Terminal Grid Screenshot](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/screenshot.png)

## Intégration MCP — Contrôle de Terminal par IA

Terminal Grid inclut un serveur [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) intégré. Les agents IA peuvent voir votre grille, exécuter des commandes dans n'importe quelle cellule et lire la sortie — le tout en langage naturel.

**Un prompt, trois terminaux à la fois :**

> "Exécute ls dans la cellule 2, affiche git log dans la cellule 3 et lance git status dans la cellule 4"

L'IA appelle `get_grid_info` pour découvrir la disposition, puis `send_to_cell` pour chaque cible — les commandes s'exécutent simultanément dans toute la grille.

### Configuration

Aucune configuration nécessaire — le serveur MCP s'enregistre automatiquement à l'activation de l'extension. Installez simplement Terminal Grid et votre client MCP (Claude Code, etc.) le découvrira automatiquement.

### Outils MCP

| Outil | Description |
|-------|-------------|
| `get_grid_info` | Obtenir dimensions, nombre de cellules et labels |
| `send_to_cell` | Envoyer du texte/des commandes à une cellule |
| `read_cell` | Lire la sortie du terminal d'une cellule |
| `broadcast` | Envoyer à toutes les cellules |

### Support LLM CLI

Exécutez des outils LLM CLI (Claude Code, Codex, etc.) directement dans les cellules de la grille. Terminal Grid détecte automatiquement les applications LLM TUI et envoie les séquences de touches correctes (CSI u / protocole clavier Kitty) — Enter, Tab et flèches fonctionnent nativement.

## Fonctionnalités

### Disposition en Grille

Ouvrez jusqu'à 4x5 (20) terminaux dans une grille personnalisable. Glissez les bordures des cellules pour redimensionner — comme dans Excel.

![Grid Layout](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-grid-open.gif)

### Fusion de Cellules

Fusionnez des cellules adjacentes en un seul terminal plus grand. Sélectionnez les cellules dans l'aperçu de la grille dans la barre latérale, cliquez sur Merge et ouvrez la grille — la région fusionnée devient un grand panneau. Utile pour donner plus d'espace au terminal principal tout en gardant de petites cellules pour la surveillance.

### Commandes de Démarrage & Préréglages

Exécutez automatiquement des commandes à la création des terminaux. Sauvegardez les configurations de grille complètes (taille, régions fusionnées, couleurs, commandes) en préréglages — avec chargement automatique par projet.

![Startup Commands](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-startup-commands.gif)

### Personnalisation par Cellule

Couleur de fond, couleur de texte et police individuelles par cellule. Appliquez à toutes les cellules ou personnalisez chacune.

![Cell Customization](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-cell-customize.gif)

### Diffusion

Envoyez des commandes à tous les terminaux ou aux cellules sélectionnées.

![Broadcast](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-broadcast.gif)

### Autres Fonctionnalités

- **Support Codex CLI** — Auto-enregistré dans `~/.codex/config.toml` à l'activation
- **Labels de Cellule** — Nommez chaque terminal
- **Menu Contextuel** — Clic droit pour coller, effacer, redémarrer, terminer ou renommer
- **Thèmes** — 8 thèmes de couleurs intégrés
- **Polices Personnalisées** — Chargez des fichiers .ttf/.otf/.woff/.woff2
- **Dossiers de Projet** — Enregistrez des dossiers dans la barre latérale. Cliquez pour basculer, Ctrl+Clic pour ouvrir dans une nouvelle fenêtre
- **Compatible Remote-SSH** — Fonctionne nativement
- **Panneau Latéral Repliable** — Toutes les sections se replient, état persisté

## Démarrage Rapide

1. Installez l'extension
2. `Ctrl+Shift+P` → **Terminal Grid: Open Grid**
3. Une grille de terminaux apparaît dans la zone de l'éditeur

## Commandes

| Commande | Description |
|----------|-------------|
| `Terminal Grid: Open Grid` | Ouvrir la grille avec la taille par défaut |
| `Terminal Grid: Open 2x2` | Ouvrir une grille 2x2 |
| `Terminal Grid: Open 2x3` | Ouvrir une grille 2x3 |
| `Terminal Grid: Open 3x3` | Ouvrir une grille 3x3 |
| `Terminal Grid: Open Custom Grid` | Ouvrir une grille aux dimensions personnalisées |

## Paramètres

| Paramètre | Par défaut | Description |
|-----------|------------|-------------|
| `terminalGrid.defaultRows` | `2` | Nombre de lignes par défaut (1-4) |
| `terminalGrid.defaultCols` | `3` | Nombre de colonnes par défaut (1-5) |
| `terminalGrid.zoomPercent` | `100` | Zoom global de police (50-300%) |
| `terminalGrid.fontFamily` | `""` | Police personnalisée (vide = thème IDE) |
| `terminalGrid.backgroundColor` | `""` | Couleur de fond (vide = thème IDE) |
| `terminalGrid.foregroundColor` | `""` | Couleur de texte (vide = thème IDE) |
| `terminalGrid.apiPort` | `7890` | Port HTTP du bridge MCP (0 = désactivé) |

## Agent API

Les extensions peuvent contrôler Terminal Grid programmatiquement via les commandes VS Code :

```typescript
// Obtenir les informations de la grille
const info = await vscode.commands.executeCommand('terminalGrid.getGridInfo');

// Envoyer une commande à la cellule 0
await vscode.commands.executeCommand('terminalGrid.sendToCell', 0, 'echo hello\r');

// Lire la sortie de la cellule 0 (10 dernières lignes)
const output = await vscode.commands.executeCommand('terminalGrid.readCell', 0, 10);
```

## Sécurité

Le pont MCP n écoute que sur `127.0.0.1` (port par défaut `7890`, configurable via `terminalGrid.apiPort`). Il n accepte pas les connexions distantes.

Lorsque vous enregistrez le serveur MCP dans Claude Desktop, une entrée `terminal-grid` pointant vers le `mcp-server.js` fourni est écrite. Exécutez **Terminal Grid: Désinscrire MCP de Claude Desktop** avant la désinstallation pour nettoyer. Les enregistrements obsolètes (script référencé inexistant) sont supprimés automatiquement au prochain chargement de l extension.

## Prérequis

- VS Code 1.80.0+

## Licence

[MIT](../LICENSE)

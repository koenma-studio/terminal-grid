# Terminal Grid

[English](../README.md) | [한국어](./README.ko.md) | [中文](./README.zh-CN.md) | [日本語](./README.ja.md) | [Português (Brasil)](./README.pt-BR.md) | [Español](./README.es.md) | [Français](./README.fr.md) | [Deutsch](./README.de.md)

<p align="center">
  <img src="https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/icon.png" width="128" alt="Terminal Grid">
</p>

> Execute Claude Code, Codex e seu servidor de desenvolvimento lado a lado — em uma única aba do VS Code.

![MCP Demo](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-mcp.gif)

<p align="center"><em>Zero configuração. Apenas diga à IA o que executar.</em></p>

## Por que Terminal Grid?

O terminal integrado do VS Code divide painéis, mas não faz isso:

- **IA controla seus terminais** — Claude Code ou Codex executam comandos em qualquer célula e leem a saída via MCP
- **Um comando, múltiplos terminais** — "Inicie o servidor na célula 2, testes na célula 3 e monitore logs na célula 4"
- **Layout em grade 4×5** — 20 terminais em uma aba, arraste bordas para redimensionar como no Excel
- **Mesclar, transmitir, preset** — combine células, envie para todas de uma vez, salve configurações por projeto

![Terminal Grid Screenshot](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/screenshot.png)

## Integração MCP — Controle de Terminal por IA

O Terminal Grid inclui um servidor [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) integrado. Agentes de IA podem visualizar o grid, executar comandos em qualquer célula e ler a saída — tudo por linguagem natural.

**Um prompt, três terminais de uma vez:**

> "Execute ls na célula 2, mostre git log na célula 3 e execute git status na célula 4"

A IA chama `get_grid_info` para descobrir o layout, depois `send_to_cell` para cada alvo — os comandos são executados simultaneamente em todo o grid.

### Configuração

Nenhuma configuração necessária — o servidor MCP se registra automaticamente quando a extensão é ativada. Basta instalar o Terminal Grid e seu cliente MCP (Claude Code, etc.) o descobrirá automaticamente.

### Ferramentas MCP

| Ferramenta | Descrição |
|------------|-----------|
| `get_grid_info` | Obter dimensões, contagem de células e rótulos |
| `send_to_cell` | Enviar texto/comandos para uma célula |
| `read_cell` | Ler saída do terminal de uma célula |
| `broadcast` | Enviar para todas as células |

### Suporte a LLM CLI

Execute ferramentas LLM CLI (Claude Code, Codex, etc.) diretamente nas células do grid. O Terminal Grid detecta automaticamente aplicativos LLM TUI e envia as sequências de teclas corretas (CSI u / protocolo de teclado Kitty) — Enter, Tab e setas funcionam normalmente.

## Funcionalidades

### Layout em Grade

Abra até 4x5 (20) terminais em uma grade personalizável. Arraste as bordas das células para redimensionar — como no Excel.

![Grid Layout](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-grid-open.gif)

### Mesclagem de Células

Mescle células adjacentes em um único terminal maior. Selecione células na visualização do grid na barra lateral, clique em Merge e abra o grid — a região mesclada se torna um painel grande. Útil para dar mais espaço ao terminal principal enquanto mantém células menores para monitoramento.

### Comandos de Inicialização & Presets

Execute comandos automaticamente ao criar terminais. Salve configurações completas da grade (tamanho, regiões mescladas, cores, comandos) como presets — com carregamento automático por projeto.

![Startup Commands](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-startup-commands.gif)

### Personalização por Célula

Cor de fundo, cor de texto e fonte individual por célula. Aplique a todas as células de uma vez ou personalize cada uma.

![Cell Customization](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-cell-customize.gif)

### Broadcast

Envie comandos para todos os terminais ou células selecionadas de uma vez.

![Broadcast](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-broadcast.gif)

### Mais Recursos

- **Suporte ao Codex CLI** — Auto-registra em `~/.codex/config.toml` na ativação
- **Rótulos de Célula** — Nomeie cada terminal
- **Menu de Contexto** — Clique direito para colar, limpar, reiniciar, encerrar ou renomear
- **Temas** — 8 temas de cores integrados
- **Fontes Personalizadas** — Carregue arquivos .ttf/.otf/.woff/.woff2
- **Pastas de Projeto** — Registre pastas na barra lateral. Clique para alternar, Ctrl+Clique para abrir em nova janela
- **Compatível com Remote-SSH** — Funciona nativamente
- **Painel Lateral Recolhível** — Todas as seções recolhem, estado persistido

## Início Rápido

1. Instale a extensão
2. `Ctrl+Shift+P` → **Terminal Grid: Open Grid**
3. Uma grade de terminais aparece na área do editor

## Comandos

| Comando | Descrição |
|---------|-----------|
| `Terminal Grid: Open Grid` | Abrir grade com tamanho padrão |
| `Terminal Grid: Open 2x2` | Abrir grade 2x2 |
| `Terminal Grid: Open 2x3` | Abrir grade 2x3 |
| `Terminal Grid: Open 3x3` | Abrir grade 3x3 |
| `Terminal Grid: Open Custom Grid` | Abrir grade com dimensões personalizadas |

## Configurações

| Configuração | Padrão | Descrição |
|--------------|--------|-----------|
| `terminalGrid.defaultRows` | `2` | Número padrão de linhas (1-4) |
| `terminalGrid.defaultCols` | `3` | Número padrão de colunas (1-5) |
| `terminalGrid.zoomPercent` | `100` | Zoom global da fonte (50-300%) |
| `terminalGrid.fontFamily` | `""` | Fonte personalizada (vazio = tema do IDE) |
| `terminalGrid.backgroundColor` | `""` | Cor de fundo (vazio = tema do IDE) |
| `terminalGrid.foregroundColor` | `""` | Cor de texto (vazio = tema do IDE) |
| `terminalGrid.apiPort` | `7890` | Porta HTTP do bridge MCP (0 = desativado) |

## Agent API

Extensões podem controlar o Terminal Grid programaticamente via comandos VS Code:

```typescript
// Obter informações da grade
const info = await vscode.commands.executeCommand('terminalGrid.getGridInfo');

// Enviar comando para a célula 0
await vscode.commands.executeCommand('terminalGrid.sendToCell', 0, 'echo hello\r');

// Ler saída da célula 0 (últimas 10 linhas)
const output = await vscode.commands.executeCommand('terminalGrid.readCell', 0, 10);
```

## Segurança

A ponte MCP escuta apenas em `127.0.0.1` (porta padrão `7890`, configurável via `terminalGrid.apiPort`). Não aceita conexões remotas.

Ao registrar o servidor MCP no Claude Desktop, uma entrada `terminal-grid` apontando para o `mcp-server.js` embutido é gravada. Execute **Terminal Grid: Cancelar registro MCP no Claude Desktop** antes de desinstalar para limpar. Registros obsoletos (cujo script referenciado não existe mais) são removidos automaticamente no próximo carregamento da extensão.

## Requisitos

- VS Code 1.80.0+

## Licença

[MIT](../LICENSE)

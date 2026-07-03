"use strict";var Ce=Object.create;var W=Object.defineProperty;var xe=Object.getOwnPropertyDescriptor;var Se=Object.getOwnPropertyNames;var _e=Object.getPrototypeOf,ke=Object.prototype.hasOwnProperty;var Te=(l,e)=>{for(var t in e)W(l,t,{get:e[t],enumerable:!0})},oe=(l,e,t,a)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of Se(e))!ke.call(l,n)&&n!==t&&W(l,n,{get:()=>e[n],enumerable:!(a=xe(e,n))||a.enumerable});return l};var I=(l,e,t)=>(t=l!=null?Ce(_e(l)):{},oe(e||!l||!l.__esModule?W(t,"default",{value:l,enumerable:!0}):t,l)),Ee=l=>oe(W({},"__esModule",{value:!0}),l);var Je={};Te(Je,{activate:()=>He,deactivate:()=>We});module.exports=Ee(Je);var m=I(require("vscode")),te=I(require("path")),O=I(require("fs")),he=I(require("os"));var o=I(require("vscode")),C=I(require("fs")),T=I(require("path")),z=I(require("os")),be=I(require("child_process"));var y=I(require("vscode")),J=I(require("os")),A=I(require("fs")),$=I(require("path"));var ie={"":null,Dracula:{name:"Dracula",background:"#282a36",foreground:"#f8f8f2",cursor:"#f8f8f2",cursorAccent:"#282a36",selectionBackground:"#44475a",black:"#21222c",brightBlack:"#6272a4",red:"#ff5555",brightRed:"#ff6e6e",green:"#50fa7b",brightGreen:"#69ff94",yellow:"#f1fa8c",brightYellow:"#ffffa5",blue:"#bd93f9",brightBlue:"#d6acff",magenta:"#ff79c6",brightMagenta:"#ff92df",cyan:"#8be9fd",brightCyan:"#a4ffff",white:"#f8f8f2",brightWhite:"#ffffff"},Monokai:{name:"Monokai",background:"#272822",foreground:"#f8f8f2",cursor:"#f8f8f0",cursorAccent:"#272822",selectionBackground:"#49483e",black:"#272822",brightBlack:"#75715e",red:"#f92672",brightRed:"#f92672",green:"#a6e22e",brightGreen:"#a6e22e",yellow:"#f4bf75",brightYellow:"#f4bf75",blue:"#66d9ef",brightBlue:"#66d9ef",magenta:"#ae81ff",brightMagenta:"#ae81ff",cyan:"#a1efe4",brightCyan:"#a1efe4",white:"#f8f8f2",brightWhite:"#f9f8f5"},"Solarized Dark":{name:"Solarized Dark",background:"#002b36",foreground:"#839496",cursor:"#839496",cursorAccent:"#002b36",selectionBackground:"#073642",black:"#073642",brightBlack:"#586e75",red:"#dc322f",brightRed:"#cb4b16",green:"#859900",brightGreen:"#586e75",yellow:"#b58900",brightYellow:"#657b83",blue:"#268bd2",brightBlue:"#839496",magenta:"#d33682",brightMagenta:"#6c71c4",cyan:"#2aa198",brightCyan:"#93a1a1",white:"#eee8d5",brightWhite:"#fdf6e3"},"Solarized Light":{name:"Solarized Light",background:"#fdf6e3",foreground:"#657b83",cursor:"#657b83",cursorAccent:"#fdf6e3",selectionBackground:"#eee8d5",black:"#073642",brightBlack:"#586e75",red:"#dc322f",brightRed:"#cb4b16",green:"#859900",brightGreen:"#586e75",yellow:"#b58900",brightYellow:"#657b83",blue:"#268bd2",brightBlue:"#839496",magenta:"#d33682",brightMagenta:"#6c71c4",cyan:"#2aa198",brightCyan:"#93a1a1",white:"#eee8d5",brightWhite:"#fdf6e3"},Nord:{name:"Nord",background:"#2e3440",foreground:"#d8dee9",cursor:"#d8dee9",cursorAccent:"#2e3440",selectionBackground:"#434c5e",black:"#3b4252",brightBlack:"#4c566a",red:"#bf616a",brightRed:"#bf616a",green:"#a3be8c",brightGreen:"#a3be8c",yellow:"#ebcb8b",brightYellow:"#ebcb8b",blue:"#81a1c1",brightBlue:"#81a1c1",magenta:"#b48ead",brightMagenta:"#b48ead",cyan:"#88c0d0",brightCyan:"#8fbcbb",white:"#e5e9f0",brightWhite:"#eceff4"},"One Dark":{name:"One Dark",background:"#282c34",foreground:"#abb2bf",cursor:"#528bff",cursorAccent:"#282c34",selectionBackground:"#3e4451",black:"#282c34",brightBlack:"#5c6370",red:"#e06c75",brightRed:"#e06c75",green:"#98c379",brightGreen:"#98c379",yellow:"#e5c07b",brightYellow:"#d19a66",blue:"#61afef",brightBlue:"#61afef",magenta:"#c678dd",brightMagenta:"#c678dd",cyan:"#56b6c2",brightCyan:"#56b6c2",white:"#abb2bf",brightWhite:"#ffffff"},"Gruvbox Dark":{name:"Gruvbox Dark",background:"#282828",foreground:"#ebdbb2",cursor:"#ebdbb2",cursorAccent:"#282828",selectionBackground:"#504945",black:"#282828",brightBlack:"#928374",red:"#cc241d",brightRed:"#fb4934",green:"#98971a",brightGreen:"#b8bb26",yellow:"#d79921",brightYellow:"#fabd2f",blue:"#458588",brightBlue:"#83a598",magenta:"#b16286",brightMagenta:"#d3869b",cyan:"#689d6a",brightCyan:"#8ec07c",white:"#a89984",brightWhite:"#ebdbb2"},"Tokyo Night":{name:"Tokyo Night",background:"#1a1b26",foreground:"#a9b1d6",cursor:"#c0caf5",cursorAccent:"#1a1b26",selectionBackground:"#33467c",black:"#15161e",brightBlack:"#414868",red:"#f7768e",brightRed:"#f7768e",green:"#9ece6a",brightGreen:"#9ece6a",yellow:"#e0af68",brightYellow:"#e0af68",blue:"#7aa2f7",brightBlue:"#7aa2f7",magenta:"#bb9af7",brightMagenta:"#bb9af7",cyan:"#7dcfff",brightCyan:"#7dcfff",white:"#a9b1d6",brightWhite:"#c0caf5"}},le=Object.keys(ie);function F(l){let e=ie[l];if(!e)return null;let{name:t,...a}=e;return a}var de=I(require("vscode")),V=class{constructor(){this._panels=new Map;this._onDidChange=new de.EventEmitter;this.onDidChange=this._onDidChange.event}register(e,t,a){if(a!==void 0&&a>=0&&a<=this._panels.size){let n=Array.from(this._panels.entries());n.splice(a,0,[e,t]),this._panels=new Map(n)}else this._panels.set(e,t);this._activeTabId=e,this._onDidChange.fire()}unregister(e,t){if(t!==void 0&&this._panels.get(e)!==t)return;let a=this._panels.delete(e);if(this._activeTabId===e){let n=Array.from(this._panels.keys());this._activeTabId=n.length>0?n[n.length-1]:void 0}a&&this._onDidChange.fire()}replace(e,t,a){let n=Array.from(this._panels.entries()),s=n.findIndex(([r])=>r===e);s>=0?n[s]=[t,a]:n.push([t,a]),this._panels=new Map(n),this._activeTabId=t,this._onDidChange.fire()}setActive(e){this._panels.has(e)&&this._activeTabId!==e&&(this._activeTabId=e,this._onDidChange.fire())}getActive(){return this._activeTabId!==void 0?this._panels.get(this._activeTabId):void 0}getActiveTabId(){return this._activeTabId}get(e){return this._panels.get(e)}has(e){return this._panels.has(e)}size(){return this._panels.size}all(){return Array.from(this._panels.values())}entries(){return Array.from(this._panels.entries())}disposeAll(){let e=Array.from(this._panels.values());for(let t of e)try{t.dispose()}catch{}this._panels.clear(),this._activeTabId=void 0}},w=new V,R=class l{static{this.KEY="nextTabId"}static next(e){let t=e.globalState.get(l.KEY,0);return e.globalState.update(l.KEY,t+1),t}static reserve(e,t){e.globalState.get(l.KEY,0)<=t&&e.globalState.update(l.KEY,t+1)}static peek(e){return e.globalState.get(l.KEY,0)}static reset(e){return e.globalState.update(l.KEY,0)}};var q=class{init(e){this._ctx=e}get ctx(){if(!this._ctx)throw new Error("TabStateStore not initialized");return this._ctx}getCellOverrides(e){return this.ctx.globalState.get(`cellOverrides_${e}`,{})}setCellOverrides(e,t){return this.ctx.globalState.update(`cellOverrides_${e}`,t)}getCellLabels(e){return this.ctx.globalState.get(`cellLabels_${e}`,[])}setCellLabels(e,t){return this.ctx.globalState.update(`cellLabels_${e}`,t)}getMergedRegions(e){return this.ctx.globalState.get(`mergedRegions_${e}`,[])}setMergedRegions(e,t){return this.ctx.globalState.update(`mergedRegions_${e}`,t)}getDefaultSteps(e){return this.ctx.globalState.get(`defaultSteps_${e}`,[])}setDefaultSteps(e,t){return this.ctx.globalState.update(`defaultSteps_${e}`,t)}getDefaultCommand(e){return this.ctx.globalState.get(`defaultCommand_${e}`,"")}setDefaultCommand(e,t){return this.ctx.globalState.update(`defaultCommand_${e}`,t)}getStartupCommands(e){return this.ctx.globalState.get(`startupCommands_${e}`,[])}setStartupCommands(e,t){return this.ctx.globalState.update(`startupCommands_${e}`,t)}getTabName(e){return this.ctx.globalState.get(`tabName_${e}`,"")}setTabName(e,t){return this.ctx.globalState.update(`tabName_${e}`,t)}async deleteTab(e){let t=[`cellOverrides_${e}`,`cellLabels_${e}`,`mergedRegions_${e}`,`defaultSteps_${e}`,`defaultCommand_${e}`,`startupCommands_${e}`,`tabName_${e}`];for(let a of t)await this.ctx.globalState.update(a,void 0)}async cloneTab(e,t){await this.setCellOverrides(t,JSON.parse(JSON.stringify(this.getCellOverrides(e)))),await this.setCellLabels(t,[...this.getCellLabels(e)]),await this.setMergedRegions(t,JSON.parse(JSON.stringify(this.getMergedRegions(e)))),await this.setDefaultSteps(t,JSON.parse(JSON.stringify(this.getDefaultSteps(e)))),await this.setDefaultCommand(t,this.getDefaultCommand(e)),await this.setStartupCommands(t,JSON.parse(JSON.stringify(this.getStartupCommands(e))))}async migrateOnce(){if(this.ctx.globalState.get("multiTabMigrationDone",!1))return;let t=this.ctx.globalState.get("cellOverrides",{}),a=this.ctx.globalState.get("cellLabels",[]),n=this.ctx.globalState.get("mergedRegions",[]),s=this.ctx.globalState.get("defaultSteps",[]),r=this.ctx.globalState.get("defaultCommand",""),c=this.ctx.globalState.get("startupCommands",[]);await this.setCellOverrides(0,t),await this.setCellLabels(0,a),await this.setMergedRegions(0,n),await this.setDefaultSteps(0,s),await this.setDefaultCommand(0,r),await this.setStartupCommands(0,c),await this.ctx.globalState.update("multiTabMigrationDone",!0)}},g=new q;var Z=class l{static{this.KEY="nextGlobalCellId"}allocate(e,t){let a=e.globalState.get(l.KEY,0),n=[];for(let s=0;s<t;s++)n.push(a+s);return e.globalState.update(l.KEY,a+t),n}peek(e){return e.globalState.get(l.KEY,0)}reset(e){return e.globalState.update(l.KEY,0)}resolve(e){for(let[t,a]of w.entries()){let s=a.getCellIds().indexOf(e);if(s!==-1)return{tabId:t,localCellId:s}}return null}},L=new Z;function P(l){return new Promise(e=>setTimeout(e,l))}var Ie=3e3,ce=(()=>{if(process.platform!=="win32")return 0;let l=J.release().split(".");return parseInt(l[2]||"0",10)})(),ee=ce>0&&ce<22e3?"\r":"\x1B[13u",Re=["claude","codex","gemini","copilot","aider","claude --dangerously-skip-permissions","codex -s danger-full-access -a never"];function X(l){let e=l.trim();return Re.some(t=>e===t||e.startsWith(t+" "))}function Le(l){let e=l.toLowerCase();return e.includes("powershell")||e.includes("pwsh")||e.includes("cmd")?`\r
`:"\r"}var De=2e4,pe=150,Me=2500,Pe=process.platform==="win32"?450:300,Oe=1200,Be=3e3,ue=/\x1b\[\?1049h/,ge=/\x1b\[\?1049l/,Ne=/\x1b\[[23]J/,Ae=/(^|\n)[ \t]*aider>[ \t]*$/,Ge=/shift\+tab to cycle|\? for shortcuts|esc to (interrupt|clear)|ctrl\+c to|bypass permissions|accept edits|plan mode/i,Q=l=>l?ee:"\r",Fe=[{test:/do you trust the files in this folder/i,accept:Q},{test:/do you trust the (files|contents) (in|of) this (directory|folder|workspace)/i,accept:Q},{test:/\btrust (this|the) (folder|directory|workspace)\b/i,accept:Q}];function me(l,e,t,a,n){let s=l[n];return s?.startupSteps&&s.startupSteps.length>0?s.startupSteps:s?.startupCommand?[{type:"command",input:s.startupCommand}]:e[n]?[{type:"command",input:e[n]}]:t.length>0?t:a?[{type:"command",input:a}]:[]}var fe={".ttf":"truetype",".otf":"opentype",".woff":"woff",".woff2":"woff2"},_=class l{constructor(e,t,a,n,s,r){this._cellIds=[];this._terminals=[];this._outputBuffers=[];this._csiUMode=[];this._insideLlm=[];this._cellShellType=[];this._lastByteTs=[];this._altScreen=[];this._altDwellStart=[];this._stepWatermark=[];this._startupSent=[];this._disposed=!1;this._stepGeneration={};this._pasteImages=[];this._panel=e,this._context=t,this._rows=a,this._cols=n,this._tabId=s,this._cellIds=r,this._panel.title=y.l10n.t("Terminal Grid {0}\xD7{1}",a,n),this._registryListener=w.onDidChange(()=>{this._disposed||this.refreshTitle()});let c=g.getMergedRegions(s).filter(d=>d.startRow+d.rowSpan<=a&&d.startCol+d.colSpan<=n);this._hiddenCells=new Set;for(let d of c)for(let f=d.startRow;f<d.startRow+d.rowSpan;f++)for(let p=d.startCol;p<d.startCol+d.colSpan;p++)f===d.startRow&&p===d.startCol||this._hiddenCells.add(f*n+p);this._panel.webview.options={enableScripts:!0,localResourceRoots:[y.Uri.joinPath(t.extensionUri,"media")]},this._panel.webview.html=this._getHtml(),this._panel.webview.onDidReceiveMessage(async d=>{switch(d.type){case"ready":if(this._createTerminals(d.defaultCols,d.defaultRows),d.cellDims&&Array.isArray(d.cellDims))for(let p=0;p<d.cellDims.length&&p<this._terminals.length;p++){let i=d.cellDims[p];if(i?.cols&&i?.rows)try{this._terminals[p].pty.resize(i.cols,i.rows)}catch{}}this.loadCustomFonts(this._context.globalState.get("customFonts",[]));let f=g.getCellOverrides(this._tabId);for(let[p,i]of Object.entries(f))if(i.bgColor||i.fgColor||i.fontFamily||i.themeName){let b=i.themeName?F(i.themeName):null;this.sendCellConfig(parseInt(p),i.bgColor||"",i.fgColor||"",i.fontFamily||"",i.themeName||"",b)}break;case"input":{let p=this._terminals[d.id]?.pty;p&&this._chunkedWrite(p,d.data);break}case"clipboardWrite":y.env.clipboard.writeText(d.text);break;case"pasteRequest":{let p=await y.env.clipboard.readText();if(p&&this._terminals[d.id]){let b=/\r?\n/.test(p)?"\x1B[200~"+p+"\x1B[201~":p;this._chunkedWrite(this._terminals[d.id].pty,b)}break}case"pasteImage":{let p=d.data.match(/^data:image\/([^;]+);base64,(.+)$/s);if(p&&this._terminals[d.id]){for(let v of this._pasteImages)try{A.unlinkSync(v)}catch{}this._pasteImages=[];let i=p[1]==="jpeg"?"jpg":p[1],b=$.join(J.tmpdir(),`tg-paste-${Date.now()}.${i}`);A.writeFileSync(b,Buffer.from(p[2],"base64")),this._pasteImages.push(b),this._chunkedWrite(this._terminals[d.id].pty,b)}break}case"resize":try{this._terminals[d.id]?.pty.resize(d.cols,d.rows)}catch{}break;case"clearTerminal":this._panel.webview.postMessage({type:"clear",id:d.id});break;case"killTerminal":try{this._terminals[d.id]?.pty.kill()}catch{}break;case"restartTerminal":this._restartTerminal(d.id);break;case"renameCell":{let p=g.getCellLabels(this._tabId),i=p[d.id]||"",b=await y.window.showInputBox({prompt:y.l10n.t("Rename cell {0}",d.id+1),value:i,placeHolder:y.l10n.t("Enter alias (empty to reset)")});b!==void 0&&(p[d.id]=b,await g.setCellLabels(this._tabId,p),this.sendLabels(),y.commands.executeCommand("terminalGrid._refreshSidebar"));break}}}),this._configListener=y.workspace.onDidChangeConfiguration(d=>{if(d.affectsConfiguration("terminalGrid")){let f=y.workspace.getConfiguration("terminalGrid"),p=f.get("colorTheme","");this._panel.webview.postMessage({type:"configUpdate",zoom:f.get("zoomPercent",100),fontFamily:f.get("fontFamily",""),bgColor:f.get("backgroundColor",""),fgColor:f.get("foregroundColor",""),themeName:p,themeColors:F(p)})}}),this._panel.onDidDispose(()=>this.dispose()),this._panel.onDidChangeViewState(d=>{this._disposed||d.webviewPanel.active&&(w.setActive(this._tabId),y.commands.executeCommand("terminalGrid._refreshSidebar"))}),this._panel.iconPath=y.Uri.joinPath(t.extensionUri,"images","sidebar.svg")}static get currentPanel(){return w.getActive()}static{this.OUTPUT_BUFFER_SIZE=5e4}static{this.CSI_U_ENABLE=/\x1b\[>[0-9]+u/}static{this.CSI_U_DISABLE=/\x1b\[<[0-9]*u/}static _getLog(){return l._log||(l._log=y.window.createOutputChannel("Terminal Grid")),l._log}static _getNodePty(){if(l._nodePty===void 0)try{l._nodePty=require("node-pty")}catch{l._nodePty=null}return l._nodePty}static getAvailableShells(){let e=[{name:"IDE Default",path:"",args:[]}];try{let r=function(p){try{if(/[/\\]/.test(p))return a.existsSync(p);let i=process.platform==="win32"?`where ${p}`:`which ${p}`;return n.execSync(i,{stdio:"ignore",timeout:500}),!0}catch{return!1}};var t=r;let a=require("fs"),n=require("child_process"),s=new Set,c=process.platform==="win32"?"windows":process.platform==="darwin"?"osx":"linux",d=y.workspace.getConfiguration(`terminal.integrated.profiles.${c}`);if(d)for(let p of Object.keys(d))try{let i=d.get(p);if(!i||typeof i!="object")continue;let b=Array.isArray(i.path)?i.path[0]:i.path;b&&r(b)&&(e.push({name:p,path:b,args:i.args||[]}),s.add(b.toLowerCase()))}catch{}let f=process.platform==="win32"?[{name:"PowerShell",path:"powershell.exe",args:["-NoLogo"]},{name:"PowerShell 7",path:"pwsh.exe",args:["-NoLogo"]},{name:"Command Prompt",path:"cmd.exe",args:[]},{name:"Git Bash",path:"C:\\Program Files\\Git\\bin\\bash.exe",args:["--login"]},{name:"WSL",path:"wsl.exe",args:[]}]:[{name:"Bash",path:"/bin/bash",args:["--login"]},{name:"Zsh",path:"/bin/zsh",args:["--login"]},{name:"Fish",path:"/usr/bin/fish",args:[]},{name:"sh",path:"/bin/sh",args:[]}];for(let p of f)!s.has(p.path.toLowerCase())&&r(p.path)&&(e.push(p),s.add(p.path.toLowerCase()))}catch{}return e}_resolveShell(e){if(!e)return process.platform==="win32"?l._getNodePty()?{path:"powershell.exe",args:["-NoLogo","-NoProfile"]}:{path:process.env.COMSPEC||"cmd.exe",args:[]}:{path:process.env.SHELL||"bash",args:[]};let a=l.getAvailableShells().find(s=>s.path===e||s.name===e);if(a&&a.path)return{path:a.path,args:a.args};let n=e.toLowerCase();return n.includes("powershell")||n.includes("pwsh")?{path:e,args:["-NoLogo"]}:n.includes("bash")||n.includes("zsh")?{path:e,args:["--login"]}:{path:e,args:[]}}static createOrShow(e,t,a,n){let s=n?.forceNewTab?null:w.getActive(),r,c,d;if(s){d=s.getTabId(),r=n?.tabIdOverride??d;let i=s.getRows()*s.getCols()===t*a;c=n?.cellIdsOverride??(i?s.getCellIds():L.allocate(e,t*a))}else{if(n?.tabIdOverride!==void 0)r=n.tabIdOverride;else{let i=e.globalState.get("pendingFirstTabId");i!=null?(r=i,e.globalState.update("pendingFirstTabId",void 0)):n?.forceNewTab?r=R.next(e):r=0}c=n?.cellIdsOverride??L.allocate(e,t*a)}R.reserve(e,r);let f=y.window.createWebviewPanel("terminalGrid",y.l10n.t("Terminal Grid {0}\xD7{1}",t,a),y.ViewColumn.One,{enableScripts:!0,retainContextWhenHidden:!0,localResourceRoots:[y.Uri.joinPath(e.extensionUri,"media")]}),p=new l(f,e,t,a,r,c);return s&&d!==void 0?(w.replace(d,r,p),s.dispose()):w.register(r,p,n?.positionOverride),l._persistTabs(e),r}static revive(e,t,a,n,s,r){let c;if(s===void 0){let i=w.getActive();if(i){let b=i.getTabId(),v=w.entries().findIndex(([u])=>u===b);v>=0&&(c=v),i.dispose()}}let d=s??R.next(t);R.reserve(t,d);let f=r??L.allocate(t,a*n),p=new l(e,t,a,n,d,f);w.register(d,p,c),l._persistTabs(t),y.commands.executeCommand("terminalGrid._refreshSidebar")}static persistTabs(e){l._persistTabs(e)}static _persistTabs(e){let t=w.entries().map(([a,n])=>({tabId:a,rows:n.getRows(),cols:n.getCols(),cellIds:n.getCellIds()}));if(e.globalState.update("lastTabs",t),t.length>0){let a=t[t.length-1];e.globalState.update("lastGrid",{rows:a.rows,cols:a.cols})}}static _formatTitle(e,t,a,n){let s=y.workspace.workspaceFolders?.[0]?.name,r=y.l10n.t("Terminal Grid {0}\xD7{1}",e,t),c=n&&n.length>0?n:y.l10n.t("Tab {0}",a+1);return s?`${s} \u2014 ${r} \xB7 ${c}`:`${r} \xB7 ${c}`}_enterSeq(e){return this._csiUMode[e]||this._insideLlm[e]?ee:Le(this._cellShellType[e]||"")}broadcastInput(e){for(let t of this._terminals)if(!this._hiddenCells.has(t.id)){if(this._insideLlm[t.id])this._typeToCell(t.id,e).then(()=>P(50)).then(()=>{t.pty.write(this._enterSeq(t.id))});else{let n=/\r?\n/.test(e)?"\x1B[200~"+e+"\x1B[201~":e;this._chunkedWrite(t.pty,n+this._enterSeq(t.id))}X(e)&&(this._insideLlm[t.id]=!0),e.trim()==="exit"&&(this._insideLlm[t.id]=!1)}}sendToCell(e,t){let a=this._terminals[e];return a?(this._chunkedWrite(a.pty,t),!0):!1}sendInputToCell(e,t){let a=this._terminals[e];if(!a)return!1;if(this._insideLlm[e])this._typeToCell(e,t).then(()=>P(50)).then(()=>{a.pty.write(this._enterSeq(e))});else{let s=/\r?\n/.test(t)?"\x1B[200~"+t+"\x1B[201~":t;this._chunkedWrite(a.pty,s+this._enterSeq(e))}return X(t)&&(this._insideLlm[e]=!0),t.trim()==="exit"&&(this._insideLlm[e]=!1),!0}static _stripAnsi(e){return e.replace(/\x1b\[[0-9;?]*[a-zA-Z]/g,"").replace(/\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)/g,"").replace(/\x1b[()][0-9A-Z]/g,"").replace(/\x1b[78DEHM]/g,"").replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g,"").replace(/\r\n/g,`
`).replace(/\r/g,`
`).replace(/\n{3,}/g,`

`)}readCell(e,t){if(this._hiddenCells.has(e))return null;let a=this._outputBuffers[e];if(a===void 0)return null;let n=l._stripAnsi(a);return t===void 0?n:t<=0?"":n.split(`
`).slice(-t).join(`
`)}getCellCount(){return this._terminals.length}getRows(){return this._rows}getCols(){return this._cols}getCellLabels(){let e=g.getCellLabels(this._tabId),t=this._rows*this._cols;return Array.from({length:t},(a,n)=>e[n]||String(n+1))}sendCellConfig(e,t,a,n,s,r){this._panel.webview.postMessage({type:"cellConfig",id:e,bgColor:t,fgColor:a,fontFamily:n,themeName:s??"",themeColors:r??null})}clearCellOverrides(){this._panel.webview.postMessage({type:"clearCellOverrides"})}sendLabels(){let e=g.getCellLabels(this._tabId);this._panel.webview.postMessage({type:"setLabels",labels:e})}loadCustomFonts(e){for(let t of e){let a=this._readFontBase64(t.path);if(a){let n=$.extname(t.path).toLowerCase();this._panel.webview.postMessage({type:"loadFont",name:t.name,data:a,format:fe[n]||"truetype"})}}}getTabId(){return this._tabId}getCellIds(){return this._cellIds.slice()}reveal(){this._panel.reveal(this._panel.viewColumn??y.ViewColumn.One)}refreshTitle(){if(this._disposed)return;let e=w.entries(),t=e.findIndex(([s])=>s===this._tabId),a=t>=0?t:e.length,n=g.getTabName(this._tabId);this._panel.title=l._formatTitle(this._rows,this._cols,a,n)}_readFontBase64(e){try{return A.readFileSync(e).toString("base64")}catch{return null}}_spawnPty(e,t,a,n,s){let r=this._resolveShell(s);if(e){let f=e.spawn(r.path,r.args,{name:"xterm-256color",cols:t,rows:a,cwd:n,env:process.env});return{onData:p=>{f.onData(p)},write:p=>f.write(p),resize:(p,i)=>f.resize(p,i),kill:()=>f.kill()}}let{spawn:c}=require("child_process"),d=c(r.path,r.args,{cwd:n,env:process.env,windowsHide:!0});return{onData:f=>{d.stdout?.on("data",p=>f(p.toString())),d.stderr?.on("data",p=>f(p.toString()))},write:f=>{d.stdin?.write(f)},resize:()=>{},kill:()=>d.kill()}}_createTerminals(e,t){let a=y.workspace.workspaceFolders?.[0]?.uri.fsPath||process.env.USERPROFILE||process.env.HOME||".",n=this._rows*this._cols,s=l._getNodePty();s||y.window.showWarningMessage(y.l10n.t("node-pty not available. Falling back to basic shell (limited features)."));let r=g.getStartupCommands(this._tabId),c=[];for(let u of r)if(typeof u=="string")c.push(u);else if(u&&typeof u=="object"&&"command"in u){let h=u;for(let x=0;x<(h.count||1);x++)c.push(h.command)}let d=g.getDefaultCommand(this._tabId),f=g.getDefaultSteps(this._tabId),p=e||80,i=t||24,b=y.workspace.getConfiguration("terminalGrid").get("shellType",""),v=g.getCellOverrides(this._tabId);for(let u=0;u<n;u++){if(this._hiddenCells.has(u)){let E={onData(){},write(){},resize(){},kill(){}};this._terminals.push({id:u,pty:E}),this._cellShellType[u]="",this._resetCellState(u,!0);continue}let h=v[u]?.shellType||b||"",x=this._spawnPty(s,p,i,a,h||void 0),S=u,k=me(v,c,f,d,u);this._cellShellType[S]=h,this._resetCellState(S),x.onData(E=>this._handlePtyData(S,E,k)),this._terminals.push({id:u,pty:x})}this.sendLabels()}_restartTerminal(e){let t=this._terminals[e];if(!t)return;try{t.pty.kill()}catch{}this._panel.webview.postMessage({type:"reset",id:e});let a=y.workspace.workspaceFolders?.[0]?.uri.fsPath||process.env.USERPROFILE||process.env.HOME||".",n=y.workspace.getConfiguration("terminalGrid").get("shellType",""),s=g.getCellOverrides(this._tabId),r=s[e]?.shellType||n||"",c=this._spawnPty(l._getNodePty(),80,24,a,r||void 0),d=g.getStartupCommands(this._tabId),f=[];for(let v of d)if(typeof v=="string")f.push(v);else if(v&&typeof v=="object"&&"command"in v){let u=v;for(let h=0;h<(u.count||1);h++)f.push(u.command)}let p=g.getDefaultCommand(this._tabId),i=g.getDefaultSteps(this._tabId),b=me(s,f,i,p,e);this._cellShellType[e]=r,this._resetCellState(e),c.onData(v=>this._handlePtyData(e,v,b)),this._terminals[e]={id:e,pty:c}}static{this.CHUNK_SIZE=4096}static{this.CHUNK_DELAY=10}_chunkedWrite(e,t){if(t.length<=l.CHUNK_SIZE){e.write(t);return}let a=0,n=()=>{if(a>=t.length)return;let s=t.slice(a,a+l.CHUNK_SIZE);a+=l.CHUNK_SIZE,e.write(s),a<t.length&&setTimeout(n,l.CHUNK_DELAY)};n()}async _typeToCell(e,t){let a=this._terminals[e]?.pty;if(a)for(let n of t)a.write(n),await P(20)}static{this.LLM_TYPE_MAX_RETRIES=5}static{this.LLM_ECHO_WAIT=2e3}_screen(e){let t=this._outputBuffers[e]||"",a=Math.min(this._stepWatermark[e]||0,t.length);return l._stripAnsi(t.slice(a))}_modalHit(e){return Fe.find(t=>t.test.test(e))}async _settle(e,t){let a=Date.now();for(;Date.now()<t&&!this._disposed;){if(Date.now()-(this._lastByteTs[e]||0)>=Pe||Date.now()-a>=Me)return;await P(pe)}}async _waitForReady(e,t,a){let n=Date.now(),s=n+De,r="";for(;Date.now()<s&&!this._disposed&&this._stepGeneration[e]===a;){await this._settle(e,s);let c=this._screen(e),d=this._modalHit(c);if(d){if(!t)return"modal";let v=c.slice(-400);if(v===r)return"modal";r=v,this._terminals[e]?.pty.write(d.accept(this._csiUMode[e])),this._lastByteTs[e]=Date.now();continue}let f=c.replace(/\s+/g,"").length>=40,p=!this._altScreen[e]||Date.now()-(this._altDwellStart[e]||0)>=Oe,i=this._csiUMode[e]||this._altScreen[e]||Ae.test(c)||Ge.test(c),b=Date.now()-n>=Be;if(f&&p&&(i||b))return"ready";await P(pe)}return"timeout"}async _typeWithRetry(e,t){let a=this._terminals[e]?.pty;if(!a)return!1;for(let n=0;n<l.LLM_TYPE_MAX_RETRIES;n++){let s=(this._outputBuffers[e]||"").length;await this._typeToCell(e,t);let r=Date.now()+l.LLM_ECHO_WAIT;for(;Date.now()<r;){await P(50);let c=this._outputBuffers[e]||"";if(l._stripAnsi(c.slice(s)).includes(t))return!0;if(this._disposed)return!1}if(this._modalHit(this._screen(e)))return!1;for(let c=0;c<t.length;c++)a.write("\x7F");await P(300)}return!1}async _executeSteps(e,t,a){this._stepGeneration[e]||(this._stepGeneration[e]=0);let n=++this._stepGeneration[e],s=y.workspace.getConfiguration("terminalGrid").get("autoAcceptTrust",!0),r=()=>!this._disposed&&this._stepGeneration[e]===n,c=!1;this._stepWatermark[e]=(this._outputBuffers[e]||"").length,await this._settle(e,Date.now()+3e3);for(let d=0;d<t.length&&r();d++){let f=t[d];if(f.type==="timeout"){await P(f.ms);continue}if(d>0&&c){this._stepWatermark[e]=(this._outputBuffers[e]||"").length;let p=await this._waitForReady(e,s,n);if(!r())return;if(p!=="ready"){l._getLog().appendLine(`[startup] cell ${e}: aborted (${p}) \u2014 not typing ${JSON.stringify(f.input)}.`);return}}else d>0&&t[d-1].type==="command"&&await P(Ie);if(!r())return;if(c){if(this._modalHit(this._screen(e))){l._getLog().appendLine(`[startup] cell ${e}: modal appeared \u2014 aborting ${JSON.stringify(f.input)}.`);return}if(!await this._typeWithRetry(e,f.input)||!r())return;this._terminals[e]?.pty.write(ee)}else this._terminals[e]?.pty.write(f.input+this._enterSeq(e));X(f.input)&&(c=!0),f.input.trim()==="exit"&&(c=!1),this._insideLlm[e]=c}}_resetCellState(e,t=!1){this._insideLlm[e]=!1,this._csiUMode[e]=!1,this._altScreen[e]=!1,this._altDwellStart[e]=0,this._lastByteTs[e]=0,this._outputBuffers[e]="",this._stepWatermark[e]=0,this._startupSent[e]=t}_handlePtyData(e,t,a){this._disposed||(l.CSI_U_ENABLE.test(t)&&(this._csiUMode[e]=!0),l.CSI_U_DISABLE.test(t)&&(this._csiUMode[e]=!1),ue.test(t)&&(this._altScreen[e]=!0,this._altDwellStart[e]=Date.now()),ge.test(t)&&(this._altScreen[e]=!1),this._lastByteTs[e]=Date.now(),this._outputBuffers[e]=(this._outputBuffers[e]||"")+t,this._outputBuffers[e].length>l.OUTPUT_BUFFER_SIZE&&(this._outputBuffers[e]=this._outputBuffers[e].slice(-l.OUTPUT_BUFFER_SIZE)),(Ne.test(t)||ue.test(t)||ge.test(t))&&(this._stepWatermark[e]=this._outputBuffers[e].length),this._panel.webview.postMessage({type:"output",id:e,data:t}),!this._startupSent[e]&&a.length>0&&(this._startupSent[e]=!0,this._executeSteps(e,a,this._cellShellType[e]||"")))}restartCell(e){this._restartTerminal(e)}restartAllCells(){for(let e of this._terminals)this._restartTerminal(e.id)}dispose(){if(this._disposed)return;this._disposed=!0,this._registryListener?.dispose(),w.unregister(this._tabId,this),this._configListener?.dispose();for(let t of this._terminals)try{t.pty.kill()}catch{}this._terminals=[];for(let t of this._pasteImages)try{A.unlinkSync(t)}catch{}this._pasteImages=[],this._panel.dispose(),w.size()===0?(this._context.globalState.update("lastGrid",void 0),this._context.globalState.update("lastTabs",void 0)):l._persistTabs(this._context);let e=w.getActive();e&&(e.reveal(),y.commands.executeCommand("terminalGrid._refreshSidebar"))}_buildCustomFontCss(){let e=this._context.globalState.get("customFonts",[]),t="";for(let a of e){let n=this._readFontBase64(a.path);if(!n)continue;let s=$.extname(a.path).toLowerCase(),r=fe[s]||"truetype";t+=`@font-face { font-family: '${a.name}'; src: url(data:font/${s.slice(1)};base64,${n}) format('${r}'); font-display: swap; }
`}return t}_getHtml(){let e=this._panel.webview,t=e.asWebviewUri(y.Uri.joinPath(this._context.extensionUri,"media","gridTerminal.js")),a=e.asWebviewUri(y.Uri.joinPath(this._context.extensionUri,"media","xterm.css")),n=ze(),s=this._buildCustomFontCss();return`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'none';
                 style-src ${e.cspSource} 'unsafe-inline';
                 script-src 'nonce-${n}';
                 font-src ${e.cspSource} data:;">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="${a}">
  <style>
    ${s}
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%; height: 100%;
      overflow: hidden;
      background: var(--vscode-editor-background, #1e1e1e);
    }
    #grid {
      display: grid;
      grid-template-rows: repeat(${this._rows}, 1fr);
      grid-template-columns: repeat(${this._cols}, 1fr);
      width: 100%; height: 100%;
      gap: 2px;
      padding: 2px;
      position: relative;
    }
    .cell {
      overflow: hidden;
      contain: strict;
      background: var(--vscode-terminal-background, var(--vscode-editor-background, #1e1e1e));
      border-radius: 6px;
      border: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.04));
      display: flex;
      flex-direction: column;
      position: relative;
      transition: border-color 0.2s ease;
    }
    .cell.focused {
      border-color: var(--vscode-focusBorder, rgba(0, 127, 212, 0.6));
      box-shadow: 0 0 8px color-mix(in srgb, var(--vscode-focusBorder, #007fd4) 25%, transparent);
    }
    .cell-info {
      position: absolute;
      top: 4px; right: 8px;
      display: flex; align-items: center; gap: 6px;
      font-size: 10px;
      font-family: var(--vscode-terminal-fontFamily, var(--vscode-editor-fontFamily, monospace));
      z-index: 1;
      pointer-events: none;
      user-select: none;
    }
    .cell-label {
      color: var(--vscode-textLink-foreground, #3794ff);
      opacity: 0.6;
    }
    .cell-zoom-pct {
      font-size: 9px;
      color: var(--vscode-textLink-foreground, #3794ff);
      opacity: 0.7;
    }
    .grid-resizer {
      position: absolute;
      z-index: 20;
      background: transparent;
    }
    .grid-resizer:hover, .grid-resizer.active {
      background: var(--vscode-focusBorder, #007fd4);
      opacity: 0.45;
    }
    .grid-resizer.col-resizer {
      top: 0; width: 6px; height: 100%;
      cursor: col-resize;
    }
    .grid-resizer.row-resizer {
      left: 0; height: 6px; width: 100%;
      cursor: row-resize;
    }
    body.resizing-col, body.resizing-col * { cursor: col-resize !important; }
    body.resizing-row, body.resizing-row * { cursor: row-resize !important; }
    .term-container {
      flex: 1;
      overflow: hidden;
      padding: 4px 0 0 4px;
      background: var(--vscode-terminal-background, var(--vscode-editor-background, #1e1e1e));
    }
    .term-container .xterm,
    .term-container .xterm-viewport,
    .term-container .xterm-screen {
      height: 100%;
    }
    .term-container .xterm-viewport {
      overflow-y: scroll !important;
      will-change: transform;
    }
    .term-container .xterm-viewport::-webkit-scrollbar { width: 4px; }
    .term-container .xterm-viewport::-webkit-scrollbar-thumb {
      background: var(--vscode-scrollbarSlider-background, rgba(255,255,255,0.1));
      border-radius: 2px;
    }
    .term-container .xterm-viewport::-webkit-scrollbar-thumb:hover {
      background: var(--vscode-scrollbarSlider-hoverBackground, rgba(255,255,255,0.2));
    }
    .ctx-menu {
      position: fixed; display: none; z-index: 1000;
      background: var(--vscode-menu-background, #252526);
      border: 1px solid rgba(255,255,255,.12); border-radius: 8px;
      padding: 4px 0; min-width: 140px;
      box-shadow: 0 4px 20px rgba(0,0,0,.4);
    }
    .ctx-menu.show { display: block; }
    .ctx-menu-item {
      padding: 6px 12px; font-size: 12px; cursor: pointer;
      color: var(--vscode-menu-foreground, var(--vscode-foreground));
      transition: background .1s;
    }
    .ctx-menu-item:hover { background: rgba(255,255,255,.06); }
    .ctx-menu-sep { height: 1px; background: rgba(255,255,255,.06); margin: 4px 8px; }
  </style>
</head>
<body>
  <div id="grid"></div>
  <div class="ctx-menu" id="ctxMenu">
    <div class="ctx-menu-item" data-action="copy">${y.l10n.t("Copy")}</div>
    <div class="ctx-menu-item" data-action="copyPlain">${y.l10n.t("Copy (Plain)")}</div>
    <div class="ctx-menu-item" data-action="paste">${y.l10n.t("Paste")}</div>
    <div class="ctx-menu-sep"></div>
    <div class="ctx-menu-item" data-action="clear">${y.l10n.t("Clear")}</div>
    <div class="ctx-menu-item" data-action="restart">${y.l10n.t("Restart")}</div>
    <div class="ctx-menu-item" data-action="kill">${y.l10n.t("Kill")}</div>
    <div class="ctx-menu-sep"></div>
    <div class="ctx-menu-item" data-action="rename">${y.l10n.t("Rename")}</div>
  </div>
  <script nonce="${n}">
    var __GRID_ROWS = ${this._rows};
    var __GRID_COLS = ${this._cols};
    var __GRID_ZOOM = ${y.workspace.getConfiguration("terminalGrid").get("zoomPercent",100)};
    var __GRID_FONT_FAMILY = ${JSON.stringify(y.workspace.getConfiguration("terminalGrid").get("fontFamily",""))};
    var __GRID_BG_COLOR = ${JSON.stringify(y.workspace.getConfiguration("terminalGrid").get("backgroundColor",""))};
    var __GRID_FG_COLOR = ${JSON.stringify(y.workspace.getConfiguration("terminalGrid").get("foregroundColor",""))};
    var __GRID_THEME = ${JSON.stringify(y.workspace.getConfiguration("terminalGrid").get("colorTheme",""))};
    var __GRID_THEME_COLORS = ${JSON.stringify(F(y.workspace.getConfiguration("terminalGrid").get("colorTheme","")))};
    var __GRID_MERGE_REGIONS = ${JSON.stringify(g.getMergedRegions(this._tabId).filter(r=>r.startRow+r.rowSpan<=this._rows&&r.startCol+r.colSpan<=this._cols))};
  </script>
  <script nonce="${n}" src="${t}"></script>
</body>
</html>`}};function ze(){let l="",e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";for(let t=0;t<32;t++)l+=e.charAt(Math.floor(Math.random()*e.length));return l}var je=[".ttf",".otf",".woff",".woff2"];function $e(){try{return require("node-pty"),!0}catch{return!1}}var D=class l{constructor(e){this._mcpPort=0;this._context=e,w.onDidChange(()=>this._scheduleConfigSend())}static{this.viewType="terminalGrid.sidebarView"}_scheduleConfigSend(){this._configSendTimer&&clearTimeout(this._configSendTimer),this._configSendTimer=setTimeout(()=>{this._configSendTimer=void 0,this.sendConfig()},50)}setMcpPort(e){this._mcpPort=e,this._view?.webview.postMessage({type:"mcpPort",port:e})}get _tid(){return w.getActiveTabId()??0}resolveWebviewView(e,t,a){this._view=e,e.webview.options={enableScripts:!0,localResourceRoots:[this._context.extensionUri]},e.webview.html=this._getHtml(),e.webview.onDidReceiveMessage(async n=>{switch(n.type){case"openGrid":await o.commands.executeCommand("terminalGrid.openCustomGrid",n.rows,n.cols);break;case"reload":await o.commands.executeCommand("workbench.action.reloadWindow");break;case"setConfig":{let s=o.workspace.getConfiguration("terminalGrid");n.key&&n.value!==void 0&&await s.update(n.key,n.value,o.ConfigurationTarget.Global),n.key==="shellType"&&_.currentPanel&&_.currentPanel.restartAllCells();break}case"getConfig":{this.sendConfig();break}case"browseFont":{let s=await o.window.showOpenDialog({canSelectMany:!1,filters:{"Font Files":["ttf","otf","woff","woff2"]},title:o.l10n.t("Select Font File")});if(!s||s.length===0)break;let r=s[0].fsPath,c=T.extname(r).toLowerCase();if(!je.includes(c)){o.window.showWarningMessage(o.l10n.t("Unsupported font format. Use .ttf, .otf, .woff, or .woff2"));break}try{C.accessSync(r,C.constants.R_OK)}catch{o.window.showErrorMessage(o.l10n.t("Cannot read font file."));break}let d=T.basename(r,c),f=this._context.globalState.get("customFonts",[]);f.some(p=>p.path===r)||(f.push({name:d,path:r}),await this._context.globalState.update("customFonts",f)),this.sendConfig(),_.currentPanel&&_.currentPanel.loadCustomFonts([{name:d,path:r}]);break}case"removeFont":{let r=this._context.globalState.get("customFonts",[]).filter(c=>c.name!==n.name);await this._context.globalState.update("customFonts",r),this.sendConfig();break}case"addStartupCommand":{let s=g.getStartupCommands(this._tid);s.push({command:n.command,count:1}),await g.setStartupCommands(this._tid,s),this.sendConfig();break}case"removeStartupCommand":{let s=g.getStartupCommands(this._tid);s.splice(n.index,1),await g.setStartupCommands(this._tid,s),this.sendConfig();break}case"updateCommandCount":{let s=g.getStartupCommands(this._tid);s[n.index]&&(s[n.index].count=Math.max(1,n.count),await g.setStartupCommands(this._tid,s)),this.sendConfig();break}case"addStep":{if(n.target==="all"){let s=g.getDefaultSteps(this._tid);s.push(n.step),await g.setDefaultSteps(this._tid,s);let r=s.find(c=>c.type==="command");await g.setDefaultCommand(this._tid,r?.input||"")}else{let s=g.getCellOverrides(this._tid),r=n.target;s[r]||(s[r]={}),Array.isArray(s[r].startupSteps)||(s[r].startupSteps=[]),s[r].startupSteps.push(n.step);let c=s[r].startupSteps.find(d=>d.type==="command");s[r].startupCommand=c?.input||"",await g.setCellOverrides(this._tid,s)}this.sendConfig();break}case"removeStep":{if(n.target==="all"){let s=g.getDefaultSteps(this._tid);s.splice(n.index,1),await g.setDefaultSteps(this._tid,s);let r=s.find(c=>c.type==="command");await g.setDefaultCommand(this._tid,r?.input||"")}else{let s=g.getCellOverrides(this._tid),r=n.target;if(Array.isArray(s[r]?.startupSteps)){s[r].startupSteps.splice(n.index,1);let c=s[r].startupSteps.find(d=>d.type==="command");s[r].startupCommand=c?.input||"",await g.setCellOverrides(this._tid,s)}}this.sendConfig();break}case"reorderSteps":{if(n.target==="all"){await g.setDefaultSteps(this._tid,n.steps);let s=n.steps.find(r=>r.type==="command");await g.setDefaultCommand(this._tid,s?.input||"")}else{let s=g.getCellOverrides(this._tid),r=n.target;s[r]||(s[r]={}),s[r].startupSteps=n.steps;let c=n.steps.find(d=>d.type==="command");s[r].startupCommand=c?.input||"",await g.setCellOverrides(this._tid,s)}this.sendConfig();break}case"updateStep":{if(n.target==="all"){let s=g.getDefaultSteps(this._tid);n.index>=0&&n.index<s.length&&(s[n.index]=n.step,await g.setDefaultSteps(this._tid,s))}else{let s=g.getCellOverrides(this._tid),r=n.target,c=s[r]?.startupSteps||[];n.index>=0&&n.index<c.length&&(c[n.index]=n.step,s[r]||(s[r]={}),s[r].startupSteps=c,await g.setCellOverrides(this._tid,s))}this.sendConfig();break}case"addProject":{let s=this._context.globalState.get("projects",[]);s.some(r=>r.path===n.path)||(s.push({name:n.name,path:n.path}),await this._context.globalState.update("projects",s)),this.sendConfig();break}case"removeProject":{let s=this._context.globalState.get("projects",[]);s.splice(n.index,1),await this._context.globalState.update("projects",s),this.sendConfig();break}case"openProject":{let s=o.Uri.file(n.path);await o.commands.executeCommand("vscode.openFolder",s,{forceNewWindow:!!n.newWindow});break}case"addCurrentProject":{let s=o.workspace.workspaceFolders?.[0];if(!s){o.window.showWarningMessage(o.l10n.t("No workspace folder open."));break}let r=this._context.globalState.get("projects",[]),c=s.uri.fsPath;r.some(d=>d.path===c)||(r.push({name:s.name,path:c}),await this._context.globalState.update("projects",r)),this.sendConfig();break}case"browseProject":{let s=await o.window.showOpenDialog({canSelectFiles:!1,canSelectFolders:!0,canSelectMany:!1,title:o.l10n.t("Select Project Folder")});if(!s||s.length===0)break;let r=s[0].fsPath,c=T.basename(r),d=this._context.globalState.get("projects",[]);d.some(f=>f.path===r)||(d.push({name:c,path:r}),await this._context.globalState.update("projects",d)),this.sendConfig();break}case"savePreset":{await this._savePreset(n.name),this.sendConfig();break}case"loadPreset":{let r=this._context.globalState.get("presets",[]).find(i=>i.name===n.name);if(!r)break;let c=w.getActiveTabId(),d=c??R.next(this._context),f=c!==void 0?w.entries().findIndex(([i])=>i===c):-1;w.getActive()?.dispose();let p=o.workspace.getConfiguration("terminalGrid");if(await p.update("defaultRows",r.rows,o.ConfigurationTarget.Global),await p.update("defaultCols",r.cols,o.ConfigurationTarget.Global),await p.update("zoomPercent",r.zoomPercent,o.ConfigurationTarget.Global),await p.update("fontFamily",r.fontFamily,o.ConfigurationTarget.Global),await p.update("backgroundColor",r.bgColor,o.ConfigurationTarget.Global),await p.update("foregroundColor",r.fgColor,o.ConfigurationTarget.Global),await p.update("colorTheme",r.colorTheme||"",o.ConfigurationTarget.Global),await p.update("shellType",r.shellType||"",o.ConfigurationTarget.Global),await g.setStartupCommands(d,r.startupCommands||[]),await g.setCellLabels(d,r.cellLabels||[]),await g.setDefaultCommand(d,r.defaultCommand||""),r.defaultSteps?await g.setDefaultSteps(d,r.defaultSteps):r.defaultCommand?await g.setDefaultSteps(d,[{type:"command",input:r.defaultCommand}]):await g.setDefaultSteps(d,[]),r.cellStepsOverrides){let i={};for(let[b,v]of Object.entries(r.cellStepsOverrides))i[Number(b)]={},Array.isArray(v.startupSteps)&&(i[Number(b)].startupSteps=v.startupSteps);await g.setCellOverrides(d,i)}else await g.setCellOverrides(d,{});await g.setMergedRegions(d,r.mergedRegions||[]),_.createOrShow(this._context,r.rows,r.cols,{forceNewTab:!0,tabIdOverride:d,positionOverride:f>=0?f:void 0}),this.sendConfig();break}case"deletePreset":{let r=this._context.globalState.get("presets",[]).filter(d=>d.name!==n.name);await this._context.globalState.update("presets",r);let c=this._context.globalState.get("projectPresets",{});for(let d of Object.keys(c))c[d]===n.name&&delete c[d];await this._context.globalState.update("projectPresets",c),this.sendConfig();break}case"linkPreset":{let s=this._context.globalState.get("projectPresets",{});n.presetName?s[n.projectPath]=n.presetName:delete s[n.projectPath],await this._context.globalState.update("projectPresets",s),this.sendConfig();break}case"broadcast":{_.currentPanel?_.currentPanel.broadcastInput(n.text):o.window.showWarningMessage(o.l10n.t("No terminal grid is open."));break}case"broadcastToCell":{if(_.currentPanel)for(let s of n.cellIds)_.currentPanel.sendInputToCell(s,n.text);else o.window.showWarningMessage(o.l10n.t("No terminal grid is open."));break}case"setCellConfig":{let s=g.getCellOverrides(this._tid);if(s[n.cellId]={bgColor:n.bgColor||"",fgColor:n.fgColor||"",fontFamily:n.fontFamily||"",themeName:n.themeName||"",shellType:s[n.cellId]?.shellType||""},await g.setCellOverrides(this._tid,s),_.currentPanel){let r=n.themeName?F(n.themeName):null;_.currentPanel.sendCellConfig(n.cellId,n.bgColor||"",n.fgColor||"",n.fontFamily||"",n.themeName||"",r)}break}case"setShellForCell":{let s=g.getCellOverrides(this._tid);s[n.cellId]||(s[n.cellId]={}),s[n.cellId].shellType=n.shellType||"",await g.setCellOverrides(this._tid,s),_.currentPanel&&_.currentPanel.restartCell(n.cellId);break}case"setDefaultCommand":{let s=n.command||"";await g.setDefaultCommand(this._tid,s),await g.setDefaultSteps(this._tid,s?[{type:"command",input:s}]:[]),this.sendConfig();break}case"setCellCommand":{let s=g.getCellOverrides(this._tid);s[n.cellId]||(s[n.cellId]={});let r=n.command||"";s[n.cellId].startupCommand=r,s[n.cellId].startupSteps=r?[{type:"command",input:r}]:[],await g.setCellOverrides(this._tid,s),this.sendConfig();break}case"clearAllCellOverrides":{await g.setCellOverrides(this._tid,{}),_.currentPanel&&_.currentPanel.clearCellOverrides();break}case"clearAllCellShells":{let s=g.getCellOverrides(this._tid);for(let r of Object.keys(s))s[parseInt(r)]&&(s[parseInt(r)].shellType="");await g.setCellOverrides(this._tid,s);break}case"saveMergeRegions":{let s=n.regions||[],r=JSON.stringify(g.getMergedRegions(this._tid));await g.setMergedRegions(this._tid,s);let c=typeof n.cols=="number"&&n.cols>0?n.cols:w.getActive()?.getCols()??o.workspace.getConfiguration("terminalGrid").get("defaultCols",3),d=new Set;for(let p of s)for(let i=p.startRow;i<p.startRow+p.rowSpan;i++)for(let b=p.startCol;b<p.startCol+p.colSpan;b++)i===p.startRow&&b===p.startCol||d.add(i*c+b);if(d.size>0){let p=g.getCellOverrides(this._tid),i=g.getCellLabels(this._tid),b=!1;for(let v of d)p[String(v)]&&(delete p[String(v)],b=!0),i[v]&&(i[v]="",b=!0);b&&(await g.setCellOverrides(this._tid,p),await g.setCellLabels(this._tid,i))}this.sendConfig();let f=w.getActive();r!==JSON.stringify(s)&&f&&f.getRows()===n.rows&&f.getCols()===n.cols&&_.createOrShow(this._context,f.getRows(),f.getCols());break}case"saveSectionStates":{await this._context.globalState.update("sectionStates",n.states);break}case"registerMcpDesktop":{let s=await this._registerMcpInConfig("desktop");this._view?.webview.postMessage({type:"mcpRegisterResult",target:"desktop",...s});break}case"checkMcpRegistration":{let s=this._checkMcpRegistration();this._view?.webview.postMessage({type:"mcpRegistrationStatus",...s});break}case"unregisterMcpDesktop":{let s=await this._unregisterMcpInConfig("desktop");this._view?.webview.postMessage({type:"mcpUnregisterResult",target:"desktop",...s});break}case"switchTab":{let s=w.get(n.tabId);s&&s.reveal();break}case"newTab":{let s=w.getActive(),r=o.workspace.getConfiguration("terminalGrid"),c=s?.getRows()??r.get("defaultRows",2),d=s?.getCols()??r.get("defaultCols",3);_.createOrShow(this._context,c,d,{forceNewTab:!0});break}case"duplicateTab":{let s=w.getActive();if(!s)break;let r=s.getRows(),c=s.getCols(),d=s.getTabId(),f=R.next(this._context);await g.cloneTab(d,f),_.createOrShow(this._context,r,c,{forceNewTab:!0,tabIdOverride:f}),o.window.showInformationMessage(o.l10n.t("Tab duplicated. Terminal history is not copied; cells will start with the configured startup commands."));break}case"removeTab":{if(w.size()<=1)break;let s=w.get(n.tabId);if(!s)break;await g.deleteTab(n.tabId),s.dispose();break}case"renameTab":{if(typeof n.name!="string"||!w.get(n.tabId))break;await g.setTabName(n.tabId,n.name.trim());for(let[,r]of w.entries())r.refreshTitle();this.sendConfig();break}case"installNodePty":{try{await o.window.withProgress({location:o.ProgressLocation.Notification,title:o.l10n.t("Installing node-pty\u2026"),cancellable:!1},()=>new Promise((c,d)=>{be.exec("npm install node-pty",{cwd:this._context.extensionPath},f=>{f?d(f):c()})})),this._view?.webview.postMessage({type:"ptyInstallResult",success:!0});let s=o.l10n.t("Reload Window");await o.window.showInformationMessage(o.l10n.t("node-pty installed successfully. Reload window to activate."),s)===s&&o.commands.executeCommand("workbench.action.reloadWindow")}catch(s){let r=s instanceof Error?s.message:String(s);o.window.showErrorMessage(o.l10n.t("node-pty install failed: {0}",r)),this._view?.webview.postMessage({type:"ptyInstallResult",success:!1})}break}}}),o.workspace.onDidChangeConfiguration(n=>{n.affectsConfiguration("terminalGrid")&&this.sendConfig()})}async _savePreset(e){let t=o.workspace.getConfiguration("terminalGrid"),a={name:e,rows:t.get("defaultRows",2),cols:t.get("defaultCols",3),startupCommands:g.getStartupCommands(this._tid),cellLabels:g.getCellLabels(this._tid),zoomPercent:t.get("zoomPercent",100),fontFamily:t.get("fontFamily",""),bgColor:t.get("backgroundColor",""),fgColor:t.get("foregroundColor",""),colorTheme:t.get("colorTheme",""),shellType:t.get("shellType",""),defaultCommand:g.getDefaultCommand(this._tid),defaultSteps:g.getDefaultSteps(this._tid),cellStepsOverrides:g.getCellOverrides(this._tid),mergedRegions:g.getMergedRegions(this._tid)},n=this._context.globalState.get("presets",[]),s=n.findIndex(r=>r.name===e);s>=0?n[s]=a:n.push(a),await this._context.globalState.update("presets",n)}async _migrateSteps(){let e=!1,t=g.getDefaultSteps(this._tid),a=g.getDefaultCommand(this._tid);a&&t.length===0?(await g.setDefaultSteps(this._tid,[{type:"command",input:a}]),await g.setDefaultCommand(this._tid,""),e=!0):a&&t.length>0&&(await g.setDefaultCommand(this._tid,""),e=!0);let n=g.getCellOverrides(this._tid);for(let r of Object.keys(n)){let c=n[Number(r)];if(!c)continue;let d=c.startupCommand,f=c.startupSteps;d&&(!f||f.length===0)?(c.startupSteps=[{type:"command",input:d}],delete c.startupCommand,e=!0):d&&f&&f.length>0&&(delete c.startupCommand,e=!0)}g.getStartupCommands(this._tid).length>0&&(await g.setStartupCommands(this._tid,[]),e=!0),e&&await g.setCellOverrides(this._tid,n)}_getClaudeDesktopConfigPath(){return l._claudeDesktopConfigPath()}static _claudeDesktopConfigPath(){let e=process.platform;return e==="win32"?T.join(process.env.APPDATA||T.join(z.homedir(),"AppData","Roaming"),"Claude","claude_desktop_config.json"):e==="darwin"?T.join(z.homedir(),"Library","Application Support","Claude","claude_desktop_config.json"):T.join(z.homedir(),".config","Claude","claude_desktop_config.json")}static _stableMcpDest(e){return T.join(e.globalStorageUri.fsPath,"mcp-server.js")}static ensureStableMcpScript(e){let t=T.join(e.extensionPath,"mcp-server.js");try{let a=l._stableMcpDest(e);if(C.existsSync(t)){C.mkdirSync(T.dirname(a),{recursive:!0});let n=a+".version",s=String(e.extension?.packageJSON?.version??""),r="";try{r=C.existsSync(n)?C.readFileSync(n,"utf-8"):""}catch{}if(!C.existsSync(a)||r!==s){C.copyFileSync(t,a);try{C.writeFileSync(n,s)}catch{}}}if(C.existsSync(a))return a.replace(/\\/g,"/")}catch{}return t.replace(/\\/g,"/")}static _samePath(e,t){try{let a=T.resolve(e),n=T.resolve(t);return process.platform==="win32"?a.toLowerCase()===n.toLowerCase():a===n}catch{return e===t}}static healMcpRegistrations(e){let t;try{let s=l._stableMcpDest(e);if(!C.existsSync(s))return;t=s.replace(/\\/g,"/")}catch{return}let a=s=>/[\\/]extensions[\\/]koenma\.terminal-grid-\d/.test(s),n=[T.join(z.homedir(),".claude.json"),l._claudeDesktopConfigPath()];for(let s of n)try{if(!C.existsSync(s))continue;let r=C.readFileSync(s,"utf-8"),c=JSON.parse(r),d=[],f=u=>{u&&typeof u=="object"&&d.push(u)};f(c.mcpServers);let p=c.projects;if(p&&typeof p=="object")for(let u of Object.values(p))f(u?.mcpServers);let i=!1;for(let u of d){let x=u["terminal-grid"]?.args;if(Array.isArray(x))for(let S=0;S<x.length;S++){let k=x[S];typeof k!="string"||!/mcp-server\.js$/i.test(k)||l._samePath(k,t)||(!C.existsSync(k)||a(k))&&(x[S]=t,i=!0)}}if(!i)continue;let b=JSON.stringify(c,null,2),v=`${s}.tg-tmp.${process.pid}.${Date.now()}`;try{C.writeFileSync(v,b,"utf-8"),C.readFileSync(s,"utf-8")===r&&C.renameSync(v,s)}finally{try{C.existsSync(v)&&C.unlinkSync(v)}catch{}}}catch{}}static pruneCodexRegistration(){let e=T.join(z.homedir(),".codex","config.toml");try{if(!C.existsSync(e))return;let t=C.readFileSync(e,"utf-8");if(!t.includes("[mcp_servers.terminal-grid]"))return;let a=t.includes(`\r
`)?`\r
`:`
`,n=x=>x.replace(/"(?:[^"\\]|\\.)*"|'[^']*'/g,""),s=x=>{let S=/^\s*\[\[?([^[\]]+)\]\]?\s*(?:#.*)?$/.exec(x);return S?S[1].trim():null},r=[{name:null,lines:[]}],c=0;for(let x of t.split(/\r?\n/)){let S=c===0?s(x):null;S!==null?r.push({name:S,lines:[x]}):r[r.length-1].lines.push(x);for(let k of n(x))k==="["||k==="{"?c++:(k==="]"||k==="}")&&(c=Math.max(0,c-1))}let d=x=>x==="mcp_servers.terminal-grid"||(x?.startsWith("mcp_servers.terminal-grid.")??!1),f=r.find(x=>x.name==="mcp_servers.terminal-grid"),p=f?/args\s*=\s*\[\s*"((?:[^"\\]|\\.)*)"/.exec(f.lines.join(`
`)):null,i=p?p[1].replace(/\\\\/g,"\\"):"",b=!!i&&!C.existsSync(i),v=/[\\/]extensions[\\/]koenma\.terminal-grid-\d/.test(i);if(!i||!b&&!v)return;let u=r.filter(x=>!d(x.name)).flatMap(x=>x.lines).join(a).replace(/^(?:\r?\n)+/,"");if(u===t)return;let h=`${e}.tg-tmp.${process.pid}.${Date.now()}`;try{C.writeFileSync(h,u,"utf-8"),C.readFileSync(e,"utf-8")===t&&C.renameSync(h,e)}finally{try{C.existsSync(h)&&C.unlinkSync(h)}catch{}}}catch{}}static pruneWorkspaceMcpJson(){for(let e of o.workspace.workspaceFolders??[]){let t=T.join(e.uri.fsPath,".mcp.json");try{if(!C.existsSync(t))continue;let a=C.readFileSync(t,"utf-8"),n=JSON.parse(a),s=n.mcpServers?.["terminal-grid"]?.args;if(!Array.isArray(s)||!s.some(i=>typeof i=="string"&&/[\\/]extensions[\\/]koenma\.terminal-grid-\d/.test(i)))continue;delete n.mcpServers["terminal-grid"];let c=/\n([ \t]+)\S/.exec(a),d=c?c[1]:2,f=JSON.stringify(n,null,d);a.endsWith(`
`)&&(f+=`
`);let p=`${t}.tg-tmp.${process.pid}.${Date.now()}`;try{C.writeFileSync(p,f,"utf-8"),C.readFileSync(t,"utf-8")===a&&C.renameSync(p,t)}finally{try{C.existsSync(p)&&C.unlinkSync(p)}catch{}}}catch{}}}_getMcpServerEntry(){let e=this._mcpPort||o.workspace.getConfiguration("terminalGrid").get("apiPort",7890);return{command:"node",args:[l.ensureStableMcpScript(this._context)],env:{TERMINAL_GRID_PORT:String(e)}}}_checkMcpRegistration(){let e=this._getClaudeDesktopConfigPath(),t=!1;try{if(C.existsSync(e)){let a=C.readFileSync(e,"utf-8");t=!!JSON.parse(a)?.mcpServers?.["terminal-grid"]}}catch{}return{desktop:t}}async _registerMcpInConfig(e){let t=this._getClaudeDesktopConfigPath(),a=this._getMcpServerEntry();try{let n=T.dirname(t);C.existsSync(n)||C.mkdirSync(n,{recursive:!0});let s={};if(C.existsSync(t)){let r=C.readFileSync(t,"utf-8");s=JSON.parse(r)}return s.mcpServers||(s.mcpServers={}),s.mcpServers["terminal-grid"]=a,C.writeFileSync(t,JSON.stringify(s,null,2),"utf-8"),o.window.showInformationMessage(o.l10n.t("Terminal Grid MCP server registered in Claude Desktop. Restart Claude Desktop to activate.")),{success:!0,message:"registered"}}catch(n){let s=n instanceof Error?n.message:String(n);return o.window.showErrorMessage(o.l10n.t("Failed to register MCP server: {0}",s)),{success:!1,message:s}}}async _unregisterMcpInConfig(e){let t=this._getClaudeDesktopConfigPath();try{if(!C.existsSync(t))return{success:!0,message:"not-registered"};let a=C.readFileSync(t,"utf-8"),n=JSON.parse(a),s=n.mcpServers;return s&&"terminal-grid"in s&&(delete s["terminal-grid"],C.writeFileSync(t,JSON.stringify(n,null,2),"utf-8")),o.window.showInformationMessage(o.l10n.t("Terminal Grid MCP server unregistered from Claude Desktop. Restart Claude Desktop to apply.")),{success:!0,message:"unregistered"}}catch(a){let n=a instanceof Error?a.message:String(a);return o.window.showErrorMessage(o.l10n.t("Failed to unregister MCP server: {0}",n)),{success:!1,message:n}}}sendConfig(){if(!this._view)return;this._migrateSteps();let e=o.workspace.getConfiguration("terminalGrid"),t=this._context.globalState.get("customFonts",[]),a=g.getStartupCommands(this._tid),n=this._context.globalState.get("projects",[]),s=this._context.globalState.get("presets",[]),r=this._context.globalState.get("projectPresets",{}),c=g.getCellLabels(this._tid),d=g.getCellOverrides(this._tid),f=g.getDefaultSteps(this._tid),p=this._context.globalState.get("sectionStates",{}),i=o.workspace.workspaceFolders?.[0]?.uri.fsPath||"",b=_.currentPanel,v=_.getAvailableShells();this._view.webview.postMessage({type:"configValues",zoom:e.get("zoomPercent",100),fontFamily:e.get("fontFamily",""),bgColor:e.get("backgroundColor",""),fgColor:e.get("foregroundColor",""),colorTheme:e.get("colorTheme",""),shellType:e.get("shellType",""),defaultCommand:g.getDefaultCommand(this._tid),themeNames:le,availableShells:v.map(u=>({name:u.name,path:u.path})),customFonts:t.map(u=>u.name),startupCommands:a,projects:n,presets:s,projectPresets:r,cellLabels:c,cellOverrides:d,defaultSteps:f,sectionStates:p,workspacePath:i,gridRows:b?.getRows()??0,gridCols:b?.getCols()??0,tabs:w.entries().map(([u,h])=>({tabId:u,rows:h.getRows(),cols:h.getCols(),name:g.getTabName(u)})),activeTabId:w.getActiveTabId()??null,mergedRegions:g.getMergedRegions(this._tid),hiddenCells:(()=>{let u=g.getMergedRegions(this._tid),h=b?.getCols()??e.get("defaultCols",3),x=[];for(let S of u)for(let k=S.startRow;k<S.startRow+S.rowSpan;k++)for(let E=S.startCol;E<S.startCol+S.colSpan;E++)k===S.startRow&&E===S.startCol||x.push(k*h+E);return x})()})}_getHtml(){let e=Ue();return`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${e}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
      color: var(--vscode-foreground);
      background: transparent;
      -webkit-font-smoothing: antialiased;
    }
    .container { padding: 16px 12px; display: flex; flex-direction: column; gap: 0; }
    .glass-card + .glass-card { margin-top: 10px; }
    .glass-card.collapsed + .glass-card { margin-top: 4px; }
    .glass-card + .glass-card.collapsed { margin-top: 4px; }
    .glass-card.collapsed + .glass-card.collapsed { margin-top: 2px; }
    .hint { margin-top: 10px; }

    .glass-card {
      background: rgba(255,255,255,0.025);
      backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 14px; padding: 18px 16px;
      transition: border-color .3s, box-shadow .3s;
      position: relative;
    }
    .glass-card:has(.tip-wrap:hover) { z-index: 300; }
    .glass-card:hover { border-color: rgba(255,255,255,.10); box-shadow: 0 4px 24px rgba(0,0,0,.12); }

    .section-label {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.8px; opacity: .5; margin-bottom: 16px; user-select: none;
      color: var(--vscode-textLink-foreground, #3794ff);
    }

    .grid-selector-wrap { display: flex; justify-content: center; margin-bottom: 14px; }
    .grid-selector { display: inline-grid; gap: 4px; }
    .grid-cell {
      width: 30px; height: 30px;
      background: rgba(255,255,255,.035);
      border: 1px solid rgba(255,255,255,.06);
      border-radius: 6px; cursor: pointer;
      transition: all .1s ease;
    }
    .grid-cell.highlight {
      background: linear-gradient(135deg,rgba(0,127,212,.30),rgba(0,200,255,.18));
      border-color: rgba(0,160,230,.45);
    }
    .grid-cell.selected {
      background: linear-gradient(135deg,rgba(0,127,212,.45),rgba(0,200,255,.28));
      border-color: rgba(0,160,230,.6);
      box-shadow: 0 0 10px rgba(0,150,230,.12);
    }

    .size-label {
      text-align: center; font-size: 15px; font-weight: 600;
      opacity: .65; margin-bottom: 16px; font-variant-numeric: tabular-nums;
    }
    .size-label .num { color: var(--vscode-textLink-foreground,#3794ff); font-size: 20px; font-weight: 700; }

    .glass-btn {
      width: 100%; padding: 11px 14px;
      background: rgba(255,255,255,.035);
      border: 1px solid rgba(255,255,255,.07);
      border-radius: 10px; color: var(--vscode-foreground);
      cursor: pointer; font-size: 12px; font-weight: 500; font-family: inherit;
      transition: all .2s ease;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      outline: none; user-select: none;
    }
    .glass-btn:hover {
      background: rgba(255,255,255,.07); border-color: rgba(255,255,255,.14);
      transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,.1);
    }
    .glass-btn:active { transform: translateY(0); box-shadow: none; }
    .glass-btn.primary {
      background: linear-gradient(135deg,rgba(0,127,212,.22),rgba(0,200,255,.10));
      border-color: rgba(0,150,220,.35);
    }
    .glass-btn.primary:hover {
      background: linear-gradient(135deg,rgba(0,127,212,.35),rgba(0,200,255,.18));
      border-color: rgba(0,150,220,.55);
      box-shadow: 0 4px 20px rgba(0,150,230,.12);
    }
    .btn-group { display: flex; flex-direction: column; gap: 8px; }
    .btn-icon { font-size: 15px; opacity: .75; line-height: 1; }

    /* \u2500\u2500 Cell Merge preview \u2500\u2500 */
    .merge-row {
      display: flex; align-items: flex-start; gap: 8px;
      justify-content: center;
      margin-bottom: 8px;
      overflow: hidden;
    }
    .merge-grid {
      display: inline-grid; gap: 3px; user-select: none;
      border: 1px solid rgba(255,255,255,.06); border-radius: 8px; padding: 6px;
      background: rgba(0,0,0,.15);
      min-width: 0; flex-shrink: 1;
    }
    .merge-cell {
      min-width: 22px; min-height: 22px;
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 4px; cursor: crosshair;
      display: flex; align-items: center; justify-content: center;
      font-size: 8px; opacity: .5; transition: all .12s ease;
    }
    .merge-cell.selecting {
      background: linear-gradient(135deg,rgba(0,127,212,.35),rgba(0,200,255,.20));
      border-color: rgba(0,160,230,.5); opacity: 1;
    }
    .merge-cell.merged {
      background: linear-gradient(135deg,rgba(100,200,100,.20),rgba(60,180,60,.12));
      border-color: rgba(100,200,100,.4); opacity: 1;
    }
    .merge-cell.merged-origin { font-size: 9px; font-weight: 600; opacity: .8; }
    .merge-side {
      display: flex; flex-direction: column; gap: 4px; flex-shrink: 0;
    }
    .merge-side .glass-btn { font-size: 9px; padding: 5px 6px; min-width: 0; width: auto; }
    .merge-bottom {
      display: flex; align-items: center; justify-content: center; gap: 12px;
      margin-bottom: 12px;
    }
    .merge-legend {
      display: flex; gap: 10px; font-size: 9px; opacity: .5;
    }
    .merge-legend-item { display: flex; align-items: center; gap: 3px; }
    .merge-legend-swatch {
      width: 8px; height: 8px; border-radius: 2px; border: 1px solid rgba(255,255,255,.12);
    }
    .merge-legend-swatch.sel { background: linear-gradient(135deg,rgba(0,127,212,.35),rgba(0,200,255,.20)); }
    .merge-legend-swatch.mrg { background: linear-gradient(135deg,rgba(100,200,100,.20),rgba(60,180,60,.12)); }

    /* \u2500\u2500 Settings controls \u2500\u2500 */
    .setting-row {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 12px; gap: 12px;
    }
    .setting-row:last-child { margin-bottom: 0; }
    .setting-label { font-size: 11px; opacity: .6; white-space: nowrap; flex-shrink: 0; }
    .stepper { display: flex; align-items: center; gap: 4px; }
    .stepper-btn {
      width: 24px; height: 24px;
      border: 1px solid rgba(255,255,255,.08); border-radius: 6px;
      background: rgba(255,255,255,.03); color: var(--vscode-foreground);
      font-size: 14px; font-family: monospace;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all .15s ease; padding: 0; line-height: 1;
    }
    .stepper-btn:hover { background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.16); }
    .stepper-val {
      min-width: 40px; text-align: center; font-size: 12px; font-weight: 600;
      font-variant-numeric: tabular-nums; opacity: .8;
    }

    /* \u2500\u2500 Font dropdown (opens upward) \u2500\u2500 */
    .font-picker { position: relative; flex: 1; }
    .font-display {
      display: flex; align-items: center; justify-content: space-between;
      padding: 5px 8px;
      background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.08);
      border-radius: 6px; color: var(--vscode-foreground);
      font-size: 11px; cursor: pointer; transition: border-color .15s; user-select: none;
    }
    .font-display:hover { border-color: rgba(255,255,255,.16); }
    .font-display.open { border-color: var(--vscode-focusBorder, rgba(0,127,212,.6)); }
    .font-display-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
    .font-display-arrow { opacity: .4; font-size: 8px; margin-left: 6px; flex-shrink: 0; }
    .font-dropdown {
      display: none;
      position: absolute; bottom: calc(100% + 4px); left: 0; right: 0;
      background: var(--vscode-dropdown-background, #252526);
      border: 1px solid rgba(255,255,255,.12); border-radius: 8px;
      max-height: 220px; overflow-y: auto; z-index: 100; padding: 4px 0;
      box-shadow: 0 -4px 24px rgba(0,0,0,.3);
    }
    .font-dropdown.show { display: block; }
    .font-dropdown::-webkit-scrollbar { width: 4px; }
    .font-dropdown::-webkit-scrollbar-thumb { background: rgba(255,255,255,.12); border-radius: 2px; }
    .font-opt {
      display: flex; align-items: center; padding: 5px 10px; font-size: 11px;
      cursor: pointer; transition: background .1s;
    }
    .font-opt:hover { background: rgba(255,255,255,.06); }
    .font-opt.active { background: rgba(0,127,212,.18); }
    .font-opt-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .font-opt-del {
      width: 18px; height: 18px; border: none; border-radius: 4px;
      background: transparent; color: rgba(255,255,255,.3);
      font-size: 14px; line-height: 1; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; margin-left: 4px; transition: all .1s;
    }
    .font-opt-del:hover { background: rgba(255,80,80,.2); color: #f55; }
    .font-divider { height: 1px; background: rgba(255,255,255,.06); margin: 4px 8px; }
    .font-opt-add {
      display: flex; align-items: center; gap: 6px; padding: 5px 10px; font-size: 11px;
      cursor: pointer; transition: background .1s;
      color: var(--vscode-textLink-foreground, #3794ff);
    }
    .font-opt-add:hover { background: rgba(255,255,255,.06); }

    /* \u2500\u2500 Color picker \u2500\u2500 */
    .color-row { display: flex; align-items: center; gap: 6px; }
    .color-swatch {
      width: 24px; height: 24px; border-radius: 6px;
      border: 1px solid rgba(255,255,255,.12); cursor: pointer;
      position: relative; overflow: hidden; flex-shrink: 0;
    }
    .color-swatch input[type="color"] {
      position: absolute; top: -4px; left: -4px;
      width: 32px; height: 32px; border: none; cursor: pointer;
      opacity: 0;
    }
    .color-swatch-fill {
      width: 100%; height: 100%; border-radius: 5px;
    }
    .color-val {
      font-size: 11px; opacity: .6; flex: 1;
      font-family: monospace; font-variant-numeric: tabular-nums;
    }
    .color-reset {
      width: 18px; height: 18px; border: none; border-radius: 4px;
      background: transparent; color: rgba(255,255,255,.3);
      font-size: 13px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all .1s; flex-shrink: 0;
    }
    .color-reset:hover { background: rgba(255,255,255,.08); color: var(--vscode-foreground); }
    .color-reset.hidden { visibility: hidden; }

    .hint {
      font-size: 11px; opacity: .35; text-align: center;
      line-height: 1.5; margin-top: 4px;
    }

    /* \u2500\u2500 Tooltip \u2500\u2500 */
    .section-header {
      display: flex; align-items: center; gap: 6px;
      margin-bottom: 16px; position: relative;
    }
    .section-header .section-label { margin-bottom: 0; }
    .tip-icon {
      width: 14px; height: 14px; border-radius: 50%;
      background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
      font-size: 9px; display: inline-flex; align-items: center; justify-content: center;
      cursor: help; opacity: .5; transition: opacity .15s; flex-shrink: 0;
    }
    .tip-icon:hover { opacity: .9; }
    .tip-wrap { display: inline-flex; }
    .tip-bubble {
      display: none; position: absolute;
      top: calc(100% + 4px); left: 0; right: 0;
      width: auto; padding: 10px 12px;
      background: var(--vscode-editorHoverWidget-background, #2d2d30);
      border: 1px solid var(--vscode-editorHoverWidget-border, rgba(255,255,255,.12));
      border-radius: 8px; font-size: 11px; line-height: 1.55;
      color: var(--vscode-editorHoverWidget-foreground, var(--vscode-foreground));
      box-shadow: 0 4px 20px rgba(0,0,0,.35);
      z-index: 200; white-space: normal; pointer-events: auto;
    }
    .tip-wrap:hover .tip-bubble { display: block; }
    .tip-bubble b { opacity: .9; }
    .tip-bubble .tip-example {
      margin-top: 8px; padding: 6px 8px;
      background: rgba(0,0,0,.2); border-radius: 5px;
      font-family: monospace; font-size: 10px; line-height: 1.6;
    }

    /* \u2500\u2500 Startup Commands \u2500\u2500 */
    .cmd-list { display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px; }
    .cmd-item {
      display: flex; align-items: center; gap: 6px;
      padding: 5px 8px;
      background: rgba(255,255,255,.03);
      border: 1px solid rgba(255,255,255,.06);
      border-radius: 6px; font-size: 11px;
    }
    .cmd-item-range {
      opacity: .35; font-size: 9px; min-width: 22px; flex-shrink: 0;
      font-variant-numeric: tabular-nums; text-align: right;
    }
    .cmd-item-text {
      flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      font-family: monospace; opacity: .85;
    }
    .cmd-count { display: flex; align-items: center; gap: 2px; flex-shrink: 0; }
    .cmd-count-btn {
      width: 18px; height: 18px;
      border: 1px solid rgba(255,255,255,.06); border-radius: 4px;
      background: rgba(255,255,255,.03); color: var(--vscode-foreground);
      font-size: 12px; font-family: monospace;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all .12s; padding: 0; line-height: 1;
    }
    .cmd-count-btn:hover { background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.14); }
    .cmd-count-val {
      min-width: 18px; text-align: center; font-size: 11px; font-weight: 600;
      font-variant-numeric: tabular-nums; opacity: .7;
    }
    .cmd-item-del {
      width: 18px; height: 18px; border: none; border-radius: 4px;
      background: transparent; color: rgba(255,255,255,.3);
      font-size: 14px; line-height: 1; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: all .1s; margin-left: 2px;
    }
    .cmd-item-del:hover { background: rgba(255,80,80,.2); color: #f55; }
    .cmd-add-row { display: flex; gap: 6px; align-items: center; margin-bottom: 6px; }
    .glass-select {
      flex: 1; padding: 5px 8px;
      background: rgba(255,255,255,.03);
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 6px; color: var(--vscode-foreground);
      font-size: 11px; font-family: inherit; outline: none; cursor: pointer;
    }
    .glass-select:hover { border-color: rgba(255,255,255,.16); }
    .glass-select option { background: var(--vscode-dropdown-background, #252526); }
    .glass-input {
      flex: 1; padding: 5px 8px;
      background: rgba(255,255,255,.03);
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 6px; color: var(--vscode-foreground);
      font-size: 11px; font-family: monospace; outline: none;
    }
    .glass-input:focus { border-color: var(--vscode-focusBorder, rgba(0,127,212,.6)); }
    .cmd-empty { font-size: 11px; opacity: .35; text-align: center; padding: 8px 0; }

    /* \u2500\u2500 Broadcast targets \u2500\u2500 */
    .broadcast-targets {
      display: flex; flex-wrap: wrap; gap: 6px;
      margin-bottom: 10px;
    }
    .broadcast-targets.hidden { display: none; }
    .broadcast-target {
      display: flex; align-items: center; gap: 3px;
      font-size: 11px; opacity: .7; cursor: pointer; user-select: none;
    }
    .broadcast-target input[type="checkbox"] {
      accent-color: var(--vscode-textLink-foreground, #3794ff);
      cursor: pointer; margin: 0;
    }
    .broadcast-target.all-label { font-weight: 600; opacity: .85; margin-right: 4px; }

    /* \u2500\u2500 Collapsible sections \u2500\u2500 */
    .section-header.collapsible { cursor: pointer; user-select: none; }
    .collapse-icon {
      font-size: 10px; opacity: .4; transition: transform .2s;
      margin-left: auto; flex-shrink: 0;
    }
    .glass-card.collapsed .collapse-icon { transform: rotate(-90deg); }
    .glass-card.collapsed .section-body { display: none; }
    .glass-card.collapsed { padding: 8px 16px; }
    .glass-card.collapsed .section-header { margin-bottom: 0; }

    /* \u2500\u2500 Settings tabs \u2500\u2500 */
    .settings-tabs {
      display: flex; flex-wrap: wrap; gap: 4px;
      margin-bottom: 12px;
    }
    .settings-tabs.hidden { display: none; }
    .stab {
      padding: 3px 8px; font-size: 10px; font-weight: 600;
      border: 1px solid rgba(255,255,255,.08); border-radius: 6px;
      background: rgba(255,255,255,.03); color: var(--vscode-foreground);
      cursor: pointer; transition: all .15s; font-family: inherit;
      opacity: .6; line-height: 1.4;
    }
    .stab:hover { background: rgba(255,255,255,.06); opacity: .8; }
    .stab.active {
      background: rgba(0,127,212,.18); border-color: rgba(0,150,220,.4);
      opacity: 1; color: var(--vscode-textLink-foreground, #3794ff);
    }
    .stab.has-override {
      border-color: rgba(255,170,0,.35);
    }
    /* \u2500\u2500 Command summary \u2500\u2500 */
    .cmd-summary-divider {
      height: 1px; background: rgba(255,255,255,.06); margin: 10px 0 8px;
    }
    .cmd-summary-list { display: flex; flex-direction: column; gap: 3px; }
    .cmd-summary-item {
      display: flex; align-items: center; gap: 6px;
      padding: 4px 8px;
      background: rgba(255,255,255,.02);
      border: 1px solid rgba(255,255,255,.04);
      border-radius: 5px; font-size: 10px;
    }
    .cmd-summary-label {
      opacity: .45; font-weight: 600; min-width: 28px; flex-shrink: 0;
      font-variant-numeric: tabular-nums;
    }
    .cmd-summary-text {
      flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      font-family: monospace; opacity: .75; font-size: 10px;
    }
    .cmd-summary-del {
      width: 16px; height: 16px; border: none; border-radius: 3px;
      background: transparent; color: rgba(255,255,255,.25);
      font-size: 12px; line-height: 1; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: all .1s;
    }
    .cmd-summary-del:hover { background: rgba(255,80,80,.2); color: #f55; }
    /* \u2500\u2500 Step groups (sequential startup commands) \u2500\u2500 */
    .cmd-step-group { margin-bottom: 6px; }
    .cmd-step-group-header {
      font-size: 9px; font-weight: 700; text-transform: uppercase;
      letter-spacing: .5px; opacity: .4; margin-bottom: 4px; padding: 0 4px;
      color: var(--vscode-textLink-foreground, #3794ff);
    }
    .cmd-step-list { display: flex; flex-direction: column; gap: 2px; min-height: 4px; }
    .cmd-step-item {
      display: flex; align-items: center; gap: 5px;
      padding: 4px 6px; background: rgba(255,255,255,.025);
      border: 1px solid rgba(255,255,255,.05); border-radius: 5px;
      font-size: 10px; cursor: grab; transition: background .15s, border-color .15s, opacity .15s;
      user-select: none;
    }
    .cmd-step-item:hover { background: rgba(255,255,255,.05); border-color: rgba(255,255,255,.10); }
    .cmd-step-item.dragging { opacity: .4; border-color: var(--vscode-focusBorder, rgba(0,127,212,.6)); }
    .cmd-step-handle { cursor: grab; opacity: .3; font-size: 14px; line-height: 1; flex-shrink: 0; width: 14px; text-align: center; }
    .cmd-step-handle:hover { opacity: .6; }
    .cmd-step-num {
      opacity: .3; font-size: 9px; font-weight: 700; min-width: 14px;
      text-align: center; flex-shrink: 0; font-variant-numeric: tabular-nums;
    }
    .cmd-step-icon { opacity: .5; font-size: 9px; margin-right: 2px; }
    .cmd-step-text {
      flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      font-family: monospace; opacity: .75; font-size: 10px;
    }
    .cmd-step-del {
      width: 16px; height: 16px; border: none; border-radius: 3px;
      background: transparent; color: rgba(255,255,255,.25);
      font-size: 12px; line-height: 1; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: all .1s;
    }
    .cmd-step-del:hover { background: rgba(255,80,80,.2); color: #f55; }
    /* \u2500\u2500 node-pty banner \u2500\u2500 */
    .pty-banner {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 14px;
      background: linear-gradient(135deg, rgba(255,170,0,.12), rgba(255,120,0,.08));
      border: 1px solid rgba(255,170,0,.25);
      border-radius: 10px;
      font-size: 11px; line-height: 1.45;
    }
    .pty-banner-icon { font-size: 16px; flex-shrink: 0; }
    .pty-banner-text { flex: 1; opacity: .85; }
    .pty-banner-btn {
      padding: 5px 10px;
      background: rgba(255,170,0,.18);
      border: 1px solid rgba(255,170,0,.35);
      border-radius: 6px; color: var(--vscode-foreground);
      cursor: pointer; font-size: 10px; font-weight: 600; font-family: inherit;
      white-space: nowrap; transition: all .15s; flex-shrink: 0;
    }
    .pty-banner-btn:hover {
      background: rgba(255,170,0,.3);
      border-color: rgba(255,170,0,.5);
    }
    /* \u2500\u2500 Tabs card \u2500\u2500 */
    .tabs-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .tabs-empty {
      font-size: 11px;
      opacity: .5;
      text-align: center;
      padding: 12px 0;
    }
    .tab-item {
      display: flex;
      align-items: center;
      padding: 6px 10px;
      border-radius: 4px;
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(255,255,255,.08);
      cursor: pointer;
      font-size: 11px;
      transition: background .15s, border-color .15s;
      user-select: none;
    }
    .tab-item:hover {
      background: rgba(255,255,255,.07);
      border-color: rgba(255,255,255,.15);
    }
    .tab-item.active {
      background: rgba(100,170,255,.12);
      border-color: rgba(100,170,255,.35);
    }
    .tab-item-label {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .tab-item-meta {
      opacity: .55;
      margin-left: 6px;
      font-size: 10px;
    }
    .tab-item-close {
      background: transparent;
      border: none;
      color: inherit;
      opacity: .5;
      cursor: pointer;
      padding: 2px 6px;
      margin-left: 6px;
      border-radius: 3px;
      font-size: 13px;
      line-height: 1;
    }
    .tab-item-close:hover:not(:disabled) {
      background: rgba(255,80,80,.2);
      opacity: 1;
    }
    .tab-item-close:disabled {
      opacity: .2;
      cursor: not-allowed;
    }
    .tab-item-input {
      flex: 1;
      min-width: 0;
      background: rgba(0,0,0,.3);
      border: 1px solid rgba(100,170,255,.6);
      color: inherit;
      font-size: 11px;
      padding: 3px 6px;
      border-radius: 3px;
      outline: none;
      font-family: inherit;
    }
    .tab-item-input:focus {
      border-color: rgba(100,170,255,.9);
      background: rgba(0,0,0,.4);
    }
    .tab-item.editing {
      background: rgba(100,170,255,.18);
      border-color: rgba(100,170,255,.5);
    }
    .section-active-tab {
      font-size: 10px;
      opacity: .6;
      margin-left: 6px;
      font-weight: normal;
      color: rgba(100,170,255,.9);
    }
  </style>
</head>
<body>
  <div class="container">
    ${$e()?"":`
    <div class="pty-banner" id="ptyBanner">
      <span class="pty-banner-icon">\u26A0</span>
      <span class="pty-banner-text">${o.l10n.t("node-pty is required to use Terminal Grid.")}</span>
      <button class="pty-banner-btn" id="ptyInstallBtn">${o.l10n.t("Install")}</button>
    </div>
    `}
    <!-- Projects -->
    <div class="glass-card" data-section="projects">
      <div class="section-header collapsible">
        <div class="section-label">${o.l10n.t("Projects")}</div>
        <span class="tip-wrap">
          <span class="tip-icon">?</span>
          <div class="tip-bubble">
            ${o.l10n.t("Register projects and click to switch folders. Ctrl+Click to open in a new window. If a preset is linked, it will be auto-applied on switch.")}
          </div>
        </span>
        <span class="collapse-icon">\u25BE</span>
      </div>
      <div class="section-body">
        <div id="mcpPortInfo" style="font-size: 11px; opacity: 0.7; margin-bottom: 8px; display: ${this._mcpPort>0?"block":"none"};">
          MCP Port: <span id="mcpPortValue">${this._mcpPort}</span>
        </div>
        <div id="projectList" class="cmd-list"></div>
        <div class="btn-group" style="gap: 6px;">
          <button class="glass-btn" id="addCurrentProjectBtn" style="font-size: 11px; padding: 8px 10px;">
            <span class="btn-icon" style="font-size: 12px;">+</span> ${o.l10n.t("Add Current Folder")}
          </button>
          <button class="glass-btn" id="browseProjectBtn" style="font-size: 11px; padding: 8px 10px;">
            <span class="btn-icon" style="font-size: 12px;">&#128193;</span> ${o.l10n.t("Browse Folder")}
          </button>
        </div>
      </div>
    </div>

    <!-- Tabs (multi-grid management) -->
    <div class="glass-card collapsed" data-section="tabs">
      <div class="section-header collapsible">
        <div class="section-label">${o.l10n.t("Tabs")}</div>
        <span class="tip-wrap">
          <span class="tip-icon">?</span>
          <div class="tip-bubble">
            ${o.l10n.t("Manage multiple grid tabs \u2014 each tab keeps its own labels, cell settings, merges, and startup steps. Click a tab to focus it, right-click or double-click to rename. + opens a new empty tab, \u29C9 duplicates the active tab, \xD7 closes a tab (last tab can't be closed).")}
          </div>
        </span>
        <span class="collapse-icon">\u25BE</span>
      </div>
      <div class="section-body">
        <div id="tabsList" class="tabs-list"></div>
        <div class="tabs-actions" style="display: flex; gap: 6px; margin-top: 8px;">
          <button class="glass-btn" id="newTabBtn" title="${o.l10n.t("New tab (same size as active)")}" style="font-size: 11px; padding: 8px 10px; flex: 1;">
            <span class="btn-icon">+</span> ${o.l10n.t("New Tab")}
          </button>
          <button class="glass-btn" id="duplicateTabBtn" title="${o.l10n.t("Duplicate active tab (copies labels, overrides, merges, startup)")}" style="font-size: 11px; padding: 8px 10px; flex: 1;">
            <span class="btn-icon">\u29C9</span> ${o.l10n.t("Duplicate")}
          </button>
        </div>
      </div>
    </div>

    <div class="glass-card" data-section="gridSize">
      <div class="section-header collapsible">
        <div class="section-label">${o.l10n.t("Select Grid Size")} <span id="gridSizeActiveLabel" class="section-active-tab"></span></div>
        <span class="tip-wrap">
          <span class="tip-icon">?</span>
          <div class="tip-bubble">
            ${o.l10n.t("Hover to select the desired rows\xD7cols size. Supports up to 4\xD75 (20 cells). Grid opens as an editor tab, each cell is an independent terminal. Drag cells below to merge them into one larger terminal.")}
          </div>
        </span>
        <span class="collapse-icon">\u25BE</span>
      </div>
      <div class="section-body">
        <div class="grid-selector-wrap">
          <div class="grid-selector" id="gridSelector"></div>
        </div>
        <div class="size-label" id="sizeLabel"></div>
        <div class="merge-row">
          <div class="merge-grid" id="mergeGrid"></div>
          <div class="merge-side">
            <button class="glass-btn" id="mergeBtn" disabled>${o.l10n.t("Merge")}</button>
            <button class="glass-btn" id="unmergeBtn" disabled>${o.l10n.t("Unmerge")}</button>
            <button class="glass-btn" id="mergeClearBtn">${o.l10n.t("Clear")}</button>
          </div>
        </div>
        <div class="merge-bottom">
          <div class="merge-legend">
            <div class="merge-legend-item"><div class="merge-legend-swatch sel"></div> ${o.l10n.t("Selection")}</div>
            <div class="merge-legend-item"><div class="merge-legend-swatch mrg"></div> ${o.l10n.t("Merged")}</div>
          </div>
        </div>
        <button class="glass-btn primary" id="openGridBtn">
          <span class="btn-icon">&#9654;</span> ${o.l10n.t("Open Grid")}
        </button>
      </div>
    </div>

    <div class="glass-card collapsed" data-section="mcpRegister">
      <div class="section-header collapsible">
        <div class="section-label">${o.l10n.t("MCP Registration")}</div>
        <span class="tip-wrap">
          <span class="tip-icon">?</span>
          <div class="tip-bubble">
            ${o.l10n.t("Register the Terminal Grid MCP server in Claude Desktop so it can control your terminal grid. This writes the server config to Claude Desktop's configuration file.")}
          </div>
        </span>
        <span class="collapse-icon">\u25BE</span>
      </div>
      <div class="section-body">
        <div id="mcpRegStatus" style="font-size: 11px; opacity: .6; margin-bottom: 10px;"></div>
        <button class="glass-btn" id="registerMcpDesktopBtn">
          <span class="btn-icon">&#9889;</span> ${o.l10n.t("Register in Claude Desktop")}
        </button>
      </div>
    </div>

    <div class="glass-card" data-section="settings">
      <div class="section-header collapsible">
        <div class="section-label">${o.l10n.t("Terminal Settings")}</div>
        <span class="tip-wrap">
          <span class="tip-icon">?</span>
          <div class="tip-bubble">
            ${o.l10n.t("Zoom: Global font size (50\u2013300%). Font/Color: Use tabs for global or per-cell settings. Changes in All tab apply to all cells. Set global first, then customize individual cells. Individual cells can be zoomed separately with Ctrl+Wheel.")}
          </div>
        </span>
        <span class="collapse-icon">\u25BE</span>
      </div>
      <div class="section-body">
        <div class="setting-row">
          <span class="setting-label">${o.l10n.t("Zoom")}</span>
          <div class="stepper">
            <button class="stepper-btn" id="zoomDown">\u2212</button>
            <span class="stepper-val" id="zoomVal">100%</span>
            <button class="stepper-btn" id="zoomUp">+</button>
          </div>
        </div>

        <div id="settingsTabs" class="settings-tabs hidden"></div>

        <div class="setting-row">
          <span class="setting-label">${o.l10n.t("Theme")}</span>
          <div class="font-picker" id="themePicker">
            <div class="font-display" id="themeDisplay">
              <span class="font-display-text" id="themeDisplayText">${o.l10n.t("IDE Default")}</span>
              <span class="font-display-arrow">\u25B2</span>
            </div>
            <div class="font-dropdown" id="themeDropdown"></div>
          </div>
        </div>

        <div class="setting-row">
          <span class="setting-label">${o.l10n.t("Font")}</span>
          <div class="font-picker" id="fontPicker">
            <div class="font-display" id="fontDisplay">
              <span class="font-display-text" id="fontDisplayText">${o.l10n.t("IDE Default")}</span>
              <span class="font-display-arrow">\u25B2</span>
            </div>
            <div class="font-dropdown" id="fontDropdown"></div>
          </div>
        </div>

        <div class="setting-row">
          <span class="setting-label">${o.l10n.t("Back Color")}</span>
          <div class="color-row">
            <div class="color-swatch" id="bgSwatch">
              <div class="color-swatch-fill" id="bgSwatchFill"></div>
              <input type="color" id="bgColorInput" value="#1e1e1e">
            </div>
            <span class="color-val" id="bgVal">${o.l10n.t("IDE Default")}</span>
            <button class="color-reset hidden" id="bgReset" title="${o.l10n.t("Reset to IDE Default")}">\xD7</button>
          </div>
        </div>

        <div class="setting-row">
          <span class="setting-label">${o.l10n.t("Font Color")}</span>
          <div class="color-row">
            <div class="color-swatch" id="fgSwatch">
              <div class="color-swatch-fill" id="fgSwatchFill"></div>
              <input type="color" id="fgColorInput" value="#cccccc">
            </div>
            <span class="color-val" id="fgVal">${o.l10n.t("IDE Default")}</span>
            <button class="color-reset hidden" id="fgReset" title="${o.l10n.t("Reset to IDE Default")}">\xD7</button>
          </div>
        </div>

      </div>
    </div>

    <!-- Startup Commands -->
    <div class="glass-card" data-section="startup">
      <div class="section-header collapsible">
        <div class="section-label">${o.l10n.t("Startup Commands")}</div>
        <span class="tip-wrap">
          <span class="tip-icon">?</span>
          <div class="tip-bubble">
            ${o.l10n.t("Set shell type and startup command per cell. Use All tab for global defaults, or individual tabs for per-cell overrides.")}
          </div>
        </span>
        <span class="collapse-icon">\u25BE</span>
      </div>
      <div class="section-body">
        <div id="cmdTabs" class="settings-tabs hidden"></div>
        <div class="setting-row">
          <span class="setting-label">${o.l10n.t("Shell")}</span>
          <div class="font-picker" id="shellPicker">
            <div class="font-display" id="shellDisplay">
              <span class="font-display-text" id="shellDisplayText">${o.l10n.t("IDE Default")}</span>
              <span class="font-display-arrow">\u25B2</span>
            </div>
            <div class="font-dropdown" id="shellDropdown"></div>
          </div>
        </div>
        <div class="setting-row">
          <span class="setting-label">${o.l10n.t("Command")}</span>
          <select class="glass-select" id="cmdPreset" style="flex:1;min-width:0;">
            <option value="">${o.l10n.t("Select command\u2026")}</option>
            <optgroup label="${o.l10n.t("Claude")}">
              <option value="claude">claude</option>
              <option value="claude --dangerously-skip-permissions">claude --skip-perms</option>
            </optgroup>
            <optgroup label="${o.l10n.t("Claude \xB7 effort (launch)")}">
              <option value="claude --effort low">claude --effort low</option>
              <option value="claude --effort medium">claude --effort medium</option>
              <option value="claude --effort high">claude --effort high</option>
              <option value="claude --effort xhigh">claude --effort xhigh</option>
              <option value="claude --effort max">claude --effort max</option>
              <option value="claude --dangerously-skip-permissions --effort low">claude --skip-perms --effort low</option>
              <option value="claude --dangerously-skip-permissions --effort medium">claude --skip-perms --effort medium</option>
              <option value="claude --dangerously-skip-permissions --effort high">claude --skip-perms --effort high</option>
              <option value="claude --dangerously-skip-permissions --effort xhigh">claude --skip-perms --effort xhigh</option>
              <option value="claude --dangerously-skip-permissions --effort max">claude --skip-perms --effort max</option>
            </optgroup>
            <optgroup label="${o.l10n.t("Claude \xB7 model (launch)")}">
              <option value="claude --model fable">claude --model fable (Fable 5)</option>
              <option value="claude --model claude-fable-5">claude --model claude-fable-5</option>
              <option value="claude --model opus">claude --model opus (Opus 4.8)</option>
              <option value="claude --model sonnet">claude --model sonnet (Sonnet 4.6)</option>
              <option value="claude --model haiku">claude --model haiku (Haiku 4.5)</option>
              <option value="claude --model fable --effort max">claude --model fable --effort max</option>
              <option value="claude --dangerously-skip-permissions --model fable --effort max">claude --skip-perms --model fable --effort max</option>
              <option value="claude --model fable --fallback-model opus">claude --model fable --fallback-model opus</option>
            </optgroup>
            <optgroup label="${o.l10n.t("Codex")}">
              <option value="codex">codex</option>
              <option value="codex -s danger-full-access -a never">codex -s danger-full-access -a never</option>
            </optgroup>
            <optgroup label="${o.l10n.t("Claude \xB7 slash (after start)")}">
              <option value="/resume">/resume</option>
              <option value="/compact">/compact</option>
              <option value="/effort low">/effort low</option>
              <option value="/effort medium">/effort medium</option>
              <option value="/effort high">/effort high</option>
              <option value="/effort xhigh">/effort xhigh</option>
              <option value="/effort max">/effort max</option>
              <option value="/effort ultracode">/effort ultracode</option>
            </optgroup>
            <option value="npm run dev">npm run dev</option>
            <option value="npm start">npm start</option>
            <option value="npm test">npm test</option>
            <option value="python">python</option>
            <option value="node">node</option>
            <option value="docker compose up">docker compose up</option>
            <option value="ssh">ssh</option>
            <option value="htop">htop</option>
            <option value="yes">yes</option>
            <option value="exit">exit</option>
            <option value="__enter__">Enter (\u21B5)</option>
            <option value="__custom__">${o.l10n.t("Custom command\u2026")}</option>
            <option value="__timeout__">${o.l10n.t("Timeout (ms)\u2026")}</option>
          </select>
        </div>
        <div class="cmd-add-row" id="cmdCustomRow" style="display:none;">
          <input class="glass-input" id="cmdCustom" placeholder="${o.l10n.t("Custom command\u2026")}" style="flex:1;min-width:0;" />
          <button class="stepper-btn" id="cmdApplyBtn" title="${o.l10n.t("Apply")}">&#10003;</button>
        </div>
        <div class="cmd-add-row" id="cmdTimeoutRow" style="display:none;">
          <input class="glass-input" type="number" id="cmdTimeoutMs" placeholder="${o.l10n.t("Milliseconds (e.g. 1500)")}" min="100" step="100" style="flex:1;min-width:0;" />
          <button class="stepper-btn" id="cmdTimeoutApplyBtn" title="${o.l10n.t("Apply")}">&#10003;</button>
        </div>
        <div class="cmd-summary-divider"></div>
        <div id="cmdSummaryList" class="cmd-summary-list"></div>
      </div>
    </div>

    <!-- Presets -->
    <div class="glass-card" data-section="presets">
      <div class="section-header collapsible">
        <div class="section-label">${o.l10n.t("Presets")}</div>
        <span class="tip-wrap">
          <span class="tip-icon">?</span>
          <div class="tip-bubble">
            ${o.l10n.t("Save and load current grid settings (size, zoom, font, color, commands, cell labels) as presets. Use Link to project for per-project auto-apply.")}
          </div>
        </span>
        <span class="collapse-icon">\u25BE</span>
      </div>
      <div class="section-body">
        <div class="cmd-add-row">
          <input class="glass-input" id="presetNameInput" placeholder="${o.l10n.t("Preset name\u2026")}" style="flex: 1;" />
        </div>
        <div class="cmd-add-row" style="margin-top: 4px;">
          <select class="glass-select" id="presetSelect" style="flex: 1;">
            <option value="">${o.l10n.t("Select preset\u2026")}</option>
          </select>
        </div>
        <div class="btn-group" style="gap: 6px; margin-top: 8px;">
          <div style="display: flex; gap: 6px;">
            <button class="glass-btn" id="presetSaveBtn" style="font-size: 11px; padding: 8px 10px; flex: 1;">${o.l10n.t("Save")}</button>
            <button class="glass-btn primary" id="presetLoadBtn" style="font-size: 11px; padding: 8px 10px; flex: 1;">${o.l10n.t("Load")}</button>
            <button class="glass-btn" id="presetDeleteBtn" style="font-size: 11px; padding: 8px 10px; flex: 1;">${o.l10n.t("Delete")}</button>
          </div>
          <div id="presetLinkRow" style="display: flex; align-items: center; gap: 6px; font-size: 11px; opacity: .7; margin-top: 4px;">
            <input type="checkbox" id="presetLinkCheck" style="margin: 0;" />
            <label id="presetLinkLabel" for="presetLinkCheck" style="cursor: pointer;">${o.l10n.t("Link to current project")}</label>
          </div>
        </div>
      </div>
    </div>

    <!-- Broadcast Input -->
    <div class="glass-card" data-section="broadcast">
      <div class="section-header collapsible">
        <div class="section-label">${o.l10n.t("Broadcast Input")}</div>
        <span class="tip-wrap">
          <span class="tip-icon">?</span>
          <div class="tip-bubble">
            ${o.l10n.t("Send text to selected terminals. Check All to send to all cells, uncheck for individual selection.")}
          </div>
        </span>
        <span class="collapse-icon">\u25BE</span>
      </div>
      <div class="section-body">
        <div id="broadcastTargets" class="broadcast-targets hidden"></div>
        <div class="cmd-add-row" style="flex-direction: column; gap: 4px;">
          <textarea class="glass-input" id="broadcastInput" placeholder="${o.l10n.t("Type command\u2026")}" rows="3" style="width: 100%; resize: vertical; font-family: var(--vscode-editor-fontFamily, monospace); font-size: 12px; line-height: 1.4;"></textarea>
          <div style="display: flex; justify-content: flex-end;">
            <button class="stepper-btn" id="broadcastSendBtn" title="${o.l10n.t("Send")}" style="width: 50px;">${o.l10n.t("Send")}</button>
          </div>
        </div>
      </div>
    </div>

    <div class="glass-card" data-section="actions">
      <div class="section-header collapsible">
        <div class="section-label">${o.l10n.t("Actions")}</div>
        <span class="collapse-icon">\u25BE</span>
      </div>
      <div class="section-body">
        <div class="btn-group">
          <button class="glass-btn" id="reloadBtn">
            <span class="btn-icon">&#8635;</span> ${o.l10n.t("Reload Window")}
          </button>
        </div>
      </div>
    </div>

    <div class="hint">
      ${o.l10n.t(`Grid opens as an editor tab.
Ctrl+Wheel to zoom individual cells.`).replace(`
`,"<br>")}
    </div>
  </div>

  <script nonce="${e}">
    var __i18n = ${JSON.stringify({installing:o.l10n.t("Installing\u2026"),ideDefault:o.l10n.t("IDE Default"),remove:o.l10n.t("Remove"),addFontFile:o.l10n.t("Add font file\u2026"),all:o.l10n.t("All"),noStartupCommands:o.l10n.t("No startup commands configured"),noProjects:o.l10n.t("No projects registered"),linkedPrefix:o.l10n.t("Linked: {0}"),linkToProject:o.l10n.t("Link to current project"),selectPreset:o.l10n.t("Select preset\u2026"),reload:o.l10n.t("Reload"),retry:o.l10n.t("Retry"),ptyInstalled:o.l10n.t("node-pty installed successfully!"),ptyInstalledHint:o.l10n.t("Reload the window to activate."),theme:o.l10n.t("Theme"),shellAuto:o.l10n.t("IDE Default"),shell:o.l10n.t("Shell"),mcpAlreadyRegistered:o.l10n.t("Registered in Claude Desktop"),mcpRegister:o.l10n.t("Register in Claude Desktop"),mcpUnregister:o.l10n.t("Unregister"),mcpRegisteredStatus:o.l10n.t("\u2705 Registered in Claude Desktop")})};
    var vscode = acquireVsCodeApi();

    // node-pty install button
    var ptyInstallBtn = document.getElementById('ptyInstallBtn');
    if (ptyInstallBtn) {
      ptyInstallBtn.addEventListener('click', function() {
        ptyInstallBtn.textContent = __i18n.installing;
        ptyInstallBtn.disabled = true;
        vscode.postMessage({ type: 'installNodePty' });
      });
    }

    var MAX_ROWS = 4, MAX_COLS = 5;
    var selectedRows = 2, selectedCols = 3;
    var hoverRow = -1, hoverCol = -1;

    var saved = vscode.getState();
    if (saved) { selectedRows = saved.rows || 2; selectedCols = saved.cols || 3; }

    var gridEl = document.getElementById('gridSelector');
    gridEl.style.gridTemplateColumns = 'repeat(' + MAX_COLS + ', 1fr)';
    var cells = [];

    for (var r = 0; r < MAX_ROWS; r++) {
      for (var c = 0; c < MAX_COLS; c++) {
        (function(row, col) {
          var cell = document.createElement('div');
          cell.className = 'grid-cell';
          cell.addEventListener('mouseenter', function() { hoverRow = row; hoverCol = col; render(); });
          cell.addEventListener('click', function() {
            selectedRows = row + 1; selectedCols = col + 1;
            hoverRow = -1; hoverCol = -1;
            render();
            vscode.setState({ rows: selectedRows, cols: selectedCols });
          });
          gridEl.appendChild(cell);
          cells.push({ el: cell, row: row, col: col });
        })(r, c);
      }
    }

    gridEl.addEventListener('mouseleave', function() { hoverRow = -1; hoverCol = -1; render(); });

    function render() {
      var isH = hoverRow >= 0;
      var aR = isH ? hoverRow : selectedRows - 1;
      var aC = isH ? hoverCol : selectedCols - 1;
      for (var i = 0; i < cells.length; i++) {
        var inside = cells[i].row <= aR && cells[i].col <= aC;
        cells[i].el.classList.toggle('highlight', inside && isH);
        cells[i].el.classList.toggle('selected', inside && !isH);
      }
      var dR = aR + 1, dC = aC + 1;
      document.getElementById('sizeLabel').innerHTML =
        '<span class="num">' + dR + '</span> \\u00d7 <span class="num">' + dC + '</span>';
    }
    render();

    document.getElementById('openGridBtn').addEventListener('click', function() {
      vscode.postMessage({ type: 'openGrid', rows: selectedRows, cols: selectedCols });
    });
    document.getElementById('reloadBtn').addEventListener('click', function() {
      vscode.postMessage({ type: 'reload' });
    });

    // \u2500\u2500 MCP Registration \u2500\u2500
    var mcpRegStatusEl = document.getElementById('mcpRegStatus');
    var registerMcpDesktopBtn = document.getElementById('registerMcpDesktopBtn');
    var mcpAlreadyRegistered = false;
    registerMcpDesktopBtn.addEventListener('click', function() {
      registerMcpDesktopBtn.disabled = true;
      registerMcpDesktopBtn.style.opacity = '0.5';
      if (mcpAlreadyRegistered) {
        vscode.postMessage({ type: 'unregisterMcpDesktop' });
      } else {
        vscode.postMessage({ type: 'registerMcpDesktop' });
      }
    });
    // Check registration status on load
    vscode.postMessage({ type: 'checkMcpRegistration' });
    function setMcpRegistered(registered) {
      mcpAlreadyRegistered = registered;
      registerMcpDesktopBtn.disabled = false;
      registerMcpDesktopBtn.style.opacity = '1';
      registerMcpDesktopBtn.style.cursor = 'pointer';
      if (registered) {
        mcpRegStatusEl.innerHTML = __i18n.mcpRegisteredStatus;
        registerMcpDesktopBtn.innerHTML = '<span class="btn-icon">\u2716</span> ' + __i18n.mcpUnregister;
      } else {
        mcpRegStatusEl.innerHTML = '';
        registerMcpDesktopBtn.innerHTML = '<span class="btn-icon">&#9889;</span> ' + __i18n.mcpRegister;
      }
    }

    // \u2500\u2500 Cell Merge preview grid \u2500\u2500
    var mergeGridEl = document.getElementById('mergeGrid');
    var mergeBtn = document.getElementById('mergeBtn');
    var unmergeBtn = document.getElementById('unmergeBtn');
    var mergeClearBtn = document.getElementById('mergeClearBtn');
    var mergeCells = [];       // { el, row, col }
    var mergedRegions = [];    // { startRow, startCol, rowSpan, colSpan }
    var mergeSelStart = null;  // { row, col }
    var mergeSelEnd = null;    // { row, col }
    var mergeDragging = false;
    var mergeRows = selectedRows, mergeCols = selectedCols;

    function buildMergeGrid() {
      mergeRows = selectedRows;
      mergeCols = selectedCols;
      mergeGridEl.innerHTML = '';
      mergeCells = [];
      mergeGridEl.style.gridTemplateColumns = 'repeat(' + mergeCols + ', 1fr)';
      for (var r = 0; r < mergeRows; r++) {
        for (var c = 0; c < mergeCols; c++) {
          (function(row, col) {
            var cell = document.createElement('div');
            cell.className = 'merge-cell';
            cell.textContent = String(row * mergeCols + col + 1);
            cell.addEventListener('mousedown', function(e) {
              e.preventDefault();
              mergeDragging = true;
              mergeSelStart = { row: row, col: col };
              mergeSelEnd = { row: row, col: col };
              renderMergeGrid();
            });
            cell.addEventListener('mouseenter', function() {
              if (mergeDragging && mergeSelStart) {
                mergeSelEnd = { row: row, col: col };
                renderMergeGrid();
              }
            });
            mergeGridEl.appendChild(cell);
            mergeCells.push({ el: cell, row: row, col: col });
          })(r, c);
        }
      }
      renderMergeGrid();
    }

    document.addEventListener('mouseup', function() {
      if (mergeDragging) {
        mergeDragging = false;
        renderMergeGrid();
      }
    });

    function getSelectionRect() {
      if (!mergeSelStart || !mergeSelEnd) return null;
      var r1 = Math.min(mergeSelStart.row, mergeSelEnd.row);
      var r2 = Math.max(mergeSelStart.row, mergeSelEnd.row);
      var c1 = Math.min(mergeSelStart.col, mergeSelEnd.col);
      var c2 = Math.max(mergeSelStart.col, mergeSelEnd.col);
      if (r1 === r2 && c1 === c2) return null; // single cell = no selection
      return { r1: r1, r2: r2, c1: c1, c2: c2 };
    }

    function getMergedRegionAt(row, col) {
      for (var i = 0; i < mergedRegions.length; i++) {
        var m = mergedRegions[i];
        if (row >= m.startRow && row < m.startRow + m.rowSpan &&
            col >= m.startCol && col < m.startCol + m.colSpan) {
          return m;
        }
      }
      return null;
    }

    // Returns { absorbed: [indices], conflicts: [indices] }
    // absorbed = fully inside selection \u2192 will be removed on merge
    // conflicts = partially overlapping \u2192 blocks merge
    function checkSelectionMergeCompat(rect) {
      var absorbed = [], conflicts = [];
      for (var i = 0; i < mergedRegions.length; i++) {
        var m = mergedRegions[i];
        var mR1 = m.startRow, mR2 = m.startRow + m.rowSpan - 1;
        var mC1 = m.startCol, mC2 = m.startCol + m.colSpan - 1;
        var overlaps = !(mR2 < rect.r1 || mR1 > rect.r2 || mC2 < rect.c1 || mC1 > rect.c2);
        if (!overlaps) continue;
        var fullyContained = mR1 >= rect.r1 && mR2 <= rect.r2 && mC1 >= rect.c1 && mC2 <= rect.c2;
        if (fullyContained) { absorbed.push(i); } else { conflicts.push(i); }
      }
      return { absorbed: absorbed, conflicts: conflicts };
    }

    function renderMergeGrid() {
      var sel = getSelectionRect();
      // Check if single selected cell is inside a merged region (for unmerge)
      var clickedRegion = null;
      if (!sel && mergeSelStart && !mergeDragging) {
        clickedRegion = getMergedRegionAt(mergeSelStart.row, mergeSelStart.col);
      }

      for (var i = 0; i < mergeCells.length; i++) {
        var mc = mergeCells[i];
        var el = mc.el;
        el.className = 'merge-cell';
        // Explicit grid position for every cell to prevent auto-placement issues
        el.style.gridColumn = String(mc.col + 1);
        el.style.gridRow = String(mc.row + 1);
        el.style.display = '';
        el.textContent = String(mc.row * mergeCols + mc.col + 1);

        // Mark merged cells
        var region = getMergedRegionAt(mc.row, mc.col);
        if (region) {
          if (mc.row === region.startRow && mc.col === region.startCol) {
            el.classList.add('merged', 'merged-origin');
            el.style.gridColumn = (mc.col + 1) + ' / span ' + region.colSpan;
            el.style.gridRow = (mc.row + 1) + ' / span ' + region.rowSpan;
            var cellNums = [];
            for (var rr = region.startRow; rr < region.startRow + region.rowSpan; rr++) {
              for (var cc = region.startCol; cc < region.startCol + region.colSpan; cc++) {
                cellNums.push(rr * mergeCols + cc + 1);
              }
            }
            el.textContent = cellNums.join('+');
          } else {
            el.style.display = 'none';
          }
        }

        // Mark selection
        if (sel && mc.row >= sel.r1 && mc.row <= sel.r2 && mc.col >= sel.c1 && mc.col <= sel.c2) {
          el.classList.add('selecting');
        }

        // Highlight clicked merged region for unmerge
        if (clickedRegion && region === clickedRegion) {
          el.classList.add('selecting');
        }
      }

      // Update buttons
      var compat = sel ? checkSelectionMergeCompat(sel) : null;
      var canMerge = sel && compat && compat.conflicts.length === 0;
      mergeBtn.disabled = !canMerge;
      unmergeBtn.disabled = !clickedRegion;
    }

    mergeBtn.addEventListener('click', function() {
      var sel = getSelectionRect();
      if (!sel) return;
      var compat = checkSelectionMergeCompat(sel);
      if (compat.conflicts.length > 0) return;
      // Remove absorbed regions (reverse order to keep indices valid)
      var toRemove = compat.absorbed.slice().sort(function(a, b) { return b - a; });
      for (var i = 0; i < toRemove.length; i++) {
        mergedRegions.splice(toRemove[i], 1);
      }
      mergedRegions.push({
        startRow: sel.r1, startCol: sel.c1,
        rowSpan: sel.r2 - sel.r1 + 1, colSpan: sel.c2 - sel.c1 + 1
      });
      mergeSelStart = null;
      mergeSelEnd = null;
      renderMergeGrid();
      vscode.postMessage({ type: 'saveMergeRegions', regions: mergedRegions, rows: mergeRows, cols: mergeCols });
    });

    unmergeBtn.addEventListener('click', function() {
      if (!mergeSelStart) return;
      var region = getMergedRegionAt(mergeSelStart.row, mergeSelStart.col);
      if (!region) return;
      var idx = mergedRegions.indexOf(region);
      if (idx >= 0) mergedRegions.splice(idx, 1);
      mergeSelStart = null;
      mergeSelEnd = null;
      renderMergeGrid();
      vscode.postMessage({ type: 'saveMergeRegions', regions: mergedRegions, rows: mergeRows, cols: mergeCols });
    });

    mergeClearBtn.addEventListener('click', function() {
      mergedRegions = [];
      mergeSelStart = null;
      mergeSelEnd = null;
      renderMergeGrid();
      vscode.postMessage({ type: 'saveMergeRegions', regions: mergedRegions, rows: mergeRows, cols: mergeCols });
    });

    // Rebuild merge grid when grid size changes
    var origGridClick = null;
    function hookGridSizeChange() {
      var observer = new MutationObserver(function() {
        if (mergeRows !== selectedRows || mergeCols !== selectedCols) {
          mergedRegions = [];
          mergeSelStart = null;
          mergeSelEnd = null;
          buildMergeGrid();
          vscode.postMessage({ type: 'saveMergeRegions', regions: mergedRegions, rows: mergeRows, cols: mergeCols });
        }
      });
      observer.observe(document.getElementById('sizeLabel'), { childList: true, subtree: true });
    }
    hookGridSizeChange();
    buildMergeGrid();

    // \u2500\u2500 Collapsible sections \u2500\u2500
    var collapsedSections = {};
    document.querySelectorAll('.section-header.collapsible').forEach(function(header) {
      header.addEventListener('click', function(e) {
        if (e.target.closest('.tip-wrap')) return;
        var card = header.closest('.glass-card');
        if (!card) return;
        card.classList.toggle('collapsed');
        var section = card.dataset.section;
        if (section) {
          collapsedSections[section] = card.classList.contains('collapsed');
          vscode.postMessage({ type: 'saveSectionStates', states: collapsedSections });
        }
      });
    });

    function applySectionStates(states) {
      if (!states) return;
      collapsedSections = states;
      document.querySelectorAll('.glass-card[data-section]').forEach(function(card) {
        var section = card.dataset.section;
        if (states[section]) {
          card.classList.add('collapsed');
        } else {
          card.classList.remove('collapsed');
        }
      });
    }

    // \u2500\u2500 Settings \u2500\u2500
    var curZoom = 100, curFontFamily = '', curBg = '', curFg = '';
    var curThemeName = '';
    var themeNames = [''];
    var activeSettingsTab = 'all';
    var cellOverrides = {}; // { 0: { bgColor, fgColor, fontFamily, themeName }, ... }
    var settingsTabsEl = document.getElementById('settingsTabs');
    var builtinFonts = [
      { value: '', label: __i18n.ideDefault },
      { value: 'Consolas', label: 'Consolas' },
      { value: 'Cascadia Code', label: 'Cascadia Code' },
      { value: 'Cascadia Mono', label: 'Cascadia Mono' },
      { value: 'JetBrains Mono', label: 'JetBrains Mono' },
      { value: 'Fira Code', label: 'Fira Code' },
      { value: 'Source Code Pro', label: 'Source Code Pro' },
      { value: 'D2Coding', label: 'D2Coding' },
      { value: 'Ubuntu Mono', label: 'Ubuntu Mono' },
      { value: 'Menlo', label: 'Menlo' },
      { value: 'Monaco', label: 'Monaco' },
      { value: 'Courier New', label: 'Courier New' }
    ];
    var customFontNames = [];
    var dropdownOpen = false;

    // \u2500\u2500 Theme dropdown \u2500\u2500
    var themeDisplay = document.getElementById('themeDisplay');
    var themeDisplayText = document.getElementById('themeDisplayText');
    var themeDropdownEl = document.getElementById('themeDropdown');
    var themeDropdownOpen = false;

    function getThemeDisplayName(val) {
      if (!val) return __i18n.ideDefault;
      return val;
    }

    function toggleThemeDropdown(show) {
      themeDropdownOpen = typeof show === 'boolean' ? show : !themeDropdownOpen;
      themeDropdownEl.classList.toggle('show', themeDropdownOpen);
      themeDisplay.classList.toggle('open', themeDropdownOpen);
    }

    function selectTheme(name) {
      if (activeSettingsTab === 'all') {
        curThemeName = name;
        themeDisplayText.textContent = getThemeDisplayName(name);
        toggleThemeDropdown(false);
        vscode.postMessage({ type: 'setConfig', key: 'colorTheme', value: name });
        cellOverrides = {};
        vscode.postMessage({ type: 'clearAllCellOverrides' });
        updateTabOverrideIndicators();
      } else {
        var cid = parseInt(activeSettingsTab, 10);
        if (!cellOverrides[cid]) cellOverrides[cid] = { bgColor: '', fgColor: '', fontFamily: '', themeName: '' };
        cellOverrides[cid].themeName = name;
        themeDisplayText.textContent = getThemeDisplayName(name);
        toggleThemeDropdown(false);
        vscode.postMessage({ type: 'setCellConfig', cellId: cid, bgColor: cellOverrides[cid].bgColor, fgColor: cellOverrides[cid].fgColor, fontFamily: cellOverrides[cid].fontFamily, themeName: name });
        updateTabOverrideIndicators();
      }
    }

    function buildThemeDropdown() {
      themeDropdownEl.innerHTML = '';
      var currentTheme = activeSettingsTab === 'all' ? curThemeName : (cellOverrides[parseInt(activeSettingsTab, 10)] || {}).themeName || curThemeName;
      for (var i = 0; i < themeNames.length; i++) {
        (function(name) {
          var opt = document.createElement('div');
          opt.className = 'font-opt' + (currentTheme === name ? ' active' : '');
          var nameEl = document.createElement('span');
          nameEl.className = 'font-opt-name';
          nameEl.textContent = name || __i18n.ideDefault;
          opt.appendChild(nameEl);
          opt.addEventListener('click', function(e) { e.stopPropagation(); selectTheme(name); });
          themeDropdownEl.appendChild(opt);
        })(themeNames[i]);
      }
    }

    themeDisplay.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleDropdown(false); // close font dropdown
      toggleShellDropdown(false); // close shell dropdown
      buildThemeDropdown();
      toggleThemeDropdown();
    });

    // \u2500\u2500 Shell dropdown \u2500\u2500
    var shellDisplay = document.getElementById('shellDisplay');
    var shellDisplayText = document.getElementById('shellDisplayText');
    var shellDropdownEl = document.getElementById('shellDropdown');
    var shellDropdownOpen = false;
    var curShellType = '';
    var availableShells = [{ name: __i18n.shellAuto, path: '' }];

    function getShellDisplayName(val) {
      if (!val) return __i18n.shellAuto;
      var lv = val.toLowerCase();
      for (var i = 0; i < availableShells.length; i++) {
        if (availableShells[i].path.toLowerCase() === lv) return availableShells[i].name;
      }
      // Match by filename only (e.g. "cmd.exe" matches "C:WindowsSystem32cmd.exe")
      var base = lv.replace(/^.*[\\/\\\\]/, '');
      for (var i = 0; i < availableShells.length; i++) {
        var sp = availableShells[i].path.toLowerCase().replace(/^.*[\\/\\\\]/, '');
        if (sp === base) return availableShells[i].name;
      }
      return val;
    }

    function toggleShellDropdown(show) {
      shellDropdownOpen = typeof show === 'boolean' ? show : !shellDropdownOpen;
      shellDropdownEl.classList.toggle('show', shellDropdownOpen);
      shellDisplay.classList.toggle('open', shellDropdownOpen);
    }

    function selectShell(path) {
      if (activeCmdTab === 'all') {
        curShellType = path;
        shellDisplayText.textContent = getShellDisplayName(path);
        toggleShellDropdown(false);
        vscode.postMessage({ type: 'setConfig', key: 'shellType', value: path });
        // Clear all per-cell shell overrides
        for (var k in cellOverrides) {
          if (cellOverrides[k]) cellOverrides[k].shellType = '';
        }
        vscode.postMessage({ type: 'clearAllCellShells' });
        renderCmdSummary();
      } else {
        var cid = parseInt(activeCmdTab, 10);
        if (!cellOverrides[cid]) cellOverrides[cid] = { bgColor: '', fgColor: '', fontFamily: '', themeName: '', shellType: '' };
        cellOverrides[cid].shellType = path;
        shellDisplayText.textContent = getShellDisplayName(path);
        toggleShellDropdown(false);
        vscode.postMessage({ type: 'setShellForCell', cellId: cid, shellType: path });
        updateCmdTabIndicators();
      }
    }

    function buildShellDropdown() {
      shellDropdownEl.innerHTML = '';
      var currentShell = activeCmdTab === 'all' ? curShellType : (cellOverrides[parseInt(activeCmdTab, 10)] || {}).shellType || curShellType;
      for (var i = 0; i < availableShells.length; i++) {
        (function(shell) {
          var opt = document.createElement('div');
          opt.className = 'font-opt' + (currentShell === shell.path ? ' active' : '');
          var nameEl = document.createElement('span');
          nameEl.className = 'font-opt-name';
          nameEl.textContent = shell.name;
          opt.appendChild(nameEl);
          opt.addEventListener('click', function(e) { e.stopPropagation(); selectShell(shell.path); });
          shellDropdownEl.appendChild(opt);
        })(availableShells[i]);
      }
    }

    shellDisplay.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleDropdown(false);
      toggleThemeDropdown(false);
      buildShellDropdown();
      toggleShellDropdown();
    });

    // \u2500\u2500 Per-cell sequential startup steps \u2500\u2500
    var cmdPresetEl = document.getElementById('cmdPreset');
    var cmdCustomRow = document.getElementById('cmdCustomRow');
    var cmdCustomInput = document.getElementById('cmdCustom');
    var cmdTimeoutRow = document.getElementById('cmdTimeoutRow');
    var cmdTimeoutMsInput = document.getElementById('cmdTimeoutMs');
    var defaultSteps = [];

    function getStepsForTarget(target) {
      if (target === 'all') return defaultSteps || [];
      var ov = cellOverrides[parseInt(String(target), 10)] || {};
      if (ov.startupSteps && ov.startupSteps.length > 0) return ov.startupSteps;
      if (ov.startupCommand) return [{ type: 'command', input: ov.startupCommand }];
      return [];
    }

    function addStep(step) {
      var target = activeCmdTab === 'all' ? 'all' : parseInt(activeCmdTab, 10);
      if (target === 'all') {
        defaultSteps.push(step);
      } else {
        if (!cellOverrides[target]) cellOverrides[target] = {};
        if (!cellOverrides[target].startupSteps) cellOverrides[target].startupSteps = [];
        cellOverrides[target].startupSteps.push(step);
      }
      vscode.postMessage({ type: 'addStep', target: target, step: step });
      updateCmdTabIndicators();
    }

    cmdPresetEl.addEventListener('change', function() {
      var val = this.value;
      if (val === '__custom__') {
        cmdCustomRow.style.display = 'flex';
        cmdTimeoutRow.style.display = 'none';
        cmdCustomInput.focus();
        this.value = '';
        return;
      }
      if (val === '__timeout__') {
        cmdTimeoutRow.style.display = 'flex';
        cmdCustomRow.style.display = 'none';
        cmdTimeoutMsInput.focus();
        this.value = '';
        return;
      }
      if (val === '__enter__') {
        cmdCustomRow.style.display = 'none';
        cmdTimeoutRow.style.display = 'none';
        addStep({ type: 'command', input: '' });
        this.value = '';
        return;
      }
      if (val) {
        cmdCustomRow.style.display = 'none';
        cmdTimeoutRow.style.display = 'none';
        addStep({ type: 'command', input: val });
        this.value = '';
      }
    });

    document.getElementById('cmdApplyBtn').addEventListener('click', function() {
      var val = cmdCustomInput.value.trim();
      if (val) {
        addStep({ type: 'command', input: val });
        cmdCustomInput.value = '';
        cmdCustomRow.style.display = 'none';
      }
    });

    cmdCustomInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        document.getElementById('cmdApplyBtn').click();
      }
    });

    document.getElementById('cmdTimeoutApplyBtn').addEventListener('click', function() {
      var ms = parseInt(cmdTimeoutMsInput.value, 10);
      if (ms > 0) {
        addStep({ type: 'timeout', ms: ms });
        cmdTimeoutMsInput.value = '';
        cmdTimeoutRow.style.display = 'none';
      }
    });

    cmdTimeoutMsInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        document.getElementById('cmdTimeoutApplyBtn').click();
      }
    });

    // \u2500\u2500 Font dropdown \u2500\u2500
    var fontDisplay = document.getElementById('fontDisplay');
    var fontDisplayText = document.getElementById('fontDisplayText');
    var fontDropdown = document.getElementById('fontDropdown');

    function getDisplayName(val) {
      if (!val) return __i18n.ideDefault;
      for (var i = 0; i < builtinFonts.length; i++) {
        if (builtinFonts[i].value === val) return builtinFonts[i].label;
      }
      return val;
    }

    function toggleDropdown(show) {
      dropdownOpen = typeof show === 'boolean' ? show : !dropdownOpen;
      fontDropdown.classList.toggle('show', dropdownOpen);
      fontDisplay.classList.toggle('open', dropdownOpen);
    }

    function selectFont(val) {
      if (activeSettingsTab === 'all') {
        curFontFamily = val;
        fontDisplayText.textContent = getDisplayName(val);
        toggleDropdown(false);
        vscode.postMessage({ type: 'setConfig', key: 'fontFamily', value: val });
        cellOverrides = {};
        vscode.postMessage({ type: 'clearAllCellOverrides' });
        updateTabOverrideIndicators();
      } else {
        var cid = parseInt(activeSettingsTab, 10);
        if (!cellOverrides[cid]) cellOverrides[cid] = { bgColor: '', fgColor: '', fontFamily: '', themeName: '' };
        cellOverrides[cid].fontFamily = val;
        fontDisplayText.textContent = getDisplayName(val);
        toggleDropdown(false);
        vscode.postMessage({ type: 'setCellConfig', cellId: cid, bgColor: cellOverrides[cid].bgColor, fgColor: cellOverrides[cid].fgColor, fontFamily: val, themeName: cellOverrides[cid].themeName });
        updateTabOverrideIndicators();
      }
    }

    function buildDropdown() {
      fontDropdown.innerHTML = '';
      for (var i = 0; i < builtinFonts.length; i++) {
        (function(f) {
          var opt = document.createElement('div');
          opt.className = 'font-opt' + (curFontFamily === f.value ? ' active' : '');
          var name = document.createElement('span');
          name.className = 'font-opt-name';
          name.textContent = f.label;
          opt.appendChild(name);
          opt.addEventListener('click', function(e) { e.stopPropagation(); selectFont(f.value); });
          fontDropdown.appendChild(opt);
        })(builtinFonts[i]);
      }
      if (customFontNames.length > 0) {
        var divider = document.createElement('div');
        divider.className = 'font-divider';
        fontDropdown.appendChild(divider);
        for (var j = 0; j < customFontNames.length; j++) {
          (function(name) {
            var opt = document.createElement('div');
            opt.className = 'font-opt' + (curFontFamily === name ? ' active' : '');
            var nameEl = document.createElement('span');
            nameEl.className = 'font-opt-name';
            nameEl.textContent = name;
            opt.appendChild(nameEl);
            var del = document.createElement('button');
            del.className = 'font-opt-del';
            del.textContent = '\\u00d7';
            del.title = __i18n.remove;
            del.addEventListener('click', function(e) {
              e.stopPropagation();
              vscode.postMessage({ type: 'removeFont', name: name });
              if (curFontFamily === name) selectFont('');
            });
            opt.appendChild(del);
            opt.addEventListener('click', function(e) { e.stopPropagation(); selectFont(name); });
            fontDropdown.appendChild(opt);
          })(customFontNames[j]);
        }
      }
      var divider2 = document.createElement('div');
      divider2.className = 'font-divider';
      fontDropdown.appendChild(divider2);
      var addBtn = document.createElement('div');
      addBtn.className = 'font-opt-add';
      addBtn.innerHTML = '<span>+</span><span>' + __i18n.addFontFile + '</span>';
      addBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleDropdown(false);
        vscode.postMessage({ type: 'browseFont' });
      });
      fontDropdown.appendChild(addBtn);
    }

    fontDisplay.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleThemeDropdown(false); // close theme dropdown
      toggleShellDropdown(false); // close shell dropdown
      buildDropdown();
      toggleDropdown();
    });
    document.addEventListener('click', function() { toggleDropdown(false); toggleThemeDropdown(false); toggleShellDropdown(false); });

    // \u2500\u2500 Color pickers \u2500\u2500
    function setupColor(prefix, configKey) {
      var input = document.getElementById(prefix + 'ColorInput');
      var fill = document.getElementById(prefix + 'SwatchFill');
      var valEl = document.getElementById(prefix + 'Val');
      var resetBtn = document.getElementById(prefix + 'Reset');
      var overrideKey = prefix === 'bg' ? 'bgColor' : 'fgColor';

      function updateColorUI(color) {
        if (color) {
          fill.style.background = color;
          valEl.textContent = color;
          input.value = color;
          resetBtn.classList.remove('hidden');
        } else {
          fill.style.background = prefix === 'bg'
            ? 'var(--vscode-terminal-background, var(--vscode-editor-background, #1e1e1e))'
            : 'var(--vscode-terminal-foreground, var(--vscode-editor-foreground, #ccc))';
          valEl.textContent = __i18n.ideDefault;
          resetBtn.classList.add('hidden');
        }
      }

      input.addEventListener('input', function() {
        var val = input.value;
        if (activeSettingsTab === 'all') {
          if (prefix === 'bg') curBg = val; else curFg = val;
          updateColorUI(val);
          vscode.postMessage({ type: 'setConfig', key: configKey, value: val });
          cellOverrides = {};
          vscode.postMessage({ type: 'clearAllCellOverrides' });
          updateTabOverrideIndicators();
        } else {
          var cid = parseInt(activeSettingsTab, 10);
          if (!cellOverrides[cid]) cellOverrides[cid] = { bgColor: '', fgColor: '', fontFamily: '', themeName: '' };
          cellOverrides[cid][overrideKey] = val;
          updateColorUI(val);
          vscode.postMessage({ type: 'setCellConfig', cellId: cid, bgColor: cellOverrides[cid].bgColor, fgColor: cellOverrides[cid].fgColor, fontFamily: cellOverrides[cid].fontFamily, themeName: cellOverrides[cid].themeName });
          updateTabOverrideIndicators();
        }
      });

      function doReset() {
        if (activeSettingsTab === 'all') {
          if (prefix === 'bg') curBg = ''; else curFg = '';
          updateColorUI('');
          vscode.postMessage({ type: 'setConfig', key: configKey, value: '' });
          cellOverrides = {};
          vscode.postMessage({ type: 'clearAllCellOverrides' });
          updateTabOverrideIndicators();
        } else {
          var cid = parseInt(activeSettingsTab, 10);
          if (!cellOverrides[cid]) cellOverrides[cid] = { bgColor: '', fgColor: '', fontFamily: '', themeName: '' };
          cellOverrides[cid][overrideKey] = '';
          updateColorUI('');
          vscode.postMessage({ type: 'setCellConfig', cellId: cid, bgColor: cellOverrides[cid].bgColor, fgColor: cellOverrides[cid].fgColor, fontFamily: cellOverrides[cid].fontFamily, themeName: cellOverrides[cid].themeName });
          updateTabOverrideIndicators();
        }
      }
      resetBtn.addEventListener('click', doReset);
      valEl.addEventListener('click', function() {
        // In All tab, always allow reset (clears per-cell overrides even if global is already IDE Default)
        if (valEl.textContent === __i18n.ideDefault && activeSettingsTab !== 'all') return;
        doReset();
      });
      valEl.style.cursor = 'pointer';

      return updateColorUI;
    }

    var updateBgUI = setupColor('bg', 'backgroundColor');
    var updateFgUI = setupColor('fg', 'foregroundColor');

    // \u2500\u2500 Zoom \u2500\u2500
    document.getElementById('zoomDown').addEventListener('click', function() {
      curZoom = Math.max(50, curZoom - 10);
      updateSettingsUI();
      vscode.postMessage({ type: 'setConfig', key: 'zoomPercent', value: curZoom });
    });
    document.getElementById('zoomUp').addEventListener('click', function() {
      curZoom = Math.min(300, curZoom + 10);
      updateSettingsUI();
      vscode.postMessage({ type: 'setConfig', key: 'zoomPercent', value: curZoom });
    });

    function updateSettingsUI() {
      document.getElementById('zoomVal').textContent = curZoom + '%';
      showTabValues();
    }

    function showTabValues() {
      if (activeSettingsTab === 'all') {
        themeDisplayText.textContent = getThemeDisplayName(curThemeName);
        fontDisplayText.textContent = getDisplayName(curFontFamily);
        updateBgUI(curBg);
        updateFgUI(curFg);
      } else {
        var cid = parseInt(activeSettingsTab, 10);
        var ov = cellOverrides[cid] || {};
        themeDisplayText.textContent = getThemeDisplayName(ov.themeName || curThemeName);
        fontDisplayText.textContent = getDisplayName(ov.fontFamily || curFontFamily);
        updateBgUI(ov.bgColor || curBg);
        updateFgUI(ov.fgColor || curFg);
      }
    }

    function showCmdTabValues() {
      if (activeCmdTab === 'all') {
        shellDisplayText.textContent = getShellDisplayName(curShellType);
      } else {
        var cid = parseInt(activeCmdTab, 10);
        var ov = cellOverrides[cid] || {};
        shellDisplayText.textContent = getShellDisplayName(ov.shellType || curShellType);
      }
      cmdPresetEl.value = '';
      cmdCustomRow.style.display = 'none';
      cmdTimeoutRow.style.display = 'none';
      renderCmdSummary();
    }

    function buildSettingsTabs(total, labels, hidden) {
      var hiddenSet = {};
      if (hidden) for (var h = 0; h < hidden.length; h++) hiddenSet[hidden[h]] = true;
      settingsTabsEl.innerHTML = '';
      if (total <= 0) {
        settingsTabsEl.classList.add('hidden');
        activeSettingsTab = 'all';
        return;
      }
      settingsTabsEl.classList.remove('hidden');
      // All tab
      var allBtn = document.createElement('button');
      allBtn.className = 'stab active';
      allBtn.dataset.tab = 'all';
      allBtn.textContent = __i18n.all;
      allBtn.addEventListener('click', function() { switchSettingsTab('all'); });
      settingsTabsEl.appendChild(allBtn);
      // Per-cell tabs (skip hidden/merged cells)
      for (var i = 0; i < total; i++) {
        if (hiddenSet[i]) continue;
        (function(idx) {
          var btn = document.createElement('button');
          btn.className = 'stab';
          btn.dataset.tab = String(idx);
          btn.textContent = labels[idx] || String(idx + 1);
          btn.addEventListener('click', function() { switchSettingsTab(String(idx)); });
          settingsTabsEl.appendChild(btn);
        })(i);
      }
      activeSettingsTab = 'all';
      updateTabOverrideIndicators();
    }

    function switchSettingsTab(tab) {
      activeSettingsTab = tab;
      var btns = settingsTabsEl.querySelectorAll('.stab');
      for (var i = 0; i < btns.length; i++) {
        btns[i].classList.toggle('active', btns[i].dataset.tab === tab);
      }
      showTabValues();
    }

    function updateTabOverrideIndicators() {
      var btns = settingsTabsEl.querySelectorAll('.stab');
      for (var i = 0; i < btns.length; i++) {
        var tab = btns[i].dataset.tab;
        if (tab === 'all') continue;
        var ov = cellOverrides[parseInt(tab, 10)];
        var hasOv = ov && (ov.bgColor || ov.fgColor || ov.fontFamily || ov.themeName);
        btns[i].classList.toggle('has-override', !!hasOv);
      }
    }

    // \u2500\u2500 Startup Commands tabs (independent) \u2500\u2500
    var cmdTabsEl = document.getElementById('cmdTabs');
    var activeCmdTab = 'all';

    function buildCmdTabs(total, labels, hidden) {
      var hiddenSet = {};
      if (hidden) for (var h = 0; h < hidden.length; h++) hiddenSet[hidden[h]] = true;
      var prevTab = activeCmdTab;
      cmdTabsEl.innerHTML = '';
      if (total <= 0) {
        cmdTabsEl.classList.add('hidden');
        activeCmdTab = 'all';
        return;
      }
      cmdTabsEl.classList.remove('hidden');
      // Check if previous tab still valid (and not hidden)
      var validPrev = prevTab === 'all' || (parseInt(prevTab, 10) < total && !hiddenSet[parseInt(prevTab, 10)]);
      var restoreTab = validPrev ? prevTab : 'all';
      var allBtn = document.createElement('button');
      allBtn.className = 'stab' + (restoreTab === 'all' ? ' active' : '');
      allBtn.dataset.tab = 'all';
      allBtn.textContent = __i18n.all;
      allBtn.addEventListener('click', function() { switchCmdTab('all'); });
      cmdTabsEl.appendChild(allBtn);
      for (var i = 0; i < total; i++) {
        if (hiddenSet[i]) continue;
        (function(idx) {
          var btn = document.createElement('button');
          btn.className = 'stab' + (restoreTab === String(idx) ? ' active' : '');
          btn.dataset.tab = String(idx);
          btn.textContent = labels[idx] || String(idx + 1);
          btn.addEventListener('click', function() { switchCmdTab(String(idx)); });
          cmdTabsEl.appendChild(btn);
        })(i);
      }
      activeCmdTab = restoreTab;
      updateCmdTabIndicators();
    }

    function switchCmdTab(tab) {
      activeCmdTab = tab;
      var btns = cmdTabsEl.querySelectorAll('.stab');
      for (var i = 0; i < btns.length; i++) {
        btns[i].classList.toggle('active', btns[i].dataset.tab === tab);
      }
      showCmdTabValues();
    }

    function updateCmdTabIndicators() {
      var btns = cmdTabsEl.querySelectorAll('.stab');
      for (var b = 0; b < btns.length; b++) {
        var tab = btns[b].dataset.tab;
        if (tab === 'all') continue;
        var cid = parseInt(tab, 10);
        var ov = cellOverrides[cid] || {};
        var hasOv = ov.shellType || (ov.startupSteps && ov.startupSteps.length > 0) || ov.startupCommand;
        btns[b].classList.toggle('has-override', !!hasOv);
      }
      renderCmdSummary();
    }

    function getCellLabel(idx) {
      var btns = cmdTabsEl.querySelectorAll('.stab');
      for (var j = 0; j < btns.length; j++) {
        if (btns[j].dataset.tab === String(idx)) return btns[j].textContent;
      }
      return String(idx + 1);
    }

    function escapeStepHtml(str) {
      var d = document.createElement('div');
      d.textContent = str;
      return d.innerHTML;
    }

    function getDragAfterElement(container, y) {
      var elements = Array.prototype.slice.call(container.querySelectorAll('.cmd-step-item:not(.dragging)'));
      var closest = null;
      var closestOffset = Number.NEGATIVE_INFINITY;
      for (var i = 0; i < elements.length; i++) {
        var box = elements[i].getBoundingClientRect();
        var offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closestOffset) {
          closestOffset = offset;
          closest = elements[i];
        }
      }
      return closest;
    }

    function renderStepGroup(container, target, label, steps, shellInfo) {
      var group = document.createElement('div');
      group.className = 'cmd-step-group';

      var header = document.createElement('div');
      header.className = 'cmd-step-group-header';
      var headerText = label;
      if (shellInfo) headerText += ' \xB7 ' + shellInfo;
      header.textContent = headerText;
      group.appendChild(header);

      var stepList = document.createElement('div');
      stepList.className = 'cmd-step-list';
      stepList.dataset.target = String(target);

      for (var i = 0; i < steps.length; i++) {
        (function(step, idx) {
          var row = document.createElement('div');
          row.className = 'cmd-step-item';
          row.draggable = true;
          row.dataset.index = String(idx);

          var handle = document.createElement('span');
          handle.className = 'cmd-step-handle';
          handle.textContent = '\u2261';
          row.appendChild(handle);

          var num = document.createElement('span');
          num.className = 'cmd-step-num';
          num.textContent = String(idx + 1);
          row.appendChild(num);

          var txt = document.createElement('span');
          txt.className = 'cmd-step-text';
          if (step.type === 'timeout') {
            txt.innerHTML = '<span class="cmd-step-icon">\u23F1</span> ' + step.ms + 'ms';
            txt.title = 'Click to edit timeout';
            txt.style.cursor = 'pointer';
            (function(st, ix, tgt) {
              txt.addEventListener('click', function() {
                var cur = st.ms;
                var inp = document.createElement('input');
                inp.type = 'number';
                inp.min = '100';
                inp.step = '100';
                inp.value = String(cur);
                inp.style.cssText = 'width:70px;font-size:11px;padding:1px 4px;background:var(--vscode-input-background);color:var(--vscode-input-foreground);border:1px solid var(--vscode-input-border,#555);border-radius:3px;';
                txt.textContent = '';
                txt.appendChild(inp);
                inp.focus();
                inp.select();
                function commit() {
                  var v = parseInt(inp.value, 10);
                  if (!v || v < 0) v = cur;
                  st.ms = v;
                  txt.innerHTML = '<span class="cmd-step-icon">\u23F1</span> ' + v + 'ms';
                  vscode.postMessage({ type: 'updateStep', target: tgt, index: ix, step: { type: 'timeout', ms: v } });
                }
                inp.addEventListener('blur', commit);
                inp.addEventListener('keydown', function(ev) {
                  if (ev.key === 'Enter') { inp.blur(); }
                  if (ev.key === 'Escape') { inp.value = String(cur); inp.blur(); }
                });
              });
            })(step, idx, target);
          } else if (step.input === '' || step.input === undefined) {
            txt.innerHTML = '<span class="cmd-step-icon">\u21B5</span> Enter';
            txt.title = 'Enter';
          } else {
            txt.innerHTML = '<span class="cmd-step-icon">\u25B6</span> ' + escapeStepHtml(step.input);
            txt.title = step.input;
          }
          row.appendChild(txt);

          var del = document.createElement('button');
          del.className = 'cmd-step-del';
          del.textContent = '\xD7';
          del.addEventListener('click', function() {
            if (target === 'all') {
              defaultSteps.splice(idx, 1);
            } else {
              var ov = cellOverrides[target];
              if (ov && ov.startupSteps) ov.startupSteps.splice(idx, 1);
            }
            vscode.postMessage({ type: 'removeStep', target: target, index: idx });
            updateCmdTabIndicators();
          });
          row.appendChild(del);

          row.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', JSON.stringify({ target: target, index: idx }));
            e.dataTransfer.effectAllowed = 'move';
            row.classList.add('dragging');
          });
          row.addEventListener('dragend', function() {
            row.classList.remove('dragging');
          });

          stepList.appendChild(row);
        })(steps[i], i);
      }

      // Drop zone
      stepList.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        var dragging = stepList.querySelector('.dragging');
        if (!dragging) return;
        var afterEl = getDragAfterElement(stepList, e.clientY);
        if (afterEl) {
          stepList.insertBefore(dragging, afterEl);
        } else {
          stepList.appendChild(dragging);
        }
      });

      stepList.addEventListener('drop', function(e) {
        e.preventDefault();
        var items = stepList.querySelectorAll('.cmd-step-item');
        var newSteps = [];
        for (var j = 0; j < items.length; j++) {
          var oldIdx = parseInt(items[j].dataset.index, 10);
          newSteps.push(steps[oldIdx]);
        }
        if (target === 'all') {
          defaultSteps = newSteps;
        } else {
          if (!cellOverrides[target]) cellOverrides[target] = {};
          cellOverrides[target].startupSteps = newSteps;
        }
        vscode.postMessage({ type: 'reorderSteps', target: target, steps: newSteps });
        updateCmdTabIndicators();
      });

      group.appendChild(stepList);
      container.appendChild(group);
    }

    function renderCmdSummary() {
      var list = document.getElementById('cmdSummaryList');
      list.innerHTML = '';

      // "All" group: shell info + default steps
      var allShell = curShellType ? getShellDisplayName(curShellType) : '';
      var allSteps = defaultSteps || [];
      if (allShell || allSteps.length > 0) {
        renderStepGroup(list, 'all', __i18n.all, allSteps, allShell);
      }

      // Per-cell groups
      var total = cmdTabsEl.querySelectorAll('.stab:not([data-tab="all"])').length;
      for (var i = 0; i < total; i++) {
        var ov = cellOverrides[i] || {};
        var cellShell = ov.shellType ? getShellDisplayName(ov.shellType) : '';
        var cellSteps = getStepsForTarget(i);
        if (cellShell || cellSteps.length > 0) {
          renderStepGroup(list, i, getCellLabel(i), cellSteps, cellShell);
        }
      }
    }

    // \u2500\u2500 Projects \u2500\u2500
    var projects = [];
    var workspacePath = '';

    document.getElementById('addCurrentProjectBtn').addEventListener('click', function() {
      vscode.postMessage({ type: 'addCurrentProject' });
    });
    document.getElementById('browseProjectBtn').addEventListener('click', function() {
      vscode.postMessage({ type: 'browseProject' });
    });

    function renderProjectList() {
      var list = document.getElementById('projectList');
      list.innerHTML = '';
      if (projects.length === 0) {
        var empty = document.createElement('div');
        empty.className = 'cmd-empty';
        empty.textContent = __i18n.noProjects;
        list.appendChild(empty);
        return;
      }
      for (var i = 0; i < projects.length; i++) {
        (function(idx) {
          var p = projects[idx];
          var item = document.createElement('div');
          item.className = 'cmd-item';
          item.style.cursor = 'pointer';
          if (p.path === workspacePath) {
            item.style.borderColor = 'var(--vscode-focusBorder, rgba(0,127,212,0.6))';
            item.style.background = 'rgba(0,127,212,.06)';
          }

          var nameEl = document.createElement('span');
          nameEl.className = 'cmd-item-text';
          nameEl.style.fontFamily = 'inherit';
          nameEl.textContent = p.name;
          nameEl.title = p.path;
          item.appendChild(nameEl);

          // Show linked preset if any
          if (projectPresetsMap[p.path]) {
            var badge = document.createElement('span');
            badge.style.cssText = 'font-size:9px;opacity:.5;flex-shrink:0;margin-left:4px;';
            badge.textContent = projectPresetsMap[p.path];
            item.appendChild(badge);
          }

          var del = document.createElement('button');
          del.className = 'cmd-item-del';
          del.textContent = '\\u00d7';
          del.title = __i18n.remove;
          del.addEventListener('click', function(e) {
            e.stopPropagation();
            vscode.postMessage({ type: 'removeProject', index: idx });
          });
          item.appendChild(del);

          item.addEventListener('click', function(e) {
            vscode.postMessage({ type: 'openProject', path: p.path, newWindow: e.ctrlKey || e.metaKey });
          });

          list.appendChild(item);
        })(i);
      }
    }

    // \u2500\u2500 Presets \u2500\u2500
    var presets = [];
    var projectPresetsMap = {};

    document.getElementById('presetSelect').addEventListener('change', function() {
      var nameInput = document.getElementById('presetNameInput');
      nameInput.value = this.value;
    });

    document.getElementById('presetSaveBtn').addEventListener('click', function() {
      var name = document.getElementById('presetNameInput').value.trim();
      if (!name) return;
      vscode.postMessage({ type: 'savePreset', name: name });
    });

    document.getElementById('presetLoadBtn').addEventListener('click', function() {
      var name = document.getElementById('presetSelect').value;
      if (!name) return;
      vscode.postMessage({ type: 'loadPreset', name: name });
    });

    document.getElementById('presetDeleteBtn').addEventListener('click', function() {
      var name = document.getElementById('presetSelect').value;
      if (!name) return;
      vscode.postMessage({ type: 'deletePreset', name: name });
    });

    document.getElementById('presetLinkCheck').addEventListener('change', function() {
      var sel = document.getElementById('presetSelect');
      var name = this.checked ? sel.value : '';
      if (this.checked && !name) return;
      vscode.postMessage({ type: 'linkPreset', projectPath: workspacePath, presetName: name });
    });

    function renderPresetDropdown() {
      var sel = document.getElementById('presetSelect');
      var nameInput = document.getElementById('presetNameInput');
      sel.innerHTML = '<option value="">' + __i18n.selectPreset + '</option>';
      var linkedPreset = workspacePath ? (projectPresetsMap[workspacePath] || '') : '';
      for (var i = 0; i < presets.length; i++) {
        var opt = document.createElement('option');
        opt.value = presets[i].name;
        opt.textContent = (presets[i].name === linkedPreset ? '\\u2605 ' : '') + presets[i].name;
        sel.appendChild(opt);
      }
      if (linkedPreset) {
        sel.value = linkedPreset;
        nameInput.value = linkedPreset;
      }
      var check = document.getElementById('presetLinkCheck');
      check.checked = !!linkedPreset;
      var linkLabel = document.getElementById('presetLinkLabel');
      linkLabel.textContent = linkedPreset
        ? __i18n.linkedPrefix.replace('{0}', linkedPreset)
        : __i18n.linkToProject;
    }

    // \u2500\u2500 Broadcast \u2500\u2500
    var broadcastTargetsEl = document.getElementById('broadcastTargets');
    var curGridTotal = 0;

    function buildBroadcastTargets(total, labels, hidden) {
      var hiddenSet = {};
      if (hidden) for (var h = 0; h < hidden.length; h++) hiddenSet[hidden[h]] = true;
      curGridTotal = total;
      broadcastTargetsEl.innerHTML = '';
      if (total <= 0) {
        broadcastTargetsEl.classList.add('hidden');
        return;
      }
      broadcastTargetsEl.classList.remove('hidden');
      // All checkbox
      var allLabel = document.createElement('label');
      allLabel.className = 'broadcast-target all-label';
      var allCb = document.createElement('input');
      allCb.type = 'checkbox'; allCb.checked = true; allCb.dataset.cell = 'all';
      allLabel.appendChild(allCb);
      allLabel.appendChild(document.createTextNode(' ' + __i18n.all));
      broadcastTargetsEl.appendChild(allLabel);
      // Per-cell checkboxes (skip hidden/merged cells)
      for (var i = 0; i < total; i++) {
        if (hiddenSet[i]) continue;
        var lbl = document.createElement('label');
        lbl.className = 'broadcast-target';
        var cb = document.createElement('input');
        cb.type = 'checkbox'; cb.checked = false;
        cb.dataset.cell = String(i);
        lbl.appendChild(cb);
        lbl.appendChild(document.createTextNode(' ' + (labels[i] || (i + 1))));
        broadcastTargetsEl.appendChild(lbl);
      }
      // All click \u2192 uncheck all individuals
      allCb.addEventListener('change', function() {
        if (allCb.checked) {
          var cbs = broadcastTargetsEl.querySelectorAll('input[data-cell]:not([data-cell="all"])');
          for (var j = 0; j < cbs.length; j++) { cbs[j].checked = false; }
        }
      });
      // Individual click \u2192 uncheck All; if all individuals checked \u2192 switch to All
      var indivCbs = broadcastTargetsEl.querySelectorAll('input[data-cell]:not([data-cell="all"])');
      for (var k = 0; k < indivCbs.length; k++) {
        indivCbs[k].addEventListener('change', function() {
          if (this.checked) allCb.checked = false;
          var allChecked = true;
          for (var j = 0; j < indivCbs.length; j++) {
            if (!indivCbs[j].checked) { allChecked = false; break; }
          }
          if (allChecked) {
            allCb.checked = true;
            for (var j = 0; j < indivCbs.length; j++) { indivCbs[j].checked = false; }
          }
        });
      }
    }

    function getSelectedCellIds() {
      var allCb = broadcastTargetsEl.querySelector('input[data-cell="all"]');
      if (allCb && allCb.checked) return null; // all
      var ids = [];
      var cbs = broadcastTargetsEl.querySelectorAll('input[data-cell]:not([data-cell="all"])');
      for (var j = 0; j < cbs.length; j++) {
        if (cbs[j].checked) ids.push(parseInt(cbs[j].dataset.cell, 10));
      }
      return ids;
    }

    document.getElementById('broadcastSendBtn').addEventListener('click', function() {
      var input = document.getElementById('broadcastInput');
      var text = input.value;
      if (!text) return;
      var ids = getSelectedCellIds();
      if (ids === null) {
        vscode.postMessage({ type: 'broadcast', text: text });
      } else if (ids.length > 0) {
        vscode.postMessage({ type: 'broadcastToCell', cellIds: ids, text: text });
      }
      input.value = '';
    });

    document.getElementById('broadcastInput').addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        document.getElementById('broadcastSendBtn').click();
      }
    });

    // \u2500\u2500 Messages \u2500\u2500
    window.addEventListener('message', function(event) {
      var msg = event.data;
      if (msg.type === 'ptyInstallResult') {
        var banner = document.getElementById('ptyBanner');
        var btn = document.getElementById('ptyInstallBtn');
        if (msg.success) {
          if (banner) {
            banner.style.borderColor = 'rgba(0,200,100,.35)';
            banner.style.background = 'linear-gradient(135deg, rgba(0,200,100,.12), rgba(0,180,80,.08))';
          }
          if (btn) {
            btn.textContent = __i18n.reload;
            btn.disabled = false;
            btn.onclick = function() { vscode.postMessage({ type: 'reload' }); };
          }
          var textEl = document.querySelector('.pty-banner-text');
          if (textEl) textEl.innerHTML = '<b>' + __i18n.ptyInstalled + '</b><br>' + __i18n.ptyInstalledHint;
        } else {
          if (btn) { btn.textContent = __i18n.retry; btn.disabled = false; }
        }
      }
      if (msg.type === 'mcpPort') {
        var portInfo = document.getElementById('mcpPortInfo');
        var portValue = document.getElementById('mcpPortValue');
        if (portInfo) portInfo.style.display = msg.port > 0 ? 'block' : 'none';
        if (portValue) portValue.textContent = msg.port;
      }
      if (msg.type === 'mcpRegistrationStatus') {
        setMcpRegistered(msg.desktop);
      }
      if (msg.type === 'mcpRegisterResult') {
        setMcpRegistered(msg.success);
      }
      if (msg.type === 'mcpUnregisterResult') {
        // On success, registered=false. On failure, keep current state.
        setMcpRegistered(msg.success ? false : mcpAlreadyRegistered);
      }
      if (msg.type === 'configValues') {
        curZoom = msg.zoom;
        curFontFamily = msg.fontFamily;
        curBg = msg.bgColor || '';
        curFg = msg.fgColor || '';
        curThemeName = msg.colorTheme || '';
        curShellType = msg.shellType || '';
        themeNames = msg.themeNames || [''];
        availableShells = msg.availableShells || [{ name: __i18n.shellAuto, path: '' }];
        customFontNames = msg.customFonts || [];
        projects = msg.projects || [];
        presets = msg.presets || [];
        projectPresetsMap = msg.projectPresets || {};
        workspacePath = msg.workspacePath || '';
        cellOverrides = msg.cellOverrides || {};
        defaultSteps = msg.defaultSteps || [];
        // \u2500\u2500 Tabs card render + lazy button wiring \u2500\u2500
        var tabs = msg.tabs || [];
        var activeTabId = (msg.activeTabId !== undefined && msg.activeTabId !== null) ? msg.activeTabId : -1;
        var tabsList = document.getElementById('tabsList');
        if (tabsList) {
          if (tabs.length === 0) {
            tabsList.innerHTML = '<div class="tabs-empty">No grid open. Click Open Grid below.</div>';
          } else {
            tabsList.innerHTML = '';
            tabs.forEach(function(tab, idx) {
              var item = document.createElement('div');
              item.className = 'tab-item' + (tab.tabId === activeTabId ? ' active' : '');
              item.dataset.tabId = String(tab.tabId);
              item.title = 'Click to focus \xB7 Right-click or double-click to rename';
              var label = document.createElement('span');
              label.className = 'tab-item-label';
              var defaultLabel = 'Tab ' + (idx + 1);
              var labelText = (tab.name && tab.name.length > 0) ? tab.name : defaultLabel;
              label.textContent = labelText;
              var meta = document.createElement('span');
              meta.className = 'tab-item-meta';
              meta.textContent = tab.rows + '\xD7' + tab.cols;
              label.appendChild(meta);
              var closeBtn = document.createElement('button');
              closeBtn.className = 'tab-item-close';
              closeBtn.textContent = '\xD7';
              closeBtn.title = 'Close tab';
              if (tabs.length <= 1) closeBtn.disabled = true;
              closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (tabs.length <= 1) return;
                vscode.postMessage({ type: 'removeTab', tabId: tab.tabId });
              });
              item.appendChild(label);
              item.appendChild(closeBtn);
              item.addEventListener('click', function() {
                if (item.classList.contains('editing')) return;
                vscode.postMessage({ type: 'switchTab', tabId: tab.tabId });
              });
              // Inline rename \u2014 keeps focus in the sidebar (no native dialog jump)
              function startInlineRename() {
                if (item.classList.contains('editing')) return;
                item.classList.add('editing');
                var input = document.createElement('input');
                input.className = 'tab-item-input';
                input.type = 'text';
                input.value = tab.name || '';
                input.placeholder = defaultLabel;
                label.style.display = 'none';
                closeBtn.style.display = 'none';
                item.insertBefore(input, label);
                // Defer focus so the contextmenu event finishes first
                setTimeout(function() {
                  input.focus();
                  input.select();
                }, 0);
                var done = false;
                function commit() {
                  if (done) return;
                  done = true;
                  vscode.postMessage({ type: 'renameTab', tabId: tab.tabId, name: input.value });
                  // Sidebar will re-render via configValues
                }
                function cancel() {
                  if (done) return;
                  done = true;
                  item.classList.remove('editing');
                  input.remove();
                  label.style.display = '';
                  closeBtn.style.display = '';
                }
                input.addEventListener('keydown', function(e) {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    commit();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    cancel();
                  }
                });
                input.addEventListener('blur', commit);
                // Prevent input clicks from bubbling up to switchTab
                input.addEventListener('click', function(e) { e.stopPropagation(); });
                input.addEventListener('mousedown', function(e) { e.stopPropagation(); });
                input.addEventListener('dblclick', function(e) { e.stopPropagation(); });
              }
              item.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                startInlineRename();
              });
              item.addEventListener('dblclick', function(e) {
                e.preventDefault();
                startInlineRename();
              });
              tabsList.appendChild(item);
            });
          }
        }
        if (!window.__tgTabBtnsInit) {
          window.__tgTabBtnsInit = true;
          var nb = document.getElementById('newTabBtn');
          if (nb) nb.addEventListener('click', function() {
            vscode.postMessage({ type: 'newTab' });
          });
          var db = document.getElementById('duplicateTabBtn');
          if (db) db.addEventListener('click', function() {
            vscode.postMessage({ type: 'duplicateTab' });
          });
        }
        // Surface "which tab am I editing?" in the Grid Size card header
        var gridSizeActiveLabel = document.getElementById('gridSizeActiveLabel');
        if (gridSizeActiveLabel) {
          var activeText = '';
          if (tabs.length > 0 && activeTabId !== -1) {
            var activeIdx = tabs.findIndex(function(t) { return t.tabId === activeTabId; });
            if (activeIdx >= 0) {
              var activeTab = tabs[activeIdx];
              var displayName = (activeTab.name && activeTab.name.length > 0)
                ? activeTab.name
                : ('Tab ' + (activeIdx + 1));
              activeText = '\u2192 ' + displayName;
            }
          } else if (tabs.length === 0) {
            activeText = '(no tab open)';
          }
          gridSizeActiveLabel.textContent = activeText;
        }
        updateSettingsUI();
        renderProjectList();
        renderPresetDropdown();
        var gridTotal = (msg.gridRows || 0) * (msg.gridCols || 0);
        var curHiddenCells = msg.hiddenCells || [];
        buildBroadcastTargets(gridTotal, msg.cellLabels || [], curHiddenCells);
        buildSettingsTabs(gridTotal, msg.cellLabels || [], curHiddenCells);
        buildCmdTabs(gridTotal, msg.cellLabels || [], curHiddenCells);
        showCmdTabValues();
        applySectionStates(msg.sectionStates || {});
        // Restore merge regions
        if (msg.mergedRegions && msg.mergedRegions.length > 0) {
          mergedRegions = msg.mergedRegions;
          if (mergeRows !== selectedRows || mergeCols !== selectedCols) {
            buildMergeGrid();
          } else {
            renderMergeGrid();
          }
        }
      }
    });

    vscode.postMessage({ type: 'getConfig' });
  </script>
</body>
</html>`}};function Ue(){let l="",e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";for(let t=0;t<32;t++)l+=e.charAt(Math.floor(Math.random()*e.length));return l}var ve=I(require("http"));var Y=class{constructor(e){this._server=null;this._port=e}start(e=10){return new Promise((t,a)=>{this._server=this._createServer();let n=s=>{this._server.removeAllListeners("error"),this._server.on("error",r=>{r.code==="EADDRINUSE"&&s<e?(this._port++,n(s+1)):a(r)}),this._server.listen(this._port,"127.0.0.1",()=>{let r=this._server.address();this._port=r.port,t(this._port)})};n(0)})}_createServer(){return ve.createServer((e,t)=>{if(t.setHeader("Content-Type","application/json"),e.method==="OPTIONS"){t.writeHead(204),t.end();return}let a=new URL(e.url||"/",`http://127.0.0.1:${this._port}`);e.method==="GET"&&a.pathname==="/api/health"?(t.writeHead(200),t.end(JSON.stringify({status:"ok"}))):e.method==="GET"&&a.pathname==="/api/info"?this._handleInfo(t):e.method==="POST"&&a.pathname==="/api/send"?this._readBody(e).then(n=>this._handleSend(n,t)):e.method==="POST"&&a.pathname==="/api/read"?this._readBody(e).then(n=>this._handleRead(n,t)):e.method==="POST"&&a.pathname==="/api/broadcast"?this._readBody(e).then(n=>this._handleBroadcast(n,t)):(t.writeHead(404),t.end(JSON.stringify({error:"Not found"})))})}stop(){this._server?.close(),this._server=null}getPort(){return this._port}_handleInfo(e){let t=w.getActive(),a=w.entries().map(([n,s])=>({tabId:n,rows:s.getRows(),cols:s.getCols(),cellIds:s.getCellIds(),labels:s.getCellLabels()}));e.writeHead(200),e.end(JSON.stringify({grid:t?{rows:t.getRows(),cols:t.getCols(),cellCount:t.getCellCount(),cellLabels:t.getCellLabels()}:null,tabs:a,activeTabId:w.getActiveTabId()??null}))}_handleSend(e,t){let a=typeof e.cellId=="number"?e.cellId:-1,n=typeof e.text=="string"?e.text:"",s=e.submit===!0,r=L.resolve(a);if(!r){t.writeHead(200),t.end(JSON.stringify({success:!1,error:"Invalid cell id"}));return}let c=w.get(r.tabId);if(!c){t.writeHead(200),t.end(JSON.stringify({success:!1,error:"Tab no longer open"}));return}let d=s?c.sendInputToCell(r.localCellId,n):c.sendToCell(r.localCellId,n);t.writeHead(200),t.end(JSON.stringify({success:d}))}_handleRead(e,t){let a=typeof e.cellId=="number"?e.cellId:-1,n=typeof e.lines=="number"?e.lines:void 0,s=L.resolve(a);if(!s){t.writeHead(200),t.end(JSON.stringify({output:null,error:"Invalid cell id"}));return}let r=w.get(s.tabId);if(!r){t.writeHead(200),t.end(JSON.stringify({output:null,error:"Tab no longer open"}));return}let c=r.readCell(s.localCellId,n);t.writeHead(200),t.end(JSON.stringify({output:c}))}_handleBroadcast(e,t){let a=w.getActive();if(!a){t.writeHead(200),t.end(JSON.stringify({success:!1,error:"No grid open"}));return}let n=typeof e.text=="string"?e.text:"",s=e.submit===!0,r=a.getCellCount();if(s)a.broadcastInput(n);else for(let c=0;c<r;c++)a.sendToCell(c,n);t.writeHead(200),t.end(JSON.stringify({success:!0,cellCount:r}))}_readBody(e){return new Promise(t=>{let a="";e.on("data",n=>{a+=n}),e.on("end",()=>{try{t(JSON.parse(a))}catch{t({})}})})}};var U,j;async function He(l){if(g.init(l),await g.migrateOnce(),D.ensureStableMcpScript(l),D.healMcpRegistrations(l),D.pruneCodexRegistration(),D.pruneWorkspaceMcpJson(),l.globalState.get("lastTabs",[]).length===0){let i=l.globalState.get("lastGrid");if(i&&i.rows>0&&i.cols>0){let b=i.rows*i.cols,v=[];for(let x=0;x<b;x++)v.push(x);await l.globalState.update("lastTabs",[{tabId:0,rows:i.rows,cols:i.cols,cellIds:v}]),l.globalState.get("nextTabId",0)<1&&await l.globalState.update("nextTabId",1),l.globalState.get("nextGlobalCellId",0)<b&&await l.globalState.update("nextGlobalCellId",b)}}try{let i=te.join(he.homedir(),".terminal-grid"),b=te.join(i,"reload-signal");O.mkdirSync(i,{recursive:!0});let v=O.existsSync(b)?O.statSync(b).mtimeMs:0,u=O.watch(i,(h,x)=>{if(x==="reload-signal")try{let S=O.statSync(b).mtimeMs;S>v&&(v=S,m.commands.executeCommand("workbench.action.reloadWindow"))}catch{}});l.subscriptions.push({dispose:()=>u.close()})}catch{}let t=m.workspace.workspaceFolders?.[0]?.uri.fsPath;if(t){let b=l.globalState.get("projectPresets",{})[t];if(b){let u=l.globalState.get("presets",[]).find(h=>h.name===b);if(u){let h=m.workspace.getConfiguration("terminalGrid");if(await h.update("defaultRows",u.rows,m.ConfigurationTarget.Global),await h.update("defaultCols",u.cols,m.ConfigurationTarget.Global),await h.update("zoomPercent",u.zoomPercent,m.ConfigurationTarget.Global),await h.update("fontFamily",u.fontFamily,m.ConfigurationTarget.Global),await h.update("backgroundColor",u.bgColor,m.ConfigurationTarget.Global),await h.update("foregroundColor",u.fgColor,m.ConfigurationTarget.Global),await h.update("colorTheme",u.colorTheme||"",m.ConfigurationTarget.Global),await h.update("shellType",u.shellType||"",m.ConfigurationTarget.Global),l.globalState.get("lastTabs",[]).length===0){let S=R.next(l);if(await g.setStartupCommands(S,u.startupCommands||[]),await g.setCellLabels(S,u.cellLabels||[]),await g.setDefaultCommand(S,u.defaultCommand||""),u.defaultSteps?await g.setDefaultSteps(S,u.defaultSteps):u.defaultCommand?await g.setDefaultSteps(S,[{type:"command",input:u.defaultCommand}]):await g.setDefaultSteps(S,[]),u.cellStepsOverrides){let k={};for(let[E,H]of Object.entries(u.cellStepsOverrides))k[Number(E)]={},Array.isArray(H.startupSteps)&&(k[Number(E)].startupSteps=H.startupSteps);await g.setCellOverrides(S,k)}await g.setMergedRegions(S,u.mergedRegions||[]),await l.globalState.update("pendingFirstTabId",S)}}}}let a=new D(l),n=m.workspace.getConfiguration("terminalGrid").get("apiPort",7890);n>0&&(U=new Y(n),U.start().then(i=>{j=m.window.createStatusBarItem(m.StatusBarAlignment.Right,50),j.text=`$(broadcast) TG :${i}`,j.tooltip=m.l10n.t("Terminal Grid API active on port {0}",i),j.command="terminalGrid.copyMcpConfig",j.show(),l.subscriptions.push(j),a.setMcpPort(i)}).catch(i=>{m.window.showWarningMessage(m.l10n.t("Terminal Grid API bridge failed to start: {0}",i.message))}));let s=m.lm;if(typeof s?.registerMcpServerDefinitionProvider=="function"){let i=new m.EventEmitter,b=n,v=s.registerMcpServerDefinitionProvider;l.subscriptions.push(v("terminalGrid",{onDidChangeMcpServerDefinitions:i.event,provideMcpServerDefinitions:async()=>{if(b<=0)return[];let u=m.McpStdioServerDefinition;return u?[new u("Terminal Grid","node",[D.ensureStableMcpScript(l)],{TERMINAL_GRID_PORT:String(b)},l.extension.packageJSON.version)]:[]}}),i),l.subscriptions.push(m.workspace.onDidChangeConfiguration(u=>{u.affectsConfiguration("terminalGrid.apiPort")&&(b=m.workspace.getConfiguration("terminalGrid").get("apiPort",7890),i.fire())}))}l.subscriptions.push(m.window.registerWebviewViewProvider(D.viewType,a)),l.subscriptions.push(m.commands.registerCommand("terminalGrid._refreshSidebar",()=>{a.sendConfig()}));let r=l.globalState.get("lastTabs",[]),c=0,d=!1,f=!1,p=async()=>{if(d)return;d=!0,w.size()>0&&_.persistTabs(l);let i=new Set(w.entries().map(([v])=>v)),b=r.filter(v=>!i.has(v.tabId));if(b.length>0){let v=[];for(let u of m.window.tabGroups.all)for(let h of u.tabs)if(h.input instanceof m.TabInputWebview){let x=h.input.viewType||"";(x==="terminalGrid"||x.endsWith("-terminalGrid"))&&!h.isActive&&v.push(h)}if(v.length>0)try{await m.window.tabGroups.close(v)}catch{}for(let u of b)_.createOrShow(l,u.rows,u.cols,{forceNewTab:!0,tabIdOverride:u.tabId,cellIdsOverride:u.cellIds})}else w.size()===0&&l.globalState.get("lastTabs",[]).length>0&&(l.globalState.update("lastTabs",void 0),l.globalState.update("lastGrid",void 0))};l.subscriptions.push(m.window.registerWebviewPanelSerializer("terminalGrid",{async deserializeWebviewPanel(i,b){if(c<r.length){let v=r[c++];_.revive(i,l,v.rows,v.cols,v.tabId,v.cellIds)}else i.dispose();f||(f=!0,setTimeout(()=>{p()},100))}})),setTimeout(()=>{p()},1500),l.subscriptions.push(m.commands.registerCommand("terminalGrid.openGrid",()=>{let i=m.workspace.getConfiguration("terminalGrid"),b=i.get("defaultRows",2),v=i.get("defaultCols",3);_.createOrShow(l,b,v)}),m.commands.registerCommand("terminalGrid.openCustomGrid",(i,b)=>{_.createOrShow(l,i,b)}),m.commands.registerCommand("terminalGrid.open2x2",()=>_.createOrShow(l,2,2)),m.commands.registerCommand("terminalGrid.open2x3",()=>_.createOrShow(l,2,3)),m.commands.registerCommand("terminalGrid.open3x3",()=>_.createOrShow(l,3,3)),m.commands.registerCommand("terminalGrid.newTab",()=>{let i=w.getActive(),b=m.workspace.getConfiguration("terminalGrid"),v=i?.getRows()??b.get("defaultRows",2),u=i?.getCols()??b.get("defaultCols",3);_.createOrShow(l,v,u,{forceNewTab:!0})}),m.commands.registerCommand("terminalGrid.duplicateTab",async()=>{let i=w.getActive();if(!i){m.window.showWarningMessage(m.l10n.t("No active tab to duplicate."));return}let b=i.getRows(),v=i.getCols(),u=i.getTabId(),h=R.next(l);await g.cloneTab(u,h),_.createOrShow(l,b,v,{forceNewTab:!0,tabIdOverride:h}),m.window.showInformationMessage(m.l10n.t("Tab duplicated. Terminal history is not copied; cells will start with the configured startup commands."))}),m.commands.registerCommand("terminalGrid.closeTab",()=>{if(w.size()<=1){m.window.showWarningMessage(m.l10n.t("Cannot close the last remaining tab."));return}let i=w.getActive();i&&i.dispose()}),m.commands.registerCommand("terminalGrid.resetCellIds",async()=>{if(w.size()>0){m.window.showWarningMessage(m.l10n.t("Close all Terminal Grid tabs before resetting cell IDs."));return}await L.reset(l),await R.reset(l),m.window.showInformationMessage(m.l10n.t("Cell IDs and tab counter reset."))}),m.commands.registerCommand("terminalGrid.resetAllTabs",async()=>{await m.window.showWarningMessage(m.l10n.t("Close all Terminal Grid tabs and wipe persisted tab state? This cannot be undone."),{modal:!0},m.l10n.t("Reset"))===m.l10n.t("Reset")&&(w.disposeAll(),await L.reset(l),await R.reset(l),await l.globalState.update("lastTabs",void 0),await l.globalState.update("lastGrid",void 0),await l.globalState.update("pendingFirstTabId",void 0),m.window.showInformationMessage(m.l10n.t("All Terminal Grid tabs and persisted state reset.")))}),m.commands.registerCommand("terminalGrid.sendToCell",(i,b)=>{let v=L.resolve(i);return v?w.get(v.tabId)?.sendToCell(v.localCellId,b)??!1:!1}),m.commands.registerCommand("terminalGrid.readCell",(i,b)=>{let v=L.resolve(i);return v?w.get(v.tabId)?.readCell(v.localCellId,b)??null:null}),m.commands.registerCommand("terminalGrid.getGridInfo",()=>{let i=w.getActive();if(!i)return null;let b=w.entries().map(([v,u])=>({tabId:v,rows:u.getRows(),cols:u.getCols(),cellIds:u.getCellIds(),labels:u.getCellLabels()}));return{rows:i.getRows(),cols:i.getCols(),cellCount:i.getCellCount(),cellLabels:i.getCellLabels(),tabs:b,activeTabId:w.getActiveTabId()??null}}),m.commands.registerCommand("terminalGrid.testAPI",async()=>{let i=m.window.createOutputChannel("Terminal Grid Tests");i.show(),i.appendLine(`=== Terminal Grid API Tests ===
`);let b=0,v=0;function u(M,B,N){let G=B?"PASS":"FAIL";B?b++:v++,i.appendLine(`[${G}] ${M}${N?" \u2014 "+N:""}`)}let h=await m.commands.executeCommand("terminalGrid.getGridInfo");if(!h){i.appendLine("[FAIL] getGridInfo returned null. Open a grid first.");return}u("getGridInfo returns object",!!h,JSON.stringify(h)),u("rows is number",typeof h.rows=="number",`rows=${h.rows}`),u("cols is number",typeof h.cols=="number",`cols=${h.cols}`),u("cellCount = rows*cols",h.cellCount===h.rows*h.cols,`${h.cellCount}`),u("cellLabels is array",Array.isArray(h.cellLabels),`length=${h.cellLabels.length}`),u("cellLabels.length = cellCount",h.cellLabels.length===h.cellCount);let x=await m.commands.executeCommand("terminalGrid.sendToCell",0,"echo __API_TEST__\r");u("sendToCell(0) returns true",x===!0);let S=await m.commands.executeCommand("terminalGrid.sendToCell",999,"x\r");u("sendToCell(999) returns false",S===!1,`got ${S}`);let k=await m.commands.executeCommand("terminalGrid.sendToCell",0,"TYPED_ONLY");u("sendToCell without \\r returns true",k===!0),await new Promise(M=>setTimeout(M,2e3)),await m.commands.executeCommand("terminalGrid.sendToCell",0,"");let E=await m.commands.executeCommand("terminalGrid.readCell",0);u("readCell(0) returns string",typeof E=="string",`length=${E?.length??0}`),u("readCell(0) contains test marker",!!E&&E.includes("__API_TEST__"));let H=await m.commands.executeCommand("terminalGrid.readCell",0,3);u("readCell(0, 3) returns string",typeof H=="string");let se=await m.commands.executeCommand("terminalGrid.readCell",0,0);u("readCell(0, 0) returns empty",se==="",`got "${se}"`);let ne=await m.commands.executeCommand("terminalGrid.readCell",999);if(u("readCell(999) returns null",ne===null,`got ${ne}`),h.cellCount>1){let M=await m.commands.executeCommand("terminalGrid.sendToCell",1,"echo CELL1_OK\r");u("sendToCell(1) returns true",M===!0),await new Promise(N=>setTimeout(N,1500));let B=await m.commands.executeCommand("terminalGrid.readCell",1);u("readCell(1) contains CELL1_OK",!!B&&B.includes("CELL1_OK"))}if(h.tabs&&h.tabs.length>1){i.appendLine(`
--- Multi-tab tests ---`);let M=h.tabs.flatMap(K=>K.cellIds),B=new Set(M);u("global cell ids unique across all tabs",B.size===M.length,`${M.length} ids`),u("activeTabId is a number",typeof h.activeTabId=="number");let N=h.tabs[1],G=N.cellIds[0],we=await m.commands.executeCommand("terminalGrid.sendToCell",G,"echo __MULTITAB_OK__\r");u(`sendToCell global=${G} (tab ${N.tabId+1} cell 1) returns true`,we===!0),await new Promise(K=>setTimeout(K,1500));let re=await m.commands.executeCommand("terminalGrid.readCell",G);u(`readCell global=${G} contains __MULTITAB_OK__`,!!re&&re.includes("__MULTITAB_OK__"));let ae=Math.max(...M)+1e4,ye=await m.commands.executeCommand("terminalGrid.sendToCell",ae,"x");u(`sendToCell with bogus global id=${ae} returns false`,ye===!1)}else h.tabs&&i.appendLine(`
(Multi-tab tests skipped: only ${h.tabs.length} tab open. Open a second tab via the sidebar to enable.)`);i.appendLine(`
=== ${b} passed, ${v} failed ===`),v===0?m.window.showInformationMessage(m.l10n.t("Terminal Grid API: All {0} tests passed!",b)):m.window.showWarningMessage(m.l10n.t("Terminal Grid API: {0} test(s) failed. See output.",v))}),m.commands.registerCommand("terminalGrid.copyMcpConfig",()=>{let i=U?.getPort()??7890,v={mcpServers:{"terminal-grid":{command:"node",args:[D.ensureStableMcpScript(l)],env:{TERMINAL_GRID_PORT:String(i)}}}};m.env.clipboard.writeText(JSON.stringify(v,null,2)),m.window.showInformationMessage(m.l10n.t("Terminal Grid MCP config copied to clipboard (port {0})",i))}))}function We(){U?.stop(),U=void 0,w.disposeAll()}0&&(module.exports={activate,deactivate});

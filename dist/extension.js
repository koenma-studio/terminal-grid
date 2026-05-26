"use strict";var ve=Object.create;var W=Object.defineProperty;var he=Object.getOwnPropertyDescriptor;var we=Object.getOwnPropertyNames;var ye=Object.getPrototypeOf,Ce=Object.prototype.hasOwnProperty;var xe=(o,e)=>{for(var n in e)W(o,n,{get:e[n],enumerable:!0})},re=(o,e,n,a)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of we(e))!Ce.call(o,s)&&s!==n&&W(o,s,{get:()=>e[s],enumerable:!(a=he(e,s))||a.enumerable});return o};var T=(o,e,n)=>(n=o!=null?ve(ye(o)):{},re(e||!o||!o.__esModule?W(n,"default",{value:o,enumerable:!0}):n,o)),Se=o=>re(W({},"__esModule",{value:!0}),o);var Ne={};xe(Ne,{activate:()=>Oe,deactivate:()=>Be});module.exports=Se(Ne);var u=T(require("vscode")),U=T(require("path")),P=T(require("fs")),me=T(require("os"));var i=T(require("vscode")),_=T(require("fs")),R=T(require("path")),Y=T(require("os")),ge=T(require("child_process"));var y=T(require("vscode")),J=T(require("os")),G=T(require("fs")),$=T(require("path"));var ae={"":null,Dracula:{name:"Dracula",background:"#282a36",foreground:"#f8f8f2",cursor:"#f8f8f2",cursorAccent:"#282a36",selectionBackground:"#44475a",black:"#21222c",brightBlack:"#6272a4",red:"#ff5555",brightRed:"#ff6e6e",green:"#50fa7b",brightGreen:"#69ff94",yellow:"#f1fa8c",brightYellow:"#ffffa5",blue:"#bd93f9",brightBlue:"#d6acff",magenta:"#ff79c6",brightMagenta:"#ff92df",cyan:"#8be9fd",brightCyan:"#a4ffff",white:"#f8f8f2",brightWhite:"#ffffff"},Monokai:{name:"Monokai",background:"#272822",foreground:"#f8f8f2",cursor:"#f8f8f0",cursorAccent:"#272822",selectionBackground:"#49483e",black:"#272822",brightBlack:"#75715e",red:"#f92672",brightRed:"#f92672",green:"#a6e22e",brightGreen:"#a6e22e",yellow:"#f4bf75",brightYellow:"#f4bf75",blue:"#66d9ef",brightBlue:"#66d9ef",magenta:"#ae81ff",brightMagenta:"#ae81ff",cyan:"#a1efe4",brightCyan:"#a1efe4",white:"#f8f8f2",brightWhite:"#f9f8f5"},"Solarized Dark":{name:"Solarized Dark",background:"#002b36",foreground:"#839496",cursor:"#839496",cursorAccent:"#002b36",selectionBackground:"#073642",black:"#073642",brightBlack:"#586e75",red:"#dc322f",brightRed:"#cb4b16",green:"#859900",brightGreen:"#586e75",yellow:"#b58900",brightYellow:"#657b83",blue:"#268bd2",brightBlue:"#839496",magenta:"#d33682",brightMagenta:"#6c71c4",cyan:"#2aa198",brightCyan:"#93a1a1",white:"#eee8d5",brightWhite:"#fdf6e3"},"Solarized Light":{name:"Solarized Light",background:"#fdf6e3",foreground:"#657b83",cursor:"#657b83",cursorAccent:"#fdf6e3",selectionBackground:"#eee8d5",black:"#073642",brightBlack:"#586e75",red:"#dc322f",brightRed:"#cb4b16",green:"#859900",brightGreen:"#586e75",yellow:"#b58900",brightYellow:"#657b83",blue:"#268bd2",brightBlue:"#839496",magenta:"#d33682",brightMagenta:"#6c71c4",cyan:"#2aa198",brightCyan:"#93a1a1",white:"#eee8d5",brightWhite:"#fdf6e3"},Nord:{name:"Nord",background:"#2e3440",foreground:"#d8dee9",cursor:"#d8dee9",cursorAccent:"#2e3440",selectionBackground:"#434c5e",black:"#3b4252",brightBlack:"#4c566a",red:"#bf616a",brightRed:"#bf616a",green:"#a3be8c",brightGreen:"#a3be8c",yellow:"#ebcb8b",brightYellow:"#ebcb8b",blue:"#81a1c1",brightBlue:"#81a1c1",magenta:"#b48ead",brightMagenta:"#b48ead",cyan:"#88c0d0",brightCyan:"#8fbcbb",white:"#e5e9f0",brightWhite:"#eceff4"},"One Dark":{name:"One Dark",background:"#282c34",foreground:"#abb2bf",cursor:"#528bff",cursorAccent:"#282c34",selectionBackground:"#3e4451",black:"#282c34",brightBlack:"#5c6370",red:"#e06c75",brightRed:"#e06c75",green:"#98c379",brightGreen:"#98c379",yellow:"#e5c07b",brightYellow:"#d19a66",blue:"#61afef",brightBlue:"#61afef",magenta:"#c678dd",brightMagenta:"#c678dd",cyan:"#56b6c2",brightCyan:"#56b6c2",white:"#abb2bf",brightWhite:"#ffffff"},"Gruvbox Dark":{name:"Gruvbox Dark",background:"#282828",foreground:"#ebdbb2",cursor:"#ebdbb2",cursorAccent:"#282828",selectionBackground:"#504945",black:"#282828",brightBlack:"#928374",red:"#cc241d",brightRed:"#fb4934",green:"#98971a",brightGreen:"#b8bb26",yellow:"#d79921",brightYellow:"#fabd2f",blue:"#458588",brightBlue:"#83a598",magenta:"#b16286",brightMagenta:"#d3869b",cyan:"#689d6a",brightCyan:"#8ec07c",white:"#a89984",brightWhite:"#ebdbb2"},"Tokyo Night":{name:"Tokyo Night",background:"#1a1b26",foreground:"#a9b1d6",cursor:"#c0caf5",cursorAccent:"#1a1b26",selectionBackground:"#33467c",black:"#15161e",brightBlack:"#414868",red:"#f7768e",brightRed:"#f7768e",green:"#9ece6a",brightGreen:"#9ece6a",yellow:"#e0af68",brightYellow:"#e0af68",blue:"#7aa2f7",brightBlue:"#7aa2f7",magenta:"#bb9af7",brightMagenta:"#bb9af7",cyan:"#7dcfff",brightCyan:"#7dcfff",white:"#a9b1d6",brightWhite:"#c0caf5"}},ie=Object.keys(ae);function A(o){let e=ae[o];if(!e)return null;let{name:n,...a}=e;return a}var oe=T(require("vscode")),q=class{constructor(){this._panels=new Map;this._onDidChange=new oe.EventEmitter;this.onDidChange=this._onDidChange.event}register(e,n,a){if(a!==void 0&&a>=0&&a<=this._panels.size){let s=Array.from(this._panels.entries());s.splice(a,0,[e,n]),this._panels=new Map(s)}else this._panels.set(e,n);this._activeTabId=e,this._onDidChange.fire()}unregister(e,n){if(n!==void 0&&this._panels.get(e)!==n)return;let a=this._panels.delete(e);if(this._activeTabId===e){let s=Array.from(this._panels.keys());this._activeTabId=s.length>0?s[s.length-1]:void 0}a&&this._onDidChange.fire()}replace(e,n,a){let s=Array.from(this._panels.entries()),t=s.findIndex(([r])=>r===e);t>=0?s[t]=[n,a]:s.push([n,a]),this._panels=new Map(s),this._activeTabId=n,this._onDidChange.fire()}setActive(e){this._panels.has(e)&&this._activeTabId!==e&&(this._activeTabId=e,this._onDidChange.fire())}getActive(){return this._activeTabId!==void 0?this._panels.get(this._activeTabId):void 0}getActiveTabId(){return this._activeTabId}get(e){return this._panels.get(e)}has(e){return this._panels.has(e)}size(){return this._panels.size}all(){return Array.from(this._panels.values())}entries(){return Array.from(this._panels.entries())}disposeAll(){let e=Array.from(this._panels.values());for(let n of e)try{n.dispose()}catch{}this._panels.clear(),this._activeTabId=void 0}},w=new q,E=class o{static{this.KEY="nextTabId"}static next(e){let n=e.globalState.get(o.KEY,0);return e.globalState.update(o.KEY,n+1),n}static peek(e){return e.globalState.get(o.KEY,0)}static reset(e){return e.globalState.update(o.KEY,0)}};var Z=class{init(e){this._ctx=e}get ctx(){if(!this._ctx)throw new Error("TabStateStore not initialized");return this._ctx}getCellOverrides(e){return this.ctx.globalState.get(`cellOverrides_${e}`,{})}setCellOverrides(e,n){return this.ctx.globalState.update(`cellOverrides_${e}`,n)}getCellLabels(e){return this.ctx.globalState.get(`cellLabels_${e}`,[])}setCellLabels(e,n){return this.ctx.globalState.update(`cellLabels_${e}`,n)}getMergedRegions(e){return this.ctx.globalState.get(`mergedRegions_${e}`,[])}setMergedRegions(e,n){return this.ctx.globalState.update(`mergedRegions_${e}`,n)}getDefaultSteps(e){return this.ctx.globalState.get(`defaultSteps_${e}`,[])}setDefaultSteps(e,n){return this.ctx.globalState.update(`defaultSteps_${e}`,n)}getDefaultCommand(e){return this.ctx.globalState.get(`defaultCommand_${e}`,"")}setDefaultCommand(e,n){return this.ctx.globalState.update(`defaultCommand_${e}`,n)}getStartupCommands(e){return this.ctx.globalState.get(`startupCommands_${e}`,[])}setStartupCommands(e,n){return this.ctx.globalState.update(`startupCommands_${e}`,n)}getTabName(e){return this.ctx.globalState.get(`tabName_${e}`,"")}setTabName(e,n){return this.ctx.globalState.update(`tabName_${e}`,n)}async deleteTab(e){let n=[`cellOverrides_${e}`,`cellLabels_${e}`,`mergedRegions_${e}`,`defaultSteps_${e}`,`defaultCommand_${e}`,`startupCommands_${e}`,`tabName_${e}`];for(let a of n)await this.ctx.globalState.update(a,void 0)}async cloneTab(e,n){await this.setCellOverrides(n,JSON.parse(JSON.stringify(this.getCellOverrides(e)))),await this.setCellLabels(n,[...this.getCellLabels(e)]),await this.setMergedRegions(n,JSON.parse(JSON.stringify(this.getMergedRegions(e)))),await this.setDefaultSteps(n,JSON.parse(JSON.stringify(this.getDefaultSteps(e)))),await this.setDefaultCommand(n,this.getDefaultCommand(e)),await this.setStartupCommands(n,JSON.parse(JSON.stringify(this.getStartupCommands(e))))}async migrateOnce(){if(this.ctx.globalState.get("multiTabMigrationDone",!1))return;let n=this.ctx.globalState.get("cellOverrides",{}),a=this.ctx.globalState.get("cellLabels",[]),s=this.ctx.globalState.get("mergedRegions",[]),t=this.ctx.globalState.get("defaultSteps",[]),r=this.ctx.globalState.get("defaultCommand",""),g=this.ctx.globalState.get("startupCommands",[]);await this.setCellOverrides(0,n),await this.setCellLabels(0,a),await this.setMergedRegions(0,s),await this.setDefaultSteps(0,t),await this.setDefaultCommand(0,r),await this.setStartupCommands(0,g),await this.ctx.globalState.update("multiTabMigrationDone",!0)}},p=new Z;var X=class o{static{this.KEY="nextGlobalCellId"}allocate(e,n){let a=e.globalState.get(o.KEY,0),s=[];for(let t=0;t<n;t++)s.push(a+t);return e.globalState.update(o.KEY,a+n),s}peek(e){return e.globalState.get(o.KEY,0)}reset(e){return e.globalState.update(o.KEY,0)}resolve(e){for(let[n,a]of w.entries()){let t=a.getCellIds().indexOf(e);if(t!==-1)return{tabId:n,localCellId:t}}return null}},L=new X;function O(o){return new Promise(e=>setTimeout(e,o))}var _e=3e3,ke=15e3,Te=200,Ie=[/[❯>✻⏵›]\s*$/m,/aider>\s*$/m],le=(()=>{if(process.platform!=="win32")return 0;let o=J.release().split(".");return parseInt(o[2]||"0",10)})(),de=le>0&&le<22e3?"\r":"\x1B[13u",Ee=["claude","codex","gemini","copilot","aider","claude --dangerously-skip-permissions","codex -s danger-full-access -a never"];function Q(o){let e=o.trim();return Ee.some(n=>e===n||e.startsWith(n+" "))}function Re(o){let e=o.toLowerCase();return e.includes("powershell")||e.includes("pwsh")||e.includes("cmd")?`\r
`:"\r"}function ce(o,e,n,a,s){let t=o[s];return t?.startupSteps&&t.startupSteps.length>0?t.startupSteps:t?.startupCommand?[{type:"command",input:t.startupCommand}]:e[s]?[{type:"command",input:e[s]}]:n.length>0?n:a?[{type:"command",input:a}]:[]}var pe={".ttf":"truetype",".otf":"opentype",".woff":"woff",".woff2":"woff2"},x=class o{constructor(e,n,a,s,t,r){this._cellIds=[];this._terminals=[];this._outputBuffers=[];this._csiUMode=[];this._insideLlm=[];this._cellShellType=[];this._disposed=!1;this._stepGeneration={};this._pasteImages=[];this._panel=e,this._context=n,this._rows=a,this._cols=s,this._tabId=t,this._cellIds=r,this._panel.title=y.l10n.t("Terminal Grid {0}\xD7{1}",a,s),this._registryListener=w.onDidChange(()=>{this._disposed||this.refreshTitle()});let g=p.getMergedRegions(t).filter(l=>l.startRow+l.rowSpan<=a&&l.startCol+l.colSpan<=s);this._hiddenCells=new Set;for(let l of g)for(let b=l.startRow;b<l.startRow+l.rowSpan;b++)for(let m=l.startCol;m<l.startCol+l.colSpan;m++)b===l.startRow&&m===l.startCol||this._hiddenCells.add(b*s+m);this._panel.webview.options={enableScripts:!0,localResourceRoots:[y.Uri.joinPath(n.extensionUri,"media")]},this._panel.webview.html=this._getHtml(),this._panel.webview.onDidReceiveMessage(async l=>{switch(l.type){case"ready":if(this._createTerminals(l.defaultCols,l.defaultRows),l.cellDims&&Array.isArray(l.cellDims))for(let m=0;m<l.cellDims.length&&m<this._terminals.length;m++){let d=l.cellDims[m];if(d?.cols&&d?.rows)try{this._terminals[m].pty.resize(d.cols,d.rows)}catch{}}this.loadCustomFonts(this._context.globalState.get("customFonts",[]));let b=p.getCellOverrides(this._tabId);for(let[m,d]of Object.entries(b))if(d.bgColor||d.fgColor||d.fontFamily||d.themeName){let f=d.themeName?A(d.themeName):null;this.sendCellConfig(parseInt(m),d.bgColor||"",d.fgColor||"",d.fontFamily||"",d.themeName||"",f)}break;case"input":{let m=this._terminals[l.id]?.pty;m&&this._chunkedWrite(m,l.data);break}case"clipboardWrite":y.env.clipboard.writeText(l.text);break;case"pasteRequest":{let m=await y.env.clipboard.readText();if(m&&this._terminals[l.id]){let f=/\r?\n/.test(m)?"\x1B[200~"+m+"\x1B[201~":m;this._chunkedWrite(this._terminals[l.id].pty,f)}break}case"pasteImage":{let m=l.data.match(/^data:image\/([^;]+);base64,(.+)$/s);if(m&&this._terminals[l.id]){for(let v of this._pasteImages)try{G.unlinkSync(v)}catch{}this._pasteImages=[];let d=m[1]==="jpeg"?"jpg":m[1],f=$.join(J.tmpdir(),`tg-paste-${Date.now()}.${d}`);G.writeFileSync(f,Buffer.from(m[2],"base64")),this._pasteImages.push(f),this._chunkedWrite(this._terminals[l.id].pty,f)}break}case"resize":try{this._terminals[l.id]?.pty.resize(l.cols,l.rows)}catch{}break;case"clearTerminal":this._panel.webview.postMessage({type:"clear",id:l.id});break;case"killTerminal":try{this._terminals[l.id]?.pty.kill()}catch{}break;case"restartTerminal":this._restartTerminal(l.id);break;case"renameCell":{let m=p.getCellLabels(this._tabId),d=m[l.id]||"",f=await y.window.showInputBox({prompt:y.l10n.t("Rename cell {0}",l.id+1),value:d,placeHolder:y.l10n.t("Enter alias (empty to reset)")});f!==void 0&&(m[l.id]=f,await p.setCellLabels(this._tabId,m),this.sendLabels(),y.commands.executeCommand("terminalGrid._refreshSidebar"));break}}}),this._configListener=y.workspace.onDidChangeConfiguration(l=>{if(l.affectsConfiguration("terminalGrid")){let b=y.workspace.getConfiguration("terminalGrid"),m=b.get("colorTheme","");this._panel.webview.postMessage({type:"configUpdate",zoom:b.get("zoomPercent",100),fontFamily:b.get("fontFamily",""),bgColor:b.get("backgroundColor",""),fgColor:b.get("foregroundColor",""),themeName:m,themeColors:A(m)})}}),this._panel.onDidDispose(()=>this.dispose()),this._panel.onDidChangeViewState(l=>{this._disposed||l.webviewPanel.active&&(w.setActive(this._tabId),y.commands.executeCommand("terminalGrid._refreshSidebar"))}),this._panel.iconPath=y.Uri.joinPath(n.extensionUri,"images","sidebar.svg")}static get currentPanel(){return w.getActive()}static{this.OUTPUT_BUFFER_SIZE=5e4}static{this.CSI_U_ENABLE=/\x1b\[>[0-9]+u/}static{this.CSI_U_DISABLE=/\x1b\[<[0-9]*u/}static _getLog(){return o._log||(o._log=y.window.createOutputChannel("Terminal Grid")),o._log}static _getNodePty(){if(o._nodePty===void 0)try{o._nodePty=require("node-pty")}catch{o._nodePty=null}return o._nodePty}static getAvailableShells(){let e=[{name:"IDE Default",path:"",args:[]}];try{let r=function(m){try{if(/[/\\]/.test(m))return a.existsSync(m);let d=process.platform==="win32"?`where ${m}`:`which ${m}`;return s.execSync(d,{stdio:"ignore",timeout:500}),!0}catch{return!1}};var n=r;let a=require("fs"),s=require("child_process"),t=new Set,g=process.platform==="win32"?"windows":process.platform==="darwin"?"osx":"linux",l=y.workspace.getConfiguration(`terminal.integrated.profiles.${g}`);if(l)for(let m of Object.keys(l))try{let d=l.get(m);if(!d||typeof d!="object")continue;let f=Array.isArray(d.path)?d.path[0]:d.path;f&&r(f)&&(e.push({name:m,path:f,args:d.args||[]}),t.add(f.toLowerCase()))}catch{}let b=process.platform==="win32"?[{name:"PowerShell",path:"powershell.exe",args:["-NoLogo"]},{name:"PowerShell 7",path:"pwsh.exe",args:["-NoLogo"]},{name:"Command Prompt",path:"cmd.exe",args:[]},{name:"Git Bash",path:"C:\\Program Files\\Git\\bin\\bash.exe",args:["--login"]},{name:"WSL",path:"wsl.exe",args:[]}]:[{name:"Bash",path:"/bin/bash",args:["--login"]},{name:"Zsh",path:"/bin/zsh",args:["--login"]},{name:"Fish",path:"/usr/bin/fish",args:[]},{name:"sh",path:"/bin/sh",args:[]}];for(let m of b)!t.has(m.path.toLowerCase())&&r(m.path)&&(e.push(m),t.add(m.path.toLowerCase()))}catch{}return e}_resolveShell(e){if(!e)return process.platform==="win32"?o._getNodePty()?{path:"powershell.exe",args:["-NoLogo","-NoProfile"]}:{path:process.env.COMSPEC||"cmd.exe",args:[]}:{path:process.env.SHELL||"bash",args:[]};let a=o.getAvailableShells().find(t=>t.path===e||t.name===e);if(a&&a.path)return{path:a.path,args:a.args};let s=e.toLowerCase();return s.includes("powershell")||s.includes("pwsh")?{path:e,args:["-NoLogo"]}:s.includes("bash")||s.includes("zsh")?{path:e,args:["--login"]}:{path:e,args:[]}}static createOrShow(e,n,a,s){let t=s?.forceNewTab?null:w.getActive(),r,g,l;if(t){l=t.getTabId(),r=s?.tabIdOverride??l;let d=t.getRows()*t.getCols()===n*a;g=s?.cellIdsOverride??(d?t.getCellIds():L.allocate(e,n*a))}else{if(s?.tabIdOverride!==void 0)r=s.tabIdOverride;else{let d=e.globalState.get("pendingFirstTabId");d!=null?(r=d,e.globalState.update("pendingFirstTabId",void 0)):r=E.next(e)}g=s?.cellIdsOverride??L.allocate(e,n*a)}let b=y.window.createWebviewPanel("terminalGrid",y.l10n.t("Terminal Grid {0}\xD7{1}",n,a),y.ViewColumn.One,{enableScripts:!0,retainContextWhenHidden:!0,localResourceRoots:[y.Uri.joinPath(e.extensionUri,"media")]}),m=new o(b,e,n,a,r,g);return t&&l!==void 0?(w.replace(l,r,m),t.dispose()):w.register(r,m,s?.positionOverride),o._persistTabs(e),r}static revive(e,n,a,s,t,r){let g;if(t===void 0){let d=w.getActive();if(d){let f=d.getTabId(),v=w.entries().findIndex(([c])=>c===f);v>=0&&(g=v),d.dispose()}}let l=t??E.next(n),b=r??L.allocate(n,a*s),m=new o(e,n,a,s,l,b);w.register(l,m,g),o._persistTabs(n),y.commands.executeCommand("terminalGrid._refreshSidebar")}static persistTabs(e){o._persistTabs(e)}static _persistTabs(e){let n=w.entries().map(([a,s])=>({tabId:a,rows:s.getRows(),cols:s.getCols(),cellIds:s.getCellIds()}));if(e.globalState.update("lastTabs",n),n.length>0){let a=n[n.length-1];e.globalState.update("lastGrid",{rows:a.rows,cols:a.cols})}}static _formatTitle(e,n,a,s){let t=y.workspace.workspaceFolders?.[0]?.name,r=y.l10n.t("Terminal Grid {0}\xD7{1}",e,n),g=s&&s.length>0?s:y.l10n.t("Tab {0}",a+1);return t?`${t} \u2014 ${r} \xB7 ${g}`:`${r} \xB7 ${g}`}_enterSeq(e){return this._csiUMode[e]||this._insideLlm[e]?de:Re(this._cellShellType[e]||"")}broadcastInput(e){for(let n of this._terminals)if(!this._hiddenCells.has(n.id)){if(this._insideLlm[n.id])this._typeToCell(n.id,e).then(()=>O(50)).then(()=>{n.pty.write(this._enterSeq(n.id))});else{let s=/\r?\n/.test(e)?"\x1B[200~"+e+"\x1B[201~":e;this._chunkedWrite(n.pty,s+this._enterSeq(n.id))}Q(e)&&(this._insideLlm[n.id]=!0),e.trim()==="exit"&&(this._insideLlm[n.id]=!1)}}sendToCell(e,n){let a=this._terminals[e];return a?(this._chunkedWrite(a.pty,n),!0):!1}sendInputToCell(e,n){let a=this._terminals[e];if(!a)return!1;if(this._insideLlm[e])this._typeToCell(e,n).then(()=>O(50)).then(()=>{a.pty.write(this._enterSeq(e))});else{let t=/\r?\n/.test(n)?"\x1B[200~"+n+"\x1B[201~":n;this._chunkedWrite(a.pty,t+this._enterSeq(e))}return Q(n)&&(this._insideLlm[e]=!0),n.trim()==="exit"&&(this._insideLlm[e]=!1),!0}static _stripAnsi(e){return e.replace(/\x1b\[[0-9;?]*[a-zA-Z]/g,"").replace(/\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)/g,"").replace(/\x1b[()][0-9A-Z]/g,"").replace(/\x1b[78DEHM]/g,"").replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g,"").replace(/\r\n/g,`
`).replace(/\r/g,`
`).replace(/\n{3,}/g,`

`)}readCell(e,n){if(this._hiddenCells.has(e))return null;let a=this._outputBuffers[e];if(a===void 0)return null;let s=o._stripAnsi(a);return n===void 0?s:n<=0?"":s.split(`
`).slice(-n).join(`
`)}getCellCount(){return this._terminals.length}getRows(){return this._rows}getCols(){return this._cols}getCellLabels(){let e=p.getCellLabels(this._tabId),n=this._rows*this._cols;return Array.from({length:n},(a,s)=>e[s]||String(s+1))}sendCellConfig(e,n,a,s,t,r){this._panel.webview.postMessage({type:"cellConfig",id:e,bgColor:n,fgColor:a,fontFamily:s,themeName:t??"",themeColors:r??null})}clearCellOverrides(){this._panel.webview.postMessage({type:"clearCellOverrides"})}sendLabels(){let e=p.getCellLabels(this._tabId);this._panel.webview.postMessage({type:"setLabels",labels:e})}loadCustomFonts(e){for(let n of e){let a=this._readFontBase64(n.path);if(a){let s=$.extname(n.path).toLowerCase();this._panel.webview.postMessage({type:"loadFont",name:n.name,data:a,format:pe[s]||"truetype"})}}}getTabId(){return this._tabId}getCellIds(){return this._cellIds.slice()}reveal(){this._panel.reveal(this._panel.viewColumn??y.ViewColumn.One)}refreshTitle(){if(this._disposed)return;let e=w.entries(),n=e.findIndex(([t])=>t===this._tabId),a=n>=0?n:e.length,s=p.getTabName(this._tabId);this._panel.title=o._formatTitle(this._rows,this._cols,a,s)}_readFontBase64(e){try{return G.readFileSync(e).toString("base64")}catch{return null}}_spawnPty(e,n,a,s,t){let r=this._resolveShell(t);if(e){let b=e.spawn(r.path,r.args,{name:"xterm-256color",cols:n,rows:a,cwd:s,env:process.env});return{onData:m=>{b.onData(m)},write:m=>b.write(m),resize:(m,d)=>b.resize(m,d),kill:()=>b.kill()}}let{spawn:g}=require("child_process"),l=g(r.path,r.args,{cwd:s,env:process.env,windowsHide:!0});return{onData:b=>{l.stdout?.on("data",m=>b(m.toString())),l.stderr?.on("data",m=>b(m.toString()))},write:b=>{l.stdin?.write(b)},resize:()=>{},kill:()=>l.kill()}}_createTerminals(e,n){let a=y.workspace.workspaceFolders?.[0]?.uri.fsPath||process.env.USERPROFILE||process.env.HOME||".",s=this._rows*this._cols,t=o._getNodePty();t||y.window.showWarningMessage(y.l10n.t("node-pty not available. Falling back to basic shell (limited features)."));let r=p.getStartupCommands(this._tabId),g=[];for(let c of r)if(typeof c=="string")g.push(c);else if(c&&typeof c=="object"&&"command"in c){let h=c;for(let S=0;S<(h.count||1);S++)g.push(h.command)}let l=p.getDefaultCommand(this._tabId),b=p.getDefaultSteps(this._tabId),m=e||80,d=n||24,f=y.workspace.getConfiguration("terminalGrid").get("shellType",""),v=p.getCellOverrides(this._tabId);for(let c=0;c<s;c++){if(this._hiddenCells.has(c)){let D={onData(){},write(){},resize(){},kill(){}};this._terminals.push({id:c,pty:D}),this._outputBuffers[c]="",this._cellShellType[c]="",this._insideLlm[c]=!1,this._csiUMode[c]=!1;continue}let h=v[c]?.shellType||f||"",S=this._spawnPty(t,m,d,a,h||void 0),C=c,I=ce(v,g,b,l,c);this._cellShellType[C]=h,this._insideLlm[C]=!1,this._outputBuffers[C]="",this._csiUMode[C]=!1;let k=!1;S.onData(D=>{this._disposed||(o.CSI_U_ENABLE.test(D)&&(this._csiUMode[C]=!0),o.CSI_U_DISABLE.test(D)&&(this._csiUMode[C]=!1),this._outputBuffers[C]=(this._outputBuffers[C]||"")+D,this._outputBuffers[C].length>o.OUTPUT_BUFFER_SIZE&&(this._outputBuffers[C]=this._outputBuffers[C].slice(-o.OUTPUT_BUFFER_SIZE)),this._panel.webview.postMessage({type:"output",id:C,data:D}),!k&&I.length>0&&(k=!0,this._executeSteps(C,I,this._cellShellType[C]||"")))}),this._terminals.push({id:c,pty:S})}this.sendLabels()}_restartTerminal(e){let n=this._terminals[e];if(!n)return;try{n.pty.kill()}catch{}this._panel.webview.postMessage({type:"reset",id:e});let a=y.workspace.workspaceFolders?.[0]?.uri.fsPath||process.env.USERPROFILE||process.env.HOME||".",s=y.workspace.getConfiguration("terminalGrid").get("shellType",""),t=p.getCellOverrides(this._tabId),r=t[e]?.shellType||s||"",g=this._spawnPty(o._getNodePty(),80,24,a,r||void 0),l=p.getStartupCommands(this._tabId),b=[];for(let c of l)if(typeof c=="string")b.push(c);else if(c&&typeof c=="object"&&"command"in c){let h=c;for(let S=0;S<(h.count||1);S++)b.push(h.command)}let m=p.getDefaultCommand(this._tabId),d=p.getDefaultSteps(this._tabId),f=ce(t,b,d,m,e);this._cellShellType[e]=r,this._insideLlm[e]=!1;let v=!1;this._outputBuffers[e]="",this._csiUMode[e]=!1,g.onData(c=>{this._disposed||(o.CSI_U_ENABLE.test(c)&&(this._csiUMode[e]=!0),o.CSI_U_DISABLE.test(c)&&(this._csiUMode[e]=!1),this._outputBuffers[e]=(this._outputBuffers[e]||"")+c,this._outputBuffers[e].length>o.OUTPUT_BUFFER_SIZE&&(this._outputBuffers[e]=this._outputBuffers[e].slice(-o.OUTPUT_BUFFER_SIZE)),this._panel.webview.postMessage({type:"output",id:e,data:c}),!v&&f.length>0&&(v=!0,this._executeSteps(e,f,this._cellShellType[e]||"")))}),this._terminals[e]={id:e,pty:g}}static{this.CHUNK_SIZE=4096}static{this.CHUNK_DELAY=10}_chunkedWrite(e,n){if(n.length<=o.CHUNK_SIZE){e.write(n);return}let a=0,s=()=>{if(a>=n.length)return;let t=n.slice(a,a+o.CHUNK_SIZE);a+=o.CHUNK_SIZE,e.write(t),a<n.length&&setTimeout(s,o.CHUNK_DELAY)};s()}async _typeToCell(e,n){let a=this._terminals[e]?.pty;if(a)for(let s of n)a.write(s),await O(20)}static{this.LLM_TYPE_MAX_RETRIES=5}static{this.LLM_ECHO_WAIT=2e3}async _waitForLlmPrompt(e){let n=(this._outputBuffers[e]||"").length,a=Date.now()+ke;for(;Date.now()<a;){await O(Te);let s=this._outputBuffers[e]||"",t=o._stripAnsi(s.slice(n));if(Ie.some(r=>r.test(t)))return!0;if(this._disposed)return!1}return!1}async _typeWithRetry(e,n){let a=this._terminals[e]?.pty;if(!a)return!1;for(let s=0;s<o.LLM_TYPE_MAX_RETRIES;s++){let t=(this._outputBuffers[e]||"").length;await this._typeToCell(e,n);let r=Date.now()+o.LLM_ECHO_WAIT;for(;Date.now()<r;){await O(50);let g=this._outputBuffers[e]||"";if(o._stripAnsi(g.slice(t)).includes(n))return!0;if(this._disposed)return!1}for(let g=0;g<n.length;g++)a.write("\x7F");await O(300)}return!1}async _executeSteps(e,n,a){this._stepGeneration[e]||(this._stepGeneration[e]=0);let s=++this._stepGeneration[e],t=!1;for(let r=0;r<n.length;r++){if(this._disposed||this._stepGeneration[e]!==s)return;let g=n[r];if(g.type==="timeout")await O(g.ms);else if(g.type==="command"){if(r>0&&(t?await this._waitForLlmPrompt(e):n[r-1].type==="command"&&await O(_e)),this._disposed||this._stepGeneration[e]!==s)return;let l=t?de:this._enterSeq(e);t?(await this._typeWithRetry(e,g.input),this._terminals[e]?.pty.write(l)):this._terminals[e]?.pty.write(g.input+l),Q(g.input)&&(t=!0),g.input.trim()==="exit"&&(t=!1),this._insideLlm[e]=t}}}restartCell(e){this._restartTerminal(e)}restartAllCells(){for(let e of this._terminals)this._restartTerminal(e.id)}dispose(){if(this._disposed)return;this._disposed=!0,this._registryListener?.dispose(),w.unregister(this._tabId,this),this._configListener?.dispose();for(let n of this._terminals)try{n.pty.kill()}catch{}this._terminals=[];for(let n of this._pasteImages)try{G.unlinkSync(n)}catch{}this._pasteImages=[],this._panel.dispose(),w.size()===0?(this._context.globalState.update("lastGrid",void 0),this._context.globalState.update("lastTabs",void 0)):o._persistTabs(this._context);let e=w.getActive();e&&(e.reveal(),y.commands.executeCommand("terminalGrid._refreshSidebar"))}_buildCustomFontCss(){let e=this._context.globalState.get("customFonts",[]),n="";for(let a of e){let s=this._readFontBase64(a.path);if(!s)continue;let t=$.extname(a.path).toLowerCase(),r=pe[t]||"truetype";n+=`@font-face { font-family: '${a.name}'; src: url(data:font/${t.slice(1)};base64,${s}) format('${r}'); font-display: swap; }
`}return n}_getHtml(){let e=this._panel.webview,n=e.asWebviewUri(y.Uri.joinPath(this._context.extensionUri,"media","gridTerminal.js")),a=e.asWebviewUri(y.Uri.joinPath(this._context.extensionUri,"media","xterm.css")),s=Le(),t=this._buildCustomFontCss();return`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'none';
                 style-src ${e.cspSource} 'unsafe-inline';
                 script-src 'nonce-${s}';
                 font-src ${e.cspSource} data:;">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="${a}">
  <style>
    ${t}
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
  <script nonce="${s}">
    var __GRID_ROWS = ${this._rows};
    var __GRID_COLS = ${this._cols};
    var __GRID_ZOOM = ${y.workspace.getConfiguration("terminalGrid").get("zoomPercent",100)};
    var __GRID_FONT_FAMILY = ${JSON.stringify(y.workspace.getConfiguration("terminalGrid").get("fontFamily",""))};
    var __GRID_BG_COLOR = ${JSON.stringify(y.workspace.getConfiguration("terminalGrid").get("backgroundColor",""))};
    var __GRID_FG_COLOR = ${JSON.stringify(y.workspace.getConfiguration("terminalGrid").get("foregroundColor",""))};
    var __GRID_THEME = ${JSON.stringify(y.workspace.getConfiguration("terminalGrid").get("colorTheme",""))};
    var __GRID_THEME_COLORS = ${JSON.stringify(A(y.workspace.getConfiguration("terminalGrid").get("colorTheme","")))};
    var __GRID_MERGE_REGIONS = ${JSON.stringify(p.getMergedRegions(this._tabId).filter(r=>r.startRow+r.rowSpan<=this._rows&&r.startCol+r.colSpan<=this._cols))};
  </script>
  <script nonce="${s}" src="${n}"></script>
</body>
</html>`}};function Le(){let o="",e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";for(let n=0;n<32;n++)o+=e.charAt(Math.floor(Math.random()*e.length));return o}var De=[".ttf",".otf",".woff",".woff2"];function Me(){try{return require("node-pty"),!0}catch{return!1}}var z=class o{constructor(e){this._mcpPort=0;this._context=e,w.onDidChange(()=>this._scheduleConfigSend())}static{this.viewType="terminalGrid.sidebarView"}_scheduleConfigSend(){this._configSendTimer&&clearTimeout(this._configSendTimer),this._configSendTimer=setTimeout(()=>{this._configSendTimer=void 0,this.sendConfig()},50)}setMcpPort(e){this._mcpPort=e,this._view?.webview.postMessage({type:"mcpPort",port:e})}get _tid(){return w.getActiveTabId()??0}resolveWebviewView(e,n,a){this._view=e,e.webview.options={enableScripts:!0,localResourceRoots:[this._context.extensionUri]},e.webview.html=this._getHtml(),e.webview.onDidReceiveMessage(async s=>{switch(s.type){case"openGrid":await i.commands.executeCommand("terminalGrid.openCustomGrid",s.rows,s.cols),this.sendConfig();break;case"reload":await i.commands.executeCommand("workbench.action.reloadWindow");break;case"setConfig":{let t=i.workspace.getConfiguration("terminalGrid");s.key&&s.value!==void 0&&await t.update(s.key,s.value,i.ConfigurationTarget.Global),s.key==="shellType"&&x.currentPanel&&x.currentPanel.restartAllCells();break}case"getConfig":{this.sendConfig();break}case"browseFont":{let t=await i.window.showOpenDialog({canSelectMany:!1,filters:{"Font Files":["ttf","otf","woff","woff2"]},title:i.l10n.t("Select Font File")});if(!t||t.length===0)break;let r=t[0].fsPath,g=R.extname(r).toLowerCase();if(!De.includes(g)){i.window.showWarningMessage(i.l10n.t("Unsupported font format. Use .ttf, .otf, .woff, or .woff2"));break}try{_.accessSync(r,_.constants.R_OK)}catch{i.window.showErrorMessage(i.l10n.t("Cannot read font file."));break}let l=R.basename(r,g),b=this._context.globalState.get("customFonts",[]);b.some(m=>m.path===r)||(b.push({name:l,path:r}),await this._context.globalState.update("customFonts",b)),this.sendConfig(),x.currentPanel&&x.currentPanel.loadCustomFonts([{name:l,path:r}]);break}case"removeFont":{let r=this._context.globalState.get("customFonts",[]).filter(g=>g.name!==s.name);await this._context.globalState.update("customFonts",r),this.sendConfig();break}case"addStartupCommand":{let t=p.getStartupCommands(this._tid);t.push({command:s.command,count:1}),await p.setStartupCommands(this._tid,t),this.sendConfig();break}case"removeStartupCommand":{let t=p.getStartupCommands(this._tid);t.splice(s.index,1),await p.setStartupCommands(this._tid,t),this.sendConfig();break}case"updateCommandCount":{let t=p.getStartupCommands(this._tid);t[s.index]&&(t[s.index].count=Math.max(1,s.count),await p.setStartupCommands(this._tid,t)),this.sendConfig();break}case"addStep":{if(s.target==="all"){let t=p.getDefaultSteps(this._tid);t.push(s.step),await p.setDefaultSteps(this._tid,t);let r=t.find(g=>g.type==="command");await p.setDefaultCommand(this._tid,r?.input||"")}else{let t=p.getCellOverrides(this._tid),r=s.target;t[r]||(t[r]={}),Array.isArray(t[r].startupSteps)||(t[r].startupSteps=[]),t[r].startupSteps.push(s.step);let g=t[r].startupSteps.find(l=>l.type==="command");t[r].startupCommand=g?.input||"",await p.setCellOverrides(this._tid,t)}this.sendConfig();break}case"removeStep":{if(s.target==="all"){let t=p.getDefaultSteps(this._tid);t.splice(s.index,1),await p.setDefaultSteps(this._tid,t);let r=t.find(g=>g.type==="command");await p.setDefaultCommand(this._tid,r?.input||"")}else{let t=p.getCellOverrides(this._tid),r=s.target;if(Array.isArray(t[r]?.startupSteps)){t[r].startupSteps.splice(s.index,1);let g=t[r].startupSteps.find(l=>l.type==="command");t[r].startupCommand=g?.input||"",await p.setCellOverrides(this._tid,t)}}this.sendConfig();break}case"reorderSteps":{if(s.target==="all"){await p.setDefaultSteps(this._tid,s.steps);let t=s.steps.find(r=>r.type==="command");await p.setDefaultCommand(this._tid,t?.input||"")}else{let t=p.getCellOverrides(this._tid),r=s.target;t[r]||(t[r]={}),t[r].startupSteps=s.steps;let g=s.steps.find(l=>l.type==="command");t[r].startupCommand=g?.input||"",await p.setCellOverrides(this._tid,t)}this.sendConfig();break}case"updateStep":{if(s.target==="all"){let t=p.getDefaultSteps(this._tid);s.index>=0&&s.index<t.length&&(t[s.index]=s.step,await p.setDefaultSteps(this._tid,t))}else{let t=p.getCellOverrides(this._tid),r=s.target,g=t[r]?.startupSteps||[];s.index>=0&&s.index<g.length&&(g[s.index]=s.step,t[r]||(t[r]={}),t[r].startupSteps=g,await p.setCellOverrides(this._tid,t))}this.sendConfig();break}case"addProject":{let t=this._context.globalState.get("projects",[]);t.some(r=>r.path===s.path)||(t.push({name:s.name,path:s.path}),await this._context.globalState.update("projects",t)),this.sendConfig();break}case"removeProject":{let t=this._context.globalState.get("projects",[]);t.splice(s.index,1),await this._context.globalState.update("projects",t),this.sendConfig();break}case"openProject":{let t=i.Uri.file(s.path);await i.commands.executeCommand("vscode.openFolder",t,{forceNewWindow:!!s.newWindow});break}case"addCurrentProject":{let t=i.workspace.workspaceFolders?.[0];if(!t){i.window.showWarningMessage(i.l10n.t("No workspace folder open."));break}let r=this._context.globalState.get("projects",[]),g=t.uri.fsPath;r.some(l=>l.path===g)||(r.push({name:t.name,path:g}),await this._context.globalState.update("projects",r)),this.sendConfig();break}case"browseProject":{let t=await i.window.showOpenDialog({canSelectFiles:!1,canSelectFolders:!0,canSelectMany:!1,title:i.l10n.t("Select Project Folder")});if(!t||t.length===0)break;let r=t[0].fsPath,g=R.basename(r),l=this._context.globalState.get("projects",[]);l.some(b=>b.path===r)||(l.push({name:g,path:r}),await this._context.globalState.update("projects",l)),this.sendConfig();break}case"savePreset":{await this._savePreset(s.name),this.sendConfig();break}case"loadPreset":{let r=this._context.globalState.get("presets",[]).find(d=>d.name===s.name);if(!r)break;let g=w.getActiveTabId(),l=g??E.next(this._context),b=g!==void 0?w.entries().findIndex(([d])=>d===g):-1;w.getActive()?.dispose();let m=i.workspace.getConfiguration("terminalGrid");if(await m.update("defaultRows",r.rows,i.ConfigurationTarget.Global),await m.update("defaultCols",r.cols,i.ConfigurationTarget.Global),await m.update("zoomPercent",r.zoomPercent,i.ConfigurationTarget.Global),await m.update("fontFamily",r.fontFamily,i.ConfigurationTarget.Global),await m.update("backgroundColor",r.bgColor,i.ConfigurationTarget.Global),await m.update("foregroundColor",r.fgColor,i.ConfigurationTarget.Global),await m.update("colorTheme",r.colorTheme||"",i.ConfigurationTarget.Global),await m.update("shellType",r.shellType||"",i.ConfigurationTarget.Global),await p.setStartupCommands(l,r.startupCommands||[]),await p.setCellLabels(l,r.cellLabels||[]),await p.setDefaultCommand(l,r.defaultCommand||""),r.defaultSteps?await p.setDefaultSteps(l,r.defaultSteps):r.defaultCommand?await p.setDefaultSteps(l,[{type:"command",input:r.defaultCommand}]):await p.setDefaultSteps(l,[]),r.cellStepsOverrides){let d={};for(let[f,v]of Object.entries(r.cellStepsOverrides))d[Number(f)]={},Array.isArray(v.startupSteps)&&(d[Number(f)].startupSteps=v.startupSteps);await p.setCellOverrides(l,d)}else await p.setCellOverrides(l,{});await p.setMergedRegions(l,r.mergedRegions||[]),x.createOrShow(this._context,r.rows,r.cols,{forceNewTab:!0,tabIdOverride:l,positionOverride:b>=0?b:void 0}),this.sendConfig();break}case"deletePreset":{let r=this._context.globalState.get("presets",[]).filter(l=>l.name!==s.name);await this._context.globalState.update("presets",r);let g=this._context.globalState.get("projectPresets",{});for(let l of Object.keys(g))g[l]===s.name&&delete g[l];await this._context.globalState.update("projectPresets",g),this.sendConfig();break}case"linkPreset":{let t=this._context.globalState.get("projectPresets",{});s.presetName?t[s.projectPath]=s.presetName:delete t[s.projectPath],await this._context.globalState.update("projectPresets",t),this.sendConfig();break}case"broadcast":{x.currentPanel?x.currentPanel.broadcastInput(s.text):i.window.showWarningMessage(i.l10n.t("No terminal grid is open."));break}case"broadcastToCell":{if(x.currentPanel)for(let t of s.cellIds)x.currentPanel.sendInputToCell(t,s.text);else i.window.showWarningMessage(i.l10n.t("No terminal grid is open."));break}case"setCellConfig":{let t=p.getCellOverrides(this._tid);if(t[s.cellId]={bgColor:s.bgColor||"",fgColor:s.fgColor||"",fontFamily:s.fontFamily||"",themeName:s.themeName||"",shellType:t[s.cellId]?.shellType||""},await p.setCellOverrides(this._tid,t),x.currentPanel){let r=s.themeName?A(s.themeName):null;x.currentPanel.sendCellConfig(s.cellId,s.bgColor||"",s.fgColor||"",s.fontFamily||"",s.themeName||"",r)}break}case"setShellForCell":{let t=p.getCellOverrides(this._tid);t[s.cellId]||(t[s.cellId]={}),t[s.cellId].shellType=s.shellType||"",await p.setCellOverrides(this._tid,t),x.currentPanel&&x.currentPanel.restartCell(s.cellId);break}case"setDefaultCommand":{let t=s.command||"";await p.setDefaultCommand(this._tid,t),await p.setDefaultSteps(this._tid,t?[{type:"command",input:t}]:[]),this.sendConfig();break}case"setCellCommand":{let t=p.getCellOverrides(this._tid);t[s.cellId]||(t[s.cellId]={});let r=s.command||"";t[s.cellId].startupCommand=r,t[s.cellId].startupSteps=r?[{type:"command",input:r}]:[],await p.setCellOverrides(this._tid,t),this.sendConfig();break}case"clearAllCellOverrides":{await p.setCellOverrides(this._tid,{}),x.currentPanel&&x.currentPanel.clearCellOverrides();break}case"clearAllCellShells":{let t=p.getCellOverrides(this._tid);for(let r of Object.keys(t))t[parseInt(r)]&&(t[parseInt(r)].shellType="");await p.setCellOverrides(this._tid,t);break}case"saveMergeRegions":{let t=s.regions||[];await p.setMergedRegions(this._tid,t);let r=i.workspace.getConfiguration("terminalGrid").get("defaultCols",3),g=new Set;for(let l of t)for(let b=l.startRow;b<l.startRow+l.rowSpan;b++)for(let m=l.startCol;m<l.startCol+l.colSpan;m++)b===l.startRow&&m===l.startCol||g.add(b*r+m);if(g.size>0){let l=p.getCellOverrides(this._tid),b=p.getCellLabels(this._tid),m=!1;for(let d of g)l[String(d)]&&(delete l[String(d)],m=!0),b[d]&&(b[d]="",m=!0);m&&(await p.setCellOverrides(this._tid,l),await p.setCellLabels(this._tid,b))}this.sendConfig();break}case"saveSectionStates":{await this._context.globalState.update("sectionStates",s.states);break}case"registerMcpDesktop":{let t=await this._registerMcpInConfig("desktop");this._view?.webview.postMessage({type:"mcpRegisterResult",target:"desktop",...t});break}case"checkMcpRegistration":{let t=this._checkMcpRegistration();this._view?.webview.postMessage({type:"mcpRegistrationStatus",...t});break}case"unregisterMcpDesktop":{let t=await this._unregisterMcpInConfig("desktop");this._view?.webview.postMessage({type:"mcpUnregisterResult",target:"desktop",...t});break}case"switchTab":{let t=w.get(s.tabId);t&&t.reveal();break}case"newTab":{let t=w.getActive(),r=i.workspace.getConfiguration("terminalGrid"),g=t?.getRows()??r.get("defaultRows",2),l=t?.getCols()??r.get("defaultCols",3);x.createOrShow(this._context,g,l,{forceNewTab:!0});break}case"duplicateTab":{let t=w.getActive();if(!t)break;let r=t.getRows(),g=t.getCols(),l=t.getTabId(),b=E.next(this._context);await p.cloneTab(l,b),x.createOrShow(this._context,r,g,{forceNewTab:!0,tabIdOverride:b}),i.window.showInformationMessage(i.l10n.t("Tab duplicated. Terminal history is not copied; cells will start with the configured startup commands."));break}case"removeTab":{if(w.size()<=1)break;let t=w.get(s.tabId);if(!t)break;await p.deleteTab(s.tabId),t.dispose();break}case"renameTab":{if(typeof s.name!="string"||!w.get(s.tabId))break;await p.setTabName(s.tabId,s.name.trim());for(let[,r]of w.entries())r.refreshTitle();this.sendConfig();break}case"installNodePty":{try{await i.window.withProgress({location:i.ProgressLocation.Notification,title:i.l10n.t("Installing node-pty\u2026"),cancellable:!1},()=>new Promise((g,l)=>{ge.exec("npm install node-pty",{cwd:this._context.extensionPath},b=>{b?l(b):g()})})),this._view?.webview.postMessage({type:"ptyInstallResult",success:!0});let t=i.l10n.t("Reload Window");await i.window.showInformationMessage(i.l10n.t("node-pty installed successfully. Reload window to activate."),t)===t&&i.commands.executeCommand("workbench.action.reloadWindow")}catch(t){let r=t instanceof Error?t.message:String(t);i.window.showErrorMessage(i.l10n.t("node-pty install failed: {0}",r)),this._view?.webview.postMessage({type:"ptyInstallResult",success:!1})}break}}}),i.workspace.onDidChangeConfiguration(s=>{s.affectsConfiguration("terminalGrid")&&this.sendConfig()})}async _savePreset(e){let n=i.workspace.getConfiguration("terminalGrid"),a={name:e,rows:n.get("defaultRows",2),cols:n.get("defaultCols",3),startupCommands:p.getStartupCommands(this._tid),cellLabels:p.getCellLabels(this._tid),zoomPercent:n.get("zoomPercent",100),fontFamily:n.get("fontFamily",""),bgColor:n.get("backgroundColor",""),fgColor:n.get("foregroundColor",""),colorTheme:n.get("colorTheme",""),shellType:n.get("shellType",""),defaultCommand:p.getDefaultCommand(this._tid),defaultSteps:p.getDefaultSteps(this._tid),cellStepsOverrides:p.getCellOverrides(this._tid),mergedRegions:p.getMergedRegions(this._tid)},s=this._context.globalState.get("presets",[]),t=s.findIndex(r=>r.name===e);t>=0?s[t]=a:s.push(a),await this._context.globalState.update("presets",s)}async _migrateSteps(){let e=!1,n=p.getDefaultSteps(this._tid),a=p.getDefaultCommand(this._tid);a&&n.length===0?(await p.setDefaultSteps(this._tid,[{type:"command",input:a}]),await p.setDefaultCommand(this._tid,""),e=!0):a&&n.length>0&&(await p.setDefaultCommand(this._tid,""),e=!0);let s=p.getCellOverrides(this._tid);for(let r of Object.keys(s)){let g=s[Number(r)];if(!g)continue;let l=g.startupCommand,b=g.startupSteps;l&&(!b||b.length===0)?(g.startupSteps=[{type:"command",input:l}],delete g.startupCommand,e=!0):l&&b&&b.length>0&&(delete g.startupCommand,e=!0)}p.getStartupCommands(this._tid).length>0&&(await p.setStartupCommands(this._tid,[]),e=!0),e&&await p.setCellOverrides(this._tid,s)}_getClaudeDesktopConfigPath(){return o._claudeDesktopConfigPath()}static _claudeDesktopConfigPath(){let e=process.platform;return e==="win32"?R.join(process.env.APPDATA||R.join(Y.homedir(),"AppData","Roaming"),"Claude","claude_desktop_config.json"):e==="darwin"?R.join(Y.homedir(),"Library","Application Support","Claude","claude_desktop_config.json"):R.join(Y.homedir(),".config","Claude","claude_desktop_config.json")}static autoCleanupStaleRegistration(){let e=o._claudeDesktopConfigPath();if(_.existsSync(e))try{let n=_.readFileSync(e,"utf-8"),a=JSON.parse(n),s=a.mcpServers?.["terminal-grid"];if(!s)return;let t=s.args?.[0];t&&!_.existsSync(t)&&(delete a.mcpServers["terminal-grid"],_.writeFileSync(e,JSON.stringify(a,null,2),"utf-8"))}catch{}}_getMcpServerEntry(){let e=this._mcpPort||i.workspace.getConfiguration("terminalGrid").get("apiPort",7890);return{command:"node",args:[R.join(this._context.extensionPath,"mcp-server.js")],env:{TERMINAL_GRID_PORT:String(e)}}}_checkMcpRegistration(){let e=this._getClaudeDesktopConfigPath(),n=!1;try{if(_.existsSync(e)){let a=_.readFileSync(e,"utf-8");n=!!JSON.parse(a)?.mcpServers?.["terminal-grid"]}}catch{}return{desktop:n}}async _registerMcpInConfig(e){let n=this._getClaudeDesktopConfigPath(),a=this._getMcpServerEntry();try{let s=R.dirname(n);_.existsSync(s)||_.mkdirSync(s,{recursive:!0});let t={};if(_.existsSync(n)){let r=_.readFileSync(n,"utf-8");t=JSON.parse(r)}return t.mcpServers||(t.mcpServers={}),t.mcpServers["terminal-grid"]=a,_.writeFileSync(n,JSON.stringify(t,null,2),"utf-8"),i.window.showInformationMessage(i.l10n.t("Terminal Grid MCP server registered in Claude Desktop. Restart Claude Desktop to activate.")),{success:!0,message:"registered"}}catch(s){let t=s instanceof Error?s.message:String(s);return i.window.showErrorMessage(i.l10n.t("Failed to register MCP server: {0}",t)),{success:!1,message:t}}}async _unregisterMcpInConfig(e){let n=this._getClaudeDesktopConfigPath();try{if(!_.existsSync(n))return{success:!0,message:"not-registered"};let a=_.readFileSync(n,"utf-8"),s=JSON.parse(a),t=s.mcpServers;return t&&"terminal-grid"in t&&(delete t["terminal-grid"],_.writeFileSync(n,JSON.stringify(s,null,2),"utf-8")),i.window.showInformationMessage(i.l10n.t("Terminal Grid MCP server unregistered from Claude Desktop. Restart Claude Desktop to apply.")),{success:!0,message:"unregistered"}}catch(a){let s=a instanceof Error?a.message:String(a);return i.window.showErrorMessage(i.l10n.t("Failed to unregister MCP server: {0}",s)),{success:!1,message:s}}}sendConfig(){if(!this._view)return;this._migrateSteps();let e=i.workspace.getConfiguration("terminalGrid"),n=this._context.globalState.get("customFonts",[]),a=p.getStartupCommands(this._tid),s=this._context.globalState.get("projects",[]),t=this._context.globalState.get("presets",[]),r=this._context.globalState.get("projectPresets",{}),g=p.getCellLabels(this._tid),l=p.getCellOverrides(this._tid),b=p.getDefaultSteps(this._tid),m=this._context.globalState.get("sectionStates",{}),d=i.workspace.workspaceFolders?.[0]?.uri.fsPath||"",f=x.currentPanel,v=x.getAvailableShells();this._view.webview.postMessage({type:"configValues",zoom:e.get("zoomPercent",100),fontFamily:e.get("fontFamily",""),bgColor:e.get("backgroundColor",""),fgColor:e.get("foregroundColor",""),colorTheme:e.get("colorTheme",""),shellType:e.get("shellType",""),defaultCommand:p.getDefaultCommand(this._tid),themeNames:ie,availableShells:v.map(c=>({name:c.name,path:c.path})),customFonts:n.map(c=>c.name),startupCommands:a,projects:s,presets:t,projectPresets:r,cellLabels:g,cellOverrides:l,defaultSteps:b,sectionStates:m,workspacePath:d,gridRows:f?.getRows()??0,gridCols:f?.getCols()??0,tabs:w.entries().map(([c,h])=>({tabId:c,rows:h.getRows(),cols:h.getCols(),name:p.getTabName(c)})),activeTabId:w.getActiveTabId()??null,mergedRegions:p.getMergedRegions(this._tid),hiddenCells:(()=>{let c=p.getMergedRegions(this._tid),h=e.get("defaultCols",3),S=[];for(let C of c)for(let I=C.startRow;I<C.startRow+C.rowSpan;I++)for(let k=C.startCol;k<C.startCol+C.colSpan;k++)I===C.startRow&&k===C.startCol||S.push(I*h+k);return S})()})}_getHtml(){let e=Pe();return`<!DOCTYPE html>
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
    ${Me()?"":`
    <div class="pty-banner" id="ptyBanner">
      <span class="pty-banner-icon">\u26A0</span>
      <span class="pty-banner-text">${i.l10n.t("node-pty is required to use Terminal Grid.")}</span>
      <button class="pty-banner-btn" id="ptyInstallBtn">${i.l10n.t("Install")}</button>
    </div>
    `}
    <!-- Projects -->
    <div class="glass-card" data-section="projects">
      <div class="section-header collapsible">
        <div class="section-label">${i.l10n.t("Projects")}</div>
        <span class="tip-wrap">
          <span class="tip-icon">?</span>
          <div class="tip-bubble">
            ${i.l10n.t("Register projects and click to switch folders. Ctrl+Click to open in a new window. If a preset is linked, it will be auto-applied on switch.")}
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
            <span class="btn-icon" style="font-size: 12px;">+</span> ${i.l10n.t("Add Current Folder")}
          </button>
          <button class="glass-btn" id="browseProjectBtn" style="font-size: 11px; padding: 8px 10px;">
            <span class="btn-icon" style="font-size: 12px;">&#128193;</span> ${i.l10n.t("Browse Folder")}
          </button>
        </div>
      </div>
    </div>

    <!-- Tabs (multi-grid management) -->
    <div class="glass-card collapsed" data-section="tabs">
      <div class="section-header collapsible">
        <div class="section-label">${i.l10n.t("Tabs")}</div>
        <span class="tip-wrap">
          <span class="tip-icon">?</span>
          <div class="tip-bubble">
            ${i.l10n.t("Manage multiple grid tabs \u2014 each tab keeps its own labels, cell settings, merges, and startup steps. Click a tab to focus it, right-click or double-click to rename. + opens a new empty tab, \u29C9 duplicates the active tab, \xD7 closes a tab (last tab can't be closed).")}
          </div>
        </span>
        <span class="collapse-icon">\u25BE</span>
      </div>
      <div class="section-body">
        <div id="tabsList" class="tabs-list"></div>
        <div class="tabs-actions" style="display: flex; gap: 6px; margin-top: 8px;">
          <button class="glass-btn" id="newTabBtn" title="${i.l10n.t("New tab (same size as active)")}" style="font-size: 11px; padding: 8px 10px; flex: 1;">
            <span class="btn-icon">+</span> ${i.l10n.t("New Tab")}
          </button>
          <button class="glass-btn" id="duplicateTabBtn" title="${i.l10n.t("Duplicate active tab (copies labels, overrides, merges, startup)")}" style="font-size: 11px; padding: 8px 10px; flex: 1;">
            <span class="btn-icon">\u29C9</span> ${i.l10n.t("Duplicate")}
          </button>
        </div>
      </div>
    </div>

    <div class="glass-card" data-section="gridSize">
      <div class="section-header collapsible">
        <div class="section-label">${i.l10n.t("Select Grid Size")} <span id="gridSizeActiveLabel" class="section-active-tab"></span></div>
        <span class="tip-wrap">
          <span class="tip-icon">?</span>
          <div class="tip-bubble">
            ${i.l10n.t("Hover to select the desired rows\xD7cols size. Supports up to 4\xD75 (20 cells). Grid opens as an editor tab, each cell is an independent terminal. Drag cells below to merge them into one larger terminal.")}
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
            <button class="glass-btn" id="mergeBtn" disabled>${i.l10n.t("Merge")}</button>
            <button class="glass-btn" id="unmergeBtn" disabled>${i.l10n.t("Unmerge")}</button>
            <button class="glass-btn" id="mergeClearBtn">${i.l10n.t("Clear")}</button>
          </div>
        </div>
        <div class="merge-bottom">
          <div class="merge-legend">
            <div class="merge-legend-item"><div class="merge-legend-swatch sel"></div> ${i.l10n.t("Selection")}</div>
            <div class="merge-legend-item"><div class="merge-legend-swatch mrg"></div> ${i.l10n.t("Merged")}</div>
          </div>
        </div>
        <button class="glass-btn primary" id="openGridBtn">
          <span class="btn-icon">&#9654;</span> ${i.l10n.t("Open Grid")}
        </button>
      </div>
    </div>

    <div class="glass-card collapsed" data-section="mcpRegister">
      <div class="section-header collapsible">
        <div class="section-label">${i.l10n.t("MCP Registration")}</div>
        <span class="tip-wrap">
          <span class="tip-icon">?</span>
          <div class="tip-bubble">
            ${i.l10n.t("Register the Terminal Grid MCP server in Claude Desktop so it can control your terminal grid. This writes the server config to Claude Desktop's configuration file.")}
          </div>
        </span>
        <span class="collapse-icon">\u25BE</span>
      </div>
      <div class="section-body">
        <div id="mcpRegStatus" style="font-size: 11px; opacity: .6; margin-bottom: 10px;"></div>
        <button class="glass-btn" id="registerMcpDesktopBtn">
          <span class="btn-icon">&#9889;</span> ${i.l10n.t("Register in Claude Desktop")}
        </button>
      </div>
    </div>

    <div class="glass-card" data-section="settings">
      <div class="section-header collapsible">
        <div class="section-label">${i.l10n.t("Terminal Settings")}</div>
        <span class="tip-wrap">
          <span class="tip-icon">?</span>
          <div class="tip-bubble">
            ${i.l10n.t("Zoom: Global font size (50\u2013300%). Font/Color: Use tabs for global or per-cell settings. Changes in All tab apply to all cells. Set global first, then customize individual cells. Individual cells can be zoomed separately with Ctrl+Wheel.")}
          </div>
        </span>
        <span class="collapse-icon">\u25BE</span>
      </div>
      <div class="section-body">
        <div class="setting-row">
          <span class="setting-label">${i.l10n.t("Zoom")}</span>
          <div class="stepper">
            <button class="stepper-btn" id="zoomDown">\u2212</button>
            <span class="stepper-val" id="zoomVal">100%</span>
            <button class="stepper-btn" id="zoomUp">+</button>
          </div>
        </div>

        <div id="settingsTabs" class="settings-tabs hidden"></div>

        <div class="setting-row">
          <span class="setting-label">${i.l10n.t("Theme")}</span>
          <div class="font-picker" id="themePicker">
            <div class="font-display" id="themeDisplay">
              <span class="font-display-text" id="themeDisplayText">${i.l10n.t("IDE Default")}</span>
              <span class="font-display-arrow">\u25B2</span>
            </div>
            <div class="font-dropdown" id="themeDropdown"></div>
          </div>
        </div>

        <div class="setting-row">
          <span class="setting-label">${i.l10n.t("Font")}</span>
          <div class="font-picker" id="fontPicker">
            <div class="font-display" id="fontDisplay">
              <span class="font-display-text" id="fontDisplayText">${i.l10n.t("IDE Default")}</span>
              <span class="font-display-arrow">\u25B2</span>
            </div>
            <div class="font-dropdown" id="fontDropdown"></div>
          </div>
        </div>

        <div class="setting-row">
          <span class="setting-label">${i.l10n.t("Back Color")}</span>
          <div class="color-row">
            <div class="color-swatch" id="bgSwatch">
              <div class="color-swatch-fill" id="bgSwatchFill"></div>
              <input type="color" id="bgColorInput" value="#1e1e1e">
            </div>
            <span class="color-val" id="bgVal">${i.l10n.t("IDE Default")}</span>
            <button class="color-reset hidden" id="bgReset" title="${i.l10n.t("Reset to IDE Default")}">\xD7</button>
          </div>
        </div>

        <div class="setting-row">
          <span class="setting-label">${i.l10n.t("Font Color")}</span>
          <div class="color-row">
            <div class="color-swatch" id="fgSwatch">
              <div class="color-swatch-fill" id="fgSwatchFill"></div>
              <input type="color" id="fgColorInput" value="#cccccc">
            </div>
            <span class="color-val" id="fgVal">${i.l10n.t("IDE Default")}</span>
            <button class="color-reset hidden" id="fgReset" title="${i.l10n.t("Reset to IDE Default")}">\xD7</button>
          </div>
        </div>

      </div>
    </div>

    <!-- Startup Commands -->
    <div class="glass-card" data-section="startup">
      <div class="section-header collapsible">
        <div class="section-label">${i.l10n.t("Startup Commands")}</div>
        <span class="tip-wrap">
          <span class="tip-icon">?</span>
          <div class="tip-bubble">
            ${i.l10n.t("Set shell type and startup command per cell. Use All tab for global defaults, or individual tabs for per-cell overrides.")}
          </div>
        </span>
        <span class="collapse-icon">\u25BE</span>
      </div>
      <div class="section-body">
        <div id="cmdTabs" class="settings-tabs hidden"></div>
        <div class="setting-row">
          <span class="setting-label">${i.l10n.t("Shell")}</span>
          <div class="font-picker" id="shellPicker">
            <div class="font-display" id="shellDisplay">
              <span class="font-display-text" id="shellDisplayText">${i.l10n.t("IDE Default")}</span>
              <span class="font-display-arrow">\u25B2</span>
            </div>
            <div class="font-dropdown" id="shellDropdown"></div>
          </div>
        </div>
        <div class="setting-row">
          <span class="setting-label">${i.l10n.t("Command")}</span>
          <select class="glass-select" id="cmdPreset" style="flex:1;min-width:0;">
            <option value="">${i.l10n.t("Select command\u2026")}</option>
            <option value="claude">claude</option>
            <option value="claude --effort max">claude --effort max</option>
            <option value="codex">codex</option>
            <option value="claude --dangerously-skip-permissions">claude --skip-perms</option>
            <option value="claude --dangerously-skip-permissions --effort max">claude --skip-perms --effort max</option>
            <option value="codex -s danger-full-access -a never">codex -s danger-full-access -a never</option>
            <option value="npm run dev">npm run dev</option>
            <option value="npm start">npm start</option>
            <option value="npm test">npm test</option>
            <option value="python">python</option>
            <option value="node">node</option>
            <option value="docker compose up">docker compose up</option>
            <option value="ssh">ssh</option>
            <option value="htop">htop</option>
            <option value="/resume">/resume</option>
            <option value="/compact">/compact</option>
            <option value="yes">yes</option>
            <option value="exit">exit</option>
            <option value="__enter__">Enter (\u21B5)</option>
            <option value="__custom__">${i.l10n.t("Custom command\u2026")}</option>
            <option value="__timeout__">${i.l10n.t("Timeout (ms)\u2026")}</option>
          </select>
        </div>
        <div class="cmd-add-row" id="cmdCustomRow" style="display:none;">
          <input class="glass-input" id="cmdCustom" placeholder="${i.l10n.t("Custom command\u2026")}" style="flex:1;min-width:0;" />
          <button class="stepper-btn" id="cmdApplyBtn" title="${i.l10n.t("Apply")}">&#10003;</button>
        </div>
        <div class="cmd-add-row" id="cmdTimeoutRow" style="display:none;">
          <input class="glass-input" type="number" id="cmdTimeoutMs" placeholder="${i.l10n.t("Milliseconds (e.g. 1500)")}" min="100" step="100" style="flex:1;min-width:0;" />
          <button class="stepper-btn" id="cmdTimeoutApplyBtn" title="${i.l10n.t("Apply")}">&#10003;</button>
        </div>
        <div class="cmd-summary-divider"></div>
        <div id="cmdSummaryList" class="cmd-summary-list"></div>
      </div>
    </div>

    <!-- Presets -->
    <div class="glass-card" data-section="presets">
      <div class="section-header collapsible">
        <div class="section-label">${i.l10n.t("Presets")}</div>
        <span class="tip-wrap">
          <span class="tip-icon">?</span>
          <div class="tip-bubble">
            ${i.l10n.t("Save and load current grid settings (size, zoom, font, color, commands, cell labels) as presets. Use Link to project for per-project auto-apply.")}
          </div>
        </span>
        <span class="collapse-icon">\u25BE</span>
      </div>
      <div class="section-body">
        <div class="cmd-add-row">
          <input class="glass-input" id="presetNameInput" placeholder="${i.l10n.t("Preset name\u2026")}" style="flex: 1;" />
        </div>
        <div class="cmd-add-row" style="margin-top: 4px;">
          <select class="glass-select" id="presetSelect" style="flex: 1;">
            <option value="">${i.l10n.t("Select preset\u2026")}</option>
          </select>
        </div>
        <div class="btn-group" style="gap: 6px; margin-top: 8px;">
          <div style="display: flex; gap: 6px;">
            <button class="glass-btn" id="presetSaveBtn" style="font-size: 11px; padding: 8px 10px; flex: 1;">${i.l10n.t("Save")}</button>
            <button class="glass-btn primary" id="presetLoadBtn" style="font-size: 11px; padding: 8px 10px; flex: 1;">${i.l10n.t("Load")}</button>
            <button class="glass-btn" id="presetDeleteBtn" style="font-size: 11px; padding: 8px 10px; flex: 1;">${i.l10n.t("Delete")}</button>
          </div>
          <div id="presetLinkRow" style="display: flex; align-items: center; gap: 6px; font-size: 11px; opacity: .7; margin-top: 4px;">
            <input type="checkbox" id="presetLinkCheck" style="margin: 0;" />
            <label id="presetLinkLabel" for="presetLinkCheck" style="cursor: pointer;">${i.l10n.t("Link to current project")}</label>
          </div>
        </div>
      </div>
    </div>

    <!-- Broadcast Input -->
    <div class="glass-card" data-section="broadcast">
      <div class="section-header collapsible">
        <div class="section-label">${i.l10n.t("Broadcast Input")}</div>
        <span class="tip-wrap">
          <span class="tip-icon">?</span>
          <div class="tip-bubble">
            ${i.l10n.t("Send text to selected terminals. Check All to send to all cells, uncheck for individual selection.")}
          </div>
        </span>
        <span class="collapse-icon">\u25BE</span>
      </div>
      <div class="section-body">
        <div id="broadcastTargets" class="broadcast-targets hidden"></div>
        <div class="cmd-add-row" style="flex-direction: column; gap: 4px;">
          <textarea class="glass-input" id="broadcastInput" placeholder="${i.l10n.t("Type command\u2026")}" rows="3" style="width: 100%; resize: vertical; font-family: var(--vscode-editor-fontFamily, monospace); font-size: 12px; line-height: 1.4;"></textarea>
          <div style="display: flex; justify-content: flex-end;">
            <button class="stepper-btn" id="broadcastSendBtn" title="${i.l10n.t("Send")}" style="width: 50px;">${i.l10n.t("Send")}</button>
          </div>
        </div>
      </div>
    </div>

    <div class="glass-card" data-section="actions">
      <div class="section-header collapsible">
        <div class="section-label">${i.l10n.t("Actions")}</div>
        <span class="collapse-icon">\u25BE</span>
      </div>
      <div class="section-body">
        <div class="btn-group">
          <button class="glass-btn" id="reloadBtn">
            <span class="btn-icon">&#8635;</span> ${i.l10n.t("Reload Window")}
          </button>
        </div>
      </div>
    </div>

    <div class="hint">
      ${i.l10n.t(`Grid opens as an editor tab.
Ctrl+Wheel to zoom individual cells.`).replace(`
`,"<br>")}
    </div>
  </div>

  <script nonce="${e}">
    var __i18n = ${JSON.stringify({installing:i.l10n.t("Installing\u2026"),ideDefault:i.l10n.t("IDE Default"),remove:i.l10n.t("Remove"),addFontFile:i.l10n.t("Add font file\u2026"),all:i.l10n.t("All"),noStartupCommands:i.l10n.t("No startup commands configured"),noProjects:i.l10n.t("No projects registered"),linkedPrefix:i.l10n.t("Linked: {0}"),linkToProject:i.l10n.t("Link to current project"),selectPreset:i.l10n.t("Select preset\u2026"),reload:i.l10n.t("Reload"),retry:i.l10n.t("Retry"),ptyInstalled:i.l10n.t("node-pty installed successfully!"),ptyInstalledHint:i.l10n.t("Reload the window to activate."),theme:i.l10n.t("Theme"),shellAuto:i.l10n.t("IDE Default"),shell:i.l10n.t("Shell"),mcpAlreadyRegistered:i.l10n.t("Registered in Claude Desktop"),mcpRegister:i.l10n.t("Register in Claude Desktop"),mcpUnregister:i.l10n.t("Unregister"),mcpRegisteredStatus:i.l10n.t("\u2705 Registered in Claude Desktop")})};
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
      vscode.postMessage({ type: 'saveMergeRegions', regions: mergedRegions });
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
      vscode.postMessage({ type: 'saveMergeRegions', regions: mergedRegions });
    });

    mergeClearBtn.addEventListener('click', function() {
      mergedRegions = [];
      mergeSelStart = null;
      mergeSelEnd = null;
      renderMergeGrid();
      vscode.postMessage({ type: 'saveMergeRegions', regions: mergedRegions });
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
          vscode.postMessage({ type: 'saveMergeRegions', regions: mergedRegions });
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
</html>`}};function Pe(){let o="",e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";for(let n=0;n<32;n++)o+=e.charAt(Math.floor(Math.random()*e.length));return o}var ue=T(require("http"));var K=class{constructor(e){this._server=null;this._port=e}start(e=10){return new Promise((n,a)=>{this._server=this._createServer();let s=t=>{this._server.removeAllListeners("error"),this._server.on("error",r=>{r.code==="EADDRINUSE"&&t<e?(this._port++,s(t+1)):a(r)}),this._server.listen(this._port,"127.0.0.1",()=>{let r=this._server.address();this._port=r.port,n(this._port)})};s(0)})}_createServer(){return ue.createServer((e,n)=>{if(n.setHeader("Content-Type","application/json"),e.method==="OPTIONS"){n.writeHead(204),n.end();return}let a=new URL(e.url||"/",`http://127.0.0.1:${this._port}`);e.method==="GET"&&a.pathname==="/api/health"?(n.writeHead(200),n.end(JSON.stringify({status:"ok"}))):e.method==="GET"&&a.pathname==="/api/info"?this._handleInfo(n):e.method==="POST"&&a.pathname==="/api/send"?this._readBody(e).then(s=>this._handleSend(s,n)):e.method==="POST"&&a.pathname==="/api/read"?this._readBody(e).then(s=>this._handleRead(s,n)):e.method==="POST"&&a.pathname==="/api/broadcast"?this._readBody(e).then(s=>this._handleBroadcast(s,n)):(n.writeHead(404),n.end(JSON.stringify({error:"Not found"})))})}stop(){this._server?.close(),this._server=null}getPort(){return this._port}_handleInfo(e){let n=w.getActive(),a=w.entries().map(([s,t])=>({tabId:s,rows:t.getRows(),cols:t.getCols(),cellIds:t.getCellIds(),labels:t.getCellLabels()}));e.writeHead(200),e.end(JSON.stringify({grid:n?{rows:n.getRows(),cols:n.getCols(),cellCount:n.getCellCount(),cellLabels:n.getCellLabels()}:null,tabs:a,activeTabId:w.getActiveTabId()??null}))}_handleSend(e,n){let a=typeof e.cellId=="number"?e.cellId:-1,s=typeof e.text=="string"?e.text:"",t=e.submit===!0,r=L.resolve(a);if(!r){n.writeHead(200),n.end(JSON.stringify({success:!1,error:"Invalid cell id"}));return}let g=w.get(r.tabId);if(!g){n.writeHead(200),n.end(JSON.stringify({success:!1,error:"Tab no longer open"}));return}let l=t?g.sendInputToCell(r.localCellId,s):g.sendToCell(r.localCellId,s);n.writeHead(200),n.end(JSON.stringify({success:l}))}_handleRead(e,n){let a=typeof e.cellId=="number"?e.cellId:-1,s=typeof e.lines=="number"?e.lines:void 0,t=L.resolve(a);if(!t){n.writeHead(200),n.end(JSON.stringify({output:null,error:"Invalid cell id"}));return}let r=w.get(t.tabId);if(!r){n.writeHead(200),n.end(JSON.stringify({output:null,error:"Tab no longer open"}));return}let g=r.readCell(t.localCellId,s);n.writeHead(200),n.end(JSON.stringify({output:g}))}_handleBroadcast(e,n){let a=w.getActive();if(!a){n.writeHead(200),n.end(JSON.stringify({success:!1,error:"No grid open"}));return}let s=typeof e.text=="string"?e.text:"",t=e.submit===!0,r=a.getCellCount();if(t)a.broadcastInput(s);else for(let g=0;g<r;g++)a.sendToCell(g,s);n.writeHead(200),n.end(JSON.stringify({success:!0,cellCount:r}))}_readBody(e){return new Promise(n=>{let a="";e.on("data",s=>{a+=s}),e.on("end",()=>{try{n(JSON.parse(a))}catch{n({})}})})}};var H,j;async function Oe(o){if(p.init(o),await p.migrateOnce(),z.autoCleanupStaleRegistration(),o.globalState.get("lastTabs",[]).length===0){let d=o.globalState.get("lastGrid");if(d&&d.rows>0&&d.cols>0){let f=d.rows*d.cols,v=[];for(let S=0;S<f;S++)v.push(S);await o.globalState.update("lastTabs",[{tabId:0,rows:d.rows,cols:d.cols,cellIds:v}]),o.globalState.get("nextTabId",0)<1&&await o.globalState.update("nextTabId",1),o.globalState.get("nextGlobalCellId",0)<f&&await o.globalState.update("nextGlobalCellId",f)}}try{let d=U.join(me.homedir(),".terminal-grid"),f=U.join(d,"reload-signal");P.mkdirSync(d,{recursive:!0});let v=P.existsSync(f)?P.statSync(f).mtimeMs:0,c=P.watch(d,(h,S)=>{if(S==="reload-signal")try{let C=P.statSync(f).mtimeMs;C>v&&(v=C,u.commands.executeCommand("workbench.action.reloadWindow"))}catch{}});o.subscriptions.push({dispose:()=>c.close()})}catch{}let n=u.workspace.workspaceFolders?.[0]?.uri.fsPath;if(n){let f=o.globalState.get("projectPresets",{})[n];if(f){let c=o.globalState.get("presets",[]).find(h=>h.name===f);if(c){let h=u.workspace.getConfiguration("terminalGrid");if(await h.update("defaultRows",c.rows,u.ConfigurationTarget.Global),await h.update("defaultCols",c.cols,u.ConfigurationTarget.Global),await h.update("zoomPercent",c.zoomPercent,u.ConfigurationTarget.Global),await h.update("fontFamily",c.fontFamily,u.ConfigurationTarget.Global),await h.update("backgroundColor",c.bgColor,u.ConfigurationTarget.Global),await h.update("foregroundColor",c.fgColor,u.ConfigurationTarget.Global),await h.update("colorTheme",c.colorTheme||"",u.ConfigurationTarget.Global),await h.update("shellType",c.shellType||"",u.ConfigurationTarget.Global),o.globalState.get("lastTabs",[]).length===0){let C=E.next(o);if(await p.setStartupCommands(C,c.startupCommands||[]),await p.setCellLabels(C,c.cellLabels||[]),await p.setDefaultCommand(C,c.defaultCommand||""),c.defaultSteps?await p.setDefaultSteps(C,c.defaultSteps):c.defaultCommand?await p.setDefaultSteps(C,[{type:"command",input:c.defaultCommand}]):await p.setDefaultSteps(C,[]),c.cellStepsOverrides){let I={};for(let[k,D]of Object.entries(c.cellStepsOverrides))I[Number(k)]={},Array.isArray(D.startupSteps)&&(I[Number(k)].startupSteps=D.startupSteps);await p.setCellOverrides(C,I)}await p.setMergedRegions(C,c.mergedRegions||[]),await o.globalState.update("pendingFirstTabId",C)}}}}let a=new z(o),s=u.workspace.getConfiguration("terminalGrid").get("apiPort",7890);s>0&&(H=new K(s),H.start().then(d=>{j=u.window.createStatusBarItem(u.StatusBarAlignment.Right,50),j.text=`$(broadcast) TG :${d}`,j.tooltip=u.l10n.t("Terminal Grid API active on port {0}",d),j.command="terminalGrid.copyMcpConfig",j.show(),o.subscriptions.push(j),a.setMcpPort(d)}).catch(d=>{u.window.showWarningMessage(u.l10n.t("Terminal Grid API bridge failed to start: {0}",d.message))}));let t=u.lm;if(typeof t?.registerMcpServerDefinitionProvider=="function"){let d=new u.EventEmitter,f=s,v=t.registerMcpServerDefinitionProvider;o.subscriptions.push(v("terminalGrid",{onDidChangeMcpServerDefinitions:d.event,provideMcpServerDefinitions:async()=>{if(f<=0)return[];let c=u.McpStdioServerDefinition;return c?[new c("Terminal Grid","node",[U.join(o.extensionPath,"mcp-server.js")],{TERMINAL_GRID_PORT:String(f)},o.extension.packageJSON.version)]:[]}}),d),o.subscriptions.push(u.workspace.onDidChangeConfiguration(c=>{c.affectsConfiguration("terminalGrid.apiPort")&&(f=u.workspace.getConfiguration("terminalGrid").get("apiPort",7890),d.fire())}))}o.subscriptions.push(u.window.registerWebviewViewProvider(z.viewType,a)),o.subscriptions.push(u.commands.registerCommand("terminalGrid._refreshSidebar",()=>{a.sendConfig()}));let r=o.globalState.get("lastTabs",[]),g=0,l=!1,b=!1,m=async()=>{if(l)return;l=!0,w.size()>0&&x.persistTabs(o);let d=new Set(w.entries().map(([v])=>v)),f=r.filter(v=>!d.has(v.tabId));if(f.length>0){let v=[];for(let c of u.window.tabGroups.all)for(let h of c.tabs)if(h.input instanceof u.TabInputWebview){let S=h.input.viewType||"";(S==="terminalGrid"||S.endsWith("-terminalGrid"))&&!h.isActive&&v.push(h)}if(v.length>0)try{await u.window.tabGroups.close(v)}catch{}for(let c of f)x.createOrShow(o,c.rows,c.cols,{forceNewTab:!0,tabIdOverride:c.tabId,cellIdsOverride:c.cellIds})}else w.size()===0&&o.globalState.get("lastTabs",[]).length>0&&(o.globalState.update("lastTabs",void 0),o.globalState.update("lastGrid",void 0))};o.subscriptions.push(u.window.registerWebviewPanelSerializer("terminalGrid",{async deserializeWebviewPanel(d,f){if(g<r.length){let v=r[g++];x.revive(d,o,v.rows,v.cols,v.tabId,v.cellIds)}else d.dispose();b||(b=!0,setTimeout(()=>{m()},100))}})),setTimeout(()=>{m()},1500),o.subscriptions.push(u.commands.registerCommand("terminalGrid.openGrid",()=>{let d=u.workspace.getConfiguration("terminalGrid"),f=d.get("defaultRows",2),v=d.get("defaultCols",3);x.createOrShow(o,f,v)}),u.commands.registerCommand("terminalGrid.openCustomGrid",(d,f)=>{x.createOrShow(o,d,f)}),u.commands.registerCommand("terminalGrid.open2x2",()=>x.createOrShow(o,2,2)),u.commands.registerCommand("terminalGrid.open2x3",()=>x.createOrShow(o,2,3)),u.commands.registerCommand("terminalGrid.open3x3",()=>x.createOrShow(o,3,3)),u.commands.registerCommand("terminalGrid.newTab",()=>{let d=w.getActive(),f=u.workspace.getConfiguration("terminalGrid"),v=d?.getRows()??f.get("defaultRows",2),c=d?.getCols()??f.get("defaultCols",3);x.createOrShow(o,v,c,{forceNewTab:!0})}),u.commands.registerCommand("terminalGrid.duplicateTab",async()=>{let d=w.getActive();if(!d){u.window.showWarningMessage(u.l10n.t("No active tab to duplicate."));return}let f=d.getRows(),v=d.getCols(),c=d.getTabId(),h=E.next(o);await p.cloneTab(c,h),x.createOrShow(o,f,v,{forceNewTab:!0,tabIdOverride:h}),u.window.showInformationMessage(u.l10n.t("Tab duplicated. Terminal history is not copied; cells will start with the configured startup commands."))}),u.commands.registerCommand("terminalGrid.closeTab",()=>{if(w.size()<=1){u.window.showWarningMessage(u.l10n.t("Cannot close the last remaining tab."));return}let d=w.getActive();d&&d.dispose()}),u.commands.registerCommand("terminalGrid.resetCellIds",async()=>{if(w.size()>0){u.window.showWarningMessage(u.l10n.t("Close all Terminal Grid tabs before resetting cell IDs."));return}await L.reset(o),await E.reset(o),u.window.showInformationMessage(u.l10n.t("Cell IDs and tab counter reset."))}),u.commands.registerCommand("terminalGrid.resetAllTabs",async()=>{await u.window.showWarningMessage(u.l10n.t("Close all Terminal Grid tabs and wipe persisted tab state? This cannot be undone."),{modal:!0},u.l10n.t("Reset"))===u.l10n.t("Reset")&&(w.disposeAll(),await L.reset(o),await E.reset(o),await o.globalState.update("lastTabs",void 0),await o.globalState.update("lastGrid",void 0),await o.globalState.update("pendingFirstTabId",void 0),u.window.showInformationMessage(u.l10n.t("All Terminal Grid tabs and persisted state reset.")))}),u.commands.registerCommand("terminalGrid.sendToCell",(d,f)=>{let v=L.resolve(d);return v?w.get(v.tabId)?.sendToCell(v.localCellId,f)??!1:!1}),u.commands.registerCommand("terminalGrid.readCell",(d,f)=>{let v=L.resolve(d);return v?w.get(v.tabId)?.readCell(v.localCellId,f)??null:null}),u.commands.registerCommand("terminalGrid.getGridInfo",()=>{let d=w.getActive();if(!d)return null;let f=w.entries().map(([v,c])=>({tabId:v,rows:c.getRows(),cols:c.getCols(),cellIds:c.getCellIds(),labels:c.getCellLabels()}));return{rows:d.getRows(),cols:d.getCols(),cellCount:d.getCellCount(),cellLabels:d.getCellLabels(),tabs:f,activeTabId:w.getActiveTabId()??null}}),u.commands.registerCommand("terminalGrid.testAPI",async()=>{let d=u.window.createOutputChannel("Terminal Grid Tests");d.show(),d.appendLine(`=== Terminal Grid API Tests ===
`);let f=0,v=0;function c(M,B,N){let F=B?"PASS":"FAIL";B?f++:v++,d.appendLine(`[${F}] ${M}${N?" \u2014 "+N:""}`)}let h=await u.commands.executeCommand("terminalGrid.getGridInfo");if(!h){d.appendLine("[FAIL] getGridInfo returned null. Open a grid first.");return}c("getGridInfo returns object",!!h,JSON.stringify(h)),c("rows is number",typeof h.rows=="number",`rows=${h.rows}`),c("cols is number",typeof h.cols=="number",`cols=${h.cols}`),c("cellCount = rows*cols",h.cellCount===h.rows*h.cols,`${h.cellCount}`),c("cellLabels is array",Array.isArray(h.cellLabels),`length=${h.cellLabels.length}`),c("cellLabels.length = cellCount",h.cellLabels.length===h.cellCount);let S=await u.commands.executeCommand("terminalGrid.sendToCell",0,"echo __API_TEST__\r");c("sendToCell(0) returns true",S===!0);let C=await u.commands.executeCommand("terminalGrid.sendToCell",999,"x\r");c("sendToCell(999) returns false",C===!1,`got ${C}`);let I=await u.commands.executeCommand("terminalGrid.sendToCell",0,"TYPED_ONLY");c("sendToCell without \\r returns true",I===!0),await new Promise(M=>setTimeout(M,2e3)),await u.commands.executeCommand("terminalGrid.sendToCell",0,"");let k=await u.commands.executeCommand("terminalGrid.readCell",0);c("readCell(0) returns string",typeof k=="string",`length=${k?.length??0}`),c("readCell(0) contains test marker",!!k&&k.includes("__API_TEST__"));let D=await u.commands.executeCommand("terminalGrid.readCell",0,3);c("readCell(0, 3) returns string",typeof D=="string");let ee=await u.commands.executeCommand("terminalGrid.readCell",0,0);c("readCell(0, 0) returns empty",ee==="",`got "${ee}"`);let te=await u.commands.executeCommand("terminalGrid.readCell",999);if(c("readCell(999) returns null",te===null,`got ${te}`),h.cellCount>1){let M=await u.commands.executeCommand("terminalGrid.sendToCell",1,"echo CELL1_OK\r");c("sendToCell(1) returns true",M===!0),await new Promise(N=>setTimeout(N,1500));let B=await u.commands.executeCommand("terminalGrid.readCell",1);c("readCell(1) contains CELL1_OK",!!B&&B.includes("CELL1_OK"))}if(h.tabs&&h.tabs.length>1){d.appendLine(`
--- Multi-tab tests ---`);let M=h.tabs.flatMap(V=>V.cellIds),B=new Set(M);c("global cell ids unique across all tabs",B.size===M.length,`${M.length} ids`),c("activeTabId is a number",typeof h.activeTabId=="number");let N=h.tabs[1],F=N.cellIds[0],be=await u.commands.executeCommand("terminalGrid.sendToCell",F,"echo __MULTITAB_OK__\r");c(`sendToCell global=${F} (tab ${N.tabId+1} cell 1) returns true`,be===!0),await new Promise(V=>setTimeout(V,1500));let se=await u.commands.executeCommand("terminalGrid.readCell",F);c(`readCell global=${F} contains __MULTITAB_OK__`,!!se&&se.includes("__MULTITAB_OK__"));let ne=Math.max(...M)+1e4,fe=await u.commands.executeCommand("terminalGrid.sendToCell",ne,"x");c(`sendToCell with bogus global id=${ne} returns false`,fe===!1)}else h.tabs&&d.appendLine(`
(Multi-tab tests skipped: only ${h.tabs.length} tab open. Open a second tab via the sidebar to enable.)`);d.appendLine(`
=== ${f} passed, ${v} failed ===`),v===0?u.window.showInformationMessage(u.l10n.t("Terminal Grid API: All {0} tests passed!",f)):u.window.showWarningMessage(u.l10n.t("Terminal Grid API: {0} test(s) failed. See output.",v))}),u.commands.registerCommand("terminalGrid.copyMcpConfig",()=>{let d=H?.getPort()??7890,v={mcpServers:{"terminal-grid":{command:"node",args:[U.join(o.extensionPath,"mcp-server.js")],env:{TERMINAL_GRID_PORT:String(d)}}}};u.env.clipboard.writeText(JSON.stringify(v,null,2)),u.window.showInformationMessage(u.l10n.t("Terminal Grid MCP config copied to clipboard (port {0})",d))}))}function Be(){H?.stop(),H=void 0,w.disposeAll()}0&&(module.exports={activate,deactivate});

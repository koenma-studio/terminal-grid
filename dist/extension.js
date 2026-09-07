"use strict";var gt=Object.create;var de=Object.defineProperty;var ft=Object.getOwnPropertyDescriptor;var ht=Object.getOwnPropertyNames;var bt=Object.getPrototypeOf,vt=Object.prototype.hasOwnProperty;var wt=(n,e)=>{for(var t in e)de(n,t,{get:e[t],enumerable:!0})},Fe=(n,e,t,r)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of ht(e))!vt.call(n,s)&&s!==t&&de(n,s,{get:()=>e[s],enumerable:!(r=ft(e,s))||r.enumerable});return n};var R=(n,e,t)=>(t=n!=null?gt(bt(n)):{},Fe(e||!n||!n.__esModule?de(t,"default",{value:n,enumerable:!0}):t,n)),yt=n=>Fe(de({},"__esModule",{value:!0}),n);var Ht={};wt(Ht,{activate:()=>Ut,deactivate:()=>qt});module.exports=yt(Ht);var b=R(require("vscode")),le=R(require("fs")),ae=R(require("path")),Me=R(require("os")),pt=R(require("http")),Ae=require("crypto");var D=R(require("fs")),ce=R(require("path")),pe=class{constructor(e,t,r){this._runtime=t;this._reload=r;this._reloading=!1;this.windowId=`${process.pid}-${Date.now()}`;this._port=0;this._check=()=>{let e=this._readSignal();!e||e===this._lastSignal||this._reloading||(this._lastSignal=e,this._reloading=!0,Promise.resolve().then(()=>this._reload()).catch(t=>{this._reloading=!1,console.warn("Terminal Grid: window reload failed:",t)}))};this._signalPath=ce.join(e,"reload-signal");let s=ce.join(e,"sessions");D.mkdirSync(s,{recursive:!0}),this._sessionPath=ce.join(s,`${process.pid}.json`),this._lastSignal=this._readSignal(),this._writeSession(),D.watchFile(this._signalPath,{interval:250,persistent:!1},this._check)}setPort(e){this._port=e,this._writeSession()}_writeSession(){let e=`${this._sessionPath}.tmp`;try{D.writeFileSync(e,JSON.stringify({...this._runtime,pid:process.pid,windowId:this.windowId,port:this._port,activatedAt:Number(this.windowId.split("-")[1]),signal:this._lastSignal})),D.renameSync(e,this._sessionPath)}finally{D.existsSync(e)&&D.unlinkSync(e)}}_readSignal(){try{return D.readFileSync(this._signalPath,"utf8").trim()}catch{return""}}dispose(){D.unwatchFile(this._signalPath,this._check);try{D.unlinkSync(this._sessionPath)}catch{}}};var d=R(require("vscode")),L=R(require("fs")),P=R(require("path")),X=R(require("os")),dt=R(require("child_process"));var E=R(require("fs")),Ue=R(require("path")),qe=require("util");var Ct=/^(\d{4}-\d{2}-\d{2})?[T ]?(?:(\d{2}):\d{2}(?::\d{2}(?:\.\d+)?)?)?(Z|[-+]\d{2}:\d{2})?$/i,te=class n extends Date{#t=!1;#s=!1;#e=null;constructor(e){let t=!0,r=!0,s="Z";if(typeof e=="string"){let i=e.match(Ct);i?(i[1]||(t=!1,e=`0000-01-01T${e}`),r=!!i[2],r&&e[10]===" "&&(e=e.replace(" ","T")),i[2]&&+i[2]>23?e="":(s=i[3]||null,e=e.toUpperCase(),!s&&r&&(e+="Z"))):e=""}super(e),isNaN(this.getTime())||(this.#t=t,this.#s=r,this.#e=s)}isDateTime(){return this.#t&&this.#s}isLocal(){return!this.#t||!this.#s||!this.#e}isDate(){return this.#t&&!this.#s}isTime(){return this.#s&&!this.#t}isValid(){return this.#t||this.#s}toISOString(){let e=super.toISOString();if(this.isDate())return e.slice(0,10);if(this.isTime())return e.slice(11,23);if(this.#e===null)return e.slice(0,-1);if(this.#e==="Z")return e;let t=+this.#e.slice(1,3)*60+ +this.#e.slice(4,6);return t=this.#e[0]==="-"?t:-t,new Date(this.getTime()-t*6e4).toISOString().slice(0,-1)+this.#e}static wrapAsOffsetDateTime(e,t="Z"){let r=new n(e);return r.#e=t,r}static wrapAsLocalDateTime(e){let t=new n(e);return t.#e=null,t}static wrapAsLocalDate(e){let t=new n(e);return t.#s=!1,t.#e=null,t}static wrapAsLocalTime(e){let t=new n(e);return t.#t=!1,t.#e=null,t}};function xt(n,e){let t=n.slice(0,e).split(/\r\n|\n|\r/g);return[t.length,t.pop().length+1]}function _t(n,e,t){let r=n.split(/\r\n|\n|\r/g),s="",i=(Math.log10(e+1)|0)+1;for(let a=e-1;a<=e+1;a++){let l=r[a-1];l&&(s+=a.toString().padEnd(i," "),s+=":  ",s+=l,s+=`
`,a===e&&(s+=" ".repeat(i+t+2),s+=`^
`))}return s}var k=class extends Error{line;column;codeblock;constructor(e,t){let[r,s]=xt(t.toml,t.ptr),i=_t(t.toml,r,s);super(`Invalid TOML document: ${e}

${i}`,t),this.line=r,this.column=s,this.codeblock=i}};function Te(n,e=0){let t=n.indexOf(`
`,e);return n.charCodeAt(t-1)===13&&t--,t}function ue(n){for(;n.p<n.s.length;n.p++){let e=n.s.charCodeAt(n.p);if(e===10)break;if(e===13&&n.s.charCodeAt(n.p+1)===10){n.p++;break}if(e<32&&e!==9||e===127)throw new k("control characters are not allowed in comments",{toml:n.s,ptr:n.p})}}function $(n,e,t){let r;for(;;){for(;(r=n.s.charCodeAt(n.p))===32||r===9||!e&&(r===10||r===13&&n.s.charCodeAt(n.p+1)===10);)n.p++;if(t||r!==35)break;ue(n)}}function Ge(n,e,t){let r=n.p;if(!t){r=Te(n.s,r),n.p=r<0?n.s.length:r;return}for(;n.p<n.s.length;n.p++){let s=n.s.charCodeAt(n.p);if(s===35)ue(n);else if(s===t||s===e)return}throw new k("cannot find end of structure",{toml:n.s,ptr:r})}var St=/^((0x[0-9a-fA-F](_?[0-9a-fA-F])*)|(([+-]|0[ob])?\d(_?\d)*))$/,kt=/^[+-]?\d(_?\d)*(\.\d(_?\d)*)?([eE][+-]?\d(_?\d)*)?$/,Tt=/^[+-]?0[0-9_]/;function me(n){let e=n.p,t=n.s.charCodeAt(n.p++),r=t,s=t===39,i=t===n.s.charCodeAt(n.p)&&t===n.s.charCodeAt(n.p+1);i&&((t=n.s.charCodeAt(n.p+=2))===10?n.p++:t===13&&n.s.charCodeAt(n.p+1)===10&&(n.p+=2));let a="",l=n.p,o=0;for(;n.p<n.s.length;n.p++)if(t=n.s.charCodeAt(n.p),i&&(t===10||t===13&&n.s.charCodeAt(n.p+1)===10))o=o&&3;else{if(t<32&&t!==9||t===127)throw new k("control characters are not allowed in strings",{toml:n.s,ptr:n.p});if((!o||o===3)&&t===r&&(!i||n.s.charCodeAt(n.p+1)===r&&n.s.charCodeAt(n.p+2)===r))return i&&(n.s.charCodeAt(n.p+3)===r&&n.p++,n.s.charCodeAt(n.p+3)===r&&n.p++),o||(a+=n.s.slice(l,n.p)),n.p+=i?3:1,a;if(!o)!s&&t===92&&(a+=n.s.slice(l,l=n.p),o=1);else if(o===1)if(t===120||t===117||t===85){let p=0,c=t===120?2:t===117?4:8;for(let u=0;u<c;u++,n.p++){let m=n.s.charCodeAt(n.p+1),v=m>=48&&m<=57?m-48:m>=65&&m<=70?m-65+10:m>=97&&m<=102?m-97+10:-1;if(v<0)throw new k("invalid non-hex character in unicode escape",{toml:n.s,ptr:n.p+1});p=p<<4|v}if(p<0||p>1114111||p>=55296&&p<=57343)throw new k("invalid unicode escape",{toml:n.s,ptr:n.p});a+=String.fromCodePoint(p),l=n.p+1,o=0}else if(t===32||t===9)o=2;else{if(t===98)a+="\b";else if(t===116)a+="	";else if(t===110)a+=`
`;else if(t===102)a+="\f";else if(t===114)a+="\r";else if(t===101)a+="\x1B";else if(t===34)a+='"';else if(t===92)a+="\\";else throw new k("unrecognized escape sequence",{toml:n.s,ptr:n.p});l=n.p+1,o=0}else if(t!==32&&t!==9){if(o===2)throw new k("invalid escape: only line-ending whitespace may be escaped",{toml:n.s,ptr:l});o=!s&&t===92?1:0,l=n.p}}throw new k("unfinished string",{toml:n.s,ptr:e})}function It(n,e,t){let r=n.s.slice(e,t),s=r.indexOf("#");return s>0&&(ue({s:r,p:s,d:0}),r=r.slice(0,s)),r.trimEnd()}function $e(n,e,t){let r=n.p,s={toml:n.s,ptr:r};Ge(n,44,t);let i=It(n,r,n.p);if(!i)throw new k("incomplete declaration: value expected",s);if(i==="-inf")return-1/0;if(i==="inf"||i==="+inf")return 1/0;if(i==="nan"||i==="+nan"||i==="-nan")return NaN;if(i==="-0")return e?0n:0;let a=St.test(i);if(a||kt.test(i)){if(Tt.test(i))throw new k("leading zeroes are not allowed",s);i=i.replace(/_/g,"");let o=+i;if(isNaN(o))throw new k("invalid number",s);if(a){if((a=!Number.isSafeInteger(o))&&!e)throw new k("integer value cannot be represented losslessly",s);(a||e===!0)&&(o=BigInt(i))}return o}let l=new te(i);if(!l.isValid())throw new k("invalid value",s);return l}function se(n,e,t){let r=n.p,s=n.s.charCodeAt(r);if(s===91||s===123){if(!n.d--)throw new k("document contains excessively nested structures. aborting.",{toml:n.s,ptr:r});let i=s===91?ze(n,t):je(n,t);return n.d++,i}if(s===34||s===39)return me(n);if(s===116){if(n.s.charCodeAt(++n.p)!==114||n.s.charCodeAt(++n.p)!==117||n.s.charCodeAt(++n.p)!==101)throw new k("invalid value",{toml:n.s,ptr:r});return n.p++,!0}if(s===102){if(n.s.charCodeAt(++n.p)!==97||n.s.charCodeAt(++n.p)!==108||n.s.charCodeAt(++n.p)!==115||n.s.charCodeAt(++n.p)!==101)throw new k("invalid value",{toml:n.s,ptr:r});return n.p++,!1}return $e(n,t,e)}var Et=/^[a-zA-Z0-9-_]+[ \t]*$/;function ge(n,e="="){let t=n.p,r=t-1,s=[],i=n.s.indexOf(e,t);if(i<0)throw new k("incomplete key-value: cannot find end of key",{toml:n.s,ptr:t});do{let a=n.s.charCodeAt(n.p=++r);if(a!==32&&a!==9)if(a===34||a===39){if(a===n.s.charCodeAt(n.p+1)&&a===n.s.charCodeAt(n.p+2))throw new k("multiline strings are not allowed in keys",{toml:n.s,ptr:n.p});let l=me(n);r=n.s.indexOf(".",n.p);let o=n.s.slice(n.p,r<0||r>i?i:r),p=Te(o);if(p>-1)throw new k("newlines are not allowed in keys",{toml:n.s,ptr:p});if(o.trimStart())throw new k("found extra tokens after the string part",{toml:n.s,ptr:n.p});if(i<n.p&&(i=n.s.indexOf(e,n.p),i<0))throw new k("incomplete key-value: cannot find end of key",{toml:n.s,ptr:t});s.push(l)}else{r=n.s.indexOf(".",n.p);let l=n.s.slice(n.p,r<0||r>i?i:r);if(!Et.test(l))throw new k("only letter, numbers, dashes and underscores are allowed in keys",{toml:n.s,ptr:n.p});s.push(l.trimEnd())}}while(r+1&&r<i);return n.p=i+1,$(n,!0,!0),s}function je(n,e){let t={},r=new Set,s;for(n.p++;n.p<n.s.length;){if($(n),(s=n.s.charCodeAt(n.p))===125)return n.p++,t;let i,a=t,l=!1,o=n.p,p=ge(n);for(let u=0;u<p.length;u++){if(u&&(a=l?a[i]:a[i]={}),i=p[u],(l=Object.hasOwn(a,i))&&(typeof a[i]!="object"||r.has(a[i])))throw new k("trying to redefine an already defined value",{toml:n.s,ptr:o});!l&&i==="__proto__"&&Object.defineProperty(a,i,{enumerable:!0,configurable:!0,writable:!0})}if(l)throw new k("trying to redefine an already defined value",{toml:n.s,ptr:n.p});let c=se(n,125,e);if(r.add(a[i]=c),$(n),(s=n.s.charCodeAt(n.p++))===125)return t;if(s!==44)throw new k("expected comma or end of structure",{toml:n.s,ptr:n.p-1})}throw new k("unfinished table encountered",{toml:n.s,ptr:n.p})}function ze(n,e){let t=[],r;for(n.p++;n.p<n.s.length;){if($(n),(r=n.s.charCodeAt(n.p))===93)return n.p++,t;if(t.push(se(n,93,e)),$(n),(r=n.s.charCodeAt(n.p++))===93)return t;if(r!==44)throw new k("expected comma or end of structure",{toml:n.s,ptr:n.p-1})}throw new k("unfinished array encountered",{toml:n.s,ptr:n.p})}function We(n,e,t,r){let s=e,i=t,a,l=!1,o;for(let p=0;p<n.length;p++){if(p){if(s=l?s[a]:s[a]={},i=(o=i[a]).c,r===0&&(o.t===1||o.t===2))return null;if(o.t===2){let c=s.length-1;s=s[c],i=i[c].c}}if(a=n[p],(l=Object.hasOwn(s,a))&&i[a]?.t===0&&i[a]?.d)return null;l||(a==="__proto__"&&(Object.defineProperty(s,a,{enumerable:!0,configurable:!0,writable:!0}),Object.defineProperty(i,a,{enumerable:!0,configurable:!0,writable:!0})),i[a]={t:p<n.length-1&&r===2?3:r,d:!1,i:0,c:{}})}if(o=i[a],o.t!==r&&!(r===1&&o.t===3)||(r===2&&(o.d||(o.d=!0,s[a]=[]),s[a].push(s={}),o.c[o.i++]=o={t:1,d:!1,i:0,c:{}}),o.d))return null;if(o.d=!0,r===1)s=l?s[a]:s[a]={};else if(r===0&&l)return null;return[a,s,o.c]}function ne(n,{maxDepth:e=1e3,integersAsBigInt:t}={}){let r={s:n,p:0,d:e},s={},i={},a,l=s,o=i;for($(r);r.p<n.length;){if(n.charCodeAt(r.p)===91){let p=n.charCodeAt(++r.p)===91;a=r.p+=+p;let c=ge(r,"]");if(p){if(n.charCodeAt(r.p-1)!==93)throw new k("expected end of table declaration",{toml:n,ptr:r.p-1});r.p++}let u=We(c,s,i,p?2:1);if(!u)throw new k("trying to redefine an already defined table or value",{toml:n,ptr:a});o=u[2],l=u[1]}else{a=r.p;let p=ge(r),c=We(p,l,o,0);if(!c)throw new k("trying to redefine an already defined table or value",{toml:n,ptr:a});c[1][c[0]]=se(r,void 0,t)}if($(r,!0),r.p<n.length&&(a=n.charCodeAt(r.p))!==10&&a!==13)throw new k("each key-value declaration must be followed by an end-of-line",{toml:n,ptr:r.p});$(r)}return s}function He(n,e){let t=E.readFileSync(n);if(E.existsSync(e)&&t.equals(E.readFileSync(e)))return;E.mkdirSync(Ue.dirname(e),{recursive:!0});let r=`${e}.${process.pid}.${Date.now()}.tmp`;try{E.writeFileSync(r,t),E.renameSync(r,e)}finally{E.existsSync(r)&&E.unlinkSync(r)}}function Rt(n,e){try{let t=ne(n),s=t.mcp_servers?.["terminal-grid"];if(!Array.isArray(s?.args))return n;let i=new Map;if(s.args=s.args.map(l=>typeof l!="string"||!/[\\/]mcp-server\.js$/i.test(l)||!/[\\/]extensions[\\/]koenma\.terminal-grid-\d/i.test(l)&&E.existsSync(l)?l:(i.set(l,e),e)),!i.size)return n;let a=/"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\\r\n]|\\.)*"|'[^'\r\n]*'|#[^\r\n]*/g;for(let l of n.matchAll(a)){if(l[0].startsWith("#"))continue;let o;try{o=ne(`value = ${l[0]}`).value}catch{continue}if(typeof o!="string"||!i.has(o))continue;let p=n.slice(0,l.index)+JSON.stringify(e)+n.slice(l.index+l[0].length);if((0,qe.isDeepStrictEqual)(ne(p),t))return p}}catch{}return n}function Ve(n,e){if(!E.existsSync(n)||!E.existsSync(e))return;let t=E.readFileSync(n,"utf8"),r=Rt(t,e);if(t===r)return;let s=`${n}.tg-tmp.${process.pid}.${Date.now()}`;try{E.writeFileSync(s,r),E.readFileSync(n,"utf8")===t&&E.renameSync(s,n)}finally{E.existsSync(s)&&E.unlinkSync(s)}}function fe(n){if(!["codex","claude"].includes(n.cli)||!["new","picker","last","session"].includes(n.mode))throw new Error("Choose a CLI and a launch mode.");let e=(n.sessionId||"").trim();if(n.mode==="session"&&!/^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,199}$/.test(e))throw new Error("Enter a valid session ID (letters, numbers, dots, colons, underscores or hyphens).");let t=(n.options||"").trim();if(/[\r\n\x00]/.test(t))throw new Error("CLI options must be a single line.");let r=n.cli;return n.mode!=="new"&&(n.cli==="codex"?r+=" resume"+(n.mode==="last"?" --last":""):r+=n.mode==="last"?" --continue":" --resume",n.mode==="session"&&(r+=" "+e)),r+(t?" "+t:"")}function Je(n){let e=[];for(let t=0;t<n.length;t++){let r=n[t],s=t+1;for(;n[s]?.type==="timeout";)s++;let i=n[s];if(r.type==="command"&&i?.type==="command"){let a=r.input.trim().match(/^(codex|claude)(\s+--?[\w][^\r\n]*)?$/),l=i.input.trim().match(/^\/resume(?:\s+([a-zA-Z0-9][a-zA-Z0-9_.:-]{0,199}))?$/),o=a?.[2]?.trim()||"";if(a&&l&&!/[;&|<>`$()]/.test(o)&&!/(?:^|\s)(?:--resume|--continue|-r|-c|resume)(?:\s|$)/.test(o)){e.push({type:"command",input:fe({cli:a[1],mode:l[1]?"session":"picker",sessionId:l[1],options:o})}),e.push(...n.slice(t+1,s).map(p=>({...p}))),t=s;continue}}e.push({...r})}return e}var w=R(require("vscode")),K=R(require("os")),Z=R(require("fs")),Y=R(require("path"));var Ye={"":null,Dracula:{name:"Dracula",background:"#282a36",foreground:"#f8f8f2",cursor:"#f8f8f2",cursorAccent:"#282a36",selectionBackground:"#44475a",black:"#21222c",brightBlack:"#6272a4",red:"#ff5555",brightRed:"#ff6e6e",green:"#50fa7b",brightGreen:"#69ff94",yellow:"#f1fa8c",brightYellow:"#ffffa5",blue:"#bd93f9",brightBlue:"#d6acff",magenta:"#ff79c6",brightMagenta:"#ff92df",cyan:"#8be9fd",brightCyan:"#a4ffff",white:"#f8f8f2",brightWhite:"#ffffff"},Monokai:{name:"Monokai",background:"#272822",foreground:"#f8f8f2",cursor:"#f8f8f0",cursorAccent:"#272822",selectionBackground:"#49483e",black:"#272822",brightBlack:"#75715e",red:"#f92672",brightRed:"#f92672",green:"#a6e22e",brightGreen:"#a6e22e",yellow:"#f4bf75",brightYellow:"#f4bf75",blue:"#66d9ef",brightBlue:"#66d9ef",magenta:"#ae81ff",brightMagenta:"#ae81ff",cyan:"#a1efe4",brightCyan:"#a1efe4",white:"#f8f8f2",brightWhite:"#f9f8f5"},"Solarized Dark":{name:"Solarized Dark",background:"#002b36",foreground:"#839496",cursor:"#839496",cursorAccent:"#002b36",selectionBackground:"#073642",black:"#073642",brightBlack:"#586e75",red:"#dc322f",brightRed:"#cb4b16",green:"#859900",brightGreen:"#586e75",yellow:"#b58900",brightYellow:"#657b83",blue:"#268bd2",brightBlue:"#839496",magenta:"#d33682",brightMagenta:"#6c71c4",cyan:"#2aa198",brightCyan:"#93a1a1",white:"#eee8d5",brightWhite:"#fdf6e3"},"Solarized Light":{name:"Solarized Light",background:"#fdf6e3",foreground:"#657b83",cursor:"#657b83",cursorAccent:"#fdf6e3",selectionBackground:"#eee8d5",black:"#073642",brightBlack:"#586e75",red:"#dc322f",brightRed:"#cb4b16",green:"#859900",brightGreen:"#586e75",yellow:"#b58900",brightYellow:"#657b83",blue:"#268bd2",brightBlue:"#839496",magenta:"#d33682",brightMagenta:"#6c71c4",cyan:"#2aa198",brightCyan:"#93a1a1",white:"#eee8d5",brightWhite:"#fdf6e3"},Nord:{name:"Nord",background:"#2e3440",foreground:"#d8dee9",cursor:"#d8dee9",cursorAccent:"#2e3440",selectionBackground:"#434c5e",black:"#3b4252",brightBlack:"#4c566a",red:"#bf616a",brightRed:"#bf616a",green:"#a3be8c",brightGreen:"#a3be8c",yellow:"#ebcb8b",brightYellow:"#ebcb8b",blue:"#81a1c1",brightBlue:"#81a1c1",magenta:"#b48ead",brightMagenta:"#b48ead",cyan:"#88c0d0",brightCyan:"#8fbcbb",white:"#e5e9f0",brightWhite:"#eceff4"},"One Dark":{name:"One Dark",background:"#282c34",foreground:"#abb2bf",cursor:"#528bff",cursorAccent:"#282c34",selectionBackground:"#3e4451",black:"#282c34",brightBlack:"#5c6370",red:"#e06c75",brightRed:"#e06c75",green:"#98c379",brightGreen:"#98c379",yellow:"#e5c07b",brightYellow:"#d19a66",blue:"#61afef",brightBlue:"#61afef",magenta:"#c678dd",brightMagenta:"#c678dd",cyan:"#56b6c2",brightCyan:"#56b6c2",white:"#abb2bf",brightWhite:"#ffffff"},"Gruvbox Dark":{name:"Gruvbox Dark",background:"#282828",foreground:"#ebdbb2",cursor:"#ebdbb2",cursorAccent:"#282828",selectionBackground:"#504945",black:"#282828",brightBlack:"#928374",red:"#cc241d",brightRed:"#fb4934",green:"#98971a",brightGreen:"#b8bb26",yellow:"#d79921",brightYellow:"#fabd2f",blue:"#458588",brightBlue:"#83a598",magenta:"#b16286",brightMagenta:"#d3869b",cyan:"#689d6a",brightCyan:"#8ec07c",white:"#a89984",brightWhite:"#ebdbb2"},"Tokyo Night":{name:"Tokyo Night",background:"#1a1b26",foreground:"#a9b1d6",cursor:"#c0caf5",cursorAccent:"#1a1b26",selectionBackground:"#33467c",black:"#15161e",brightBlack:"#414868",red:"#f7768e",brightRed:"#f7768e",green:"#9ece6a",brightGreen:"#9ece6a",yellow:"#e0af68",brightYellow:"#e0af68",blue:"#7aa2f7",brightBlue:"#7aa2f7",magenta:"#bb9af7",brightMagenta:"#bb9af7",cyan:"#7dcfff",brightCyan:"#7dcfff",white:"#a9b1d6",brightWhite:"#c0caf5"}},Ke=Object.keys(Ye);function U(n){let e=Ye[n];if(!e)return null;let{name:t,...r}=e;return r}var Ze=R(require("vscode")),Ie=class{constructor(){this._panels=new Map;this._onDidChange=new Ze.EventEmitter;this.onDidChange=this._onDidChange.event}register(e,t,r){if(r!==void 0&&r>=0&&r<=this._panels.size){let s=Array.from(this._panels.entries());s.splice(r,0,[e,t]),this._panels=new Map(s)}else this._panels.set(e,t);this._activeTabId=e,this._onDidChange.fire()}unregister(e,t){if(t!==void 0&&this._panels.get(e)!==t)return;let r=this._panels.delete(e);if(this._activeTabId===e){let s=Array.from(this._panels.keys());this._activeTabId=s.length>0?s[s.length-1]:void 0}r&&this._onDidChange.fire()}replace(e,t,r){let s=Array.from(this._panels.entries()),i=s.findIndex(([a])=>a===e);i>=0?s[i]=[t,r]:s.push([t,r]),this._panels=new Map(s),this._activeTabId=t,this._onDidChange.fire()}setActive(e){this._panels.has(e)&&this._activeTabId!==e&&(this._activeTabId=e,this._onDidChange.fire())}getActive(){return this._activeTabId!==void 0?this._panels.get(this._activeTabId):void 0}getActiveTabId(){return this._activeTabId}get(e){return this._panels.get(e)}has(e){return this._panels.has(e)}size(){return this._panels.size}all(){return Array.from(this._panels.values())}entries(){return Array.from(this._panels.entries())}reorder(e){let t=new Map(e.map((i,a)=>[i,a])),r=this.entries(),s=[...r].sort(([i],[a])=>(t.get(i)??1/0)-(t.get(a)??1/0));s.some(([i],a)=>r[a][0]!==i)&&(this._panels=new Map(s),this._onDidChange.fire())}disposeAll(e=!1){let t=Array.from(this._panels.values());for(let r of t)try{r.dispose(e)}catch{}this._panels.clear(),this._activeTabId=void 0}},C=new Ie,O=class n{static{this.KEY="nextTabId"}static{this._next=new WeakMap}static next(e){let t=this.peek(e);return this._next.set(e.workspaceState,t+1),e.workspaceState.update(n.KEY,t+1),t}static reserve(e,t){this.peek(e)<=t&&(this._next.set(e.workspaceState,t+1),e.workspaceState.update(n.KEY,t+1))}static peek(e){return Math.max(this._next.get(e.workspaceState)??0,e.workspaceState.get(n.KEY,0))}static reset(e){return this._next.set(e.workspaceState,0),e.workspaceState.update(n.KEY,0)}};var he=["bgColor","fgColor","fontFamily","themeName"];function Qe(n,e=he){let t={};for(let[r,s]of Object.entries(n)){let i={...s};for(let a of e)delete i[a];Object.keys(i).length>0&&(t[Number(r)]=i)}return t}var Lt=/^(?:cellOverrides|cellLabels|mergedRegions|defaultSteps|defaultCommand|startupCommands|tabName)_\d+$/,Pt=["cellOverrides","cellLabels","mergedRegions","defaultSteps","defaultCommand","startupCommands","tabName"];function Xe(n){if(!Array.isArray(n))return[];let e=new Set,t=new Set;return n.filter(r=>{if(!r||!Number.isSafeInteger(r.tabId)||r.tabId<0||e.has(r.tabId)||!Number.isInteger(r.rows)||r.rows<1||r.rows>4||!Number.isInteger(r.cols)||r.cols<1||r.cols>5||!Array.isArray(r.cellIds)||r.cellIds.length!==r.rows*r.cols)return!1;let s=new Set;for(let i of r.cellIds){if(!Number.isSafeInteger(i)||i<0||t.has(i)||s.has(i))return!1;s.add(i)}return e.add(r.tabId),s.forEach(i=>t.add(i)),!0}).map(r=>({tabId:r.tabId,rows:r.rows,cols:r.cols,cellIds:[...r.cellIds]}))}var Ee=class{init(e){this._ctx=e,this._restoring=void 0}getLastTabs(){return Xe(this.ctx.workspaceState.get("lastTabs",[]))}setLastTabs(e){let t=new Map(e.map(i=>[i.tabId,i])),r=(this._restoring??[]).map(i=>t.get(i.tabId)??i),s=new Set(r.map(i=>i.tabId));return r.push(...e.filter(i=>!s.has(i.tabId))),this.ctx.workspaceState.update("lastTabs",Xe(r))}beginRestore(){return this._restoring=this.getLastTabs(),this._restoring}finishRestore(){this._restoring=void 0}get ctx(){if(!this._ctx)throw new Error("TabStateStore not initialized");return this._ctx}getCellOverrides(e){return this.ctx.workspaceState.get(`cellOverrides_${e}`,{})}setCellOverrides(e,t){return this.ctx.workspaceState.update(`cellOverrides_${e}`,t)}getCellLabels(e){return this.ctx.workspaceState.get(`cellLabels_${e}`,[])}setCellLabels(e,t){return this.ctx.workspaceState.update(`cellLabels_${e}`,t)}getMergedRegions(e){return this.ctx.workspaceState.get(`mergedRegions_${e}`,[])}setMergedRegions(e,t){return this.ctx.workspaceState.update(`mergedRegions_${e}`,t)}getDefaultSteps(e){return this.ctx.workspaceState.get(`defaultSteps_${e}`,[])}setDefaultSteps(e,t){return this.ctx.workspaceState.update(`defaultSteps_${e}`,t)}getDefaultCommand(e){return this.ctx.workspaceState.get(`defaultCommand_${e}`,"")}setDefaultCommand(e,t){return this.ctx.workspaceState.update(`defaultCommand_${e}`,t)}getStartupCommands(e){return this.ctx.workspaceState.get(`startupCommands_${e}`,[])}setStartupCommands(e,t){return this.ctx.workspaceState.update(`startupCommands_${e}`,t)}getTabName(e){return this.ctx.workspaceState.get(`tabName_${e}`,"")}setTabName(e,t){return this.ctx.workspaceState.update(`tabName_${e}`,t)}async deleteTab(e){let t=[`cellOverrides_${e}`,`cellLabels_${e}`,`mergedRegions_${e}`,`defaultSteps_${e}`,`defaultCommand_${e}`,`startupCommands_${e}`,`tabName_${e}`];for(let r of t)await this.ctx.workspaceState.update(r,void 0)}async cloneTab(e,t){await this.setCellOverrides(t,JSON.parse(JSON.stringify(this.getCellOverrides(e)))),await this.setCellLabels(t,[...this.getCellLabels(e)]),await this.setMergedRegions(t,JSON.parse(JSON.stringify(this.getMergedRegions(e)))),await this.setDefaultSteps(t,JSON.parse(JSON.stringify(this.getDefaultSteps(e)))),await this.setDefaultCommand(t,this.getDefaultCommand(e)),await this.setStartupCommands(t,JSON.parse(JSON.stringify(this.getStartupCommands(e))))}async migrateOnce(){let e=this.ctx.workspaceState,t=this.ctx.globalState;if(e.get("workspaceTabStateVersion",0)>=1)return;let r=async(l,o=l)=>{let p=t.get(l);p!==void 0&&e.get(o)===void 0&&await e.update(o,JSON.parse(JSON.stringify(p)))};for(let l of t.keys())Lt.test(l)&&await r(l);for(let l of Pt)await r(l,`${l}_0`);for(let l of["lastTabs","lastGrid","nextTabId","nextGlobalCellId","pendingFirstTabId"])await r(l);let s=this.getLastTabs();if(e.get("lastTabs")===void 0){let l=e.get("lastGrid");l&&Number.isInteger(l.rows)&&Number.isInteger(l.cols)&&l.rows>=1&&l.rows<=4&&l.cols>=1&&l.cols<=5&&(s=[{tabId:0,rows:l.rows,cols:l.cols,cellIds:Array.from({length:l.rows*l.cols},(o,p)=>p)}])}await e.update("lastTabs",s);let i=Math.max(e.get("nextTabId",0)||0,...s.map(l=>l.tabId+1)),a=Math.max(e.get("nextGlobalCellId",0)||0,...s.flatMap(l=>l.cellIds.map(o=>o+1)));await e.update("nextTabId",i),await e.update("nextGlobalCellId",a),await e.update("workspaceTabStateVersion",1)}},f=new Ee;var Re=class n{constructor(){this._next=new WeakMap}static{this.KEY="nextGlobalCellId"}allocate(e,t){let r=this.peek(e),s=[];for(let i=0;i<t;i++)s.push(r+i);return this._next.set(e.workspaceState,r+t),e.workspaceState.update(n.KEY,r+t),s}peek(e){return Math.max(this._next.get(e.workspaceState)??0,e.workspaceState.get(n.KEY,0))}reserve(e,t){let r=Math.max(this.peek(e),...t.map(s=>s+1));this._next.set(e.workspaceState,r),e.workspaceState.update(n.KEY,r)}reset(e){return this._next.set(e.workspaceState,0),e.workspaceState.update(n.KEY,0)}resolve(e){for(let[t,r]of C.entries()){let i=r.getCellIds().indexOf(e);if(i!==-1)return{tabId:t,localCellId:i}}return null}},A=new Re;var re=class{constructor(e,t,r=4096,s=10){this._write=e;this._onError=t;this._chunkSize=r;this._delay=s;this._pending=[];this._disposed=!1;this._queued=0}get disposed(){return this._disposed}write(e){this.writeAsync(e).catch(()=>{})}writeAsync(e,t){return this._disposed?Promise.reject(new Error("Terminal process has exited")):e?this._queued+e.length>8*1024*1024?Promise.reject(new Error("Terminal input queue is full")):new Promise((r,s)=>{this._pending.push({data:e,offset:0,resolve:r,reject:s,progress:t}),this._queued+=e.length,this._timer||this._drain()}):Promise.resolve()}cancel(e="Input cancelled",t=!1){clearTimeout(this._timer),this._timer=void 0;let r=this._pending[0],s=r&&r.offset>0&&r.data.startsWith("\x1B[200~")&&r.offset<r.data.lastIndexOf("\x1B[201~")+6;for(let i of this._pending)i.reject(new Error(e));if(this._pending.length=0,this._queued=0,!this._disposed&&(s||t))try{this._write((s?"\x1B[201~":"")+(t?"":""))}catch(i){this._disposed=!0,this._onError(i)}}dispose(){this._disposed=!0,this.cancel("Terminal process exited or restarted")}_drain(){if(this._timer=void 0,this._disposed||!this._pending.length)return;let e=this._pending[0],t=Math.min(e.offset+this._chunkSize,e.data.length);t<e.data.length&&/[\uD800-\uDBFF]/.test(e.data[t-1])&&t--,t===e.offset&&(t=Math.min(t+2,e.data.length));try{this._write(e.data.slice(e.offset,t))}catch(r){this.dispose(),this._onError(r);return}this._queued-=t-e.offset,e.offset=t,e.progress?.(t,e.data.length),t===e.data.length&&(this._pending.shift(),e.resolve()),this._pending.length&&(this._timer=setTimeout(()=>this._drain(),this._delay))}};var ot=require("crypto");function et(n){if(!n||typeof n!="object")return!1;let e=n;return!Array.isArray(e.lines)||e.lines.length>500||!e.lines.every(t=>typeof t=="string"&&t.length<=4e3)||!Number.isInteger(e.cursorX)||e.cursorX<0||e.cursorX>4e3||!Number.isInteger(e.cursorY)||e.cursorY<0||e.cursorY>=e.lines.length||e.cols!==void 0&&(!Number.isInteger(e.cols)||e.cols<1||e.cols>4e3||e.cursorX>e.cols)?!1:e.lineInfo===void 0?!0:!Array.isArray(e.lineInfo)||e.lineInfo.length!==e.lines.length?!1:e.lineInfo.every((t,r)=>{if(!t||typeof t.wrapped!="boolean"||!Array.isArray(t.styles)||t.styles.length>4e3)return!1;let s=0;if(!t.styles.every(a=>!a||!Number.isInteger(a.start)||!Number.isInteger(a.end)||a.start<s||a.end<=a.start||a.end>(e.cols||4e3)||typeof a.dim!="boolean"||typeof a.italic!="boolean"||!Number.isInteger(a.fgMode)||!Number.isInteger(a.fg)||a.bgMode!==void 0&&!Number.isInteger(a.bgMode)||a.bg!==void 0&&!Number.isInteger(a.bg)?!1:(s=a.end,!0)))return!1;if(t.columns===void 0)return!0;if(!Array.isArray(t.columns)||t.columns.length>4001)return!1;let i=0;return t.columns.every(a=>!Number.isInteger(a)||a<i||a>e.lines[r].length?!1:(i=a,!0))})}function V(n,e,t){let r=n.lineInfo?.[e]?.columns;return r?r[Math.min(t,r.length-1)]:Math.min(t,n.lines[e].length)}var Le=/^\s*[│┃]?\s*(?:[›❯>]|aider>)\s?/,Dt=/\? for shortcuts|shift\+tab|context left|context remaining|ctrl\+g|ctrl\+t|esc to clear|esc(?:ape)? to (?:interrupt|cancel)|ctrl\+c to interrupt/i,be=/^\s*[│┃]?[─━═┌┐└┘┏┓┗┛╭╮╰╯]{3,}[│┃]?\s*$/;function ve(n,e){return Dt.test(n)||e&&/\S.* · (?:[a-zA-Z]:[\\/]|[~/])/.test(n)}function Ot(n){if(n.dim)return!0;if(n.fgMode===16777216||n.fgMode===33554432)return n.fg===8||n.fg>=232&&n.fg<=254;if(n.fgMode===50331648){let e=n.fg>>>16&255,t=n.fg>>>8&255,r=n.fg&255;return Math.max(e,t,r)-Math.min(e,t,r)<=16&&e>=48&&e<=220}return!1}function Mt(n,e,t,r,s){if(!/^(?:Ask Codex to do anything|Try asking a question|Ask anything|Explain this codebase|Find and fix a bug in @filename|Write tests for @filename|Improve documentation in @filename|Implement \{feature\}|Summarize recent commits|Run \/review to review your current code changes|Try ["“].+["”])$/.test(s.replace(/\n\s*/g," "))||!n.lineInfo)return!1;for(let a=e;a<t;a++){let l=n.lineInfo[a];if(!l)return!1;let o=l.styles.filter(p=>{let c=Math.max(a===e?r:0,V(n,a,p.start)),u=V(n,a,p.end);return/\S/.test(n.lines[a].slice(c,u))});if(!o.length||!o.every(Ot))return!1}return!0}function Pe(n){let{lines:e,cursorX:t,cursorY:r}=n;if(!e.length||r<0||r>=e.length)return null;let s=r;for(;s>=0&&!Le.test(e[s]);){if(be.test(e[s])||ve(e[s],!0))return null;s--}if(s<0)return null;let i=s-1;for(;i>=0&&!be.test(e[i])&&!ve(e[i],!0);)i--;let a=i>=0&&be.test(e[i]);for(let S=s-1;S>i&&!(!a&&!e[S].trim());S--)Le.test(e[S])&&!n.lineInfo?.[S]?.wrapped&&(s=S);let l=e[s].match(Le),o=l[0].length,p=/^\s*›/.test(e[s]),c=/^\s*aider>/.test(e[s]),u=n.lineInfo?.[s]?.styles.find(S=>S.start<=o&&S.end>o&&S.bgMode),m=!!u,v=e.length;for(let S=s+1;S<e.length;S++){let N=u&&n.lineInfo?.[S]?.styles.some(B=>B.bgMode===u.bgMode&&B.bg===u.bg);if(be.test(e[S])||(m?!N:!a&&ve(e[S],p))){v=S;break}}if(r>=v)return null;let h=c||e.slice(v).some(S=>ve(S,p)),g=/[│┃]/.test(l[0]),y=[],_="",x="";for(let S=s;S<v;S++){let N=e[S],B=!!n.lineInfo?.[S]?.wrapped,ee=S===s||!B&&N.startsWith(" ".repeat(o))?o:0,M=N.slice(ee).replace(g?/\s*[│┃]\s*$/:/$/,""),G=S===s||B?"":`
`;S===r&&(_=x+G+M.slice(0,Math.max(0,V(n,S,t)-ee))),x+=G+M,y.push(M)}for(;y.length>r-s+1&&!y[y.length-1].trim();)y.pop();x=y.reduce((S,N,B)=>S+(B&&!n.lineInfo?.[s+B]?.wrapped?`
`:"")+N,"");let I=r===s&&V(n,s,t)===o;return{row:s,end:s+y.length,start:o,text:x,beforeCursor:_,atStart:I,inputUi:h,placeholder:I&&Mt(n,s,s+y.length,o,x)}}function ie(n){let{lines:e,cursorX:t,cursorY:r}=n;if(!e.length||r<0||r>=e.length)return"starting";let s=e.slice(Math.max(0,r-8)).join(`
`),i=e.join(`
`);if(/^\s*Resume (?:(?:a|an|your) )?(?:previous )?(?:session|conversation)\s*$/im.test(i)&&/type to search|search…|search\.\.\.|enter\s+resume|no conversations found/i.test(i)||/enter\s+resume.*esc\s+new/i.test(s))return"picker";if(/do you trust|trust (?:this|the) (?:folder|directory|workspace)|is this a project you created/i.test(s))return"trust";if(/resume (?:(?:a|an|your) )?(?:previous )?(?:session|conversation)|select (?:(?:a|an) )?(?:previous )?(?:session|conversation)|search (?:past )?(?:sessions|conversations)|no (?:saved )?(?:sessions|conversations) found/i.test(s))return"picker";if(/sign in|log in|login required|open (?:your )?browser|paste (?:the )?(?:authentication|authorization|code)|select (?:a )?(?:login|theme)|do you want to (?:proceed|allow)|would you like to|use .+ by default\?|allow (?:once|this)|approve (?:this|the)|accept.*(?:terms|risk)/i.test(s))return"blocked";if(/esc(?:ape)? to (?:interrupt|cancel)|interrupt.*esc|ctrl\+c to interrupt/i.test(s))return"busy";let a=Pe(n);return!a||a.row===r&&V(n,r,t)<a.start||!a.inputUi?"starting":!a.atStart||a.text&&!a.placeholder?"occupied":a.inputUi?"ready":"starting"}function tt(n,e){if(!e||/[\r\n]/.test(e))return!1;let t=Pe(n);return!t||!t.inputUi||t.placeholder||t.text!==e||t.beforeCursor!==e?!1:!["trust","blocked","picker","busy"].includes(ie(n))}var we=class{constructor(){this._key="";this._since=0}observe(e,t=Date.now()){let r=ie(e),s=r==="ready"?Pe(e):null,i=s?JSON.stringify([e.cursorY,e.cursorX,e.lines.slice(s.row,s.end),e.lineInfo?.slice(s.row,s.end)]):"";return!i||i!==this._key?(this._key=i,this._since=t,{state:r,ready:!1}):{state:r,ready:t-this._since>=600}}};var ye=class{constructor(){this._generation=0;this._pending=[]}get pending(){return this._pending.length+(this._active?1:0)}enqueue(e,t,r){return this._closedReason?Promise.resolve(this._receipt(e,t,this._closedReason)):this.pending>=16?Promise.resolve(this._receipt(e,t,"Cell input queue is full. Wait for pending deliveries before retrying.")):new Promise(s=>{this._pending.push({execute:r,characters:e,submitted:t,finish:s,generation:this._generation}),this._drain()})}dispose(e="Cell process exited or restarted before input was delivered"){if(!this._closedReason){this._closedReason=e,this._generation++;for(let t of[...this._active?[this._active]:[],...this._pending])t.finish(this._receipt(t.characters,t.submitted,e));this._pending.length=0}}_receipt(e,t,r){return{success:!r,delivery:r?"failed":"delivered",characters:e,submitted:!r&&t,completedAt:new Date().toISOString(),...r?{error:r}:{}}}_drain(){if(this._active||this._closedReason)return;let e=this._pending.shift();if(!e)return;this._active=e;let t=()=>{if(this._closedReason||e.generation!==this._generation)throw new Error(this._closedReason||"Input was cancelled")};Promise.resolve().then(()=>(t(),e.execute(t))).then(()=>{t(),e.finish(this._receipt(e.characters,e.submitted))}).catch(r=>{e.finish(this._receipt(e.characters,e.submitted,r instanceof Error?r.message:"Input delivery failed"))}).finally(()=>{this._active=void 0,this._drain()})}};function st(n,e){let t=!/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(n),r=n;if(e.bracketedPaste&&t&&n)r="\x1B[200~"+n.replace(/\r\n|\n/g,"\r")+"\x1B[201~";else if(e.submit&&/[\r\n]/.test(n))throw new Error("This cell has not enabled bracketed paste. Send one line at a time or paste through its terminal UI.");return r+(e.submit?e.enter:"")}function Ce(n){let e=n.lines.length,t=n.requestedLines===void 0?e:Math.min(e,Math.max(0,n.requestedLines)),r=e-t,s=n.droppedCharacters||0;return{output:t===0?"":n.lines.slice(r).join(`
`),mode:n.mode,capturedAt:new Date().toISOString(),lastOutputAt:n.lastOutputAt?new Date(n.lastOutputAt).toISOString():null,truncated:r>0||s>0,range:{startLine:t?r+1:0,endLine:t?e:0,totalLines:e,droppedCharacters:s},state:n.state,...n.cursor?{cursor:n.cursor}:{}}}var xe=class{constructor(e,t=256*1024,r=128*1024,s=32*1024){this._callbacks=e;this._highWater=t;this._lowWater=r;this._chunkSize=s;this._pending=[];this._offset=0;this._pendingCharacters=0;this._inFlight=new Map;this._inFlightCharacters=0;this._sequence=0;this._selectionPaused=!1;this._flowPaused=!1;this._paused=!1;this._draining=!1;this._disposed=!1;if(t<2||r<0||r>=t||s<2||s>t)throw new Error("Invalid PTY output flow watermarks")}get inFlightCharacters(){return this._inFlightCharacters}get pendingCharacters(){return this._pendingCharacters}get paused(){return this._paused}enqueue(e){this._disposed||!e||(this._pending.push(e),this._pendingCharacters+=e.length,this._drain())}acknowledge(e){if(this._disposed)return;let t=this._inFlight.get(e);t!==void 0&&(this._inFlight.delete(e),this._inFlightCharacters-=t,this._drain())}selectionPaused(e){this._disposed||this._selectionPaused===e||(this._selectionPaused=e,this._drain())}dispose(){this._disposed||(this._disposed=!0,this._pending.length=0,this._inFlight.clear(),this._pendingCharacters=this._inFlightCharacters=this._offset=0,this._paused&&(this._paused=!1,this._callbacks.resume()))}_drain(){if(!(this._disposed||this._draining)){this._draining=!0;try{for(;!this._selectionPaused&&this._pending.length;){let t=this._highWater-this._inFlightCharacters;if(t<2)break;let r=this._pending[0],s=Math.min(r.length,this._offset+this._chunkSize,this._offset+t);s<r.length&&/[\uD800-\uDBFF]/.test(r[s-1])&&s--;let i=r.slice(this._offset,s);this._offset=s,this._pendingCharacters-=i.length,s===r.length&&(this._pending.shift(),this._offset=0);let a=++this._sequence;this._inFlight.set(a,i.length),this._inFlightCharacters+=i.length,this._callbacks.post(i,a)}this._pendingCharacters||this._inFlightCharacters>=this._highWater-1?this._flowPaused=!0:this._inFlightCharacters<=this._lowWater&&(this._flowPaused=!1);let e=this._selectionPaused||this._flowPaused;e!==this._paused&&(this._paused=e,e?this._callbacks.pause():this._callbacks.resume())}finally{this._draining=!1}}}};function J(n){return new Promise(e=>setTimeout(e,n))}var At=3e3,nt=(()=>{if(process.platform!=="win32")return 0;let n=K.release().split(".");return parseInt(n[2]||"0",10)})(),lt=nt>0&&nt<22e3?"\r":"\x1B[13u",Nt=["claude","codex","gemini","copilot","aider","claude --dangerously-skip-permissions","codex -s danger-full-access -a never"];function rt(n){let e=n.trim();return Nt.some(t=>e===t||e.startsWith(t+" "))}var De=150,Bt=2500,Ft=process.platform==="win32"?450:300,Oe=n=>n?lt:"\r",Gt=[{test:/do you trust the files in this folder/i,accept:Oe},{test:/do you trust the (files|contents) (in|of) this (directory|folder|workspace)/i,accept:Oe},{test:/\btrust (this|the) (folder|directory|workspace)\b/i,accept:Oe}];function it(n,e,t,r,s){let i=n[s];return i?.startupSteps&&i.startupSteps.length>0?i.startupSteps:i?.startupCommand?[{type:"command",input:i.startupCommand}]:e[s]?[{type:"command",input:e[s]}]:t.length>0?t:r?[{type:"command",input:r}]:[]}var at={".ttf":"truetype",".otf":"opentype",".woff":"woff",".woff2":"woff2"},T=class n{constructor(e,t,r,s,i,a){this._cellIds=[];this._terminals=[];this._outputBuffers=[];this._droppedOutput=[];this._bracketedPaste=[];this._commandQueues=new Map;this._cellDimensions=[];this._outputFlows=new Map;this._outputEpoch=0;this._csiUMode=[];this._insideLlm=[];this._cellShellType=[];this._lastByteTs=[];this._altScreen=[];this._altDwellStart=[];this._stepWatermark=[];this._controlTail=[];this._startupSent=[];this._disposed=!1;this._stepGeneration={};this._startupRuns=new Map;this._startupPending=new Set;this._startupLastStatus=new Map;this._userInputVersion={};this._snapshotSequence=0;this._snapshotRequests=new Map;this._pasteImages=[];this._panel=e,this._context=t,this._rows=r,this._cols=s,this._tabId=i,this._cellIds=a,this._panel.title=w.l10n.t("Terminal Grid {0}\xD7{1}",r,s),this._registryListener=C.onDidChange(()=>{this._disposed||this.refreshTitle()});let l=f.getMergedRegions(i).filter(o=>o.startRow+o.rowSpan<=r&&o.startCol+o.colSpan<=s);this._hiddenCells=new Set;for(let o of l)for(let p=o.startRow;p<o.startRow+o.rowSpan;p++)for(let c=o.startCol;c<o.startCol+o.colSpan;c++)p===o.startRow&&c===o.startCol||this._hiddenCells.add(p*s+c);this._panel.webview.options={enableScripts:!0,localResourceRoots:[w.Uri.joinPath(t.extensionUri,"media")]},this._panel.webview.html=this._getHtml(),this._panel.webview.onDidReceiveMessage(async o=>{switch(o.type){case"selectionDrag":{o.paused===!0&&this._panel.active?(this._userInputVersion[o.id]=(this._userInputVersion[o.id]||0)+1,this._outputFlows.get(o.id)?.flow.selectionPaused(!0)):(o.paused===!1||o.paused===!0)&&(this._outputFlows.get(o.id)?.flow.selectionPaused(!1),o.paused===!0&&this._panel.webview.postMessage({type:"endSelectionDrag"}));break}case"outputAck":{let c=this._outputFlows.get(o.id);c&&c.epoch===o.outputEpoch&&c.flow.acknowledge(o.outputSequence);break}case"startupSnapshot":this._receiveSnapshot(o);break;case"startupRetry":{let c=this._startupRuns.get(o.id);c?.paused&&c.generation===o.generation&&(c.paused=!1,this._runStartup(o.id,c));break}case"startupCancel":this._stepGeneration[o.id]===o.generation&&(this._stepGeneration[o.id]++,this._startupRuns.delete(o.id),this._setStartupStatus(o.id,"",!1));break;case"userActivity":this._userInputVersion[o.id]=(this._userInputVersion[o.id]||0)+1;break;case"ready":if(this._createTerminals(o.defaultCols,o.defaultRows),o.cellDims&&Array.isArray(o.cellDims))for(let c=0;c<o.cellDims.length&&c<this._terminals.length;c++){let u=o.cellDims[c];if(Number.isInteger(u?.cols)&&Number.isInteger(u?.rows)&&u.cols>=2&&u.rows>=1&&u.cols<=4e3&&u.rows<=500){this._cellDimensions[c]={cols:u.cols,rows:u.rows};try{this._terminals[c].pty.resize(u.cols,u.rows)}catch{}}}this.loadCustomFonts(this._context.globalState.get("customFonts",[]));let p=f.getCellOverrides(this._tabId);for(let[c,u]of Object.entries(p))if(u.bgColor||u.fgColor||u.fontFamily||u.themeName){let m=u.themeName?U(u.themeName):null;this.sendCellConfig(parseInt(c),u.bgColor||"",u.fgColor||"",u.fontFamily||"",u.themeName||"",m)}break;case"input":{if(typeof o.data!="string")break;this._userInputVersion[o.id]=(this._userInputVersion[o.id]||0)+1;let c=this._terminals[o.id]?.pty;if(o.data===""){this._cancelCellInput(o.id,!0);break}if(c){let u=0,m=o.data.length>4096?(v,h)=>{v!==h&&Date.now()-u<100||(u=Date.now(),this._panel.webview.postMessage({type:"inputProgress",id:o.id,written:v,total:h,done:v===h}))}:void 0;try{c.writeAsync?await c.writeAsync(o.data,m):this._chunkedWrite(c,o.data)}catch(v){this._panel.webview.postMessage({type:"inputProgress",id:o.id,done:!0,error:v instanceof Error?v.message:"Input failed"})}}break}case"cancelInput":this._cancelCellInput(o.id,!0);break;case"clipboardWrite":if(typeof o.text=="string")try{await w.env.clipboard.writeText(o.text);let c=0;for(let u of o.text)c++;this._panel.webview.postMessage({type:"clipboardWriteResult",id:o.id,requestId:o.requestId,success:!0,characters:c,lines:o.text.split(/\r?\n/).length})}catch{this._panel.webview.postMessage({type:"clipboardWriteResult",id:o.id,requestId:o.requestId,success:!1,error:w.l10n.t("Could not write to the clipboard.")}),w.window.showWarningMessage(w.l10n.t("Could not write to the clipboard."))}break;case"exportText":{if(typeof o.text!="string"||o.text.length>32*1024*1024)break;let c=await w.window.showSaveDialog({filters:{Text:["txt"]},defaultUri:w.Uri.file(Y.join(w.workspace.workspaceFolders?.[0]?.uri.fsPath||K.homedir(),"terminal-grid-history.txt"))});if(c)try{await w.workspace.fs.writeFile(c,Buffer.from(o.text,"utf8"))}catch{w.window.showWarningMessage(w.l10n.t("Could not save terminal history."))}break}case"pasteRequest":{let c=this._terminals[o.id];if(!c)break;try{let u=await w.env.clipboard.readText();!this._disposed&&c===this._terminals[o.id]&&this._panel.webview.postMessage({type:"pasteText",id:o.id,text:u,requestId:o.requestId})}catch{this._panel.webview.postMessage({type:"pasteText",id:o.id,text:"",requestId:o.requestId,error:w.l10n.t("Could not read the clipboard.")}),w.window.showWarningMessage(w.l10n.t("Could not read the clipboard."))}break}case"pasteImage":{let c=typeof o.data=="string"&&o.data.length<=33554432?o.data.match(/^data:image\/(png|jpeg|webp|gif);base64,([A-Za-z0-9+/=]+)$/):null;if(c&&this._terminals[o.id]){let u=c[1]==="jpeg"?"jpg":c[1],m=Y.join(K.tmpdir(),`tg-paste-${(0,ot.randomUUID)()}.${u}`);try{Z.writeFileSync(m,Buffer.from(c[2],"base64"),{flag:"wx",mode:384}),this._pasteImages.push(m);let v=/\s/.test(m)?`"${m}"`:m;this._panel.webview.postMessage({type:"pasteText",id:o.id,text:v,requestId:o.requestId})}catch{this._panel.webview.postMessage({type:"pasteText",id:o.id,text:"",requestId:o.requestId,error:w.l10n.t("Could not paste the clipboard image.")}),w.window.showWarningMessage(w.l10n.t("Could not paste the clipboard image."))}}else this._panel.webview.postMessage({type:"pasteText",id:o.id,text:"",requestId:o.requestId,error:w.l10n.t("Could not paste the clipboard image.")});break}case"resize":try{if(!Number.isInteger(o.cols)||!Number.isInteger(o.rows)||o.cols<2||o.rows<1||o.cols>4e3||o.rows>500)break;this._cellDimensions[o.id]={cols:o.cols,rows:o.rows},this._terminals[o.id]?.pty.resize(o.cols,o.rows)}catch{}break;case"clearTerminal":this._panel.webview.postMessage({type:"clear",id:o.id});break;case"killTerminal":try{this._terminals[o.id]?.pty.kill()}catch{}break;case"restartTerminal":this._restartTerminal(o.id);break;case"renameCell":{let c=f.getCellLabels(this._tabId),u=c[o.id]||"",m=await w.window.showInputBox({prompt:w.l10n.t("Rename cell {0}",o.id+1),value:u,placeHolder:w.l10n.t("Enter alias (empty to reset)")});m!==void 0&&(c[o.id]=m,await f.setCellLabels(this._tabId,c),this.sendLabels(),w.commands.executeCommand("terminalGrid._refreshSidebar"));break}}}),this._configListener=w.workspace.onDidChangeConfiguration(o=>{if(o.affectsConfiguration("terminalGrid")){let p=w.workspace.getConfiguration("terminalGrid"),c=p.get("colorTheme","");this._panel.webview.postMessage({type:"configUpdate",zoom:p.get("zoomPercent",100),scrollback:p.get("scrollback",2e4),fontFamily:p.get("fontFamily",""),bgColor:p.get("backgroundColor",""),fgColor:p.get("foregroundColor",""),themeName:c,themeColors:U(c)})}}),this._panel.onDidDispose(()=>this.dispose()),this._panel.onDidChangeViewState(o=>{if(!this._disposed)if(this._panel.webview.postMessage({type:"viewVisibility",visible:o.webviewPanel.visible}),o.webviewPanel.active)C.setActive(this._tabId),w.commands.executeCommand("terminalGrid._refreshSidebar");else{this._panel.webview.postMessage({type:"endSelectionDrag"});for(let p of this._outputFlows.values())p.flow.selectionPaused(!1)}}),this._panel.iconPath=w.Uri.joinPath(t.extensionUri,"images","sidebar.svg")}static{this._mcpEnvironment={}}static setMcpEnvironment(e,t){n._mcpEnvironment={TERMINAL_GRID_WINDOW_ID:e,TERMINAL_GRID_PORT:String(t)}}static get currentPanel(){return C.getActive()}static{this.OUTPUT_BUFFER_SIZE=5e4}static _getLog(){return n._log||(n._log=w.window.createOutputChannel("Terminal Grid")),n._log}static _getNodePty(){if(n._nodePty===void 0)try{n._nodePty=require("node-pty")}catch{n._nodePty=null}return n._nodePty}static getAvailableShells(){let e=[{name:"IDE Default",path:"",args:[]}];try{let a=function(c){try{if(/[/\\]/.test(c))return r.existsSync(c);let u=process.platform==="win32"?`where ${c}`:`which ${c}`;return s.execSync(u,{stdio:"ignore",timeout:500}),!0}catch{return!1}};var t=a;let r=require("fs"),s=require("child_process"),i=new Set,l=process.platform==="win32"?"windows":process.platform==="darwin"?"osx":"linux",o=w.workspace.getConfiguration(`terminal.integrated.profiles.${l}`);if(o)for(let c of Object.keys(o))try{let u=o.get(c);if(!u||typeof u!="object")continue;let m=Array.isArray(u.path)?u.path[0]:u.path;m&&a(m)&&(e.push({name:c,path:m,args:u.args||[]}),i.add(m.toLowerCase()))}catch{}let p=process.platform==="win32"?[{name:"PowerShell",path:"powershell.exe",args:["-NoLogo"]},{name:"PowerShell 7",path:"pwsh.exe",args:["-NoLogo"]},{name:"Command Prompt",path:"cmd.exe",args:[]},{name:"Git Bash",path:"C:\\Program Files\\Git\\bin\\bash.exe",args:["--login"]},{name:"WSL",path:"wsl.exe",args:[]}]:[{name:"Bash",path:"/bin/bash",args:["--login"]},{name:"Zsh",path:"/bin/zsh",args:["--login"]},{name:"Fish",path:"/usr/bin/fish",args:[]},{name:"sh",path:"/bin/sh",args:[]}];for(let c of p)!i.has(c.path.toLowerCase())&&a(c.path)&&(e.push(c),i.add(c.path.toLowerCase()))}catch{}return e}_resolveShell(e){if(!e)return process.platform==="win32"?n._getNodePty()?{path:"powershell.exe",args:["-NoLogo","-NoProfile"]}:{path:process.env.COMSPEC||"cmd.exe",args:[]}:{path:process.env.SHELL||"bash",args:[]};let r=n.getAvailableShells().find(i=>i.path===e||i.name===e);if(r&&r.path)return{path:r.path,args:r.args};let s=e.toLowerCase();return s.includes("powershell")||s.includes("pwsh")?{path:e,args:["-NoLogo"]}:s.includes("bash")||s.includes("zsh")?{path:e,args:["--login"]}:{path:e,args:[]}}static createOrShow(e,t,r,s){let i=s?.forceNewTab?null:C.getActive(),a,l,o;if(i){o=i.getTabId(),a=s?.tabIdOverride??o;let u=i.getRows()*i.getCols()===t*r;l=s?.cellIdsOverride??(u?i.getCellIds():A.allocate(e,t*r))}else{if(s?.tabIdOverride!==void 0)a=s.tabIdOverride;else{let u=e.workspaceState.get("pendingFirstTabId");u!=null?(a=u,e.workspaceState.update("pendingFirstTabId",void 0)):s?.forceNewTab?a=O.next(e):a=0}l=s?.cellIdsOverride??A.allocate(e,t*r)}O.reserve(e,a),A.reserve(e,l);let p=w.window.createWebviewPanel("terminalGrid",w.l10n.t("Terminal Grid {0}\xD7{1}",t,r),{viewColumn:w.ViewColumn.One,preserveFocus:s?.preserveFocus},{enableScripts:!0,retainContextWhenHidden:!0,localResourceRoots:[w.Uri.joinPath(e.extensionUri,"media")]}),c=new n(p,e,t,r,a,l);return i&&o!==void 0?(C.replace(o,a,c),i.dispose()):C.register(a,c,s?.positionOverride),n._persistTabs(e),a}static revive(e,t,r,s,i,a){let l;if(i===void 0){let u=C.getActive();if(u){let m=u.getTabId(),v=C.entries().findIndex(([h])=>h===m);v>=0&&(l=v),u.dispose()}}let o=i??O.next(t);O.reserve(t,o);let p=a??A.allocate(t,r*s);A.reserve(t,p);let c=new n(e,t,r,s,o,p);C.register(o,c,l),n._persistTabs(t),w.commands.executeCommand("terminalGrid._refreshSidebar")}static persistTabs(e){n._persistTabs(e)}static _persistTabs(e){let t=C.entries().map(([r,s])=>({tabId:r,rows:s.getRows(),cols:s.getCols(),cellIds:s.getCellIds()}));if(f.setLastTabs(t),t.length>0){let r=t[t.length-1];e.workspaceState.update("lastGrid",{rows:r.rows,cols:r.cols})}}static _formatTitle(e,t,r,s){let i=w.workspace.workspaceFolders?.[0]?.name,a=w.l10n.t("Terminal Grid {0}\xD7{1}",e,t),l=s&&s.length>0?s:w.l10n.t("Tab {0}",r+1);return i?`${i} \u2014 ${a} \xB7 ${l}`:`${a} \xB7 ${l}`}_enterSeq(e){return this._csiUMode[e]?lt:this._insideLlm[e]?"\r":this._terminals[e]?.pty.enter||"\r"}broadcastInput(e){for(let t of this._terminals)this._hiddenCells.has(t.id)||this.deliverToCell(t.id,e,!0).then(r=>this._showDeliveryFailure(r))}sendToCell(e,t){let r=this._terminals[e];return!r||this._hiddenCells.has(e)||r.pty.status?.state==="exited"?!1:(this.deliverToCell(e,t,!1).then(s=>this._showDeliveryFailure(s)),!0)}sendInputToCell(e,t){let r=this._terminals[e];return!r||this._hiddenCells.has(e)||r.pty.status?.state==="exited"?!1:(this.deliverToCell(e,t,!0).then(s=>this._showDeliveryFailure(s)),!0)}_showDeliveryFailure(e){!e.success&&!this._disposed&&w.window.showWarningMessage(e.error||"Terminal input failed")}getCellStatuses(){return this._terminals.map(e=>this._hiddenCells.has(e.id)?{state:"exited",error:"Cell is merged into another cell"}:{...e.pty.status??{state:"running"}})}async deliverToCell(e,t,r){let s=this._terminals[e]?.pty,i=this._startupRuns.get(e),a=this._startupPending?.has(e)||i&&!i.paused;if(!s||this._hiddenCells.has(e)||s.status?.state==="exited"||this._disposed||a)return{success:!1,delivery:"failed",characters:t.length,submitted:!1,completedAt:new Date().toISOString(),error:a?"Startup commands are still running; wait or stop startup before sending input":"Cell is unavailable or its process has exited"};i?.paused&&(this._stepGeneration[e]++,this._startupRuns.delete(e),this._setStartupStatus(e,"",!1));let l=this._commandQueues.get(e);return l||(l=new ye,this._commandQueues.set(e,l)),l.enqueue(t.length,r,async o=>{if(o(),this._terminals[e]?.pty!==s||s.status?.state==="exited")throw new Error("Cell process changed");this._userInputVersion[e]=(this._userInputVersion[e]||0)+1;let p=st(t,{submit:r,bracketedPaste:this._bracketedPaste[e]||!1,enter:this._enterSeq(e)});s.writeAsync?await s.writeAsync(p):s.write(p),o(),r&&rt(t)&&(this._insideLlm[e]=!0),r&&t.trim()==="exit"&&(this._insideLlm[e]=!1)})}async readCellSnapshot(e,t={}){if(!this._terminals[e]||this._hiddenCells.has(e))return null;let r=this.getCellStatuses()[e];if(t.mode==="history")return Ce({lines:n._stripAnsi(this._outputBuffers[e]||"").split(`
`),mode:"history",requestedLines:t.lines,droppedCharacters:this._droppedOutput[e],lastOutputAt:this._lastByteTs[e],state:r});if(t.lines===0)return Ce({lines:[],mode:"screen",lastOutputAt:this._lastByteTs[e],state:r});let s=await this._requestSnapshot(e,this._stepGeneration[e]);if(!s)throw new Error("Current screen is unavailable while the view is loading or a selection is being dragged. Retry, or request mode: history.");return Ce({lines:s.lines,mode:"screen",requestedLines:t.lines,lastOutputAt:this._lastByteTs[e],state:r,cursor:{x:s.cursorX,y:s.cursorY}})}static _stripAnsi(e){return e.replace(/\x1b\[[0-9;?]*[a-zA-Z]/g,"").replace(/\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)/g,"").replace(/\x1b[()][0-9A-Z]/g,"").replace(/\x1b[78DEHM]/g,"").replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g,"").replace(/\r\n/g,`
`).replace(/\r/g,`
`).replace(/\n{3,}/g,`

`)}readCell(e,t){if(this._hiddenCells.has(e))return null;let r=this._outputBuffers[e];if(r===void 0)return null;let s=n._stripAnsi(r);return t===void 0?s:t<=0?"":s.split(`
`).slice(-t).join(`
`)}getCellCount(){return this._terminals.length}getRows(){return this._rows}getCols(){return this._cols}getCellLabels(){let e=f.getCellLabels(this._tabId),t=this._rows*this._cols;return Array.from({length:t},(r,s)=>e[s]||String(s+1))}sendCellConfig(e,t,r,s,i,a){this._panel.webview.postMessage({type:"cellConfig",id:e,bgColor:t,fgColor:r,fontFamily:s,themeName:i??"",themeColors:a??null})}clearCellOverrides(){this._panel.webview.postMessage({type:"clearCellOverrides"})}sendLabels(){let e=f.getCellLabels(this._tabId);this._panel.webview.postMessage({type:"setLabels",labels:e})}loadCustomFonts(e){for(let t of e){let r=this._readFontBase64(t.path);if(r){let s=Y.extname(t.path).toLowerCase();this._panel.webview.postMessage({type:"loadFont",name:t.name,data:r,format:at[s]||"truetype"})}}}getTabId(){return this._tabId}getCellIds(){return this._cellIds.slice()}getHiddenCellIds(){return[...this._hiddenCells].map(e=>this._cellIds[e])}reveal(){this._panel.reveal(this._panel.viewColumn??w.ViewColumn.One)}refreshTitle(){if(this._disposed)return;let e=C.entries(),t=e.findIndex(([i])=>i===this._tabId),r=t>=0?t:e.length,s=f.getTabName(this._tabId);this._panel.title=n._formatTitle(this._rows,this._cols,r,s)}_readFontBase64(e){try{return Z.readFileSync(e).toString("base64")}catch{return null}}_spawnPty(e,t,r,s,i){try{return this._spawnPtyProcess(e,t,r,s,i)}catch(a){let l={state:"exited",error:a instanceof Error?a.message:String(a)};return{status:l,onData(){},write(){},resize(){},kill(){},onExit:o=>o(l),writeAsync:async()=>{throw new Error(l.error)}}}}_spawnPtyProcess(e,t,r,s,i){let a=this._resolveShell(i),l={...process.env,...n._mcpEnvironment},o={state:"running"},p=new Set,c=(g={})=>{if(o.state!=="exited"){Object.assign(o,g,{state:"exited"});for(let y of p)y({...o})}},u=g=>{p.add(g),o.state==="exited"&&g({...o})};if(e){let g=e.spawn(a.path,a.args,{name:"xterm-256color",cols:t,rows:r,cwd:s,env:l}),y=new re(_=>g.write(_),_=>c({error:String(_)}));return g.onExit(_=>{y.dispose(),c({exitCode:_.exitCode,signal:_.signal})}),{status:o,onExit:u,onData:_=>{g.onData(_)},write:_=>y.write(_),writeAsync:(_,x)=>y.writeAsync(_,x),cancelInput:_=>y.cancel("Input cancelled",_),resize:(_,x)=>g.resize(_,x),pause:()=>{g.pause()},resume:()=>{g.resume()},kill:()=>{y.dispose(),c(),g.kill()}}}let{spawn:m}=require("child_process"),v=m(a.path,a.args,{cwd:s,env:l,windowsHide:!0}),h=new re(g=>{if(!v.stdin?.writable)throw new Error("Shell input is closed");if(v.stdin.writableLength>8*1024*1024)throw new Error("Shell input is not draining; input cancelled");v.stdin.write(g)},g=>c({error:String(g)}));return v.on("exit",(g,y)=>{h.dispose(),c({exitCode:g??void 0,signal:y??void 0})}),v.on("error",g=>{h.dispose(),c({error:g.message})}),v.stdin?.on("error",g=>{h.dispose(),c({error:g.message})}),{status:o,onExit:u,enter:process.platform==="win32"?`\r
`:`
`,onData:g=>{v.stdout?.on("data",y=>g(y.toString())),v.stderr?.on("data",y=>g(y.toString()))},write:g=>h.write(g),writeAsync:(g,y)=>h.writeAsync(g,y),cancelInput:g=>h.cancel("Input cancelled",g),resize:()=>{},pause:()=>{v.stdout?.pause(),v.stderr?.pause()},resume:()=>{v.stdout?.resume(),v.stderr?.resume()},kill:()=>{h.dispose(),c(),v.kill()}}}_createTerminals(e,t){let r=w.workspace.workspaceFolders?.[0]?.uri.fsPath||process.env.USERPROFILE||process.env.HOME||".",s=this._rows*this._cols,i=n._getNodePty();i||w.window.showWarningMessage(w.l10n.t("node-pty not available. Falling back to basic shell (limited features)."));let a=f.getStartupCommands(this._tabId),l=[];for(let h of a)if(typeof h=="string")l.push(h);else if(h&&typeof h=="object"&&"command"in h){let g=h;for(let y=0;y<(g.count||1);y++)l.push(g.command)}let o=f.getDefaultCommand(this._tabId),p=f.getDefaultSteps(this._tabId),c=e||80,u=t||24,m=w.workspace.getConfiguration("terminalGrid").get("shellType",""),v=f.getCellOverrides(this._tabId);for(let h=0;h<s;h++){if(this._hiddenCells.has(h)){let I={status:{state:"exited"},onData(){},write(){},resize(){},kill(){}};this._terminals.push({id:h,pty:I}),this._cellShellType[h]="",this._resetCellState(h,!0);continue}let g=v[h]?.shellType||m||"",y=this._spawnPty(i,c,u,r,g||void 0),_=h,x=it(v,l,p,o,h);this._cellShellType[_]=g,this._resetCellState(_),x.length&&this._startupPending.add(_),y.onData(I=>{this._terminals[_]?.pty===y&&this._handlePtyData(_,I,x)}),this._terminals.push({id:h,pty:y}),this._cellDimensions[_]={cols:c,rows:u},this._watchTerminal(_,y)}this.sendLabels()}_restartTerminal(e){let t=this._terminals[e];if(!t||this._hiddenCells.has(e))return;try{t.pty.kill()}catch{}this._panel.webview.postMessage({type:"reset",id:e});let r=w.workspace.workspaceFolders?.[0]?.uri.fsPath||process.env.USERPROFILE||process.env.HOME||".",s=w.workspace.getConfiguration("terminalGrid").get("shellType",""),i=f.getCellOverrides(this._tabId),a=i[e]?.shellType||s||"",l=this._cellDimensions[e]||{cols:80,rows:24},o=this._spawnPty(n._getNodePty(),l.cols,l.rows,r,a||void 0),p=f.getStartupCommands(this._tabId),c=[];for(let h of p)if(typeof h=="string")c.push(h);else if(h&&typeof h=="object"&&"command"in h){let g=h;for(let y=0;y<(g.count||1);y++)c.push(g.command)}let u=f.getDefaultCommand(this._tabId),m=f.getDefaultSteps(this._tabId),v=it(i,c,m,u,e);this._cellShellType[e]=a,this._resetCellState(e),v.length&&this._startupPending.add(e),o.onData(h=>{this._terminals[e]?.pty===o&&this._handlePtyData(e,h,v)}),this._terminals[e]={id:e,pty:o},this._watchTerminal(e,o)}_watchTerminal(e,t){let r=++this._outputEpoch,s=new xe({post:(i,a)=>{this._panel.webview.postMessage({type:"output",id:e,data:i,outputSequence:a,outputEpoch:r})},pause:()=>{try{t.pause?.()}catch{}},resume:()=>{try{t.resume?.()}catch{}}});this._outputFlows.set(e,{epoch:r,flow:s}),t.onExit?.(i=>{this._terminals[e]?.pty!==t||this._disposed||(this._commandQueues.get(e)?.dispose("Cell process exited"),this._stepGeneration[e]++,this._startupRuns.delete(e),this._setStartupStatus(e,"",!1),this._startupPending.delete(e),this._panel.webview.postMessage({type:"cellStatus",id:e,status:i}))})}_cancelCellInput(e,t){this._commandQueues.get(e)?.dispose("Input cancelled"),this._commandQueues.delete(e),this._stepGeneration[e]=(this._stepGeneration[e]||0)+1,this._startupRuns.delete(e),this._setStartupStatus(e,"",!1),this._startupPending?.delete(e),this._startupSent[e]=!0;let r=this._terminals[e]?.pty;r?.cancelInput?r.cancelInput(t):t&&r?.write("")}_chunkedWrite(e,t){e.write(t)}_screen(e){let t=this._outputBuffers[e]||"";return n._stripAnsi(t.slice(Math.min(this._stepWatermark[e]||0,t.length)))}_requestSnapshot(e,t){return this._outputFlows?.get(e)?.flow.pendingCharacters||this._disposed||this._stepGeneration[e]!==t?Promise.resolve(null):new Promise(r=>{let s=++this._snapshotSequence,i=l=>{clearTimeout(a),this._snapshotRequests.delete(s),r(l)},a=setTimeout(()=>i(null),1500);this._snapshotRequests.set(s,{cellId:e,generation:t,finish:i}),Promise.resolve(this._panel.webview.postMessage({type:"startupSnapshotRequest",id:e,requestId:s,generation:t})).catch(()=>i(null))})}_receiveSnapshot(e){let t=this._snapshotRequests.get(e.requestId);if(!t||t.cellId!==e.id||t.generation!==e.generation)return;let r=e.snapshot,s=et(r);t.finish(s&&!this._disposed&&!this._outputFlows?.get(e.id)?.flow.pendingCharacters&&this._stepGeneration[e.id]===t.generation?r:null)}_setStartupStatus(e,t,r){let s=this._stepGeneration[e],i=JSON.stringify([t,r,s]);this._startupLastStatus.get(e)!==i&&(this._startupLastStatus.set(e,i),this._panel.webview.postMessage({type:"startupStatus",id:e,text:t,retry:r,generation:s,retryLabel:w.l10n.t("Check again"),cancelLabel:w.l10n.t("Cancel startup")}))}_readinessText(e){switch(e){case"picker":return w.l10n.t("Select a session in the terminal to continue.");case"trust":return w.l10n.t("Waiting for folder trust confirmation.");case"blocked":return w.l10n.t("Complete login or confirmation in the terminal.");case"busy":return w.l10n.t("Waiting for the CLI to finish its current operation.");case"occupied":return w.l10n.t("The input contains text. Clear or submit it before continuing.");case"ready":return w.l10n.t("Checking that the input is ready\u2026");default:return w.l10n.t("Waiting for the CLI input to appear\u2026")}}async _settle(e,t){let r=Date.now();for(;Date.now()<t&&!this._disposed;){if(Date.now()-(this._lastByteTs[e]||0)>=Ft||Date.now()-r>=Bt)return;await J(De)}}async _waitForReady(e,t,r){let s=w.workspace.getConfiguration("terminalGrid").get("startupReadyTimeout",60),i=Date.now()+Math.max(5,Math.min(300,s))*1e3,a=new we,l="",o="starting",p=this._userInputVersion[e];for(;Date.now()<i&&!this._disposed&&this._stepGeneration[e]===r;){let c=this._userInputVersion[e];c!==p&&a.observe({lines:[],cursorX:0,cursorY:0}),p=c;let u=await this._requestSnapshot(e,r);if(this._disposed||this._stepGeneration[e]!==r)return!1;if(u){let m=a.observe(u);if(o=m.state,this._setStartupStatus(e,this._readinessText(o),!1),o==="trust"&&t){let v=u.lines.slice(Math.max(0,u.cursorY-8)).join(`
`),h=Gt.find(g=>g.test.test(v));h&&v!==l&&c===this._userInputVersion[e]&&(l=v,this._terminals[e]?.pty.write(h.accept(this._csiUMode[e])))}if(c!==this._userInputVersion[e])a.observe({lines:[],cursorX:0,cursorY:0});else if(m.ready)return!0}else a.observe({lines:[],cursorX:0,cursorY:0});await J(De)}return!this._disposed&&this._stepGeneration[e]===r&&this._setStartupStatus(e,w.l10n.t("Startup paused: {0}",this._readinessText(o)),!0),!1}async _typeAndConfirm(e,t,r){let s=this._terminals[e]?.pty,i=this._userInputVersion[e],a=()=>!this._disposed&&this._stepGeneration[e]===r&&this._terminals[e]?.pty===s&&this._userInputVersion[e]===i;if(!s||/[\r\n]/.test(t))return!1;let l=await this._requestSnapshot(e,r);if(!a()||!l||ie(l)!=="ready")return!1;for(let p of t){if(!a())return!1;s.write(p),await J(20)}let o=Date.now()+2500;for(;Date.now()<o&&a();){let p=await this._requestSnapshot(e,r);if(!a())return!1;if(p){let u=(p.lines[p.cursorY]||"").match(/^\s*[│┃]?\s*(?:[›❯>]|aider>)\s?/);if(tt(p,t)){let m=ie(p);if(!["trust","blocked","picker","busy"].includes(m))return s.write(this._enterSeq(e)),!0}}await J(De)}return!1}async _executeSteps(e,t,r){let s=this._stepGeneration[e]=(this._stepGeneration[e]||0)+1,i={steps:Je(t),index:0,insideLlm:!1,generation:s,paused:!1};this._startupRuns.set(e,i),await this._settle(e,Date.now()+3e3),await this._runStartup(e,i)}async _runStartup(e,t){let r=()=>!this._disposed&&this._stepGeneration[e]===t.generation,s=w.workspace.getConfiguration("terminalGrid").get("autoAcceptTrust",!0);try{for(;t.index<t.steps.length&&r();){let i=t.steps[t.index];if(i.type==="timeout")this._setStartupStatus(e,w.l10n.t("Waiting {0} ms\u2026",i.ms),!1),await J(i.ms);else{if(t.insideLlm){if(!await this._waitForReady(e,s,t.generation)){t.paused=r();return}if(!r())return;if(!await this._typeAndConfirm(e,i.input,t.generation)){r()&&(this._startupRuns.delete(e),this._setStartupStatus(e,w.l10n.t("Startup stopped: check the terminal input. No automatic retry was sent."),!1));return}}else{if(t.index>0&&t.steps[t.index-1].type==="command"&&await J(At),!r())return;this._stepWatermark[e]=(this._outputBuffers[e]||"").length,this._terminals[e]?.pty.write(i.input+this._enterSeq(e))}rt(i.input)&&(t.insideLlm=!0),i.input.trim()==="exit"&&(t.insideLlm=!1),this._insideLlm[e]=t.insideLlm}t.index++}r()&&(this._startupRuns.delete(e),this._setStartupStatus(e,"",!1))}catch(i){r()&&(this._startupRuns.delete(e),this._setStartupStatus(e,w.l10n.t("Startup stopped: check the terminal input. No automatic retry was sent."),!1),n._getLog().appendLine(`[startup] cell ${e+1}: ${String(i)}`))}}_resetCellState(e,t=!1){this._startupPending?.delete(e),this._commandQueues?.get(e)?.dispose("Cell restarted"),this._commandQueues?.delete(e),this._outputFlows?.get(e)?.flow.dispose(),this._outputFlows?.delete(e),this._droppedOutput??=[],this._droppedOutput[e]=0,this._bracketedPaste??=[],this._bracketedPaste[e]=!1,this._stepGeneration[e]=(this._stepGeneration[e]||0)+1,this._startupRuns?.delete(e),this._startupLastStatus?.delete(e),this._userInputVersion[e]=0;for(let r of this._snapshotRequests?.values()||[])r.cellId===e&&r.finish(null);this._controlTail[e]="",this._insideLlm[e]=!1,this._csiUMode[e]=!1,this._altScreen[e]=!1,this._altDwellStart[e]=0,this._lastByteTs[e]=0,this._outputBuffers[e]="",this._stepWatermark[e]=0,this._startupSent[e]=t}_handlePtyData(e,t,r){if(this._disposed)return;let s=this._outputBuffers[e]||"",i=this._controlTail[e]||"",a=i+t;for(let c of a.matchAll(/\x1b\[(?:[>=]\d+(?:;\d+)*u|<\d*u|\?(?:1049|2004)[hl]|[23]J)/g)){let u=c[0];/\[[>=]/.test(u)?this._csiUMode[e]=!/^\x1b\[[>=]0(?:;|u)/.test(u):u.includes("<")?this._csiUMode[e]=!1:u.includes("2004")?(this._bracketedPaste??=[],this._bracketedPaste[e]=u.endsWith("h")):(u==="\x1B[?1049h"&&(this._altScreen[e]=!0,this._altDwellStart[e]=Date.now()),u==="\x1B[?1049l"&&(this._altScreen[e]=!1),this._stepWatermark[e]=s.length-i.length+c.index+u.length)}this._controlTail[e]=a.match(/\x1b(?:\[[0-9;?<=>]*)?$/)?.[0].slice(-64)||"",this._lastByteTs[e]=Date.now();let l=s+t,o=Math.max(0,l.length-n.OUTPUT_BUFFER_SIZE);this._droppedOutput??=[],this._droppedOutput[e]=(this._droppedOutput[e]||0)+o,this._outputBuffers[e]=l.slice(o),this._stepWatermark[e]=Math.max(0,(this._stepWatermark[e]||0)-o);let p=this._outputFlows?.get(e);p?p.flow.enqueue(t):this._panel.webview.postMessage({type:"output",id:e,data:t}),!this._startupSent[e]&&r.length>0&&(this._startupPending?.delete(e),this._startupSent[e]=!0,this._executeSteps(e,r,this._cellShellType[e]||""))}restartCell(e){this._restartTerminal(e)}restartAllCells(){for(let e of this._terminals)this._restartTerminal(e.id)}dispose(e=!1){if(this._disposed)return;this._disposed=!0;for(let r of this._commandQueues.values())r.dispose("Panel closed");for(let r of this._outputFlows.values())r.flow.dispose();this._commandQueues.clear(),this._outputFlows.clear();for(let r of this._snapshotRequests.values())r.finish(null);this._startupRuns.clear(),this._startupPending?.clear(),this._registryListener?.dispose(),C.unregister(this._tabId,this),this._configListener?.dispose();for(let r of this._terminals)try{r.pty.kill()}catch{}this._terminals=[];for(let r of this._pasteImages)try{Z.unlinkSync(r)}catch{}if(this._pasteImages=[],this._panel.dispose(),e)return;C.size()===0?(this._context.workspaceState.update("lastGrid",void 0),f.setLastTabs([])):n._persistTabs(this._context);let t=C.getActive();t&&(t.reveal(),w.commands.executeCommand("terminalGrid._refreshSidebar"))}_buildCustomFontCss(){let e=this._context.globalState.get("customFonts",[]),t="";for(let r of e){let s=this._readFontBase64(r.path);if(!s)continue;let i=Y.extname(r.path).toLowerCase(),a=at[i]||"truetype";t+=`@font-face { font-family: '${r.name}'; src: url(data:font/${i.slice(1)};base64,${s}) format('${a}'); font-display: swap; }
`}return t}_getHtml(){let e=this._panel.webview,t=e.asWebviewUri(w.Uri.joinPath(this._context.extensionUri,"media","gridTerminal.js")),r=e.asWebviewUri(w.Uri.joinPath(this._context.extensionUri,"media","xterm.css")),s=$t(),i=this._buildCustomFontCss();return`<!DOCTYPE html>
<html lang="${w.env.language}">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'none';
                 style-src ${e.cspSource} 'unsafe-inline';
                 script-src 'nonce-${s}';
                 font-src ${e.cspSource} data:;">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="${r}">
  <style>
    ${i}
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
    .cell-startup {
      position: absolute; top: 6px; left: 8px; right: 80px; z-index: 3;
      display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
      padding: 5px 8px; border-radius: 4px; font-size: 11px;
      background: var(--vscode-editorWidget-background, #252526);
      color: var(--vscode-editorWidget-foreground, #ddd);
      border: 1px solid var(--vscode-widget-border, #555);
    }
    .cell-startup[hidden], .cell-startup button[hidden] { display: none; }
    .cell-startup button {
      padding: 2px 5px; cursor: pointer; color: var(--vscode-button-foreground, white);
      background: var(--vscode-button-background, #007acc); border: 0; border-radius: 3px;
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
    .cell-copy-retained {
      position: absolute; bottom: 6px; right: 16px; z-index: 4;
      padding: 4px 8px; border-radius: 4px; cursor: pointer;
      color: var(--vscode-button-foreground, white);
      background: var(--vscode-button-background, #007acc);
      border: 1px solid var(--vscode-contrastBorder, transparent);
    }
    .cell-copy-retained[hidden] { display: none; }
    .cell-notice { position: absolute; bottom: 5px; left: 6px; z-index: 4; max-width: 65%; max-height: 60px; overflow: auto; font-size: 11px;
      background: var(--vscode-editor-background, #1e1e1e); border-radius: 3px; }
    .cell-notice span:not(:empty) { display: inline-block; padding: 3px 5px; }
    .cell-notice button { color: var(--vscode-button-foreground, white); background: var(--vscode-button-background, #007acc);
      border: 0; border-radius: 3px; cursor: pointer; padding: 3px 5px; }
    .cell-notice button[hidden] { display: none; }
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
<body lang="${w.env.language}">
  <div id="grid"></div>
  <div class="ctx-menu" id="ctxMenu">
    <div class="ctx-menu-item" data-action="copy">${w.l10n.t("Copy")}</div>
    <div class="ctx-menu-item" data-action="copyPlain">${w.l10n.t("Copy (Plain)")}</div>
    <div class="ctx-menu-item" data-action="paste">${w.l10n.t("Paste")}</div>
    <div class="ctx-menu-item" data-action="preview">${w.l10n.t("Preview selection")}</div>
    <div class="ctx-menu-item" data-action="history">${w.l10n.t("Search / save history")}</div>
    <div class="ctx-menu-sep"></div>
    <div class="ctx-menu-item" data-action="clear">${w.l10n.t("Clear")}</div>
    <div class="ctx-menu-item" data-action="restart">${w.l10n.t("Restart")}</div>
    <div class="ctx-menu-item" data-action="kill">${w.l10n.t("Kill")}</div>
    <div class="ctx-menu-sep"></div>
    <div class="ctx-menu-item" data-action="rename">${w.l10n.t("Rename")}</div>
  </div>
  <script nonce="${s}">
    var __GRID_ROWS = ${this._rows};
    var __GRID_COLS = ${this._cols};
    var __GRID_TAB_ID = ${this._tabId};
    var __GRID_CELL_IDS = ${JSON.stringify(this._cellIds)};
    var __GRID_LABELS = ${JSON.stringify(Object.fromEntries(["Cancel paste","Reading clipboard\u2026","Clipboard timed out. Paste again.","Paste cancelled","Copying\u2026","Copied","characters","lines","Copy failed. Selection kept; try again.","Paste sent","Pasting\u2026","Process exited"].map(a=>[a,w.l10n.t(a)])))};
    var __GRID_ZOOM = ${w.workspace.getConfiguration("terminalGrid").get("zoomPercent",100)};
    var __GRID_SCROLLBACK = ${w.workspace.getConfiguration("terminalGrid").get("scrollback",2e4)};
    var __GRID_COPY_RETAINED = ${JSON.stringify(w.l10n.t("Copy saved selection"))};
    var __GRID_FONT_FAMILY = ${JSON.stringify(w.workspace.getConfiguration("terminalGrid").get("fontFamily",""))};
    var __GRID_BG_COLOR = ${JSON.stringify(w.workspace.getConfiguration("terminalGrid").get("backgroundColor",""))};
    var __GRID_FG_COLOR = ${JSON.stringify(w.workspace.getConfiguration("terminalGrid").get("foregroundColor",""))};
    var __GRID_THEME = ${JSON.stringify(w.workspace.getConfiguration("terminalGrid").get("colorTheme",""))};
    var __GRID_THEME_COLORS = ${JSON.stringify(U(w.workspace.getConfiguration("terminalGrid").get("colorTheme","")))};
    var __GRID_MERGE_REGIONS = ${JSON.stringify(f.getMergedRegions(this._tabId).filter(a=>a.startRow+a.rowSpan<=this._rows&&a.startCol+a.colSpan<=this._cols))};
  </script>
  <script nonce="${s}" src="${t}"></script>
</body>
</html>`}};function $t(){let n="",e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";for(let t=0;t<32;t++)n+=e.charAt(Math.floor(Math.random()*e.length));return n}var jt=[".ttf",".otf",".woff",".woff2"];function zt(){try{return require("node-pty"),!0}catch{return!1}}var j=class n{constructor(e){this._mcpPort=0;this._context=e,C.onDidChange(()=>this._scheduleConfigSend())}static{this.viewType="terminalGrid.sidebarView"}_scheduleConfigSend(){this._configSendTimer&&clearTimeout(this._configSendTimer),this._configSendTimer=setTimeout(()=>{this._configSendTimer=void 0,this.sendConfig()},50)}setMcpPort(e){this._mcpPort=e,this._view?.webview.postMessage({type:"mcpPort",port:e})}get _tid(){return C.getActiveTabId()??0}resolveWebviewView(e,t,r){this._view=e,e.webview.options={enableScripts:!0,localResourceRoots:[this._context.extensionUri]},e.webview.html=this._getHtml(),e.webview.onDidReceiveMessage(async s=>{switch(s.type){case"openGrid":await d.commands.executeCommand("terminalGrid.openCustomGrid",s.rows,s.cols);break;case"reload":await d.commands.executeCommand("workbench.action.reloadWindow");break;case"showDiagnostics":await d.commands.executeCommand("terminalGrid.showDiagnostics");break;case"setConfig":{let i=d.workspace.getConfiguration("terminalGrid");s.key&&s.value!==void 0&&await i.update(s.key,s.value,d.ConfigurationTarget.Global),s.key==="shellType"&&T.currentPanel&&T.currentPanel.restartAllCells();break}case"getConfig":{this.sendConfig();break}case"browseFont":{let i=await d.window.showOpenDialog({canSelectMany:!1,filters:{"Font Files":["ttf","otf","woff","woff2"]},title:d.l10n.t("Select Font File")});if(!i||i.length===0)break;let a=i[0].fsPath,l=P.extname(a).toLowerCase();if(!jt.includes(l)){d.window.showWarningMessage(d.l10n.t("Unsupported font format. Use .ttf, .otf, .woff, or .woff2"));break}try{L.accessSync(a,L.constants.R_OK)}catch{d.window.showErrorMessage(d.l10n.t("Cannot read font file."));break}let o=P.basename(a,l),p=this._context.globalState.get("customFonts",[]);p.some(c=>c.path===a)||(p.push({name:o,path:a}),await this._context.globalState.update("customFonts",p)),this.sendConfig(),T.currentPanel&&T.currentPanel.loadCustomFonts([{name:o,path:a}]);break}case"removeFont":{let a=this._context.globalState.get("customFonts",[]).filter(l=>l.name!==s.name);await this._context.globalState.update("customFonts",a),this.sendConfig();break}case"addStartupCommand":{let i=f.getStartupCommands(this._tid);i.push({command:s.command,count:1}),await f.setStartupCommands(this._tid,i),this.sendConfig();break}case"removeStartupCommand":{let i=f.getStartupCommands(this._tid);i.splice(s.index,1),await f.setStartupCommands(this._tid,i),this.sendConfig();break}case"updateCommandCount":{let i=f.getStartupCommands(this._tid);i[s.index]&&(i[s.index].count=Math.max(1,s.count),await f.setStartupCommands(this._tid,i)),this.sendConfig();break}case"addStep":{if(s.launch)try{s.step={type:"command",input:fe(s.launch)}}catch(i){d.window.showWarningMessage(String(i));break}if(s.target==="all"){let i=f.getDefaultSteps(this._tid);i.push(s.step),await f.setDefaultSteps(this._tid,i);let a=i.find(l=>l.type==="command");await f.setDefaultCommand(this._tid,a?.input||"")}else{let i=f.getCellOverrides(this._tid),a=s.target;i[a]||(i[a]={}),Array.isArray(i[a].startupSteps)||(i[a].startupSteps=[]),i[a].startupSteps.push(s.step);let l=i[a].startupSteps.find(o=>o.type==="command");i[a].startupCommand=l?.input||"",await f.setCellOverrides(this._tid,i)}this.sendConfig();break}case"removeStep":{if(s.target==="all"){let i=f.getDefaultSteps(this._tid);i.splice(s.index,1),await f.setDefaultSteps(this._tid,i);let a=i.find(l=>l.type==="command");await f.setDefaultCommand(this._tid,a?.input||"")}else{let i=f.getCellOverrides(this._tid),a=s.target;if(Array.isArray(i[a]?.startupSteps)){i[a].startupSteps.splice(s.index,1);let l=i[a].startupSteps.find(o=>o.type==="command");i[a].startupCommand=l?.input||"",await f.setCellOverrides(this._tid,i)}}this.sendConfig();break}case"reorderSteps":{if(s.target==="all"){await f.setDefaultSteps(this._tid,s.steps);let i=s.steps.find(a=>a.type==="command");await f.setDefaultCommand(this._tid,i?.input||"")}else{let i=f.getCellOverrides(this._tid),a=s.target;i[a]||(i[a]={}),i[a].startupSteps=s.steps;let l=s.steps.find(o=>o.type==="command");i[a].startupCommand=l?.input||"",await f.setCellOverrides(this._tid,i)}this.sendConfig();break}case"updateStep":{if(s.target==="all"){let i=f.getDefaultSteps(this._tid);s.index>=0&&s.index<i.length&&(i[s.index]=s.step,await f.setDefaultSteps(this._tid,i))}else{let i=f.getCellOverrides(this._tid),a=s.target,l=i[a]?.startupSteps||[];s.index>=0&&s.index<l.length&&(l[s.index]=s.step,i[a]||(i[a]={}),i[a].startupSteps=l,await f.setCellOverrides(this._tid,i))}this.sendConfig();break}case"addProject":{let i=this._context.globalState.get("projects",[]);i.some(a=>a.path===s.path)||(i.push({name:s.name,path:s.path}),await this._context.globalState.update("projects",i)),this.sendConfig();break}case"removeProject":{let i=this._context.globalState.get("projects",[]);i.splice(s.index,1),await this._context.globalState.update("projects",i),this.sendConfig();break}case"openProject":{let i=d.Uri.file(s.path);await d.commands.executeCommand("vscode.openFolder",i,{forceNewWindow:!!s.newWindow});break}case"addCurrentProject":{let i=d.workspace.workspaceFolders?.[0];if(!i){d.window.showWarningMessage(d.l10n.t("No workspace folder open."));break}let a=this._context.globalState.get("projects",[]),l=i.uri.fsPath;a.some(o=>o.path===l)||(a.push({name:i.name,path:l}),await this._context.globalState.update("projects",a)),this.sendConfig();break}case"browseProject":{let i=await d.window.showOpenDialog({canSelectFiles:!1,canSelectFolders:!0,canSelectMany:!1,title:d.l10n.t("Select Project Folder")});if(!i||i.length===0)break;let a=i[0].fsPath,l=P.basename(a),o=this._context.globalState.get("projects",[]);o.some(p=>p.path===a)||(o.push({name:l,path:a}),await this._context.globalState.update("projects",o)),this.sendConfig();break}case"savePreset":{await this._savePreset(s.name),this.sendConfig();break}case"loadPreset":{let a=this._context.globalState.get("presets",[]).find(u=>u.name===s.name);if(!a)break;let l=C.getActiveTabId(),o=l??O.next(this._context),p=l!==void 0?C.entries().findIndex(([u])=>u===l):-1;C.getActive()?.dispose();let c=d.workspace.getConfiguration("terminalGrid");if(await c.update("defaultRows",a.rows,d.ConfigurationTarget.Global),await c.update("defaultCols",a.cols,d.ConfigurationTarget.Global),await c.update("zoomPercent",a.zoomPercent,d.ConfigurationTarget.Global),await c.update("fontFamily",a.fontFamily,d.ConfigurationTarget.Global),await c.update("backgroundColor",a.bgColor,d.ConfigurationTarget.Global),await c.update("foregroundColor",a.fgColor,d.ConfigurationTarget.Global),await c.update("colorTheme",a.colorTheme||"",d.ConfigurationTarget.Global),await c.update("shellType",a.shellType||"",d.ConfigurationTarget.Global),await f.setStartupCommands(o,a.startupCommands||[]),await f.setCellLabels(o,a.cellLabels||[]),await f.setDefaultCommand(o,a.defaultCommand||""),a.defaultSteps?await f.setDefaultSteps(o,a.defaultSteps):a.defaultCommand?await f.setDefaultSteps(o,[{type:"command",input:a.defaultCommand}]):await f.setDefaultSteps(o,[]),a.cellStepsOverrides){let u={};for(let[m,v]of Object.entries(a.cellStepsOverrides))u[Number(m)]={},Array.isArray(v.startupSteps)&&(u[Number(m)].startupSteps=v.startupSteps);await f.setCellOverrides(o,u)}else await f.setCellOverrides(o,{});await f.setMergedRegions(o,a.mergedRegions||[]),T.createOrShow(this._context,a.rows,a.cols,{forceNewTab:!0,tabIdOverride:o,positionOverride:p>=0?p:void 0}),this.sendConfig();break}case"deletePreset":{let a=this._context.globalState.get("presets",[]).filter(o=>o.name!==s.name);await this._context.globalState.update("presets",a);let l=this._context.globalState.get("projectPresets",{});for(let o of Object.keys(l))l[o]===s.name&&delete l[o];await this._context.globalState.update("projectPresets",l),this.sendConfig();break}case"linkPreset":{let i=this._context.globalState.get("projectPresets",{});s.presetName?i[s.projectPath]=s.presetName:delete i[s.projectPath],await this._context.globalState.update("projectPresets",i),this.sendConfig();break}case"broadcast":{T.currentPanel?T.currentPanel.broadcastInput(s.text):d.window.showWarningMessage(d.l10n.t("No terminal grid is open."));break}case"broadcastToCell":{if(T.currentPanel)for(let i of s.cellIds)T.currentPanel.sendInputToCell(i,s.text);else d.window.showWarningMessage(d.l10n.t("No terminal grid is open."));break}case"setCellConfig":{let i=this._tid,a=C.get(i),l={...f.getCellOverrides(i)};if(l[s.cellId]={...l[s.cellId],bgColor:s.bgColor||"",fgColor:s.fgColor||"",fontFamily:s.fontFamily||"",themeName:s.themeName||""},await f.setCellOverrides(i,l),a){let o=s.themeName?U(s.themeName):null;a.sendCellConfig(s.cellId,s.bgColor||"",s.fgColor||"",s.fontFamily||"",s.themeName||"",o)}break}case"setShellForCell":{let i=f.getCellOverrides(this._tid);i[s.cellId]||(i[s.cellId]={}),i[s.cellId].shellType=s.shellType||"",await f.setCellOverrides(this._tid,i),T.currentPanel&&T.currentPanel.restartCell(s.cellId);break}case"setDefaultCommand":{let i=s.command||"";await f.setDefaultCommand(this._tid,i),await f.setDefaultSteps(this._tid,i?[{type:"command",input:i}]:[]),this.sendConfig();break}case"setCellCommand":{let i=f.getCellOverrides(this._tid);i[s.cellId]||(i[s.cellId]={});let a=s.command||"";i[s.cellId].startupCommand=a,i[s.cellId].startupSteps=a?[{type:"command",input:a}]:[],await f.setCellOverrides(this._tid,i),this.sendConfig();break}case"clearAllCellOverrides":{let i=this._tid,a=C.get(i),l=Array.isArray(s.fields)?s.fields.filter(p=>he.includes(p)):he,o=Qe(f.getCellOverrides(i),l);if(await f.setCellOverrides(i,o),a)for(let p=0;p<a.getCellCount();p++){let c=o[p]??{};a.sendCellConfig(p,c.bgColor||"",c.fgColor||"",c.fontFamily||"",c.themeName||"",c.themeName?U(c.themeName):null)}break}case"clearAllCellShells":{let i=f.getCellOverrides(this._tid);for(let a of Object.keys(i))i[parseInt(a)]&&(i[parseInt(a)].shellType="");await f.setCellOverrides(this._tid,i);break}case"saveMergeRegions":{let i=s.regions||[],a=JSON.stringify(f.getMergedRegions(this._tid));await f.setMergedRegions(this._tid,i);let l=typeof s.cols=="number"&&s.cols>0?s.cols:C.getActive()?.getCols()??d.workspace.getConfiguration("terminalGrid").get("defaultCols",3),o=new Set;for(let c of i)for(let u=c.startRow;u<c.startRow+c.rowSpan;u++)for(let m=c.startCol;m<c.startCol+c.colSpan;m++)u===c.startRow&&m===c.startCol||o.add(u*l+m);if(o.size>0){let c=f.getCellOverrides(this._tid),u=f.getCellLabels(this._tid),m=!1;for(let v of o)c[String(v)]&&(delete c[String(v)],m=!0),u[v]&&(u[v]="",m=!0);m&&(await f.setCellOverrides(this._tid,c),await f.setCellLabels(this._tid,u))}this.sendConfig();let p=C.getActive();a!==JSON.stringify(i)&&p&&p.getRows()===s.rows&&p.getCols()===s.cols&&T.createOrShow(this._context,p.getRows(),p.getCols());break}case"saveSectionStates":{await this._context.globalState.update("sectionStates",s.states);break}case"switchTab":{let i=C.get(s.tabId);i&&i.reveal();break}case"newTab":{let i=C.getActive(),a=d.workspace.getConfiguration("terminalGrid"),l=i?.getRows()??a.get("defaultRows",2),o=i?.getCols()??a.get("defaultCols",3);T.createOrShow(this._context,l,o,{forceNewTab:!0});break}case"duplicateTab":{let i=C.getActive();if(!i)break;let a=i.getRows(),l=i.getCols(),o=i.getTabId(),p=O.next(this._context);await f.cloneTab(o,p),T.createOrShow(this._context,a,l,{forceNewTab:!0,tabIdOverride:p}),d.window.showInformationMessage(d.l10n.t("Tab duplicated. Terminal history is not copied; cells will start with the configured startup commands."));break}case"removeTab":{if(C.size()<=1)break;let i=C.get(s.tabId);if(!i)break;await f.deleteTab(s.tabId),i.dispose();break}case"renameTab":{if(typeof s.name!="string"||!C.get(s.tabId))break;await f.setTabName(s.tabId,s.name.trim());for(let[,a]of C.entries())a.refreshTitle();this.sendConfig();break}case"installNodePty":{try{await d.window.withProgress({location:d.ProgressLocation.Notification,title:d.l10n.t("Installing node-pty\u2026"),cancellable:!1},()=>new Promise((l,o)=>{dt.exec("npm install node-pty",{cwd:this._context.extensionPath},p=>{p?o(p):l()})})),this._view?.webview.postMessage({type:"ptyInstallResult",success:!0});let i=d.l10n.t("Reload Window");await d.window.showInformationMessage(d.l10n.t("node-pty installed successfully. Reload window to activate."),i)===i&&d.commands.executeCommand("workbench.action.reloadWindow")}catch(i){let a=i instanceof Error?i.message:String(i);d.window.showErrorMessage(d.l10n.t("node-pty install failed: {0}",a)),this._view?.webview.postMessage({type:"ptyInstallResult",success:!1})}break}}}),d.workspace.onDidChangeConfiguration(s=>{s.affectsConfiguration("terminalGrid")&&this.sendConfig()})}async _savePreset(e){let t=d.workspace.getConfiguration("terminalGrid"),r={name:e,rows:t.get("defaultRows",2),cols:t.get("defaultCols",3),startupCommands:f.getStartupCommands(this._tid),cellLabels:f.getCellLabels(this._tid),zoomPercent:t.get("zoomPercent",100),fontFamily:t.get("fontFamily",""),bgColor:t.get("backgroundColor",""),fgColor:t.get("foregroundColor",""),colorTheme:t.get("colorTheme",""),shellType:t.get("shellType",""),defaultCommand:f.getDefaultCommand(this._tid),defaultSteps:f.getDefaultSteps(this._tid),cellStepsOverrides:f.getCellOverrides(this._tid),mergedRegions:f.getMergedRegions(this._tid)},s=this._context.globalState.get("presets",[]),i=s.findIndex(a=>a.name===e);i>=0?s[i]=r:s.push(r),await this._context.globalState.update("presets",s)}async _migrateSteps(){let e=!1,t=f.getDefaultSteps(this._tid),r=f.getDefaultCommand(this._tid);r&&t.length===0?(await f.setDefaultSteps(this._tid,[{type:"command",input:r}]),await f.setDefaultCommand(this._tid,""),e=!0):r&&t.length>0&&(await f.setDefaultCommand(this._tid,""),e=!0);let s=f.getCellOverrides(this._tid);for(let a of Object.keys(s)){let l=s[Number(a)];if(!l)continue;let o=l.startupCommand,p=l.startupSteps;o&&(!p||p.length===0)?(l.startupSteps=[{type:"command",input:o}],delete l.startupCommand,e=!0):o&&p&&p.length>0&&(delete l.startupCommand,e=!0)}f.getStartupCommands(this._tid).length>0&&(await f.setStartupCommands(this._tid,[]),e=!0),e&&await f.setCellOverrides(this._tid,s)}static _claudeDesktopConfigPath(){let e=process.platform;return e==="win32"?P.join(process.env.APPDATA||P.join(X.homedir(),"AppData","Roaming"),"Claude","claude_desktop_config.json"):e==="darwin"?P.join(X.homedir(),"Library","Application Support","Claude","claude_desktop_config.json"):P.join(X.homedir(),".config","Claude","claude_desktop_config.json")}static _stableMcpDest(e){return P.join(e.globalStorageUri.fsPath,"mcp-server.js")}static ensureStableMcpScript(e){let t=P.join(e.extensionPath,"mcp-server.js");try{let r=n._stableMcpDest(e);if(L.existsSync(t)&&He(t,r),L.existsSync(r))return r.replace(/\\/g,"/")}catch{}return t.replace(/\\/g,"/")}static _samePath(e,t){try{let r=P.resolve(e),s=P.resolve(t);return process.platform==="win32"?r.toLowerCase()===s.toLowerCase():r===s}catch{return e===t}}static healMcpRegistrations(e){let t;try{let i=n._stableMcpDest(e);if(!L.existsSync(i))return;t=i.replace(/\\/g,"/")}catch{return}let r=i=>/[\\/]extensions[\\/]koenma\.terminal-grid-\d/.test(i),s=[P.join(X.homedir(),".claude.json"),n._claudeDesktopConfigPath()];for(let i of s)try{if(!L.existsSync(i))continue;let a=L.readFileSync(i,"utf-8"),l=JSON.parse(a),o=[],p=h=>{h&&typeof h=="object"&&o.push(h)};p(l.mcpServers);let c=l.projects;if(c&&typeof c=="object")for(let h of Object.values(c))p(h?.mcpServers);let u=!1;for(let h of o){let y=h["terminal-grid"]?.args;if(Array.isArray(y))for(let _=0;_<y.length;_++){let x=y[_];typeof x!="string"||!/mcp-server\.js$/i.test(x)||n._samePath(x,t)||(!L.existsSync(x)||r(x))&&(y[_]=t,u=!0)}}if(!u)continue;let m=JSON.stringify(l,null,2),v=`${i}.tg-tmp.${process.pid}.${Date.now()}`;try{L.writeFileSync(v,m,"utf-8"),L.readFileSync(i,"utf-8")===a&&L.renameSync(v,i)}finally{try{L.existsSync(v)&&L.unlinkSync(v)}catch{}}}catch{}}static healCodexRegistration(e){try{let t=P.join(process.env.CODEX_HOME||P.join(X.homedir(),".codex"),"config.toml");Ve(t,n.ensureStableMcpScript(e))}catch(t){console.warn("Terminal Grid: could not repair Codex MCP configuration:",t)}}sendConfig(){if(!this._view)return;this._migrateSteps();let e=d.workspace.getConfiguration("terminalGrid"),t=this._context.globalState.get("customFonts",[]),r=f.getStartupCommands(this._tid),s=this._context.globalState.get("projects",[]),i=this._context.globalState.get("presets",[]),a=this._context.globalState.get("projectPresets",{}),l=f.getCellLabels(this._tid),o=f.getCellOverrides(this._tid),p=f.getDefaultSteps(this._tid),c=this._context.globalState.get("sectionStates",{}),u=d.workspace.workspaceFolders?.[0]?.uri.fsPath||"",m=T.currentPanel,v=T.getAvailableShells();this._view.webview.postMessage({type:"configValues",zoom:e.get("zoomPercent",100),fontFamily:e.get("fontFamily",""),bgColor:e.get("backgroundColor",""),fgColor:e.get("foregroundColor",""),colorTheme:e.get("colorTheme",""),shellType:e.get("shellType",""),defaultCommand:f.getDefaultCommand(this._tid),themeNames:Ke,availableShells:v.map(h=>({name:h.name,path:h.path})),customFonts:t.map(h=>h.name),startupCommands:r,projects:s,presets:i,projectPresets:a,cellLabels:l,cellOverrides:o,defaultSteps:p,sectionStates:c,workspacePath:u,gridRows:m?.getRows()??0,gridCols:m?.getCols()??0,tabs:C.entries().map(([h,g])=>({tabId:h,rows:g.getRows(),cols:g.getCols(),name:f.getTabName(h)})),activeTabId:C.getActiveTabId()??null,mergedRegions:f.getMergedRegions(this._tid),hiddenCells:(()=>{let h=f.getMergedRegions(this._tid),g=m?.getCols()??e.get("defaultCols",3),y=[];for(let _ of h)for(let x=_.startRow;x<_.startRow+_.rowSpan;x++)for(let I=_.startCol;I<_.startCol+_.colSpan;I++)x===_.startRow&&I===_.startCol||y.push(x*g+I);return y})()})}_getHtml(){let e=Wt();return`<!DOCTYPE html>
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
    ${zt()?"":`
    <div class="pty-banner" id="ptyBanner">
      <span class="pty-banner-icon">\u26A0</span>
      <span class="pty-banner-text">${d.l10n.t("node-pty is required to use Terminal Grid.")}</span>
      <button class="pty-banner-btn" id="ptyInstallBtn">${d.l10n.t("Install")}</button>
    </div>
    `}
    <!-- Projects -->
    <div class="glass-card" data-section="projects">
      <div class="section-header collapsible">
        <div class="section-label">${d.l10n.t("Projects")}</div>
        <span class="tip-wrap">
          <span class="tip-icon">?</span>
          <div class="tip-bubble">
            ${d.l10n.t("Register projects and click to switch folders. Ctrl+Click to open in a new window. If a preset is linked, it will be auto-applied on switch.")}
          </div>
        </span>
        <span class="collapse-icon">\u25BE</span>
      </div>
      <div class="section-body">
        <div id="mcpPortInfo" style="font-size: 11px; opacity: 0.7; margin-bottom: 8px; display: ${this._mcpPort>0?"block":"none"};">
          MCP Port: <span id="mcpPortValue">${this._mcpPort}</span>
        </div>
        <button class="glass-btn" id="diagnosticsBtn" style="font-size:11px;padding:6px 10px;margin-bottom:8px">${d.l10n.t("Version and MCP status")}</button>
        <div id="projectList" class="cmd-list"></div>
        <div class="btn-group" style="gap: 6px;">
          <button class="glass-btn" id="addCurrentProjectBtn" style="font-size: 11px; padding: 8px 10px;">
            <span class="btn-icon" style="font-size: 12px;">+</span> ${d.l10n.t("Add Current Folder")}
          </button>
          <button class="glass-btn" id="browseProjectBtn" style="font-size: 11px; padding: 8px 10px;">
            <span class="btn-icon" style="font-size: 12px;">&#128193;</span> ${d.l10n.t("Browse Folder")}
          </button>
        </div>
      </div>
    </div>

    <!-- Tabs (multi-grid management) -->
    <div class="glass-card collapsed" data-section="tabs">
      <div class="section-header collapsible">
        <div class="section-label">${d.l10n.t("Tabs")}</div>
        <span class="tip-wrap">
          <span class="tip-icon">?</span>
          <div class="tip-bubble">
            ${d.l10n.t("Manage multiple grid tabs \u2014 each tab keeps its own labels, cell settings, merges, and startup steps. Click a tab to focus it, right-click or double-click to rename. + opens a new empty tab, \u29C9 duplicates the active tab, \xD7 closes a tab (last tab can't be closed).")}
          </div>
        </span>
        <span class="collapse-icon">\u25BE</span>
      </div>
      <div class="section-body">
        <div id="tabsList" class="tabs-list"></div>
        <div class="tabs-actions" style="display: flex; gap: 6px; margin-top: 8px;">
          <button class="glass-btn" id="newTabBtn" title="${d.l10n.t("New tab (same size as active)")}" style="font-size: 11px; padding: 8px 10px; flex: 1;">
            <span class="btn-icon">+</span> ${d.l10n.t("New Tab")}
          </button>
          <button class="glass-btn" id="duplicateTabBtn" title="${d.l10n.t("Duplicate active tab (copies labels, overrides, merges, startup)")}" style="font-size: 11px; padding: 8px 10px; flex: 1;">
            <span class="btn-icon">\u29C9</span> ${d.l10n.t("Duplicate")}
          </button>
        </div>
      </div>
    </div>

    <div class="glass-card" data-section="gridSize">
      <div class="section-header collapsible">
        <div class="section-label">${d.l10n.t("Select Grid Size")} <span id="gridSizeActiveLabel" class="section-active-tab"></span></div>
        <span class="tip-wrap">
          <span class="tip-icon">?</span>
          <div class="tip-bubble">
            ${d.l10n.t("Hover to select the desired rows\xD7cols size. Supports up to 4\xD75 (20 cells). Grid opens as an editor tab, each cell is an independent terminal. Drag cells below to merge them into one larger terminal.")}
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
            <button class="glass-btn" id="mergeBtn" disabled>${d.l10n.t("Merge")}</button>
            <button class="glass-btn" id="unmergeBtn" disabled>${d.l10n.t("Unmerge")}</button>
            <button class="glass-btn" id="mergeClearBtn">${d.l10n.t("Clear")}</button>
          </div>
        </div>
        <div class="merge-bottom">
          <div class="merge-legend">
            <div class="merge-legend-item"><div class="merge-legend-swatch sel"></div> ${d.l10n.t("Selection")}</div>
            <div class="merge-legend-item"><div class="merge-legend-swatch mrg"></div> ${d.l10n.t("Merged")}</div>
          </div>
        </div>
        <button class="glass-btn primary" id="openGridBtn">
          <span class="btn-icon">&#9654;</span> ${d.l10n.t("Open Grid")}
        </button>
      </div>
    </div>

    <div class="glass-card" data-section="settings">
      <div class="section-header collapsible">
        <div class="section-label">${d.l10n.t("Terminal Settings")}</div>
        <span class="tip-wrap">
          <span class="tip-icon">?</span>
          <div class="tip-bubble">
            ${d.l10n.t("Zoom: Global font size (50\u2013300%). Font/Color: Use tabs for global or per-cell settings. Changes in All tab apply to all cells. Set global first, then customize individual cells. Individual cells can be zoomed separately with Ctrl+Wheel.")}
          </div>
        </span>
        <span class="collapse-icon">\u25BE</span>
      </div>
      <div class="section-body">
        <div class="setting-row">
          <span class="setting-label">${d.l10n.t("Zoom")}</span>
          <div class="stepper">
            <button class="stepper-btn" id="zoomDown">\u2212</button>
            <span class="stepper-val" id="zoomVal">100%</span>
            <button class="stepper-btn" id="zoomUp">+</button>
          </div>
        </div>

        <div id="settingsTabs" class="settings-tabs hidden"></div>

        <div class="setting-row">
          <span class="setting-label">${d.l10n.t("Theme")}</span>
          <div class="font-picker" id="themePicker">
            <div class="font-display" id="themeDisplay">
              <span class="font-display-text" id="themeDisplayText">${d.l10n.t("IDE Default")}</span>
              <span class="font-display-arrow">\u25B2</span>
            </div>
            <div class="font-dropdown" id="themeDropdown"></div>
          </div>
        </div>

        <div class="setting-row">
          <span class="setting-label">${d.l10n.t("Font")}</span>
          <div class="font-picker" id="fontPicker">
            <div class="font-display" id="fontDisplay">
              <span class="font-display-text" id="fontDisplayText">${d.l10n.t("IDE Default")}</span>
              <span class="font-display-arrow">\u25B2</span>
            </div>
            <div class="font-dropdown" id="fontDropdown"></div>
          </div>
        </div>

        <div class="setting-row">
          <span class="setting-label">${d.l10n.t("Back Color")}</span>
          <div class="color-row">
            <div class="color-swatch" id="bgSwatch">
              <div class="color-swatch-fill" id="bgSwatchFill"></div>
              <input type="color" id="bgColorInput" value="#1e1e1e">
            </div>
            <span class="color-val" id="bgVal">${d.l10n.t("IDE Default")}</span>
            <button class="color-reset hidden" id="bgReset" title="${d.l10n.t("Reset to IDE Default")}">\xD7</button>
          </div>
        </div>

        <div class="setting-row">
          <span class="setting-label">${d.l10n.t("Font Color")}</span>
          <div class="color-row">
            <div class="color-swatch" id="fgSwatch">
              <div class="color-swatch-fill" id="fgSwatchFill"></div>
              <input type="color" id="fgColorInput" value="#cccccc">
            </div>
            <span class="color-val" id="fgVal">${d.l10n.t("IDE Default")}</span>
            <button class="color-reset hidden" id="fgReset" title="${d.l10n.t("Reset to IDE Default")}">\xD7</button>
          </div>
        </div>

      </div>
    </div>

    <!-- Startup Commands -->
    <div class="glass-card" data-section="startup">
      <div class="section-header collapsible">
        <div class="section-label">${d.l10n.t("Startup Commands")}</div>
        <span class="tip-wrap">
          <span class="tip-icon">?</span>
          <div class="tip-bubble">
            ${d.l10n.t("Set shell type and startup command per cell. Use All tab for global defaults, or individual tabs for per-cell overrides.")}
          </div>
        </span>
        <span class="collapse-icon">\u25BE</span>
      </div>
      <div class="section-body">
        <div id="cmdTabs" class="settings-tabs hidden"></div>
        <div class="setting-row">
          <span class="setting-label">${d.l10n.t("Shell")}</span>
          <div class="font-picker" id="shellPicker">
            <div class="font-display" id="shellDisplay">
              <span class="font-display-text" id="shellDisplayText">${d.l10n.t("IDE Default")}</span>
              <span class="font-display-arrow">\u25B2</span>
            </div>
            <div class="font-dropdown" id="shellDropdown"></div>
          </div>
        </div>
        <div class="setting-row">
          <span class="setting-label">${d.l10n.t("CLI launch")}</span>
          <select class="glass-select" id="launchCli" aria-label="${d.l10n.t("CLI launch")}">
            <option value="codex">Codex</option><option value="claude">Claude Code</option>
          </select>
        </div>
        <div class="setting-row">
          <span class="setting-label">${d.l10n.t("Launch mode")}</span>
          <select class="glass-select" id="launchMode" aria-label="${d.l10n.t("Launch mode")}">
            <option value="new">${d.l10n.t("New conversation")}</option>
            <option value="picker">${d.l10n.t("Choose a session")}</option>
            <option value="last">${d.l10n.t("Continue latest")}</option>
            <option value="session">${d.l10n.t("Specific session")}</option>
          </select>
        </div>
        <div class="cmd-add-row" id="launchSessionRow" style="display:none">
          <input class="glass-input" id="launchSession" placeholder="${d.l10n.t("Session ID")}" aria-label="${d.l10n.t("Session ID")}" style="width:100%" />
        </div>
        <div class="cmd-add-row">
          <input class="glass-input" id="launchOptions" placeholder="${d.l10n.t("CLI options (optional)")}" aria-label="${d.l10n.t("CLI options (optional)")}" style="width:100%" />
        </div>
        <div id="launchPreview" style="font-family:monospace;font-size:11px;overflow-wrap:anywhere;margin:6px 0" aria-live="polite"></div>
        <button class="glass-btn" id="launchAddBtn">${d.l10n.t("Add launch step")}</button>
        <div class="hint">${d.l10n.t("Resume opens directly. Use a different session ID for each cell when continuing separate conversations.")}</div>
        <div class="setting-row" style="margin-top:10px">
          <span class="setting-label">${d.l10n.t("Command")}</span>
          <select class="glass-select" id="cmdPreset" style="flex:1;min-width:0;">
            <option value="">${d.l10n.t("Select command\u2026")}</option>
            <optgroup label="${d.l10n.t("Claude")}">
              <option value="claude">claude</option>
              <option value="claude --dangerously-skip-permissions">claude --skip-perms</option>
            </optgroup>
            <optgroup label="${d.l10n.t("Claude \xB7 effort (launch)")}">
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
            <optgroup label="${d.l10n.t("Claude \xB7 model (launch)")}">
              <option value="claude --model fable">claude --model fable (Fable 5)</option>
              <option value="claude --model claude-fable-5">claude --model claude-fable-5</option>
              <option value="claude --model opus">claude --model opus (Opus 4.8)</option>
              <option value="claude --model sonnet">claude --model sonnet (Sonnet 4.6)</option>
              <option value="claude --model haiku">claude --model haiku (Haiku 4.5)</option>
              <option value="claude --model fable --effort max">claude --model fable --effort max</option>
              <option value="claude --dangerously-skip-permissions --model fable --effort max">claude --skip-perms --model fable --effort max</option>
              <option value="claude --model fable --fallback-model opus">claude --model fable --fallback-model opus</option>
            </optgroup>
            <optgroup label="${d.l10n.t("Codex")}">
              <option value="codex">codex</option>
              <option value="codex -s danger-full-access -a never">codex -s danger-full-access -a never</option>
            </optgroup>
            <optgroup label="${d.l10n.t("Claude \xB7 slash (after start)")}">
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
            <option value="__custom__">${d.l10n.t("Custom command\u2026")}</option>
            <option value="__timeout__">${d.l10n.t("Timeout (ms)\u2026")}</option>
          </select>
        </div>
        <div class="cmd-add-row" id="cmdCustomRow" style="display:none;">
          <input class="glass-input" id="cmdCustom" placeholder="${d.l10n.t("Custom command\u2026")}" style="flex:1;min-width:0;" />
          <button class="stepper-btn" id="cmdApplyBtn" title="${d.l10n.t("Apply")}">&#10003;</button>
        </div>
        <div class="cmd-add-row" id="cmdTimeoutRow" style="display:none;">
          <input class="glass-input" type="number" id="cmdTimeoutMs" placeholder="${d.l10n.t("Milliseconds (e.g. 1500)")}" min="100" step="100" style="flex:1;min-width:0;" />
          <button class="stepper-btn" id="cmdTimeoutApplyBtn" title="${d.l10n.t("Apply")}">&#10003;</button>
        </div>
        <div class="cmd-summary-divider"></div>
        <div id="cmdSummaryList" class="cmd-summary-list"></div>
      </div>
    </div>

    <!-- Presets -->
    <div class="glass-card" data-section="presets">
      <div class="section-header collapsible">
        <div class="section-label">${d.l10n.t("Presets")}</div>
        <span class="tip-wrap">
          <span class="tip-icon">?</span>
          <div class="tip-bubble">
            ${d.l10n.t("Save and load current grid settings (size, zoom, font, color, commands, cell labels) as presets. Use Link to project for per-project auto-apply.")}
          </div>
        </span>
        <span class="collapse-icon">\u25BE</span>
      </div>
      <div class="section-body">
        <div class="cmd-add-row">
          <input class="glass-input" id="presetNameInput" placeholder="${d.l10n.t("Preset name\u2026")}" style="flex: 1;" />
        </div>
        <div class="cmd-add-row" style="margin-top: 4px;">
          <select class="glass-select" id="presetSelect" style="flex: 1;">
            <option value="">${d.l10n.t("Select preset\u2026")}</option>
          </select>
        </div>
        <div class="btn-group" style="gap: 6px; margin-top: 8px;">
          <div style="display: flex; gap: 6px;">
            <button class="glass-btn" id="presetSaveBtn" style="font-size: 11px; padding: 8px 10px; flex: 1;">${d.l10n.t("Save")}</button>
            <button class="glass-btn primary" id="presetLoadBtn" style="font-size: 11px; padding: 8px 10px; flex: 1;">${d.l10n.t("Load")}</button>
            <button class="glass-btn" id="presetDeleteBtn" style="font-size: 11px; padding: 8px 10px; flex: 1;">${d.l10n.t("Delete")}</button>
          </div>
          <div id="presetLinkRow" style="display: flex; align-items: center; gap: 6px; font-size: 11px; opacity: .7; margin-top: 4px;">
            <input type="checkbox" id="presetLinkCheck" style="margin: 0;" />
            <label id="presetLinkLabel" for="presetLinkCheck" style="cursor: pointer;">${d.l10n.t("Link to current project")}</label>
          </div>
        </div>
      </div>
    </div>

    <!-- Broadcast Input -->
    <div class="glass-card" data-section="broadcast">
      <div class="section-header collapsible">
        <div class="section-label">${d.l10n.t("Broadcast Input")}</div>
        <span class="tip-wrap">
          <span class="tip-icon">?</span>
          <div class="tip-bubble">
            ${d.l10n.t("Send text to selected terminals. Check All to send to all cells, uncheck for individual selection.")}
          </div>
        </span>
        <span class="collapse-icon">\u25BE</span>
      </div>
      <div class="section-body">
        <div id="broadcastTargets" class="broadcast-targets hidden"></div>
        <div class="cmd-add-row" style="flex-direction: column; gap: 4px;">
          <textarea class="glass-input" id="broadcastInput" placeholder="${d.l10n.t("Type command\u2026")}" rows="3" style="width: 100%; resize: vertical; font-family: var(--vscode-editor-fontFamily, monospace); font-size: 12px; line-height: 1.4;"></textarea>
          <div style="display: flex; justify-content: flex-end;">
            <button class="stepper-btn" id="broadcastSendBtn" title="${d.l10n.t("Send")}" style="width: 50px;">${d.l10n.t("Send")}</button>
          </div>
        </div>
      </div>
    </div>

    <div class="glass-card" data-section="actions">
      <div class="section-header collapsible">
        <div class="section-label">${d.l10n.t("Actions")}</div>
        <span class="collapse-icon">\u25BE</span>
      </div>
      <div class="section-body">
        <div class="btn-group">
          <button class="glass-btn" id="reloadBtn">
            <span class="btn-icon">&#8635;</span> ${d.l10n.t("Reload Window")}
          </button>
        </div>
      </div>
    </div>

    <div class="hint">
      ${d.l10n.t(`Grid opens as an editor tab.
Ctrl+Wheel to zoom individual cells.`).replace(`
`,"<br>")}
    </div>
  </div>

  <script nonce="${e}">
    var __i18n = ${JSON.stringify({installing:d.l10n.t("Installing\u2026"),ideDefault:d.l10n.t("IDE Default"),remove:d.l10n.t("Remove"),addFontFile:d.l10n.t("Add font file\u2026"),all:d.l10n.t("All"),noStartupCommands:d.l10n.t("No startup commands configured"),noProjects:d.l10n.t("No projects registered"),linkedPrefix:d.l10n.t("Linked: {0}"),linkToProject:d.l10n.t("Link to current project"),selectPreset:d.l10n.t("Select preset\u2026"),reload:d.l10n.t("Reload"),retry:d.l10n.t("Retry"),ptyInstalled:d.l10n.t("node-pty installed successfully!"),ptyInstalledHint:d.l10n.t("Reload the window to activate."),theme:d.l10n.t("Theme"),shellAuto:d.l10n.t("IDE Default"),shell:d.l10n.t("Shell")})};
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
    document.getElementById('diagnosticsBtn').addEventListener('click', function() {
      vscode.postMessage({ type: 'showDiagnostics' });
    });

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

    function clearAppearanceOverrides(fields) {
      for (var id in cellOverrides) {
        for (var i = 0; i < fields.length; i++) delete cellOverrides[id][fields[i]];
        if (Object.keys(cellOverrides[id]).length === 0) delete cellOverrides[id];
      }
      vscode.postMessage({ type: 'clearAllCellOverrides', fields: fields });
      updateTabOverrideIndicators();
    }

    function selectTheme(name) {
      if (activeSettingsTab === 'all') {
        curThemeName = name;
        themeDisplayText.textContent = getThemeDisplayName(name);
        toggleThemeDropdown(false);
        vscode.postMessage({ type: 'setConfig', key: 'colorTheme', value: name });
        clearAppearanceOverrides(['themeName', 'bgColor', 'fgColor']);
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

    var makeLaunchCommand = ${fe.toString()};
    var launchCli = document.getElementById('launchCli');
    var launchMode = document.getElementById('launchMode');
    var launchSession = document.getElementById('launchSession');
    var launchOptions = document.getElementById('launchOptions');
    var launchPreview = document.getElementById('launchPreview');
    var launchAdd = document.getElementById('launchAddBtn');
    function launchValue() {
      return { cli: launchCli.value, mode: launchMode.value, sessionId: launchSession.value, options: launchOptions.value };
    }
    function updateLaunchPreview() {
      document.getElementById('launchSessionRow').style.display = launchMode.value === 'session' ? 'flex' : 'none';
      try {
        launchPreview.textContent = makeLaunchCommand(launchValue());
        launchAdd.disabled = false;
      } catch (error) {
        launchPreview.textContent = ${JSON.stringify(d.l10n.t("Enter a valid session ID and single-line CLI options."))};
        launchAdd.disabled = true;
      }
    }
    [launchCli, launchMode, launchSession, launchOptions].forEach(function(el) { el.addEventListener('input', updateLaunchPreview); el.addEventListener('change', updateLaunchPreview); });
    launchAdd.addEventListener('click', function() {
      var launch = launchValue();
      var command;
      try { command = makeLaunchCommand(launch); } catch (_) { return; }
      addStep({ type: 'command', input: command }, launch);
    });
    updateLaunchPreview();

    function getStepsForTarget(target) {
      if (target === 'all') return defaultSteps || [];
      var ov = cellOverrides[parseInt(String(target), 10)] || {};
      if (ov.startupSteps && ov.startupSteps.length > 0) return ov.startupSteps;
      if (ov.startupCommand) return [{ type: 'command', input: ov.startupCommand }];
      return [];
    }

    function addStep(step, launch) {
      var target = activeCmdTab === 'all' ? 'all' : parseInt(activeCmdTab, 10);
      if (target === 'all') {
        defaultSteps.push(step);
      } else {
        if (!cellOverrides[target]) cellOverrides[target] = {};
        if (!cellOverrides[target].startupSteps) cellOverrides[target].startupSteps = [];
        cellOverrides[target].startupSteps.push(step);
      }
      vscode.postMessage({ type: 'addStep', target: target, step: step, launch: launch });
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
        clearAppearanceOverrides(['fontFamily']);
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
          clearAppearanceOverrides([overrideKey]);
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
          clearAppearanceOverrides([overrideKey]);
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
</html>`}};function Wt(){let n="",e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";for(let t=0;t<32;t++)n+=e.charAt(Math.floor(Math.random()*e.length));return n}var ct=R(require("http"));var F=class extends Error{constructor(t,r){super(r);this.status=t}},_e=class{constructor(e,t){this._identity=t;this._server=null;this._port=e}start(e=10){return new Promise((t,r)=>{this._server=this._createServer();let s=this._server,i=a=>{let l=p=>{s.removeListener("listening",o),p.code==="EADDRINUSE"&&a<e&&this._port<65535?(this._port++,i(a+1)):r(p)},o=()=>{s.removeListener("error",l);let p=s.address();this._port=p.port,t(this._port)};s.once("error",l),s.once("listening",o),s.listen(this._port,"127.0.0.1")};i(0)})}_createServer(){return ct.createServer((e,t)=>{t.setHeader("Content-Type","application/json");let r=[`127.0.0.1:${this._port}`,`localhost:${this._port}`];if(e.headers.origin!==void 0||!r.includes(e.headers.host||"")){t.writeHead(403),t.end(JSON.stringify({error:"Only local non-browser clients are allowed"}));return}let s=e.headers["x-terminal-grid-window"];if(s&&s!==this._identity?.windowId){t.writeHead(409),t.end(JSON.stringify({error:"This port now belongs to a different editor window. Refresh list_windows."}));return}let i;try{i=new URL(e.url||"/",`http://127.0.0.1:${this._port}`)}catch{t.writeHead(400),t.end(JSON.stringify({error:"Invalid request URL"}));return}e.method==="GET"&&i.pathname==="/api/health"?(t.writeHead(200),t.end(JSON.stringify({status:"ok",name:"terminal-grid",...this._identity,port:this._port}))):e.method==="GET"&&i.pathname==="/api/info"?this._handleInfo(t):e.method==="POST"&&i.pathname==="/api/send"?this._withBody(e,t,a=>this._handleSend(a,t)):e.method==="POST"&&i.pathname==="/api/read"?this._withBody(e,t,a=>this._handleRead(a,t)):e.method==="POST"&&i.pathname==="/api/broadcast"?this._withBody(e,t,a=>this._handleBroadcast(a,t)):(t.writeHead(404),t.end(JSON.stringify({error:"Not found"})))})}stop(){let e=this._server;return this._server=null,new Promise(t=>{if(!e){t();return}e.close(()=>t()),e.closeAllConnections()})}getPort(){return this._port}_handleInfo(e){let t=C.getActive(),r=C.entries().map(([s,i])=>({tabId:s,rows:i.getRows(),cols:i.getCols(),cellIds:i.getCellIds(),labels:i.getCellLabels(),hiddenCellIds:i.getHiddenCellIds(),cellStatuses:i.getCellStatuses()}));e.writeHead(200),e.end(JSON.stringify({window:this._identity?{...this._identity,port:this._port}:void 0,grid:t?{rows:t.getRows(),cols:t.getCols(),cellCount:t.getCellCount(),cellLabels:t.getCellLabels(),cellIds:t.getCellIds(),cellStatuses:t.getCellStatuses()}:null,tabs:r,activeTabId:C.getActiveTabId()??null}))}async _handleSend(e,t){this._validateCell(e),this._validateText(e);let r=typeof e.cellId=="number"?e.cellId:-1,s=typeof e.text=="string"?e.text:"",i=e.submit===!0,a=A.resolve(r);if(!a){t.writeHead(200),t.end(JSON.stringify({success:!1,error:"Invalid cell id"}));return}let l=C.get(a.tabId);if(!l){t.writeHead(200),t.end(JSON.stringify({success:!1,error:"Tab no longer open"}));return}let o=await l.deliverToCell(a.localCellId,s,i);t.destroyed||t.writableEnded||(t.writeHead(200),t.end(JSON.stringify(o)))}async _handleRead(e,t){if(this._validateCell(e),e.lines!==void 0&&(typeof e.lines!="number"||!Number.isSafeInteger(e.lines)||e.lines<0))throw new F(400,"lines must be a non-negative integer");if(e.mode!==void 0&&e.mode!=="screen"&&e.mode!=="history")throw new F(400,"mode must be screen or history");let r=typeof e.cellId=="number"?e.cellId:-1,s=typeof e.lines=="number"?e.lines:void 0,i=A.resolve(r);if(!i){t.writeHead(200),t.end(JSON.stringify({output:null,error:"Invalid cell id"}));return}let a=C.get(i.tabId);if(!a){t.writeHead(200),t.end(JSON.stringify({output:null,error:"Tab no longer open"}));return}let l=await a.readCellSnapshot(i.localCellId,{lines:s,mode:e.mode==="history"?"history":"screen"});t.destroyed||t.writableEnded||(t.writeHead(200),t.end(JSON.stringify(l??{output:null,error:"Cell screen is unavailable. Wait for the grid to finish restoring, or request mode:history."})))}async _handleBroadcast(e,t){this._validateText(e);let r=C.getActive();if(!r){t.writeHead(200),t.end(JSON.stringify({success:!1,error:"No grid open"}));return}let s=typeof e.text=="string"?e.text:"",i=e.submit===!0,a=new Set(r.getHiddenCellIds()),l=r.getCellIds(),o=await Promise.all(Array.from({length:r.getCellCount()},async(c,u)=>({cellId:l[u],...a.has(l[u])?{success:!1,error:"Cell is hidden"}:await r.deliverToCell(u,s,i)}))),p=o.filter(c=>c.success).length;t.destroyed||t.writableEnded||(t.writeHead(200),t.end(JSON.stringify({success:p>0,cellCount:p,deliveries:o,...p?{}:{error:"No cells available"}})))}_validateCell(e){if(typeof e.cellId!="number"||!Number.isSafeInteger(e.cellId)||e.cellId<0)throw new F(400,"cellId must be a non-negative integer")}_validateText(e){if(typeof e.text!="string"||e.submit!==void 0&&typeof e.submit!="boolean")throw new F(400,"text must be a string and submit must be a boolean")}_withBody(e,t,r){this._readBody(e).then(r).catch(s=>{t.destroyed||t.writableEnded||(t.writeHead(s instanceof F?s.status:500),t.end(JSON.stringify({error:s instanceof Error?s.message:"Request failed"})))})}_readBody(e){return new Promise((t,r)=>{if(e.headers["content-type"]?.split(";")[0].trim().toLowerCase()!=="application/json"){e.resume(),r(new F(415,"Content-Type must be application/json"));return}e.setEncoding("utf8");let s="",i=0;e.on("data",a=>{i+=Buffer.byteLength(a),i>1024*1024?(s="",r(new F(413,"Request body exceeds 1 MB"))):s+=a}),e.on("error",r),e.on("aborted",()=>r(new F(400,"Request aborted"))),e.on("end",()=>{if(!(i>1024*1024))try{let a=JSON.parse(s);if(!a||typeof a!="object"||Array.isArray(a))throw new Error;t(a)}catch{r(new F(400,"Expected a JSON object"))}})})}};var Se=class{constructor(e){this.tabs=e;this._claimed=new Set;this._cancelled=!1;this._byId=new Map(e.map(t=>[t.tabId,t]))}claim(e){if(this._cancelled)return;let t=e&&typeof e=="object"?e.tabId:void 0;if(typeof t!="number"||this._claimed.has(t))return;let r=this._byId.get(t);return r&&this._claimed.add(t),r}missing(e){if(this._cancelled)return[];let t=new Set(e);return this.tabs.filter(r=>!t.has(r.tabId))}cancel(){this._cancelled=!0}};var Q,z,oe=!1,q;async function Ut(n){oe=!1,f.init(n),await f.migrateOnce(),j.ensureStableMcpScript(n),j.healMcpRegistrations(n),j.healCodexRegistration(n);try{q=new pe(ae.join(Me.homedir(),".terminal-grid"),{version:String(n.extension.packageJSON.version),buildHash:(0,Ae.createHash)("sha256").update(le.readFileSync(ae.join(n.extensionPath,"dist","extension.js"))).digest("hex"),workspaces:(b.workspace.workspaceFolders??[]).map(m=>m.uri.fsPath)},()=>b.commands.executeCommand("workbench.action.reloadWindow")),n.subscriptions.push(q)}catch(m){console.warn("Terminal Grid: deployment reload watcher unavailable:",m)}let e=b.workspace.workspaceFolders?.[0]?.uri.fsPath;if(e){let v=n.globalState.get("projectPresets",{})[e];if(v){let g=n.globalState.get("presets",[]).find(y=>y.name===v);if(g){let y=b.workspace.getConfiguration("terminalGrid");if(await y.update("defaultRows",g.rows,b.ConfigurationTarget.Global),await y.update("defaultCols",g.cols,b.ConfigurationTarget.Global),await y.update("zoomPercent",g.zoomPercent,b.ConfigurationTarget.Global),await y.update("fontFamily",g.fontFamily,b.ConfigurationTarget.Global),await y.update("backgroundColor",g.bgColor,b.ConfigurationTarget.Global),await y.update("foregroundColor",g.fgColor,b.ConfigurationTarget.Global),await y.update("colorTheme",g.colorTheme||"",b.ConfigurationTarget.Global),await y.update("shellType",g.shellType||"",b.ConfigurationTarget.Global),f.getLastTabs().length===0){let x=O.next(n);if(await f.setStartupCommands(x,g.startupCommands||[]),await f.setCellLabels(x,g.cellLabels||[]),await f.setDefaultCommand(x,g.defaultCommand||""),g.defaultSteps?await f.setDefaultSteps(x,g.defaultSteps):g.defaultCommand?await f.setDefaultSteps(x,[{type:"command",input:g.defaultCommand}]):await f.setDefaultSteps(x,[]),g.cellStepsOverrides){let I={};for(let[S,N]of Object.entries(g.cellStepsOverrides))I[Number(S)]={},Array.isArray(N.startupSteps)&&(I[Number(S)].startupSteps=N.startupSteps);await f.setCellOverrides(x,I)}await f.setMergedRegions(x,g.mergedRegions||[]),await n.workspaceState.update("pendingFirstTabId",x)}}}}let t=new j(n),r=new b.EventEmitter;n.subscriptions.push(r);let s=0;z=b.window.createStatusBarItem(b.StatusBarAlignment.Right,50),z.command="terminalGrid.showDiagnostics",n.subscriptions.push(z);let i=async()=>{if(oe||(s=0,q?.setPort(0),t.setMcpPort(0),z?.hide(),r.fire(),await Q?.stop(),Q=void 0,oe))return;let m=b.workspace.getConfiguration("terminalGrid").get("apiPort",7890);if(m<=0)return;let v=q?.windowId||`${process.pid}-${Date.now()}`,h=new _e(m,{windowId:v,workspaces:(b.workspace.workspaceFolders??[]).map(g=>g.uri.fsPath),pid:process.pid,version:String(n.extension.packageJSON.version)});Q=h;try{s=await h.start(),q?.setPort(s),T.setMcpEnvironment(v,s),n.environmentVariableCollection.persistent=!1,n.environmentVariableCollection.replace("TERMINAL_GRID_WINDOW_ID",v),z&&(z.text="$(broadcast) TG :"+s,z.tooltip=b.l10n.t("Terminal Grid API active on port {0}",s),z.show()),t.setMcpPort(s),r.fire()}catch(g){await h.stop(),Q=void 0,b.window.showWarningMessage(b.l10n.t("Terminal Grid API bridge failed to start: {0}",g instanceof Error?g.message:String(g)))}},a=i();await a,n.subscriptions.push(b.workspace.onDidChangeConfiguration(m=>{m.affectsConfiguration("terminalGrid.apiPort")&&(a=a.then(i))}));let l=b.lm;if(typeof l?.registerMcpServerDefinitionProvider=="function"){let m=l.registerMcpServerDefinitionProvider;n.subscriptions.push(m("terminalGrid",{onDidChangeMcpServerDefinitions:r.event,provideMcpServerDefinitions:async()=>{if(s<=0)return[];let v=b.McpStdioServerDefinition;return v?[new v("Terminal Grid","node",[j.ensureStableMcpScript(n)],{TERMINAL_GRID_WINDOW_ID:q?.windowId||""},n.extension.packageJSON.version)]:[]}}))}n.subscriptions.push(b.window.registerWebviewViewProvider(j.viewType,t)),n.subscriptions.push(b.commands.registerCommand("terminalGrid._refreshSidebar",()=>{t.sendConfig()}));let o=new Se(f.beginRestore()),p=!1,c=!1,u=async()=>{if(p||(p=!0,oe))return;let m=C.getActiveTabId(),v=o.missing(C.entries().map(([h])=>h));if(v.length>0)for(let h of v)C.has(h.tabId)||T.createOrShow(n,h.rows,h.cols,{forceNewTab:!0,preserveFocus:!0,tabIdOverride:h.tabId,cellIdsOverride:h.cellIds});C.reorder(o.tabs.map(h=>h.tabId)),m!==void 0&&C.setActive(m),f.finishRestore(),T.persistTabs(n)};n.subscriptions.push(b.window.registerWebviewPanelSerializer("terminalGrid",{async deserializeWebviewPanel(m,v){let h=o.claim(v);h&&!C.has(h.tabId)?(T.revive(m,n,h.rows,h.cols,h.tabId,h.cellIds),C.reorder(o.tabs.map(g=>g.tabId))):m.dispose(),c||(c=!0,setTimeout(()=>{u()},100))}})),setTimeout(()=>{u()},1500),n.subscriptions.push(b.commands.registerCommand("terminalGrid.showDiagnostics",async()=>{let m=String(n.extension.packageJSON.version),v=b.l10n.t("Unknown (no local installation receipt)"),h=!1;try{let x=JSON.parse(await le.promises.readFile(ae.join(Me.homedir(),".terminal-grid","deployment.json"),"utf8"));v=String(x.version);let I=(0,Ae.createHash)("sha256").update(await le.promises.readFile(ae.join(n.extensionPath,"dist","extension.js"))).digest("hex");h=m!==x.version||I!==x.buildHash}catch{}let g=s,y=g>0?await new Promise(x=>{let I=pt.get({hostname:"127.0.0.1",port:g,path:"/api/health",timeout:1500,headers:{"X-Terminal-Grid-Window":q?.windowId||""}},S=>{S.resume(),x(S.statusCode===200?b.l10n.t("Connected on port {0}",g):b.l10n.t("Connection failed (HTTP {0})",S.statusCode||0))});I.on("timeout",()=>I.destroy(new Error("timeout"))),I.on("error",()=>x(b.l10n.t("Connection failed on port {0}",g)))}):b.l10n.t("Disabled or unavailable"),_=[b.l10n.t("Running version: {0}",m),b.l10n.t("Last local installation: {0}",v),h?b.l10n.t("Reload Window is needed to use the installed build."):"",b.l10n.t("Terminal Grid MCP: {0}",y),b.l10n.t("Workspace: {0}",(b.workspace.workspaceFolders??[]).map(x=>x.uri.fsPath).join(", ")||b.l10n.t("Empty window")),b.l10n.t("Open grid tabs: {0}",C.size()),"",b.l10n.t("CLI authentication is managed by Codex or Claude. A codex_apps 401 token_expired error requires signing in again in that CLI; the local Terminal Grid MCP connection does not refresh that token.")].filter(x=>x!=="").join(`
`);await b.window.showInformationMessage(b.l10n.t("Terminal Grid status"),{modal:!0,detail:_})}),b.commands.registerCommand("terminalGrid.openGrid",()=>{let m=b.workspace.getConfiguration("terminalGrid"),v=m.get("defaultRows",2),h=m.get("defaultCols",3);T.createOrShow(n,v,h)}),b.commands.registerCommand("terminalGrid.openCustomGrid",(m,v)=>{T.createOrShow(n,m,v)}),b.commands.registerCommand("terminalGrid.open2x2",()=>T.createOrShow(n,2,2)),b.commands.registerCommand("terminalGrid.open2x3",()=>T.createOrShow(n,2,3)),b.commands.registerCommand("terminalGrid.open3x3",()=>T.createOrShow(n,3,3)),b.commands.registerCommand("terminalGrid.newTab",()=>{let m=C.getActive(),v=b.workspace.getConfiguration("terminalGrid"),h=m?.getRows()??v.get("defaultRows",2),g=m?.getCols()??v.get("defaultCols",3);T.createOrShow(n,h,g,{forceNewTab:!0})}),b.commands.registerCommand("terminalGrid.duplicateTab",async()=>{let m=C.getActive();if(!m){b.window.showWarningMessage(b.l10n.t("No active tab to duplicate."));return}let v=m.getRows(),h=m.getCols(),g=m.getTabId(),y=O.next(n);await f.cloneTab(g,y),T.createOrShow(n,v,h,{forceNewTab:!0,tabIdOverride:y}),b.window.showInformationMessage(b.l10n.t("Tab duplicated. Terminal history is not copied; cells will start with the configured startup commands."))}),b.commands.registerCommand("terminalGrid.closeTab",()=>{if(C.size()<=1){b.window.showWarningMessage(b.l10n.t("Cannot close the last remaining tab."));return}let m=C.getActive();m&&m.dispose()}),b.commands.registerCommand("terminalGrid.resetCellIds",async()=>{if(C.size()>0){b.window.showWarningMessage(b.l10n.t("Close all Terminal Grid tabs before resetting cell IDs."));return}await A.reset(n),await O.reset(n),b.window.showInformationMessage(b.l10n.t("Cell IDs and tab counter reset."))}),b.commands.registerCommand("terminalGrid.resetAllTabs",async()=>{await b.window.showWarningMessage(b.l10n.t("Close all Terminal Grid tabs and wipe persisted tab state? This cannot be undone."),{modal:!0},b.l10n.t("Reset"))===b.l10n.t("Reset")&&(p=!0,o.cancel(),f.finishRestore(),C.disposeAll(),await A.reset(n),await O.reset(n),await f.setLastTabs([]),await n.workspaceState.update("lastGrid",void 0),await n.workspaceState.update("pendingFirstTabId",void 0),b.window.showInformationMessage(b.l10n.t("All Terminal Grid tabs and persisted state reset.")))}),b.commands.registerCommand("terminalGrid.sendToCell",(m,v)=>{let h=A.resolve(m);return h?C.get(h.tabId)?.sendToCell(h.localCellId,v)??!1:!1}),b.commands.registerCommand("terminalGrid.readCell",(m,v)=>{let h=A.resolve(m);return h?C.get(h.tabId)?.readCell(h.localCellId,v)??null:null}),b.commands.registerCommand("terminalGrid.getGridInfo",()=>{let m=C.getActive();if(!m)return null;let v=C.entries().map(([h,g])=>({tabId:h,rows:g.getRows(),cols:g.getCols(),cellIds:g.getCellIds(),labels:g.getCellLabels()}));return{rows:m.getRows(),cols:m.getCols(),cellCount:m.getCellCount(),cellLabels:m.getCellLabels(),tabs:v,activeTabId:C.getActiveTabId()??null}}),b.commands.registerCommand("terminalGrid.testAPI",async()=>{let m=b.window.createOutputChannel("Terminal Grid Tests");m.show(),m.appendLine(`=== Terminal Grid API Tests ===
`);let v=0,h=0;function g(M,G,W){let H=G?"PASS":"FAIL";G?v++:h++,m.appendLine(`[${H}] ${M}${W?" \u2014 "+W:""}`)}let y=await b.commands.executeCommand("terminalGrid.getGridInfo");if(!y){m.appendLine("[FAIL] getGridInfo returned null. Open a grid first.");return}g("getGridInfo returns object",!!y,JSON.stringify(y)),g("rows is number",typeof y.rows=="number",`rows=${y.rows}`),g("cols is number",typeof y.cols=="number",`cols=${y.cols}`),g("cellCount = rows*cols",y.cellCount===y.rows*y.cols,`${y.cellCount}`),g("cellLabels is array",Array.isArray(y.cellLabels),`length=${y.cellLabels.length}`),g("cellLabels.length = cellCount",y.cellLabels.length===y.cellCount);let _=await b.commands.executeCommand("terminalGrid.sendToCell",0,"echo __API_TEST__\r");g("sendToCell(0) returns true",_===!0);let x=await b.commands.executeCommand("terminalGrid.sendToCell",999,"x\r");g("sendToCell(999) returns false",x===!1,`got ${x}`);let I=await b.commands.executeCommand("terminalGrid.sendToCell",0,"TYPED_ONLY");g("sendToCell without \\r returns true",I===!0),await new Promise(M=>setTimeout(M,2e3)),await b.commands.executeCommand("terminalGrid.sendToCell",0,"");let S=await b.commands.executeCommand("terminalGrid.readCell",0);g("readCell(0) returns string",typeof S=="string",`length=${S?.length??0}`),g("readCell(0) contains test marker",!!S&&S.includes("__API_TEST__"));let N=await b.commands.executeCommand("terminalGrid.readCell",0,3);g("readCell(0, 3) returns string",typeof N=="string");let B=await b.commands.executeCommand("terminalGrid.readCell",0,0);g("readCell(0, 0) returns empty",B==="",`got "${B}"`);let ee=await b.commands.executeCommand("terminalGrid.readCell",999);if(g("readCell(999) returns null",ee===null,`got ${ee}`),y.cellCount>1){let M=await b.commands.executeCommand("terminalGrid.sendToCell",1,"echo CELL1_OK\r");g("sendToCell(1) returns true",M===!0),await new Promise(W=>setTimeout(W,1500));let G=await b.commands.executeCommand("terminalGrid.readCell",1);g("readCell(1) contains CELL1_OK",!!G&&G.includes("CELL1_OK"))}if(y.tabs&&y.tabs.length>1){m.appendLine(`
--- Multi-tab tests ---`);let M=y.tabs.flatMap(ke=>ke.cellIds),G=new Set(M);g("global cell ids unique across all tabs",G.size===M.length,`${M.length} ids`),g("activeTabId is a number",typeof y.activeTabId=="number");let W=y.tabs[1],H=W.cellIds[0],ut=await b.commands.executeCommand("terminalGrid.sendToCell",H,"echo __MULTITAB_OK__\r");g(`sendToCell global=${H} (tab ${W.tabId+1} cell 1) returns true`,ut===!0),await new Promise(ke=>setTimeout(ke,1500));let Ne=await b.commands.executeCommand("terminalGrid.readCell",H);g(`readCell global=${H} contains __MULTITAB_OK__`,!!Ne&&Ne.includes("__MULTITAB_OK__"));let Be=Math.max(...M)+1e4,mt=await b.commands.executeCommand("terminalGrid.sendToCell",Be,"x");g(`sendToCell with bogus global id=${Be} returns false`,mt===!1)}else y.tabs&&m.appendLine(`
(Multi-tab tests skipped: only ${y.tabs.length} tab open. Open a second tab via the sidebar to enable.)`);m.appendLine(`
=== ${v} passed, ${h} failed ===`),h===0?b.window.showInformationMessage(b.l10n.t("Terminal Grid API: All {0} tests passed!",v)):b.window.showWarningMessage(b.l10n.t("Terminal Grid API: {0} test(s) failed. See output.",h))}),b.commands.registerCommand("terminalGrid.copyMcpConfig",async()=>{if(s<=0){b.window.showWarningMessage(b.l10n.t("Terminal Grid API bridge is disabled or not ready."));return}let m=s,h={mcpServers:{"terminal-grid":{command:"node",args:[j.ensureStableMcpScript(n)],env:{}}}};await b.env.clipboard.writeText(JSON.stringify(h,null,2)),b.window.showInformationMessage(b.l10n.t("Terminal Grid MCP config copied to clipboard (port {0})",m))}))}function qt(){oe=!0,Q?.stop(),Q=void 0,C.disposeAll(!0)}0&&(module.exports={activate,deactivate});
/*! Bundled license information:

smol-toml/dist/date.js:
smol-toml/dist/error.js:
smol-toml/dist/util.js:
smol-toml/dist/primitive.js:
smol-toml/dist/extract.js:
smol-toml/dist/struct.js:
smol-toml/dist/parse.js:
smol-toml/dist/stringify.js:
smol-toml/dist/index.js:
  (*!
   * Copyright (c) Squirrel Chat et al., All rights reserved.
   * SPDX-License-Identifier: BSD-3-Clause
   *
   * Redistribution and use in source and binary forms, with or without
   * modification, are permitted provided that the following conditions are met:
   *
   * 1. Redistributions of source code must retain the above copyright notice, this
   *    list of conditions and the following disclaimer.
   * 2. Redistributions in binary form must reproduce the above copyright notice,
   *    this list of conditions and the following disclaimer in the
   *    documentation and/or other materials provided with the distribution.
   * 3. Neither the name of the copyright holder nor the names of its contributors
   *    may be used to endorse or promote products derived from this software without
   *    specific prior written permission.
   *
   * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
   * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
   * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
   * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
   * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
   * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
   * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
   * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
   * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
   * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
   *)
*/

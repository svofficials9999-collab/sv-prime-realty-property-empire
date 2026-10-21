/* SV round APP INSTALL button (add-only): floating jewel button. Does not change existing layout, buttons or install code. */
(function(){
'use strict';
if(window.__svRoundInstall)return;window.__svRoundInstall=1;
var APP='PROPERTY EMPIRE';
var BOTTOM='calc(84px + env(safe-area-inset-bottom,0px))';
function ready(fn){if(document.body){fn()}else{document.addEventListener('DOMContentLoaded',fn)}}
ready(function(){
try{
var css=
'.sv-ri-btn{position:fixed;right:14px;bottom:'+BOTTOM+';width:72px;height:72px;border-radius:50%;border:2px solid #d9fcff;color:#fff;background:radial-gradient(circle at 30% 20%,#57eeff,#157ab5 35%,#6b24b5 68%,#131236);box-shadow:0 0 8px #c9fbff,inset 0 0 13px #ffffff65,0 0 24px #00d9ff85,0 0 34px #af3dff65;display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:900;cursor:pointer;z-index:9990;animation:svRiJewel 3s ease-in-out infinite;isolation:isolate;padding:0;font-family:system-ui,sans-serif;-webkit-tap-highlight-color:transparent}'
+'.sv-ri-btn:before{content:"";position:absolute;inset:-6px;border:1px dashed #66ebff;border-radius:50%;animation:svRiOrbit 14s linear infinite;z-index:-1}'
+'.sv-ri-btn .sv-ri-arrow{font-size:26px;line-height:1;text-shadow:0 0 10px #fff}'
+'.sv-ri-btn .sv-ri-word{font-size:9px;letter-spacing:.3px;line-height:1.5;text-align:center;font-weight:900}'
+'.sv-ri-btn:active{transform:scale(.94)}'
+'.sv-ri-btn:focus-visible{outline:3px solid #ffdf61;outline-offset:6px}'
+'.sv-ri-note{position:fixed;right:14px;bottom:calc(100px + env(safe-area-inset-bottom,0px));max-width:280px;background:linear-gradient(120deg,#302049f2,#112f48f2);color:#ffe98a;border:1px solid #ffcf6dcc;border-left:4px solid #ffcf6d;border-radius:12px;padding:10px 12px;font:700 13px/1.6 "Noto Sans Telugu","Nirmala UI",system-ui,sans-serif;z-index:9991;box-shadow:0 6px 24px rgba(0,0,0,.55);text-align:left}'
+'@keyframes svRiJewel{50%{box-shadow:0 0 12px #fff,inset 0 0 16px #ffffff65,0 0 32px #00d9ff99,0 0 44px #af3dff88}}'
+'@keyframes svRiOrbit{to{transform:rotate(360deg)}}'
+'@media(prefers-reduced-motion:reduce){.sv-ri-btn,.sv-ri-btn:before{animation:none}}'
+'@media(max-width:380px){.sv-ri-btn{width:64px;height:64px}.sv-ri-btn .sv-ri-word{font-size:8px}}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
var installed=false;
try{installed=(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)||window.navigator.standalone===true}catch(e){}
var deferred=null;
window.addEventListener('beforeinstallprompt',function(e){try{e.preventDefault()}catch(_){}deferred=e});
window.addEventListener('appinstalled',function(){installed=true;deferred=null;paint();note('\u2713 \u0C2F\u0C3E\u0C2A\u0C4D \u0C07\u0C28\u0C4D\u0C38\u0C4D\u0C1F\u0C3E\u0C32\u0C4D \u0C05\u0C2F\u0C3F\u0C02\u0C26\u0C3F \u00B7 App installed.')});
var b=document.createElement('button');
b.type='button';b.className='sv-ri-btn';b.id='sv-round-install';
function paint(){b.innerHTML='<span class="sv-ri-arrow" aria-hidden="true">'+(installed?'\u2713':'\u21E9')+'</span><span class="sv-ri-word">APP INSTALL</span>';b.setAttribute('aria-label',installed?'App mode':'Install '+APP)}
paint();
var noteEl=null,noteT=null;
function note(t){
 if(!noteEl){noteEl=document.createElement('div');noteEl.className='sv-ri-note';noteEl.setAttribute('role','status');document.body.appendChild(noteEl)}
 noteEl.textContent=t;noteEl.style.display='block';
 if(noteT)clearTimeout(noteT);
 noteT=setTimeout(function(){if(noteEl)noteEl.style.display='none'},7000);
}
function helpText(){
 if(/iPhone|iPad|iPod/.test(navigator.userAgent))return 'Safari \u0C32\u0C4B \u0C24\u0C46\u0C30\u0C35\u0C02\u0C21\u0C3F \u2192 Share \u2192 Add to Home Screen. \u00B7 Open in Safari, tap Share, then Add to Home Screen.';
 return 'Chrome \u0C32\u0C4B \u22EE \u0C2E\u0C46\u0C28\u0C42 \u2192 Install app / Add to Home screen \u0C0E\u0C02\u0C1A\u0C41\u0C15\u0C4B\u0C02\u0C21\u0C3F. WhatsApp \u0C32\u0C4B \u0C09\u0C02\u0C1F\u0C47 \u0C2E\u0C41\u0C02\u0C26\u0C41\u0C17\u0C3E \u0C2C\u0C4D\u0C30\u0C4C\u0C1C\u0C30\u0C4D\u0C32\u0C4B \u0C24\u0C46\u0C30\u0C35\u0C02\u0C21\u0C3F. \u00B7 In Chrome: \u22EE menu \u2192 Install app / Add to Home screen. From WhatsApp, open this page in your browser first.';
}
b.addEventListener('click',function(){
 if(installed){note('\u2713 \u0C2F\u0C3E\u0C2A\u0C4D \u0C2E\u0C4B\u0C21\u0C4D\u0C32\u0C4B \u0C09\u0C28\u0C4D\u0C28\u0C3E\u0C30\u0C41 \u00B7 Already in app mode.');return}
 if(deferred){
  var e=deferred;deferred=null;
  Promise.resolve().then(function(){return e.prompt()}).then(function(){return e.userChoice}).then(function(c){
   note(c&&c.outcome==='accepted'?'\u0C07\u0C28\u0C4D\u0C38\u0C4D\u0C1F\u0C3E\u0C32\u0C4D \u0C05\u0C02\u0C17\u0C40\u0C15\u0C30\u0C3F\u0C02\u0C1A\u0C3E\u0C30\u0C41 \u00B7 Install accepted.':'\u0C24\u0C30\u0C41\u0C35\u0C3E\u0C24 \u0C07\u0C28\u0C4D\u0C38\u0C4D\u0C1F\u0C3E\u0C32\u0C4D \u0C1A\u0C47\u0C38\u0C41\u0C15\u0C4B\u0C35\u0C1A\u0C4D\u0C1A\u0C41 \u00B7 You can install later.');
  }).catch(function(){note(helpText())});
  return;
 }
 note(helpText());
});
document.body.appendChild(b);
}catch(e){}
});
})();

/*! For license information please see 768.9bb6d580.chunk.js.LICENSE.txt */
"use strict";(globalThis.webpackChunkionic_app_base=globalThis.webpackChunkionic_app_base||[]).push([[768],{768:(e,t,i)=>{i.r(t),i.d(t,{KEYBOARD_DID_CLOSE:()=>a,KEYBOARD_DID_OPEN:()=>s,copyVisualViewport:()=>k,keyboardDidClose:()=>u,keyboardDidOpen:()=>l,keyboardDidResize:()=>w,resetKeyboardAssist:()=>h,setKeyboardClose:()=>c,setKeyboardOpen:()=>g,startKeyboardAssist:()=>p,trackViewportChanges:()=>D});var o=i(793);const s="ionKeyboardDidShow",a="ionKeyboardDidHide";let d={},n={},r=!1;const h=()=>{d={},n={},r=!1},p=e=>{if(o.K.getEngine())b(e);else{if(!e.visualViewport)return;n=k(e.visualViewport),e.visualViewport.onresize=()=>{D(e),l()||w(e)?g(e):u(e)&&c(e)}}},b=e=>{e.addEventListener("keyboardDidShow",(t=>g(e,t))),e.addEventListener("keyboardDidHide",(()=>c(e)))},g=(e,t)=>{f(e,t),r=!0},c=e=>{y(e),r=!1},l=()=>{const e=(d.height-n.height)*n.scale;return!r&&d.width===n.width&&e>150},w=e=>r&&!u(e),u=e=>r&&n.height===e.innerHeight,f=(e,t)=>{const i=t?t.keyboardHeight:e.innerHeight-n.height,o=new CustomEvent(s,{detail:{keyboardHeight:i}});e.dispatchEvent(o)},y=e=>{const t=new CustomEvent(a);e.dispatchEvent(t)},D=e=>{d=Object.assign({},n),n=k(e.visualViewport)},k=e=>({width:Math.round(e.width),height:Math.round(e.height),offsetTop:e.offsetTop,offsetLeft:e.offsetLeft,pageTop:e.pageTop,pageLeft:e.pageLeft,scale:e.scale})}}]);
//# sourceMappingURL=768.9bb6d580.chunk.js.map
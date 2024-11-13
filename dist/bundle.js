(()=>{"use strict";const e=/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,t="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36,gzip(gfe)",n=/<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g;class r extends Error{constructor(e){super(`[YoutubeTranscript] 🚨 ${e}`)}}class o extends r{constructor(){super("YouTube is receiving too many requests from this IP and now requires solving a captcha to continue")}}class i extends r{constructor(e){super(`The video is no longer available (${e})`)}}class a extends r{constructor(e){super(`Transcript is disabled on this video (${e})`)}}class s extends r{constructor(e){super(`No transcripts are available for this video (${e})`)}}class c extends r{constructor(e,t,n){super(`No transcripts are available in ${e} this video (${n}). Available languages: ${t.join(", ")}`)}}class l{static fetchTranscript(e,r){var l,u,d,p,f;return u=this,d=void 0,f=function*(){const u=this.retrieveVideoId(e),d=yield fetch(`https://www.youtube.com/watch?v=${u}`,{headers:Object.assign(Object.assign({},(null==r?void 0:r.lang)&&{"Accept-Language":r.lang}),{"User-Agent":t})}),p=yield d.text(),f=p.split('"captions":');if(f.length<=1){if(p.includes('class="g-recaptcha"'))throw new o;if(!p.includes('"playabilityStatus":'))throw new i(e);throw new a(e)}const g=null===(l=(()=>{try{return JSON.parse(f[1].split(',"videoDetails')[0].replace("\n",""))}catch(e){return}})())||void 0===l?void 0:l.playerCaptionsTracklistRenderer;if(!g)throw new a(e);if(!("captionTracks"in g))throw new s(e);if((null==r?void 0:r.lang)&&!g.captionTracks.some((e=>e.languageCode===(null==r?void 0:r.lang))))throw new c(null==r?void 0:r.lang,g.captionTracks.map((e=>e.languageCode)),e);const v=((null==r?void 0:r.lang)?g.captionTracks.find((e=>e.languageCode===(null==r?void 0:r.lang))):g.captionTracks[0]).baseUrl,h=yield fetch(v,{headers:Object.assign(Object.assign({},(null==r?void 0:r.lang)&&{"Accept-Language":r.lang}),{"User-Agent":t})});if(!h.ok)throw new s(e);return[...(yield h.text()).matchAll(n)].map((e=>{var t;return{text:e[3],duration:parseFloat(e[2]),offset:parseFloat(e[1]),lang:null!==(t=null==r?void 0:r.lang)&&void 0!==t?t:g.captionTracks[0].languageCode}}))},new((p=void 0)||(p=Promise))((function(e,t){function n(e){try{o(f.next(e))}catch(e){t(e)}}function r(e){try{o(f.throw(e))}catch(e){t(e)}}function o(t){var o;t.done?e(t.value):(o=t.value,o instanceof p?o:new p((function(e){e(o)}))).then(n,r)}o((f=f.apply(u,d||[])).next())}))}static retrieveVideoId(t){if(11===t.length)return t;const n=t.match(e);if(n&&n.length)return n[1];throw new r("Impossible to retrieve Youtube video ID.")}}function u(e){return u="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},u(e)}console.log("Loaded");var d="",p="";chrome.runtime.onMessage.addListener((function(e,t,n){var r=e.type,o=e.videoID;"NEW"===r&&(d=o,l.fetchTranscript(o).then((function(e){var t,n,r;p=e.map((function(e){return e.text})).join(" "),console.log("Transcript fetched:",p),chrome.storage.sync.set((t={},r=p,(n=function(e){var t=function(e){if("object"!=u(e)||!e)return e;var t=e[Symbol.toPrimitive];if(void 0!==t){var n=t.call(e,"string");if("object"!=u(n))return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(e)}(e);return"symbol"==u(t)?t:t+""}(n=d))in t?Object.defineProperty(t,n,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[n]=r,t))})).catch((function(e){console.error("Error fetching transcript:",e)})))}))})();
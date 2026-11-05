/* Analitika: Google Analytics 4 va Yandex Metrika. ID'larni assets/config.js dagi `analytics` ga yozing.
   ID bo'sh bo'lsa, hech narsa yuklanmaydi. Tugmalar bosilishi "event" sifatida yoziladi. */
(function(){
var C=window.CLINIC||{},A=C.analytics||{};
window.dataLayer=window.dataLayer||[];
function gtag(){window.dataLayer.push(arguments)}
if(A.ga4){
  var s=document.createElement("script");s.async=true;s.src="https://www.googletagmanager.com/gtag/js?id="+encodeURIComponent(A.ga4);document.head.appendChild(s);
  gtag("js",new Date());gtag("config",A.ga4,{anonymize_ip:true});
}
if(A.ym){
  (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t);a=e.getElementsByTagName(t)[0];k.async=1;k.src=r;a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
  window.ym(A.ym,"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:false});
}
window.track=function(name,params){
  try{if(A.ga4)gtag("event",name,params||{});if(A.ym&&window.ym)window.ym(A.ym,"reachGoal",name,params||{})}catch(e){}
};
// Bosilishlar: telefon, WhatsApp, Telegram, xarita, til, narxlar tabi
document.addEventListener("click",function(e){
  var a=e.target.closest&&e.target.closest("a");if(!a)return;var h=a.getAttribute("href")||"";
  if(h.indexOf("tel:")===0)window.track("phone_click",{href:h});
  else if(h.indexOf("wa.me")>-1)window.track("whatsapp_click");
  else if(h.indexOf("t.me/")>-1)window.track("telegram_click",{href:h});
  else if(/g\.page|google\.com\/maps|yandex\.uz\/maps/.test(h))window.track("map_click");
  else if(a.hasAttribute("data-l"))window.track("language_change",{lang:a.getAttribute("data-l")});
  else if(h.indexOf("#contact")>-1)window.track("book_click");
},true);
})();

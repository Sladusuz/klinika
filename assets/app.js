(function(){
var C=window.CLINIC,T=window.I18N,$=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
var lang="uz";try{lang=localStorage.getItem("lang")||(navigator.language||"").slice(0,2)}catch(e){}
if(!T[lang])lang="uz";
var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches,fine=matchMedia("(hover:hover) and (pointer:fine)").matches;
var G=!!(window.gsap&&window.ScrollTrigger)&&!reduce;
var ic=function(n,c){return'<svg class="i'+(c?" "+c:"")+'" aria-hidden="true"><use href="#i-'+n+'"/></svg>'};
var SV=["ear","nose","throat","baby","steth","wave","file","zap"],WY=["target","shield","heart","zap"],CE=["file","award","shield"],HM=["zap","target","heart"],FDI=["ear","nose","throat"],PRI=["phone","cal","steth"];
var ANCH=["#services","#doctors","#prices","#reviews","#faq","#contact"];
if(G){gsap.registerPlugin(ScrollTrigger);document.documentElement.classList.add("gsap-on")}

/* ---------- smooth scroll ---------- */
var lenis=null;
if(G&&window.Lenis&&fine){
 lenis=new Lenis({duration:1.15,easing:function(t){return Math.min(1,1.001-Math.pow(2,-10*t))},smoothWheel:true});
 lenis.on("scroll",ScrollTrigger.update);
 gsap.ticker.add(function(t){lenis.raf(t*1000)});gsap.ticker.lagSmoothing(0);
}
document.addEventListener("click",function(e){var a=e.target.closest('a[href^="#"]');if(!a)return;var h=a.getAttribute("href");if(h==="#")return;var el=$(h);if(!el)return;e.preventDefault();
 if(lenis)lenis.scrollTo(el,{offset:h==="#top"?0:-70,duration:1.4});else el.scrollIntoView({behavior:"smooth"})});

function split(el){var words=el.textContent.trim().split(/\s+/);el.innerHTML=words.map(function(w){return'<span class="w"><span>'+w+'</span></span>'}).join(" ")}

/* ---------- render ---------- */
var fdi=0;
function render(){
 var t=T[lang];document.documentElement.lang=lang;document.title=t.title;$('meta[name=description]').content=t.desc;
 $('meta[property="og:title"]').content=t.title;$('meta[property="og:description"]').content=t.desc;
 $$("[data-t]").forEach(function(e){e.textContent=t[e.dataset.t]});
 $$("[data-split]").forEach(split);
 $$(".menu a,.drawer a.l").forEach(function(a){a.textContent=t.nav[ANCH.indexOf(a.getAttribute("href"))]});
 $("#fnav").innerHTML=t.nav.map(function(n,i){return'<a href="'+ANCH[i]+'">'+n+'</a>'}).join("");
 var h=function(id,arr,fn){$(id).innerHTML=arr.map(fn).join("")};
 h("#hm",t.hm,function(x,i){return'<li>'+ic(HM[i])+x+'</li>'});
 var mq=t.mq.map(function(x){return'<span>'+x+ic("star")+'</span>'}).join("");$("#bmq").innerHTML=mq+mq+mq+mq;
 h("#fdt",t.fd,function(x,i){return'<button class="fd-tab" role="tab" data-i="'+i+'">'+ic(FDI[i])+x[0]+'</button>'});
 $$(".fd-tab").forEach(function(b){b.onclick=function(){showFd(+b.dataset.i,true)}});
 showFd(fdi,false);
 h("#sv",t.sv,function(x,i){return'<article class="svc spot tilt"><span class="num">0'+(i+1)+'</span><div class="ico">'+ic(SV[i])+'</div><h3>'+x[1]+'</h3><p>'+x[2]+'</p><a class="go" href="#contact" data-svi="'+i+'">'+t.more+ic("up")+'</a></article>'});
 $$(".svc .go").forEach(function(a){a.addEventListener("click",function(){var i=+a.dataset.svi;$("#fs").selectedIndex=i+1})});
 h("#wy",t.wy,function(x,i){return'<article class="wi reveal"><div class="ico">'+ic(WY[i])+'</div><div><h3>'+x[1]+'</h3><p>'+x[2]+'</p></div><b>0'+(i+1)+'</b></article>'});
 h("#stats",t.stats,function(x){var n=/^\d+$/.test(x[0]);return'<div class="stat"><b'+(n?' data-count="'+x[0]+'"':'')+'>'+x[0]+'</b><span>'+x[1]+'</span></div>'});
 h("#dr",t.dr,function(x){var ch=(x[4]||[]).map(function(c){return'<div><b>'+c[0]+'</b><span>'+c[1]+'</span></div>'}).join('');return'<article class="card doc spot tilt reveal"><div class="ph">'+(x[3]?'<img src="'+x[3]+'" alt="'+x[0]+'" loading="lazy" width="800" height="880">':ic("user"))+'<em>'+t.dr_ph+'</em></div><div class="bd"><h3>'+x[0]+'</h3><small>'+x[1]+'</small><p>'+x[2]+'</p>'+(ch?'<div class="dstat">'+ch+'</div>':'')+'</div></article>'});
 h("#ce",t.ce,function(x,i){return'<div class="card cert spot reveal"><div class="ico">'+ic(CE[i])+'</div><h3>'+x[1]+'</h3></div>'});
 h("#pr",t.pr,function(x){return'<div class="prow"><span>'+x[0]+'</span><em>'+x[1]+'</em></div>'});
 var rv=t.rv.concat(t.rv).concat(t.rv).concat(t.rv);
 h("#rv",rv,function(x){return'<article class="card rev">'+ic("quote","q")+'<div class="stars">'+ic("star").repeat(5)+'</div><p>“'+x[0]+'”</p><div class="who"><span>'+ic("user")+'</span>'+x[1]+'</div></article>'});
 h("#st",t.st,function(x,i){return'<article class="pr-step"><div class="pr-n">0'+(i+1)+'</div><div><div class="pr-ic">'+ic(PRI[i])+'</div><h3>'+x[0]+'</h3><p>'+x[1]+'</p></div></article>'});
 h("#fq",t.fq,function(x){return'<details class="reveal"><summary>'+x[0]+'</summary><p>'+x[1]+'</p></details>'});
 $("#fs").innerHTML=t.svopt.map(function(o){return"<option>"+o+"</option>"}).join("");
 $("#ad").textContent=C.address[lang];
 $$(".lang button").forEach(function(b){b.classList.toggle("on",b.dataset.l===lang)});
 $$("[data-ph]").forEach(function(a){a.href="tel:"+C.phone;var s=a.querySelector("span:not([data-t])");if(s)s.textContent=C.phoneView});
 sndLabel();
 bindFx();
}

/* ---------- finder ---------- */
function showFd(i,anim){
 var t=T[lang].fd[i];fdi=i;
 $$("#fdt .fd-tab").forEach(function(b,k){b.classList.toggle("on",k===i);b.setAttribute("aria-selected",k===i)});
 var apply=function(){$("#fda").innerHTML=ic(FDI[i]);$("#fdh").textContent=t[1];$("#fdd").textContent=t[3];$("#fdc").innerHTML=t[2].map(function(x){return'<li>'+ic("check")+x+'</li>'}).join("")};
 if(G&&anim){gsap.to("#fdp .fd-body > *",{opacity:0,y:14,duration:.16,overwrite:true,onComplete:function(){apply();
  gsap.fromTo("#fdp .fd-body > *",{opacity:0,y:22},{opacity:1,y:0,duration:.55,stagger:.07,ease:"power3.out"});
  gsap.fromTo("#fda",{opacity:0,scale:.55,rotate:-24},{opacity:1,scale:1,rotate:0,duration:.8,ease:"back.out(1.8)"})}})}
 else apply();
}
$("#fdb").addEventListener("click",function(){$("#fs").selectedIndex=1+fdi});

/* ---------- pointer effects ---------- */
function bindFx(){
 $$(".spot").forEach(function(c){if(c._s)return;c._s=1;c.addEventListener("pointermove",function(e){var r=c.getBoundingClientRect();c.style.setProperty("--mx",e.clientX-r.left+"px");c.style.setProperty("--my",e.clientY-r.top+"px")})});
 if(!G||!fine)return;
 $$(".tilt").forEach(function(c){if(c._t)return;c._t=1;
  c.addEventListener("pointermove",function(e){var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;gsap.to(c,{rotationY:x*8,rotationX:-y*8,transformPerspective:900,duration:.5,ease:"power2.out",overwrite:"auto"})});
  c.addEventListener("pointerleave",function(){gsap.to(c,{rotationX:0,rotationY:0,duration:.8,ease:"elastic.out(1,.6)",overwrite:"auto"})})});
 $$(".mag").forEach(function(b){if(b._m)return;b._m=1;
  b.addEventListener("pointermove",function(e){var r=b.getBoundingClientRect();gsap.to(b,{x:(e.clientX-r.left-r.width/2)*.28,y:(e.clientY-r.top-r.height/2)*.4,duration:.4,ease:"power3.out"})});
  b.addEventListener("pointerleave",function(){gsap.to(b,{x:0,y:0,duration:.9,ease:"elastic.out(1,.5)"})})});
}
if(G&&fine){
 var cur=$("#cur"),cs=$("span",cur);document.body.classList.add("has-cur");
 var qx=gsap.quickTo(cur,"x",{duration:.35,ease:"power3"}),qy=gsap.quickTo(cur,"y",{duration:.35,ease:"power3"});
 addEventListener("pointermove",function(e){qx(e.clientX);qy(e.clientY)},{passive:true});
 document.addEventListener("pointerover",function(e){var l=e.target.closest("[data-cur]");cur.classList.toggle("lbl",!!l);if(l)cs.textContent=l.dataset.cur;cur.classList.toggle("big",!l&&!!e.target.closest("a,button,summary,.fd-tab,.tilt"))});
 $(".hero").addEventListener("pointermove",function(e){var x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;gsap.to(".blob",{x:x*-18,y:y*-14,duration:1,ease:"power2.out"});gsap.to(".glass",{x:x*26,y:y*20,duration:1.2,ease:"power2.out"});gsap.to(".badge-rot",{x:x*-30,y:y*-22,duration:1.2,ease:"power2.out"})});
}

/* ---------- hero canvas: living sound lines ---------- */
(function(){
 var hero=$(".hero"),cv=$("#fx"),c=cv.getContext("2d");if(!c)return;
 var dpr=Math.min(devicePixelRatio||1,1.5),W=0,H=0,L=56,step=12,mx=.6,my=.5,tx=.6,ty=.5,act=0,run=true,vel=0,last=pageYOffset;
 function size(){var r=hero.getBoundingClientRect();W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;c.setTransform(dpr,0,0,dpr,0,0);L=W<700?30:58;step=W<700?20:12}
 size();addEventListener("resize",size);
 hero.addEventListener("pointermove",function(e){var r=hero.getBoundingClientRect();tx=(e.clientX-r.left)/r.width;ty=(e.clientY-r.top)/r.height;act=1});
 if("IntersectionObserver"in window)new IntersectionObserver(function(es){run=es[0].isIntersecting}).observe(hero);
 function draw(now){
  var t=now/1000;mx+=(tx-mx)*.06;my+=(ty-my)*.06;act*=.988;
  var dy=pageYOffset-last;last=pageYOffset;vel=vel*.9+Math.min(Math.abs(dy),60)*.1;
  c.clearRect(0,0,W,H);
  var g=c.createLinearGradient(0,0,W,0);g.addColorStop(0,"#7db4ff");g.addColorStop(.5,"#1b8f8a");g.addColorStop(1,"#4be08c");
  c.strokeStyle=g;c.lineWidth=1.25;
  for(var i=0;i<L;i++){
   var u=i/(L-1),base=H*(.1+.82*u),prox=Math.max(0,1-Math.abs(u-my)*2.4);
   c.globalAlpha=.06+.2*Math.pow(Math.sin(Math.PI*u),1.4);
   c.beginPath();
   for(var x=0;x<=W+step;x+=step){
    var xn=x/W,env=Math.exp(-Math.pow((xn-mx)/.2,2))*(.35+act*.95);
    var y=base+Math.sin(xn*7+t*1.1+u*5)*14+Math.sin(xn*15-t*1.7+u*9)*7+Math.sin(xn*38+t*4.2+u*4)*env*50*(.25+prox)+Math.sin(xn*20+t*3)*vel*1.4;
    x?c.lineTo(x,y):c.moveTo(x,y)}
   c.stroke()}
  c.globalAlpha=1}
 function frame(now){requestAnimationFrame(frame);if(run)draw(now)}
 if(reduce)draw(0);else requestAnimationFrame(frame);
})();

/* ---------- scroll experiences ---------- */
var ctx=null,wasDesk=null,bv=0;
function build(){
 if(!G)return;
 if(ctx)ctx.revert();
 var desk=innerWidth>1024;wasDesk=desk;
 ctx=gsap.context(function(){
  ScrollTrigger.batch(".reveal",{start:"top 90%",once:true,onEnter:function(els){gsap.fromTo(els,{y:46,opacity:0},{y:0,opacity:1,duration:1,stagger:.12,ease:"power3.out",overwrite:"auto"})}});
  $$("[data-split]").forEach(function(el){if(el.closest(".hero"))return;
   gsap.from($$(".w>span",el),{yPercent:115,duration:1.1,stagger:.06,ease:"power4.out",scrollTrigger:{trigger:el,start:"top 88%",once:true}})});
  $$("[data-par]").forEach(function(el){gsap.fromTo(el,{yPercent:-7},{yPercent:7,ease:"none",scrollTrigger:{trigger:el.parentElement,start:"top bottom",end:"bottom top",scrub:true}})});
  $$("[data-count]").forEach(function(el){var end=+el.dataset.count,o={v:0};el.textContent="0";ScrollTrigger.create({trigger:el,start:"top 92%",once:true,onEnter:function(){gsap.to(o,{v:end,duration:1.8,ease:"power2.out",onUpdate:function(){el.textContent=Math.round(o.v)}})}})});
  ScrollTrigger.create({start:0,end:"max",onUpdate:function(s){bv=s.getVelocity()}});
  if(desk){
   /* horizontal services */
   var track=$("#svt"),bar=$("#hsb");
   var dist=function(){return Math.max(0,track.scrollWidth-innerWidth+parseFloat(getComputedStyle(track).paddingRight||0)+40)};
   var tw=gsap.to(track,{x:function(){return-dist()},ease:"none",scrollTrigger:{trigger:"#svpin",start:"top top",end:function(){return"+="+dist()},pin:true,scrub:1,invalidateOnRefresh:true,anticipatePin:1,onUpdate:function(s){bar.style.transform="scaleX("+s.progress+")"}}});
   $$(".svc").forEach(function(card){gsap.fromTo($(".num",card),{x:60},{x:-90,ease:"none",scrollTrigger:{trigger:card,containerAnimation:tw,start:"left right",end:"right left",scrub:true}});
    gsap.fromTo(card,{opacity:.35,scale:.94},{opacity:1,scale:1,ease:"none",scrollTrigger:{trigger:card,containerAnimation:tw,start:"left 92%",end:"left 55%",scrub:true}})});
   /* pinned process */
   var steps=$$(".pr-step"),n=steps.length,rail=$("#prr");
   gsap.set(steps,{opacity:0,y:70});gsap.set(steps[0],{opacity:1,y:0});
   var tl=gsap.timeline({scrollTrigger:{trigger:"#process",start:"top top",end:"+="+(n*900),pin:true,scrub:.7,onUpdate:function(s){rail.style.transform="scaleX("+s.progress+")"}}});
   steps.forEach(function(s,i){if(i>0){tl.to(steps[i-1],{opacity:0,y:-70,duration:.5,ease:"power2.in"},i*1.5).fromTo(s,{opacity:0,y:70},{opacity:1,y:0,duration:.7,ease:"power3.out"},i*1.5+.35)}});
   tl.to({},{duration:.1},n*1.5-.1);
  }else{
   ScrollTrigger.batch(".svc,.pr-step",{start:"top 90%",once:true,onEnter:function(els){gsap.fromTo(els,{y:50,opacity:0},{y:0,opacity:1,duration:.9,stagger:.12,ease:"power3.out",overwrite:"auto"})}});
  }
 });
 requestAnimationFrame(function(){ScrollTrigger.refresh()});
}
/* marquee driven by scroll velocity */
if(G){var bm=$("#bmq"),bx=0;gsap.ticker.add(function(time,dt){var half=bm.scrollWidth/2;if(!half)return;bx-=(55+Math.min(Math.abs(bv),3500)*.1)*dt/1000;if(bx<=-half)bx+=half;bm.style.transform="translate3d("+bx+"px,0,0)";bv*=.93})}
var rt;addEventListener("resize",function(){clearTimeout(rt);rt=setTimeout(function(){if(!G)return;if((innerWidth>1024)!==wasDesk)build();else ScrollTrigger.refresh()},250)});

/* ---------- video ---------- */
var vid=$("#vid"),vs=$("#vsnd");
function sndLabel(){var t=T[lang],on=!vid.muted;$("#vsndt").textContent=on?t.vd_off:t.vd_on;vs.querySelector("svg use").setAttribute("href","#i-"+(on?"volx":"vol"))}
vs.onclick=function(){vid.muted=!vid.muted;if(!vid.muted){vid.currentTime=0;var p=vid.play();if(p&&p.catch)p.catch(function(){})}sndLabel()};
if("IntersectionObserver"in window)new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){vid.preload="auto";var p=vid.play();if(p&&p.catch)p.catch(function(){})}else{vid.pause();if(!vid.muted){vid.muted=true;sndLabel()}}})},{threshold:.4}).observe(vid);

/* ---------- intro ---------- */
function hideHero(){
 if(!G)return;
 gsap.set(".hero .w>span",{yPercent:115});
 gsap.set([".hero .pill",".hero .lead",".hero .cta",".hmeta li",".blob",".glass",".hname",".badge-rot",".scrollhint"],{opacity:0});
}
function intro(){
 var pl=$("#pl");
 if(!G){pl.style.display="none";return}
 var o={v:0},nm=$("#plnum"),br=$("#plbar");
 var tl=gsap.timeline();
 tl.to(o,{v:100,duration:1.3,ease:"power2.inOut",onUpdate:function(){nm.textContent=Math.round(o.v);br.style.transform="scaleX("+o.v/100+")"}})
  .to(".pl-in",{opacity:0,y:-30,duration:.4,ease:"power2.in"})
  .to(pl,{yPercent:-100,duration:.95,ease:"power4.inOut",onComplete:function(){pl.style.display="none"}},"-=.1")
  .to(".hero .w>span",{yPercent:0,duration:1.25,stagger:.07,ease:"power4.out"},"-=.5")
  .fromTo(".hero .pill,.hero .lead,.hero .cta,.hmeta li,.scrollhint",{opacity:0,y:30},{opacity:1,y:0,duration:.9,stagger:.1,ease:"power3.out"},"-=.9")
  .fromTo(".blob",{opacity:0,scale:.8},{opacity:1,scale:1,duration:1.5,ease:"power3.out"},"-=1.2")
  .fromTo(".glass,.badge-rot,.hname",{opacity:0,scale:.5},{opacity:1,scale:1,duration:.9,stagger:.15,ease:"back.out(1.7)"},"-=.8");
}

/* ---------- ui ---------- */
$$(".lang button").forEach(function(b){b.onclick=function(){lang=b.dataset.l;try{localStorage.setItem("lang",lang)}catch(e){}render();build()}});
var dr=$("#drawer"),bg=$("#burger"),hd=$("#hdr");
function tog(o){dr.classList.toggle("open",o);bg.setAttribute("aria-expanded",o);bg.innerHTML=ic(o?"x":"menu");document.body.style.overflow=o?"hidden":""}
bg.onclick=function(){tog(!dr.classList.contains("open"))};
$$("#drawer a").forEach(function(a){a.addEventListener("click",function(){tog(false)})});
addEventListener("resize",function(){if(innerWidth>1080)tog(false)});
$$("[data-tg]").forEach(function(a){a.href="https://t.me/"+C.telegram;a.target="_blank";a.rel="noopener"});
$("#ig").href=$("#ig2").href="https://instagram.com/"+C.instagram;
if(C.mapQuery){var q=encodeURIComponent(C.mapQuery);$("#map").classList.add("live");$("#map").innerHTML='<iframe src="https://www.google.com/maps?q='+q+'&output=embed" width="100%" height="280" style="border:0" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen title="Map"></iframe>';$("#route").href="https://www.google.com/maps/search/?api=1&query="+q}
var pr=$("#prog");function sc(){var y=pageYOffset;hd.classList.toggle("sc",y>30);var m=document.documentElement.scrollHeight-innerHeight;pr.style.transform="scaleX("+(m>0?y/m:0)+")"}
addEventListener("scroll",sc,{passive:true});sc();
var lb=$("#lb"),lbi=$("img",lb);
document.addEventListener("click",function(e){var f=e.target.closest(".gal figure");if(f){lbi.src=$("img",f).src;lb.classList.add("on")}else if(lb.classList.contains("on"))lb.classList.remove("on")});
addEventListener("keydown",function(e){if(e.key==="Escape"){lb.classList.remove("on");tog(false)}});
$("#botbtn").href="https://t.me/"+(C.botUsername||C.telegram);
(function(){
 var form=$("#form"),sub=$("#fsub"),err=$("#err"),fbt=$("#fbt");
 function showErr(html){err.innerHTML=html;err.style.display=html?"block":"none"}
 form.onsubmit=function(e){e.preventDefault();showErr("");var t=T[lang];
  var phone=form.phone.value,digits=phone.replace(/\D/g,"");
  if(digits.length<9||digits.length>13){showErr(t.fbadp);form.phone.focus();return}
  sub.disabled=true;sub.classList.add("loading");fbt.textContent=t.fsend;
  fetch("/.netlify/functions/lead",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:form.name.value,phone:phone,service:form.service.value,serviceIdx:form.service.selectedIndex,note:form.note.value,lang:lang,website:form.website.value})})
   .then(function(r){return r.json().catch(function(){return{}}).then(function(j){return{ok:r.ok&&j.ok}})})
   .catch(function(){return{ok:false}})
   .then(function(res){
    sub.disabled=false;sub.classList.remove("loading");fbt.textContent=t.fb;
    if(res.ok){form.classList.add("sent");form.reset();if(window.gsap&&!reduce)gsap.from("#ok > *",{y:20,opacity:0,stagger:.12,duration:.6,ease:"power3.out"});setTimeout(function(){form.classList.remove("sent")},9000)}
    else showErr(t.ferr+' <a href="tel:'+C.phone+'">'+C.phoneView+'</a> <a href="https://t.me/'+C.telegram+'" target="_blank" rel="noopener">Telegram</a>')});
 }
})();

render();hideHero();build();
var started=false;function go(){if(started)return;started=true;intro();if(G)ScrollTrigger.refresh()}
if(document.readyState==="complete")go();else addEventListener("load",go);
setTimeout(go,4000);
})();

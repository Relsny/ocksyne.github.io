
// OCKSYNE_RESEAUX_SPECIAL_V1
(() => {
 const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
 const title = document.getElementById("network-title");
 const text = "MES RÉSEAUX";
 title.innerHTML = "";
 [...text].forEach((char,i) => {
   const span = document.createElement("span");
   span.className = "network-letter";
   span.style.setProperty("--letter-index",i);
   span.textContent = char === " " ? "\u00a0" : char;
   title.appendChild(span);
 });
 const dot = document.createElement("span");
 dot.textContent = ".";
 title.appendChild(dot);

 const cards = [...document.querySelectorAll(".network-card")];
 const watch = new IntersectionObserver(entries => {
   entries.forEach(entry => {
     if(entry.isIntersecting) {
       entry.target.classList.add("visible");
       watch.unobserve(entry.target);
     }
   });
 },{threshold:.1});
 cards.forEach(card => {
   watch.observe(card);
   card.addEventListener("pointermove",event => {
     if(reduce)return;
     const rect = card.getBoundingClientRect();
     const x = (event.clientX-rect.left)/rect.width;
     const y = (event.clientY-rect.top)/rect.height;
     card.style.setProperty("--x",x*100+"%");
     card.style.setProperty("--y",y*100+"%");
     card.style.setProperty("--ry",(x-.5)*8+"deg");
     card.style.setProperty("--rx",(.5-y)*8+"deg");
   });
   card.addEventListener("pointerleave",() => {
     card.style.setProperty("--rx","0deg");
     card.style.setProperty("--ry","0deg");
   });
 });

 const finale = document.getElementById("network-finale");
 const finaleWatch = new IntersectionObserver(entries => {
   if(entries.some(entry => entry.isIntersecting)) {
     finale.classList.add("visible");
     finaleWatch.disconnect();
   }
 },{threshold:.25});
 finaleWatch.observe(finale);

 document.getElementById("network-back-top").addEventListener(
  "click",() => scrollTo({top:0,behavior:reduce?"auto":"smooth"})
 );

 const progress = document.getElementById("network-progress");
 addEventListener("scroll",() => {
   const max = document.documentElement.scrollHeight-innerHeight;
   progress.style.transform = "scaleX("+(max>0?scrollY/max:0)+")";
 },{passive:true});

 const cv = document.getElementById("network-particles");
 const ctx = cv.getContext("2d");
 if(!ctx || reduce)return;
 let W=0,H=0;
 function resize(){
   W=cv.width=innerWidth;
   H=cv.height=innerHeight;
 }
 resize();
 addEventListener("resize",resize);

 const particles=Array.from({length:55},() => ({
   x:Math.random()*W,
   y:Math.random()*H,
   r:.5+Math.random()*1.8,
   speed:.15+Math.random()*.55,
   alpha:.2+Math.random()*.6
 }));
 function animate(){
   ctx.clearRect(0,0,W,H);
   particles.forEach(p => {
     p.y-=p.speed;
     if(p.y < -5){p.y=H+5;p.x=Math.random()*W}
     ctx.beginPath();
     ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
     ctx.fillStyle="rgba(255,138,31,"+p.alpha+")";
     ctx.shadowBlur=8;
     ctx.shadowColor="#ff8a1f";
     ctx.fill();
   });
   requestAnimationFrame(animate);
 }
 animate();

 if(matchMedia("(hover:hover) and (pointer:fine)").matches) {
   const cur=document.getElementById("network-cursor");
   const ring=document.getElementById("network-ring");
   let tx=0,ty=0,rx=0,ry=0;
   addEventListener("pointermove",event => {
     tx=event.clientX;ty=event.clientY;
     cur.style.opacity=ring.style.opacity="1";
     cur.style.transform="translate("+tx+"px,"+ty+"px)";
   },{passive:true});
   (function follow(){
     rx+=(tx-rx)*.18;
     ry+=(ty-ry)*.18;
     ring.style.transform="translate("+rx+"px,"+ry+"px)";
     requestAnimationFrame(follow);
   })();
   document.querySelectorAll("a,button").forEach(element => {
     element.addEventListener("pointerenter",() => ring.classList.add("big"));
     element.addEventListener("pointerleave",() => ring.classList.remove("big"));
   });
 }
})();

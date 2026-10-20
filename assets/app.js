
const reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const reveal=document.querySelectorAll(".reveal");
if(reduceMotion||!("IntersectionObserver" in window)){
  reveal.forEach(el=>el.classList.add("visible"));
}else{
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){e.target.classList.add("visible");observer.unobserve(e.target)}
    });
  },{threshold:.08});
  reveal.forEach(el=>observer.observe(el));
}
if(!reduceMotion){
  const canvas=document.getElementById("stars");
  const ctx=canvas.getContext("2d");
  let dots=[];
  function resize(){
    const dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=innerWidth*dpr;
    canvas.height=innerHeight*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    dots=Array.from({length:Math.min(100,Math.floor(innerWidth/14))},()=>({
      x:Math.random()*innerWidth,y:Math.random()*innerHeight,
      r:Math.random()*1.3+.25,v:Math.random()*.27+.06
    }));
  }
  resize();
  addEventListener("resize",resize);
  function frame(){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    for(const p of dots){
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle="rgba(255,255,255,.38)";ctx.fill();
      p.y-=p.v;if(p.y<0)p.y=innerHeight;
    }
    requestAnimationFrame(frame);
  }
  frame();
  const glow=document.querySelector(".glow");
  addEventListener("pointermove",e=>{
    if(e.pointerType==="mouse"){
      glow.style.left=e.clientX+"px";
      glow.style.top=e.clientY+"px";
    }
  },{passive:true});
}


/* OCKSYNE_V2_START */
(() => {
const icon = (symbol) => `<span class="v2-icon">${symbol}</span>`;
const tag = (label) => `<span class="v2-tag">${label}</span>`;
const card = (symbol,title,description,link="") =>
  `<${link ? "a" : "article"} class="v2-card" ${link ? `href="${link}"` : ""}>
  ${icon(symbol)}<h3>${title}</h3><p>${description}</p>
  ${link ? `<span class="v2-more">Explorer ↗</span>` : ""}
  </${link ? "a" : "article"}>`;
const head = (number,name,description) =>
  `<header class="v2-pagehead"><span class="v2-overline">${number} / OCKSYNE WORLD</span>
  <h1>${name}<span class="v2-fade">.</span></h1><p>${description}</p></header>`;
const media = (path,label) =>
  `<div class="v2-media"><span class="v2-media-placeholder">✧<small>${label}</small></span>
  <img data-v2-image src="assets/images/${path}" alt="${label}" loading="lazy"></div>`;
const pfp = () =>
  `<div class="v2-profile-picture"><span class="v2-profile-letter">O</span>
  <img data-v2-image src="assets/images/pfp.png" alt="Photo de profil Ocksyne"></div>`;
const section = (label,content) =>
  `<section class="v2-section"><div class="v2-sectionlabel">${label}</div>${content}</section>`;

const pages = {
"index.html": `
<div class="v2-home">
  <div class="v2-cover"><div class="v2-cover-pattern"></div>
  <span>PERSONAL SPACE / OCKSYNE</span><span>CREATOR • DEVELOPER • GAMER</span></div>
  ${pfp()}
  <div class="v2-overline"><span class="v2-online"></span> DIGITAL CREATOR</div>
  <h1 class="v2-name">OCKSYNE<span class="v2-fade">.</span></h1>
  <p class="v2-sub">Je crée des univers, je développe des jeux et je transforme mes idées en expériences interactives.</p>
  <div class="v2-tags">${tag("Web Developer")}${tag("Game Creator")}${tag("Deadly.io")}${tag("JavaScript")}</div>
  <div class="v2-actions"><a class="v2-button main" href="apropos.html">Découvrir mon profil ↗</a>
  <a class="v2-button" href="projets.html">Voir mes projets →</a></div>
</div>
${section("DÉCOUVRIR MON UNIVERS",`<div class="v2-grid three">
${card("◈","Qui suis-je ?","Mon parcours, mes passions et ma vision de la création.","apropos.html")}
${card("⌘","Projets","Deadly.io, mes systèmes de jeu et mes réalisations.","projets.html")}
${card("♛","Palmarès","Mes créations, mes objectifs et mes résultats gaming.","palmares.html")}
</div>`)}
${section("PROJET À LA UNE",`
<a class="v2-feature" href="projets.html">
${media("deadly.png","Deadly.io")}
<div><span class="v2-overline">FEATURED PROJECT / IN DEVELOPMENT</span>
<h2>DEADLY.IO</h2>
<p>Un projet de survie multijoueur où la construction, les vagues de zombies, les boss, les clans et la progression se rencontrent.</p>
<div class="v2-tags">${tag("Survival")}${tag("Multiplayer")}${tag("Browser Game")}</div>
<span class="v2-more">Découvrir le projet ↗</span></div></a>`)}
${section("NAVIGATION RAPIDE",`<div class="v2-grid two">
${card("▧","Galerie visuelle","Captures de jeu, interfaces et créations.","galerie.html")}
${card("◎","Me retrouver","YouTube et Discord.","reseaux.html")}
</div>`)}
`,
"apropos.html": `
${head("01","À PROPOS","Un développeur passionné par le web, le gaming et la conception de jeux vidéo.")}
<section class="v2-about">
<div class="v2-about-profile">${pfp()}<h2>Ocksyne</h2><span class="v2-overline">DEVELOPER / CREATOR</span>
<p>Construire. Imaginer. Améliorer.</p></div>
<div class="v2-card"><span class="v2-overline">MON HISTOIRE</span><h2>Une passion pour créer.</h2>
<p>Je suis Ocksyne, créateur de projets web et de jeux vidéo. Jaime concevoir mes propres mécaniques, travailler les détails des interfaces et chercher des solutions aux problèmes techniques.</p>
<p>Mon projet principal est Deadly.io, un univers de survie multijoueur que je développe et fais évoluer avec de nouveaux systèmes de gameplay.</p>
<p>Mon objectif est de progresser en développement et de donner vie à des projets ambitieux.</p></div>
</section>
${section("DOMAINES ET COMPÉTENCES",`<div class="v2-grid three">
${card("⌘","Développement web","HTML, CSS et JavaScript pour créer des expériences accessibles depuis un navigateur.")}
${card("◇","Game development","Mécaniques de combat, construction, progression, ennemis, multijoueur et équilibrage.")}
${card("▦","UI / UX","Tableaux, menus, animations, interfaces de classement et navigation ergonomique.")}
</div>`)}
${section("MA MÉTHODE",`<div class="v2-grid three">
${card("01","Imaginer","Partir dune idée et concevoir son fonctionnement.")}
${card("02","Développer","Coder les mécaniques et tester leur comportement.")}
${card("03","Améliorer","Corriger les bugs et rendre chaque élément plus abouti.")}
</div>`)}
`,
"palmares.html": `
${head("02","PALMARÈS","Mon espace de progression : créations, réussites et performances compétitives.")}
${section("MON PARCOURS DE CRÉATEUR",`<div class="v2-grid three">
${card("⌘","Deadly.io","Développement dun projet personnel de survie et de construction multijoueur.")}
${card("♜","Systèmes de jeu","Conception de boss, de clans, de rangs, de quêtes et de mécaniques de progression.")}
${card("◈","Portfolio","Création de ce site personnel pour présenter mon univers et mes projets.")}
</div>`)}
${section("MES RÉSULTATS GAMING",`
<div class="v2-filters" aria-label="Filtrer les résultats">
<button class="v2-filter active" data-filter="all">Tout</button>
<button class="v2-filter" data-filter="ranks">Rangs</button>
<button class="v2-filter" data-filter="records">Records</button>
<button class="v2-filter" data-filter="events">Tournois</button></div>
<div class="v2-grid three">
<article class="v2-card v2-result" data-category="ranks">${icon("♛")}<span class="v2-overline">RANG PRINCIPAL</span><h3>À compléter</h3><p>Ajoute ton rang confirmé et le jeu concerné.</p></article>
<article class="v2-card v2-result" data-category="records">${icon("✦")}<span class="v2-overline">MEILLEUR RECORD</span><h3>À compléter</h3><p>Ajoute un meilleur score ou une performance réelle.</p></article>
<article class="v2-card v2-result" data-category="events">${icon("✧")}<span class="v2-overline">COMPÉTITION</span><h3>À compléter</h3><p>Ajoute tes résultats de tournoi vérifiés.</p></article>
</div>
<p class="v2-note">Les rangs et les résultats non confirmés ne sont pas inventés. Cette section est prête pour tes propres données.</p>`)}
`,
"projets.html": `
${head("03","MES PROJETS","Une présentation détaillée de mes créations et des systèmes que je conçois.")}
${section("PROJET PRINCIPAL",`
<div class="v2-feature">${media("deadly.png","Capture de Deadly.io")}
<div><span class="v2-overline">GAME / EN DÉVELOPPEMENT</span><h2>DEADLY.IO</h2>
<p>Deadly.io est mon projet de jeu de survie multijoueur sur navigateur. Le joueur récolte des ressources, développe sa base et résiste à des vagues de zombies de plus en plus difficiles.</p>
<div class="v2-tags">${tag("JavaScript")}${tag("Survie")}${tag("Multijoueur")}${tag("Progression")}</div>
</div></div>`)}
${section("LES MÉCANIQUES DU JEU",`<div class="v2-grid three">
${card("☾","Cycle jour / nuit","Alternance de phases de préparation et dattaque avec un système de vagues.")}
${card("▦","Construction","Blocs, tours, portes, machines à or et amélioration de la base.")}
${card("♜","Boss","Des adversaires majeurs aux capacités et comportements distincts.")}
${card("⚔","Combat","Pioche, épée, arc, dégâts, armures et améliorations dequipement.")}
${card("♧","Compagnons","Soldat pour défendre le joueur et Jardinier pour récolter des ressources.")}
${card("◇","Clans","Création de clans, membres, grades, classements et quêtes quotidiennes.")}
</div>`)}
${section("UNIVERS DES BOSS",`
<div class="v2-grid three">
${card("25","Veydran","Le Chevalier déchu — palier de vague 25.")}
${card("50","Morvath","Le Maître des Flèches — vague 50.")}
${card("100","Le Faucheur","La Mort — vague 100.")}
${card("200","La Liche","Le Nécromancien — vague 200.")}
${card("250","Alucard","Le Duelliste — vague 250.")}
${card("300","Dracula","Le Seigneur des Ténèbres — vague 300.")}
${card("400","Zanza","Le Dieu des Monados — vague 400.")}
</div>
<p class="v2-note">Ces boss et leurs paliers sont issus de la conception du projet ; cette présentation ne signifie pas que toutes les mécaniques sont déjà finalisées.</p>`)}
${section("AUTRES CRÉATIONS",`<div class="v2-grid two">
${card("⌘","Portfolio Ocksyne","Le site sur lequel tu navigues : interface multipage, design monochrome et animations.")}
${card("+","Prochains projets","Cet emplacement accueillera mes futurs jeux, sites et expériences numériques.")}
</div>`)}
`,
"galerie.html": `
${head("04","GALERIE","Une vitrine visuelle pour mes captures, mes projets et mes créations.")}
<div class="v2-filters">
<button class="v2-filter active" data-filter="all">Toutes les images</button>
<button class="v2-filter" data-filter="game">Jeu vidéo</button>
<button class="v2-filter" data-filter="design">Interfaces</button>
<button class="v2-filter" data-filter="other">Autres</button>
</div>
<div class="v2-grid three">
${[
["gallery-1.jpg","Deadly.io — Gameplay","game"],
["gallery-2.jpg","Base et construction","game"],
["gallery-3.jpg","Clans et classements","design"],
["gallery-4.jpg","Interfaces utilisateur","design"],
["gallery-5.jpg","Création personnelle","other"],
["gallery-6.jpg","Autre capture","other"]
].map(([file,name,type])=>`<button class="v2-gallery-item v2-result" data-category="${type}" type="button" aria-label="Agrandir : ${name}">${media(file,name)}<strong>${name}</strong><span>Cliquer pour agrandir</span></button>`).join("")}
</div>
<p class="v2-note">Pour afficher tes propres images, place les fichiers dans assets/images avec les noms attendus.</p>
<dialog class="v2-lightbox"><button type="button" class="v2-close" aria-label="Fermer">✕</button><img alt=""><p></p></dialog>
`,
"reseaux.html": `
${head("05","MES RÉSEAUX","Les plateformes publiques sur lesquelles retrouver mon univers.")}
${section("RESTER CONNECTÉ",`<div class="v2-grid two">
<a class="v2-card v2-social" href="https://www.youtube.com/@Sir.Ocksyne" target="_blank" rel="noopener noreferrer">${icon("▶")}<span class="v2-overline">YOUTUBE</span><h2>Sir.Ocksyne ↗</h2><p>Ma chaîne YouTube et mes créations.</p></a>
<a class="v2-card v2-social" href="https://discord.gg/ubScpHHZB2" target="_blank" rel="noopener noreferrer">${icon("◎")}<span class="v2-overline">DISCORD</span><h2>Communauté ↗</h2><p>Rejoindre mon serveur via le lien public enregistré.</p></a>
</div>`)}
${section("MON IDENTITÉ NUMÉRIQUE",`
<div class="v2-card v2-identity">${pfp()}<div><span class="v2-overline">PERSONAL BRAND</span><h2>OCKSYNE</h2><p>Web Developer · Game Creator · Deadly.io</p></div></div>`)}
`
};

const page = location.pathname.split("/").pop() || "index.html";
const main = document.querySelector("main.container");
if(main && pages[page]) {
  main.innerHTML = `<div class="v2-shell">${pages[page]}</div>`;
  document.body.classList.add("ocksyne-v2");
}

document.querySelectorAll("[data-v2-image]").forEach(img=>{
  const fail=()=>{img.style.display="none"};
  img.addEventListener("error",fail);
  if(img.complete && img.naturalWidth===0) fail();
});

document.querySelectorAll(".v2-filters").forEach(group=>{
  const buttons=[...group.querySelectorAll("[data-filter]")];
  const section=group.nextElementSibling;
  if(!section)return;
  buttons.forEach(button=>button.addEventListener("click",()=>{
    buttons.forEach(b=>b.classList.toggle("active",b===button));
    section.querySelectorAll("[data-category]").forEach(item=>{
      item.hidden=button.dataset.filter!=="all" && item.dataset.category!==button.dataset.filter;
    });
  }));
});

const dialog=document.querySelector(".v2-lightbox");
if(dialog){
  const close=dialog.querySelector(".v2-close");
  document.querySelectorAll(".v2-gallery-item").forEach(item=>{
    item.addEventListener("click",()=>{
      const img=item.querySelector("img");
      if(!img || !img.naturalWidth)return;
      dialog.querySelector("img").src=img.src;
      dialog.querySelector("img").alt=img.alt;
      dialog.querySelector("p").textContent=item.querySelector("strong").textContent;
      if(typeof dialog.showModal==="function")dialog.showModal();
    });
  });
  close.addEventListener("click",()=>dialog.close());
  dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close()});
}
})();
/* OCKSYNE_V2_END */

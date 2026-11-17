// DCAS — interactions (aucun service externe)
(function(){
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const DATA = JSON.parse($('#dcas-data').textContent);
  const toast=(t)=>{const el=$('#toast');el.textContent=t;el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),2600)};

  // Menu mobile
  $('.menu-btn')?.addEventListener('click',()=>$('.nav').classList.toggle('open'));
  $$('.nav a').forEach(a=>a.addEventListener('click',()=>$('.nav').classList.remove('open')));

  // Hero : carrousel de démos
  const slides=$$('.hero-slide'), tabs=$$('.hero-tabs button'); let hi=0, ht;
  const show=i=>{hi=i;slides.forEach((s,k)=>s.classList.toggle('on',k===i));tabs.forEach((t,k)=>t.classList.toggle('on',k===i));$('#hero-chan').textContent=slides[i].dataset.chan};
  const loop=()=>{clearInterval(ht);ht=setInterval(()=>show((hi+1)%slides.length),3800)};
  tabs.forEach((t,k)=>t.addEventListener('click',()=>{show(k);loop()}));
  if(slides.length){show(0);loop()}

  // Filtres modules
  $$('.chip').forEach(c=>c.addEventListener('click',()=>{
    $$('.chip').forEach(x=>x.classList.remove('on'));c.classList.add('on');
    const cat=c.dataset.cat;
    $$('.mod').forEach(m=>m.classList.toggle('hide',cat!=='all'&&m.dataset.cat!==cat));
  }));

  // Composer sa commande
  const sel=new Set();
  const price=id=>DATA.modules[id].price;
  function render(){
    $$('.bitem').forEach(b=>b.classList.toggle('on',sel.has(b.dataset.id)));
    $$('.add').forEach(b=>{const on=sel.has(b.dataset.id);b.classList.toggle('on',on);b.textContent=on?'✓ Ajouté':'+ Ajouter'});
    const ids=[...sel], sum=ids.reduce((a,i)=>a+price(i),0), n=ids.length;
    const libre=n>=DATA.libreMin, total=libre?Math.ceil(sum*(1-DATA.libreDisc)):sum;
    $('#s-count').textContent=n+' module'+(n>1?'s':'');
    $('#s-sum').textContent=sum+' €';
    $('#s-disc').style.display=libre?'flex':'none';
    $('#s-disc-v').textContent='− '+(Math.round((sum-total)*100)/100).toString().replace('.',',')+' €';
    $('#s-total').textContent=(total.toString().replace('.',','))+' €';
    // Meilleur pack contenant la sélection ?
    let hint='';
    if(n===0) hint='Clique sur les modules qui t\'intéressent. Dès '+DATA.libreMin+' modules : −50 % (Pack Libre).';
    else{
      const better=DATA.packs.filter(p=>ids.every(i=>p.modules.includes(i))&&p.price<total).sort((a,b)=>a.price-b.price)[0];
      if(better) hint='💡 Le <b>'+better.name+'</b> contient tout ça (et plus) pour <b>'+better.price+' €</b>.';
      else if(!libre) hint='Encore <b>'+(DATA.libreMin-n)+'</b> module'+(DATA.libreMin-n>1?'s':'')+' et tu passes en Pack Libre à −50 %.';
      else hint='✅ Pack Libre activé : tu paies la moitié du prix des modules.';
    }
    $('#s-hint').innerHTML=hint;
    const lines=ids.map(i=>'- '+DATA.modules[i].name+' ('+price(i)+' €)').join('\n');
    $('#s-msg').value=n?('Salut ! Je viens du site DCAS, je voudrais un bot avec :\n'+lines+'\nTotal estimé : '+$('#s-total').textContent+(libre?' (Pack Libre −50 %)':'')+'\nMon serveur parle de : '):'';
  }
  const toggle=id=>{sel.has(id)?sel.delete(id):sel.add(id);render()};
  $$('.bitem').forEach(b=>b.addEventListener('click',()=>toggle(b.dataset.id)));
  $$('.add').forEach(b=>b.addEventListener('click',()=>{toggle(b.dataset.id);if(sel.has(b.dataset.id))toast(DATA.modules[b.dataset.id].name+' ajouté à ta commande')}));
  $$('[data-pack]').forEach(b=>b.addEventListener('click',e=>{
    e.preventDefault();const p=[...DATA.packs,...DATA.tpacks].find(x=>x.id===b.dataset.pack);
    const msg='Salut ! Je viens du site DCAS, je voudrais le '+p.name+' ('+p.price+' €).\nMon serveur parle de : ';
    sel.clear();render();$('#s-msg').value=msg;
    $('#composer').scrollIntoView({behavior:'smooth'});toast(p.name+' sélectionné');
  }));
  const copy=async(t)=>{try{await navigator.clipboard.writeText(t);return true}catch(e){const ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();const ok=document.execCommand('copy');ta.remove();return ok}};
  $('#s-copy')?.addEventListener('click',async()=>{const t=$('#s-msg').value;if(!t){toast('Choisis au moins un module ou un pack');return}await copy(t);toast('Message copié : envoie-le en MP à '+DATA.discord)});
  $$('.copy-tag').forEach(b=>b.addEventListener('click',async()=>{await copy(DATA.discord);toast('Pseudo copié : '+DATA.discord)}));
  render();

  // Apparition au scroll
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.08});
  $$('.reveal').forEach(el=>io.observe(el));
})();

(function(){
  "use strict";
  var root=document.documentElement;
  function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){return null;}}
  var reduit=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* thème */
  var t=store("site0-theme"); if(t==="dark"||t==="light") root.setAttribute("data-theme",t);
  var bt=document.getElementById("theme");
  function sombre(){var d=root.getAttribute("data-theme");if(d)return d==="dark";return window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;}
  function majTheme(){if(bt)bt.textContent=sombre()?"Mode clair":"Mode sombre";}
  if(bt){bt.addEventListener("click",function(){var n=sombre()?"light":"dark";root.setAttribute("data-theme",n);store("site0-theme",n);majTheme();});majTheme();}

  /* rail mobile */
  var bg=document.getElementById("burger"),rail=document.getElementById("rail");
  if(bg&&rail){bg.addEventListener("click",function(){var o=rail.classList.toggle("ouvert");bg.setAttribute("aria-expanded",o?"true":"false");});}


  /* localisation qui ne dit rien */
  var loc=document.getElementById("loc-val");
  if(loc&&!reduit){var v=["N/A","N/E","Null","0,0,0"],i=0;setInterval(function(){i=(i+1)%v.length;loc.textContent=v[i];},2400);}

  /* plaques : toucher = effacer */
  [].forEach.call(document.querySelectorAll(".insert,.plaque:not(.reel) .titulaire"),function(el){
    el.addEventListener("click",function(){el.classList.toggle("vanish");});
  });
})();

(function(){
  "use strict";
  var $=function(s,r){return (r||document).querySelector(s);};
  var $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s));};

  /* champs caviardés */
  $$("[data-redact] .barre").forEach(function(b){
    b.setAttribute("aria-pressed","false");
    b.title="Cliquer pour lire";
    b.addEventListener("click",function(){var l=b.classList.toggle("lu");b.setAttribute("aria-pressed",l?"true":"false");b.title=l?"":"Cliquer pour lire";});
  });

  /* filtres archives et chronologie */
  var cont=$("#archives")||$("#chrono");
  if(cont){
    var items=$$("[data-type]",cont),btns=$$(".filtres button");
    btns.forEach(function(b){
      b.setAttribute("aria-pressed",b.classList.contains("on")?"true":"false");
      b.addEventListener("click",function(){
        var f=b.getAttribute("data-f");
        btns.forEach(function(x){var on=x===b;x.classList.toggle("on",on);x.setAttribute("aria-pressed",on?"true":"false");});
        items.forEach(function(it){it.hidden=!(f==="tous"||it.getAttribute("data-type")===f);});
      });
    });
  }

  /* glossaire */
  var gf=$("#gfiltre");
  if(gf){
    var termes=$$("#glossaire .terme");
    gf.addEventListener("input",function(){
      var q=gf.value.trim().toLowerCase();
      termes.forEach(function(t){t.hidden=q&&t.textContent.toLowerCase().indexOf(q)<0;});
    });
  }

  /* explorateur de humes */
  var hume=$("#hume");
  if(hume){
    var mid=function(s){var p=String(s).split("-").map(Number);return p.length>1?(p[0]+p[1])/2:p[0];};
    var bs=$$("button",hume);
    bs.forEach(function(b){
      b.setAttribute("aria-pressed","false");
      b.addEventListener("click",function(){
        bs.forEach(function(x){x.setAttribute("aria-pressed",x===b?"true":"false");});
        var z=b.getAttribute("data-z"),i=b.getAttribute("data-i");
        $("#hz").style.width=Math.min(100,mid(z))+"%";
        $("#hi").style.width=Math.min(100,mid(i)/5)+"%";
        $("#hzv").textContent=z+" sur 100";
        $("#hiv").textContent=i+" sur 500";
        $("#ht").textContent=b.getAttribute("data-t");
      });
    });
  }

  /* Discord */
  var cfg=window.SITE0||{},d=$("#discord-lien");
  if(d){
    if(cfg.discordInvite){d.href=cfg.discordInvite;d.rel="noopener";d.target="_blank";}
    else{d.setAttribute("aria-disabled","true");d.removeAttribute("href");d.textContent="Lien d'invitation bientôt disponible";var inf=$("#discord-info");if(inf)inf.textContent="Le staff publiera ici l'invitation du serveur.";}
  }

  /* annonces */
  var an=$("#annonces");
  if(an){
    var L=(window.ANNONCES||[]).slice().sort(function(a,b){return a.date<b.date?1:-1;});
    if(!L.length){an.innerHTML="<p>Aucune annonce pour le moment.</p>";}
    L.forEach(function(a){
      var ar=document.createElement("article"),tm=document.createElement("time"),h=document.createElement("h3"),p=document.createElement("p");
      tm.dateTime=a.date;
      try{tm.textContent=new Date(a.date+"T12:00:00").toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"});}catch(e){tm.textContent=a.date;}
      h.textContent=a.titre;p.textContent=a.texte;
      ar.appendChild(tm);ar.appendChild(h);ar.appendChild(p);an.appendChild(ar);
    });
  }
})();

(function(){
  "use strict";
  var idx=window.SEARCH_INDEX||[];
  var btn=document.getElementById("btn-recherche");
  var ov=document.getElementById("recherche");
  if(!btn||!ov)return;
  var inp=ov.querySelector("input"),res=ov.querySelector("ul"),prev=null;
  function norm(s){return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");}
  function ouvrir(){prev=document.activeElement;ov.classList.add("ouvert");inp.value="";res.innerHTML="";inp.focus();}
  function fermer(){ov.classList.remove("ouvert");if(prev&&prev.focus)prev.focus();}
  function esc(s){return s.replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
  function chercher(q){
    q=norm(q.trim());res.innerHTML="";if(q.length<2)return;
    var mots=q.split(/\s+/),out=[];
    idx.forEach(function(p){
      var t=norm(p.t),x=norm(p.x),sc=0,ok=true;
      mots.forEach(function(m){var a=t.indexOf(m)>=0,b=x.indexOf(m);if(!a&&b<0)ok=false;sc+=(a?5:0)+(b>=0?1:0);});
      if(ok)out.push({p:p,sc:sc,pos:x.indexOf(mots[0])});
    });
    out.sort(function(a,b){return b.sc-a.sc;});
    if(!out.length){res.innerHTML="<li><span>Aucun dossier ne contient « "+esc(q)+" ». Essayez un mot plus court.</span></li>";return;}
    out.slice(0,8).forEach(function(o){
      var s=o.pos>=0?o.p.x.substr(Math.max(0,o.pos-50),140):o.p.x.substr(0,120);
      var li=document.createElement("li");
      li.innerHTML='<a href="'+o.p.u+'"><b>'+esc(o.p.t)+'</b><span>'+esc(s)+'…</span></a>';
      res.appendChild(li);
    });
  }
  btn.addEventListener("click",ouvrir);
  inp.addEventListener("input",function(){chercher(inp.value);});
  ov.addEventListener("click",function(e){if(e.target===ov)fermer();});
  document.addEventListener("keydown",function(e){
    var tag=(document.activeElement||{}).tagName;
    if(e.key==="Escape"&&ov.classList.contains("ouvert"))fermer();
    else if(e.key==="/"&&!ov.classList.contains("ouvert")&&tag!=="INPUT"&&tag!=="TEXTAREA"){e.preventDefault();ouvrir();}
  });
})();

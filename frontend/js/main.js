// Beristain & Asociados — main.js
(function(){
'use strict';
// header shadow
var hdr=document.getElementById('hdr');
var onScroll=function(){hdr.classList.toggle('scrolled',window.scrollY>8)};
window.addEventListener('scroll',onScroll,{passive:true});onScroll();
// mobile nav
var tg=document.getElementById('navToggle'),nav=document.getElementById('nav');
if(tg&&nav){
  var setNav=function(abierto){
    nav.classList.toggle('open',abierto);
    tg.setAttribute('aria-expanded',abierto);
    if(hdr)hdr.classList.toggle('nav-open',abierto);
    document.body.classList.toggle('nav-lock',abierto);
  };
  tg.addEventListener('click',function(){setNav(!nav.classList.contains('open'))});
  // cerrar al elegir una sección, con Escape, o al tocar fuera del panel
  nav.addEventListener('click',function(ev){if(ev.target.closest('a'))setNav(false)});
  document.addEventListener('keydown',function(ev){if(ev.key==='Escape'&&nav.classList.contains('open'))setNav(false)});
  document.addEventListener('click',function(ev){
    if(!nav.classList.contains('open'))return;
    if(!nav.contains(ev.target)&&!tg.contains(ev.target))setNav(false);
  });
  // al volver a escritorio el panel no debe quedar abierto
  window.addEventListener('resize',function(){if(innerWidth>860&&nav.classList.contains('open'))setNav(false)});
}
// scroll reveal
if('IntersectionObserver' in window){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)});
}else{document.querySelectorAll('.reveal').forEach(function(el){el.classList.add('in')})}
// GA4 events (call / whatsapp)
function track(n,p){if(typeof gtag==='function')gtag('event',n,p||{})}
// Google Ads conversions
var ADS_ID='AW-11107730225';
var ADS_CALL='MjxGCJ-v6bsbELGGyrAp',ADS_WA='Yg24CK6u4LsbELGGyrAp';
function conv(label,value){
  if(typeof gtag!=='function')return;
  gtag('event','conversion',{send_to:ADS_ID+'/'+label,value:value,currency:'ARS',transaction_id:label.slice(0,4)+'_'+Date.now()});
}
// gclid: identifica el anuncio del que vino la visita; se adjunta a la consulta
try{var _g=new URLSearchParams(location.search).get('gclid');if(_g)sessionStorage.setItem('gclid',_g)}catch(e){}
function getGclid(){try{return sessionStorage.getItem('gclid')||''}catch(e){return ''}}
document.addEventListener('click',function(ev){
  var a=ev.target.closest('a');if(!a)return;
  if(a.matches('[data-ga="call"],a[href^="tel:"]')){track('call_click',{link_url:a.href,page:location.pathname});conv(ADS_CALL,100)}
  else if(a.matches('[data-ga="wa"]')||(a.href&&a.href.indexOf('wa.me')>-1)){track('whatsapp_click',{link_url:a.href,page:location.pathname});conv(ADS_WA,75)}
});
// qualification chips
document.querySelectorAll('.chips-row').forEach(function(row){
  row.addEventListener('click',function(ev){
    var b=ev.target.closest('.chip');if(!b)return;
    row.querySelectorAll('.chip').forEach(function(c){c.classList.remove('on')});
    b.classList.add('on');
    var h=row.parentElement.querySelector('input[type=hidden]');if(h)h.value=b.textContent.trim();
  });
});
// form: FormSubmit AJAX + WhatsApp fallback
var form=document.getElementById('consultaForm');
if(form){
  form.addEventListener('submit',function(ev){
    ev.preventDefault();
    if(form.querySelector('.hp').value)return; // honeypot
    if(!form.reportValidity())return;
    var d=new FormData(form);d.delete('_honey');
    d.append('_subject','Nueva consulta desde el sitio — '+(d.get('area')||'sin área'));
    if(d.get('email'))d.append('_replyto',d.get('email'));
    d.append('_template','table');
    var _gc=getGclid();if(_gc)d.append('origen_anuncio',_gc);
    var btn=form.querySelector('[type=submit]');btn.disabled=true;btn.textContent='Enviando…';
    var waMsg='Hola, quiero hacer una consulta.%0AÁrea: '+encodeURIComponent(d.get('area')||'')+'%0ASituación: '+encodeURIComponent(d.get('descripcion')||'')+'%0AUrgencia: '+encodeURIComponent(d.get('urgencia')||'')+'%0ANombre: '+encodeURIComponent(d.get('nombre')||'');
    var waUrl='https://wa.me/5491135913161?text='+waMsg;
    fetch('https://formsubmit.co/ajax/beristainyasociadosej@gmail.com',{method:'POST',body:d,headers:{'Accept':'application/json'}})
    .then(function(r){if(!r.ok)throw 0;return r.json()})
    .then(function(){
      track('form_submit',{area:d.get('area'),urgencia:d.get('urgencia'),page:location.pathname});
      Array.prototype.forEach.call(form.children,function(c){if(!c.classList.contains('form-ok'))c.hidden=true});
      var ok=form.querySelector('.form-ok');ok.hidden=false;
      var pref=(d.get('contacto_preferido')||'WhatsApp').toLowerCase();
      ok.querySelector('.ok-txt').textContent='Te contactamos por '+pref+' en menos de 2 horas hábiles. Si la situación se vuelve urgente, llamá al 11 3591-3161.';
      if(pref==='whatsapp'){var w=ok.querySelector('.ok-wa');w.hidden=false;w.href=waUrl}
    })
    .catch(function(){
      btn.disabled=false;btn.textContent='Enviar consulta';
      var err=form.querySelector('.form-err');err.hidden=false;err.querySelector('.err-wa').href=waUrl;
    });
  });
}
})();
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
// Eventos de contacto y conversiones de Google Ads.
//
// IMPORTANTE: este sitio NO carga el contenedor de Tag Manager. Usa gtag
// directo (ver el <head> de cada página). Existe un contenedor GTM con
// etiquetas de conversión configuradas, pero ninguna página lo incluye, así
// que esas etiquetas nunca se ejecutan.
//
// Por eso la conversión se envía desde acá. Las etiquetas usadas son las
// mismas que definió ese contenedor, para que las conversiones caigan en las
// acciones que el estudio ya tenía creadas.
//
// Si algún día se agrega el contenedor de GTM al sitio, HAY QUE QUITAR el
// envío de conv() de este archivo: si no, cada contacto se contaría dos veces.
function track(n,p){if(typeof gtag==='function')gtag('event',n,p||{})}
var ADS_ID='AW-11107730225';
var ADS_CALL='7dcGCM7ztrwbELGGyrAp',ADS_WA='Yg24CK6u4LsbELGGyrAp',ADS_FORM='1LBbCOr-37sbELGGyrAp';
function conv(label){
  if(typeof gtag!=='function')return;
  gtag('event','conversion',{send_to:ADS_ID+'/'+label,transaction_id:label.slice(0,4)+'_'+Date.now()});
}
// gclid: identifica el anuncio del que vino la visita.
//
// Se guarda en localStorage y no en sessionStorage porque casi nadie consulta
// en la misma pestaña en la que llegó: mira el sitio, lo piensa, y escribe por
// WhatsApp horas o días después. Con sessionStorage ese origen se perdía, que
// es el caso más común en este estudio.
var GCLID_DIAS=90;
try{var _g=new URLSearchParams(location.search).get('gclid');
    if(_g)localStorage.setItem('gclid',JSON.stringify({v:_g,t:Date.now()}))}catch(e){}
function getGclid(){
  try{
    var r=JSON.parse(localStorage.getItem('gclid')||'null');
    if(!r||!r.v)return '';
    if(Date.now()-r.t>GCLID_DIAS*864e5){localStorage.removeItem('gclid');return ''}
    return r.v;
  }catch(e){return ''}
}
// Adjunta el origen del anuncio al mensaje de WhatsApp.
//
// Las consultas entran por WhatsApp, casi nunca por el formulario, y todas
// llegan iguales: no hay manera de saber cuál vino de un anuncio ni de qué
// búsqueda. Para Google, el que pregunta si es gratis y el propietario que
// necesita un desalojo son el mismo evento, así que la puja automática busca
// el toque más barato — y lo encuentra entre los que no contratan.
//
// Con la referencia en el mensaje, cuando una consulta termina en cliente ese
// identificador se sube a Google Ads como conversión offline. Recién ahí la
// puja aprende a buscar clientes en lugar de toques en el botón.
function conRef(url){
  var g=getGclid();
  if(!g||url.indexOf('ref%3A')>-1)return url;
  return url+'%0A%0A(ref%3A%20'+encodeURIComponent(g)+')';
}
Array.prototype.forEach.call(document.querySelectorAll('a[href*="wa.me"]'),function(a){a.href=conRef(a.href)});
document.addEventListener('click',function(ev){
  var a=ev.target.closest('a');if(!a)return;
  if(a.matches('[data-ga="call"],a[href^="tel:"]')){track('call_click',{link_url:a.href,page:location.pathname});conv(ADS_CALL)}
  else if(a.matches('[data-ga="wa"]')||(a.href&&a.href.indexOf('wa.me')>-1)){track('whatsapp_click',{link_url:a.href,page:location.pathname});conv(ADS_WA)}
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
    var waUrl=conRef('https://wa.me/5491135913161?text='+waMsg);
    fetch('https://formsubmit.co/ajax/beristainyasociadosej@gmail.com',{method:'POST',body:d,headers:{'Accept':'application/json'}})
    .then(function(r){if(!r.ok)throw 0;return r.json()})
    .then(function(){
      track('form_submit',{area:d.get('area'),urgencia:d.get('urgencia'),page:location.pathname});
      conv(ADS_FORM);
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
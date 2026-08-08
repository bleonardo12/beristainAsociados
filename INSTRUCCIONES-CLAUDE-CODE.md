# Instrucción para Claude Code — Publicar el sitio nuevo de Beristain & Asociados

Trabajás en el repositorio LOCAL de la web real **www.beristainyasociados.com.ar**.

## Entorno (importante)
- **Hosting:** VPS propio en **Hostinger** (Apache/LiteSpeed o Nginx — detectá cuál corre).
- **Repo:** local + **GitHub**. Flujo: editar local → commit → push a GitHub → deploy al VPS.
- Por ser VPS, **NO** se usan los archivos `_redirects` ni `_headers` (esos son de Netlify/Cloudflare).
  Redirects y headers de seguridad van en **`.htaccess`** (Apache/LiteSpeed) o en el **server block de Nginx**.
- El sitio nuevo (ya diseñado y probado) está en `handoff_sitio_produccion/site`.
  NO rehagas el diseño ni la paleta: solo integrar + aplicar los ajustes de abajo.

---

## 1. Integrar el sitio nuevo al repo
- Reemplazá el sitio actual por las páginas de `handoff_sitio_produccion/site`
  (index, penal, civil, contable, societario, el-estudio, recursos, contacto,
  aviso-legal, privacidad + css/, js/, img/).
- Mantené las URLs con **.html** (canonical, links internos, sitemap y redirects ya están hechos para .html).
- Podés descartar los archivos `_redirects` y `_headers` (son de Netlify/CF; no aplican al VPS).

## 2. Datos reales — franja de stats (index.html)
Reemplazá el contenido de la sección `.stats-band` por estos 4 tiles
(SIN años de ejercicio ni causas ganadas):

```html
<section class="stats-band">
  <div class="wrap stats">
    <div class="stat reveal"><strong>24 hs</strong><span>Guardia penal, todos los días</span></div>
    <div class="stat reveal" style="transition-delay:80ms"><strong>2 hs</strong><span>Respuesta a tu consulta en horario hábil</span></div>
    <div class="stat reveal" style="transition-delay:160ms"><strong>Por escrito</strong><span>Presupuesto de honorarios antes de empezar</span></div>
    <div class="stat reveal" style="transition-delay:240ms"><strong>5,0 ★</strong><span>Reseñas de clientes en Google</span></div>
  </div>
</section>
```

## 3. Schema / SEO
- Quitá el objeto `aggregateRating` del JSON-LD en TODAS las páginas (dejá el resto intacto).
- En `sameAs` dejá solo las redes que existan de verdad.

## 4. Formulario (contacto.html + js/main.js)
- Agregá campo **Email** (obligatorio; imprescindible si el contacto preferido es "Correo").
- Agregá **casilla de consentimiento obligatoria** antes de enviar: "Acepto la política de privacidad"
  (link a privacidad.html). No permitir enviar sin tildarla. Incluir su valor en el envío.
- El form usa FormSubmit a beristainyasociadosej@gmail.com: la 1ª vez confirmar el mail de activación.
  (Alternativa recomendada en VPS propio: endpoint PHP propio de envío — mejor para datos confidenciales.)

## 5. Reseñas
- El enlace "Ver en Google" debe apuntar al Perfil de Empresa de Google real (g.page/... o Maps).
  Placeholder claro si aún no está.

## 6. Imágenes (no cambiar por ahora)
- Mantener la imagen actual del hero (Facultad de Derecho UBA) y los photo-slots (aún no hay fotos nuevas).
- Optimizar la imagen del hero a < 200 KB y agregar `srcset` responsive.

## 7. Archivos en la RAÍZ del sitio (ya creados, reutilizar los de handoff_sitio_produccion/site)

### sitemap.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://www.beristainyasociados.com.ar/</loc><priority>1.0</priority></url>
  <url><loc>https://www.beristainyasociados.com.ar/penal.html</loc><priority>0.9</priority></url>
  <url><loc>https://www.beristainyasociados.com.ar/civil.html</loc><priority>0.9</priority></url>
  <url><loc>https://www.beristainyasociados.com.ar/contable.html</loc><priority>0.9</priority></url>
  <url><loc>https://www.beristainyasociados.com.ar/societario.html</loc><priority>0.8</priority></url>
  <url><loc>https://www.beristainyasociados.com.ar/el-estudio.html</loc><priority>0.7</priority></url>
  <url><loc>https://www.beristainyasociados.com.ar/recursos.html</loc><priority>0.6</priority></url>
  <url><loc>https://www.beristainyasociados.com.ar/contacto.html</loc><priority>0.8</priority></url>
  <url><loc>https://www.beristainyasociados.com.ar/aviso-legal.html</loc><priority>0.3</priority></url>
  <url><loc>https://www.beristainyasociados.com.ar/privacidad.html</loc><priority>0.3</priority></url>
</urlset>
```

### robots.txt
```
User-agent: *
Allow: /

Sitemap: https://www.beristainyasociados.com.ar/sitemap.xml
```

## 8. Redirects 301 + HTTPS + Seguridad — en el VPS

### Si es Apache / LiteSpeed → archivo `.htaccess` en la raíz del sitio:
```apache
RewriteEngine On

# Forzar HTTPS
RewriteCond %{HTTPS} !=on
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Redirects 301 de las landings viejas de Google Ads
RewriteCond %{QUERY_STRING} (^|&)area=penal(&|$)
RewriteRule ^landing\.html$ /penal.html? [R=301,L]
RewriteRule ^landing-civil\.html$ /civil.html [R=301,L]
RewriteRule ^landing-contable\.html$ /contable.html [R=301,L]
RewriteRule ^landing\.html$ /contacto.html? [R=301,L]

# Headers de seguridad
<IfModule mod_headers.c>
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
  Header always set Content-Security-Policy "default-src 'self'; script-src 'self' https://www.googletagmanager.com 'unsafe-inline'; connect-src 'self' https://*.google-analytics.com https://www.googletagmanager.com https://formsubmit.co; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src https://fonts.gstatic.com; img-src 'self' data: https://*.google-analytics.com https://www.googletagmanager.com; frame-src https://www.openstreetmap.org; frame-ancestors 'self'; base-uri 'self'; form-action 'self' https://formsubmit.co"
</IfModule>
```

### Si es Nginx → en el server block (adaptar rutas):
```nginx
# Forzar HTTPS: redirigir el server :80 a https
# Redirects landings:
location = /landing.html {
    if ($arg_area = penal) { return 301 /penal.html; }
    return 301 /contacto.html;
}
location = /landing-civil.html    { return 301 /civil.html; }
location = /landing-contable.html { return 301 /contable.html; }
# Headers de seguridad (dentro de server{}):
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://www.googletagmanager.com 'unsafe-inline'; connect-src 'self' https://*.google-analytics.com https://www.googletagmanager.com https://formsubmit.co; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src https://fonts.gstatic.com; img-src 'self' data: https://*.google-analytics.com https://www.googletagmanager.com; frame-src https://www.openstreetmap.org; frame-ancestors 'self'; base-uri 'self'; form-action 'self' https://formsubmit.co" always;
```

**Nota sobre las landings viejas:** NO rediseñar ni tocar `landing.html`, `landing-civil.html`
ni `landing-contable.html`; quedan retiradas vía 301. Verificado el redirect, se pueden borrar del
servidor (opcional). El cambio de las URL de destino de los anuncios en Google Ads se hace por
separado (lado marketing), no en este repo.

## 9. Analítica (evitar conteo duplicado)
- Verificá que **G-MLZ2VR5SYR** esté en TODAS las páginas, con eventos `form_submit`,
  `whatsapp_click`, `call_click` (ya están en js/main.js).
- Si el sitio viejo tenía Google Tag Manager **GTM-W6F4XTKN**, quitalo para no duplicar.

## 10. Deploy (repo local → GitHub → VPS Hostinger)
1. Aplicá todos los cambios en el repo local.
2. `git add -A` y commit claro (ej.: "Publicar sitio nuevo Beristain 2027 + SEO + redirects Ads").
3. `git push` a GitHub.
4. Deploy al VPS: por SSH hacer `git pull` en el directorio del sitio (o el método de deploy que ya use
   el VPS — hook de git, script, o panel de Hostinger). Si no está claro el método/rutas del VPS,
   preguntámelo antes de tocar el servidor.
5. Asegurar certificado SSL activo (Let's Encrypt en Hostinger) y que el `.htaccess`/Nginx quede aplicado.

## 11. Verificación final (confirmame)
- URL en vivo por HTTPS, con las 301 de landings funcionando (probar /landing-civil.html → /civil.html).
- Cargar sitemap.xml en Google Search Console.
- Probar el formulario (que llegue el mail) y ver en GA4 que disparan los 3 eventos.

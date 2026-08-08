# Pendientes de publicación — sitio nuevo (agosto 2026)

Lo que ya está aplicado en el repo y lo que falta hacer fuera de él.

## Aplicado en el repo

- Sitio nuevo integrado en `frontend/`: `index`, `penal`, `civil`, `contable`, `societario`,
  `el-estudio`, `recursos`, `contacto`, `aviso-legal`, `privacidad` + `css/styles.css`,
  `js/main.js`, `img/hero-{640,1024,1600}.webp`, `img/dr-beristain.webp`.
- `sitemap.xml` y `robots.txt` nuevos (robots mantiene el bloqueo del área de socios).
- `sw.js` convertido en kill-switch: borra la caché del service worker anterior y se
  desregistra, para que los visitantes recurrentes no sigan viendo el sitio viejo.
- `deploy/nginx-beristainyasociados.conf`: fragmento con los 301 de las landings,
  HTTPS forzado, headers de seguridad y caché. **Todavía no está aplicado en el VPS.**
- Descartados `_headers` y `_redirects` del handoff (son de Netlify/Cloudflare; el hosting
  es un VPS con Nginx).

Se dejaron intactas, como pide la instrucción: `landing.html`, `landing-civil.html`,
`landing-contable.html`, `landing-societario.html`, `landing-accidentes.html`, y el área
de socios (`login.html`, `causas.html`, `presupuestos.html`, `honorarios.html`).

## Falta hacer

### 1. Aplicar la config de Nginx en el VPS (requiere SSH)
Copiar los bloques de `deploy/nginx-beristainyasociados.conf` dentro del server block
existente y recargar con `nginx -t && systemctl reload nginx`.
Sin esto no hay 301 de landings ni headers de seguridad.

### 2. Google Ads: conversiones antes de activar los 301
Las landings llevan GTM `GTM-W6F4XTKN` con las conversiones de Ads (`AW-11107730225`).
Las páginas nuevas llevan sólo GA4 `G-MLZ2VR5SYR`, sin GTM (así lo pide la instrucción,
para no duplicar medición). Consecuencia: si se activan los redirects
`/landing.html → /penal.html`, `/landing-civil.html → /civil.html`,
`/landing-contable.html → /contable.html` sin tocar nada más, esas campañas dejan de
registrar conversiones.

Antes de activarlos hay que elegir una de estas dos:
- Importar a Google Ads las conversiones de GA4 (`form_submit`, `whatsapp_click`,
  `call_click`), marcándolas primero como conversiones en GA4 → Administración → Eventos; o
- Agregar el contenedor GTM (o la etiqueta de conversión de Ads) a las páginas nuevas,
  y en ese caso quitar de ellas la etiqueta gtag directa para no contar dos veces.

### 3. Activar FormSubmit (1 mail)
El formulario de `contacto.html` postea a FormSubmit. El primer envío dispara un mail de
activación a **beristainyasociadosej@gmail.com**: hay que abrirlo y confirmarlo, si no los
envíos no llegan. Probar con un envío real después del deploy.

Nota: FormSubmit es un servicio de terceros y por el formulario viajan datos de consultas
legales. Para datos confidenciales conviene a futuro un endpoint PHP o Node propio en el
VPS, que ya está disponible.

### 4. Perfil de Empresa de Google
El link "Ver en Google" de la home apunta provisoriamente a una búsqueda en Google Maps.
Reemplazar por la URL corta real del perfil (`https://g.page/...`) en
[frontend/index.html](frontend/index.html).

### 5. Redes sociales en el schema (`sameAs`)
Quedaron: Instagram `@beristainyasociados`, LinkedIn
`linkedin.com/in/beristain-asociados-70087a353/` y TikTok `@beristainasociados`.
El sitio viejo tenía además `instagram.com/beristainasociados` y
`linkedin.com/company/beristainasociados`. Hay que confirmar cuáles existen de verdad y
borrar del `sameAs` las que no (afecta `index.html`, `el-estudio.html`, `contacto.html`).

### 6. Search Console
Cargar `https://www.beristainyasociados.com.ar/sitemap.xml` y pedir indexación de las
páginas nuevas.

### 7. Verificación post-deploy
- HTTPS forzado y certificado vigente.
- `/landing-civil.html` → 301 a `/civil.html` (una vez aplicado Nginx).
- Formulario: que llegue el mail.
- GA4 en tiempo real: `form_submit`, `whatsapp_click`, `call_click`.
- Abrir el sitio en un navegador que ya lo haya visitado, para confirmar que el service
  worker viejo se desregistró y no sirve la home anterior.

## Seguridad — aparte

`INSTRUCCIONES_DESPLIEGUE.md` tiene la contraseña de root del VPS en texto plano y está
commiteada en el repo. Conviene cambiar esa contraseña, dejar sólo acceso por clave SSH y
sacar el dato del archivo.

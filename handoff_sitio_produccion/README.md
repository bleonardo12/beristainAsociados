# Handoff: Sitio de producción — Beristain & Asociados (v3 FINAL, agosto 2026)

## Overview
Sitio **listo para publicar** del estudio jurídico-contable Beristain & Asociados (CABA). Reemplaza al handoff anterior (que contenía prototipos): esta carpeta `site/` es **HTML/CSS/JS real y estático**, multipágina, con SEO, analítica y formulario funcionando. No requiere build ni framework.

Sitio actual en producción: https://www.beristainyasociados.com.ar/ — repo `bleonardo12/beristainAsociados` (master, `frontend/`).

## Qué contiene `site/`
- `index.html` — Home (hero con foto real de la Facultad de Derecho UBA, dúo urgencia/consultivo, franja de números, índice de áreas, "Un estudio, dos disciplinas", reseñas de Google, recursos, CTA).
- `penal.html`, `civil.html`, `contable.html`, `societario.html` — una página por área con title/meta/H1 únicos, schema Service + BreadcrumbList, 6 servicios y CTA según la vía (Penal = urgencia con banda de guardia 24 hs; resto = consultiva).
- `el-estudio.html` — equipo y credenciales.
- `recursos.html` — 6 guías/FAQ reales (con schema FAQPage, coincide con los rich results actuales).
- `contacto.html` — formulario calificador de 4 pasos + NAP + mapa OpenStreetMap de la sede.
- `aviso-legal.html`, `privacidad.html` — legales (Ley 25.326).
- `css/styles.css`, `js/main.js` — estilos y comportamiento compartidos.
- `img/` — facultad-derecho-uba.webp (hero), dr-beristain.webp (retrato real B&N).
- `_headers` — headers de seguridad (CSP, HSTS, X-Frame-Options, etc.) formato Netlify/Cloudflare.
- `SETUP.md` — **checklist de publicación** (leer primero).

## Decisiones de diseño (mantener)
- Paleta "quiet luxury": off-white `#F5F2EC`, superficies `#FBFAF6`, arena `#E5DCCB`, tinta `#23262A`, pizarra `#2F3E46`, mocha `#A47864` (acento recurrente: filetes, números, itálicas), CTA teal `#3E6F73` (AA). Tipos: Instrument Serif (títulos, itálica como énfasis) + Albert Sans (texto).
- Dos vías de conversión: URGENCIA penal (tarjeta/banda pizarra, tel y WhatsApp a 1 clic, guardia 24 hs) vs ASESORAMIENTO (formulario calificador). Botones flotantes WhatsApp/Llamar en todas las páginas.
- Sin señales de "barato": el valor se comunica con "presupuesto por escrito antes de empezar", "respuesta < 2 hs hábiles", confidencialidad.
- Micro-interacciones sobrias: reveal al scroll (IntersectionObserver, respeta prefers-reduced-motion), lift sutil en tarjetas, sombra del header al scrollear.

## Regla de contenido (CRÍTICA — ya aplicada, sostener)
**Nada de información inventada.** Estado actual verificado:
- Números de la home (definitivos, todos sostenibles): 24 hs guardia penal · 2 hs respuesta en horario hábil · Presupuesto por escrito · 5,0 ★ reseñas en Google. NO reponer años de ejercicio, causas ganadas ni "% de excarcelaciones".
- Fotos: solo existen 2 reales (Facultad de Derecho UBA y retrato del Dr. Beristain frente a la Facultad, usado en B&N). No hay oficina ni foto de la contadora: por eso Civil/Contable/Societario llevan paneles tipográficos sobrios y la Cra. Bava un monograma "DB". Cuando haya sesión de fotos, reemplazar esos paneles por `<img>`.
- Cra. Daniela Magalí Bava: **Contadora Pública Nacional** y Perito Contadora Judicial (NO atribuirle UBA). Su estudio propio está enlazado: https://dmbestudio.com.ar/ (verificar con el cliente si la URL correcta es .com o .com.ar).
- Dr. Leonardo Beristain: abogado UBA, CPACF, ejerce en CABA, GBA y fuero federal.
- NAP: +54 9 11 3591-3161 · beristainyasociadosej@gmail.com · Av. Rivadavia 8012, 5º C, CABA (C1407DYS).
- Reseñas textuales de Google: Martin Zarate, Liliana Serrano, Evelyn.

## Cambios v3 (ajustes finales ya aplicados)
- Schema: eliminado aggregateRating de todas las páginas (guías de Google); sameAs solo con redes declaradas por el sitio actual (IG/LinkedIn/TikTok — confirmar vigencia con el cliente).
- Formulario: campo Email obligatorio (viaja como _replyto) + checkbox de consentimiento obligatorio con link a privacidad.html (su valor se incluye en el envío).
- Reseñas: el link "Ver en Google" es un PLACEHOLDER (https://g.page/COMPLETAR-PERFIL-EMPRESA) — reemplazar por la URL corta real del Perfil de Empresa.
- Hero: scrim ~12% más claro; imagen optimizada a 117 KB con srcset responsive (hero-640/1024/1600.webp; también en penal y el-estudio).
- Añadidos sitemap.xml, robots.txt y _redirects (301 de las landings de Ads: /landing.html?area=penal → /penal.html, /landing-civil.html → /civil.html, /landing-contable.html → /contable.html).
- Mantener URLs con .html (canonical, sitemap y redirects ya coinciden): NO migrar a pretty URLs.

## Técnico ya implementado
- GA4 `G-MLZ2VR5SYR` en todas las páginas; eventos: `form_submit`, `whatsapp_click`, `call_click` (marcar como conversiones en GA4). El sitio viejo usa GTM `GTM-W6F4XTKN`: si se conserva GTM, quitar la etiqueta gtag directa para no duplicar medición.
- Formulario: POST AJAX a FormSubmit (beristainyasociadosej@gmail.com) con honeypot `_honey`, confirmación en página y fallback a WhatsApp con el mensaje precargado si el envío falla. **Requiere activación**: el primer envío dispara un mail de confirmación de FormSubmit a esa casilla.
- Schema.org: LegalService+LocalBusiness (home/estudio/contacto), Service por área, FAQPage (recursos), BreadcrumbList.
- Seguridad: `_headers` con CSP, HSTS, nosniff, frame-ancestors. Replicar en Apache/Nginx si no se usa Netlify/CF.
- Performance/a11y: WebP, lazy-load (hero con fetchpriority=high), fuentes display=swap, contraste AA, focus visible, nav móvil accesible.

## Pendientes (ver SETUP.md)
1. Activar FormSubmit (1 mail).
2. Redirects 301 desde las landings de Google Ads actuales (`/landing.html?area=penal`, `/landing-civil.html`, `/landing-contable.html`) hacia las páginas nuevas — o decisión de campaña.
3. URLs limpias (/penal) según hosting + actualizar canonicals.
4. Reemplazar el link "Ver en Google" de reseñas por la URL corta del Perfil de Empresa (g.page/...).
5. Sesión de fotos profesional → reemplazar paneles tipográficos.
6. Revisar textos de aviso-legal.html y privacidad.html con criterio profesional propio.

## Cómo revisarlo
Abrir `site/index.html` en un navegador — todo funciona localmente salvo el envío real del formulario (requiere dominio publicado + activación FormSubmit).

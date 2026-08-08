# SETUP — puesta en producción

## 1. Formulario (IMPRESCINDIBLE, 2 minutos)
El formulario envía por FormSubmit a beristainyasociadosej@gmail.com. La PRIMERA vez que alguien envíe, FormSubmit manda un mail de activación a esa casilla: hay que abrirlo y confirmar. Hasta entonces los envíos no llegan. Alternativa recomendada a futuro: endpoint propio o Formspree.
Anti-spam: honeypot (campo _honey oculto) ya incluido.

## 2. URLs limpias (/penal en vez de /penal.html)
Los links internos usan .html para funcionar en cualquier hosting. Para URLs limpias:
- Netlify/Cloudflare Pages: activar "Pretty URLs" (automático) — el archivo _headers ya está.
- Apache: en .htaccess → Options -MultiViews + RewriteEngine On + RewriteCond %{REQUEST_FILENAME}.html -f + RewriteRule ^(.*)$ $1.html [L]
- Actualizar entonces las etiquetas canonical.

## 3. Redirects desde las landings de Ads actuales
Configurar 301: /landing.html?area=penal → /penal · /landing-civil.html → /civil · /landing-contable.html → /contable
(o mantenerlas vivas y solo unificar el diseño — decisión de campaña).

## 4. Seguridad
- HTTPS: forzar en el hosting (Let's Encrypt).
- Headers: archivo _headers (Netlify/CF). En Apache/Nginx, replicar esas directivas.

## 5. GA4
Etiqueta G-MLZ2VR5SYR incluida en todas las páginas. Eventos: form_submit, whatsapp_click, call_click.
En GA4 → Administración → Eventos: marcarlos como conversiones. (El sitio viejo usaba GTM GTM-W6F4XTKN: si se mantiene GTM, quitar la etiqueta gtag directa para no duplicar.)

## 6. Pendientes de contenido (buscar "XX" y "photo-slot")
- Franja de números (index): completar años de trayectoria y % de excarcelaciones con datos REALES.
- Fotos: reemplazar cada .photo-slot por <img> reales (sesión profesional). Formato WebP, ~1600px la del hero, loading="lazy" salvo hero.
- Link "Ver en Google" de reseñas: reemplazar por la URL corta del Perfil de Empresa de Google (g.page/...).
- Páginas aviso-legal.html y privacidad.html: revisar texto con criterio profesional propio.

## 7. Imágenes
El hero usa img/facultad-derecho-uba.webp (foto real del repo). dr-beristain.webp es la foto real frente a la Facultad. Optimizar/recortar en producción si hace falta.

# 🚀 Inicio Rápido - PULSE Marketing

## ⚡ 3 Pasos para Tener tu Sitio Funcionando

### 1️⃣ CONFIGURAR EMAILJS (5 minutos)

**¿Para qué?** Para que los clientes puedan contactarte desde el formulario web.

**Pasos:**

1. **Crear cuenta gratis:** https://www.emailjs.com/ → Sign Up

2. **Conectar Gmail:**
   - Click en "Email Services" → "Add New Service"
   - Elegir "Gmail" → Autorizar `Mktberistainestudio@gmail.com`
   - Guardar el **Service ID** (ej: `service_abc123`)

3. **Crear template de email:**
   - Click en "Email Templates" → "Create New Template"
   - Copiar el template que está en el README.md completo
   - Guardar el **Template ID** (ej: `template_xyz456`)

4. **Obtener Public Key:**
   - Ir a "Account" → "General"
   - Copiar tu **Public Key** (ej: `abc123xyz456`)

5. **Pegar en el código:**
   - Abrir `js/main.js`
   - Buscar líneas 6-10 y reemplazar:
   ```javascript
   const EMAILJS_CONFIG = {
       serviceID: 'service_abc123',      // Tu Service ID
       templateID: 'template_xyz456',    // Tu Template ID
       publicKey: 'abc123xyz456'         // Tu Public Key
   };
   ```

---

### 2️⃣ VERIFICAR CONTACTOS (1 minuto)

Ya están configurados, solo verifica:

```
WhatsApp Sofía:  +54 9 11 7364-2577
WhatsApp Julieta: +54 9 11 4091-8785
Email: Mktberistainestudio@gmail.com
```

Si necesitas cambiarlos, busca en `index.html` y reemplaza los números.

---

### 3️⃣ PUBLICAR EL SITIO (3 minutos)

**Opción más fácil - Netlify:**

1. Ir a https://app.netlify.com/drop
2. Arrastrar la carpeta `pulse-marketing` completa
3. ¡Listo! Tu sitio estará online con una URL tipo: `https://pulse-marketing-123.netlify.app`

**Más adelante** puedes configurar un dominio personalizado (ej: pulsemarketing.com.ar)

---

## 🎨 Personalizaciones Rápidas

### Cambiar Colores (Opcional)

Archivo: `css/styles.css` (líneas 3-20)

```css
:root {
    --primary: #FF6B6B;    /* Coral - cambiar si quieres otro */
    --secondary: #4ECDC4;  /* Turquesa */
    --accent: #FFE66D;     /* Amarillo */
}
```

### Agregar Logo

1. Guardar tu logo en `img/logo.png`
2. En `index.html`, buscar línea ~40 y reemplazar:
```html
<a class="navbar-brand" href="#inicio">
    <img src="img/logo.png" alt="PULSE Marketing" height="50">
</a>
```

### Agregar Fotos de Casos de Éxito

1. Guardar fotos en `img/casos/`
2. En cada caso, agregar imagen en `index.html`

---

## ✅ Checklist de Lanzamiento

Antes de publicar, verificar:

- [ ] EmailJS configurado y funcionando
- [ ] Números de WhatsApp correctos
- [ ] Email de contacto correcto
- [ ] Logo agregado (si tienes)
- [ ] Fotos agregadas (opcional)
- [ ] Probado en móvil y desktop
- [ ] Formulario funciona y llegan emails

---

## 🆘 Problemas Comunes

### "El email no se envía"
✅ **Solución:** Verificar que las 3 credenciales de EmailJS estén correctas en `js/main.js`

### "No veo mi logo"
✅ **Solución:** Verificar que el archivo esté en `img/logo.png` y la ruta en el HTML sea correcta

### "El sitio no se ve bien en móvil"
✅ **Solución:** Abrir con Chrome o Safari. El sitio es 100% responsive.

### "Los botones de WhatsApp no abren la app"
✅ **Solución:** Probar en móvil. En desktop abrirá WhatsApp Web.

---

## 📞 Estructura de Contacto

**Formulario Web →** Envía a: `Mktberistainestudio@gmail.com`

**WhatsApp Directo:**
- Sofía (Community Manager): +54 9 11 7364-2577
- Julieta (Comunicación): +54 9 11 4091-8785

**Botón Flotante:** Lleva al WhatsApp de Sofía por defecto

---

## 🎯 Servicios Incluidos en el Sitio

1. **Community Manager** 📱
   - Gestión de RRSS
   - Creación de contenido
   - Diseño gráfico
   - Reportes de métricas

2. **Diseño Web & SEO** 🌐
   - Sitios web profesionales
   - Optimización para buscadores
   - Responsive design

3. **Google Ads** 📊
   - Campañas publicitarias
   - Optimización ROI
   - Análisis de métricas

4. **Comunicación Empresarial** 📺
   - Relaciones con medios
   - Edición de video
   - Notas periodísticas

---

## 🏆 Casos de Éxito Incluidos

1. **Beristain & Asociados** - Estudio Jurídico
2. **Küme Wellness** - Estética Holística
3. **Club Agronomía Central** - Deportivo
4. **Bennu Pastelería** - Gastronomía

---

## 📱 Redes Sociales (Futuro)

Cuando crees las redes de PULSE Marketing, agregar en el footer:

```html
<div class="social-links">
    <a href="tu_instagram"><i class="bi bi-instagram"></i></a>
    <a href="tu_facebook"><i class="bi bi-facebook"></i></a>
    <a href="tu_linkedin"><i class="bi bi-linkedin"></i></a>
</div>
```

---

## 🎉 ¡Listo para Empezar!

Una vez que hayas completado los 3 pasos, tu sitio estará 100% funcional y listo para recibir consultas.

**Próximos pasos sugeridos:**
1. Compartir el link en redes sociales personales
2. Agregar el link a tu bio de Instagram
3. Compartir por WhatsApp con contactos
4. Configurar un dominio personalizado (opcional)
5. Crear perfiles de redes para PULSE Marketing

---

**¿Necesitas más detalles?** Revisa el `README.md` completo con todas las configuraciones avanzadas.

✨ **¡Mucha suerte con PULSE Marketing!** ✨

---

**Contacto del Equipo:**
- Sofía Beristain: +54 9 11 7364-2577
- Julieta Beristain: +54 9 11 4091-8785
- Email: Mktberistainestudio@gmail.com

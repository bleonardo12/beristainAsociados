# 🚀 Inicio Rápido - Küme Wellness

## ⚡ 3 Pasos para Tener tu Sitio Funcionando

### 1️⃣ CONFIGURAR EMAILJS (5 minutos)

**¿Para qué?** Para que los clientes reciban un email automático cuando reserven un turno.

**Pasos:**

1. **Crear cuenta gratis:** https://www.emailjs.com/ → Sign Up
2. **Conectar Gmail:**
   - Click en "Email Services" → "Add New Service"
   - Elegir "Gmail" → Autorizar tu cuenta
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

### 2️⃣ PERSONALIZAR CONTACTO (2 minutos)

Buscar y reemplazar en `index.html`:

- `+5491112345678` → Tu número de WhatsApp real
- `tucorreo@gmail.com` → Tu email (en js/main.js línea 93)
- `kume.wellness` → Tu Instagram (si es otro)

---

### 3️⃣ PUBLICAR EL SITIO (3 minutos)

**Opción más fácil - Netlify:**

1. Ir a https://app.netlify.com/drop
2. Arrastrar la carpeta `kume-wellness` completa
3. ¡Listo! Tu sitio estará online con una URL tipo: `https://tu-sitio-123.netlify.app`

**Más adelante** podes configurar un dominio personalizado (ej: kumewellness.com.ar)

---

## 🎨 Personalizaciones Comunes

### Cambiar Colores

Archivo: `css/styles.css` (líneas 3-20)

```css
:root {
    --primary: #8B9A7B;    /* Verde principal - cambiar a tu gusto */
    --secondary: #D4C5B0;  /* Beige secundario */
}
```

### Cambiar Horarios

Archivo: `index.html` (buscar "Horario" en el formulario)

Agregar o quitar opciones:
```html
<option value="09:00">09:00</option>
<option value="10:00">10:00</option>
<!-- Agregar más horarios aquí -->
```

### Agregar Logo

1. Guardar tu logo en `img/logo.png`
2. En `index.html`, buscar línea ~48 y reemplazar:
```html
<a class="navbar-brand" href="index.html">
    <img src="img/logo.png" alt="Küme Wellness" height="50">
</a>
```

### Agregar Fotos

1. Guardar fotos del spa en carpeta `img/`
2. Reemplazar el placeholder de "Sobre Nosotros" con:
```html
<img src="img/spa-foto1.jpg" alt="Küme Wellness" class="img-fluid" style="border-radius: 20px;">
```

---

## ✅ Checklist de Lanzamiento

Antes de publicar, verificar:

- [ ] EmailJS configurado y funcionando
- [ ] Número de WhatsApp actualizado
- [ ] Email de contacto actualizado
- [ ] Instagram correcto
- [ ] Logo agregado (si tenés)
- [ ] Colores personalizados (opcional)
- [ ] Fotos del negocio agregadas (opcional)
- [ ] Probado en móvil y desktop
- [ ] Formulario de reservas funciona
- [ ] Email de confirmación llega correctamente

---

## 🆘 Problemas Comunes

### "El email no se envía"
✅ **Solución:** Verificar que las 3 credenciales de EmailJS estén correctas en `js/main.js`

### "No puedo seleccionar fechas"
✅ **Solución:** El calendario solo permite fechas futuras (no pasadas) y no permite domingos

### "El sitio no se ve bien en móvil"
✅ **Solución:** Abrir con Chrome o Safari, no con Internet Explorer. El sitio es 100% responsive.

---

## 📞 ¿Necesitas Ayuda?

Si tenés dudas o problemas, estos recursos te pueden ayudar:

- 📖 **README completo:** `README.md` (tiene todo más detallado)
- 🎥 **Tutorial EmailJS:** https://www.youtube.com/watch?v=dgcYOm8n8ME
- 💬 **Documentación EmailJS:** https://www.emailjs.com/docs/

---

## 🎉 ¡Listo para Empezar!

Una vez que hayas completado los 3 pasos, tu sitio estará 100% funcional y listo para recibir reservas online.

**Próximos pasos sugeridos:**
1. Compartir el link en tu Instagram
2. Agregar el link a tu bio de Instagram
3. Compartir por WhatsApp con tus clientes
4. Configurar un dominio personalizado (opcional)

---

✨ **¡Mucha suerte con Küme Wellness!** ✨

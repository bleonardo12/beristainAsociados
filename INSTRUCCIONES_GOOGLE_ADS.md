# 📢 Instrucciones para Activar Google Ads

**Fecha:** 6 de noviembre de 2025
**Estado:** Preparado pero inactivo (requiere ID de Google Ads)

---

## 🎯 Resumen

El código de Google Ads ya está **implementado y listo** en el sitio web, pero está **comentado** (inactivo) porque necesitas tu **ID de Google Ads** para activarlo.

---

## 📋 Pasos para Activar Google Ads

### 1️⃣ Obtener tu ID de Google Ads

1. Ve a [Google Ads](https://ads.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Crea una cuenta de Google Ads si aún no tienes una
4. Una vez dentro, ve a **Herramientas y Configuración** > **Configuración**
5. Busca tu **ID de conversión** (tiene el formato `AW-XXXXXXXXXX`)

### 2️⃣ Activar el Código en tu Sitio Web

Edita el archivo `frontend/index.html` y busca las líneas 73-91:

**ANTES (código comentado):**
```html
<!-- Google Ads (Conversion Tracking) -->
<!-- IMPORTANTE: Reemplazar 'AW-XXXXXXXXXX' con tu ID real de Google Ads -->
<!--
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-XXXXXXXXXX"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'AW-XXXXXXXXXX');

    // Configuración de consentimiento por defecto (antes de que el usuario decida)
    gtag('consent', 'default', {
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied',
        'analytics_storage': 'granted'
    });
</script>
-->
```

**DESPUÉS (código activado - reemplaza AW-XXXXXXXXXX con tu ID real):**
```html
<!-- Google Ads (Conversion Tracking) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-1234567890"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'AW-1234567890');

    // Configuración de consentimiento por defecto (antes de que el usuario decida)
    gtag('consent', 'default', {
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied',
        'analytics_storage': 'granted'
    });
</script>
```

**⚠️ IMPORTANTE:** Reemplaza `AW-1234567890` con tu ID real en **DOS lugares**:
- En el atributo `src` del primer script
- En el `gtag('config', 'AW-1234567890')`

### 3️⃣ Configurar Eventos de Conversión

Una vez activado Google Ads, querrás rastrear conversiones (cuando alguien envía el formulario de contacto).

#### Opción A: Configuración Manual

1. En Google Ads, ve a **Herramientas** > **Conversiones**
2. Haz clic en **+ Nueva conversión**
3. Selecciona **Sitio web**
4. Configura:
   - **Categoría:** Contactos
   - **Nombre:** Formulario de Contacto
   - **Valor:** 1 (o el valor que consideres apropiado)
5. Copia el **Label de conversión** (algo como `AbCdEf123456`)

Luego, edita `frontend/js/modules/contactForm.js` y busca la función de envío exitoso. Añade:

```javascript
// Después de envío exitoso del formulario
if (typeof gtag !== 'undefined') {
  gtag('event', 'conversion', {
    'send_to': 'AW-XXXXXXXXXX/CONVERSION_LABEL', // Reemplaza con tus valores
    'value': 1.0,
    'currency': 'ARS',
    'transaction_id': Date.now()
  });
}
```

#### Opción B: Configuración vía Google Tag Manager (Recomendado)

Si ya tienes Google Tag Manager activo (GTM-W6F4XTKN), es más fácil configurar las conversiones desde ahí:

1. Ve a [Google Tag Manager](https://tagmanager.google.com/)
2. Crea una nueva **Etiqueta** de tipo "Conversión de Google Ads"
3. Vincula tu ID de Google Ads
4. Configura el activador para que se dispare cuando se envíe el formulario
5. Publica los cambios

---

## 🔧 Verificación

### ¿Cómo saber si Google Ads está funcionando?

1. **Instala Google Tag Assistant:** [Chrome Extension](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
2. Ve a tu sitio web
3. Abre Google Tag Assistant
4. Deberías ver:
   - ✅ Google Analytics (ya activo)
   - ✅ Google Tag Manager (ya activo)
   - ✅ Google Ads Remarketing (si activaste el código)

### Prueba de Conversión

1. Ve a tu sitio web
2. Envía el formulario de contacto
3. En Google Ads > Conversiones, verifica que se haya registrado (puede tardar hasta 24 horas)

---

## 🛡️ Gestión de Consentimiento (GDPR/CCPA)

✅ **Ya implementado:**
- El código de Google Ads ya está integrado con el sistema de cookies
- Por defecto, Google Ads está **bloqueado** hasta que el usuario acepte cookies de marketing
- Cuando el usuario hace clic en **"Aceptar"** en el banner de cookies, se activan automáticamente:
  - `ad_storage`: granted
  - `ad_user_data`: granted
  - `ad_personalization`: granted

Esto cumple con:
- ✅ GDPR (Europa)
- ✅ CCPA (California)
- ✅ Ley 25.326 (Argentina)

---

## 📊 Eventos de Remarketing Adicionales

Si quieres rastrear más interacciones de usuarios (para remarketing), puedes añadir eventos personalizados:

### Ejemplo 1: Usuario visita página de Derecho Penal

Añade al final de `frontend/js/modules/navbar.js`:

```javascript
// Rastrear visitas a secciones específicas
document.querySelectorAll('a[href="#dchoPenal"]').forEach(link => {
  link.addEventListener('click', () => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', {
        'send_to': 'AW-XXXXXXXXXX',
        'pagePath': '/derecho-penal',
        'pageTitle': 'Derecho Penal'
      });
    }
  });
});
```

### Ejemplo 2: Usuario interactúa con el chatbot

Añade en `frontend/js/modules/chatbot.js`:

```javascript
// Cuando el usuario abre el chatbot
if (typeof gtag !== 'undefined') {
  gtag('event', 'engagement', {
    'event_category': 'chatbot',
    'event_label': 'chatbot_opened'
  });
}
```

---

## 🚨 Errores Comunes

### Error 1: "gtag is not defined"
**Causa:** El código de Google Ads está comentado o el ID es incorrecto
**Solución:** Verifica que hayas descomentado el código y que el ID sea correcto

### Error 2: Conversiones no se registran
**Causa:** El evento de conversión no está configurado correctamente
**Solución:** Verifica el Label de conversión en Google Ads y que el código de tracking esté en el lugar correcto

### Error 3: "Ad blocker blocking Google Ads"
**Causa:** Extensiones de navegador bloqueando scripts de publicidad
**Solución:** Desactiva temporalmente los bloqueadores de anuncios para pruebas

---

## 📞 Necesitas Ayuda?

Si tienes problemas para activar Google Ads o configurar conversiones:

1. **Revisa la documentación oficial:** [Google Ads Help](https://support.google.com/google-ads)
2. **Consulta con un especialista en Google Ads**
3. **Contacta con el soporte de Google Ads:** Desde tu panel de Google Ads

---

## ✅ Checklist de Activación

- [ ] Tengo mi ID de Google Ads (formato: AW-XXXXXXXXXX)
- [ ] He descomentado el código en `frontend/index.html` (líneas 73-91)
- [ ] He reemplazado `AW-XXXXXXXXXX` con mi ID real (en 2 lugares)
- [ ] He configurado una conversión en Google Ads
- [ ] He añadido el código de conversión en `contactForm.js` (o vía GTM)
- [ ] He probado que el banner de cookies funcione correctamente
- [ ] He verificado con Google Tag Assistant que Google Ads se carga
- [ ] He enviado un formulario de prueba para verificar conversiones

---

**¡Listo!** Una vez completado el checklist, Google Ads estará completamente funcional en tu sitio web.

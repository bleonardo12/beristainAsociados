# 🎯 Configuración de Conversiones de Google Ads

**Fecha:** 7 de noviembre de 2025
**Estado:** Código implementado, requiere configuración del Conversion Label

---

## 🎯 Objetivo

Trackear las conversiones (envíos del formulario de contacto) en Google Ads para:
1. **Medir el ROI** de tus campañas publicitarias
2. **Optimizar automáticamente** las campañas para generar más leads
3. **Ver qué anuncios** generan más consultas legales
4. **Calcular el costo por lead** (CPL)

---

## 📊 Integración Actual

### ✅ Ya Implementado en el Código:

**Google Ads ID:** `AW-11107730225`

**Archivos Configurados:**
- ✅ `frontend/index.html` - Google Ads tag instalado (líneas 73-86)
- ✅ `frontend/js/modules/analytics.js` - Sistema de tracking completo
- ✅ `frontend/js/modules/contactForm.js` - Conversión configurada (línea 266)
- ✅ `frontend/js/main.js` - Analytics inicializado

**Eventos que se Trackean Automáticamente:**
- ✅ Envío exitoso del formulario (conversión principal)
- ✅ Errores de envío del formulario
- ✅ Clicks en WhatsApp
- ✅ Clicks en teléfono
- ✅ Clicks en redes sociales
- ✅ Profundidad de scroll
- ✅ Tiempo en página
- ✅ Visualización de secciones
- ✅ Interacciones con campos del formulario
- ✅ Abandono del formulario

---

## 📋 PASO 1: Crear Acción de Conversión en Google Ads

### 1. Accede a Google Ads
👉 https://ads.google.com/

### 2. Ve a Conversiones
1. Click en **"Herramientas y Configuración"** (icono de llave inglesa)
2. En **"Medición"**, click en **"Conversiones"**
3. Click en **"+ Nueva acción de conversión"**

### 3. Selecciona el Tipo
- Click en **"Sitio web"**

### 4. Configura la Conversión

**Categoría:** `Contactos`
**Nombre de conversión:** `Formulario de Contacto - Beristain & Asociados`

**Valor:**
- **Opción 1 (Recomendada):** Usar el mismo valor para cada conversión = `$50 ARS`
  - Estima el valor promedio de un lead legal (ajustar según tu negocio)
- **Opción 2:** No usar un valor = `No especificar`

**Recuento:**
- Seleccionar: **"Uno"** (solo contar una conversión por click)
  - ✅ Correcto: Evita contar múltiples envíos de la misma persona

**Ventana de conversión tras el click:** `30 días` (default)

**Ventana de conversión tras visualización:** `1 día` (default)

**Modelo de atribución:** `Basado en datos` o `Último click` (recomendado para comenzar)

### 5. Configurar el Tag

**Método de seguimiento:**
- Seleccionar: **"Usar etiqueta de Google (gtag.js)"**

**Configuración de etiqueta:**
- Seleccionar: **"Usar Google Tag Manager"** si usas GTM (GTM-W6F4XTKN)
- O: **"Añadir el código tú mismo"** si prefieres implementación directa

### 6. **IMPORTANTE: Copiar el Conversion Label**

Después de crear la conversión, verás un código como:

```html
<!-- Event snippet for Formulario de Contacto conversion page -->
<script>
  gtag('event', 'conversion', {'send_to': 'AW-11107730225/AbC1dEfG2hIjKlMnOp'});
</script>
```

**COPIAR SOLO LA PARTE DESPUÉS DE `/`**

En este ejemplo, el **Conversion Label** es: `AbC1dEfG2hIjKlMnOp`

---

## 📋 PASO 2: Configurar el Conversion Label en el Código

### 1. Editar `contactForm.js`

**Ubicación:** `frontend/js/modules/contactForm.js`, línea 267

**Buscar:**
```javascript
gtag('event', 'conversion', {
  'send_to': 'AW-11107730225/XXXXXXXXXX', // ← CONFIGURAR CONVERSION_LABEL
  'value': 1.0,
  'currency': 'ARS',
  'transaction_id': Date.now().toString()
});
```

**Reemplazar `XXXXXXXXXX` con tu Conversion Label:**
```javascript
gtag('event', 'conversion', {
  'send_to': 'AW-11107730225/AbC1dEfG2hIjKlMnOp', // ← TU CONVERSION LABEL REAL
  'value': 1.0,
  'currency': 'ARS',
  'transaction_id': Date.now().toString()
});
```

### 2. **OPCIONAL:** Ajustar el Valor de la Conversión

Si en Google Ads configuraste un valor específico (ejemplo: $50 ARS por lead), ajusta:

```javascript
gtag('event', 'conversion', {
  'send_to': 'AW-11107730225/AbC1dEfG2hIjKlMnOp',
  'value': 50.0, // ← VALOR QUE CONFIGURASTE EN GOOGLE ADS
  'currency': 'ARS',
  'transaction_id': Date.now().toString()
});
```

---

## 📋 PASO 3: Deploy y Pruebas

### 1. Deploy a VPS

```bash
# Desde tu terminal local
./deploy.sh
```

O manualmente:
```bash
git add frontend/js/modules/contactForm.js
git commit -m "feat: Configurar Google Ads conversion label para formulario de contacto"
git push origin claude/fix-responsive-design-011CUsQjjT8cgmQ7VTTFRv91
ssh root@69.62.95.98 "cd /var/www/beristainAsociados && git pull origin master && systemctl reload nginx"
```

### 2. Verificar Tag de Google Ads

**Método 1: Google Tag Assistant (Recomendado)**

1. Instalar extensión: [Google Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
2. Ve a tu sitio web
3. Click en la extensión
4. Deberías ver:
   - ✅ Google Ads Conversion Tracking (AW-11107730225)
   - ✅ Google Analytics (G-MLZ2VR5SYR)
   - ✅ Google Tag Manager (GTM-W6F4XTKN)

**Método 2: Consola del Navegador**

1. Abre tu sitio web
2. Abre DevTools (F12)
3. Ve a la pestaña **Console**
4. Envía el formulario de prueba
5. Deberías ver:
   ```
   📊 Google Ads conversion tracked
   📊 Google Analytics event tracked
   ```

### 3. Prueba de Conversión Real

1. **VE A TU SITIO WEB** (no en localhost, debe ser el dominio real)
2. **LLENA EL FORMULARIO** con datos de prueba
3. **ENVÍA EL FORMULARIO**
4. En la consola del navegador deberías ver:
   ```
   ✅ Email enviado exitosamente
   📊 Google Ads conversion tracked
   📊 Google Analytics event tracked
   ```

### 4. Verificar en Google Ads (Importante!)

**La conversión puede tardar hasta 24 horas en aparecer**, pero generalmente se muestra en 2-4 horas.

1. Ve a **Google Ads** > **Herramientas** > **Conversiones**
2. Busca **"Formulario de Contacto - Beristain & Asociados"**
3. Deberías ver:
   - **Estado:** Registrando conversiones
   - **Conversiones recientes:** 1 (tu prueba)

---

## 🔧 Verificación Avanzada

### Usar Google Ads Preview Mode

1. En Google Ads, ve a **Conversiones**
2. Click en tu conversión **"Formulario de Contacto"**
3. Click en **"Ver detalles"**
4. Deberías ver el **ID de transacción** (timestamp) de tu conversión de prueba

### Verificar en Google Analytics

1. Ve a **Google Analytics** (https://analytics.google.com/)
2. **Informes** > **Eventos**
3. Buscar evento: `form_submission`
4. Deberías ver tu conversión registrada con:
   - **event_category:** Contact
   - **event_label:** [Área legal seleccionada]
   - **value:** 1

---

## 📊 Eventos Adicionales Trackeados

Además de la conversión principal del formulario, el sistema trackea:

### 1. **Interacciones con WhatsApp**
```javascript
gtag('event', 'whatsapp_click', {
  'event_category': 'Contact',
  'event_label': 'WhatsApp',
  'value': 1
});
```

### 2. **Clicks en Teléfono**
```javascript
gtag('event', 'phone_click', {
  'event_category': 'Contact',
  'event_label': '[Número]',
  'value': 1
});
```

### 3. **Profundidad de Scroll**
- 25%, 50%, 75%, 90%, 100%

### 4. **Tiempo en Página**
- 30s, 60s, 120s, 300s

### 5. **Errores de Formulario**
```javascript
gtag('event', 'form_error', {
  'event_category': 'Form',
  'event_label': 'email - invalid_format',
  'value': 1
});
```

---

## 🎯 Optimización de Campañas con Conversiones

Una vez que tengas conversiones trackeadas:

### 1. **Estrategias de Puja Inteligentes**

En Google Ads, cambia a estrategias basadas en conversiones:
- **Maximizar conversiones:** Obtener el máximo número de leads
- **CPA objetivo:** Controlar el costo por lead
- **ROAS objetivo:** Si asignas valor a conversiones

### 2. **Listas de Remarketing**

Crear audiencias personalizadas:
- Usuarios que enviaron el formulario (para excluir de campañas)
- Usuarios que visitaron pero no convirtieron
- Usuarios que interactuaron con el formulario pero no enviaron

### 3. **Informes de Conversión**

En Google Ads:
- **Campañas** > Ver columnas > **Personalizar columnas** > Marcar:
  - Conversiones
  - Tasa de conversión
  - Costo por conversión
  - Valor de conversión

---

## 🚨 Errores Comunes y Soluciones

### Error 1: Conversiones no aparecen en Google Ads

**Causa:** Conversion label incorrecto o no configurado

**Solución:**
1. Verifica que el conversion label en `contactForm.js` sea exactamente igual al de Google Ads
2. NO debe incluir el prefijo `AW-11107730225/`, solo la parte después

### Error 2: "gtag is not defined" en consola

**Causa:** Google Ads script no cargó correctamente

**Solución:**
1. Verifica que en `index.html` (líneas 73-86) el script de Google Ads esté presente
2. Desactiva bloqueadores de anuncios para pruebas
3. Verifica que no haya errores de red en DevTools > Network

### Error 3: Conversión se trackea múltiples veces

**Causa:** Usuario envía el formulario varias veces

**Solución:**
- Ya está resuelto: El `transaction_id` único evita duplicados
- En Google Ads, configura "Recuento: Uno"

### Error 4: Conversiones aparecen con 24 horas de retraso

**Causa:** Procesamiento normal de Google Ads

**Solución:** Esto es normal. Las conversiones pueden tardar hasta 24 horas en procesarse completamente.

---

## 📈 Métricas Clave a Monitorear

Una vez activas las conversiones:

| Métrica | Objetivo | Dónde Ver |
|---------|----------|-----------|
| **Tasa de conversión** | > 5% | Google Ads > Campañas |
| **Costo por conversión** | < $500 ARS | Google Ads > Campañas |
| **Conversiones totales** | Incremento mensual | Google Ads > Informes |
| **Calidad de leads** | Manual (seguimiento propio) | CRM/Spreadsheet |
| **Tiempo a conversión** | 1-3 días | Google Ads > Informes |

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] Acción de conversión creada en Google Ads
- [ ] Conversion Label copiado desde Google Ads
- [ ] `contactForm.js` actualizado con el Conversion Label real (línea 267)
- [ ] Deploy ejecutado: `./deploy.sh`
- [ ] Google Tag Assistant muestra Google Ads activo
- [ ] Prueba de formulario realizada
- [ ] Logs en consola muestran "Google Ads conversion tracked"
- [ ] Conversión aparece en Google Ads (puede tardar hasta 24 horas)
- [ ] Estrategia de puja actualizada a "Maximizar conversiones"

---

## 🎓 Recursos Adicionales

**Google Ads Help:**
- [Acerca del seguimiento de conversiones](https://support.google.com/google-ads/answer/1722022)
- [Configurar el seguimiento de conversiones para tu sitio web](https://support.google.com/google-ads/answer/6095821)
- [Solucionar problemas con el seguimiento de conversiones](https://support.google.com/google-ads/answer/2382981)

**Google Tag Manager (si prefieres usarlo):**
- [Configurar Google Ads con GTM](https://support.google.com/tagmanager/answer/6105160)
- Tu GTM ID: `GTM-W6F4XTKN`

**Google Analytics:**
- [Vincular Google Ads con Analytics](https://support.google.com/analytics/answer/1033961)
- Tu GA4 ID: `G-MLZ2VR5SYR`

---

## 💰 Impacto Esperado

### Antes (Sin Conversiones):
- ❌ No sabes qué anuncios funcionan
- ❌ Gastos sin poder medir ROI
- ❌ Optimización manual y subjetiva
- ❌ No puedes usar pujas inteligentes

### Después (Con Conversiones):
- ✅ Sabes exactamente qué anuncios generan leads
- ✅ Calculas el ROI real de cada campaña
- ✅ Google Ads optimiza automáticamente
- ✅ Puedes usar estrategias de puja avanzadas (CPA, ROAS)
- ✅ Reduces el costo por lead con el tiempo

**Ejemplo Real:**
```
Campaña: "Abogado Penalista CABA"
Clicks: 100
Conversiones: 5 (formularios enviados)
Tasa de conversión: 5%
Costo: $2,000 ARS
Costo por conversión: $400 ARS

Con optimización automática:
Conversiones después de 2 meses: 8
Costo por conversión: $250 ARS
Ahorro: $150 ARS por lead
```

---

## 📞 ¿Necesitas Ayuda?

Si tienes problemas configurando las conversiones:
1. Revisa los logs de la consola del navegador (F12)
2. Verifica que el Conversion Label sea correcto
3. Usa Google Tag Assistant para diagnosticar
4. Consulta Google Ads Help Center
5. Contacta con soporte de Google Ads desde tu panel

---

**¡Listo!** Una vez configurado el Conversion Label, tus conversiones se trackearán automáticamente y podrás optimizar tus campañas de Google Ads para maximizar los leads legales.

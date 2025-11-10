# 📄 Generador de Presupuestos - Beristain & Asociados

Sistema web para generar presupuestos profesionales en PDF de forma automática.

## ✨ Características

- ✅ **100% Automático** - Genera PDFs profesionales al instante
- ✅ **Responsive** - Funciona en PC, tablet y celular
- ✅ **Sin conexión** - Funciona offline (después de la primera carga)
- ✅ **Profesional** - Diseño elegante con logo y membrete
- ✅ **Cálculo automático** - Total con IVA calculado en tiempo real
- ✅ **Numeración única** - Cada presupuesto tiene número único
- ✅ **Privado** - Solo accesible desde tu dominio

## 🚀 Cómo usar

### Opción 1: Servidor local (Python)

```bash
cd frontend/presupuestos
python3 -m http.server 8080
```

Abrí en el navegador: http://localhost:8080

### Opción 2: Publicar en tu web

Subí la carpeta `presupuestos` a tu servidor web y accedé desde:
```
https://tudominio.com/presupuestos/
```

## 📋 Campos del formulario

### Datos del Cliente
- Nombre completo (requerido)
- DNI (requerido)
- Email (opcional)
- Teléfono (opcional)

### Servicio Jurídico
- Área/Servicio (lista desplegable)
- Descripción detallada del caso (requerido)

### Honorarios
- Honorarios profesionales (requerido)
- Gastos administrativos
- IVA (0%, 10.5%, 21%)
- **Total calculado automáticamente**

### Condiciones
- Forma de pago (lista desplegable)
- Vigencia del presupuesto
- Observaciones adicionales

## 📱 Acceso desde celular

El sistema es **100% responsive**. Para usarlo desde el celular:

1. Accedé a la URL del generador desde tu navegador móvil
2. Completá el formulario (se adapta a pantalla pequeña)
3. Hacé clic en "Generar PDF"
4. El PDF se descarga automáticamente en tu celular
5. Podés enviarlo directamente por WhatsApp, email, etc.

## 🎨 Personalización

### Cambiar servicios disponibles

Editá `/js/generador.js` y modificá el select de servicios en `/index.html` (líneas 67-89).

### Cambiar condiciones de pago

Editá `/index.html` líneas 128-133 para modificar las opciones de forma de pago.

### Modificar diseño del PDF

Editá `/js/generador.js` función `generarPDF()` para cambiar:
- Colores (líneas 71-73)
- Textos del encabezado
- Estructura de las secciones
- Pie de página

### Agregar logo real

Reemplazá el texto "BERISTAIN & ASOCIADOS" en el PDF por una imagen:

```javascript
// En generador.js, línea ~107, reemplazá:
doc.text('BERISTAIN & ASOCIADOS', 105, 18, { align: 'center' });

// Por:
const logo = new Image();
logo.src = 'ruta/a/tu/logo.png';
doc.addImage(logo, 'PNG', 20, 10, 40, 20);
```

## 🔒 Privacidad y seguridad

### Proteger con contraseña (opcional)

Para agregar protección básica, creá un archivo `.htaccess`:

```apache
AuthType Basic
AuthName "Área Privada - Beristain & Asociados"
AuthUserFile /ruta/completa/.htpasswd
Require valid-user
```

O usá autenticación de tu servidor web.

## 💾 Datos guardados

**IMPORTANTE:** Este sistema NO guarda ningún dato. Todo se procesa en el navegador del usuario.

- ✅ No se envían datos a ningún servidor
- ✅ No se almacenan datos del cliente
- ✅ Privacidad total

Si querés guardar historial de presupuestos, considerá agregar:
- Base de datos (requiere backend)
- Google Sheets API
- Envío por email automático

## 📞 Soporte

Para dudas o personalizaciones, consultá con el desarrollador.

## 📄 Licencia

© 2024 Beristain & Asociados - Todos los derechos reservados.

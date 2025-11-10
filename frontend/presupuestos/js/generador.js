// ===========================
// GENERADOR DE PRESUPUESTOS
// Beristain & Asociados
// ===========================

document.addEventListener('DOMContentLoaded', function() {

    // Elementos del formulario
    const form = document.getElementById('presupuestoForm');
    const servicioSelect = document.getElementById('servicio');
    const honorariosInput = document.getElementById('honorarios');
    const gastosInput = document.getElementById('gastos');
    const ivaSelect = document.getElementById('iva');
    const totalEstimadoInput = document.getElementById('totalEstimado');

    // Elementos de calculadora UMA
    const valorUMAInput = document.getElementById('valorUMA');
    const cantidadUMAInput = document.getElementById('cantidadUMA');
    const totalUMAInput = document.getElementById('totalUMA');
    const btnAplicarUMA = document.getElementById('btnAplicarUMA');

    // Calcular total automáticamente
    function calcularTotal() {
        const honorarios = parseFloat(honorariosInput.value) || 0;
        const gastos = parseFloat(gastosInput.value) || 0;
        const ivaPercentage = parseFloat(ivaSelect.value) || 0;

        const subtotal = honorarios + gastos;
        const ivaAmount = (subtotal * ivaPercentage) / 100;
        const total = subtotal + ivaAmount;

        totalEstimadoInput.value = total.toLocaleString('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // Calcular total en UMA
    function calcularTotalUMA() {
        const valorUMA = parseFloat(valorUMAInput.value) || 0;
        const cantidadUMA = parseFloat(cantidadUMAInput.value) || 0;
        const total = valorUMA * cantidadUMA;

        totalUMAInput.value = total.toLocaleString('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // Aplicar total UMA a honorarios
    function aplicarUMAaHonorarios() {
        const valorUMA = parseFloat(valorUMAInput.value) || 0;
        const cantidadUMA = parseFloat(cantidadUMAInput.value) || 0;
        const total = valorUMA * cantidadUMA;

        if (total > 0) {
            honorariosInput.value = total.toFixed(2);
            calcularTotal();
            mostrarAlerta('Honorarios actualizados con el cálculo de UMA', 'success');
        } else {
            mostrarAlerta('Ingrese el valor de UMA y la cantidad primero', 'warning');
        }
    }

    // Auto-completar UMA cuando se selecciona un servicio con UMA predefinida
    function autoCompletarUMA() {
        const selectedOption = servicioSelect.options[servicioSelect.selectedIndex];
        const umaValue = selectedOption.getAttribute('data-uma');

        if (umaValue) {
            cantidadUMAInput.value = umaValue;
            calcularTotalUMA();

            // Highlight calculadora UMA
            const calculadoraCard = cantidadUMAInput.closest('.card');
            calculadoraCard.classList.add('border-primary', 'border-2');
            setTimeout(() => {
                calculadoraCard.classList.remove('border-primary', 'border-2');
            }, 2000);
        }
    }

    // Event listeners para cálculo automático
    honorariosInput.addEventListener('input', calcularTotal);
    gastosInput.addEventListener('input', calcularTotal);
    ivaSelect.addEventListener('change', calcularTotal);

    // Event listeners para calculadora UMA
    valorUMAInput.addEventListener('input', calcularTotalUMA);
    cantidadUMAInput.addEventListener('input', calcularTotalUMA);
    btnAplicarUMA.addEventListener('click', aplicarUMAaHonorarios);

    // Event listener para auto-completar UMA
    servicioSelect.addEventListener('change', autoCompletarUMA);

    // Calcular al cargar la página
    calcularTotal();

    // Manejar envío del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validar formulario
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            mostrarAlerta('Por favor, complete todos los campos obligatorios.', 'danger');
            return;
        }

        // Mostrar loading
        const btnSubmit = form.querySelector('button[type="submit"]');
        const btnOriginalText = btnSubmit.innerHTML;
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<span class="spinner me-2"></span>Generando PDF...';

        // Generar PDF (con pequeño delay para UX)
        setTimeout(() => {
            try {
                generarPDF();
                mostrarAlerta('¡Presupuesto generado exitosamente!', 'success');
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = btnOriginalText;
            } catch (error) {
                console.error('Error generando PDF:', error);
                mostrarAlerta('Error al generar el PDF. Por favor, intente nuevamente.', 'danger');
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = btnOriginalText;
            }
        }, 500);
    });

    // Función para generar PDF
    function generarPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Colores
        const primaryColor = [26, 77, 124]; // #1a4d7c
        const grayColor = [100, 100, 100];
        const lightGray = [200, 200, 200];

        // Variables del formulario
        const clienteNombre = document.getElementById('clienteNombre').value;
        const clienteDNI = document.getElementById('clienteDNI').value;
        const clienteEmail = document.getElementById('clienteEmail').value || '-';
        const clienteTelefono = document.getElementById('clienteTelefono').value || '-';
        const servicio = document.getElementById('servicio').value;
        const descripcion = document.getElementById('descripcion').value;
        const honorarios = parseFloat(document.getElementById('honorarios').value);
        const gastos = parseFloat(document.getElementById('gastos').value);
        const ivaPercentage = parseFloat(document.getElementById('iva').value);
        const formaPago = document.getElementById('formaPago').value;
        const vigencia = document.getElementById('vigencia').value;
        const observaciones = document.getElementById('observaciones').value;
        const detalleAdicional = document.getElementById('detalleAdicional').value;

        // Cálculos
        const subtotal = honorarios + gastos;
        const ivaAmount = (subtotal * ivaPercentage) / 100;
        const total = subtotal + ivaAmount;

        // Fecha actual y número de presupuesto
        const hoy = new Date();
        const fechaStr = hoy.toLocaleDateString('es-AR');
        const numeroPresupuesto = 'PPTO-' + hoy.getFullYear() +
            String(hoy.getMonth() + 1).padStart(2, '0') +
            String(hoy.getDate()).padStart(2, '0') + '-' +
            String(hoy.getHours()).padStart(2, '0') +
            String(hoy.getMinutes()).padStart(2, '0');

        let yPos = 20;

        // ===== ENCABEZADO =====
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 210, 40, 'F');

        // Logo/Nombre del estudio
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('BERISTAIN & ASOCIADOS', 105, 18, { align: 'center' });

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Estudio Jurídico', 105, 26, { align: 'center' });

        doc.setFontSize(10);
        doc.text('Araujo 319 - CABA', 105, 32, { align: 'center' });

        yPos = 50;

        // ===== INFORMACIÓN DEL PRESUPUESTO =====
        doc.setTextColor(...grayColor);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('PRESUPUESTO', 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(numeroPresupuesto, 70, yPos);

        yPos += 6;
        doc.setFont('helvetica', 'bold');
        doc.text('Fecha:', 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(fechaStr, 70, yPos);

        yPos += 6;
        doc.setFont('helvetica', 'bold');
        doc.text('Vigencia:', 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(vigencia + ' días desde la fecha de emisión', 70, yPos);

        yPos += 15;

        // ===== DATOS DEL CLIENTE =====
        doc.setFillColor(...primaryColor);
        doc.rect(20, yPos - 5, 170, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('DATOS DEL CLIENTE', 22, yPos);

        yPos += 10;
        doc.setTextColor(...grayColor);
        doc.setFontSize(11);

        doc.setFont('helvetica', 'bold');
        doc.text('Nombre:', 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(clienteNombre, 50, yPos);

        yPos += 6;
        doc.setFont('helvetica', 'bold');
        doc.text('DNI:', 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(clienteDNI, 50, yPos);

        yPos += 6;
        doc.setFont('helvetica', 'bold');
        doc.text('Email:', 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(clienteEmail, 50, yPos);

        yPos += 6;
        doc.setFont('helvetica', 'bold');
        doc.text('Teléfono:', 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(clienteTelefono, 50, yPos);

        yPos += 15;

        // ===== SERVICIO =====
        doc.setFillColor(...primaryColor);
        doc.rect(20, yPos - 5, 170, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('SERVICIO JURÍDICO', 22, yPos);

        yPos += 10;
        doc.setTextColor(...grayColor);
        doc.setFontSize(11);

        doc.setFont('helvetica', 'bold');
        doc.text('Área/Servicio:', 20, yPos);
        yPos += 6;
        doc.setFont('helvetica', 'normal');
        doc.text(servicio, 20, yPos);

        yPos += 10;
        doc.setFont('helvetica', 'bold');
        doc.text('Descripción:', 20, yPos);
        yPos += 6;
        doc.setFont('helvetica', 'normal');

        // Dividir descripción en líneas
        const descripcionLines = doc.splitTextToSize(descripcion, 170);
        doc.text(descripcionLines, 20, yPos);
        yPos += (descripcionLines.length * 6) + 10;

        // ===== TABLA DE HONORARIOS =====
        doc.setFillColor(...primaryColor);
        doc.rect(20, yPos - 5, 170, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('DETALLE DE HONORARIOS', 22, yPos);

        yPos += 12;

        // Encabezados de tabla
        doc.setFillColor(...lightGray);
        doc.rect(20, yPos - 6, 120, 8, 'F');
        doc.rect(140, yPos - 6, 50, 8, 'F');

        doc.setTextColor(...grayColor);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Concepto', 22, yPos);
        doc.text('Importe ($)', 165, yPos, { align: 'right' });

        yPos += 8;

        // Líneas de la tabla
        doc.setFont('helvetica', 'normal');
        doc.text('Honorarios Profesionales', 22, yPos);
        doc.text('$ ' + honorarios.toLocaleString('es-AR', { minimumFractionDigits: 2 }), 188, yPos, { align: 'right' });

        yPos += 6;
        doc.text('Gastos Administrativos', 22, yPos);
        doc.text('$ ' + gastos.toLocaleString('es-AR', { minimumFractionDigits: 2 }), 188, yPos, { align: 'right' });

        yPos += 6;
        doc.setDrawColor(...lightGray);
        doc.line(20, yPos, 190, yPos);

        yPos += 6;
        doc.setFont('helvetica', 'bold');
        doc.text('Subtotal', 22, yPos);
        doc.text('$ ' + subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 }), 188, yPos, { align: 'right' });

        yPos += 6;
        doc.setFont('helvetica', 'normal');
        doc.text('IVA (' + ivaPercentage + '%)', 22, yPos);
        doc.text('$ ' + ivaAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 }), 188, yPos, { align: 'right' });

        yPos += 6;
        doc.setLineWidth(0.5);
        doc.line(20, yPos, 190, yPos);

        yPos += 8;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('TOTAL', 22, yPos);
        doc.text('$ ' + total.toLocaleString('es-AR', { minimumFractionDigits: 2 }), 188, yPos, { align: 'right' });

        yPos += 15;

        // ===== CONDICIONES =====
        if (yPos > 240) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFillColor(...primaryColor);
        doc.rect(20, yPos - 5, 170, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('CONDICIONES COMERCIALES', 22, yPos);

        yPos += 10;
        doc.setTextColor(...grayColor);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Forma de Pago:', 20, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        doc.text(formaPago, 20, yPos);

        yPos += 10;
        if (observaciones) {
            doc.setFont('helvetica', 'bold');
            doc.text('Observaciones:', 20, yPos);
            yPos += 5;
            doc.setFont('helvetica', 'normal');
            const observacionesLines = doc.splitTextToSize(observaciones, 170);
            doc.text(observacionesLines, 20, yPos);
            yPos += (observacionesLines.length * 5) + 5;
        }

        // Detalle Adicional
        if (detalleAdicional) {
            // Verificar si necesitamos una nueva página
            if (yPos > 240) {
                doc.addPage();
                yPos = 20;
            }

            yPos += 5;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text('Detalle Adicional:', 20, yPos);
            yPos += 5;
            doc.setFont('helvetica', 'normal');
            const detalleLines = doc.splitTextToSize(detalleAdicional, 170);
            doc.text(detalleLines, 20, yPos);
            yPos += (detalleLines.length * 5) + 5;
        }

        // ===== NOTA IMPORTANTE =====
        yPos += 5;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        const notaLines = doc.splitTextToSize(
            'NOTA: Los honorarios indicados son estimativos y podrán variar según la complejidad del caso y las gestiones necesarias. ' +
            'No incluyen tasas judiciales ni gastos extraordinarios que pudieran surgir durante la tramitación.',
            170
        );
        doc.text(notaLines, 20, yPos);

        // ===== PIE DE PÁGINA =====
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);

            // Línea separadora
            doc.setDrawColor(...lightGray);
            doc.setLineWidth(0.5);
            doc.line(20, 280, 190, 280);

            // Información de contacto
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...grayColor);
            doc.text('Beristain & Asociados - Estudio Jurídico', 105, 283, { align: 'center' });
            doc.text('Dr. Leonardo Beristain - CUIT: 20-37992116-8', 105, 288, { align: 'center' });
            doc.setFontSize(8);
            doc.text('CPACF T146 F648 | CALM TXII F289 | CFALP T204 F114', 105, 292, { align: 'center' });
            doc.setFontSize(9);
            doc.text('Araujo 319 - CABA | Tel: +54 11 3591-3161', 105, 296, { align: 'center' });
            doc.text('Email: beristainyasociadosej@gmail.com', 105, 300, { align: 'center' });
        }

        // ===== GUARDAR PDF =====
        const nombreArchivo = 'Presupuesto_' + clienteNombre.replace(/\s+/g, '_') + '_' +
            hoy.getFullYear() + '-' + String(hoy.getMonth() + 1).padStart(2, '0') + '-' +
            String(hoy.getDate()).padStart(2, '0') + '.pdf';

        doc.save(nombreArchivo);
    }

    // Función para mostrar alertas
    function mostrarAlerta(mensaje, tipo) {
        const alertContainer = document.getElementById('alert-container');
        const alert = document.createElement('div');
        alert.className = `alert alert-${tipo} alert-dismissible fade show`;
        alert.role = 'alert';
        alert.innerHTML = `
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        alertContainer.innerHTML = '';
        alertContainer.appendChild(alert);

        // Auto-cerrar después de 5 segundos
        setTimeout(() => {
            alert.classList.remove('show');
            setTimeout(() => alert.remove(), 300);
        }, 5000);

        // Scroll al top para ver la alerta
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

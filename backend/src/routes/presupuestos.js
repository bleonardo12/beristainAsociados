const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const presupuestosController = require('../controllers/presupuestosController');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const {
    validate,
    sanitizeInput,
    parsePagination,
    parseFilters
} = require('../middleware/validation');

// Validaciones
const presupuestoValidation = [
    body('nombre')
        .trim()
        .notEmpty()
        .withMessage('Nombre del cliente es requerido')
        .isLength({ max: 100 })
        .withMessage('Nombre muy largo'),
    body('telefono')
        .trim()
        .notEmpty()
        .withMessage('Teléfono es requerido')
        .matches(/^[+]?[\d\s()-]{7,20}$/)
        .withMessage('Formato de teléfono inválido'),
    body('email')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
    body('empresa')
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 150 })
        .withMessage('Nombre de empresa muy largo'),
    body('rut')
        .optional({ nullable: true })
        .trim(),
    body('fecha')
        .notEmpty()
        .withMessage('Fecha es requerida')
        .isISO8601()
        .withMessage('Formato de fecha inválido'),
    body('servicios')
        .optional()
        .isArray()
        .withMessage('Servicios debe ser un array'),
    body('servicios.*.nombre')
        .if(body('servicios').exists())
        .trim()
        .notEmpty()
        .withMessage('Nombre de servicio es requerido'),
    body('servicios.*.valorUMA')
        .if(body('servicios').exists())
        .isFloat({ min: 0 })
        .withMessage('Valor UMA debe ser un número positivo'),
    body('servicios.*.cantidadUMA')
        .if(body('servicios').exists())
        .isFloat({ min: 0 })
        .withMessage('Cantidad UMA debe ser un número positivo'),
    body('honorarios')
        .isFloat({ min: 0 })
        .withMessage('Honorarios debe ser un número positivo'),
    body('gastos_operacionales')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Gastos operacionales debe ser un número positivo'),
    body('iva')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('IVA debe ser un número positivo'),
    body('total')
        .isFloat({ min: 0 })
        .withMessage('Total debe ser un número positivo'),
    body('notas')
        .optional()
        .trim(),
    body('estado')
        .optional()
        .isIn(['pendiente', 'enviado', 'aprobado', 'rechazado'])
        .withMessage('Estado inválido')
];

const updatePresupuestoValidation = [
    body('nombre')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Nombre del cliente no puede estar vacío')
        .isLength({ max: 100 })
        .withMessage('Nombre muy largo'),
    body('telefono')
        .optional()
        .trim()
        .matches(/^[+]?[\d\s()-]{7,20}$/)
        .withMessage('Formato de teléfono inválido'),
    body('email')
        .optional({ nullable: true })
        .trim()
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
    body('fecha')
        .optional()
        .isISO8601()
        .withMessage('Formato de fecha inválido'),
    body('servicios')
        .optional()
        .isArray()
        .withMessage('Servicios debe ser un array'),
    body('honorarios')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Honorarios debe ser un número positivo'),
    body('total')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Total debe ser un número positivo'),
    body('estado')
        .optional()
        .isIn(['pendiente', 'enviado', 'aprobado', 'rechazado'])
        .withMessage('Estado inválido')
];

/**
 * @route   GET /api/presupuestos
 * @desc    Listar todos los presupuestos (con filtros, paginación)
 * @access  Private
 */
router.get(
    '/',
    authenticateToken,
    checkPermission('presupuestos', 'read'),
    parsePagination,
    parseFilters,
    presupuestosController.listarPresupuestos
);

/**
 * @route   GET /api/presupuestos/estadisticas
 * @desc    Obtener estadísticas de presupuestos
 * @access  Private
 */
router.get(
    '/estadisticas',
    authenticateToken,
    checkPermission('presupuestos', 'read'),
    presupuestosController.obtenerEstadisticas
);

/**
 * @route   GET /api/presupuestos/:id
 * @desc    Obtener un presupuesto por ID
 * @access  Private
 */
router.get(
    '/:id',
    authenticateToken,
    checkPermission('presupuestos', 'read'),
    presupuestosController.obtenerPresupuesto
);

/**
 * @route   POST /api/presupuestos
 * @desc    Crear nuevo presupuesto
 * @access  Private
 */
router.post(
    '/',
    authenticateToken,
    checkPermission('presupuestos', 'create'),
    sanitizeInput,
    presupuestoValidation,
    validate,
    presupuestosController.crearPresupuesto
);

/**
 * @route   PUT /api/presupuestos/:id
 * @desc    Actualizar presupuesto
 * @access  Private
 */
router.put(
    '/:id',
    authenticateToken,
    checkPermission('presupuestos', 'update'),
    sanitizeInput,
    updatePresupuestoValidation,
    validate,
    presupuestosController.actualizarPresupuesto
);

/**
 * @route   DELETE /api/presupuestos/:id
 * @desc    Eliminar presupuesto
 * @access  Private (Admin o Socio)
 */
router.delete(
    '/:id',
    authenticateToken,
    checkPermission('presupuestos', 'delete'),
    presupuestosController.eliminarPresupuesto
);

module.exports = router;

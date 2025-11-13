const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const causasController = require('../controllers/causasController');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const {
    validate,
    sanitizeInput,
    parsePagination,
    parseFilters
} = require('../middleware/validation');

// Validaciones
const causaValidation = [
    body('nombre_caso')
        .trim()
        .notEmpty()
        .withMessage('Nombre del caso es requerido')
        .isLength({ max: 200 })
        .withMessage('Nombre del caso muy largo'),
    body('cliente')
        .trim()
        .notEmpty()
        .withMessage('Cliente es requerido')
        .isLength({ max: 150 })
        .withMessage('Nombre del cliente muy largo'),
    body('numero_causa')
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 50 })
        .withMessage('Número de causa muy largo'),
    body('tribunal')
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 150 })
        .withMessage('Nombre del tribunal muy largo'),
    body('fecha_inicio')
        .notEmpty()
        .withMessage('Fecha de inicio es requerida')
        .isISO8601()
        .withMessage('Formato de fecha inválido'),
    body('fecha_termino')
        .optional({ nullable: true })
        .isISO8601()
        .withMessage('Formato de fecha inválido'),
    body('materia')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Materia muy larga'),
    body('descripcion')
        .optional()
        .trim(),
    body('tareas')
        .optional()
        .isArray()
        .withMessage('Tareas debe ser un array'),
    body('tareas.*.descripcion')
        .if(body('tareas').exists())
        .trim()
        .notEmpty()
        .withMessage('Descripción de tarea es requerida'),
    body('tareas.*.prioridad')
        .if(body('tareas').exists())
        .isIn(['baja', 'media', 'alta', 'urgente'])
        .withMessage('Prioridad inválida'),
    body('documentos')
        .optional()
        .isArray()
        .withMessage('Documentos debe ser un array'),
    body('notas')
        .optional()
        .trim(),
    body('estado')
        .optional()
        .isIn(['activo', 'pausa', 'finalizado', 'archivado'])
        .withMessage('Estado inválido')
];

const updateCausaValidation = [
    body('nombre_caso')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Nombre del caso no puede estar vacío')
        .isLength({ max: 200 })
        .withMessage('Nombre del caso muy largo'),
    body('cliente')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Cliente no puede estar vacío')
        .isLength({ max: 150 })
        .withMessage('Nombre del cliente muy largo'),
    body('fecha_inicio')
        .optional()
        .isISO8601()
        .withMessage('Formato de fecha inválido'),
    body('fecha_termino')
        .optional({ nullable: true })
        .isISO8601()
        .withMessage('Formato de fecha inválido'),
    body('tareas')
        .optional()
        .isArray()
        .withMessage('Tareas debe ser un array'),
    body('documentos')
        .optional()
        .isArray()
        .withMessage('Documentos debe ser un array'),
    body('estado')
        .optional()
        .isIn(['activo', 'pausa', 'finalizado', 'archivado'])
        .withMessage('Estado inválido')
];

const tareasValidation = [
    body('tareas')
        .isArray()
        .withMessage('Tareas debe ser un array')
        .notEmpty()
        .withMessage('Tareas no puede estar vacío'),
    body('tareas.*.descripcion')
        .trim()
        .notEmpty()
        .withMessage('Descripción de tarea es requerida'),
    body('tareas.*.prioridad')
        .isIn(['baja', 'media', 'alta', 'urgente'])
        .withMessage('Prioridad inválida')
];

/**
 * @route   GET /api/causas
 * @desc    Listar todas las causas (con filtros, paginación)
 * @access  Private
 */
router.get(
    '/',
    authenticateToken,
    checkPermission('causas', 'read'),
    parsePagination,
    parseFilters,
    causasController.listarCausas
);

/**
 * @route   GET /api/causas/estadisticas
 * @desc    Obtener estadísticas de causas
 * @access  Private
 */
router.get(
    '/estadisticas',
    authenticateToken,
    checkPermission('causas', 'read'),
    causasController.obtenerEstadisticas
);

/**
 * @route   GET /api/causas/:id
 * @desc    Obtener una causa por ID
 * @access  Private
 */
router.get(
    '/:id',
    authenticateToken,
    checkPermission('causas', 'read'),
    causasController.obtenerCausa
);

/**
 * @route   POST /api/causas
 * @desc    Crear nueva causa
 * @access  Private
 */
router.post(
    '/',
    authenticateToken,
    checkPermission('causas', 'create'),
    sanitizeInput,
    causaValidation,
    validate,
    causasController.crearCausa
);

/**
 * @route   PUT /api/causas/:id
 * @desc    Actualizar causa
 * @access  Private
 */
router.put(
    '/:id',
    authenticateToken,
    checkPermission('causas', 'update'),
    sanitizeInput,
    updateCausaValidation,
    validate,
    causasController.actualizarCausa
);

/**
 * @route   PATCH /api/causas/:id/tareas
 * @desc    Actualizar solo las tareas de una causa
 * @access  Private
 */
router.patch(
    '/:id/tareas',
    authenticateToken,
    checkPermission('causas', 'update'),
    sanitizeInput,
    tareasValidation,
    validate,
    causasController.actualizarTareas
);

/**
 * @route   DELETE /api/causas/:id
 * @desc    Eliminar causa
 * @access  Private (Admin o Socio)
 */
router.delete(
    '/:id',
    authenticateToken,
    checkPermission('causas', 'delete'),
    causasController.eliminarCausa
);

module.exports = router;

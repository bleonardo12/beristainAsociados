const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validate, sanitizeInput } = require('../middleware/validation');

// Validaciones
const loginValidation = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password requerido')
];

const registerValidation = [
    body('nombre')
        .trim()
        .notEmpty()
        .withMessage('Nombre requerido')
        .isLength({ min: 2, max: 100 })
        .withMessage('Nombre debe tener entre 2 y 100 caracteres'),
    body('email')
        .trim()
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password debe tener al menos 6 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password debe contener al menos una mayúscula, una minúscula y un número'),
    body('rol')
        .optional()
        .isIn(['admin', 'socio', 'secretaria', 'viewer'])
        .withMessage('Rol inválido')
];

/**
 * @route   POST /api/auth/login
 * @desc    Login de usuario
 * @access  Public
 */
router.post(
    '/login',
    sanitizeInput,
    loginValidation,
    validate,
    authController.login
);

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario (solo admin)
 * @access  Private (Admin)
 */
router.post(
    '/register',
    authenticateToken,
    requireRole('admin'),
    sanitizeInput,
    registerValidation,
    validate,
    authController.register
);

/**
 * @route   GET /api/auth/verify
 * @desc    Verificar token y obtener usuario actual
 * @access  Private
 */
router.get(
    '/verify',
    authenticateToken,
    authController.verifyToken
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout (cliente debe eliminar el token)
 * @access  Private
 */
router.post(
    '/logout',
    authenticateToken,
    authController.logout
);

module.exports = router;

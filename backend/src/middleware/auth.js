const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { jwt: jwtConfig, permissions } = require('../config/auth');

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token de autenticación requerido'
            });
        }

        const decoded = jwt.verify(token, jwtConfig.secret);

        // Buscar usuario
        const user = await User.findByPk(decoded.userId);

        if (!user || !user.activo) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no válido o inactivo'
            });
        }

        // Adjuntar usuario a la request
        req.user = user;
        req.userId = user.id;
        req.userRole = user.rol;

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error al verificar token'
        });
    }
};

// Middleware para verificar permisos
const checkPermission = (resource, action) => {
    return (req, res, next) => {
        const userRole = req.userRole;
        const userPermissions = permissions[userRole] || [];

        // Admin tiene todos los permisos
        if (userPermissions.includes('*')) {
            return next();
        }

        // Verificar permiso específico: resource:action
        const requiredPermission = `${resource}:${action}`;
        const hasWildcard = userPermissions.includes(`${resource}:*`);
        const hasSpecific = userPermissions.includes(requiredPermission);

        if (hasWildcard || hasSpecific) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'No tienes permisos para realizar esta acción'
        });
    };
};

// Middleware para verificar rol
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.userRole) {
            return res.status(401).json({
                success: false,
                message: 'Autenticación requerida'
            });
        }

        if (allowedRoles.includes(req.userRole)) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'No tienes permisos suficientes'
        });
    };
};

// Middleware opcional de autenticación (no obliga pero adjunta user si existe token)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, jwtConfig.secret);
            const user = await User.findByPk(decoded.userId);

            if (user && user.activo) {
                req.user = user;
                req.userId = user.id;
                req.userRole = user.rol;
            }
        }

        next();
    } catch (error) {
        // Si hay error, simplemente continuar sin usuario
        next();
    }
};

module.exports = {
    authenticateToken,
    checkPermission,
    requireRole,
    optionalAuth
};

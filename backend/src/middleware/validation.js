const { validationResult } = require('express-validator');

// Middleware para validar resultados de express-validator
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errors.array().map(err => ({
                field: err.path || err.param,
                message: err.msg
            }))
        });
    }

    next();
};

// Middleware para sanitizar entrada
const sanitizeInput = (req, res, next) => {
    // Sanitizar query params
    if (req.query) {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = req.query[key].trim();
            }
        });
    }

    // Sanitizar body
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].trim();
            }
        });
    }

    next();
};

// Middleware para parsear paginación
const parsePagination = (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Limitar el máximo de resultados por página
    req.pagination = {
        page: page > 0 ? page : 1,
        limit: Math.min(limit, 100), // Máximo 100 por página
        offset: offset >= 0 ? offset : 0
    };

    next();
};

// Middleware para parsear filtros de búsqueda
const parseFilters = (req, res, next) => {
    req.filters = {};

    // Estado
    if (req.query.estado) {
        req.filters.estado = req.query.estado;
    }

    // Búsqueda por texto
    if (req.query.search) {
        req.filters.search = req.query.search.trim();
    }

    // Fecha desde
    if (req.query.fecha_desde) {
        req.filters.fecha_desde = req.query.fecha_desde;
    }

    // Fecha hasta
    if (req.query.fecha_hasta) {
        req.filters.fecha_hasta = req.query.fecha_hasta;
    }

    // Ordenamiento
    req.sorting = {
        field: req.query.sort_by || 'created_at',
        order: req.query.order === 'asc' ? 'ASC' : 'DESC'
    };

    next();
};

module.exports = {
    validate,
    sanitizeInput,
    parsePagination,
    parseFilters
};

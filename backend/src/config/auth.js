require('dotenv').config();

module.exports = {
    jwt: {
        secret: process.env.JWT_SECRET || 'default_secret_change_in_production',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        refreshExpiresIn: '30d'
    },
    bcrypt: {
        saltRounds: 10
    },
    session: {
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días en millisegundos
    },
    roles: {
        ADMIN: 'admin',
        SOCIO: 'socio',
        SECRETARIA: 'secretaria',
        VIEWER: 'viewer'
    },
    permissions: {
        admin: ['*'], // Todos los permisos
        socio: [
            'presupuestos:*',
            'causas:*',
            'backup:read',
            'export:*'
        ],
        secretaria: [
            'presupuestos:create',
            'presupuestos:read',
            'presupuestos:update',
            'causas:create',
            'causas:read',
            'causas:update',
            'export:read'
        ],
        viewer: [
            'presupuestos:read',
            'causas:read'
        ]
    }
};

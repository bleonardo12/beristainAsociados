const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { jwt: jwtConfig } = require('../config/auth');

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar usuario
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Verificar si está bloqueado
        if (user.isLocked()) {
            const minutosRestantes = Math.ceil((user.bloqueado_hasta - new Date()) / 60000);
            return res.status(403).json({
                success: false,
                message: `Cuenta bloqueada. Intenta de nuevo en ${minutosRestantes} minutos`
            });
        }

        // Verificar password
        const isValidPassword = await user.comparePassword(password);

        if (!isValidPassword) {
            await user.incrementLoginAttempts();
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Reset intentos fallidos
        await user.resetLoginAttempts();

        // Actualizar último acceso
        user.ultimo_acceso = new Date();
        await user.save();

        // Generar token
        const token = jwt.sign(
            { userId: user.id, rol: user.rol },
            jwtConfig.secret,
            { expiresIn: jwtConfig.expiresIn }
        );

        res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                token,
                user: user.toSafeJSON()
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};

// Registro (solo para admin)
exports.register = async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;

        // Verificar si el email ya existe
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }

        // Crear usuario
        const user = await User.create({
            nombre,
            email,
            password,
            rol: rol || 'viewer'
        });

        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            data: {
                user: user.toSafeJSON()
            }
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear usuario'
        });
    }
};

// Verificar token
exports.verifyToken = async (req, res) => {
    res.json({
        success: true,
        data: {
            user: req.user.toSafeJSON()
        }
    });
};

// Logout (cliente debe eliminar el token)
exports.logout = async (req, res) => {
    res.json({
        success: true,
        message: 'Logout exitoso'
    });
};

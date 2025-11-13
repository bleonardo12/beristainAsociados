const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');
const { roles } = require('../config/auth');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    rol: {
        type: DataTypes.ENUM('admin', 'socio', 'secretaria', 'viewer'),
        defaultValue: 'viewer',
        allowNull: false
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    ultimo_acceso: {
        type: DataTypes.DATE,
        allowNull: true
    },
    intentos_fallidos: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    bloqueado_hasta: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Hook para hashear password antes de crear
User.beforeCreate(async (user) => {
    if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
    }
});

// Hook para hashear password antes de actualizar
User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
    }
});

// Método para comparar passwords
User.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Método para incrementar intentos fallidos
User.prototype.incrementLoginAttempts = async function() {
    this.intentos_fallidos += 1;

    // Bloquear por 15 minutos después de 5 intentos fallidos
    if (this.intentos_fallidos >= 5) {
        this.bloqueado_hasta = new Date(Date.now() + 15 * 60 * 1000);
    }

    await this.save();
};

// Método para resetear intentos fallidos
User.prototype.resetLoginAttempts = async function() {
    this.intentos_fallidos = 0;
    this.bloqueado_hasta = null;
    await this.save();
};

// Método para verificar si está bloqueado
User.prototype.isLocked = function() {
    if (!this.bloqueado_hasta) return false;
    return this.bloqueado_hasta > new Date();
};

// Método para obtener JSON seguro (sin password)
User.prototype.toSafeJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    delete values.intentos_fallidos;
    delete values.bloqueado_hasta;
    return values;
};

module.exports = User;

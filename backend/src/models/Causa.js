const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Causa = sequelize.define('Causa', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    numero_expediente: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    tipo_causa: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Penal, Civil, Comercial, Tránsito, etc.'
    },
    caratula: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    cliente: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    estado: {
        type: DataTypes.ENUM('activo', 'pausa', 'finalizado', 'archivado'),
        defaultValue: 'activo'
    },
    juzgado: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    fecha_inicio: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    observaciones: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // Tareas (array JSON)
    tareas: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array de tareas: [{id, descripcion, prioridad, vencimiento, hora, notas, completada, fechaCreacion}]'
    },
    // Usuario que creó
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    // Fecha de última modificación
    modificado_por: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'causas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['numero_expediente']
        },
        {
            fields: ['cliente']
        },
        {
            fields: ['estado']
        },
        {
            fields: ['tipo_causa']
        },
        {
            fields: ['created_at']
        }
    ]
});

module.exports = Causa;

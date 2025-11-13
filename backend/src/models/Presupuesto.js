const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Presupuesto = sequelize.define('Presupuesto', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    numero: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true
    },
    fecha: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    // Datos del cliente
    cliente: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    dni: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    telefono: {
        type: DataTypes.STRING(30),
        allowNull: true
    },
    // Servicios (array JSON)
    servicios: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array de servicios: [{id, nombre, valorUMA, cantidadUMA, total}]'
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // Montos
    honorarios: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    gastos_admin: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    iva: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
        comment: 'Porcentaje de IVA'
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    anticipo: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    saldo: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    // Condiciones comerciales
    forma_pago: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    cuotas: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    vigencia: {
        type: DataTypes.INTEGER,
        defaultValue: 30,
        comment: 'Días de vigencia'
    },
    vencimiento: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    // Estado
    estado: {
        type: DataTypes.ENUM('pendiente', 'enviado', 'aprobado', 'rechazado'),
        defaultValue: 'pendiente'
    },
    // Observaciones
    notas: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    detalle_adicional: {
        type: DataTypes.TEXT,
        allowNull: true
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
    tableName: 'presupuestos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['numero']
        },
        {
            fields: ['cliente']
        },
        {
            fields: ['estado']
        },
        {
            fields: ['created_at']
        }
    ]
});

module.exports = Presupuesto;

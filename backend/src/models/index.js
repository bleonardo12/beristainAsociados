const { sequelize } = require('../config/database');
const User = require('./User');
const Presupuesto = require('./Presupuesto');
const Causa = require('./Causa');

// Definir relaciones
// Un usuario puede crear muchos presupuestos
User.hasMany(Presupuesto, {
    foreignKey: 'user_id',
    as: 'presupuestos'
});

Presupuesto.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'creador'
});

Presupuesto.belongsTo(User, {
    foreignKey: 'modificado_por',
    as: 'modificador'
});

// Un usuario puede crear muchas causas
User.hasMany(Causa, {
    foreignKey: 'user_id',
    as: 'causas'
});

Causa.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'creador'
});

Causa.belongsTo(User, {
    foreignKey: 'modificado_por',
    as: 'modificador'
});

// Función para sincronizar modelos con la base de datos
const syncDatabase = async (options = {}) => {
    try {
        await sequelize.sync(options);
        console.log('✅ Modelos sincronizados con la base de datos');
        return true;
    } catch (error) {
        console.error('❌ Error al sincronizar modelos:', error);
        return false;
    }
};

module.exports = {
    sequelize,
    User,
    Presupuesto,
    Causa,
    syncDatabase
};

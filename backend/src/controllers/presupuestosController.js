const { Presupuesto, User } = require('../models');
const { Op } = require('sequelize');

// Obtener todos los presupuestos (con filtros, paginación y búsqueda)
exports.listarPresupuestos = async (req, res) => {
    try {
        const { pagination, filters, sorting } = req;

        // Construir condiciones de búsqueda
        const where = {};

        // Filtro por estado
        if (filters.estado) {
            where.estado = filters.estado;
        }

        // Búsqueda por texto (nombre o empresa)
        if (filters.search) {
            where[Op.or] = [
                { nombre: { [Op.like]: `%${filters.search}%` } },
                { empresa: { [Op.like]: `%${filters.search}%` } }
            ];
        }

        // Filtro por rango de fechas
        if (filters.fecha_desde || filters.fecha_hasta) {
            where.fecha = {};
            if (filters.fecha_desde) {
                where.fecha[Op.gte] = filters.fecha_desde;
            }
            if (filters.fecha_hasta) {
                where.fecha[Op.lte] = filters.fecha_hasta;
            }
        }

        // Consulta con paginación
        const { count, rows } = await Presupuesto.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'creador',
                    attributes: ['id', 'nombre', 'email']
                },
                {
                    model: User,
                    as: 'modificador',
                    attributes: ['id', 'nombre', 'email']
                }
            ],
            limit: pagination.limit,
            offset: pagination.offset,
            order: [[sorting.field, sorting.order]]
        });

        res.json({
            success: true,
            data: {
                presupuestos: rows,
                pagination: {
                    total: count,
                    page: pagination.page,
                    limit: pagination.limit,
                    totalPages: Math.ceil(count / pagination.limit)
                }
            }
        });
    } catch (error) {
        console.error('Error al listar presupuestos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener presupuestos'
        });
    }
};

// Obtener un presupuesto por ID
exports.obtenerPresupuesto = async (req, res) => {
    try {
        const { id } = req.params;

        const presupuesto = await Presupuesto.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'creador',
                    attributes: ['id', 'nombre', 'email']
                },
                {
                    model: User,
                    as: 'modificador',
                    attributes: ['id', 'nombre', 'email']
                }
            ]
        });

        if (!presupuesto) {
            return res.status(404).json({
                success: false,
                message: 'Presupuesto no encontrado'
            });
        }

        res.json({
            success: true,
            data: { presupuesto }
        });
    } catch (error) {
        console.error('Error al obtener presupuesto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener presupuesto'
        });
    }
};

// Crear nuevo presupuesto
exports.crearPresupuesto = async (req, res) => {
    try {
        const {
            nombre,
            telefono,
            email,
            empresa,
            rut,
            fecha,
            servicios,
            honorarios,
            gastos_operacionales,
            iva,
            total,
            notas
        } = req.body;

        // Validar que servicios sea un array válido
        if (servicios && !Array.isArray(servicios)) {
            return res.status(400).json({
                success: false,
                message: 'Servicios debe ser un array'
            });
        }

        // Crear presupuesto
        const presupuesto = await Presupuesto.create({
            cliente: nombre,
            telefono,
            email: email || null,
            dni: rut || null,
            fecha,
            servicios: servicios || [],
            honorarios,
            gastos_admin: gastos_operacionales || 0,
            iva: iva || 0,
            total,
            notas: notas || '',
            estado: 'pendiente',
            user_id: req.userId,
            modificado_por: req.userId
        });

        // Cargar el presupuesto con las relaciones
        const presupuestoCompleto = await Presupuesto.findByPk(presupuesto.id, {
            include: [
                {
                    model: User,
                    as: 'creador',
                    attributes: ['id', 'nombre', 'email']
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Presupuesto creado exitosamente',
            data: { presupuesto: presupuestoCompleto }
        });
    } catch (error) {
        console.error('Error al crear presupuesto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear presupuesto'
        });
    }
};

// Actualizar presupuesto
exports.actualizarPresupuesto = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nombre,
            telefono,
            email,
            empresa,
            rut,
            fecha,
            servicios,
            honorarios,
            gastos_operacionales,
            iva,
            total,
            notas,
            estado
        } = req.body;

        // Buscar presupuesto
        const presupuesto = await Presupuesto.findByPk(id);

        if (!presupuesto) {
            return res.status(404).json({
                success: false,
                message: 'Presupuesto no encontrado'
            });
        }

        // Validar que servicios sea un array válido si se proporciona
        if (servicios !== undefined && !Array.isArray(servicios)) {
            return res.status(400).json({
                success: false,
                message: 'Servicios debe ser un array'
            });
        }

        // Actualizar campos
        await presupuesto.update({
            nombre: nombre !== undefined ? nombre : presupuesto.nombre,
            telefono: telefono !== undefined ? telefono : presupuesto.telefono,
            email: email !== undefined ? email : presupuesto.email,
            empresa: empresa !== undefined ? empresa : presupuesto.empresa,
            rut: rut !== undefined ? rut : presupuesto.rut,
            fecha: fecha !== undefined ? fecha : presupuesto.fecha,
            servicios: servicios !== undefined ? servicios : presupuesto.servicios,
            honorarios: honorarios !== undefined ? honorarios : presupuesto.honorarios,
            gastos_operacionales: gastos_operacionales !== undefined ? gastos_operacionales : presupuesto.gastos_operacionales,
            iva: iva !== undefined ? iva : presupuesto.iva,
            total: total !== undefined ? total : presupuesto.total,
            notas: notas !== undefined ? notas : presupuesto.notas,
            estado: estado !== undefined ? estado : presupuesto.estado,
            modificado_por: req.userId
        });

        // Cargar con relaciones
        const presupuestoActualizado = await Presupuesto.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'creador',
                    attributes: ['id', 'nombre', 'email']
                },
                {
                    model: User,
                    as: 'modificador',
                    attributes: ['id', 'nombre', 'email']
                }
            ]
        });

        res.json({
            success: true,
            message: 'Presupuesto actualizado exitosamente',
            data: { presupuesto: presupuestoActualizado }
        });
    } catch (error) {
        console.error('Error al actualizar presupuesto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar presupuesto'
        });
    }
};

// Eliminar presupuesto
exports.eliminarPresupuesto = async (req, res) => {
    try {
        const { id } = req.params;

        const presupuesto = await Presupuesto.findByPk(id);

        if (!presupuesto) {
            return res.status(404).json({
                success: false,
                message: 'Presupuesto no encontrado'
            });
        }

        await presupuesto.destroy();

        res.json({
            success: true,
            message: 'Presupuesto eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar presupuesto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar presupuesto'
        });
    }
};

// Obtener estadísticas de presupuestos
exports.obtenerEstadisticas = async (req, res) => {
    try {
        const userId = req.query.user_id || req.userId;

        const where = {};
        if (req.userRole !== 'admin') {
            where.user_id = userId;
        }

        // Contar por estado
        const [pendientes, enviados, aprobados, rechazados] = await Promise.all([
            Presupuesto.count({ where: { ...where, estado: 'pendiente' } }),
            Presupuesto.count({ where: { ...where, estado: 'enviado' } }),
            Presupuesto.count({ where: { ...where, estado: 'aprobado' } }),
            Presupuesto.count({ where: { ...where, estado: 'rechazado' } })
        ]);

        // Total de presupuestos
        const total = pendientes + enviados + aprobados + rechazados;

        // Suma de montos por estado
        const montosAprobados = await Presupuesto.sum('total', {
            where: { ...where, estado: 'aprobado' }
        }) || 0;

        const montosPendientes = await Presupuesto.sum('total', {
            where: { ...where, estado: 'pendiente' }
        }) || 0;

        res.json({
            success: true,
            data: {
                total,
                pendientes,
                enviados,
                aprobados,
                rechazados,
                montos: {
                    aprobados: montosAprobados,
                    pendientes: montosPendientes
                }
            }
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas'
        });
    }
};

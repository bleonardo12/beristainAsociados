const { Causa, User } = require('../models');
const { Op } = require('sequelize');

// Obtener todas las causas (con filtros, paginación y búsqueda)
exports.listarCausas = async (req, res) => {
    try {
        const { pagination, filters, sorting } = req;

        // Construir condiciones de búsqueda
        const where = {};

        // Filtro por estado
        if (filters.estado) {
            where.estado = filters.estado;
        }

        // Búsqueda por texto (nombre_caso, cliente, numero_causa, tribunal)
        if (filters.search) {
            where[Op.or] = [
                { nombre_caso: { [Op.like]: `%${filters.search}%` } },
                { cliente: { [Op.like]: `%${filters.search}%` } },
                { numero_causa: { [Op.like]: `%${filters.search}%` } },
                { tribunal: { [Op.like]: `%${filters.search}%` } }
            ];
        }

        // Filtro por rango de fechas
        if (filters.fecha_desde || filters.fecha_hasta) {
            where.fecha_inicio = {};
            if (filters.fecha_desde) {
                where.fecha_inicio[Op.gte] = filters.fecha_desde;
            }
            if (filters.fecha_hasta) {
                where.fecha_inicio[Op.lte] = filters.fecha_hasta;
            }
        }

        // Consulta con paginación
        const { count, rows } = await Causa.findAndCountAll({
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
                causas: rows,
                pagination: {
                    total: count,
                    page: pagination.page,
                    limit: pagination.limit,
                    totalPages: Math.ceil(count / pagination.limit)
                }
            }
        });
    } catch (error) {
        console.error('Error al listar causas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener causas'
        });
    }
};

// Obtener una causa por ID
exports.obtenerCausa = async (req, res) => {
    try {
        const { id } = req.params;

        const causa = await Causa.findByPk(id, {
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

        if (!causa) {
            return res.status(404).json({
                success: false,
                message: 'Causa no encontrada'
            });
        }

        res.json({
            success: true,
            data: { causa }
        });
    } catch (error) {
        console.error('Error al obtener causa:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener causa'
        });
    }
};

// Crear nueva causa
exports.crearCausa = async (req, res) => {
    try {
        const {
            nombre_caso,
            cliente,
            numero_causa,
            tribunal,
            fecha_inicio,
            fecha_termino,
            materia,
            descripcion,
            tareas,
            documentos,
            notas
        } = req.body;

        // Validar que tareas sea un array válido si se proporciona
        if (tareas && !Array.isArray(tareas)) {
            return res.status(400).json({
                success: false,
                message: 'Tareas debe ser un array'
            });
        }

        // Validar que documentos sea un array válido si se proporciona
        if (documentos && !Array.isArray(documentos)) {
            return res.status(400).json({
                success: false,
                message: 'Documentos debe ser un array'
            });
        }

        // Crear causa
        const causa = await Causa.create({
            nombre_caso,
            cliente,
            numero_causa: numero_causa || null,
            tribunal: tribunal || null,
            fecha_inicio,
            fecha_termino: fecha_termino || null,
            materia: materia || '',
            descripcion: descripcion || '',
            tareas: tareas || [],
            documentos: documentos || [],
            notas: notas || '',
            estado: 'activo',
            user_id: req.userId,
            modificado_por: req.userId
        });

        // Cargar la causa con las relaciones
        const causaCompleta = await Causa.findByPk(causa.id, {
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
            message: 'Causa creada exitosamente',
            data: { causa: causaCompleta }
        });
    } catch (error) {
        console.error('Error al crear causa:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear causa'
        });
    }
};

// Actualizar causa
exports.actualizarCausa = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nombre_caso,
            cliente,
            numero_causa,
            tribunal,
            fecha_inicio,
            fecha_termino,
            materia,
            descripcion,
            tareas,
            documentos,
            notas,
            estado
        } = req.body;

        // Buscar causa
        const causa = await Causa.findByPk(id);

        if (!causa) {
            return res.status(404).json({
                success: false,
                message: 'Causa no encontrada'
            });
        }

        // Validar que tareas sea un array válido si se proporciona
        if (tareas !== undefined && !Array.isArray(tareas)) {
            return res.status(400).json({
                success: false,
                message: 'Tareas debe ser un array'
            });
        }

        // Validar que documentos sea un array válido si se proporciona
        if (documentos !== undefined && !Array.isArray(documentos)) {
            return res.status(400).json({
                success: false,
                message: 'Documentos debe ser un array'
            });
        }

        // Actualizar campos
        await causa.update({
            nombre_caso: nombre_caso !== undefined ? nombre_caso : causa.nombre_caso,
            cliente: cliente !== undefined ? cliente : causa.cliente,
            numero_causa: numero_causa !== undefined ? numero_causa : causa.numero_causa,
            tribunal: tribunal !== undefined ? tribunal : causa.tribunal,
            fecha_inicio: fecha_inicio !== undefined ? fecha_inicio : causa.fecha_inicio,
            fecha_termino: fecha_termino !== undefined ? fecha_termino : causa.fecha_termino,
            materia: materia !== undefined ? materia : causa.materia,
            descripcion: descripcion !== undefined ? descripcion : causa.descripcion,
            tareas: tareas !== undefined ? tareas : causa.tareas,
            documentos: documentos !== undefined ? documentos : causa.documentos,
            notas: notas !== undefined ? notas : causa.notas,
            estado: estado !== undefined ? estado : causa.estado,
            modificado_por: req.userId
        });

        // Cargar con relaciones
        const causaActualizada = await Causa.findByPk(id, {
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
            message: 'Causa actualizada exitosamente',
            data: { causa: causaActualizada }
        });
    } catch (error) {
        console.error('Error al actualizar causa:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar causa'
        });
    }
};

// Eliminar causa
exports.eliminarCausa = async (req, res) => {
    try {
        const { id } = req.params;

        const causa = await Causa.findByPk(id);

        if (!causa) {
            return res.status(404).json({
                success: false,
                message: 'Causa no encontrada'
            });
        }

        await causa.destroy();

        res.json({
            success: true,
            message: 'Causa eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar causa:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar causa'
        });
    }
};

// Obtener estadísticas de causas
exports.obtenerEstadisticas = async (req, res) => {
    try {
        const userId = req.query.user_id || req.userId;

        const where = {};
        if (req.userRole !== 'admin') {
            where.user_id = userId;
        }

        // Contar por estado
        const [activas, pausadas, finalizadas, archivadas] = await Promise.all([
            Causa.count({ where: { ...where, estado: 'activo' } }),
            Causa.count({ where: { ...where, estado: 'pausa' } }),
            Causa.count({ where: { ...where, estado: 'finalizado' } }),
            Causa.count({ where: { ...where, estado: 'archivado' } })
        ]);

        // Total de causas
        const total = activas + pausadas + finalizadas + archivadas;

        // Contar causas con tareas pendientes
        const causasConTareasPendientes = await Causa.count({
            where: {
                ...where,
                estado: { [Op.in]: ['activo', 'pausa'] }
            }
        });

        res.json({
            success: true,
            data: {
                total,
                activas,
                pausadas,
                finalizadas,
                archivadas,
                causasConTareasPendientes
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

// Actualizar tareas de una causa
exports.actualizarTareas = async (req, res) => {
    try {
        const { id } = req.params;
        const { tareas } = req.body;

        if (!Array.isArray(tareas)) {
            return res.status(400).json({
                success: false,
                message: 'Tareas debe ser un array'
            });
        }

        const causa = await Causa.findByPk(id);

        if (!causa) {
            return res.status(404).json({
                success: false,
                message: 'Causa no encontrada'
            });
        }

        await causa.update({
            tareas,
            modificado_por: req.userId
        });

        const causaActualizada = await Causa.findByPk(id, {
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
            message: 'Tareas actualizadas exitosamente',
            data: { causa: causaActualizada }
        });
    } catch (error) {
        console.error('Error al actualizar tareas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar tareas'
        });
    }
};

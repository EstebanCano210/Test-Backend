import Job from './job.model.js';

// Crear empleo
export const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      location,
      modality,
      type,
      category,
      salary             
    } = req.body;

    if (!req.user.company) {
      return res.status(400).json({ msg: 'No estás asociado a una empresa' });
    }

    const nuevo = new Job({
      title,
      description,
      requirements,
      location,
      modality,
      type,
      category,
      salary,           
      company: req.user.company,
      createdBy: req.user.id
    });

    await nuevo.save();
    res.status(201).json(nuevo);
  } catch (error) {
    console.error('❌ Error al crear el empleo:', error);
    res.status(500).json({ msg: error.message || 'Error al crear el empleo' });
  }
};

// Obtener todos los empleos activos (con paginación y filtros)
export const getJobs = async (req, res) => {
  try {
    const {
      title = '',
      location = '',
      modality,
      type,
      category,
      limit = 10,
      page = 1
    } = req.query;

    const query = {
      estado: true,
      title:    { $regex: title,    $options: 'i' },
      location: { $regex: location, $options: 'i' }
    };
    if (modality) query.modality = modality;
    if (type)     query.type     = type;
    if (category) query.category = category;

    const skip = (Number(page) - 1) * Number(limit);
    const [ total, empleos ] = await Promise.all([
      Job.countDocuments(query),
      Job.find(query)
        .skip(skip)
        .limit(Number(limit))
        .populate('company', 'name logoUrl')
    ]);

    res.json({
      total,
      page:   Number(page),
      limit:  Number(limit),
      results: empleos
    });
  } catch (error) {
    console.error('❌ Error al obtener empleos filtrados:', error);
    res.status(500).json({ msg: 'Error al obtener empleos filtrados y paginados' });
  }
};

export const getMyCompanyJobs = async (req, res) => {
  try {
    const companyId = req.user.company;
    if (!companyId) {
      return res.status(400).json({ msg: 'No estás asociado a ninguna empresa' });
    }

    // Paginación y filtros opcionales
    const {
      title = '',
      location = '',
      limit  = 10,
      page   = 1
    } = req.query;

    const query = {
      estado:  true,
      company: companyId,
      title:    { $regex: title,    $options: 'i' },
      location: { $regex: location, $options: 'i' },
    };

    const skip = (Number(page) - 1) * Number(limit);
    const [ total, empleos ] = await Promise.all([
      Job.countDocuments(query),
      Job.find(query)
         .skip(skip)
         .limit(Number(limit))
         // Populamos datos de la empresa
         .populate('company', 'name logoUrl address description')
         // Populamos quién creó el empleo
         .populate('createdBy', 'name surname email')
         .sort({ createdAt: -1 }) // opcional: ordenar del más nuevo al más antiguo
    ]);

    res.json({
      total,
      page:    Number(page),
      limit:   Number(limit),
      results: empleos.map(job => ({
        id:           job._id,
        title:        job.title,
        description:  job.description,
        requirements: job.requirements,
        location:     job.location,
        modality:     job.modality,
        type:         job.type,
        category:     job.category,
        salary:       job.salary,
        company:      job.company,     // { name, logoUrl, address, description }
        createdBy:    job.createdBy,   // { name, surname, email }
        createdAt:    job.createdAt,
        updatedAt:    job.updatedAt
      }))
    });
  } catch (error) {
    console.error('❌ Error al obtener mis empleos:', error);
    res.status(500).json({ msg: 'Error al obtener los empleos de la empresa' });
  }
};

// Obtener empleo por ID
export const getJobById = async (req, res) => {
  try {
    const empleo = await Job
      .findById(req.params.id)
      .populate('company', 'name logoUrl');

    if (!empleo || !empleo.estado) {
      return res.status(404).json({ msg: 'Empleo no encontrado' });
    }
    res.json(empleo);
  } catch (error) {
    console.error('❌ Error al buscar empleo:', error);
    res.status(500).json({ msg: 'Error al buscar empleo' });
  }
};

// Actualizar empleo (solo creador)
export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const empleo = await Job.findById(id);
    if (!empleo || !empleo.estado) {
      return res.status(404).json({ msg: 'Empleo no encontrado' });
    }
    if (empleo.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'No tienes permiso para editar este empleo' });
    }

    const data = { ...req.body };
    const updated = await Job.findByIdAndUpdate(id, data, { new: true });
    res.json(updated);
  } catch (error) {
    console.error('❌ Error al actualizar empleo:', error);
    res.status(500).json({ msg: 'Error al actualizar empleo' });
  }
};

// Eliminar empleo (soft delete, solo creador)
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const empleo = await Job.findById(id);
    if (!empleo || !empleo.estado) {
      return res.status(404).json({ msg: 'Empleo no encontrado' });
    }
    if (empleo.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'No tienes permiso para eliminar este empleo' });
    }

    empleo.estado = false;
    await empleo.save();
    res.json({ msg: 'Empleo eliminado', empleo });
  } catch (error) {
    console.error('❌ Error al eliminar empleo:', error);
    res.status(500).json({ msg: 'Error al eliminar empleo' });
  }
};

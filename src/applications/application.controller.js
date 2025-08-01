import { enviarNotificacionPostulacion } from '../services/email.service.js';
import { enviarNotificacionEstado } from '../services/email.service.js';
import { notifyUser } from '../helpers/notification.helper.js';
import Job from '../jobs/job.model.js';
import User from '../users/user.model.js';
import Application from './application.model.js';

// Crear postulación
export const applyToJob = async (req, res) => {
  try {
    const { job, message } = req.body;
    const userId = req.user.id;

    const yaExiste = await Application.findOne({ job, user: userId });
    if (yaExiste) {
      return res.status(400).json({ msg: 'Ya te has postulado a este empleo' });
    }

    const postulante = await User.findById(userId);
    const cvUrl = postulante.cvUrl || '';

    const nueva = new Application({ job, user: userId, message, cvUrl });
    await nueva.save();

    const jobInfo = await Job.findById(job).populate('createdBy', 'email name');
    if (jobInfo?.createdBy?.email) {
      await enviarNotificacionPostulacion(
        jobInfo.createdBy.email,
        jobInfo.title,
        `${postulante.name} ${postulante.surname}`,
        postulante.email
      );
    }

    await notifyUser({
      userId: jobInfo.createdBy._id,
      type:    'postulacion',
      content: `${postulante.name} ${postulante.surname} aplicó a tu oferta "${jobInfo.title}"`,
      link:    `/applications/job/${job}`
    });

    res.status(201).json(nueva);
  } catch (error) {
    console.error('❌ Error al postularse:', error);
    res.status(500).json({ msg: 'Error al postularse al empleo' });
  }
};

// Obtener postulaciones de un usuario
export const getApplicationsByUser = async (req, res) => {
  try {
    const uid = req.user.id;

    const apps = await Application
      .find({ user: uid })
      .populate({
        path: 'job',
        select: 'title createdAt',
        populate: { path: 'company', select: 'name' }
      })
      .sort({ createdAt: -1 });

    res.json(apps);
  } catch (error) {
    console.error('❌ Error al obtener postulaciones del usuario:', error);
    res.status(500).json({ msg: 'Error al obtener postulaciones del usuario' });
  }
};
// Obtener postulaciones de un empleo
export const getApplicationsByJob = async (req, res) => {
  try {
    const apps = await Application.find({ job: req.params.jobId })
      .populate('user', 'name surname email profilePicture')
      .sort({ createdAt: -1 });

    res.json(apps);
  } catch (error) {
    console.error('❌ Error al obtener candidatos:', error);
    res.status(500).json({ msg: 'Error al obtener candidatos' });
  }
};

export const getCompanyApplications = async (req, res) => {
  try {
    const companyId = req.user.company;
    if (!companyId) {
      return res.status(400).json({ msg: 'No estás asociado a una empresa' });
    }

    // Buscamos todas las aplicaciones cuyo job pertenece a esta empresa
    const apps = await Application.find()
      .populate({
        path: 'job',
        match: { company: companyId, estado: true },
        select: 'title'
      })
      .populate('user', 'name surname email profilePicture')
      .sort({ createdAt: -1 });

    // Filtramos las que realmente tengan job (las de otras empresas vienen con job=null)
    const filtered = apps.filter(a => a.job);

    res.json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al obtener solicitudes de la empresa' });
  }
};

// Cambiar estado de una postulación
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id }     = req.params;
    const { estado } = req.body;
    const userId     = req.user.id;

    if (!['pendiente', 'aceptado', 'rechazado'].includes(estado)) {
      return res.status(400).json({ msg: 'Estado inválido' });
    }

    const application = await Application.findById(id)
      .populate('job', 'title createdBy')
      .populate('user', 'name email');
    if (!application) {
      return res.status(404).json({ msg: 'Postulación no encontrada' });
    }
    if (application.job.createdBy.toString() !== userId) {
      return res.status(403).json({ msg: 'No tienes permiso para cambiar el estado de esta postulación' });
    }

    application.estado = estado;
    await application.save();

    await notifyUser({
      userId:  application.user._id,
      type:    'estado',
      content: `Tu postulación para "${application.job.title}" ha sido ${estado}`,
      link:    `/applications/${id}/estado`
    });

    await enviarNotificacionEstado(
      application.user.email,
      application.job.title,
      estado
    );

    const updated = await Application.findById(id)
      .populate('user', 'name email')
      .populate('job', 'title');

    res.json({
      msg:        `Estado actualizado a "${estado}"`,
      aplicacion: updated
    });
  } catch (error) {
    console.error('❌ Error al actualizar el estado de la postulación:', error);
    res.status(500).json({ msg: 'Error al actualizar el estado de la postulación' });
  }
};

export const cancelarPostulacion = async (req, res) => {
  try {
    const { id }     = req.params;
    const userId     = req.user.id;

    const application = await Application.findById(id)
      .populate('job', 'title createdBy')
      .populate('user', 'name surname');
    if (!application) {
      return res.status(404).json({ msg: 'Postulación no encontrada' });
    }

    if (application.user._id.toString() !== userId) {
      return res.status(403).json({ msg: 'No tienes permiso para cancelar esta postulación' });
    }

    application.estado = 'cancelada';
    await application.save();

    await notifyUser({
      userId: application.job.createdBy,
      type: 'estado',
      content: `${application.user.name} canceló su postulación para "${application.job.title}"`,
      link: `/applications/${id}`
    });

    res.json({ msg: 'Postulación cancelada con éxito', application });
  } catch (error) {
    console.error('❌ Error al cancelar la postulación:', error);
    res.status(500).json({ msg: 'Error al cancelar la postulación' });
  }
};

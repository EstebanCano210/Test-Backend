import Notification from './notification.model.js';

// Crear notificación (uso interno, no es endpoint)
export const createNotification = async ({ to, type, content, link }) => {
  try {
    const nueva = new Notification({ to, type, content, link });
    await nueva.save();
  } catch (error) {
    console.error('❌ Error al crear notificación:', error);
  }
};

// Obtener notificaciones de un usuario
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificaciones = await Notification
      .find({ to: userId })
      .sort({ createdAt: -1 });
    res.json(notificaciones);
  } catch (error) {
    console.error('❌ Error al obtener notificaciones:', error);
    res.status(500).json({ msg: 'Error al obtener notificaciones' });
  }
};

// Marcar todas las notificaciones del usuario como leídas
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.updateMany(
      { to: userId, read: false },
      { read: true }
    );
    res.json({ msg: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    console.error('❌ Error al actualizar notificaciones:', error);
    res.status(500).json({ msg: 'Error al actualizar notificaciones' });
  }
};

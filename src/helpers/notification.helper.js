import Notification from '../notifications/notification.model.js';

/**
 * Crea una notificación para un usuario dado.
 *
 * @param {Object} params
 * @param {string} params.userId 
 * @param {'mensaje'|'postulacion'|'estado'} params.type 
 * @param {string} params.content 
 * @param {string} [params.link] 
 */
export const notifyUser = async ({ userId, type, content, link = null }) => {
  try {
    const notif = new Notification({
      to: userId,
      type,
      content,
      link
    });
    await notif.save();
  } catch (error) {
    console.error('❌ Error al crear notificación:', error);
  }
};

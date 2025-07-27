import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Envía un email notificando una nueva postulación al empleador.
 * @param {string} to                – Correo del empleador.
 * @param {string} jobTitle          – Título del empleo.
 * @param {string} postulanteNombre – Nombre completo del postulante.
 * @param {string} postulanteCorreo – Correo del postulante.
 */
export const enviarNotificacionPostulacion = async (
  to,
  jobTitle,
  postulanteNombre,
  postulanteCorreo
) => {
  try {
    const mailOptions = {
      from: `"EmpleaYA - Notificación" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Nueva postulación recibida',
      html: `
        <p><strong>${postulanteNombre}</strong>
        (<a href="mailto:${postulanteCorreo}">${postulanteCorreo}</a>)
        se ha postulado al empleo <strong>${jobTitle}</strong>.</p>
        <p>Entra a la plataforma para revisar su postulación.</p>
      `
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('❌ Error al enviar correo de postulación:', error);
  }
};

/**
 * Envía un email notificando un nuevo mensaje en el chat.
 * @param {string} to       – Correo del receptor.
 * @param {string} remitente – Nombre completo del remitente.
 * @param {string} mensaje   – Contenido del mensaje.
 */
export const enviarNotificacionMensaje = async (to, remitente, mensaje) => {
  try {
    const mailOptions = {
      from: `"EmpleaYA Chat" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Tienes un nuevo mensaje en EmpleaYA',
      html: `
        <p><strong>${remitente}</strong> te ha enviado un nuevo mensaje:</p>
        <blockquote>${mensaje}</blockquote>
        <p>Inicia sesión en la plataforma para responder.</p>
      `
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('❌ Error al enviar correo de mensaje:', error);
  }
};

/**
 * Envía un email notificando al postulante el cambio de estado de su postulación.
 * El contenido varía si el estado es "rechazado".
 * @param {string} to        – Correo del postulante.
 * @param {string} jobTitle  – Título del empleo.
 * @param {string} newStatus – Nuevo estado: pendiente | aceptado | rechazado.
 */
export const enviarNotificacionEstado = async (to, jobTitle, newStatus) => {
  try {
    let subject = `Tu postulación ha sido ${newStatus}`;
    let htmlBody;

    if (newStatus === 'rechazado') {
      htmlBody = `
        <p>Hola,</p>
        <p>Lamentamos informarte que tu postulación para la oferta 
        <strong>"${jobTitle}"</strong> ha sido <strong>rechazada</strong>.</p>
        <p>Te animamos a seguir explorando otras oportunidades en nuestra plataforma.</p>
      `;
    } else if (newStatus === 'aceptado') {
      htmlBody = `
        <p>¡Felicidades!</p>
        <p>Tu postulación para la oferta <strong>"${jobTitle}"</strong> ha sido <strong>aceptada</strong>.</p>
        <p>Pronto recibirás más información de parte del empleador.</p>
        <p>Gracias por usar Empleaya para buscar oportunidades laborales.</p>
      `;
    } else {
      // "pendiente"
      htmlBody = `
        <p>Hola,</p>
        <p>Tu postulación para la oferta <strong>"${jobTitle}"</strong> continúa en estado <strong>pendiente</strong>.</p>
        <p>Te notificaremos cuando haya una actualización.</p>
      `;
    }

    const mailOptions = {
      from: `"EmpleaYA - Estado" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlBody
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('❌ Error al enviar correo de estado:', error);
  }
};
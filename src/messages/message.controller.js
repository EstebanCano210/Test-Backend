import mongoose from 'mongoose';
import Message from './message.model.js';
import User from '../users/user.model.js';
import { notifyUser } from '../helpers/notification.helper.js';

// Enviar mensaje con notificación interna
export const sendMessage = async (req, res) => {
  try {
    const { to, message } = req.body;
    const from = req.user.id;

    if (to === from) {
      return res.status(400).json({ msg: 'No puedes enviarte mensajes a ti mismo' });
    }

    const nuevoMensaje = new Message({ from, to, message });
    await nuevoMensaje.save();

    const io = req.app.get('socketio');
    io.to(to).emit('nuevo-mensaje', {
      from,
      message,
      timestamp: nuevoMensaje.createdAt
    });

    const sender = await User.findById(from).select('name surname');
    const senderName = `${sender.name} ${sender.surname}`;
    await notifyUser({
      userId: to,
      type: 'mensaje',
      content: `${senderName} te envió un mensaje: "${message}"`,
      link: `/messages/convo/${from}`
    });

    res.status(201).json(nuevoMensaje);
  } catch (error) {
    console.error('❌ Error al enviar mensaje:', error);
    res.status(500).json({ msg: 'Error al enviar el mensaje' });
  }
};

// Obtener conversación privada entre dos usuarios
export const getConversation = async (req, res) => {
  try {
    const userId    = req.user.id;
    const contactId = req.params.id;

    const mensajes = await Message.find({
      $or: [
        { from: userId,   to: contactId },
        { from: contactId, to: userId }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('from', 'name profilePicture')
    .populate('to',   'name profilePicture');

    res.json(mensajes);
  } catch (error) {
    console.error('❌ Error al obtener la conversación:', error);
    res.status(500).json({ msg: 'Error al obtener la conversación' });
  }
};

// Resumen de conversaciones (inbox)
export const getConversationsSummary = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const conversaciones = await Message.aggregate([
      { $match: { $or: [{ from: userId }, { to: userId }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$from', userId] },
              '$to',
              '$from'
            ]
          },
          lastMessage: { $first: '$message' },
          read:        { $first: '$read' },
          date:        { $first: '$createdAt' }
        }
      },
      { $sort: { date: -1 } }
    ]);

    const users = await User.find({
      _id: { $in: conversaciones.map(c => c._id) }
    }).select('name surname profilePicture');

    const resumen = conversaciones.map(c => {
      const u = users.find(u => u._id.toString() === c._id.toString());
      return {
        contactId:      c._id,
        name:           `${u?.name ?? ''} ${u?.surname ?? ''}`,
        profilePicture: u?.profilePicture ?? '',
        lastMessage:    c.lastMessage,
        read:           c.read,
        date:           c.date
      };
    });

    res.json(resumen);
  } catch (error) {
    console.error('❌ Error al obtener conversaciones:', error);
    res.status(500).json({ msg: 'Error al obtener conversaciones' });
  }
};

// Marcar mensajes de un contacto como leídos
export const markAsRead = async (req, res) => {
  try {
    const userId    = req.user.id;
    const contactId = req.params.id;

    await Message.updateMany(
      { from: contactId, to: userId, read: false },
      { $set: { read: true } }
    );

    res.json({ msg: 'Mensajes marcados como leídos' });
  } catch (error) {
    console.error('❌ Error al actualizar mensajes:', error);
    res.status(500).json({ msg: 'Error al actualizar mensajes' });
  }
};

// Contar mensajes no leídos
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalNoLeidos = await Message.countDocuments({
      to: userId,
      read: false
    });

    res.json({ totalNoLeidos });
  } catch (error) {
    console.error('❌ Error al contar mensajes no leídos:', error);
    res.status(500).json({ msg: 'Error al contar mensajes no leídos' });
  }
};

// Editar mensaje (solo autor)
export const editMessage = async (req, res) => {
  try {
    const { id }       = req.params;
    const { message }  = req.body;
    const userId       = req.user.id;

    const msg = await Message.findById(id);
    if (!msg) {
      return res.status(404).json({ msg: 'Mensaje no encontrado' });
    }
    if (msg.from.toString() !== userId) {
      return res.status(403).json({ msg: 'No puedes editar mensajes de otros usuarios' });
    }

    msg.message = message;
    await msg.save();
    res.json({ msg: 'Mensaje actualizado', message: msg });
  } catch (error) {
    console.error('❌ Error al editar mensaje:', error);
    res.status(500).json({ msg: 'Error al editar el mensaje' });
  }
};

// Eliminar mensaje (solo autor)
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const msg = await Message.findById(id);
    if (!msg) {
      return res.status(404).json({ msg: 'Mensaje no encontrado' });
    }
    if (msg.from.toString() !== userId) {
      return res.status(403).json({ msg: 'No puedes eliminar mensajes de otros usuarios' });
    }

    await msg.deleteOne();
    res.json({ msg: 'Mensaje eliminado' });
  } catch (error) {
    console.error('❌ Error al eliminar mensaje:', error);
    res.status(500).json({ msg: 'Error al eliminar el mensaje' });
  }
};

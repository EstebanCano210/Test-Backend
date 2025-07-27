import { Router } from 'express';
import {
  sendMessage,
  getConversation,
  markAsRead,
  getConversationsSummary,
  getUnreadCount,
  editMessage,
  deleteMessage
} from './message.controller.js';

import { validarJWT } from '../middlewares/validar-jwt.js';

const router = Router();

router.post('/', validarJWT, sendMessage);
router.get('/convo/:id', validarJWT, getConversation);
router.get('/inbox', validarJWT, getConversationsSummary);
router.get('/notificaciones/unread', validarJWT, getUnreadCount);
router.put('/read/:id', validarJWT, markAsRead);
router.put('/:id', validarJWT, editMessage);
router.delete('/:id', validarJWT, deleteMessage);

export default router;

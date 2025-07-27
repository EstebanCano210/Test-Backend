import { Router } from 'express';
import {
  getNotifications,
  markAllAsRead
} from './notification.controller.js';
import { validarJWT } from '../middlewares/validar-jwt.js';

const router = Router();

router.get('/', validarJWT, getNotifications);

router.put('/read', validarJWT, markAllAsRead);

export default router;

import { Router } from 'express';
import {
  applyToJob,
  getApplicationsByUser,
  getApplicationsByJob,
  updateApplicationStatus,
  cancelarPostulacion,
  getCompanyApplications
} from './application.controller.js';

import { validarJWT } from '../middlewares/validar-jwt.js';

const router = Router();

router.post('/', validarJWT, applyToJob);
router.get('/user/', validarJWT, getApplicationsByUser);
router.get('/company', validarJWT, getCompanyApplications);
router.get('/job/:jobId', validarJWT, getApplicationsByJob);
router.put('/:id/estado', validarJWT, updateApplicationStatus);
router.put('/:id/cancel', validarJWT, cancelarPostulacion);


export default router;

import { Router } from 'express';
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob
} from './job.controller.js';

import { check } from 'express-validator';
import { validarCampos } from '../middlewares/validar-campos.js';
import { validarJWT } from '../middlewares/validar-jwt.js';

const router = Router();

router.get('/', getJobs);
router.get('/:id', getJobById);
router.post(
  '/',
  [
    validarJWT,
    check('title', 'El título es obligatorio').not().isEmpty(),
    check('description', 'La descripción es obligatoria').not().isEmpty(),
    validarCampos
  ],
  createJob
);
router.put('/:id', validarJWT, updateJob);
router.delete('/:id', validarJWT, deleteJob);

export default router;

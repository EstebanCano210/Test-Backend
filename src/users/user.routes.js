import { Router } from 'express';
import { check } from 'express-validator';

import {
  getUserById,
  updateUser,
  deleteUser,
  uploadCv,
  updateProfilePicture,
  cambiarPassword 
} from './user.controller.js';

import { subirArchivo } from '../middlewares/file.middleware.js';
import { validarJWT } from '../middlewares/validar-jwt.js';
import { validarCampos } from '../middlewares/validar-campos.js';

const router = Router();

router.get('/:id', validarJWT, getUserById);
router.put(
  '/:id',
  [
    validarJWT,
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    check('email', 'Debe ser un correo válido').isEmail(),
    check('phone', 'El teléfono debe tener 8 dígitos').isLength({ min: 8, max: 8 }),
    validarCampos
  ],
  updateUser
);
router.delete('/:id', validarJWT, deleteUser);
router.put('/:id/upload-cv', validarJWT, subirArchivo.single('cv'), uploadCv);
router.put('/:id/upload-photo', validarJWT, subirArchivo.single('imagen'), updateProfilePicture);
router.put(
  '/change-password/:id',
  [
    validarJWT,
    check('actual', 'La contraseña actual es obligatoria').not().isEmpty(),
    check('nueva', 'La nueva contraseña debe tener al menos 8 caracteres').isLength({ min: 8 }),
    validarCampos
  ],
  cambiarPassword
);

export default router;

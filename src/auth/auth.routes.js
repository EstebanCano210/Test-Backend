import { Router } from 'express';
import { check } from 'express-validator';
import { login, register, definirRol } from './auth.controller.js';
import { validarCampos } from '../middlewares/validar-campos.js';
import { validarJWT } from '../middlewares/validar-jwt.js';
import { subirArchivo } from '../middlewares/file.middleware.js';

const router = Router();

// Registro
router.post(
  '/register',
  [
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    check('surname', 'El apellido es obligatorio').not().isEmpty(),
    check('username', 'El nombre de usuario es obligatorio').not().isEmpty(),
    check('email', 'Correo inválido').isEmail(),
    check('password', 'La contraseña debe tener mínimo 8 caracteres').isLength({ min: 8 }),
    check('phone', 'El número de teléfono debe tener 8 dígitos').isLength({ min: 8, max: 8 }),
    validarCampos
  ],
  register
);

// Login
router.post(
  '/login',
  [
    check('email', 'Correo inválido').isEmail(),
    check('password', 'La contraseña es obligatoria').not().isEmpty(),
    validarCampos
  ],
  login
);

// Definir rol
router.put(
  '/definir-rol',
  [
    validarJWT,
    subirArchivo.single('logo'),      // asegurate de usar el campo 'logo'
    check('role', 'El role es obligatorio').not().isEmpty(),
    validarCampos
  ],
  definirRol
);

export default router;

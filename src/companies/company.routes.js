import { Router } from 'express';
import { check } from 'express-validator';
import {
  createCompany,
  getCompaniesSelect,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
} from './company.controller.js';
import { validarJWT } from '../middlewares/validar-jwt.js';
import { validarCampos } from '../middlewares/validar-campos.js';
import { subirArchivo } from '../middlewares/file.middleware.js';

const router = Router();

router.get('/', getCompanies);
router.get('/select', getCompaniesSelect);
router.get('/:id', getCompanyById);
router.post(
  '/',
  [
    validarJWT,
    subirArchivo.single('logo'),
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    check('industry', 'El sector es obligatorio').not().isEmpty(),
    validarCampos
  ],
  createCompany
);
router.put(
  '/:id',
  [
    validarJWT,
    subirArchivo.single('logo')
  ],
  updateCompany
);
router.delete('/:id', validarJWT, deleteCompany);

export default router;

import User from '../users/user.model.js';
import argon2 from 'argon2';

/**
 * Verifica si existe un usuario por su ID y si está activo
 */
export const existeUsuarioPorId = async (id) => {
  const usuario = await User.findById(id);
  if (!usuario || !usuario.estado) {
    throw new Error('Usuario no encontrado o desactivado');
  }
  return usuario;
};

/**
 * Procesa y valida los datos antes de actualizar un usuario
 */
export const procesarDatosParaUpdate = async (body) => {
  const { password, ...resto } = body;

  const data = { ...resto };

  if (password) {
    data.password = await argon2.hash(password);
  }

  return data;
};

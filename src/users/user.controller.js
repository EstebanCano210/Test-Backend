import argon2 from 'argon2';
import User from './user.model.js';
import { subirArchivoCV, subirImagen } from '../services/upload.service.js';
import { existeUsuarioPorId, procesarDatosParaUpdate } from '../helpers/validar-datos-usuario.js';

// Obtener usuario por ID
export const getUserById = async (req, res) => {
  try {
    const usuario = await existeUsuarioPorId(req.params.id);
    res.json(usuario);
  } catch (error) {
    res.status(404).json({ msg: error.message });
  }
};

// Actualizar usuario
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.uid !== id) {
      return res.status(403).json({ msg: 'No puedes editar los datos de otro usuario' });
    }

    await existeUsuarioPorId(id);
    const data = await procesarDatosParaUpdate(req.body);
    const usuario = await User.findByIdAndUpdate(id, data, { new: true });

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};


// Eliminar usuario (soft delete)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id !== id) {
      return res.status(403).json({ msg: 'No puedes desactivar otra cuenta que no sea la tuya' });
    }

    const usuario = await User.findByIdAndUpdate(id, { estado: false }, { new: true });

    res.json({ msg: 'Usuario desactivado correctamente', usuario });
  } catch (error) {
    res.status(500).json({ msg: 'Error al eliminar el usuario' });
  }
};


// Subir CV
export const uploadCv = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No se envió ningún archivo' });

    console.log('📁 Archivo recibido:', req.file); // Debug

    const url = await subirArchivoCV(req.file.path);
    const usuario = await User.findByIdAndUpdate(req.params.id, { cvUrl: url }, { new: true });

    res.json({ msg: 'CV subido correctamente', cvUrl: url, usuario });

  } catch (error) {
    console.error('❌ Error al subir el CV:', error); // 🔍 Te dará la pista
    res.status(500).json({ msg: 'Error al subir el CV' });
  }
};


// Subir foto de perfil
export const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No se envió ninguna imagen' });

    const url = await subirImagen(req.file.path);
    const usuario = await User.findByIdAndUpdate(req.params.id, { profilePicture: url }, { new: true });

    res.json({ msg: 'Foto de perfil actualizada', profilePicture: url, usuario });
  } catch (error) {
    res.status(500).json({ msg: 'Error al subir la imagen de perfil' });
  }
};

export const cambiarPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { actual, nueva } = req.body;

    if (req.uid !== id) {
      return res.status(403).json({ msg: 'No puedes cambiar la contraseña de otro usuario' });
    }

    const usuario = await User.findById(id);
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });

    const esValida = await argon2.verify(usuario.password, actual);
    if (!esValida) return res.status(400).json({ msg: 'La contraseña actual no es correcta' });

    usuario.password = await argon2.hash(nueva);
    await usuario.save();

    res.json({ msg: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('❌ Error al cambiar contraseña:', error);
    res.status(500).json({ msg: 'Error al cambiar la contraseña' });
  }
};


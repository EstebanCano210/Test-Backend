import dotenv from 'dotenv';
dotenv.config(); // ✅ Asegura que las variables de entorno estén disponibles

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// ✅ Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ✅ Subida de CV (PDF o Word)
export const subirArchivoCV = async (filePath) => {
  try {
    const res = await cloudinary.uploader.upload(filePath, {
      folder: 'empleaya/cvs',
      resource_type: 'raw'
    });
    fs.unlinkSync(filePath); // 🔥 Borra archivo temporal
    return res.secure_url;
  } catch (error) {
    console.error('❌ Cloudinary error:', error);
    throw new Error(error.message || 'Error al subir el CV a Cloudinary');
  }
};

// ✅ Subida de imagen de perfil
export const subirImagen = async (filePath) => {
  try {
    const res = await cloudinary.uploader.upload(filePath, {
      folder: 'empleaya/profiles',
      resource_type: 'image'
    });
    fs.unlinkSync(filePath);
    return res.secure_url;
  } catch (error) {
    throw new Error('Error al subir la imagen a Cloudinary');
  }
};

// ✅ Subida de imagen de empresa
export const subirImagenEmpresa = async (filePath) => {
  try {
    const res = await cloudinary.uploader.upload(filePath, {
      folder: 'empleaya/logos',
      resource_type: 'image'
    });
    fs.unlinkSync(filePath);
    return res.secure_url;
  } catch (error) {
    throw new Error('Error al subir el logo de la empresa a Cloudinary');
  }
};

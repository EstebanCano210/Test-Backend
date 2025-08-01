import User from '../users/user.model.js';
import Company from '../companies/company.model.js';
import argon2 from 'argon2';
import { generarJWT } from '../helpers/generate-jwt.js';
import { subirImagenEmpresa } from '../services/upload.service.js'; 

// Registro
export const register = async (req, res) => {
  try {
    const { name, surname, username, email, password, phone } = req.body;

    // Verificar duplicados
    if (await User.findOne({ email })) {
      return res.status(400).json({ msg: 'El correo ya está registrado' });
    }
    if (await User.findOne({ username })) {
      return res.status(400).json({ msg: 'El nombre de usuario ya está en uso' });
    }

    // Hashear contraseña
    const hashedPassword = await argon2.hash(password);

    // Crear usuario
    const nuevoUsuario = new User({
      name,
      surname,
      username,
      email,
      password: hashedPassword,
      phone
    });
    await nuevoUsuario.save();

    // Generar token
    const token = await generarJWT(nuevoUsuario.id);

    // Devolver usuario + token
    return res.status(201).json({
      usuario: nuevoUsuario.toJSON(),
      token
    });
  } catch (error) {
    console.error('❌ Error en el registro:', error);
    return res.status(500).json({ msg: 'Error al registrar usuario' });
  }
};


// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await User.findOne({ email });
    if (!usuario || !usuario.estado) {
      return res.status(400).json({ msg: 'Credenciales incorrectas' });
    }

    const validPassword = await argon2.verify(usuario.password, password);
    if (!validPassword) {
      return res.status(400).json({ msg: 'Credenciales incorrectas' });
    }

    const token = await generarJWT(usuario.id);

    res.json({
      usuario,
      token
    });
  } catch (error) {
    res.status(500).json({ msg: 'Error en el login' });
  }
};

export const definirRol = async (req, res) => {
  const { role, companyId, nuevaEmpresa } = req.body;
  const uid = req.user.id;

  try {
    let empresa = null;

    if (role === 'ADMIN_COMPANY') {
      if (nuevaEmpresa) {
        const datosEmpresa = typeof nuevaEmpresa === 'string'
          ? JSON.parse(nuevaEmpresa)
          : nuevaEmpresa;

        const { name, industry, location, description } = datosEmpresa;
        if (!name || !industry) {
          return res.status(400).json({ msg: 'Debes enviar name e industry de la empresa' });
        }
        const existe = await Company.findOne({ name });
        if (existe) {
          return res.status(400).json({ msg: 'Ya existe una empresa con ese nombre' });
        }
        let logoUrl = null;
        if (req.file) {
          logoUrl = await subirImagenEmpresa(req.file.path);
        }

        empresa = new Company({
          name,
          industry,
          location,
          description,
          logoUrl,
          createdBy: uid
        });
        await empresa.save();

      } else if (companyId) {
        empresa = await Company.findById(companyId);
        if (!empresa) {
          return res.status(404).json({ msg: 'Empresa no encontrada' });
        }
      } else {
        return res.status(400).json({ msg: 'Debes crear o seleccionar una empresa' });
      }

      await User.findByIdAndUpdate(uid, {
        role:    'ADMIN_COMPANY',
        company: empresa._id
      });

      return res.json({ msg: 'Rol definido como empleador', empresa });

    } else if (role === 'USER') {
      await User.findByIdAndUpdate(uid, { role: 'USER', company: null });
      return res.json({ msg: 'Rol definido como usuario normal' });
    }

    res.status(400).json({ msg: 'Rol inválido' });

  } catch (error) {
    console.error('❌ Error al definir rol:', error);
    res.status(500).json({ msg: 'Error al definir el rol' });
  }
};


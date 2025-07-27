import User from '../users/user.model.js';
import argon2 from 'argon2';

export const createAdminUser = async () => {
  try {
    const adminExistente = await User.findOne({ role: 'ADMIN' });

    if (!adminExistente) {
      const hashedPassword = await argon2.hash('Admin2025');

      const nuevoAdmin = new User({
        name: 'Admin',
        surname: 'Plataforma',              
        username: 'admin',                  
        email: 'admin@empleaya.com',
        password: hashedPassword,
        phone: '12345678',
        role: 'ADMIN'
      });

      await nuevoAdmin.save();
      console.log('✅ Usuario administrador creado por defecto');
    } else {
      console.log('ℹ️ Usuario administrador ya existe');
    }
  } catch (error) {
    console.error('❌ Error al crear el usuario administrador:', error);
  }
};

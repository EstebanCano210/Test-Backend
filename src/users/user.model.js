import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    maxlength: [25, 'El nombre no puede ser mayor a 25 caracteres']
  },
  surname: {
    type: String,
    required: [true, 'El apellido es requerido'],
    maxlength: [25, 'El apellido no puede ser mayor a 25 caracteres']
  },
  username: {
    type: String,
    required: [true, 'Se requiere un nombre de usuario'],
    unique: true
  },
  email: {
    type: String,
    required: [true, 'El correo es requerido'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [8, 'La contraseña debe tener al menos 8 caracteres']
  },
  phone: {
    type: String,
    required: true,
    minlength: [8, 'El número de teléfono debe tener 8 dígitos'],
    maxlength: [8, 'El número de teléfono debe tener 8 dígitos']
  },
  role: {
    type: String,
    enum: ['ADMIN', 'ADMIN_COMPANY', 'USER'],
    default: 'USER'
  },
  profilePicture: {
    type: String 
  },
  cvUrl: {
    type: String 
  },
  address: {
    type: String 
  },
  description: {
    type: String 
  },
  estado: {
    type: Boolean,
    default: true
  },
  company: {
  type: Schema.Types.ObjectId,
  ref: 'Company',
  default: null
  }
  }, {
    timestamps: true,
    versionKey: false
  });

userSchema.methods.toJSON = function () {
  const { __v, password, _id, ...usuario } = this.toObject();
  usuario.uid = _id;
  return usuario;
};

export default model('User', userSchema);

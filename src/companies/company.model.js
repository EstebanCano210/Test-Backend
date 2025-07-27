import { Schema, model } from 'mongoose';

const companySchema = new Schema({
  name: {
    type: String,
    required: [true, 'El nombre de la empresa es obligatorio'],
    unique: true,
    trim: true
  },
  industry: {
    type: String,
    required: [true, 'El sector o industria es obligatorio']
  },
  location: {
    type: String
  },
  description: {
    type: String
  },
  logoUrl: {
    type: String 
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  estado: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  versionKey: false
});

export default model('Company', companySchema);

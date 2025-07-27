// src/jobs/job.model.js
import { Schema, model } from 'mongoose';

const jobSchema = new Schema({
  title: {
    type: String,
    required: [true, 'El título del empleo es obligatorio']
  },
  description: {
    type: String,
    required: [true, 'La descripción es obligatoria']
  },
  requirements: {
    type: String
  },
  location: {
    type: String
  },
  modality: {
    type: String,
    enum: ['presencial', 'remoto', 'híbrido'],
    default: 'presencial'
  },
  type: {
    type: String,
    enum: ['tiempo completo', 'medio tiempo'],
    default: 'tiempo completo'
  },
  category: {
    type: String
  },
  salary: {                       
    type: Number,
    default: 0
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
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

export default model('Job', jobSchema);

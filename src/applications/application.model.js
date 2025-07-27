import { Schema, model } from 'mongoose';

const applicationSchema = new Schema({
  job: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cvUrl: {
    type: String
  },
  message: {
    type: String
  },
  estado: {
    type: String,
    enum: ['pendiente', 'aceptado', 'rechazado', 'cancelada'],
    default: 'pendiente'
  }
}, {
  timestamps: true,
  versionKey: false
});

export default model('Application', applicationSchema);

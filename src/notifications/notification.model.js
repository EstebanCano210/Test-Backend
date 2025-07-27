import { Schema, model } from 'mongoose';

const notificationSchema = new Schema({
  to: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['mensaje', 'postulacion', 'estado'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  link: {
    type: String
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  versionKey: false
});

export default model('Notification', notificationSchema);

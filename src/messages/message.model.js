import { Schema, model } from 'mongoose';

const messageSchema = new Schema({
  from: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'El mensaje no puede estar vacío']
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  versionKey: false
});

export default model('Message', messageSchema);

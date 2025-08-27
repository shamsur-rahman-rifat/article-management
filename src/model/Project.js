import { Schema, model } from 'mongoose';

const projectSchema = new Schema({
  name: { type: String, required: true }, 
  word: { type: Number }, 
  private: { type: Boolean, default: false }, 
  createdBy: String,
},{timestamps: true, versionKey: false});

export default model('projects', projectSchema);
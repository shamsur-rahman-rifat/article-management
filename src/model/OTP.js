import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  email: { type: String, require: true },
  otp: { type: String, require: true },
  status: String,
},{timestamps: true,versionKey: false});

export default model('otps', userSchema);

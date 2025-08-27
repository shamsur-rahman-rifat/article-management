import { Schema, model } from 'mongoose';

const topicSchema = new Schema({
  title: String,
  keywords: [String],
  month: { type: String, enum: [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']},
  wordCount: { type: Number, default: 1000 },
  type: { type: String, enum: ['Blog Post', 'Guest Post', 'Web Content'], default: 'Blog Post' },
  project: { type: Schema.Types.ObjectId, ref: 'projects' },
  status: { type: String, enum: ['pending', 'assigned', 'completed'], default: 'pending' },
  researchSubmittedAt: { type: Date },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'users' },
  adminAssignedAt: { type: Date },
  createdBy: String,
},{timestamps: true, versionKey: false });

export default model('topics', topicSchema);

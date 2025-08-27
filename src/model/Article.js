import { Schema, model } from 'mongoose';

const articleSchema = new Schema({
  topic: { type: Schema.Types.ObjectId, ref: 'topics' },
  project: { type: Schema.Types.ObjectId, ref: 'projects' },
  writer: { type: Schema.Types.ObjectId, ref: 'users' },
  publisher: String,
  writerSubmittedAt: { type: Date },
  publishedAt: { type: Date },
  contentLink: { type: String },
  status: { type: String, enum: ['draft', 'submitted', 'published', 'assigned'], default: 'assigned' },
  publishLink: { type: String }
}, {timestamps: true, versionKey: false });

export default model('articles', articleSchema);

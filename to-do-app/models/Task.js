import mongoose from 'mongoose';

const SubtaskSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const TaskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  dueDate: { type: Date },
  subtasks: [SubtaskSchema],
}, { timestamps: true });

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);
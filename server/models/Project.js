const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [120, 'Project name cannot exceed 120 characters']
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Client is required for a project'],
      index: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Active', 'Completed', 'On Hold', 'Cancelled'],
      default: 'Pending',
      index: true
    },
    fee: {
      type: Number,
      required: [true, 'Project fee is required'],
      min: [0, 'Project fee must be at least 0']
    },
    startDate: {
      type: Date
    },
    deadline: {
      type: Date
    },
    description: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

projectSchema.index({ user: 1, status: 1 });
projectSchema.index({ user: 1, client: 1 });
projectSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);

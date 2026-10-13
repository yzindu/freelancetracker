const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
      index: true
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Client reference is required'],
      index: true
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0.01, 'Payment amount must be greater than 0']
    },
    date: {
      type: Date,
      required: [true, 'Payment date is required'],
      default: Date.now,
      index: true
    },
    method: {
      type: String,
      enum: ['Cash', 'Bank Transfer', 'PayPal', 'Credit Card', 'Other'],
      default: 'Bank Transfer'
    },
    status: {
      type: String,
      enum: ['Paid', 'Pending'],
      default: 'Paid',
      index: true
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

paymentSchema.index({ user: 1, date: -1 });
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ user: 1, client: 1 });
paymentSchema.index({ user: 1, project: 1 });

module.exports = mongoose.model('Payment', paymentSchema);

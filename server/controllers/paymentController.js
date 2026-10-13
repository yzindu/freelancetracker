const Payment = require('../models/Payment');
const Project = require('../models/Project');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all payments/incomes with multi-field filtering, date ranges, and pagination
// @route   GET /api/payments
// @access  Private
const getPayments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const status = req.query.status ? req.query.status.trim() : '';
  const client = req.query.client ? req.query.client.trim() : '';
  const project = req.query.project ? req.query.project.trim() : '';
  const from = req.query.from ? req.query.from.trim() : '';
  const to = req.query.to ? req.query.to.trim() : '';
  const fetchAll = req.query.all === 'true';

  const query = { user: req.user._id };

  if (status) {
    query.status = status;
  }

  if (client) {
    query.client = client;
  }

  if (project) {
    query.project = project;
  }

  if (from || to) {
    query.date = {};
    if (from) {
      query.date.$gte = new Date(from);
    }
    if (to) {
      // Set to end of the day if date only string
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      query.date.$lte = toDate;
    }
  }

  const total = await Payment.countDocuments(query);

  let paymentQuery = Payment.find(query)
    .populate('project', 'name fee status')
    .populate('client', 'name company email')
    .sort({ date: -1, createdAt: -1 });

  if (!fetchAll) {
    paymentQuery = paymentQuery.skip((page - 1) * limit).limit(limit);
  }

  const payments = await paymentQuery;

  // Calculate total amount for all matching records (for header summary)
  const totalAmountAgg = await Payment.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const totalAmount = totalAmountAgg.length > 0 ? totalAmountAgg[0].total : 0;

  // Calculate paid-only amount for matching records
  const paidOnlyQuery = { ...query, status: 'Paid' };
  const paidOnlyAgg = await Payment.aggregate([
    { $match: paidOnlyQuery },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const totalPaidAmount = paidOnlyAgg.length > 0 ? paidOnlyAgg[0].total : 0;

  res.status(200).json({
    success: true,
    data: payments,
    count: payments.length,
    total,
    page: fetchAll ? 1 : page,
    pages: fetchAll ? 1 : Math.ceil(total / limit) || 1,
    summary: {
      totalAmount,
      totalPaidAmount,
      totalPendingAmount: totalAmount - totalPaidAmount
    }
  });
});

// @desc    Get single payment by ID
// @route   GET /api/payments/:id
// @access  Private
const getPayment = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findOne({
    _id: req.params.id,
    user: req.user._id
  })
    .populate('project', 'name fee status')
    .populate('client', 'name company email');

  if (!payment) {
    return next(new ApiError(404, 'Payment record not found'));
  }

  res.status(200).json({
    success: true,
    data: payment
  });
});

// @desc    Create new payment record
// @route   POST /api/payments
// @access  Private
const createPayment = asyncHandler(async (req, res, next) => {
  const { project, amount, date, method, status, notes } = req.body;

  // Verify project exists and belongs to logged-in user
  const projectDoc = await Project.findOne({
    _id: project,
    user: req.user._id
  });

  if (!projectDoc) {
    return next(new ApiError(404, 'Project not found or not authorized'));
  }

  // Automatically assign client from project
  const payment = await Payment.create({
    user: req.user._id,
    project: projectDoc._id,
    client: projectDoc.client,
    amount,
    date: date || new Date(),
    method: method || 'Bank Transfer',
    status: status || 'Paid',
    notes: notes || ''
  });

  const populated = await Payment.findById(payment._id)
    .populate('project', 'name fee status')
    .populate('client', 'name company email');

  res.status(201).json({
    success: true,
    data: populated
  });
});

// @desc    Update payment
// @route   PUT /api/payments/:id
// @access  Private
const updatePayment = asyncHandler(async (req, res, next) => {
  let payment = await Payment.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!payment) {
    return next(new ApiError(404, 'Payment record not found'));
  }

  const { project, amount, date, method, status, notes } = req.body;

  if (project && project.toString() !== payment.project.toString()) {
    const projectDoc = await Project.findOne({
      _id: project,
      user: req.user._id
    });
    if (!projectDoc) {
      return next(new ApiError(404, 'Target project not found or not authorized'));
    }
    payment.project = projectDoc._id;
    payment.client = projectDoc.client;
  }

  if (amount !== undefined) payment.amount = amount;
  if (date !== undefined) payment.date = date;
  if (method !== undefined) payment.method = method;
  if (status !== undefined) payment.status = status;
  if (notes !== undefined) payment.notes = notes;

  await payment.save();

  const populated = await Payment.findById(payment._id)
    .populate('project', 'name fee status')
    .populate('client', 'name company email');

  res.status(200).json({
    success: true,
    data: populated
  });
});

// @desc    Delete payment
// @route   DELETE /api/payments/:id
// @access  Private
const deletePayment = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!payment) {
    return next(new ApiError(404, 'Payment record not found'));
  }

  await payment.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Payment record removed successfully'
  });
});

module.exports = {
  getPayments,
  getPayment,
  createPayment,
  updatePayment,
  deletePayment
};

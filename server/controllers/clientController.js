const mongoose = require('mongoose');
const Client = require('../models/Client');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all clients for logged-in user (with search and pagination)
// @route   GET /api/clients
// @access  Private
const getClients = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const search = req.query.search ? req.query.search.trim() : '';
  const fetchAll = req.query.all === 'true';

  const query = { user: req.user._id };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // If requested all (for dropdown selects without pagination)
  if (fetchAll) {
    const clients = await Client.find(query).sort({ name: 1 });
    return res.status(200).json({
      success: true,
      data: clients,
      total: clients.length
    });
  }

  const total = await Client.countDocuments(query);
  const clients = await Client.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.status(200).json({
    success: true,
    data: clients,
    count: clients.length,
    total,
    page,
    pages: Math.ceil(total / limit) || 1
  });
});

// @desc    Get single client by ID
// @route   GET /api/clients/:id
// @access  Private
const getClient = asyncHandler(async (req, res, next) => {
  const client = await Client.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!client) {
    return next(new ApiError(404, 'Client not found'));
  }

  res.status(200).json({
    success: true,
    data: client
  });
});

// @desc    Create new client
// @route   POST /api/clients
// @access  Private
const createClient = asyncHandler(async (req, res) => {
  const { name, email, phone, company, notes } = req.body;

  const client = await Client.create({
    user: req.user._id,
    name,
    email: email || '',
    phone: phone || '',
    company: company || '',
    notes: notes || ''
  });

  res.status(201).json({
    success: true,
    data: client
  });
});

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private
const updateClient = asyncHandler(async (req, res, next) => {
  let client = await Client.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!client) {
    return next(new ApiError(404, 'Client not found'));
  }

  const { name, email, phone, company, notes } = req.body;

  client.name = name !== undefined ? name : client.name;
  client.email = email !== undefined ? email : client.email;
  client.phone = phone !== undefined ? phone : client.phone;
  client.company = company !== undefined ? company : client.company;
  client.notes = notes !== undefined ? notes : client.notes;

  await client.save();

  res.status(200).json({
    success: true,
    data: client
  });
});

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private
const deleteClient = asyncHandler(async (req, res, next) => {
  const client = await Client.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!client) {
    return next(new ApiError(404, 'Client not found'));
  }

  // Check if client has associated projects if Project model exists
  const Project = mongoose.models.Project;
  if (Project) {
    const projectCount = await Project.countDocuments({
      client: req.params.id,
      user: req.user._id
    });

    if (projectCount > 0) {
      return next(
        new ApiError(
          400,
          `Cannot delete client. Client is associated with ${projectCount} project(s). Delete or reassign projects first.`
        )
      );
    }
  }

  await client.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Client removed successfully'
  });
});

module.exports = {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient
};

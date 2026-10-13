const Project = require('../models/Project');
const Client = require('../models/Client');
const Payment = require('../models/Payment');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all projects for user with filters, search, pagination, and paid progress
// @route   GET /api/projects
// @access  Private
const getProjects = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const search = req.query.search ? req.query.search.trim() : '';
  const status = req.query.status ? req.query.status.trim() : '';
  const client = req.query.client ? req.query.client.trim() : '';
  const fetchAll = req.query.all === 'true';

  const query = { user: req.user._id };

  if (status) {
    query.status = status;
  }

  if (client) {
    query.client = client;
  }

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  // Count total matching documents
  const total = await Project.countDocuments(query);

  let projectQuery = Project.find(query)
    .populate('client', 'name email company')
    .sort({ createdAt: -1 });

  if (!fetchAll) {
    projectQuery = projectQuery.skip((page - 1) * limit).limit(limit);
  }

  const projects = await projectQuery;

  // Aggregate paid amounts for fetched projects
  const projectIds = projects.map((p) => p._id);
  const paidSums = await Payment.aggregate([
    {
      $match: {
        project: { $in: projectIds },
        status: 'Paid',
        user: req.user._id
      }
    },
    {
      $group: {
        _id: '$project',
        totalPaid: { $sum: '$amount' }
      }
    }
  ]);

  const paidMap = {};
  paidSums.forEach((item) => {
    paidMap[item._id.toString()] = item.totalPaid;
  });

  const formattedProjects = projects.map((proj) => {
    const pObj = proj.toObject();
    const paidAmount = paidMap[proj._id.toString()] || 0;
    const remainingAmount = Math.max(0, (proj.fee || 0) - paidAmount);
    return {
      ...pObj,
      paidAmount,
      remainingAmount
    };
  });

  res.status(200).json({
    success: true,
    data: formattedProjects,
    count: formattedProjects.length,
    total,
    page: fetchAll ? 1 : page,
    pages: fetchAll ? 1 : Math.ceil(total / limit) || 1
  });
});

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findOne({
    _id: req.params.id,
    user: req.user._id
  }).populate('client', 'name email company phone');

  if (!project) {
    return next(new ApiError(404, 'Project not found'));
  }

  // Get paid sum for this project
  const paidSum = await Payment.aggregate([
    {
      $match: {
        project: project._id,
        status: 'Paid',
        user: req.user._id
      }
    },
    {
      $group: {
        _id: '$project',
        totalPaid: { $sum: '$amount' }
      }
    }
  ]);

  const paidAmount = paidSum.length > 0 ? paidSum[0].totalPaid : 0;
  const projectObj = project.toObject();

  res.status(200).json({
    success: true,
    data: {
      ...projectObj,
      paidAmount,
      remainingAmount: Math.max(0, project.fee - paidAmount)
    }
  });
});

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = asyncHandler(async (req, res, next) => {
  const { name, client, status, fee, startDate, deadline, description } = req.body;

  // Verify client belongs to current user
  const clientExists = await Client.findOne({
    _id: client,
    user: req.user._id
  });

  if (!clientExists) {
    return next(new ApiError(404, 'Specified client does not exist or is not authorized'));
  }

  const project = await Project.create({
    user: req.user._id,
    name,
    client,
    status: status || 'Pending',
    fee,
    startDate: startDate || null,
    deadline: deadline || null,
    description: description || ''
  });

  const populated = await Project.findById(project._id).populate('client', 'name email company');

  res.status(201).json({
    success: true,
    data: {
      ...populated.toObject(),
      paidAmount: 0,
      remainingAmount: fee
    }
  });
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = asyncHandler(async (req, res, next) => {
  let project = await Project.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!project) {
    return next(new ApiError(404, 'Project not found'));
  }

  const { name, client, status, fee, startDate, deadline, description } = req.body;

  if (client && client.toString() !== project.client.toString()) {
    const clientExists = await Client.findOne({
      _id: client,
      user: req.user._id
    });
    if (!clientExists) {
      return next(new ApiError(404, 'Specified client does not exist or is not authorized'));
    }
    project.client = client;
  }

  if (name !== undefined) project.name = name;
  if (status !== undefined) project.status = status;
  if (fee !== undefined) project.fee = fee;
  if (startDate !== undefined) project.startDate = startDate;
  if (deadline !== undefined) project.deadline = deadline;
  if (description !== undefined) project.description = description;

  await project.save();

  const populated = await Project.findById(project._id).populate('client', 'name email company');

  // Recalculate paid amount
  const paidSum = await Payment.aggregate([
    {
      $match: {
        project: project._id,
        status: 'Paid',
        user: req.user._id
      }
    },
    {
      $group: {
        _id: '$project',
        totalPaid: { $sum: '$amount' }
      }
    }
  ]);

  const paidAmount = paidSum.length > 0 ? paidSum[0].totalPaid : 0;

  res.status(200).json({
    success: true,
    data: {
      ...populated.toObject(),
      paidAmount,
      remainingAmount: Math.max(0, project.fee - paidAmount)
    }
  });
});

// @desc    Delete project (and cascade delete associated payments)
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!project) {
    return next(new ApiError(404, 'Project not found'));
  }

  // Cascade delete payments linked to this project
  await Payment.deleteMany({
    project: req.params.id,
    user: req.user._id
  });

  await project.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Project and associated payments removed successfully'
  });
});

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
};

const express = require('express');
const { body } = require('express-validator');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

const projectValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ max: 120 })
    .withMessage('Project name cannot exceed 120 characters'),
  body('client')
    .notEmpty()
    .withMessage('Client is required')
    .isMongoId()
    .withMessage('Valid client ID is required'),
  body('fee')
    .notEmpty()
    .withMessage('Fee is required')
    .isFloat({ min: 0 })
    .withMessage('Fee must be a number greater than or equal to 0'),
  body('status')
    .optional()
    .isIn(['Pending', 'Active', 'Completed', 'On Hold', 'Cancelled'])
    .withMessage('Invalid status value'),
  body('startDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('deadline')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Deadline must be a valid date'),
  body('description')
    .optional()
    .trim()
];

router
  .route('/')
  .get(getProjects)
  .post(projectValidation, validate, createProject);

router
  .route('/:id')
  .get(getProject)
  .put(projectValidation, validate, updateProject)
  .delete(deleteProject);

module.exports = router;

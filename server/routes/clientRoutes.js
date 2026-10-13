const express = require('express');
const { body } = require('express-validator');
const {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient
} = require('../controllers/clientController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// All client endpoints require authentication
router.use(protect);

const clientValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Client name is required')
    .isLength({ max: 100 })
    .withMessage('Client name cannot exceed 100 characters'),
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim(),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),
  body('notes')
    .optional()
    .trim()
];

router
  .route('/')
  .get(getClients)
  .post(clientValidation, validate, createClient);

router
  .route('/:id')
  .get(getClient)
  .put(clientValidation, validate, updateClient)
  .delete(deleteClient);

module.exports = router;

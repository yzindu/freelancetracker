const express = require('express');
const { body } = require('express-validator');
const {
  getPayments,
  getPayment,
  createPayment,
  updatePayment,
  deletePayment
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

const paymentValidation = [
  body('project')
    .notEmpty()
    .withMessage('Project is required')
    .isMongoId()
    .withMessage('Valid project ID is required'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('date')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Date must be a valid ISO format'),
  body('method')
    .optional()
    .isIn(['Cash', 'Bank Transfer', 'PayPal', 'Credit Card', 'Other'])
    .withMessage('Invalid payment method'),
  body('status')
    .optional()
    .isIn(['Paid', 'Pending'])
    .withMessage('Status must be either Paid or Pending'),
  body('notes')
    .optional()
    .trim()
];

router
  .route('/')
  .get(getPayments)
  .post(paymentValidation, validate, createPayment);

router
  .route('/:id')
  .get(getPayment)
  .put(paymentValidation, validate, updatePayment)
  .delete(deletePayment);

module.exports = router;

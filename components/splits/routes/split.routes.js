const express = require('express');
const router = express.Router();
const { protect } = require('../../../middleware/authMiddleware');
const {
  createSplit,
  getSplits,
  getSplitById,
  addExpense,
  addParticipant,
  markAsPaid
} = require('../controllers/split.controller');

// All routes are protected and require authentication
router.use(protect);

// Create a new split
router.post('/api/splits/', createSplit);

// Get all splits for the logged-in user
router.get('/api/splits/', getSplits);

// Get a specific split by ID
router.get('/api/splits/:id', getSplitById);

// Add a new expense to a split
router.post('/api/splits/:id/expenses', addExpense);

// Add a participant to a split
router.post('/api/splits/:id/participants', addParticipant);

// Mark a participant as paid
router.put('/api/splits/:id/participants/paid', markAsPaid);

module.exports = router; 
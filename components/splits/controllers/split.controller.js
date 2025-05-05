const Split = require("../../../models/Split");
const User = require("../../../models/users");

// Create a new split
const createSplit = async (req, res) => {
  try {
    const { title, totalAmount, participants } = req.body;
    const createdBy = req.user._id;

    // Validate participants is an array
    if (!Array.isArray(participants)) {
      return res.status(400).json({ error: "Participants must be an array" });
    }

    // Validate each participant has a user object with _id
    if (!participants.every(p => p.user && p.user._id)) {
      return res.status(400).json({ error: "Each participant must have a user object with _id" });
    }

    // Create new split with initial participants
    const newSplit = new Split({
      title,
      totalAmount,
      participants: participants.map(participant => ({
        user: participant.user._id,  // Extract the _id from the user object
        amount: participant.amount || totalAmount / participants.length,
        paid: participant.paid || false
      })),
      createdBy,
      status: 'active'
    });

    await newSplit.save();

    // Populate user details for response
    const populatedSplit = await Split.findById(newSplit._id)
      .populate({
        path: 'participants.user',
        model: 'users',
        select: 'name email'
      })
      .populate({
        path: 'createdBy',
        model: 'users',
        select: 'name email'
      });

    res.status(201).json(populatedSplit);
  } catch (error) {
    console.error("Error in createSplit: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all splits for the logged-in user
const getSplits = async (req, res) => {
  try {
    const userId = req.user._id;

    const splits = await Split.find({
      $or: [
        { createdBy: userId },
        { 'participants.user': userId }
      ]
    })
    .populate({
      path: 'participants.user',
      model: 'users',
      select: 'name email'
    })
    .populate({
      path: 'createdBy',
      model: 'users',
      select: 'name email'
    })
    .sort({ createdAt: -1 });

    res.status(200).json(splits);
  } catch (error) {
    console.error("Error in getSplits: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get a specific split by ID
const getSplitById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const split = await Split.findOne({
      _id: id,
      $or: [
        { createdBy: userId },
        { 'participants.user': userId }
      ]
    })
    .populate({
      path: 'participants.user',
      model: 'users',
      select: 'name email'
    })
    .populate({
      path: 'createdBy',
      model: 'users',
      select: 'name email'
    })
    .populate({
      path: 'expenses.paidBy',
      model: 'users',
      select: 'name email'
    });

    if (!split) {
      return res.status(404).json({ error: "Split not found" });
    }

    res.status(200).json(split);
  } catch (error) {
    console.error("Error in getSplitById: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Add a new expense to a split
const addExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, category } = req.body;
    const paidBy = req.user._id;

    const split = await Split.findById(id);
    if (!split) {
      return res.status(404).json({ error: "Split not found" });
    }

    // Add new expense
    split.expenses.push({
      description,
      amount,
      paidBy,
      category,
      date: new Date()
    });

    // Update total amount
    split.totalAmount += amount;

    // Update participant amounts
    const perPersonShare = amount / split.participants.length;
    split.participants.forEach(participant => {
      if (participant.user.toString() === paidBy.toString()) {
        participant.amount += amount - perPersonShare;
      } else {
        participant.amount -= perPersonShare;
      }
    });

    await split.save();

    const updatedSplit = await Split.findById(id)
      .populate({
        path: 'participants.user',
        model: 'users',
        select: 'name email'
      })
      .populate({
        path: 'createdBy',
        model: 'users',
        select: 'name email'
      })
      .populate({
        path: 'expenses.paidBy',
        model: 'users',
        select: 'name email'
      });

    res.status(200).json(updatedSplit);
  } catch (error) {
    console.error("Error in addExpense: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Add a participant to a split
const addParticipant = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const split = await Split.findById(id);
    if (!split) {
      return res.status(404).json({ error: "Split not found" });
    }

    // Check if user is already a participant
    const isAlreadyParticipant = split.participants.some(
      p => p.user.toString() === userId
    );

    if (isAlreadyParticipant) {
      return res.status(400).json({ error: "User is already a participant" });
    }

    // Add new participant
    const perPersonShare = split.totalAmount / (split.participants.length + 1);
    
    // Update existing participants' amounts
    split.participants.forEach(participant => {
      participant.amount = perPersonShare;
    });

    // Add new participant
    split.participants.push({
      user: userId,
      amount: perPersonShare,
      paid: false
    });

    await split.save();

    const updatedSplit = await Split.findById(id)
      .populate({
        path: 'participants.user',
        model: 'users',
        select: 'name email'
      })
      .populate({
        path: 'createdBy',
        model: 'users',
        select: 'name email'
      });

    res.status(200).json(updatedSplit);
  } catch (error) {
    console.error("Error in addParticipant: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Mark a participant as paid
const markAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { participantId } = req.body;

    const split = await Split.findById(id);
    if (!split) {
      return res.status(404).json({ error: "Split not found" });
    }

    const participant = split.participants.id(participantId);
    if (!participant) {
      return res.status(404).json({ error: "Participant not found" });
    }

    participant.paid = true;
    await split.save();

    const updatedSplit = await Split.findById(id)
      .populate({
        path: 'participants.user',
        model: 'users',
        select: 'name email'
      })
      .populate({
        path: 'createdBy',
        model: 'users',
        select: 'name email'
      });

    res.status(200).json(updatedSplit);
  } catch (error) {
    console.error("Error in markAsPaid: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createSplit,
  getSplits,
  getSplitById,
  addExpense,
  addParticipant,
  markAsPaid
}; 
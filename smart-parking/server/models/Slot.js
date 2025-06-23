const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  floorNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  slotNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 16
  },
  isBooked: {
    type: Boolean,
    default: false
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  carDetails: {
    numberPlate: {
      type: String,
      trim: true,
      default: ''
    },
    color: {
      type: String,
      trim: true,
      default: ''
    }
  },
  startTime: {
    type: Date,
    default: null
  },
  duration: {
    type: Number, // Duration in hours
    default: 0
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  totalCost: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Compound index to ensure unique combination of floor and slot numbers
slotSchema.index({ floorNumber: 1, slotNumber: 1 }, { unique: true });

// Static method to calculate parking cost
slotSchema.statics.calculateCost = function(durationHours) {
  // ₹50 base charge for up to 12 hours
  // +₹20 per 12-hour increment
  const baseCost = 50;
  const additionalBlocks = Math.max(0, Math.ceil(durationHours / 12) - 1);
  return baseCost + (additionalBlocks * 20);
};

const Slot = mongoose.model('Slot', slotSchema);

module.exports = Slot; 
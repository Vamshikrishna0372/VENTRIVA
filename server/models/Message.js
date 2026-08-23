const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: [true, 'Conversation ID is required'],
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender User ID is required'],
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver User ID is required'],
    },
    message: {
      type: String,
      required: [true, 'Message text cannot be empty'],
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
      trim: true,
    },
    messageType: {
      type: String,
      enum: ['Text', 'System'],
      default: 'Text',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ conversation: 1, createdAt: 1 });
messageSchema.index({ receiver: 1, isRead: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;

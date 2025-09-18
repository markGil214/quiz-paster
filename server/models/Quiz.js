const mongoose = require('mongoose');

// Question schema
const questionSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    letter: {
      type: String,
      required: true,
      match: /^[A-Z]$/
    },
    text: {
      type: String,
      required: true,
      trim: true
    }
  }]
});

// Quiz schema
const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Untitled Quiz'
  },
  code: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  questions: [questionSchema],
  answerKey: {
    type: Map,
    of: String // Maps question number to correct answer letter
  },
  metadata: {
    totalQuestions: Number,
    hasAnswerKey: Boolean,
    answerKeyComplete: Boolean,
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  rawText: {
    type: String,
    required: true
  },
  // Quiz statistics
  stats: {
    views: {
      type: Number,
      default: 0
    },
    submissions: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Generate unique quiz code
quizSchema.statics.generateCode = function() {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

// Find quiz by code
quizSchema.statics.findByCode = function(code) {
  return this.findOne({ code: code.toLowerCase() });
};

// Instance method to get preview
quizSchema.methods.getPreview = function() {
  return {
    code: this.code,
    title: this.title,
    totalQuestions: this.metadata.totalQuestions,
    hasAnswerKey: this.metadata.hasAnswerKey,
    createdAt: this.metadata.createdAt
  };
};

module.exports = mongoose.model('Quiz', quizSchema);

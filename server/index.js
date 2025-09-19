const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const { parseQuizText, generateQuizPreview } = require('./quizParser');
const Quiz = require('./models/Quiz');

const app = express();

// CORS configuration for production
const corsOptions = {
  origin: [
    'http://localhost:5173', // Local development
    'http://localhost:5174', // Local development (backup port)
    'http://localhost:4173', // Local preview
    'https://quiz-paster.vercel.app', // Your original Vercel app
    'https://quiz-paster13.vercel.app', // Your new Vercel app
    'https://quiz-frontend-abc123.onrender.com', // Replace with your actual Render frontend URL
    /\.onrender\.com$/, // Allow any Render subdomain
    /\.vercel\.app$/, // Allow any Vercel subdomain
    // Add your custom domain here if you have one
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// CORS configuration for production
const corsOptions = {
  origin: [
    'http://localhost:5173', // Local development
    'http://localhost:5174', // Local development (backup port)
    'http://localhost:4173', // Local preview
    'https://quiz-paster.vercel.app', // Your original Vercel app
    'https://quiz-paster13.vercel.app', // Your new Vercel app
    'https://quiz-frontend-abc123.onrender.com', // Replace with your actual Render frontend URL
    /\.onrender\.com$/, // Allow any Render subdomain
    /\.vercel\.app$/, // Allow any Vercel subdomain
    // Add your custom domain here if you have one
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Manual CORS handler as backup
app.use((req, res, next) => {
  const origin = req.get('Origin');
  console.log(`🌐 CORS Check - Origin: ${origin}`);
  console.log(`🔍 Method: ${req.method}`);
  
  // List of allowed origins (same as above but as strings for manual checking)
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:4173',
    'https://quiz-paster.vercel.app',
    'https://quiz-paster13.vercel.app',
    'https://quiz-frontend-abc123.onrender.com'
  ];
  
  // Check if origin is explicitly allowed or matches regex patterns
  const isExplicitlyAllowed = allowedOrigins.includes(origin);
  const isRenderAllowed = origin && /\.onrender\.com$/.test(origin);
  const isVercelAllowed = origin && /\.vercel\.app$/.test(origin);
  const isAllowed = isExplicitlyAllowed || isRenderAllowed || isVercelAllowed;
  
  console.log(`✅ Origin allowed: ${isAllowed} (explicit: ${isExplicitlyAllowed}, render: ${isRenderAllowed}, vercel: ${isVercelAllowed})`);
  
  if (isAllowed) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use(cors(corsOptions));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Simple route
app.get("/", (req, res) => {
  res.send("Quiz API is running...");
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Quiz API is running', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Parse quiz endpoint
app.post("/api/parse-quiz", async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Quiz text is required" });
    }
    
    // Parse the quiz text
    const parsedQuiz = parseQuizText(text);
    
    // Generate a unique code for the quiz
    let code;
    let attempts = 0;
    do {
      code = Quiz.generateCode();
      const existing = await Quiz.findByCode(code);
      if (!existing) break;
      attempts++;
    } while (attempts < 10);
    
    if (attempts >= 10) {
      return res.status(500).json({ message: "Failed to generate unique quiz code" });
    }
    
    // Create and save the quiz
    const quiz = new Quiz({
      code: code,
      questions: parsedQuiz.questions,
      answerKey: parsedQuiz.answerKey,
      metadata: {
        ...parsedQuiz.metadata,
        createdAt: new Date()
      },
      rawText: text
    });
    
    await quiz.save();
    
    // Generate preview
    const preview = generateQuizPreview(parsedQuiz);
    
    res.json({
      success: true,
      message: "Quiz parsed and saved successfully!",
      quiz: {
        id: quiz._id,
        code: quiz.code,
        ...parsedQuiz.metadata
      },
      preview: preview
    });
    
  } catch (error) {
    console.error('Parse quiz error:', error);
    res.status(400).json({ 
      message: error.message || "Failed to parse quiz",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get quiz by ID for editing
app.get("/api/quiz/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    
    res.json({
      success: true,
      quiz: {
        id: quiz._id,
        title: quiz.title,
        code: quiz.code,
        questions: quiz.questions,
        answerKey: Object.fromEntries(quiz.answerKey),
        metadata: quiz.metadata,
        stats: quiz.stats
      }
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ message: "Failed to fetch quiz" });
  }
});

// Update quiz
app.put("/api/quiz/:id", async (req, res) => {
  try {
    const { title, questions, answerKey } = req.body;
    
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    
    // Update fields
    if (title) quiz.title = title;
    if (questions) quiz.questions = questions;
    if (answerKey) quiz.answerKey = new Map(Object.entries(answerKey));
    
    // Update metadata
    if (questions) {
      quiz.metadata.totalQuestions = questions.length;
      quiz.metadata.answerKeyComplete = Object.keys(answerKey || {}).length === questions.length;
    }
    
    await quiz.save();
    
    res.json({
      success: true,
      message: "Quiz updated successfully!",
      quiz: {
        id: quiz._id,
        title: quiz.title,
        code: quiz.code,
        metadata: quiz.metadata
      }
    });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({ message: "Failed to update quiz" });
  }
});

// Get quiz by code (for taking quiz)
app.get("/quiz/:code", async (req, res) => {
  try {
    const quiz = await Quiz.findByCode(req.params.code);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    
    // Increment view count
    quiz.stats.views += 1;
    await quiz.save();
    
    console.log('Quiz found:', quiz.title);
    console.log('Questions count:', quiz.questions.length);
    console.log('First question:', quiz.questions[0]);
    
    res.json({
      success: true,
      quiz: {
        id: quiz._id,
        title: quiz.title,
        code: quiz.code,
        questions: quiz.questions.map(q => ({
          number: q.number,
          question: q.question,
          type: q.type || (q.options && q.options.length > 0 ? 'multiple-choice' : 'identification'),
          options: q.options || [] // Ensure options are included
        })),
        metadata: {
          totalQuestions: quiz.metadata.totalQuestions,
          hasAnswerKey: quiz.metadata.hasAnswerKey
        }
      }
    });
  } catch (error) {
    console.error('Get quiz by code error:', error);
    res.status(500).json({ message: "Failed to fetch quiz" });
  }
});

// Helper function to generate recommendations based on performance
function generateRecommendations(percentage, skipped, total) {
  const recommendations = [];
  
  if (percentage >= 90) {
    recommendations.push("Excellent work! Consider challenging yourself with more advanced topics.");
    recommendations.push("You might enjoy helping others learn this subject.");
  } else if (percentage >= 80) {
    recommendations.push("Great job! Review the questions you missed to reach expert level.");
    recommendations.push("Practice similar topics to strengthen your understanding.");
  } else if (percentage >= 70) {
    recommendations.push("Good effort! Focus on the areas where you made mistakes.");
    recommendations.push("Take time to review the material more thoroughly.");
  } else if (percentage >= 60) {
    recommendations.push("You have some understanding, but there's room for improvement.");
    recommendations.push("Study the material more carefully before retaking.");
  } else {
    recommendations.push("This topic needs more attention and practice.");
    recommendations.push("Consider reviewing all the material and seeking additional help.");
    recommendations.push("Take your time to understand each concept before moving forward.");
  }
  
  if (skipped > 0) {
    recommendations.push(`You skipped ${skipped} question(s). Try to answer all questions next time.`);
  }
  
  if (skipped > total * 0.3) {
    recommendations.push("Consider reviewing the material before taking the quiz to feel more confident.");
  }
  
  return recommendations;
}

// Submit quiz answers
app.post("/quiz/:code/submit", async (req, res) => {
  try {
    const { answers } = req.body;
    
    const quiz = await Quiz.findByCode(req.params.code);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    
    // Increment submission count
    quiz.stats.submissions += 1;
    await quiz.save();
    
    // Calculate score if answer key exists
    let score = null;
    let results = {};
    let analytics = {};
    
    if (quiz.metadata.hasAnswerKey && quiz.answerKey.size > 0) {
      let correct = 0;
      let total = 0;
      let skipped = 0;
      let timePerQuestion = [];
      
      for (const question of quiz.questions) {
        const questionNum = question.number;
        const userAnswer = answers[questionNum];
        const correctAnswer = quiz.answerKey.get(questionNum.toString());
        
        if (correctAnswer) {
          total++;
          let isCorrect = false;
          const wasSkipped = !userAnswer || userAnswer === null || userAnswer.toString().trim() === '';
          
          if (!wasSkipped) {
            // For multiple choice questions (single letter answers)
            if (correctAnswer.length === 1 && /^[A-Z]$/.test(correctAnswer)) {
              isCorrect = userAnswer.toString().toUpperCase() === correctAnswer;
            } 
            // For identification questions (full text answers)
            else {
              // Case-insensitive comparison, trimmed
              isCorrect = userAnswer.toString().toLowerCase().trim() === correctAnswer.toLowerCase().trim();
            }
          }
          
          if (wasSkipped) {
            skipped++;
          } else if (isCorrect) {
            correct++;
          }
          
          results[questionNum] = {
            question: question.question,
            userAnswer: userAnswer,
            correctAnswer: correctAnswer,
            isCorrect: isCorrect,
            wasSkipped: wasSkipped,
            options: question.options
          };
        }
      }
      
      const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
      const incorrect = total - correct - skipped;
      
      score = {
        correct: correct,
        incorrect: incorrect,
        skipped: skipped,
        total: total,
        percentage: percentage
      };
      
      // Calculate detailed analytics
      analytics = {
        accuracyRate: percentage,
        completionRate: Math.round(((total - skipped) / total) * 100),
        difficultyLevel: percentage >= 80 ? 'Easy' : percentage >= 60 ? 'Medium' : 'Hard',
        performanceLevel: percentage >= 90 ? 'Expert' : 
                         percentage >= 80 ? 'Proficient' : 
                         percentage >= 70 ? 'Developing' : 
                         percentage >= 60 ? 'Basic' : 'Needs Work',
        recommendations: generateRecommendations(percentage, skipped, total)
      };
    }
    
    res.json({
      success: true,
      message: "Quiz submitted successfully!",
      score: score,
      results: results,
      analytics: analytics,
      submittedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ message: "Failed to submit quiz" });
  }
});

// Get quiz results endpoint (for sharing/reviewing)
app.get("/quiz/:code/results", async (req, res) => {
  try {
    const quiz = await Quiz.findByCode(req.params.code);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.json({
      success: true,
      quiz: {
        title: quiz.title,
        description: quiz.description,
        code: quiz.code,
        totalQuestions: quiz.metadata.totalQuestions,
        hasAnswerKey: quiz.metadata.hasAnswerKey,
        statistics: {
          views: quiz.stats.views,
          submissions: quiz.stats.submissions,
          createdAt: quiz.createdAt
        }
      }
    });
    
  } catch (error) {
    console.error('Get quiz results error:', error);
    res.status(500).json({ message: "Failed to fetch quiz results" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

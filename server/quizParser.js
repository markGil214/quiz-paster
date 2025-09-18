/**
 * Quiz Text Parser
 * Parses raw quiz text and extracts questions, options, and answer key
 */

function parseQuizText(text) {
  if (!text || !text.trim()) {
    throw new Error('Quiz text is required');
  }

  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const questions = [];
  const answerKey = {};
  
  let currentQuestion = null;
  let parsingAnswerKey = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip separator lines (---, ===, etc.)
    if (/^[-=_\s]+$/.test(line)) {
      continue;
    }
    
    // Check if we're starting the answer key section
    if (/^(answer\s*key|answers?|solution|correct\s*answers?)[\s:]*$/i.test(line)) {
      parsingAnswerKey = true;
      continue;
    }
    
    // Parse answer key entries
    if (parsingAnswerKey) {
      // First try to match single letter answers (for multiple choice): "1. B", "1) B", "1: B"
      const singleLetterMatch = line.match(/^(\d+)[\.\)\:\s]+([A-Za-z])\s*$/);
      if (singleLetterMatch) {
        const questionNum = parseInt(singleLetterMatch[1]);
        const answer = singleLetterMatch[2].toUpperCase();
        answerKey[questionNum] = answer;
        continue;
      }
      
      // Then try to match full text answers (for identification): "1. Alexander Graham Bell", "2) Tokyo"
      const fullTextMatch = line.match(/^(\d+)[\.\)\:\s]+(.+)$/);
      if (fullTextMatch) {
        const questionNum = parseInt(fullTextMatch[1]);
        const answer = fullTextMatch[2].trim();
        answerKey[questionNum] = answer;
        continue;
      }
      continue;
    }
    
    // Parse question line (e.g., "1. What is...?", "2) How many...?")
    const questionMatch = line.match(/^(\d+)[\.\)\:\s]+(.+)$/);
    if (questionMatch) {
      // Save previous question if exists
      if (currentQuestion) {
        questions.push(currentQuestion);
      }
      
      const questionNumber = parseInt(questionMatch[1]);
      const questionText = questionMatch[2].trim();
      
      currentQuestion = {
        number: questionNumber,
        question: questionText,
        options: []
      };
      continue;
    }
    
    // Parse option lines (e.g., "A) Paris", "B. London", "C: Berlin")
    const optionMatch = line.match(/^([A-Za-z])[\.\)\:\s]+(.+)$/);
    if (optionMatch && currentQuestion) {
      const optionLetter = optionMatch[1].toUpperCase();
      const optionText = optionMatch[2].trim();
      
      currentQuestion.options.push({
        letter: optionLetter,
        text: optionText
      });
      continue;
    }
    
    // If line doesn't match any pattern but we have a current question,
    // it might be a continuation of the question text
    if (currentQuestion && !optionMatch && !questionMatch) {
      currentQuestion.question += ' ' + line;
    }
  }
  
  // Don't forget the last question
  if (currentQuestion) {
    questions.push(currentQuestion);
  }
  
  // Validate the parsed quiz
  if (questions.length === 0) {
    throw new Error('No questions found in the quiz text');
  }
  
  // Determine question types and validate accordingly
  for (const q of questions) {
    if (q.options.length === 0) {
      // This is an identification/short answer question
      q.type = 'identification';
    } else if (q.options.length >= 2) {
      // This is a multiple choice question
      q.type = 'multiple-choice';
    } else {
      throw new Error(`Question ${q.number} has only 1 option. Multiple choice questions need at least 2 options.`);
    }
  }
  
  return {
    questions,
    answerKey,
    metadata: {
      totalQuestions: questions.length,
      hasAnswerKey: Object.keys(answerKey).length > 0,
      answerKeyComplete: Object.keys(answerKey).length === questions.length
    }
  };
}

function generateQuizPreview(parsedQuiz) {
  const { questions, answerKey, metadata } = parsedQuiz;
  
  let preview = `📝 Quiz Preview:\n`;
  preview += `• ${metadata.totalQuestions} questions found\n`;
  preview += `• Answer key: ${metadata.hasAnswerKey ? 'Found' : 'Missing'}\n`;
  preview += `• Complete: ${metadata.answerKeyComplete ? 'Yes' : 'Partial'}\n\n`;
  
  // Show first 2 questions as preview
  for (let i = 0; i < Math.min(2, questions.length); i++) {
    const q = questions[i];
    preview += `${q.number}. ${q.question}\n`;
    
    for (const option of q.options) {
      const isCorrect = answerKey[q.number] === option.letter;
      preview += `   ${option.letter}) ${option.text}${isCorrect ? ' ✓' : ''}\n`;
    }
    preview += '\n';
  }
  
  if (questions.length > 2) {
    preview += `... and ${questions.length - 2} more questions\n`;
  }
  
  return preview;
}

module.exports = {
  parseQuizText,
  generateQuizPreview
};

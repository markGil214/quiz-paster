// Test script for quiz submission API
const axios = require('axios');

async function testQuizSubmissionAPI() {
  try {
    console.log('🧪 Testing Quiz Submission API...\n');

    // First, let's create a sample quiz
    const sampleQuizText = `
What is the capital of France?
A) London
B) Paris
C) Berlin
D) Madrid

Answer: B

What is 2 + 2?
A) 3
B) 4
C) 5
D) 6

Answer: B
    `.trim();

    console.log('1️⃣ Creating a test quiz...');
    const createResponse = await axios.post('http://localhost:5000/api/parse-quiz', {
      text: sampleQuizText,
      title: 'Test Quiz for API',
      description: 'Testing submission functionality'
    });

    if (!createResponse.data.success) {
      throw new Error('Failed to create test quiz');
    }

    const quizCode = createResponse.data.quiz.code;
    console.log(`✅ Quiz created with code: ${quizCode}`);

    // Get the quiz to see its structure
    console.log('\n2️⃣ Fetching quiz details...');
    const getResponse = await axios.get(`http://localhost:5000/quiz/${quizCode}`);
    const quiz = getResponse.data.quiz;
    console.log(`✅ Quiz fetched: "${quiz.title}" with ${quiz.questions.length} questions`);

    // Submit answers
    console.log('\n3️⃣ Submitting quiz answers...');
    const answers = {
      1: 'B', // Correct answer for Paris
      2: 'A'  // Incorrect answer for 2+2 (should be B)
    };

    const submitResponse = await axios.post(`http://localhost:5000/quiz/${quizCode}/submit`, {
      answers: answers
    });

    console.log('✅ Quiz submission response:');
    console.log(`   Success: ${submitResponse.data.success}`);
    console.log(`   Message: ${submitResponse.data.message}`);
    
    if (submitResponse.data.score) {
      console.log(`   Score: ${submitResponse.data.score.correct}/${submitResponse.data.score.total} (${submitResponse.data.score.percentage}%)`);
    }

    // Display detailed results
    if (submitResponse.data.results) {
      console.log('\n📊 Detailed Results:');
      Object.entries(submitResponse.data.results).forEach(([questionNum, result]) => {
        const status = result.isCorrect ? '✅' : '❌';
        console.log(`   Q${questionNum}: ${status} ${result.isCorrect ? 'Correct' : `Incorrect (${result.userAnswer} vs ${result.correctAnswer})`}`);
      });
    }

    console.log('\n🎉 Quiz Submission API Test Completed Successfully!');

  } catch (error) {
    console.error('❌ Test failed:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Error Data:', error.response?.data);
    console.error('Error Message:', error.message);
    if (error.code) {
      console.error('Error Code:', error.code);
    }
  }
}

// Run the test
testQuizSubmissionAPI();

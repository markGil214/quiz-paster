// Simple test for quiz submission API
const axios = require('axios');

async function simpleTest() {
  try {
    console.log('Testing health endpoint...');
    const health = await axios.get('http://localhost:5000/api/health');
    console.log('Health check:', health.data);
    
    console.log('\nTesting quiz creation...');
    const quizData = {
      text: `What is 1+1?
A) 1
B) 2
C) 3
D) 4

Answer: B`,
      title: 'Simple Test Quiz',
      description: 'Testing API'
    };
    
    const createResponse = await axios.post('http://localhost:5000/api/parse-quiz', quizData);
    console.log('Quiz created:', createResponse.data.success);
    console.log('Quiz code:', createResponse.data.quiz?.code);
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

simpleTest();

// Test API Configuration
// Run this file to test your API setup

import { createQuiz } from './src/services/api.js';

const testData = {
  text: `1. What is 2+2?
A) 3
B) 4
C) 5
D) 6

Answer Key:
1. B`
};

console.log('🧪 Testing API Configuration...');

createQuiz(testData)
  .then(response => {
    console.log('✅ API Test Successful!');
    console.log('Response:', response.data);
  })
  .catch(error => {
    console.error('❌ API Test Failed!');
    console.error('Error:', error.message);
    console.error('Full Error:', error);
  });

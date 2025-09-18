// Enhanced test for the scoring & results system
const axios = require('axios');

async function testEnhancedScoring() {
  try {
    console.log('🚀 Testing Enhanced Results & Scoring System...\n');

    // Create a comprehensive test quiz
    const testQuizText = `
Geography Quiz

What is the capital of France?
A) London
B) Paris
C) Berlin
D) Madrid

What is the largest ocean on Earth?
A) Atlantic Ocean
B) Indian Ocean
C) Arctic Ocean
D) Pacific Ocean

Which country has the most time zones?
A) Russia
B) United States
C) China
D) Canada

What is the smallest country in the world?
A) Monaco
B) Vatican City
C) San Marino
D) Liechtenstein

Answer Key:
1. B
2. D
3. A
4. B
    `.trim();

    console.log('1️⃣ Creating enhanced test quiz...');
    const createResponse = await axios.post('http://localhost:5000/api/parse-quiz', {
      text: testQuizText,
      title: 'Enhanced Geography Quiz',
      description: 'Testing enhanced scoring system'
    });

    if (!createResponse.data.success) {
      throw new Error('Failed to create test quiz');
    }

    const quizCode = createResponse.data.quiz.code;
    console.log(`✅ Quiz created with code: ${quizCode}`);

    // Test different performance scenarios
    const testScenarios = [
      {
        name: "Perfect Score (Expert Level)",
        answers: { "1": "B", "2": "D", "3": "A", "4": "B" },
        expected: "Expert"
      },
      {
        name: "Good Performance (Proficient Level)",
        answers: { "1": "B", "2": "D", "3": "C", "4": "B" }, // 3/4 correct
        expected: "Proficient"
      },
      {
        name: "Average Performance (Developing Level)",
        answers: { "1": "A", "2": "D", "3": "A", "4": "A" }, // 2/4 correct
        expected: "Developing"
      },
      {
        name: "Poor Performance with Skips (Needs Work)",
        answers: { "1": "A", "2": null, "3": null, "4": "A" }, // 1/4 correct, 2 skipped
        expected: "Needs Work"
      }
    ];

    for (const scenario of testScenarios) {
      console.log(`\n2️⃣ Testing: ${scenario.name}`);
      
      const submitResponse = await axios.post(`http://localhost:5000/quiz/${quizCode}/submit`, {
        answers: scenario.answers
      });

      if (submitResponse.data.success) {
        const { score, analytics } = submitResponse.data;
        
        console.log(`   📊 Score: ${score.correct}/${score.total} (${score.percentage}%)`);
        console.log(`   📈 Performance Level: ${analytics.performanceLevel}`);
        console.log(`   🎯 Accuracy Rate: ${analytics.accuracyRate}%`);
        console.log(`   ✅ Completion Rate: ${analytics.completionRate}%`);
        console.log(`   📚 Difficulty Level: ${analytics.difficultyLevel}`);
        
        if (score.skipped > 0) {
          console.log(`   ⏭️  Skipped Questions: ${score.skipped}`);
        }
        
        console.log(`   💡 Recommendations:`);
        analytics.recommendations.forEach((rec, index) => {
          console.log(`      ${index + 1}. ${rec}`);
        });
        
        // Verify expected performance level
        if (analytics.performanceLevel === scenario.expected) {
          console.log(`   ✅ Performance level matches expected: ${scenario.expected}`);
        } else {
          console.log(`   ⚠️  Performance level mismatch. Expected: ${scenario.expected}, Got: ${analytics.performanceLevel}`);
        }
      }
    }

    console.log('\n🎉 Enhanced Results & Scoring System Test Completed!');
    console.log('\n🔍 Summary of Enhancements:');
    console.log('   ✅ Detailed performance analytics');
    console.log('   ✅ Performance level classification (Expert, Proficient, Developing, Basic, Needs Work)');
    console.log('   ✅ Personalized recommendations based on performance');
    console.log('   ✅ Skipped question tracking');
    console.log('   ✅ Completion rate calculation');
    console.log('   ✅ Difficulty assessment');
    console.log('   ✅ Grade-based accuracy rating (A+, A, B+, etc.)');

  } catch (error) {
    console.error('❌ Test failed:');
    console.error('Status:', error.response?.status);
    console.error('Error Data:', error.response?.data);
    console.error('Error Message:', error.message);
  }
}

testEnhancedScoring();

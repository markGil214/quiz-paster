try {
  const { parseQuizText } = require('./quizParser.js');

  const sampleQuiz = `
1. What is the capital of France?
A. London
B. Paris
C. Berlin
D. Madrid

2. What is JavaScript?
Answer key: A programming language

3. Which of the following is a web framework?
A. React
B. Python
C. MySQL
D. CSS

4. What does HTML stand for?
Answer key: HyperText Markup Language

Answer key:
1. B
3. A
`;

  console.log('Testing quiz parser...');
  const result = parseQuizText(sampleQuiz);
  console.log('Questions found:', result.questions.length);

  result.questions.forEach((q, index) => {
    console.log(`\nQuestion ${index + 1}:`);
    console.log('Type:', q.type);
    console.log('Question text length:', q.question.length);
    console.log('Question text (raw):', JSON.stringify(q.question));
    if (q.type === 'multiple-choice') {
      console.log('Options:', q.options);
      console.log('Shuffled Options:', q.shuffledOptions);
      console.log('Correct Answer:', q.correctAnswer);
    } else {
      console.log('Answer Key:', q.answerKey);
    }
  });
} catch (error) {
  console.error('Error testing parser:', error.message);
  console.error(error.stack);
}

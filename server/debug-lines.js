const text = `
2. What is JavaScript?
Answer key: A programming language
`;

const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
console.log('Lines:', lines);

lines.forEach((line, i) => {
  console.log(`Line ${i}: "${line}"`);
  
  const questionMatch = line.match(/^(\d+)[\.\)\:\s]+(.+)$/);
  if (questionMatch) {
    console.log(`  -> Question match: number=${questionMatch[1]}, text="${questionMatch[2]}"`);
  }
  
  const answerKeyLine = /^Answer\s+key:\s*(.+)$/i.test(line);
  if (answerKeyLine) {
    console.log(`  -> Answer key line: "${line}"`);
  }
});

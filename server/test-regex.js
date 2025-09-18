const testString = "What is JavaScript? Answer key: A programming language";
const regex = /^(.+?)\s+Answer\s+key:\s*(.+)$/i;
const match = testString.match(regex);

console.log('Test string:', testString);
console.log('Regex match:', match);

if (match) {
  console.log('Question part:', match[1]);
  console.log('Answer part:', match[2]);
} else {
  console.log('No match found');
}

// Test variations
const variations = [
  "What is JavaScript? Answer key: A programming language",
  "What is JavaScript?Answer key: A programming language", 
  "What is JavaScript? answer key: A programming language",
  "What is JavaScript? ANSWER KEY: A programming language"
];

variations.forEach((test, i) => {
  const match = test.match(regex);
  console.log(`\nVariation ${i + 1}: "${test}"`);
  console.log('Match:', match ? 'YES' : 'NO');
  if (match) {
    console.log('Question:', match[1]);
    console.log('Answer:', match[2]);
  }
});

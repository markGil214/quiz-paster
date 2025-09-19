// Temporary CORS Bypass for Development/Testing
// Use this in your browser console to test API calls directly

// Method 1: Test API call with fetch (paste in browser console)
fetch('https://quiz-backend-yjv7.onrender.com/api/parse-quiz', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: `1. What is 2+2?
A) 3
B) 4
C) 5
D) 6

Answer Key:
1. B`
  })
})
.then(response => {
  console.log('Response status:', response.status);
  console.log('Response headers:', [...response.headers.entries()]);
  return response.json();
})
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));

// Method 2: Check CORS headers directly
fetch('https://quiz-backend-yjv7.onrender.com/api/parse-quiz', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://quiz-paster13.vercel.app',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'Content-Type'
  }
})
.then(response => {
  console.log('CORS Preflight Status:', response.status);
  console.log('CORS Headers:', [...response.headers.entries()]);
})
.catch(error => console.error('CORS Error:', error));

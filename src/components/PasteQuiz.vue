<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-4 sm:py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6">
      <div class="card">
        <div class="text-center mb-6 sm:mb-8">
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">🎯 Create New Quiz</h1>
          <p class="text-gray-600 text-sm sm:text-base">Paste your quiz text below and we'll parse it into questions and answers.</p>
        </div>
        
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label for="quizText" class="block text-sm font-medium text-gray-700 mb-3">
              📝 Quiz Text
            </label>
            <textarea
              id="quizText"
              v-model="quizText"
              class="w-full h-80 sm:h-96 p-4 sm:p-5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm sm:text-base bg-white transition-all duration-200"
              placeholder="Paste your quiz here...

Example format:
1. What is the capital of France?
A) London
B) Paris
C) Berlin
D) Madrid

2. What is 2 + 2?
A) 3
B) 4
C) 5
D) 6

Answer Key:
1. B
2. B"
              required
            ></textarea>
          </div>
          
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div class="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
              📊 {{ quizText.length }} characters
              <span v-if="quizText.length > 0" class="ml-2">
                • {{ quizText.split('\n').length }} lines
              </span>
            </div>
            <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                @click="clearText"
                class="btn btn-secondary w-full sm:w-auto order-2 sm:order-1"
              >
                🗑️ Clear
              </button>
              <button
                type="submit"
                :disabled="!quizText.trim() || isLoading"
                class="btn w-full sm:w-auto font-bold text-base sm:text-lg py-3 sm:py-4 order-1 sm:order-2"
              >
                {{ isLoading ? '⏳ Parsing...' : '🚀 Parse Quiz' }}
              </button>
            </div>
          </div>
        </form>
        
        <!-- Success/Error Messages -->
        <div v-if="message" class="mt-6 p-4 sm:p-6 rounded-xl whitespace-pre-line font-mono text-xs sm:text-sm border-2" :class="messageClass">
          {{ message }}
        </div>
      </div>
      
      <!-- Help Section -->
      <div class="card mt-4 sm:mt-6">
        <h2 class="text-lg sm:text-xl font-semibold text-gray-900 mb-4">💡 Quiz Format Guide</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div class="space-y-3">
            <h3 class="font-medium text-gray-800">📋 Multiple Choice Format:</h3>
            <div class="bg-gray-50 p-3 rounded-lg text-xs sm:text-sm font-mono">
              <div>1. Question text?</div>
              <div>A) Option 1</div>
              <div>B) Option 2</div>
              <div>C) Option 3</div>
              <div class="mt-2 text-blue-600">Answer Key:</div>
              <div class="text-blue-600">1. B</div>
            </div>
          </div>
          <div class="space-y-3">
            <h3 class="font-medium text-gray-800">✏️ Identification Format:</h3>
            <div class="bg-gray-50 p-3 rounded-lg text-xs sm:text-sm font-mono">
              <div>1. Question without options?</div>
              <div class="mt-2 text-green-600">Answer Key:</div>
              <div class="text-green-600">1. Correct Answer</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createQuiz } from '../services/api.js'

const router = useRouter()
const quizText = ref('')
const isLoading = ref(false)
const message = ref('')
const messageClass = ref('')

const handleSubmit = async () => {
  if (!quizText.value.trim()) return
  
  isLoading.value = true
  message.value = ''
  
  try {
    const response = await createQuiz({ text: quizText.value })
    const { quiz, preview } = response.data
    
    message.value = `✅ Quiz parsed successfully!\n\n` +
                   `📋 Quiz Code: ${quiz.code}\n` +
                   `📝 Questions: ${quiz.totalQuestions}\n` +
                   `🔑 Answer Key: ${quiz.hasAnswerKey ? 'Found' : 'Missing'}\n\n` +
                   `${preview}\n\n` +
                   `🔄 Redirecting to overview page...`
    
    messageClass.value = 'bg-green-100 text-green-800 border border-green-200'
    
    // Navigate to overview page after 2 seconds
    setTimeout(() => {
      router.push(`/quiz/${quiz.id}`)
    }, 2000)
    
  } catch (error) {
    message.value = error.response?.data?.message || 'Failed to parse quiz. Please try again.'
    messageClass.value = 'bg-red-100 text-red-800 border border-red-200'
  } finally {
    isLoading.value = false
  }
}

const clearText = () => {
  quizText.value = ''
  message.value = ''
}
</script>

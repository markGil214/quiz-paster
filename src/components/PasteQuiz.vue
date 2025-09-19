<template>
  <div class="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 py-4 sm:py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6">
      <div class="card bg-white/95 backdrop-blur-xl border-2 border-white/20 shadow-2xl">
        <div class="text-center mb-6 sm:mb-8">
          <h1 class="text-3xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tight">
            🎯 <span class="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Create Quiz</span>
          </h1>
          <p class="text-gray-700 text-base sm:text-lg font-medium">Transform your text into an interactive quiz experience</p>
        </div>
        
        <form @submit.prevent="handleSubmit" class="space-y-8">
          <div>
            <label for="quizText" class="block text-lg font-bold text-gray-800 mb-4 flex items-center">
              📝 <span class="ml-2">Quiz Content</span>
            </label>
            <textarea
              id="quizText"
              v-model="quizText"
              class="w-full h-80 sm:h-96 p-6 text-base border-3 border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 bg-white/90 backdrop-blur-sm font-mono leading-relaxed shadow-lg transition-all duration-300 placeholder-gray-500"
              placeholder="📋 Paste your quiz here...

✨ Example format:
1. What is the capital of France?
A) London
B) Paris ✓
C) Berlin
D) Madrid

2. What is 2 + 2?
A) 3
B) 4 ✓
C) 5
D) 6

🔑 Answer Key:
1. B
2. B"
              required
            ></textarea>
          </div>
          
          <div class="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-2xl border-2 border-purple-100">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div class="text-sm sm:text-base text-gray-700 font-semibold text-center sm:text-left">
                📊 <span class="text-purple-600">{{ quizText.length }}</span> characters
                <span v-if="quizText.length > 0" class="ml-3 text-blue-600">
                  📄 {{ quizText.split('\n').length }} lines
                </span>
              </div>
              <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  type="button"
                  @click="clearText"
                  class="btn bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 border-2 border-gray-400"
                >
                  🗑️ Clear Text
                </button>
                <button
                  type="submit"
                  :disabled="!quizText.trim() || isLoading"
                  class="btn bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold text-lg py-4 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 border-2 border-purple-400 disabled:border-gray-300"
                >
                  {{ isLoading ? '⏳ Creating Quiz...' : '🚀 Create Quiz' }}
                </button>
              </div>
            </div>
          </div>
        </form>
        
        <!-- Success/Error Messages -->
        <div v-if="message" class="mt-8 p-6 rounded-2xl whitespace-pre-line font-mono text-sm sm:text-base border-3 shadow-lg" :class="messageClass">
          {{ message }}
        </div>
      </div>
      
      <!-- Enhanced Help Section -->
      <div class="card bg-white/90 backdrop-blur-xl border-2 border-white/20 shadow-xl mt-6">
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
          💡 <span class="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Format Guide</span>
        </h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="space-y-4">
            <h3 class="text-lg font-bold text-green-700 flex items-center">
              📋 Multiple Choice Questions
            </h3>
            <div class="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl text-sm sm:text-base font-mono border-2 border-green-200 shadow-inner">
              <div class="text-green-800 font-semibold">1. What is the capital of France?</div>
              <div class="text-green-700 ml-2">A) London</div>
              <div class="text-green-700 ml-2 font-bold">B) Paris ✓</div>
              <div class="text-green-700 ml-2">C) Berlin</div>
              <div class="text-green-700 ml-2">D) Madrid</div>
              <div class="mt-3 text-blue-700 font-bold">🔑 Answer Key:</div>
              <div class="text-blue-700 font-bold ml-2">1. B</div>
            </div>
          </div>
          <div class="space-y-4">
            <h3 class="text-lg font-bold text-blue-700 flex items-center">
              ✏️ Identification Questions
            </h3>
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl text-sm sm:text-base font-mono border-2 border-blue-200 shadow-inner">
              <div class="text-blue-800 font-semibold">1. Who invented the telephone?</div>
              <div class="mt-3 text-purple-700 font-bold">🔑 Answer Key:</div>
              <div class="text-purple-700 font-bold ml-2">1. Alexander Graham Bell</div>
            </div>
          </div>
        </div>
        
        <!-- Tips Section -->
        <div class="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border-2 border-yellow-200">
          <h3 class="text-lg font-bold text-orange-700 mb-3 flex items-center">
            ⚡ Pro Tips
          </h3>
          <ul class="space-y-2 text-orange-800 font-medium">
            <li class="flex items-start">
              <span class="text-orange-500 mr-2">•</span>
              <span>Number your questions (1., 2., 3...)</span>
            </li>
            <li class="flex items-start">
              <span class="text-orange-500 mr-2">•</span>
              <span>Use letters for options (A), B), C:, etc.)</span>
            </li>
            <li class="flex items-start">
              <span class="text-orange-500 mr-2">•</span>
              <span>Include "Answer Key:" section at the end</span>
            </li>
            <li class="flex items-start">
              <span class="text-orange-500 mr-2">•</span>
              <span>Mix multiple choice and identification questions freely</span>
            </li>
          </ul>
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

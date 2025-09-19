<template>
  <div class="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 py-4 sm:py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6">
      <!-- Loading State -->
      <div v-if="loading" class="card bg-white/95 backdrop-blur-xl border-2 border-white/20 shadow-2xl text-center">
        <div class="loading-spinner mx-auto mb-6 border-4 border-purple-200 border-t-purple-600"></div>
        <p class="text-gray-700 text-lg font-medium">Loading your quiz...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border-3 border-red-300 rounded-2xl p-6 shadow-xl">
        <h2 class="text-2xl font-bold text-red-800 mb-3 flex items-center">
          🚫 Quiz Not Found
        </h2>
        <p class="text-red-700 mb-6 text-lg">{{ error }}</p>
        <button 
          @click="$router.push('/')"
          class="btn bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          ➕ Create New Quiz
        </button>
      </div>

      <!-- Quiz Header -->
      <div v-else-if="quiz" class="card bg-white/95 backdrop-blur-xl border-2 border-white/20 shadow-2xl mb-6">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div class="text-center sm:text-left">
            <h1 class="text-2xl sm:text-3xl font-black text-gray-900 mb-2 tracking-tight">
              🎯 <span class="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{{ quiz.title || 'Quiz Challenge' }}</span>
            </h1>
            <p class="text-gray-700 text-lg font-semibold">📝 {{ quiz.metadata.totalQuestions }} Questions Total</p>
          </div>
          <div class="text-center sm:text-right bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-3 rounded-xl border-2 border-purple-200">
            <div class="text-sm text-purple-700 font-medium">Quiz Code</div>
            <div class="text-2xl font-black text-purple-800">{{ quiz.code }}</div>
          </div>
        </div>
        
        <!-- Enhanced Progress Bar -->
        <div class="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 p-5 rounded-xl border-2 border-purple-100">
          <div class="flex justify-between text-base font-bold text-gray-800 mb-3">
            <span>📍 Question {{ currentQuestionIndex + 1 }} of {{ quiz.questions.length }}</span>
            <span class="text-purple-600">{{ Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100) }}% Complete</span>
          </div>
          <div class="progress-bar h-4 bg-purple-200 rounded-full overflow-hidden shadow-inner">
            <div 
              class="progress-fill h-full bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 rounded-full shadow-lg transition-all duration-500 ease-out"
              :style="{ width: ((currentQuestionIndex + 1) / quiz.questions.length) * 100 + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Quiz Questions -->
      <div v-if="quiz && !quizCompleted" class="card bg-white/95 backdrop-blur-xl border-2 border-white/20 shadow-2xl">
        <div v-if="currentQuestion" class="space-y-8">
          <!-- Question -->
          <div class="text-center sm:text-left bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border-2 border-indigo-200">
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900 leading-relaxed">
              <span class="text-3xl text-purple-600 font-black">{{ currentQuestion.number }}.</span>
              <span class="ml-3">{{ currentQuestion.question }}</span>
            </h2>
          </div>

          <!-- Answer Options -->
          <div class="space-y-4">
            <!-- Multiple Choice Questions -->
            <div v-if="currentQuestion.type === 'multiple-choice' || currentQuestion.options.length > 0" class="space-y-4">
              <label
                v-for="option in currentQuestion.options"
                :key="option.letter"
                class="flex items-start p-5 sm:p-6 border-3 rounded-2xl cursor-pointer transition-all duration-300 touch-feedback hover:shadow-xl group"
                :class="{
                  'border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg transform scale-105': selectedAnswers[currentQuestion.number] === option.letter,
                  'border-purple-200 bg-white hover:border-purple-400 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:transform hover:scale-102': selectedAnswers[currentQuestion.number] !== option.letter
                }"
              >
                <input
                  type="radio"
                  :name="`question-${currentQuestion.number}`"
                  :value="option.letter"
                  v-model="selectedAnswers[currentQuestion.number]"
                  class="mt-2 w-6 h-6 text-purple-600 border-3 border-purple-300 focus:ring-4 focus:ring-purple-200 rounded-full"
                />
                <span class="ml-4 text-gray-900 text-base sm:text-lg leading-relaxed font-medium">
                  <strong class="text-purple-600 text-xl font-black">{{ option.letter }})</strong> 
                  <span class="ml-2">{{ option.text }}</span>
                </span>
              </label>
            </div>
            
            <!-- Identification/Short Answer Questions -->
            <div v-else-if="currentQuestion.type === 'identification' || currentQuestion.options.length === 0" class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-200">
              <div class="space-y-4">
                <label class="block text-lg font-bold text-blue-800 flex items-center">
                  ✏️ <span class="ml-2">Your Answer:</span>
                </label>
                <input
                  type="text"
                  v-model="selectedAnswers[currentQuestion.number]"
                  placeholder="Type your answer here..."
                  class="w-full px-6 py-4 text-lg border-3 border-blue-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 bg-white shadow-inner font-medium"
                />
                <p class="text-sm text-blue-700 font-medium flex items-center">
                  💡 <span class="ml-2">Enter your answer for this identification question.</span>
                </p>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-2xl border-2 border-gray-200">
            <div class="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0">
              <button
                @click="previousQuestion"
                :disabled="currentQuestionIndex === 0"
                class="btn bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 order-2 sm:order-1"
              >
                ← Previous
              </button>

              <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 order-1 sm:order-2">
                <!-- Skip Button -->
                <button
                  v-if="currentQuestionIndex < quiz.questions.length - 1"
                  @click="nextQuestion"
                  class="btn bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  ⏭️ Skip
                </button>

                <!-- Next Button -->
                <button
                  v-if="currentQuestionIndex < quiz.questions.length - 1"
                  @click="nextQuestion"
                  :disabled="!selectedAnswers[currentQuestion.number]"
                  class="btn bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Next →
                </button>

                <!-- Submit Button -->
                <button
                  v-else
                  @click="handleSubmitQuiz"
                  :disabled="submitting"
                  class="btn bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-black text-lg py-4 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 border-2 border-green-400"
                >
                  {{ submitting ? '⏳ Submitting...' : '🎯 Submit Quiz' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quiz Completed -->
      <div v-if="quizCompleted" class="card bg-gradient-to-r from-green-50 to-emerald-50 border-3 border-green-300 shadow-2xl text-center">
        <div class="mb-8">
          <div class="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 class="text-3xl font-black text-gray-900 mb-4">🎉 Quiz Completed!</h2>
          <p class="text-gray-700 text-lg font-medium">Your answers have been recorded successfully.</p>
        </div>
        
        <button
          @click="viewResults"
          class="btn bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-black text-xl py-5 px-10 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          📊 View Results
        </button>
      </div>

      <!-- Answer Summary -->
      <div v-if="quizCompleted" class="card bg-white/95 backdrop-blur-xl border-2 border-white/20 shadow-xl mt-6">
        <h3 class="text-xl font-bold text-gray-900 mb-6 text-center sm:text-left flex items-center justify-center sm:justify-start">
          📝 <span class="ml-2">Your Answers Summary</span>
        </h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div
            v-for="question in quiz.questions"
            :key="question.number"
            class="p-4 border-2 rounded-xl text-center transition-all duration-200 hover:shadow-lg"
            :class="{
              'border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 text-green-800': selectedAnswers[question.number],
              'border-gray-300 bg-gradient-to-r from-gray-50 to-slate-50 text-gray-600': !selectedAnswers[question.number]
            }"
          >
            <div class="text-sm font-bold mb-1">
              Q{{ question.number }}
            </div>
            <div class="text-xs font-medium truncate">
              {{ selectedAnswers[question.number] || 'Skipped' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getQuiz, submitQuiz } from '../services/api.js'

const route = useRoute()
const router = useRouter()

const quiz = ref(null)
const loading = ref(true)
const error = ref('')
const currentQuestionIndex = ref(0)
const selectedAnswers = ref({})
const submitting = ref(false)

const currentQuestion = computed(() => {
  if (!quiz.value || !quiz.value.questions) return null
  return quiz.value.questions[currentQuestionIndex.value]
})

onMounted(async () => {
  await loadQuiz()
})

const loadQuiz = async () => {
  try {
    loading.value = true
    const response = await getQuiz(route.params.code)
    quiz.value = response.data.quiz
    error.value = ''
  } catch (err) {
    error.value = err.response?.data?.message || 'Quiz not found'
  } finally {
    loading.value = false
  }
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < quiz.value.questions.length - 1) {
    currentQuestionIndex.value++
  }
}

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

const handleSubmitQuiz = async () => {
  try {
    submitting.value = true
    
    // Prepare answers for submission
    const answers = {}
    for (const question of quiz.value.questions) {
      answers[question.number] = selectedAnswers.value[question.number] || null
    }
    
    const response = await submitQuiz(quiz.value.code, { answers })
    
    // Store results for results page
    localStorage.setItem('quizResults', JSON.stringify({
      quizCode: quiz.value.code,
      score: response.data.score,
      results: response.data.results,
      analytics: response.data.analytics,
      submittedAt: response.data.submittedAt
    }))
    
    // Navigate to results page
    router.push(`/results/${quiz.value.code}`)
    
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to submit quiz')
  } finally {
    submitting.value = false
  }
}

const viewResults = () => {
  router.push(`/results/${quiz.value.code}`)
}
</script>

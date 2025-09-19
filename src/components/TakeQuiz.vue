<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-4 sm:py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6">
      <!-- Loading State -->
      <div v-if="loading" class="card text-center">
        <div class="loading-spinner mx-auto mb-4"></div>
        <p class="text-gray-600">Loading quiz...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border-2 border-red-200 rounded-xl p-4 sm:p-6">
        <h2 class="text-xl font-bold text-red-800 mb-2">Quiz Not Found</h2>
        <p class="text-red-700 mb-4">{{ error }}</p>
        <button 
          @click="$router.push('/')"
          class="btn btn-danger w-full sm:w-auto"
        >
          Create New Quiz
        </button>
      </div>

      <!-- Quiz Header -->
      <div v-else-if="quiz" class="card mb-4 sm:mb-6">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
          <div class="text-center sm:text-left">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">{{ quiz.title }}</h1>
            <p class="text-gray-600 text-sm sm:text-base">{{ quiz.metadata.totalQuestions }} Questions</p>
          </div>
          <div class="text-xs sm:text-sm text-gray-500 text-center sm:text-right">
            Quiz Code: <strong class="text-lg sm:text-base">{{ quiz.code }}</strong>
          </div>
        </div>
        
        <!-- Progress Bar -->
        <div class="mt-4 sm:mt-6">
          <div class="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
            <span>Question {{ currentQuestionIndex + 1 }} of {{ quiz.questions.length }}</span>
            <span class="font-medium">{{ Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100) }}%</span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill"
              :style="{ width: ((currentQuestionIndex + 1) / quiz.questions.length) * 100 + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Quiz Questions -->
      <div v-if="quiz && !quizCompleted" class="card">
        <div v-if="currentQuestion" class="space-y-6">
          <!-- Question -->
          <div class="text-center sm:text-left">
            <h2 class="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 leading-relaxed">
              {{ currentQuestion.number }}. {{ currentQuestion.question }}
            </h2>
          </div>

          <!-- Answer Options -->
          <div class="space-y-3 sm:space-y-4">
            <!-- Multiple Choice Questions -->
            <div v-if="currentQuestion.type === 'multiple-choice' || currentQuestion.options.length > 0">
              <label
                v-for="option in currentQuestion.options"
                :key="option.letter"
                class="flex items-start p-4 sm:p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 touch-feedback hover:shadow-md"
                :class="{
                  'border-blue-500 bg-blue-50 shadow-md': selectedAnswers[currentQuestion.number] === option.letter,
                  'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50': selectedAnswers[currentQuestion.number] !== option.letter
                }"
              >
                <input
                  type="radio"
                  :name="`question-${currentQuestion.number}`"
                  :value="option.letter"
                  v-model="selectedAnswers[currentQuestion.number]"
                  class="mt-1 w-5 h-5 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <span class="ml-3 sm:ml-4 text-gray-900 text-sm sm:text-base leading-relaxed">
                  <strong class="text-blue-600 text-base sm:text-lg">{{ option.letter }})</strong> {{ option.text }}
                </span>
              </label>
            </div>
            
            <!-- Identification/Short Answer Questions -->
            <div v-else-if="currentQuestion.type === 'identification' || currentQuestion.options.length === 0">
              <div class="space-y-3">
                <label class="block text-sm font-medium text-gray-700">
                  Your Answer:
                </label>
                <input
                  type="text"
                  v-model="selectedAnswers[currentQuestion.number]"
                  placeholder="Type your answer here..."
                  class="w-full px-4 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                />
                <p class="text-xs sm:text-sm text-gray-500">
                  💡 Enter your answer for this identification question.
                </p>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="flex flex-col sm:flex-row justify-between pt-6 border-t-2 border-gray-100 space-y-3 sm:space-y-0">
            <button
              @click="previousQuestion"
              :disabled="currentQuestionIndex === 0"
              class="btn btn-secondary order-2 sm:order-1 w-full sm:w-auto"
            >
              ← Previous
            </button>

            <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 order-1 sm:order-2">
              <!-- Skip Button -->
              <button
                v-if="currentQuestionIndex < quiz.questions.length - 1"
                @click="nextQuestion"
                class="btn btn-warning w-full sm:w-auto"
              >
                Skip →
              </button>

              <!-- Next Button -->
              <button
                v-if="currentQuestionIndex < quiz.questions.length - 1"
                @click="nextQuestion"
                :disabled="!selectedAnswers[currentQuestion.number]"
                class="btn w-full sm:w-auto"
              >
                Next →
              </button>

              <!-- Submit Button -->
              <button
                v-else
                @click="handleSubmitQuiz"
                :disabled="submitting"
                class="btn btn-success w-full sm:w-auto font-bold text-lg py-4"
              >
                {{ submitting ? 'Submitting...' : '🎯 Submit Quiz' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Quiz Completed -->
      <div v-if="quizCompleted" class="card text-center">
        <div class="mb-6">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">🎉 Quiz Submitted!</h2>
          <p class="text-gray-600 text-sm sm:text-base">Your answers have been recorded. Click below to view your results.</p>
        </div>
        
        <button
          @click="viewResults"
          class="btn w-full sm:w-auto px-8 py-4 text-lg font-bold"
        >
          📊 View Results
        </button>
      </div>

      <!-- Answer Summary (if quiz completed) -->
      <div v-if="quizCompleted" class="card mt-4 sm:mt-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 text-center sm:text-left">📝 Your Answers</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <div
            v-for="question in quiz.questions"
            :key="question.number"
            class="p-3 border-2 rounded-lg text-center transition-all duration-200"
            :class="{
              'border-green-300 bg-green-50 text-green-800': selectedAnswers[question.number],
              'border-gray-300 bg-gray-50 text-gray-600': !selectedAnswers[question.number]
            }"
          >
            <div class="text-xs sm:text-sm font-medium">
              <strong>Q{{ question.number }}</strong>
            </div>
            <div class="text-xs mt-1 truncate">
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

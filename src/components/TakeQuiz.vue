<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-lg shadow-md p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Loading quiz...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-100 border border-red-200 rounded-lg p-6">
        <h2 class="text-xl font-bold text-red-800 mb-2">Quiz Not Found</h2>
        <p class="text-red-700 mb-4">{{ error }}</p>
        <button 
          @click="$router.push('/')"
          class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Create New Quiz
        </button>
      </div>

      <!-- Quiz Header -->
      <div v-else-if="quiz" class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ quiz.title }}</h1>
            <p class="text-gray-600">{{ quiz.metadata.totalQuestions }} Questions</p>
          </div>
          <div class="text-sm text-gray-500">
            Quiz Code: <strong>{{ quiz.code }}</strong>
          </div>
        </div>
        
        <!-- Progress Bar -->
        <div class="mt-4">
          <div class="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {{ currentQuestionIndex + 1 }} of {{ quiz.questions.length }}</span>
            <span>{{ Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100) }}% Complete</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-blue-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: ((currentQuestionIndex + 1) / quiz.questions.length) * 100 + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Quiz Questions -->
      <div v-if="quiz && !quizCompleted" class="bg-white rounded-lg shadow-md p-8">
        <div v-if="currentQuestion" class="space-y-6">
          <!-- Question -->
          <div>
            <h2 class="text-xl font-semibold text-gray-900 mb-6">
              {{ currentQuestion.number }}. {{ currentQuestion.question }}
            </h2>
          </div>

          <!-- Answer Options -->
          <div class="space-y-4">
            <!-- Multiple Choice Questions -->
            <div v-if="currentQuestion.type === 'multiple-choice' || currentQuestion.options.length > 0">
              <label
                v-for="option in currentQuestion.options"
                :key="option.letter"
                class="flex items-start p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                :class="{
                  'border-blue-500 bg-blue-50': selectedAnswers[currentQuestion.number] === option.letter,
                  'border-gray-300': selectedAnswers[currentQuestion.number] !== option.letter
                }"
              >
                <input
                  type="radio"
                  :name="`question-${currentQuestion.number}`"
                  :value="option.letter"
                  v-model="selectedAnswers[currentQuestion.number]"
                  class="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <span class="ml-3 text-gray-900">
                  <strong>{{ option.letter }})</strong> {{ option.text }}
                </span>
              </label>
            </div>
            
            <!-- Identification/Short Answer Questions -->
            <div v-else-if="currentQuestion.type === 'identification' || currentQuestion.options.length === 0">
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">
                  Your Answer:
                </label>
                <input
                  type="text"
                  v-model="selectedAnswers[currentQuestion.number]"
                  placeholder="Type your answer here..."
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <p class="text-sm text-gray-500">
                  Enter your answer for this identification question.
                </p>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="flex justify-between pt-6 border-t">
            <button
              @click="previousQuestion"
              :disabled="currentQuestionIndex === 0"
              class="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>

            <div class="flex space-x-4">
              <!-- Skip Button -->
              <button
                v-if="currentQuestionIndex < quiz.questions.length - 1"
                @click="nextQuestion"
                class="px-6 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
              >
                Skip
              </button>

              <!-- Next Button -->
              <button
                v-if="currentQuestionIndex < quiz.questions.length - 1"
                @click="nextQuestion"
                :disabled="!selectedAnswers[currentQuestion.number]"
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>

              <!-- Submit Button -->
              <button
                v-else
                @click="handleSubmitQuiz"
                :disabled="submitting"
                class="px-8 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {{ submitting ? 'Submitting...' : 'Submit Quiz' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Quiz Completed -->
      <div v-if="quizCompleted" class="bg-white rounded-lg shadow-md p-8 text-center">
        <div class="mb-6">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Quiz Submitted!</h2>
          <p class="text-gray-600">Your answers have been recorded. Click below to view your results.</p>
        </div>
        
        <button
          @click="viewResults"
          class="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          View Results
        </button>
      </div>

      <!-- Answer Summary (if quiz completed) -->
      <div v-if="quizCompleted" class="bg-white rounded-lg shadow-md p-6 mt-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Your Answers</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="question in quiz.questions"
            :key="question.number"
            class="p-3 border rounded-lg"
            :class="{
              'border-green-200 bg-green-50': selectedAnswers[question.number],
              'border-gray-200 bg-gray-50': !selectedAnswers[question.number]
            }"
          >
            <div class="text-sm">
              <strong>Q{{ question.number }}:</strong>
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

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Results Header -->
      <div class="bg-white rounded-lg shadow-md p-8 mb-6 text-center">
        <div class="mb-6">
          <!-- Score Circle -->
          <div class="w-32 h-32 mx-auto mb-6 relative">
            <svg class="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <!-- Background circle -->
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="#e5e7eb"
                stroke-width="8"
                fill="none"
              ></circle>
              <!-- Progress circle -->
              <circle
                cx="60"
                cy="60"
                r="50"
                :stroke="scoreColor"
                stroke-width="8"
                fill="none"
                stroke-linecap="round"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="circumference - (score?.percentage || 0) / 100 * circumference"
                class="transition-all duration-1000 ease-out"
              ></circle>
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-center">
                <div class="text-2xl font-bold" :class="scoreTextColor">
                  {{ score?.percentage || 0 }}%
                </div>
                <div class="text-sm text-gray-600">Score</div>
              </div>
            </div>
          </div>

          <h1 class="text-3xl font-bold text-gray-900 mb-2">Quiz Results</h1>
          <p class="text-lg text-gray-600 mb-4">
            You got {{ score?.correct || 0 }} out of {{ score?.total || 0 }} questions correct!
          </p>
          
          <!-- Score Badge -->
          <div class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium" :class="scoreBadgeClass">
            {{ scoreMessage }}
          </div>
          
          <!-- Performance Statistics -->
          <div v-if="score" class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-blue-50 p-4 rounded-lg text-center">
              <div class="text-2xl font-bold text-blue-600">{{ score.correct }}</div>
              <div class="text-sm text-blue-700">Correct</div>
            </div>
            <div class="bg-red-50 p-4 rounded-lg text-center">
              <div class="text-2xl font-bold text-red-600">{{ score.incorrect || (score.total - score.correct - (score.skipped || 0)) }}</div>
              <div class="text-sm text-red-700">Incorrect</div>
            </div>
            <div v-if="score.skipped !== undefined" class="bg-gray-50 p-4 rounded-lg text-center">
              <div class="text-2xl font-bold text-gray-600">{{ score.skipped }}</div>
              <div class="text-sm text-gray-700">Skipped</div>
            </div>
            <div class="bg-green-50 p-4 rounded-lg text-center">
              <div class="text-2xl font-bold text-green-600">{{ accuracyRating }}</div>
              <div class="text-sm text-green-700">Grade</div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Answer Key Message -->
      <div v-if="!hasAnswerKey" class="bg-yellow-100 border border-yellow-200 rounded-lg p-6 mb-6">
        <div class="flex items-center">
          <svg class="w-6 h-6 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.856-.833-2.598 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <div>
            <h3 class="font-medium text-yellow-800">No Answer Key Available</h3>
            <p class="text-yellow-700 text-sm">This quiz doesn't have an answer key, so we can't calculate your score. Your responses have been recorded.</p>
          </div>
        </div>
      </div>

      <!-- Detailed Results -->
      <div v-if="hasAnswerKey && results" class="space-y-6">
        <div
          v-for="(result, questionNum) in results"
          :key="questionNum"
          class="bg-white rounded-lg shadow-md p-6"
        >
          <!-- Question Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">
                Question {{ questionNum }}
              </h3>
              <p class="text-gray-700">{{ result.question }}</p>
            </div>
            <div class="ml-4">
              <span 
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                :class="{
                  'bg-green-100 text-green-800': result.isCorrect,
                  'bg-red-100 text-red-800': !result.isCorrect && result.userAnswer,
                  'bg-gray-100 text-gray-800': !result.userAnswer
                }"
              >
                <svg v-if="result.isCorrect" class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
                <svg v-else-if="result.userAnswer" class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
                <svg v-else class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
                </svg>
                {{ result.isCorrect ? 'Correct' : result.userAnswer ? 'Incorrect' : 'Skipped' }}
              </span>
            </div>
          </div>

          <!-- Answer Display -->
          <div class="mt-4">
            <!-- Multiple Choice Questions -->
            <div v-if="result.options && result.options.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                v-for="option in result.options"
                :key="option.letter"
                class="p-3 border rounded-lg"
                :class="{
                  'border-green-500 bg-green-50': option.letter === result.correctAnswer,
                  'border-red-500 bg-red-50': option.letter === result.userAnswer && !result.isCorrect,
                  'border-gray-300 bg-gray-50': option.letter !== result.correctAnswer && option.letter !== result.userAnswer,
                  'border-blue-500 bg-blue-50': option.letter === result.userAnswer && result.isCorrect
                }"
              >
                <div class="flex items-center justify-between">
                  <span class="font-medium">{{ option.letter }}) {{ option.text }}</span>
                  <div class="flex items-center space-x-2">
                    <!-- Correct Answer Badge -->
                    <span v-if="option.letter === result.correctAnswer" class="text-green-600 text-sm font-medium">
                      ✓ Correct
                    </span>
                    <!-- Your Answer Badge -->
                    <span v-if="option.letter === result.userAnswer" class="text-blue-600 text-sm font-medium">
                      Your Answer
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Identification Questions -->
            <div v-else class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- User's Answer -->
                <div class="p-4 border rounded-lg" :class="{
                  'border-green-500 bg-green-50': result.isCorrect,
                  'border-red-500 bg-red-50': !result.isCorrect && result.userAnswer,
                  'border-gray-300 bg-gray-50': !result.userAnswer
                }">
                  <div class="text-sm font-medium text-gray-700 mb-2">Your Answer:</div>
                  <div class="text-gray-900">
                    {{ result.userAnswer || 'No answer provided' }}
                  </div>
                  <div class="mt-2 text-xs" :class="{
                    'text-green-600': result.isCorrect,
                    'text-red-600': !result.isCorrect && result.userAnswer,
                    'text-gray-500': !result.userAnswer
                  }">
                    {{ result.isCorrect ? '✓ Correct' : result.userAnswer ? '✗ Incorrect' : '- Skipped' }}
                  </div>
                </div>

                <!-- Correct Answer -->
                <div class="p-4 border border-green-500 bg-green-50 rounded-lg">
                  <div class="text-sm font-medium text-green-700 mb-2">Correct Answer:</div>
                  <div class="text-green-900 font-medium">
                    {{ result.correctAnswer }}
                  </div>
                  <div class="mt-2 text-xs text-green-600">
                    ✓ Expected Answer
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Explanation (if not answered correctly) -->
          <div v-if="!result.isCorrect" class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p class="text-blue-800 text-sm">
              <strong>{{ result.options && result.options.length > 0 ? 'Correct Answer:' : 'Expected Answer:' }}</strong>
              <span v-if="result.options && result.options.length > 0">
                {{ result.correctAnswer }}) 
                {{ result.options.find(opt => opt.letter === result.correctAnswer)?.text }}
              </span>
              <span v-else>
                {{ result.correctAnswer }}
              </span>
            </p>
            <p v-if="!result.options || result.options.length === 0" class="text-blue-700 text-xs mt-1">
              💡 For identification questions, answers are checked for key terms and may allow partial credit.
            </p>
          </div>
        </div>
      </div>

      <!-- Performance Analysis -->
      <div v-if="score" class="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">📊 Performance Analysis</h2>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Performance Level -->
          <div class="space-y-4">
            <div class="flex items-center space-x-3">
              <div class="w-3 h-3 rounded-full" :class="{
                'bg-green-500': score.percentage >= 80,
                'bg-yellow-500': score.percentage >= 60 && score.percentage < 80,
                'bg-red-500': score.percentage < 60
              }"></div>
              <div>
                <div class="font-semibold text-gray-900">{{ performanceAnalysis.level }} Level</div>
                <div class="text-sm text-gray-600">{{ performanceAnalysis.message }}</div>
              </div>
            </div>
            
            <!-- Progress Bar -->
            <div class="space-y-2">
              <div class="flex justify-between text-sm text-gray-600">
                <span>Knowledge Level</span>
                <span>{{ score.percentage }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="h-2 rounded-full transition-all duration-1000 ease-out"
                  :class="{
                    'bg-green-500': score.percentage >= 80,
                    'bg-yellow-500': score.percentage >= 60 && score.percentage < 80,
                    'bg-red-500': score.percentage < 60
                  }"
                  :style="{ width: score.percentage + '%' }"
                ></div>
              </div>
            </div>
          </div>
          
          <!-- Improvement Suggestions -->
          <div class="space-y-3">
            <h3 class="font-semibold text-gray-900">💡 Suggestions for Improvement</h3>
            <ul class="space-y-2">
              <li 
                v-for="(suggestion, index) in performanceAnalysis.suggestions" 
                :key="index"
                class="flex items-start space-x-2 text-sm text-gray-700"
              >
                <span class="text-blue-500 mt-1">•</span>
                <span>{{ suggestion }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="bg-white rounded-lg shadow-md p-6 mt-6">
        <div class="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            @click="retakeQuiz"
            class="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retake Quiz
          </button>
          <button
            @click="createNewQuiz"
            class="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Create New Quiz
          </button>
          <button
            @click="shareResults"
            class="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Share Results
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const score = ref(null)
const results = ref(null)
const analytics = ref(null)
const hasAnswerKey = ref(false)
const quizCode = ref('')

const circumference = 2 * Math.PI * 50

const scoreColor = computed(() => {
  const percentage = score.value?.percentage || 0
  if (percentage >= 80) return '#10b981' // green
  if (percentage >= 60) return '#f59e0b' // yellow
  return '#ef4444' // red
})

const scoreTextColor = computed(() => {
  const percentage = score.value?.percentage || 0
  if (percentage >= 80) return 'text-green-600'
  if (percentage >= 60) return 'text-yellow-600'
  return 'text-red-600'
})

const scoreBadgeClass = computed(() => {
  const percentage = score.value?.percentage || 0
  if (percentage >= 90) return 'bg-green-100 text-green-800'
  if (percentage >= 80) return 'bg-blue-100 text-blue-800'
  if (percentage >= 70) return 'bg-yellow-100 text-yellow-800'
  if (percentage >= 60) return 'bg-orange-100 text-orange-800'
  return 'bg-red-100 text-red-800'
})

const scoreMessage = computed(() => {
  const percentage = score.value?.percentage || 0
  if (percentage >= 90) return '🏆 Excellent!'
  if (percentage >= 80) return '🎉 Great Job!'
  if (percentage >= 70) return '👍 Good Work!'
  if (percentage >= 60) return '👌 Not Bad!'
  return '📚 Keep Studying!'
})

const accuracyRating = computed(() => {
  const percentage = score.value?.percentage || 0
  if (percentage >= 95) return 'A+'
  if (percentage >= 90) return 'A'
  if (percentage >= 85) return 'A-'
  if (percentage >= 80) return 'B+'
  if (percentage >= 75) return 'B'
  if (percentage >= 70) return 'B-'
  if (percentage >= 65) return 'C+'
  if (percentage >= 60) return 'C'
  if (percentage >= 55) return 'C-'
  if (percentage >= 50) return 'D+'
  if (percentage >= 45) return 'D'
  return 'F'
})

const performanceAnalysis = computed(() => {
  // Use backend analytics if available
  if (analytics.value) {
    return {
      level: analytics.value.performanceLevel,
      message: getPerformanceMessage(analytics.value.performanceLevel),
      suggestions: analytics.value.recommendations
    }
  }
  
  // Fallback to frontend calculation
  const percentage = score.value?.percentage || 0
  
  let analysis = {
    level: '',
    message: '',
    suggestions: []
  }
  
  if (percentage >= 90) {
    analysis.level = 'Expert'
    analysis.message = 'Outstanding performance! You have mastered this topic.'
    analysis.suggestions = ['Challenge yourself with more advanced topics', 'Help others learn this subject']
  } else if (percentage >= 80) {
    analysis.level = 'Proficient'
    analysis.message = 'Great job! You have a solid understanding of the material.'
    analysis.suggestions = ['Review the questions you missed', 'Practice similar topics to reach expert level']
  } else if (percentage >= 70) {
    analysis.level = 'Developing'
    analysis.message = 'Good effort! You understand most of the concepts.'
    analysis.suggestions = ['Focus on the areas where you made mistakes', 'Take time to review the material']
  } else if (percentage >= 60) {
    analysis.level = 'Basic'
    analysis.message = 'You have some understanding, but there\'s room for improvement.'
    analysis.suggestions = ['Study the material more thoroughly', 'Ask for help with difficult concepts']
  } else {
    analysis.level = 'Needs Work'
    analysis.message = 'This topic needs more attention and practice.'
    analysis.suggestions = ['Review all the material carefully', 'Consider additional study resources', 'Practice more before retaking']
  }
  
  return analysis
})

const getPerformanceMessage = (level) => {
  const messages = {
    'Expert': 'Outstanding performance! You have mastered this topic.',
    'Proficient': 'Great job! You have a solid understanding of the material.',
    'Developing': 'Good effort! You understand most of the concepts.',
    'Basic': 'You have some understanding, but there\'s room for improvement.',
    'Needs Work': 'This topic needs more attention and practice.'
  }
  return messages[level] || 'Keep working hard!'
}

onMounted(() => {
  loadResults()
})

const loadResults = () => {
  const storedResults = localStorage.getItem('quizResults')
  if (storedResults) {
    const data = JSON.parse(storedResults)
    score.value = data.score
    results.value = data.results
    analytics.value = data.analytics
    hasAnswerKey.value = data.score !== null
    quizCode.value = data.quizCode
  } else {
    // Fallback: redirect to home if no results found
    router.push('/')
  }
}

const retakeQuiz = () => {
  router.push(`/take/${quizCode.value}`)
}

const createNewQuiz = () => {
  router.push('/')
}

const shareResults = () => {
  const shareText = `I just completed a quiz and scored ${score.value?.percentage || 0}%! Try it yourself: ${window.location.origin}/take/${quizCode.value}`
  
  if (navigator.share) {
    navigator.share({
      title: 'Quiz Results',
      text: shareText,
      url: `${window.location.origin}/take/${quizCode.value}`
    })
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(shareText).then(() => {
      alert('Results shared! Link copied to clipboard.')
    }).catch(() => {
      alert('Unable to share. Please copy the link manually.')
    })
  }
}
</script>

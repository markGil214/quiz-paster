<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-4 sm:py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6">
      <!-- Results Header -->
      <div class="card mb-4 sm:mb-6 text-center">
        <div class="mb-6">
          <!-- Score Circle -->
          <div class="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6 relative">
            <svg class="w-24 h-24 sm:w-32 sm:h-32 transform -rotate-90" viewBox="0 0 120 120">
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
                <div class="text-xl sm:text-2xl font-bold" :class="scoreTextColor">
                  {{ score?.percentage || 0 }}%
                </div>
                <div class="text-xs sm:text-sm text-gray-600">Score</div>
              </div>
            </div>
          </div>

          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">🎯 Quiz Results</h1>
          <p class="text-base sm:text-lg text-gray-600 mb-4">
            You got <strong>{{ score?.correct || 0 }}</strong> out of <strong>{{ score?.total || 0 }}</strong> questions correct!
          </p>
          
          <!-- Score Badge -->
          <div class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium" :class="scoreBadgeClass">
            {{ scoreMessage }}
          </div>
          
          <!-- Performance Statistics -->
          <div v-if="score" class="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div class="bg-blue-50 p-3 sm:p-4 rounded-xl text-center border-2 border-blue-200">
              <div class="text-xl sm:text-2xl font-bold text-blue-600">{{ score.correct }}</div>
              <div class="text-xs sm:text-sm text-blue-700">✅ Correct</div>
            </div>
            <div class="bg-red-50 p-3 sm:p-4 rounded-xl text-center border-2 border-red-200">
              <div class="text-xl sm:text-2xl font-bold text-red-600">{{ score.incorrect || (score.total - score.correct - (score.skipped || 0)) }}</div>
              <div class="text-xs sm:text-sm text-red-700">❌ Incorrect</div>
            </div>
            <div v-if="score.skipped !== undefined" class="bg-gray-50 p-3 sm:p-4 rounded-xl text-center border-2 border-gray-200">
              <div class="text-xl sm:text-2xl font-bold text-gray-600">{{ score.skipped }}</div>
              <div class="text-xs sm:text-sm text-gray-700">⏭️ Skipped</div>
            </div>
            <div class="bg-green-50 p-3 sm:p-4 rounded-xl text-center border-2 border-green-200">
              <div class="text-xl sm:text-2xl font-bold text-green-600">{{ accuracyRating }}</div>
              <div class="text-xs sm:text-sm text-green-700">🎓 Grade</div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Answer Key Message -->
      <div v-if="!hasAnswerKey" class="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
        <div class="flex items-start">
          <svg class="w-6 h-6 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.856-.833-2.598 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <div>
            <h3 class="font-medium text-yellow-800 text-sm sm:text-base">⚠️ No Answer Key Available</h3>
            <p class="text-yellow-700 text-xs sm:text-sm mt-1">This quiz doesn't have an answer key, so we can't calculate your score. Your responses have been recorded.</p>
          </div>
        </div>
      </div>

      <!-- Detailed Results -->
      <div v-if="hasAnswerKey && results" class="space-y-4 sm:space-y-6">
        <div
          v-for="(result, questionNum) in results"
          :key="questionNum"
          class="card"
        >
          <!-- Question Header -->
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-3 sm:space-y-0">
            <div class="flex-1">
              <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                Question {{ questionNum }}
              </h3>
              <p class="text-gray-700 text-sm sm:text-base leading-relaxed">{{ result.question }}</p>
            </div>
            <div class="flex justify-center sm:justify-end">
              <span 
                class="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium"
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
                {{ result.isCorrect ? '✅ Correct' : result.userAnswer ? '❌ Incorrect' : '⏭️ Skipped' }}
              </span>
            </div>
          </div>

          <!-- Answer Display -->
          <div class="mt-4">
            <!-- Multiple Choice Questions -->
            <div v-if="result.options && result.options.length > 0" class="grid grid-cols-1 gap-3">
              <div
                v-for="option in result.options"
                :key="option.letter"
                class="p-3 sm:p-4 border-2 rounded-xl text-sm sm:text-base"
                :class="{
                  'border-green-500 bg-green-50': option.letter === result.correctAnswer,
                  'border-red-500 bg-red-50': option.letter === result.userAnswer && !result.isCorrect,
                  'border-gray-300 bg-gray-50': option.letter !== result.correctAnswer && option.letter !== result.userAnswer,
                  'border-blue-500 bg-blue-50': option.letter === result.userAnswer && result.isCorrect
                }"
              >
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <span class="font-medium"><strong class="text-base sm:text-lg">{{ option.letter }})</strong> {{ option.text }}</span>
                  <div class="flex flex-wrap gap-2 text-xs sm:text-sm">
                    <!-- Correct Answer Badge -->
                    <span v-if="option.letter === result.correctAnswer" class="bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      ✓ Correct Answer
                    </span>
                    <!-- Your Answer Badge -->
                    <span v-if="option.letter === result.userAnswer" class="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                      👤 Your Answer
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Identification Questions -->
            <div v-else class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- User's Answer -->
                <div class="p-4 border-2 rounded-xl" :class="{
                  'border-green-500 bg-green-50': result.isCorrect,
                  'border-red-500 bg-red-50': !result.isCorrect && result.userAnswer,
                  'border-gray-300 bg-gray-50': !result.userAnswer
                }">
                  <div class="text-xs sm:text-sm font-medium text-gray-700 mb-2">👤 Your Answer:</div>
                  <div class="text-gray-900 text-sm sm:text-base font-medium">
                    {{ result.userAnswer || 'No answer provided' }}
                  </div>
                  <div class="mt-2 text-xs" :class="{
                    'text-green-600': result.isCorrect,
                    'text-red-600': !result.isCorrect && result.userAnswer,
                    'text-gray-500': !result.userAnswer
                  }">
                    {{ result.isCorrect ? '✅ Correct' : result.userAnswer ? '❌ Incorrect' : '⏭️ Skipped' }}
                  </div>
                </div>

                <!-- Correct Answer -->
                <div class="p-4 border-2 border-green-500 bg-green-50 rounded-xl">
                  <div class="text-xs sm:text-sm font-medium text-green-700 mb-2">✅ Correct Answer:</div>
                  <div class="text-green-900 font-medium text-sm sm:text-base">
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
          <div v-if="!result.isCorrect" class="mt-4 p-3 sm:p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <p class="text-blue-800 text-xs sm:text-sm">
              <strong>💡 {{ result.options && result.options.length > 0 ? 'Correct Answer:' : 'Expected Answer:' }}</strong>
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
      <div v-if="score" class="card mt-4 sm:mt-6">
        <h2 class="text-lg sm:text-xl font-bold text-gray-900 mb-4 text-center sm:text-left">📊 Performance Analysis</h2>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Performance Level -->
          <div class="space-y-4">
            <div class="flex items-center space-x-3">
              <div class="w-4 h-4 rounded-full flex-shrink-0" :class="{
                'bg-green-500': score.percentage >= 80,
                'bg-yellow-500': score.percentage >= 60 && score.percentage < 80,
                'bg-red-500': score.percentage < 60
              }"></div>
              <div>
                <div class="font-semibold text-gray-900 text-sm sm:text-base">{{ performanceAnalysis.level }} Level</div>
                <div class="text-xs sm:text-sm text-gray-600">{{ performanceAnalysis.message }}</div>
              </div>
            </div>
            
            <!-- Progress Bar -->
            <div class="space-y-2">
              <div class="flex justify-between text-xs sm:text-sm text-gray-600">
                <span>Knowledge Level</span>
                <span class="font-medium">{{ score.percentage }}%</span>
              </div>
              <div class="progress-bar">
                <div 
                  class="progress-fill"
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
            <h3 class="font-semibold text-gray-900 text-sm sm:text-base">💡 Suggestions for Improvement</h3>
            <ul class="space-y-2">
              <li 
                v-for="(suggestion, index) in performanceAnalysis.suggestions" 
                :key="index"
                class="flex items-start space-x-2 text-xs sm:text-sm text-gray-700"
              >
                <span class="text-blue-500 mt-1 flex-shrink-0">•</span>
                <span>{{ suggestion }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="card mt-4 sm:mt-6">
        <div class="flex flex-col space-y-3 sm:space-y-4">
          <button
            @click="retakeQuiz"
            class="btn w-full text-base font-bold py-4"
          >
            🔄 Retake Quiz
          </button>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              @click="createNewQuiz"
              class="btn btn-success w-full"
            >
              ➕ Create New Quiz
            </button>
            <button
              @click="shareResults"
              class="btn btn-warning w-full"
            >
              🔗 Share Results
            </button>
          </div>
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

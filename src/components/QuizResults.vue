<template>
  <div class="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 py-4 sm:py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6">
      <!-- Results Header -->
      <div class="card bg-white/95 backdrop-blur-xl border-2 border-white/20 shadow-2xl mb-6 text-center">
        <div class="mb-8">
          <!-- Enhanced Score Circle -->
          <div class="w-28 h-28 sm:w-36 sm:h-36 mx-auto mb-6 relative">
            <svg class="w-28 h-28 sm:w-36 sm:h-36 transform -rotate-90" viewBox="0 0 120 120">
              <!-- Background circle -->
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="#e5e7eb"
                stroke-width="10"
                fill="none"
              ></circle>
              <!-- Progress circle -->
              <circle
                cx="60"
                cy="60"
                r="50"
                :stroke="scoreColor"
                stroke-width="10"
                fill="none"
                stroke-linecap="round"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="circumference - (score?.percentage || 0) / 100 * circumference"
                class="transition-all duration-1000 ease-out drop-shadow-lg"
              ></circle>
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-center">
                <div class="text-2xl sm:text-3xl font-black" :class="scoreTextColor">
                  {{ score?.percentage || 0 }}%
                </div>
                <div class="text-sm sm:text-base text-gray-600 font-medium">Score</div>
              </div>
            </div>
          </div>

          <h1 class="text-3xl sm:text-4xl font-black text-gray-900 mb-4 tracking-tight">
            🎯 <span class="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Quiz Results</span>
          </h1>
          <p class="text-lg sm:text-xl text-gray-700 mb-6 font-semibold">
            You got <strong class="text-purple-600">{{ score?.correct || 0 }}</strong> out of <strong class="text-blue-600">{{ score?.total || 0 }}</strong> questions correct!
          </p>
          
          <!-- Enhanced Score Badge -->
          <div class="inline-flex items-center px-6 py-3 rounded-xl text-lg font-black shadow-lg" :class="scoreBadgeClass">
            {{ scoreMessage }}
          </div>
          
          <!-- Enhanced Performance Statistics -->
          <div v-if="score" class="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-5 rounded-2xl text-center border-3 border-blue-300 shadow-lg hover:shadow-xl transition-all duration-200">
              <div class="text-2xl sm:text-3xl font-black text-blue-600">{{ score.correct }}</div>
              <div class="text-sm sm:text-base text-blue-700 font-bold">✅ Correct</div>
            </div>
            <div class="bg-gradient-to-r from-red-50 to-red-100 p-5 rounded-2xl text-center border-3 border-red-300 shadow-lg hover:shadow-xl transition-all duration-200">
              <div class="text-2xl sm:text-3xl font-black text-red-600">{{ score.incorrect || (score.total - score.correct - (score.skipped || 0)) }}</div>
              <div class="text-sm sm:text-base text-red-700 font-bold">❌ Incorrect</div>
            </div>
            <div v-if="score.skipped !== undefined" class="bg-gradient-to-r from-gray-50 to-gray-100 p-5 rounded-2xl text-center border-3 border-gray-300 shadow-lg hover:shadow-xl transition-all duration-200">
              <div class="text-2xl sm:text-3xl font-black text-gray-600">{{ score.skipped }}</div>
              <div class="text-sm sm:text-base text-gray-700 font-bold">⏭️ Skipped</div>
            </div>
            <div class="bg-gradient-to-r from-green-50 to-green-100 p-5 rounded-2xl text-center border-3 border-green-300 shadow-lg hover:shadow-xl transition-all duration-200">
              <div class="text-2xl sm:text-3xl font-black text-green-600">{{ accuracyRating }}</div>
              <div class="text-sm sm:text-base text-green-700 font-bold">🎓 Grade</div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Answer Key Message -->
      <div v-if="!hasAnswerKey" class="bg-gradient-to-r from-yellow-50 to-orange-50 border-3 border-yellow-300 rounded-2xl p-6 mb-6 shadow-xl">
        <div class="flex items-start">
          <svg class="w-8 h-8 text-yellow-600 mr-4 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.856-.833-2.598 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <div>
            <h3 class="font-bold text-yellow-800 text-lg mb-2 flex items-center">⚠️ No Answer Key Available</h3>
            <p class="text-yellow-700 text-base font-medium">This quiz doesn't have an answer key, so we can't calculate your score. Your responses have been recorded.</p>
          </div>
        </div>
      </div>

      <!-- Detailed Results -->
      <div v-if="hasAnswerKey && results" class="space-y-6">
        <div
          v-for="(result, questionNum) in results"
          :key="questionNum"
          class="card bg-white/95 backdrop-blur-xl border-2 border-white/20 shadow-xl"
        >
          <!-- Question Header -->
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 space-y-4 sm:space-y-0">
            <div class="flex-1">
              <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-3 flex items-center">
                <span class="text-purple-600 text-2xl font-black">{{ questionNum }}.</span>
                <span class="ml-2">Question {{ questionNum }}</span>
              </h3>
              <p class="text-gray-700 text-base sm:text-lg leading-relaxed font-medium bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-xl border border-gray-200">{{ result.question }}</p>
            </div>
            <div class="flex justify-center sm:justify-end">
              <span 
                class="inline-flex items-center px-4 py-3 rounded-xl text-base font-black shadow-lg"
                :class="{
                  'bg-green-500 text-white': result.isCorrect,
                  'bg-red-500 text-white': !result.isCorrect && result.userAnswer,
                  'bg-gray-500 text-white': !result.userAnswer
                }"
              >
                <svg v-if="result.isCorrect" class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
                <svg v-else-if="result.userAnswer" class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
                <svg v-else class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
                </svg>
                {{ result.isCorrect ? '✅ Correct' : result.userAnswer ? '❌ Incorrect' : '⏭️ Skipped' }}
              </span>
            </div>
          </div>

          <!-- Answer Display -->
          <div class="mt-6">
            <!-- Multiple Choice Questions -->
            <div v-if="result.options && result.options.length > 0" class="grid grid-cols-1 gap-4">
              <div
                v-for="option in result.options"
                :key="option.letter"
                class="p-5 border-3 rounded-2xl text-base font-medium shadow-lg transition-all duration-200 hover:shadow-xl"
                :class="{
                  'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50': option.letter === result.correctAnswer,
                  'border-red-500 bg-gradient-to-r from-red-50 to-pink-50': option.letter === result.userAnswer && !result.isCorrect,
                  'border-gray-300 bg-gradient-to-r from-gray-50 to-slate-50': option.letter !== result.correctAnswer && option.letter !== result.userAnswer,
                  'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50': option.letter === result.userAnswer && result.isCorrect
                }"
              >
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <span class="font-bold text-gray-900">
                    <strong class="text-purple-600 text-xl">{{ option.letter }})</strong> 
                    <span class="ml-2">{{ option.text }}</span>
                  </span>
                  <div class="flex flex-wrap gap-2 text-sm">
                    <!-- Correct Answer Badge -->
                    <span v-if="option.letter === result.correctAnswer" class="bg-green-500 text-white px-3 py-2 rounded-lg font-black shadow-md">
                      ✓ Correct Answer
                    </span>
                    <!-- Your Answer Badge -->
                    <span v-if="option.letter === result.userAnswer" class="bg-blue-500 text-white px-3 py-2 rounded-lg font-black shadow-md">
                      👤 Your Answer
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Identification Questions -->
            <div v-else class="space-y-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <!-- User's Answer -->
                <div class="p-6 border-3 rounded-2xl shadow-lg" :class="{
                  'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50': result.isCorrect,
                  'border-red-500 bg-gradient-to-r from-red-50 to-pink-50': !result.isCorrect && result.userAnswer,
                  'border-gray-300 bg-gradient-to-r from-gray-50 to-slate-50': !result.userAnswer
                }">
                  <div class="text-sm font-bold text-gray-700 mb-3 flex items-center">
                    👤 <span class="ml-2">Your Answer:</span>
                  </div>
                  <div class="text-gray-900 text-lg font-bold mb-3">
                    {{ result.userAnswer || 'No answer provided' }}
                  </div>
                  <div class="text-base font-black" :class="{
                    'text-green-600': result.isCorrect,
                    'text-red-600': !result.isCorrect && result.userAnswer,
                    'text-gray-500': !result.userAnswer
                  }">
                    {{ result.isCorrect ? '✅ Correct' : result.userAnswer ? '❌ Incorrect' : '⏭️ Skipped' }}
                  </div>
                </div>

                <!-- Correct Answer -->
                <div class="p-6 border-3 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-lg">
                  <div class="text-sm font-bold text-green-700 mb-3 flex items-center">
                    ✅ <span class="ml-2">Correct Answer:</span>
                  </div>
                  <div class="text-green-900 font-black text-lg mb-3">
                    {{ result.correctAnswer }}
                  </div>
                  <div class="text-base text-green-600 font-black">
                    ✓ Expected Answer
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Explanation (if not answered correctly) -->
          <div v-if="!result.isCorrect" class="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-3 border-blue-300 rounded-2xl shadow-lg">
            <p class="text-blue-800 text-base font-bold">
              <strong class="text-lg">💡 {{ result.options && result.options.length > 0 ? 'Correct Answer:' : 'Expected Answer:' }}</strong>
              <span v-if="result.options && result.options.length > 0" class="ml-2">
                {{ result.correctAnswer }}) 
                {{ result.options.find(opt => opt.letter === result.correctAnswer)?.text }}
              </span>
              <span v-else class="ml-2">
                {{ result.correctAnswer }}
              </span>
            </p>
            <p v-if="!result.options || result.options.length === 0" class="text-blue-700 text-sm mt-2 font-medium">
              💡 For identification questions, answers are checked for key terms and may allow partial credit.
            </p>
          </div>
        </div>
      </div>

      <!-- Performance Analysis -->
      <div v-if="score" class="card bg-white/95 backdrop-blur-xl border-2 border-white/20 shadow-2xl mt-6">
        <h2 class="text-xl sm:text-2xl font-black text-gray-900 mb-6 text-center sm:text-left flex items-center justify-center sm:justify-start">
          📊 <span class="ml-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Performance Analysis</span>
        </h2>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Performance Level -->
          <div class="space-y-6">
            <div class="flex items-center space-x-4 bg-gradient-to-r from-purple-50 to-blue-50 p-5 rounded-2xl border-2 border-purple-200">
              <div class="w-6 h-6 rounded-full flex-shrink-0 shadow-lg" :class="{
                'bg-green-500': score.percentage >= 80,
                'bg-yellow-500': score.percentage >= 60 && score.percentage < 80,
                'bg-red-500': score.percentage < 60
              }"></div>
              <div>
                <div class="font-black text-gray-900 text-lg">{{ performanceAnalysis.level }} Level</div>
                <div class="text-sm text-gray-700 font-medium">{{ performanceAnalysis.message }}</div>
              </div>
            </div>
            
            <!-- Enhanced Progress Bar -->
            <div class="space-y-4">
              <div class="flex justify-between text-base text-gray-700 font-bold">
                <span>Knowledge Level</span>
                <span class="text-purple-600">{{ score.percentage }}%</span>
              </div>
              <div class="progress-bar h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <div 
                  class="progress-fill h-full rounded-full shadow-lg transition-all duration-1000 ease-out"
                  :class="{
                    'bg-gradient-to-r from-green-400 to-green-600': score.percentage >= 80,
                    'bg-gradient-to-r from-yellow-400 to-yellow-600': score.percentage >= 60 && score.percentage < 80,
                    'bg-gradient-to-r from-red-400 to-red-600': score.percentage < 60
                  }"
                  :style="{ width: score.percentage + '%' }"
                ></div>
              </div>
            </div>
          </div>
          
          <!-- Improvement Suggestions -->
          <div class="space-y-4">
            <h3 class="font-black text-gray-900 text-lg flex items-center">
              💡 <span class="ml-2">Suggestions for Improvement</span>
            </h3>
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border-2 border-blue-200">
              <ul class="space-y-3">
                <li 
                  v-for="(suggestion, index) in performanceAnalysis.suggestions" 
                  :key="index"
                  class="flex items-start space-x-3 text-base text-gray-700 font-medium"
                >
                  <span class="text-blue-500 text-xl font-black mt-0.5 flex-shrink-0">•</span>
                  <span>{{ suggestion }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Enhanced Action Buttons -->
      <div class="card bg-white/95 backdrop-blur-xl border-2 border-white/20 shadow-2xl mt-6">
        <div class="flex flex-col space-y-6">
          <button
            @click="retakeQuiz"
            class="btn bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-black text-xl py-5 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200 w-full"
          >
            🔄 Retake Quiz
          </button>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              @click="createNewQuiz"
              class="btn bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 w-full"
            >
              ➕ Create New Quiz
            </button>
            <button
              @click="shareResults"
              class="btn bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 w-full"
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

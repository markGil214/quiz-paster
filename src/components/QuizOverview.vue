<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">
              {{ quiz?.title || 'Quiz Overview' }}
            </h1>
            <div class="flex items-center space-x-6 text-sm text-gray-600">
              <span>📋 Code: <strong class="text-blue-600">{{ quiz?.code }}</strong></span>
              <span>📝 {{ quiz?.metadata?.totalQuestions }} Questions</span>
              <span>🔑 Answer Key: {{ quiz?.metadata?.hasAnswerKey ? 'Complete' : 'Missing' }}</span>
              <span>👁️ {{ quiz?.stats?.views || 0 }} Views</span>
            </div>
          </div>
          <div class="space-x-3">
            <button
              @click="toggleEditMode"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {{ isEditing ? 'Save Changes' : 'Edit Quiz' }}
            </button>
            <button
              @click="generateShareLink"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Share Quiz
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-lg shadow-md p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Loading quiz...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-100 border border-red-200 rounded-lg p-6 mb-6">
        <p class="text-red-800">{{ error }}</p>
        <button 
          @click="$router.push('/')"
          class="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Go Back
        </button>
      </div>

      <!-- Quiz Questions -->
      <div v-else-if="quiz" class="space-y-6">
        <div
          v-for="(question, index) in quiz.questions"
          :key="question.number"
          class="bg-white rounded-lg shadow-md p-6"
        >
          <!-- Question Header -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              Question {{ question.number }}
            </h3>
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-500">
                Correct Answer: 
                <strong class="text-green-600">
                  {{ quiz.answerKey[question.number] || 'Not set' }}
                </strong>
              </span>
            </div>
          </div>

          <!-- Question Text -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Question Text
            </label>
            <textarea
              v-if="isEditing"
              v-model="question.question"
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="2"
            ></textarea>
            <p v-else class="text-gray-900 bg-gray-50 p-3 rounded-md">
              {{ question.question }}
            </p>
          </div>

          <!-- Answer Options -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div
              v-for="option in question.options"
              :key="option.letter"
              class="relative"
            >
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Option {{ option.letter }}
                <span 
                  v-if="quiz.answerKey[question.number] === option.letter"
                  class="ml-2 text-green-600 font-bold"
                >
                  ✓ Correct
                </span>
              </label>
              <input
                v-if="isEditing"
                v-model="option.text"
                class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="{
                  'border-green-500 bg-green-50': quiz.answerKey[question.number] === option.letter
                }"
              />
              <p 
                v-else 
                class="p-3 rounded-md"
                :class="{
                  'bg-green-100 border border-green-200': quiz.answerKey[question.number] === option.letter,
                  'bg-gray-50': quiz.answerKey[question.number] !== option.letter
                }"
              >
                {{ option.text }}
              </p>
            </div>
          </div>

          <!-- Answer Key Selector -->
          <div v-if="isEditing" class="border-t pt-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Correct Answer
            </label>
            <select
              v-model="quiz.answerKey[question.number]"
              class="w-40 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select...</option>
              <option
                v-for="option in question.options"
                :key="option.letter"
                :value="option.letter"
              >
                {{ option.letter }} - {{ option.text.substring(0, 30) }}...
              </option>
            </select>
          </div>
        </div>

        <!-- Save Button (when editing) -->
        <div v-if="isEditing" class="bg-white rounded-lg shadow-md p-6">
          <div class="flex justify-between items-center">
            <p class="text-gray-600">
              Make sure to save your changes before leaving this page.
            </p>
            <div class="space-x-3">
              <button
                @click="cancelEdit"
                class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                @click="saveChanges"
                :disabled="saving"
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {{ saving ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Share Link Modal -->
        <div v-if="showShareModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 class="text-lg font-bold mb-4">Share Your Quiz</h3>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Quiz Link
              </label>
              <div class="flex">
                <input
                  :value="shareLink"
                  readonly
                  class="flex-1 p-3 border border-gray-300 rounded-l-md bg-gray-50"
                />
                <button
                  @click="copyShareLink"
                  class="px-4 py-3 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                >
                  Copy
                </button>
              </div>
            </div>
            <div class="flex justify-end space-x-3">
              <button
                @click="showShareModal = false"
                class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getQuizById, updateQuiz } from '../services/api.js'

const route = useRoute()
const quiz = ref(null)
const loading = ref(true)
const error = ref('')
const isEditing = ref(false)
const saving = ref(false)
const showShareModal = ref(false)
const shareLink = ref('')
const originalQuiz = ref(null)

onMounted(async () => {
  await loadQuiz()
})

const loadQuiz = async () => {
  try {
    loading.value = true
    const response = await getQuizById(route.params.id)
    quiz.value = response.data.quiz
    originalQuiz.value = JSON.parse(JSON.stringify(quiz.value))
    error.value = ''
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load quiz'
  } finally {
    loading.value = false
  }
}

const toggleEditMode = async () => {
  if (isEditing.value) {
    await saveChanges()
  } else {
    isEditing.value = true
  }
}

const saveChanges = async () => {
  try {
    saving.value = true
    await updateQuiz(quiz.value.id, {
      title: quiz.value.title,
      questions: quiz.value.questions,
      answerKey: quiz.value.answerKey
    })
    
    isEditing.value = false
    originalQuiz.value = JSON.parse(JSON.stringify(quiz.value))
    
    // Show success message
    alert('Quiz updated successfully!')
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to save changes')
  } finally {
    saving.value = false
  }
}

const cancelEdit = () => {
  quiz.value = JSON.parse(JSON.stringify(originalQuiz.value))
  isEditing.value = false
}

const generateShareLink = () => {
  shareLink.value = `${window.location.origin}/take/${quiz.value.code}`
  showShareModal.value = true
}

const copyShareLink = async () => {
  try {
    await navigator.clipboard.writeText(shareLink.value)
    alert('Link copied to clipboard!')
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = shareLink.value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    alert('Link copied to clipboard!')
  }
}
</script>

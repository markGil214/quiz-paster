<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <div class="bg-white rounded-lg shadow-md p-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Create New Quiz</h1>
        <p class="text-gray-600 mb-8">Paste your quiz text below and we'll parse it into questions and answers.</p>
        
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label for="quizText" class="block text-sm font-medium text-gray-700 mb-2">
              Quiz Text
            </label>
            <textarea
              id="quizText"
              v-model="quizText"
              class="w-full h-96 p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
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
          
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-500">
              {{ quizText.length }} characters
            </div>
            <div class="space-x-4">
              <button
                type="button"
                @click="clearText"
                class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Clear
              </button>
              <button
                type="submit"
                :disabled="!quizText.trim() || isLoading"
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {{ isLoading ? 'Parsing...' : 'Parse Quiz' }}
              </button>
            </div>
          </div>
        </form>
        
        <!-- Success/Error Messages -->
        <div v-if="message" class="mt-6 p-4 rounded-md whitespace-pre-line font-mono text-sm" :class="messageClass">
          {{ message }}
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

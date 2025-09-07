import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const isLoggedIn = computed(() => !!token.value)

  const login = async (username: string, password: string) => {
    try {
      // 这里应该调用实际的登录API
      // const response = await api.login({ username, password })
      
      // 模拟登录成功
      const mockUser: User = {
        id: 1,
        username,
        email: `${username}@example.com`,
        avatar: '',
        createdAt: new Date().toISOString()
      }
      
      const mockToken = 'mock-jwt-token-' + Date.now()
      
      user.value = mockUser
      token.value = mockToken
      localStorage.setItem('token', mockToken)
      localStorage.setItem('user', JSON.stringify(mockUser))
      
      return { success: true, user: mockUser }
    } catch (error) {
      return { success: false, error: '登录失败' }
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      // 这里应该调用实际的注册API
      // const response = await api.register({ username, email, password })
      
      // 模拟注册成功
      const mockUser: User = {
        id: Date.now(),
        username,
        email,
        avatar: '',
        createdAt: new Date().toISOString()
      }
      
      return { success: true, user: mockUser }
    } catch (error) {
      return { success: false, error: '注册失败' }
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const initAuth = () => {
    const savedUser = localStorage.getItem('user')
    if (savedUser && token.value) {
      user.value = JSON.parse(savedUser)
    }
  }

  return {
    user,
    token,
    isLoggedIn,
    login,
    register,
    logout,
    initAuth
  }
})
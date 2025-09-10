import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { loginApi } from '@/utils/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const isLoggedIn = computed(() => !!token.value)

  const login = async (username: string, password: string) => {
    try {
      // 调用后端登录接口
      const res = await loginApi({ username, password })
      // 期望后端返回结构：{ code: 200, data: { token, userInfo }, message }
      if (res && res.code === 200 && res.data && res.data.token && res.data.userInfo) {
        const backendUser: User = {
          id: res.data.userInfo.id,
          username: res.data.userInfo.username,
          email: res.data.userInfo.email,
          avatar: res.data.userInfo.avatar || '',
          createdAt: res.data.userInfo.createTime
        }
        user.value = backendUser
        token.value = res.data.token
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(backendUser))
        return { success: true, user: backendUser }
      }
      return { success: false, error: (res && res.message) ? res.message : '登录失败' }
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
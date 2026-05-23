<template>
  <div class="register-container">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>
    
    <!-- 主要内容 -->
    <div class="content-wrapper">
      <!-- 左侧装饰区域 -->
      <div class="left-section">
        <div class="brand-info">
          <div class="logo-container">
            <div class="logo">
              <el-icon size="48"><TrophyBase /></el-icon>
            </div>
            <h1 class="brand-title">体彩投注记录</h1>
            <p class="brand-subtitle">专业的投注数据管理平台</p>
          </div>
          
          <div class="features">
            <div class="feature-item">
              <el-icon class="feature-icon"><DataAnalysis /></el-icon>
              <span>智能数据分析</span>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><Document /></el-icon>
              <span>详细记录管理</span>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><TrendCharts /></el-icon>
              <span>投注趋势统计</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧注册表单 -->
      <div class="right-section">
        <div class="register-form-container">
          <div class="form-header">
            <h2 class="form-title">创建账户</h2>
            <p class="form-subtitle">填写以下信息完成注册</p>
          </div>
          
          <el-form
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            class="register-form"
            @submit.prevent="handleRegister"
          >
            <el-form-item prop="username" class="form-item">
              <el-input
                v-model="registerForm.username"
                placeholder="请输入用户名"
                size="large"
                class="form-input"
              >
                <template #prefix>
                  <el-icon class="input-icon"><User /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            
            <el-form-item prop="email" class="form-item">
              <el-input
                v-model="registerForm.email"
                placeholder="请输入邮箱地址"
                size="large"
                class="form-input"
              >
                <template #prefix>
                  <el-icon class="input-icon"><Message /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            
            <el-form-item prop="password" class="form-item">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                show-password
                class="form-input"
              >
                <template #prefix>
                  <el-icon class="input-icon"><Lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            
            <el-form-item prop="confirmPassword" class="form-item">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="请确认密码"
                size="large"
                show-password
                class="form-input"
              >
                <template #prefix>
                  <el-icon class="input-icon"><Lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            
            <el-form-item class="form-item">
              <el-button
                type="primary"
                size="large"
                :loading="loading"
                class="register-button"
                @click="handleRegister"
              >
                <span v-if="!loading">立即注册</span>
                <span v-else>注册中...</span>
              </el-button>
            </el-form-item>
            
            <div class="form-footer">
              <div class="login-link">
                <span class="link-text">已有账户？</span>
                <router-link to="/login" class="link">立即登录</router-link>
              </div>
            </div>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { 
  User, 
  Lock, 
  Message,
  TrophyBase, 
  DataAnalysis, 
  Document, 
  TrendCharts 
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const registerFormRef = ref<FormInstance>()
const loading = ref(false)

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const registerRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const result = await authStore.register(
          registerForm.username,
          registerForm.email,
          registerForm.password
        )
        if (result.success) {
          ElMessage.success('注册成功，请登录')
          router.push('/login')
        } else {
          ElMessage.error(result.error || '注册失败')
        }
      } catch (error) {
        ElMessage.error('注册失败，请重试')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 300px;
  height: 300px;
  top: 60%;
  right: 10%;
  animation-delay: -2s;
}

.shape-3 {
  width: 150px;
  height: 150px;
  bottom: 20%;
  left: 20%;
  animation-delay: -4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

/* 主要内容区域 */
.content-wrapper {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 左侧品牌区域 */
.left-section {
  flex: 1;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-info {
  color: white;
  text-align: center;
  max-width: 400px;
}

.logo-container {
  margin-bottom: 40px;
}

.logo {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.brand-title {
  font-size: 32px;
  font-weight: bold;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.brand-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(10px);
}

.feature-icon {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.9);
}

/* 右侧注册表单区域 */
.right-section {
  flex: 0 0 450px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.register-form-container {
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.form-header {
  text-align: center;
  margin-bottom: 32px;
}

.form-title {
  font-size: 28px;
  font-weight: bold;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.form-subtitle {
  font-size: 14px;
  color: #7f8c8d;
  margin: 0;
}

.register-form {
  width: 100%;
}

.form-item {
  margin-bottom: 20px;
}

.form-input {
  border-radius: 12px;
}

.form-input :deep(.el-input__wrapper) {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  box-shadow: none;
  transition: all 0.3s ease;
}

.form-input :deep(.el-input__wrapper:hover) {
  border-color: #409eff;
}

.form-input :deep(.el-input__wrapper.is-focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.input-icon {
  color: #909399;
}

.register-button {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
  margin-top: 8px;
}

.register-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.register-button:active {
  transform: translateY(0);
}

.form-footer {
  margin-top: 24px;
  text-align: center;
}

.login-link {
  font-size: 14px;
}

.link-text {
  color: #7f8c8d;
}

.link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  margin-left: 4px;
  transition: color 0.3s ease;
}

.link:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .content-wrapper {
    flex-direction: column;
    padding: 20px;
  }
  
  .left-section {
    flex: none;
    padding: 20px;
    order: 2;
  }
  
  .right-section {
    flex: none;
    order: 1;
    padding: 20px;
  }
  
  .brand-info {
    margin-top: 20px;
  }
  
  .features {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
  }
  
  .feature-item {
    flex: 0 1 auto;
    min-width: 150px;
  }
}

@media (max-width: 768px) {
  .register-container {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  .content-wrapper {
    padding: 10px;
  }
  
  .right-section {
    padding: 10px;
  }
  
  .register-form-container {
    padding: 30px 20px;
    border-radius: 16px;
  }
  
  .left-section {
    padding: 20px 10px;
  }
  
  .brand-title {
    font-size: 24px;
  }
  
  .brand-subtitle {
    font-size: 14px;
  }
  
  .features {
    flex-direction: column;
    gap: 8px;
  }
  
  .feature-item {
    min-width: auto;
    padding: 8px 16px;
    font-size: 14px;
  }
  
  .shape {
    display: none;
  }
}

@media (max-width: 480px) {
  .register-form-container {
    margin: 10px;
    padding: 20px 16px;
  }
  
  .form-title {
    font-size: 24px;
  }
  
  .brand-info {
    display: none;
  }
  
  .left-section {
    display: none;
  }
}
</style>
<template>
  <Layout>
    <div class="profile-page">
      <!-- 页面标题 -->
      <div class="page-header">
        <h2>个人资料</h2>
      </div>

      <el-row :gutter="20">
        <!-- 个人信息 -->
        <el-col :span="8">
          <el-card class="profile-card">
            <template #header>
              <span>基本信息</span>
            </template>
            
            <div class="profile-info">
              <div class="avatar-section">
                <el-avatar :size="80" :src="userInfo.avatar">
                  {{ userInfo.username?.charAt(0).toUpperCase() }}
                </el-avatar>
                <el-button type="text" @click="changeAvatar">更换头像</el-button>
              </div>
              
              <div class="info-section">
                <div class="info-item">
                  <label>用户名：</label>
                  <span>{{ userInfo.username }}</span>
                </div>
                <div class="info-item">
                  <label>邮箱：</label>
                  <span>{{ userInfo.email }}</span>
                </div>
                <div class="info-item">
                  <label>注册时间：</label>
                  <span>{{ formatDate(userInfo.createdAt) }}</span>
                </div>
                <div class="info-item">
                  <label>最后登录：</label>
                  <span>{{ formatDate(userInfo.lastLoginAt) }}</span>
                </div>
              </div>
              
              <el-button type="primary" @click="showEditDialog = true">
                编辑资料
              </el-button>
            </div>
          </el-card>

          <!-- 投注统计 -->
          <el-card class="stats-card">
            <template #header>
              <span>投注统计</span>
            </template>
            
            <div class="stats-list">
              <div class="stat-item">
                <div class="stat-label">总投注次数</div>
                <div class="stat-value">{{ userStats.totalBets }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">总投注金额</div>
                <div class="stat-value">¥{{ userStats.totalAmount.toLocaleString() }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">总中奖金额</div>
                <div class="stat-value">¥{{ userStats.totalWinning.toLocaleString() }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">净收益</div>
                <div class="stat-value" :class="{ 'negative': userStats.netProfit < 0 }">
                  ¥{{ userStats.netProfit.toLocaleString() }}
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-label">胜率</div>
                <div class="stat-value">{{ userStats.winRate.toFixed(1) }}%</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 设置和偏好 -->
        <el-col :span="16">
          <el-card class="settings-card">
            <template #header>
              <span>个人设置</span>
            </template>
            
            <el-tabs v-model="activeTab">
              <!-- 偏好设置 -->
              <el-tab-pane label="偏好设置" name="preferences">
                <el-form :model="preferences" label-width="120px">
                  <el-form-item label="默认投注金额">
                    <el-input-number
                      v-model="preferences.defaultBetAmount"
                      :min="1"
                      :precision="2"
                      style="width: 200px"
                    />
                    <span class="form-tip">新增记录时的默认金额</span>
                  </el-form-item>
                  
                  <el-form-item label="常用联赛">
                    <el-select
                      v-model="preferences.favoriteLeagues"
                      multiple
                      placeholder="选择常用联赛"
                      style="width: 300px"
                    >
                      <el-option label="英超" value="英超" />
                      <el-option label="西甲" value="西甲" />
                      <el-option label="德甲" value="德甲" />
                      <el-option label="意甲" value="意甲" />
                      <el-option label="法甲" value="法甲" />
                      <el-option label="NBA" value="NBA" />
                      <el-option label="CBA" value="CBA" />
                    </el-select>
                  </el-form-item>
                  
                  <el-form-item label="常用投注类型">
                    <el-checkbox-group v-model="preferences.favoriteBetTypes">
                      <el-checkbox label="胜平负">胜平负</el-checkbox>
                      <el-checkbox label="让球">让球</el-checkbox>
                      <el-checkbox label="大小球">大小球</el-checkbox>
                      <el-checkbox label="比分">比分</el-checkbox>
                      <el-checkbox label="总进球">总进球</el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>
                  
                  <el-form-item label="数据展示">
                    <el-radio-group v-model="preferences.displayMode">
                      <el-radio label="simple">简洁模式</el-radio>
                      <el-radio label="detailed">详细模式</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  
                  <el-form-item>
                    <el-button type="primary" @click="savePreferences">保存设置</el-button>
                  </el-form-item>
                </el-form>
              </el-tab-pane>

              <!-- 通知设置 -->
              <el-tab-pane label="通知设置" name="notifications">
                <el-form :model="notifications" label-width="120px">
                  <el-form-item label="邮件通知">
                    <el-switch v-model="notifications.email" />
                    <span class="form-tip">重要更新和统计报告</span>
                  </el-form-item>
                  
                  <el-form-item label="投注提醒">
                    <el-switch v-model="notifications.betReminder" />
                    <span class="form-tip">连续亏损时的风险提醒</span>
                  </el-form-item>
                  
                  <el-form-item label="周报推送">
                    <el-switch v-model="notifications.weeklyReport" />
                    <span class="form-tip">每周投注统计报告</span>
                  </el-form-item>
                  
                  <el-form-item label="月报推送">
                    <el-switch v-model="notifications.monthlyReport" />
                    <span class="form-tip">每月投注分析报告</span>
                  </el-form-item>
                  
                  <el-form-item>
                    <el-button type="primary" @click="saveNotifications">保存设置</el-button>
                  </el-form-item>
                </el-form>
              </el-tab-pane>

              <!-- 安全设置 -->
              <el-tab-pane label="安全设置" name="security">
                <el-form label-width="120px">
                  <el-form-item label="修改密码">
                    <el-button @click="showPasswordDialog = true">修改密码</el-button>
                  </el-form-item>
                  
                  <el-form-item label="数据导出">
                    <el-button @click="exportUserData">导出我的数据</el-button>
                    <span class="form-tip">导出所有投注记录和统计数据</span>
                  </el-form-item>
                  
                  <el-form-item label="数据备份">
                    <el-button @click="backupData">备份数据</el-button>
                    <span class="form-tip">创建数据备份文件</span>
                  </el-form-item>
                  
                  <el-form-item label="账户注销">
                    <el-button type="danger" @click="showDeleteDialog = true">注销账户</el-button>
                    <span class="form-tip">永久删除账户和所有数据</span>
                  </el-form-item>
                </el-form>
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>
      </el-row>

      <!-- 编辑资料对话框 -->
      <el-dialog v-model="showEditDialog" title="编辑资料" width="500px">
        <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="80px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="editForm.username" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showEditDialog = false">取消</el-button>
          <el-button type="primary" @click="saveProfile">保存</el-button>
        </template>
      </el-dialog>

      <!-- 修改密码对话框 -->
      <el-dialog v-model="showPasswordDialog" title="修改密码" width="500px">
        <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
          <el-form-item label="当前密码" prop="currentPassword">
            <el-input v-model="passwordForm.currentPassword" type="password" show-password />
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input v-model="passwordForm.newPassword" type="password" show-password />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showPasswordDialog = false">取消</el-button>
          <el-button type="primary" @click="changePassword">确定</el-button>
        </template>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import Layout from '@/components/Layout.vue'
import { useAuthStore } from '@/stores/auth'
import dayjs from 'dayjs'

const authStore = useAuthStore()

const activeTab = ref('preferences')
const showEditDialog = ref(false)
const showPasswordDialog = ref(false)
const showDeleteDialog = ref(false)

const editFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()

// 用户信息
const userInfo = reactive({
  username: 'testuser',
  email: 'test@example.com',
  avatar: '',
  createdAt: '2024-01-01T00:00:00Z',
  lastLoginAt: '2024-01-20T10:00:00Z'
})

// 用户统计
const userStats = reactive({
  totalBets: 156,
  totalAmount: 15600,
  totalWinning: 18200,
  netProfit: 2600,
  winRate: 65.4
})

// 偏好设置
const preferences = reactive({
  defaultBetAmount: 100,
  favoriteLeagues: ['英超', 'NBA'],
  favoriteBetTypes: ['胜平负', '让球'],
  displayMode: 'detailed'
})

// 通知设置
const notifications = reactive({
  email: true,
  betReminder: true,
  weeklyReport: false,
  monthlyReport: true
})

// 编辑表单
const editForm = reactive({
  username: '',
  email: ''
})

const editRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

// 密码表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const passwordRules: FormRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const formatDate = (dateStr: string) => {
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm')
}

const changeAvatar = () => {
  ElMessage.info('头像上传功能开发中')
}

const saveProfile = async () => {
  if (!editFormRef.value) return
  
  await editFormRef.value.validate((valid) => {
    if (valid) {
      Object.assign(userInfo, editForm)
      ElMessage.success('资料更新成功')
      showEditDialog.value = false
    }
  })
}

const changePassword = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('密码修改成功')
      showPasswordDialog.value = false
      // 重置表单
      Object.assign(passwordForm, {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    }
  })
}

const savePreferences = () => {
  localStorage.setItem('userPreferences', JSON.stringify(preferences))
  ElMessage.success('偏好设置已保存')
}

const saveNotifications = () => {
  localStorage.setItem('notificationSettings', JSON.stringify(notifications))
  ElMessage.success('通知设置已保存')
}

const exportUserData = () => {
  ElMessage.info('数据导出功能开发中')
}

const backupData = () => {
  ElMessage.info('数据备份功能开发中')
}

onMounted(() => {
  // 初始化用户信息
  if (authStore.user) {
    Object.assign(userInfo, authStore.user)
    Object.assign(editForm, {
      username: authStore.user.username,
      email: authStore.user.email
    })
  }
  
  // 加载保存的设置
  const savedPreferences = localStorage.getItem('userPreferences')
  if (savedPreferences) {
    Object.assign(preferences, JSON.parse(savedPreferences))
  }
  
  const savedNotifications = localStorage.getItem('notificationSettings')
  if (savedNotifications) {
    Object.assign(notifications, JSON.parse(savedNotifications))
  }
})
</script>

<style scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.profile-card,
.stats-card,
.settings-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.profile-info {
  text-align: center;
}

.avatar-section {
  margin-bottom: 20px;
}

.avatar-section .el-button {
  display: block;
  margin: 10px auto 0;
}

.info-section {
  margin-bottom: 20px;
  text-align: left;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item label {
  font-weight: bold;
  color: #606266;
}

.stats-list {
  padding: 0;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  color: #606266;
  font-size: 14px;
}

.stat-value {
  font-weight: bold;
  color: #303133;
  font-size: 16px;
}

.stat-value.negative {
  color: #f56565;
}

.form-tip {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}
</style>
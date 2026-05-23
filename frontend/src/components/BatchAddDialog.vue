<template>
  <el-dialog
    v-model="visible"
    title="批量添加记录"
    width="800px"
    @close="handleClose"
  >
    <div class="batch-add-container">
      <div class="tips">
        <el-alert
          title="批量添加说明"
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            <p>1. 可以一次性添加同一天的多场比赛记录</p>
            <p>2. 填写公共信息后，点击"添加比赛"按钮增加具体比赛</p>
            <p>3. 每场比赛的具体信息需要单独填写</p>
          </template>
        </el-alert>
      </div>

      <!-- 公共信息 -->
      <el-card class="common-info" header="公共信息">
        <el-form :model="commonForm" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="日期" required>
                <el-date-picker
                  v-model="commonForm.date"
                  type="date"
                  placeholder="选择日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="运动类型" required>
                <el-select v-model="commonForm.sportType" placeholder="请选择" style="width: 100%">
                  <el-option label="足球" value="足球" />
                  <el-option label="篮球" value="篮球" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="联赛" required>
            <el-input v-model="commonForm.league" placeholder="请输入联赛名称" />
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 比赛列表 -->
      <el-card class="games-list" header="比赛列表">
        <div class="games-header">
          <el-button type="primary" @click="addGame" :disabled="!canAddGame">
            <el-icon><Plus /></el-icon>
            添加比赛
          </el-button>
          <span class="games-count">已添加 {{ games.length }} 场比赛</span>
        </div>

        <div class="games-container">
          <div
            v-for="(game, index) in games"
            :key="index"
            class="game-item"
          >
            <div class="game-header">
              <span class="game-title">比赛 {{ index + 1 }}</span>
              <el-button
                type="danger"
                size="small"
                @click="removeGame(index)"
                :icon="Delete"
              />
            </div>

            <el-form :model="game" label-width="100px" size="small">
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="主队" required>
                    <el-input v-model="game.homeTeam" placeholder="请输入主队名称" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="客队" required>
                    <el-input v-model="game.awayTeam" placeholder="请输入客队名称" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="16">
                <el-col :span="8">
                  <el-form-item label="投注类型" required>
                    <el-select v-model="game.betType" placeholder="请选择" style="width: 100%">
                      <el-option label="胜平负" value="胜平负" />
                      <el-option label="让球" value="让球" />
                      <el-option label="大小球" value="大小球" />
                      <el-option label="比分" value="比分" />
                      <el-option label="总进球" value="总进球" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="投注选项" required>
                    <el-input v-model="game.betOption" placeholder="如：主胜、大球等" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="投注金额" required>
                    <el-input-number
                      v-model="game.betAmount"
                      :min="1"
                      :precision="2"
                      placeholder="投注金额"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="16">
                <el-col :span="8">
                  <el-form-item label="赔率" required>
                    <el-input-number
                      v-model="game.odds"
                      :min="1"
                      :precision="2"
                      placeholder="赔率"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="结果" required>
                    <el-select v-model="game.result" placeholder="请选择" style="width: 100%" @change="handleGameResultChange(game)">
                      <el-option label="待开奖" value="待开奖" />
                      <el-option label="中奖" value="中奖" />
                      <el-option label="未中奖" value="未中奖" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8" v-if="game.result === '中奖'">
                  <el-form-item label="中奖金额" required>
                    <el-input-number
                      v-model="game.actualWinning"
                      :min="0"
                      :precision="2"
                      placeholder="中奖金额"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>

          <div v-if="games.length === 0" class="empty-games">
            <el-empty description="暂无比赛，请先添加比赛" />
          </div>
        </div>
      </el-card>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="loading" :disabled="!canConfirm">
          确定添加 ({{ games.length }} 场)
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'

interface GameForm {
  homeTeam: string
  awayTeam: string
  betType: string
  betOption: string
  betAmount: number
  odds: number
  result: string
  actualWinning: number
}

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', games: any[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(false)

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const commonForm = reactive({
  date: '',
  sportType: '',
  league: ''
})

const games = ref<GameForm[]>([])

const canAddGame = computed(() => {
  return commonForm.date && commonForm.sportType && commonForm.league
})

const canConfirm = computed(() => {
  return games.value.length > 0 && games.value.every(game => 
    game.homeTeam && game.awayTeam && game.betType && 
    game.betOption && game.betAmount > 0 && game.odds > 0 && 
    game.result && (game.result !== '中奖' || game.actualWinning > 0)
  )
})

const addGame = () => {
  if (!canAddGame.value) {
    ElMessage.warning('请先填写公共信息')
    return
  }

  games.value.push({
    homeTeam: '',
    awayTeam: '',
    betType: '',
    betOption: '',
    betAmount: 0,
    odds: 0,
    result: '待开奖',
    actualWinning: 0
  })
}

const removeGame = (index: number) => {
  games.value.splice(index, 1)
}

const handleGameResultChange = (game: GameForm) => {
  if (game.result !== '中奖') {
    game.actualWinning = 0
  }
}

const resetForm = () => {
  Object.assign(commonForm, {
    date: '',
    sportType: '',
    league: ''
  })
  games.value = []
}

const handleClose = () => {
  visible.value = false
  resetForm()
}

const handleConfirm = async () => {
  if (!canConfirm.value) {
    ElMessage.warning('请完善所有比赛信息')
    return
  }

  loading.value = true
  try {
    const records = games.value.map(game => ({
      ...commonForm,
      ...game
    }))
    emit('confirm', records)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.batch-add-container {
  max-height: 600px;
  overflow-y: auto;
}

.tips {
  margin-bottom: 20px;
}

.common-info {
  margin-bottom: 20px;
}

.games-list {
  margin-bottom: 20px;
}

.games-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.games-count {
  color: #909399;
  font-size: 14px;
}

.games-container {
  max-height: 400px;
  overflow-y: auto;
}

.game-item {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
  background-color: #fafafa;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.game-title {
  font-weight: bold;
  color: #303133;
}

.empty-games {
  text-align: center;
  padding: 40px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
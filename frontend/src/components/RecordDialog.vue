<template>
  <el-dialog
    v-model="visible"
    :title="record ? '编辑记录' : '添加记录'"
    width="600px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="日期" prop="date">
            <el-date-picker
              v-model="form.date"
              type="date"
              placeholder="选择日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="运动类型" prop="sportType">
            <el-select v-model="form.sportType" placeholder="请选择" style="width: 100%">
              <el-option label="足球" value="足球" />
              <el-option label="篮球" value="篮球" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="联赛" prop="league">
        <el-input v-model="form.league" placeholder="请输入联赛名称" />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="主队" prop="homeTeam">
            <el-input v-model="form.homeTeam" placeholder="请输入主队名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="客队" prop="awayTeam">
            <el-input v-model="form.awayTeam" placeholder="请输入客队名称" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="投注类型" prop="betType">
            <el-select v-model="form.betType" placeholder="请选择" style="width: 100%">
              <el-option label="胜平负" value="胜平负" />
              <el-option label="让球" value="让球" />
              <el-option label="大小球" value="大小球" />
              <el-option label="比分" value="比分" />
              <el-option label="总进球" value="总进球" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="投注选项" prop="betOption">
            <el-input v-model="form.betOption" placeholder="如：主胜、大球等" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="投注金额" prop="betAmount">
            <el-input-number
              v-model="form.betAmount"
              :min="1"
              :precision="2"
              placeholder="请输入投注金额"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="赔率" prop="odds">
            <el-input-number
              v-model="form.odds"
              :min="1"
              :precision="2"
              placeholder="请输入赔率"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="结果" prop="result">
            <el-select v-model="form.result" placeholder="请选择" style="width: 100%" @change="handleResultChange">
              <el-option label="待开奖" value="待开奖" />
              <el-option label="中奖" value="中奖" />
              <el-option label="未中奖" value="未中奖" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="中奖金额" prop="actualWinning" v-if="form.result === '中奖'">
            <el-input-number
              v-model="form.actualWinning"
              :min="0"
              :precision="2"
              placeholder="请输入中奖金额"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="loading">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { BetRecord } from '@/types'

interface Props {
  modelValue: boolean
  record?: BetRecord | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', record: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const loading = ref(false)

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const form = reactive({
  date: '',
  sportType: '',
  league: '',
  homeTeam: '',
  awayTeam: '',
  betType: '',
  betOption: '',
  betAmount: 0,
  odds: 0,
  result: '待开奖',
  actualWinning: 0
})

const rules: FormRules = {
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  sportType: [{ required: true, message: '请选择运动类型', trigger: 'change' }],
  league: [{ required: true, message: '请输入联赛名称', trigger: 'blur' }],
  homeTeam: [{ required: true, message: '请输入主队名称', trigger: 'blur' }],
  awayTeam: [{ required: true, message: '请输入客队名称', trigger: 'blur' }],
  betType: [{ required: true, message: '请选择投注类型', trigger: 'change' }],
  betOption: [{ required: true, message: '请输入投注选项', trigger: 'blur' }],
  betAmount: [{ required: true, message: '请输入投注金额', trigger: 'blur' }],
  odds: [{ required: true, message: '请输入赔率', trigger: 'blur' }],
  result: [{ required: true, message: '请选择结果', trigger: 'change' }],
  actualWinning: [
    {
      validator: (rule, value, callback) => {
        if (form.result === '中奖' && (!value || value <= 0)) {
          callback(new Error('中奖时请输入中奖金额'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const handleResultChange = (value: string) => {
  if (value !== '中奖') {
    form.actualWinning = 0
  }
}

const resetForm = () => {
  Object.assign(form, {
    date: '',
    sportType: '',
    league: '',
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

const handleClose = () => {
  visible.value = false
  resetForm()
}

const handleConfirm = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        emit('confirm', { ...form })
      } finally {
        loading.value = false
      }
    }
  })
}

// 监听record变化，用于编辑模式
watch(() => props.record, (newRecord) => {
  if (newRecord) {
    Object.assign(form, {
      date: newRecord.date,
      sportType: newRecord.sportType,
      league: newRecord.league,
      homeTeam: newRecord.homeTeam,
      awayTeam: newRecord.awayTeam,
      betType: newRecord.betType,
      betOption: newRecord.betOption,
      betAmount: newRecord.betAmount,
      odds: newRecord.odds,
      result: newRecord.result,
      actualWinning: newRecord.actualWinning || 0
    })
  } else {
    resetForm()
  }
}, { immediate: true })
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
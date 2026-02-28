<template>
    <el-dialog v-model="visible" :title="mode === 'create' ? '新建申报' : '修改申报'" width="560px"
        :close-on-click-modal="false" @closed="handleClosed">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="90px" label-position="left">
            <!-- 申报名称 -->
            <el-form-item label="申报名称" prop="title">
                <el-input v-model="form.title" type="textarea" :rows="2" placeholder="请输入申报名称" />
            </el-form-item>

            <!-- 申报项目 -->
            <el-form-item label="选择项目" prop="award_path">
                <el-cascader v-model="form.award_path" :options="cascaderOptions"
                    :props="{ checkStrictly: false, emitPath: true }" clearable style="width: 100%"
                    placeholder="请选择申报项目" @change="handleAwardChange" />
            </el-form-item>

            <!-- 分数 -->
            <el-form-item label="分数" prop="score">
                <div style="width: 100%">
                    <el-input-number v-model="form.score" :min="0"
                        :max="typeof currentMaxScore === 'number' ? currentMaxScore : 99" :precision="2" :step="0.5"
                        placeholder="请输入分数" controls-position="right" style="width: 100%" />
                    <div class="score-hint" v-if="currentScoreInfo">
                        <span>参考分：{{ currentScoreInfo.score }}</span>
                        <span style="margin-left: 16px">最高分：{{ currentScoreInfo.maxScore }}</span>
                    </div>
                </div>
            </el-form-item>

            <!-- 发生日期 -->
            <el-form-item label="发生日期" prop="occurred_at">
                <el-date-picker v-model="form.occurred_at" type="date" placeholder="选择日期" value-format="YYYY-MM-DD"
                    style="width: 100%" />
            </el-form-item>

            <!-- 申报说明 -->
            <el-form-item label="申报说明" prop="description">
                <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入申报说明（选填）" />
            </el-form-item>

            <!-- 附件上传 -->
            <el-form-item label="附件上传">
                <el-upload v-model:file-list="fileList" action="#" :auto-upload="false" :on-change="handleFileChange"
                    :on-remove="handleFileRemove" multiple>
                    <el-button type="primary" plain>选择文件</el-button>
                    <template #tip>
                        <div class="el-upload__tip">支持任意格式，单文件不超过 20MB</div>
                    </template>
                </el-upload>
            </el-form-item>
        </el-form>

        <template #footer>
            <el-button type="primary" text @click="handleClose">返回</el-button>
            <el-button type="primary" :loading="loading" @click="handleSubmit">提交</el-button>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useApplicationStore } from '@/stores/application'
import { getScoreInfoByUid, findCascaderPathByUid } from '@/utils/dealAwardUid'
import fileService from '@/services/fileService'

// ---------- Props ----------
const props = defineProps({
    /** 'create' | 'edit' */
    mode: {
        type: String,
        default: 'create',
    },
    /** 编辑时传入的已有申报数据 */
    initialData: {
        type: Object,
        default: null,
    },
    /** el-cascader 的 options（由父页面按分类生成） */
    cascaderOptions: {
        type: Array,
        default: () => [],
    },
    /** 当前分类，用于根据 uid 反查 cascader 路径 */
    category: {
        type: String,
        default: '',
    },
    /** 当前子类型 */
    subType: {
        type: String,
        default: '',
    },
})

// ---------- Emits ----------
const emit = defineEmits(['success'])

// ---------- Store ----------
const store = useApplicationStore()
const loading = computed(() => store.loading)

// ---------- 弹窗控制 ----------
const visible = ref(false)

async function open() {
    if (props.mode === 'edit' && props.initialData) {
        const d = props.initialData
        form.title = d.title ?? ''
        form.description = d.description ?? ''
        form.occurred_at = d.occurred_at ?? ''
        form.score = d.score ?? null
        // form.version = d.version ?? 0 // version做不完了，不做了先

        // 根据 award_uid 反查 cascader 路径
        if (d.award_uid != null) {
            form.award_path = findCascaderPathByUid(props.category, props.subType, d.award_uid)
            selectedUid.value = d.award_uid
            currentScoreInfo.value = getScoreInfoByUid(d.award_uid)
        } else {
            form.award_path = []
            selectedUid.value = null
            currentScoreInfo.value = null
        }

        // 附件回显：根据 file_id 获取文件信息以展示文件名
        const attachments = d.attachments ?? []
        const resolvedFiles = []
        for (const a of attachments) {
            try {
                const res = await fileService.getFile(a.file_id)
                const fileInfo = res.data ?? res
                resolvedFiles.push({
                    name: fileInfo.filename || a.file_id,
                    url: fileService.getFileUrl(a.file_id),
                    file_id: a.file_id,
                    status: 'success',
                    _uploaded: true, // 标记为已上传的旧文件
                })
            } catch {
                resolvedFiles.push({
                    name: a.file_id,
                    url: '',
                    file_id: a.file_id,
                    status: 'success',
                    _uploaded: true,
                })
            }
        }
        fileList.value = resolvedFiles
    }
    visible.value = true
}

function handleClose() {
    visible.value = false
}

function handleClosed() {
    formRef.value?.resetFields()
    Object.assign(form, defaultForm())
    fileList.value = []
    selectedUid.value = null
    currentScoreInfo.value = null
}

// ---------- 表单 ----------
const formRef = ref(null)

const defaultForm = () => ({
    title: '',
    description: '',
    occurred_at: '',
    award_path: [],
    score: null,
    // version: 0,
})

const form = reactive(defaultForm())

const rules = {
    title: [{ required: true, message: '请输入申报名称', trigger: 'blur' }],
    award_path: [{ required: true, message: '请选择申报项目', trigger: 'change' }],
    score: [{ required: true, message: '请输入分数', trigger: 'blur' }],
}

// ---------- 项目选择 & 分数联动 ----------
const selectedUid = ref(null)
const currentScoreInfo = ref(null)

const currentMaxScore = computed(() => {
    if (!currentScoreInfo.value) return 9999
    const ms = currentScoreInfo.value.maxScore
    return typeof ms === 'number' ? ms : 9999
})

function handleAwardChange(val) {
    if (!val || val.length === 0) {
        selectedUid.value = null
        currentScoreInfo.value = null
        form.score = null
        return
    }
    const leafVal = val[val.length - 1]
    selectedUid.value = leafVal
    const info = getScoreInfoByUid(leafVal)
    currentScoreInfo.value = info

    if (info && typeof info.score === 'number' && typeof info.maxScore === 'number' && info.score === info.maxScore) {
        form.score = info.score
    } else {
        form.score = null
    }
}

// ---------- 文件 ----------
const fileList = ref([])

function handleFileChange(file) {
    // 新选择的本地文件，_uploaded 为 false
    file._uploaded = false
}

function handleFileRemove(file) {
    fileList.value = fileList.value.filter(f => f.uid !== file.uid)
}

// ---------- 上传新文件，返回所有附件的 file_id 列表 ----------
async function uploadNewFiles() {
    const attachments = []
    for (const f of fileList.value) {
        if (f._uploaded && f.file_id) {
            // 已上传的旧文件，直接保留
            attachments.push({ file_id: f.file_id })
        } else if (f.raw) {
            // 新选择的本地文件，需要上传
            try {
                const res = await fileService.upload(f.raw)
                const data = res.data ?? res
                const fileId = data.file_id
                attachments.push({ file_id: fileId })
                // 标记为已上传，避免重复上传
                f._uploaded = true
                f.file_id = fileId
            } catch (err) {
                ElMessage.error(`文件「${f.name}」上传失败`)
                throw err
            }
        }
    }
    return attachments
}

// ---------- 提交 ----------
async function handleSubmit() {
    await formRef.value?.validate(async (valid) => {
        if (!valid) return

        if (selectedUid.value == null) {
            ElMessage.warning('请选择有效的申报项目')
            return
        }

        try {
            // 先上传新文件
            const attachments = await uploadNewFiles()

            const payload = {
                award_uid: selectedUid.value,
                title: form.title,
                description: form.description,
                occurred_at: form.occurred_at,
                score: form.score,
                attachments,
            }

            let result
            if (props.mode === 'create') {
                result = await store.createApplication(payload)
            } else {
                // payload.version = form.version // version做不完了，不做了先
                result = await store.updateApplication(props.initialData.application_id, payload)
            }

            if (result.success) {
                ElMessage.success(props.mode === 'create' ? '申报创建成功' : '申报修改成功')
                visible.value = false
                emit('success')
            } else {
                ElMessage.error(result.error ?? '操作失败')
            }
        } catch {
            // uploadNewFiles 中已提示错误
        }
    })
}

// ---------- 暴露给父组件 ----------
defineExpose({ open })
</script>

<style scoped>
.score-hint {
    margin-top: 4px;
    font-size: 12px;
    color: #909399;
    line-height: 1.6;
}
</style>
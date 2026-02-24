<template>
    <el-dialog v-model="visible" :title="mode === 'create' ? '新建申报' : '修改申报'" width="560px"
        :close-on-click-modal="false" @closed="handleClosed">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="90px" label-position="left">
            <!-- 申报名称 -->
            <el-form-item label="申报名称" prop="title">
                <el-input v-model="form.title" type="textarea" :rows="2" placeholder="请输入申报名称" />
            </el-form-item>

            <!-- 发生日期 -->
            <el-form-item label="发生日期" prop="occurred_at">
                <el-date-picker v-model="form.occurred_at" type="date" placeholder="选择日期" value-format="YYYY-MM-DD"
                    style="width: 100%" />
            </el-form-item>

            <!-- 奖项级别 -->
            <el-form-item label="选择项目" prop="award_path">
                <el-cascader v-model="form.award_path" :options="cascaderOptions"
                    :props="{ checkStrictly: false, emitPath: true }" clearable style="width: 100%"
                    placeholder="请选择申报项目" />
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
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useApplicationStore } from '@/stores/application'

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
})

// ---------- Emits ----------
const emit = defineEmits(['success'])

// ---------- Store ----------
const store = useApplicationStore()
const loading = computed(() => store.loading)

// ---------- 弹窗控制 ----------
const visible = ref(false)

function open() {
    if (props.mode === 'edit' && props.initialData) {
        // 回填数据
        form.title = props.initialData.title ?? ''
        form.description = props.initialData.description ?? ''
        form.occurred_at = props.initialData.occurred_at ?? ''
        form.award_path = props.initialData.award_path ?? []
        form.version = props.initialData.version ?? 1
        // 附件回填（只展示，不重新上传）
        fileList.value = (props.initialData.attachments ?? []).map(a => ({
            name: a.file_id,
            url: '',
            file_id: a.file_id,
        }))
    }
    visible.value = true
}

function handleClose() {
    visible.value = false
}

function handleClosed() {
    // 弹窗完全关闭后重置表单
    formRef.value?.resetFields()
    Object.assign(form, defaultForm())
    fileList.value = []
}

// ---------- 表单 ----------
const formRef = ref(null)

const defaultForm = () => ({
    title: '',
    description: '',
    occurred_at: '',
    award_path: [],   // cascader 路径数组
    version: 1,
})

const form = reactive(defaultForm())

const rules = {
    title: [{ required: true, message: '请输入申报名称', trigger: 'blur' }],
    occurred_at: [{ required: true, message: '请选择发生日期', trigger: 'change' }],
    award_path: [{ required: true, message: '请选择申报项目', trigger: 'change' }],
}

// ---------- 文件 ----------
const fileList = ref([])

function handleFileChange(file) {
    // 此处可对接真实上传接口，获取 file_id
    // 示例中直接用 uid 作占位
    file.file_id = file.uid
}

function handleFileRemove(file) {
    fileList.value = fileList.value.filter(f => f.uid !== file.uid)
}

// ---------- 提交 ----------
async function handleSubmit() {
    await formRef.value?.validate(async (valid) => {
        if (!valid) return

        // 从 award_path 末尾取 award_level
        const award_path = form.award_path
        const award_level = award_path[award_path.length - 1] ?? ''

        const payload = {
            title: form.title,
            description: form.description,
            occurred_at: form.occurred_at,
            award_type: award_path[0] ?? '',
            award_level: String(award_level),
            attachments: fileList.value.map(f => ({ file_id: String(f.file_id ?? f.uid) })),
        }

        let result
        if (props.mode === 'create') {
            result = await store.createApplication(payload)
        } else {
            payload.version = form.version
            result = await store.updateApplication(props.initialData.id, payload)
        }

        if (result.success) {
            ElMessage.success(props.mode === 'create' ? '申报创建成功' : '申报修改成功')
            visible.value = false
            emit('success')
        } else {
            ElMessage.error(result.error ?? '操作失败')
        }
    })
}

// ---------- 暴露给父组件 ----------
defineExpose({ open })
</script>
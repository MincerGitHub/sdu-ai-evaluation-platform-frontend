import express from 'express';

const router = express.Router();

// Mock file data
let files = [];

// Upload file route
router.post('/upload', (req, res) => {
    const { file, category, md5 } = req.body;

    if (!file || !category) {
        return res.status(400).json({
            code: 1001,
            message: '参数校验失败',
            error: {
                field: 'file/category',
                reason: '文件和类别字段必填',
            },
        });
    }

    const newFile = {
        file_id: `f_${files.length + 1}`,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        md5: md5 || null,
        url: `/media/${category}/${new Date().toISOString().split('T')[0]}/${file.name}`,
    };

    files.push(newFile);

    return res.status(201).json({
        code: 0,
        message: '上传成功',
        data: newFile,
    });
});

// Get file download URL
router.get('/:file_id/url', (req, res) => {
    const { file_id } = req.params;
    const file = files.find((f) => f.file_id === file_id);

    if (!file) {
        return res.status(404).json({
            code: 1002,
            message: '资源不存在',
        });
    }

    return res.status(200).json({
        code: 0,
        message: '获取成功',
        data: {
            url: file.url,
        },
    });
});

// Delete file route
router.delete('/:file_id', (req, res) => {
    const { file_id } = req.params;
    const fileIndex = files.findIndex((f) => f.file_id === file_id);

    if (fileIndex === -1) {
        return res.status(404).json({
            code: 1002,
            message: '资源不存在',
        });
    }

    files.splice(fileIndex, 1);

    return res.status(204).send();
});

// List files route
router.get('/', (req, res) => {
    return res.status(200).json({
        code: 0,
        message: '获取成功',
        data: files,
    });
});

export default router;
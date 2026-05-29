import scoreMap from './award_uid_score_map.json'
import { CATEGORY_TREE } from './award-dicts'

/**
 * 将树节点转为 cascader option
 * 叶子节点（有 uid）的 value 设为 uid（数字），非叶子节点 value 设为 id（字符串）
 */
function toCascaderOption(node) {
    const isLeaf = node.uid != null
    const kids = node.children || node.childhren

    const option = {
        value: isLeaf ? node.uid : node.id,
        label: node.name,
        leaf: isLeaf,
    }

    if (!isLeaf && kids && kids.length > 0) {
        option.children = kids.map(toCascaderOption)
    }

    return option
}

/**
 * 按 categoryId + subId 从 CATEGORY_TREE 中提取对应子树的 cascader options
 */
export function getCascaderOptions(categoryId, subId) {
    const category = CATEGORY_TREE.find(c => c.id === categoryId)
    if (!category) return []
    const sub = category.children?.find(s => s.id === subId)
    if (!sub || !sub.children) return []
    return sub.children.map(toCascaderOption)
}

export function getCategoryOptions() {
    return CATEGORY_TREE.map((item) => ({
        label: item.name,
        value: item.id,
        children: (item.children || []).map((child) => ({
            label: child.name,
            value: child.id,
        })),
    }))
}

export function getSubTypeOptions(categoryId) {
    const category = CATEGORY_TREE.find(c => c.id === categoryId)
    return (category?.children || []).map((item) => ({
        label: item.name,
        value: item.id,
    }))
}

/**
 * 根据 uid 从 scoreMap 获取分数信息
 * @param {number|string} uid
 * @returns {{ score: number|string, maxScore: number|string } | null}
 */
export function getScoreInfoByUid(uid) {
    return scoreMap[String(uid)] ?? null
}

function getNodeChildren(node) {
    return node.children || node.childhren || []
}

/**
 * 根据 uid 从完整奖项树中反查叶子节点及路径。
 * ruleName 去掉前两级“大类 / 小类”，用于审核页和 AI 评分拆解展示。
 */
export function findAwardRuleByUid(targetUid) {
    const numericUid = Number(targetUid)
    if (!Number.isFinite(numericUid)) return null

    function dfs(nodes, path, idPath, context) {
        for (const node of nodes) {
            const isLeaf = node.uid != null
            const label = node.name || String(node.id || node.uid || '')
            const value = isLeaf ? node.uid : node.id
            const nextPath = [...path, label]
            const nextIdPath = [...idPath, value]
            const nextContext = { ...context }
            if (path.length === 0 && node.id) nextContext.category = node.id
            if (path.length === 1 && node.id) nextContext.subType = node.id

            if (isLeaf && Number(node.uid) === numericUid) {
                const scoreInfo = getScoreInfoByUid(node.uid) || {}
                const score = node.score ?? node.Score ?? scoreInfo.score ?? null
                const maxScore = node.maxScore ?? node.maxscore ?? scoreInfo.maxScore ?? scoreInfo.max_score ?? score
                return {
                    uid: Number(node.uid),
                    category: nextContext.category || null,
                    subType: nextContext.subType || null,
                    labels: nextPath,
                    ids: nextIdPath,
                    ruleName: nextPath.slice(2).join(' / ') || label,
                    rulePath: nextPath.join(' / '),
                    score,
                    maxScore,
                }
            }

            const children = getNodeChildren(node)
            if (children.length) {
                const result = dfs(children, nextPath, nextIdPath, nextContext)
                if (result) return result
            }
        }
        return null
    }

    return dfs(CATEGORY_TREE, [], [], {}) || null
}

export function formatAwardRuleByUid(uid) {
    const rule = findAwardRuleByUid(uid)
    return rule?.ruleName || ''
}

/**
 * 在子树中递归查找包含指定 uid 的叶子节点，返回从根到叶子的 value 路径
 * 用于编辑回显时，根据后端返回的 award_uid 还原 cascader 选中路径
 */
export function findCascaderPathByUid(categoryId, subId, targetUid) {
    const category = CATEGORY_TREE.find(c => c.id === categoryId)
    if (!category) return []
    const sub = category.children?.find(s => s.id === subId)
    if (!sub || !sub.children) return []

    function dfs(nodes, path) {
        for (const node of nodes) {
            const isLeaf = node.uid != null
            const currentVal = isLeaf ? node.uid : node.id
            const newPath = [...path, currentVal]

            if (isLeaf && node.uid === targetUid) {
                return newPath
            }

            const kids = getNodeChildren(node)
            if (kids && kids.length > 0) {
                const result = dfs(kids, newPath)
                if (result) return result
            }
        }
        return null
    }

    return dfs(sub.children, []) || []
}

/**
 * 根据 cascader 选中路径数组，找到对应叶子节点的 score
 */
export function getScoreByPath(categoryId, subId, valuePath) {
    const category = CATEGORY_TREE.find(c => c.id === categoryId)
    if (!category) return null
    const sub = category.children?.find(s => s.id === subId)
    if (!sub) return null

    let nodes = sub.children || []
    let node = null
    for (const val of valuePath) {
        // val 可能是 uid(number) 或 id(string)
        node = nodes.find(n => (n.uid != null ? n.uid : n.id) === val)
        if (!node) return null
        nodes = getNodeChildren(node)
    }
    return node?.score ?? node?.Score ?? null
}


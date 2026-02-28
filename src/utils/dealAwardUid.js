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

/**
 * 根据 uid 从 scoreMap 获取分数信息
 * @param {number|string} uid
 * @returns {{ score: number|string, maxScore: number|string } | null}
 */
export function getScoreInfoByUid(uid) {
    return scoreMap[String(uid)] ?? null
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

            const kids = node.children || node.childhren
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
        nodes = node.children || node.childhren || []
    }
    return node?.score ?? node?.Score ?? null
}


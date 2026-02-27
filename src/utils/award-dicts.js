//末节点带有score与maxscore，若得分固定，则maxscore = score，若得分不固定，则score为0，maxscore为最高得分
//在创新素养-基础素养-创新创业竞赛中，等级较低的竞赛分数折算后取四位小数，采取四舍五入
export const CATEGORY_TREE = [
    {
        id: 'physical_mental',
        name: '身心素养',
        maxScore: 15,
        children: [
            {
                id: 'basic', name: '基础性评价', maxScore: 9, children: [
                    { uid: 0, id: 'basic', name: '体质测试', Score: 5, maxScore: 5 },
                    { uid: 1, id: 'sports_activity', name: '体育类集体活动', Score: 2, maxScore: 2, maxcount: 2 },
                ],
            },
            {
                id: 'achievement', name: '成果性评价', maxScore: 6, children: [
                    {
                        id: 'sports_competition', name: '体育竞赛', maxScore: 6, children: [
                            {
                                id: 'personal_project', name: '个人项目', childhren: [
                                    { uid: 2, id: 'national', name: '国家级', score: 6, maxscore: 6 },
                                    {
                                        id: 'provincial', name: '省级', children: [
                                            { uid: 3, id: 'first_place', name: '第一名', score: 6, maxScore: 6 },
                                            { uid: 4, id: 'second_place', name: '第二名', score: 5.25, maxscore: 5.25 },
                                            { uid: 5, id: 'third_place', name: '第三名', score: 4.5, maxScore: 4.5 },
                                            { uid: 6, id: 'other_rankings', name: '其它名次', score: 3.75, maxScore: 3.75 },
                                        ],
                                    },
                                ],
                            },
                            {
                                id: 'group_project', name: '集体项目', childhren: [
                                    { uid: 7, id: 'national', name: '国家级', score: 6, maxscore: 6 },
                                    {
                                        id: 'provincial', name: '省级', children: [
                                            { uid: 8, id: 'first_place', name: '第一名', score: 6, maxScore: 6 },
                                            { uid: 9, id: 'second_place', name: '第二名', score: 5.25, maxscore: 5.25 },
                                            { uid: 10, id: 'third_place', name: '第三名', score: 4.5, maxScore: 4.5 },
                                            { uid: 11, id: 'other_rankings', name: '其它名次', score: 3.75, maxScore: 3.75 },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 'art',
        name: '文艺素养',
        maxScore: 15,
        children: [
            { id: 'basic', name: '基础性评价', maxScore: 9 },
            { id: 'achievement', name: '成果性评价', maxScore: 6 },
        ],
    },
    {
        id: 'labor',
        name: '劳动素养',
        maxScore: 25,
        children: [
            { id: 'basic', name: '基础性评价', maxScore: 15 },
            { id: 'achievement', name: '成果性评价', maxScore: 10 },
        ],
    },
    {
        id: 'innovation',
        name: '创新素养',
        maxScore: 45,
        children: [
            { id: 'foundation', name: '基础素养', maxScore: 5 },
            { id: 'breakthrough', name: '突破提升', maxScore: 40 },
        ],
    },
]

import scoreMap from './award_uid_score_map.json'

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
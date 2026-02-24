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
                    { id: 'basic', name: '体质测试', Score: 5, maxScore: 5 },
                    { id: 'sports_activity', name: '体育类集体活动', Score: 2, maxScore: 2, maxcount: 2 },   //体育类集体活动参加一次积2分     
                ],
            },
            {
                id: 'achievement', name: '成果性评价', maxScore: 6, children: [
                    {
                        id: 'sports_competition', name: '体育竞赛', maxScore: 6, children: [
                            {
                                id: 'personal_project', name: '个人项目', childhren: [
                                    { id: 'national', name: '国家级', score: 6, maxscore: 6 },
                                    {
                                        id: 'provincial', name: '省级', children: [
                                            { id: 'first_place', name: '第一名', score: 6, maxScore: 6 },
                                            { id: 'second_place', name: '第二名', score: 5.25, maxscore: 5.25 },
                                            { id: 'third_place', name: '第三名', score: 4.5, maxScore: 4.5 },
                                            { id: 'other_rankings', name: '其它名次', score: 3.75, maxScore: 3.75 },
                                        ],
                                    },
                                    {
                                        id: 'university_level', name: '校级/校区级', children: [
                                            { id: 'first_place', name: '第一名', score: 4.5, maxScore: 4.5 },
                                            { id: 'second_place', name: '第二名', score: 3.75, maxscore: 3.75 },
                                            { id: 'third_place', name: '第三名', score: 3, maxScore: 3 },
                                            { id: 'other_rankings', name: '其它名次', score: 2.25, maxScore: 2.25 },
                                        ],
                                    },
                                    {
                                        id: 'department_level', name: '院级/书院级', children: [
                                            { id: 'first_place', name: '第一名', score: 2.25, maxScore: 2.25 },
                                            { id: 'second_place', name: '第二名', score: 1.5, maxscore: 1.5 },
                                            { id: 'third_place', name: '第三名', score: 0.75, maxScore: 0.75 },
                                            { id: 'other_rankings', name: '其它名次', score: 0.375, maxScore: 0.375 },
                                        ],
                                    },
                                    { id: 'participated', name: '参与未获奖', score: 0.3, maxscore: 0.3 },
                                ],
                            },
                            {
                                id: 'group_project', name: '集体项目', childhren: [
                                    { id: 'national', name: '国家级', score: 6, maxscore: 6 },
                                    {
                                        id: 'provincial', name: '省级', children: [
                                            { id: 'first_place', name: '第一名', score: 6, maxScore: 6 },
                                            { id: 'second_place', name: '第二名', score: 5.25, maxscore: 5.25 },
                                            { id: 'third_place', name: '第三名', score: 4.5, maxScore: 4.5 },
                                            { id: 'other_rankings', name: '其它名次', score: 3.75, maxScore: 3.75 },
                                        ],
                                    },
                                    {
                                        id: 'university_level', name: '校级/校区级', children: [
                                            { id: 'first_place', name: '第一名', score: 5.25, maxScore: 5.25 },
                                            { id: 'second_place', name: '第二名', score: 4.5, maxscore: 4.5 },
                                            { id: 'third_place', name: '第三名', score: 3.75, maxScore: 3.75 },
                                            { id: 'other_rankings', name: '其它名次', score: 3, maxScore: 3 },
                                        ],
                                    },
                                    {
                                        id: 'department_level', name: '院级/书院级', children: [
                                            { id: 'first_place', name: '第一名', score: 3, maxScore: 3 },
                                            { id: 'second_place', name: '第二名', score: 2.25, maxscore: 2.25 },
                                            { id: 'third_place', name: '第三名', score: 1.5, maxScore: 1.5 },
                                            { id: 'other_rankings', name: '其它名次', score: 0.75, maxScore: 0.75 },
                                        ],
                                    },
                                    { id: 'participated', name: '参与未获奖', score: 0.3, maxscore: 0.3 },
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

function toCascaderOption(node) {
    const option = {
        value: node.id,
        label: node.name + (node.score != null ? `（${node.score}分）` : node.maxScore != null ? `（上限${node.maxScore}分）` : ''),
        // 没有 children 才可选
        disabled: !!(node.children || node.childhren),
    }
    const kids = node.children || node.childhren
    if (kids && kids.length > 0) {
        option.children = kids.map(toCascaderOption)
    }
    return option
}

/**
 * 按 categoryId + subId 从 CATEGORY_TREE 中提取对应子树的 cascader options
 * @param {string} categoryId  e.g. 'physical_mental'
 * @param {string} subId       e.g. 'basic' | 'achievement'
 * @returns {Array} cascader options
 */
export function getCascaderOptions(categoryId, subId) {
    const category = CATEGORY_TREE.find(c => c.id === categoryId)
    if (!category) return []
    const sub = category.children?.find(s => s.id === subId)
    if (!sub || !sub.children) return []
    return sub.children.map(toCascaderOption)
}

/**
 * 根据 cascader 选中路径数组，找到对应叶子节点的 score
 * @param {string} categoryId
 * @param {string} subId
 * @param {string[]} valuePath  cascader v-model 的值数组
 * @returns {number|null}
 */
export function getScoreByPath(categoryId, subId, valuePath) {
    const category = CATEGORY_TREE.find(c => c.id === categoryId)
    if (!category) return null
    const sub = category.children?.find(s => s.id === subId)
    if (!sub) return null

    let nodes = sub.children || []
    let node = null
    for (const id of valuePath) {
        node = nodes.find(n => n.id === id)
        if (!node) return null
        nodes = node.children || node.childhren || []
    }
    return node?.score ?? node?.Score ?? null
}
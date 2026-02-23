export const CATEGORY_TREE = [
    {
        id: 'physical_mental',
        name: '身心素养',
        maxScore: 15,
        children: [
            {
                id: 'basic', name: '基础性评价', maxScore: 9, children: [
                    // 在此处完善各项目
                ]
            },
            { id: 'achievement', name: '成果性评价', maxScore: 6 },
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
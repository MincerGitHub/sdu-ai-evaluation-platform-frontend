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
                    { uid: 1, id: 'basic', name: '体质测试', score: 5, maxScore: 5 }, // 修正Score为score + 加uid
                    { uid: 2, id: 'sports_activity', name: '体育类集体活动', score: 2, maxScore: 2, maxcount: 2 },   //体育类集体活动参加一次积2分 + 修正Score为score + 加uid
                ],
            },
            {
                id: 'achievement', name: '成果性评价', maxScore: 6, children: [
                    {
                        id: 'sports_competition', name: '体育竞赛', maxScore: 6, children: [
                            {
                                id: 'personal_project', name: '个人项目', children: [ // 修正childhren为children
                                    { uid: 3, id: 'national', name: '国家级', score: 6, maxscore: 6 },
                                    {
                                        id: 'provincial', name: '省级', children: [
                                            { uid: 4, id: 'first_place', name: '第一名', score: 6, maxScore: 6 },
                                            { uid: 5, id: 'second_place', name: '第二名', score: 5.25, maxscore: 5.25 },
                                            { uid: 6, id: 'third_place', name: '第三名', score: 4.5, maxScore: 4.5 },
                                            { uid: 7, id: 'other_rankings', name: '其它名次', score: 3.75, maxScore: 3.75 },
                                        ],
                                    },
                                    {
                                        id: 'university_level', name: '校级/校区级', children: [
                                            { uid: 8, id: 'first_place', name: '第一名', score: 4.5, maxScore: 4.5 },
                                            { uid: 9, id: 'second_place', name: '第二名', score: 3.75, maxscore: 3.75 },
                                            { uid: 10, id: 'third_place', name: '第三名', score: 3, maxScore: 3 },
                                            { uid: 11, id: 'other_rankings', name: '其它名次', score: 2.25, maxScore: 2.25 },
                                        ],
                                    },
                                    {
                                        id: 'department_level', name: '院级/书院级', children: [
                                            { uid: 12, id: 'first_place', name: '第一名', score: 2.25, maxScore: 2.25 },
                                            { uid: 13, id: 'second_place', name: '第二名', score: 1.5, maxscore: 1.5 },
                                            { uid: 14, id: 'third_place', name: '第三名', score: 0.75, maxScore: 0.75 },
                                            { uid: 15, id: 'other_rankings', name: '其它名次', score: 0.375, maxScore: 0.375 },
                                        ],
                                    },
                                    { uid: 16, id: 'participated', name: '参与未获奖', score: 0.3, maxscore: 0.3 },
                                ],
                            },
                            {
                                id: 'group_project', name: '集体项目', children: [ // 修正childhren为children
                                    { uid: 17, id: 'national', name: '国家级', score: 6, maxscore: 6 },
                                    {
                                        id: 'provincial', name: '省级', children: [
                                            { uid: 18, id: 'first_place', name: '第一名', score: 6, maxScore: 6 },
                                            { uid: 19, id: 'second_place', name: '第二名', score: 5.25, maxscore: 5.25 },
                                            { uid: 20, id: 'third_place', name: '第三名', score: 4.5, maxScore: 4.5 },
                                            { uid: 21, id: 'other_rankings', name: '其它名次', score: 3.75, maxScore: 3.75 },
                                        ],
                                    },
                                    {
                                        id: 'university_level', name: '校级/校区级', children: [
                                            { uid: 22, id: 'first_place', name: '第一名', score: 5.25, maxScore: 5.25 },
                                            { uid: 23, id: 'second_place', name: '第二名', score: 4.5, maxscore: 4.5 },
                                            { uid: 24, id: 'third_place', name: '第三名', score: 3.75, maxScore: 3.75 },
                                            { uid: 25, id: 'other_rankings', name: '其它名次', score: 3, maxScore: 3 },
                                        ],
                                    },
                                    {
                                        id: 'department_level', name: '院级/书院级', children: [
                                            { uid: 26, id: 'first_place', name: '第一名', score: 3, maxScore: 3 },
                                            { uid: 27, id: 'second_place', name: '第二名', score: 2.25, maxscore: 2.25 },
                                            { uid: 28, id: 'third_place', name: '第三名', score: 1.5, maxScore: 1.5 },
                                            { uid: 29, id: 'other_rankings', name: '其它名次', score: 0.75, maxScore: 0.75 },
                                        ],
                                    },
                                    { uid: 30, id: 'participated', name: '参与未获奖', score: 0.3, maxscore: 0.3 },
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
            {
                id: 'basic', name: '基础性评价', maxScore: 9, children: [
                    { uid: 31, id: 'art_activities', name: '艺术类活动', score: 1.5, maxScore: 1.5 },      //艺术类活动包括但不限于：观摩画展，艺术讲座，文艺演出，文艺竞赛，加入艺术类社团或团队 + 修正Score为score + 加uid
                ],
            },
            {
                id: 'achievement', name: '成果性评价', maxScore: 6, children: [ // 修正childhren为children
                    //赛事种类包括但不限于：合唱比赛，器乐比赛，才艺比赛，社团风采比赛，征文比赛，演讲比赛，知识竞赛，辩论赛，宿舍文化节
                    {
                        id: 'art_competition', name: '艺术竞赛', maxScore: 6, children: [
                            {
                                id: 'personal_project', name: '个人项目', children: [ // 修正childhren为children
                                    { uid: 32, id: 'national', name: '国家级', score: 6, maxscore: 6 },
                                    {
                                        id: 'provincial', name: '省级', children: [
                                            { uid: 33, id: 'first_place', name: '第一名', score: 6, maxScore: 6 },
                                            { uid: 34, id: 'second_place', name: '第二名', score: 5.25, maxscore: 5.25 },
                                            { uid: 35, id: 'third_place', name: '第三名', score: 4.5, maxScore: 4.5 },
                                            { uid: 36, id: 'other_rankings', name: '其它名次', score: 3.75, maxScore: 3.75 },
                                        ],
                                    },
                                    {
                                        id: 'university_level', name: '校级/校区级', children: [
                                            { uid: 37, id: 'first_place', name: '第一名', score: 4.5, maxScore: 4.5 },
                                            { uid: 38, id: 'second_place', name: '第二名', score: 3.75, maxscore: 3.75 },
                                            { uid: 39, id: 'third_place', name: '第三名', score: 3, maxScore: 3 },
                                            { uid: 40, id: 'other_rankings', name: '其它名次', score: 2.25, maxScore: 2.25 },
                                        ],
                                    },
                                    {
                                        id: 'department_level', name: '院级/书院级', children: [
                                            { uid: 41, id: 'first_place', name: '第一名', score: 2.25, maxScore: 2.25 },
                                            { uid: 42, id: 'second_place', name: '第二名', score: 1.5, maxscore: 1.5 },
                                            { uid: 43, id: 'third_place', name: '第三名', score: 0.75, maxScore: 0.75 },
                                            { uid: 44, id: 'other_rankings', name: '其它名次', score: 0.375, maxScore: 0.375 },
                                        ],
                                    },
                                    { uid: 45, id: 'participated', name: '参与未获奖', score: 0.3, maxscore: 0.3 },
                                ],
                            },
                            {
                                id: 'group_project', name: '集体项目', children: [ // 修正childhren为children
                                    { uid: 46, id: 'national', name: '国家级', score: 6, maxscore: 6 },
                                    {
                                        id: 'provincial', name: '省级', children: [
                                            { uid: 47, id: 'first_place', name: '第一名', score: 6, maxScore: 6 },
                                            { uid: 48, id: 'second_place', name: '第二名', score: 5.25, maxscore: 5.25 },
                                            { uid: 49, id: 'third_place', name: '第三名', score: 4.5, maxScore: 4.5 },
                                            { uid: 50, id: 'other_rankings', name: '其它名次', score: 3.75, maxScore: 3.75 },
                                        ],
                                    },
                                    {
                                        id: 'university_level', name: '校级/校区级', children: [
                                            { uid: 51, id: 'first_place', name: '第一名', score: 5.25, maxScore: 5.25 },
                                            { uid: 52, id: 'second_place', name: '第二名', score: 4.5, maxscore: 4.5 },
                                            { uid: 53, id: 'third_place', name: '第三名', score: 3.75, maxScore: 3.75 },
                                            { uid: 54, id: 'other_rankings', name: '其它名次', score: 3, maxScore: 3 },
                                        ],
                                    },
                                    {
                                        id: 'department_level', name: '院级/书院级', children: [
                                            { uid: 55, id: 'first_place', name: '第一名', score: 3, maxScore: 3 },
                                            { uid: 56, id: 'second_place', name: '第二名', score: 2.25, maxscore: 2.25 },
                                            { uid: 57, id: 'third_place', name: '第三名', score: 1.5, maxScore: 1.5 },
                                            { uid: 58, id: 'other_rankings', name: '其它名次', score: 0.75, maxScore: 0.75 },
                                        ],
                                    },
                                    { uid: 59, id: 'participated', name: '参与未获奖', score: 0.3, maxscore: 0.3 },
                                ],
                            },  //集体项目（四人及以上项目）若以名次计，第一名按一等奖加分，第2，3名按二等奖加分，第4-6名按三等奖加分，第七名及以后按优秀奖加分，特等奖按一等奖加分
                        ],
                    },
                ],
            },
        ],
    },

    {
        id: 'labor',
        name: '劳动素养',
        maxScore: 25,
        children: [
            {
                id: 'basic', name: '基础性评价', maxScore: 15, children: [
                    { uid: 60, id: 'volunteer', name: '志愿时长', score: 0, maxScore: 5 },      //学生每学年完成40小时志愿活动可得5分，缺失每小时扣0.25分 + 修正Score为score + 加uid
                    { uid: 61, id: 'social_practice', name: '社会实践', score: 5, maxScore: 5 }, // 修正Score为score + 加uid
                    { uid: 62, id: 'dorm_work', name: '宿舍安全卫生', score: 0, maxScore: 5 },    //满分5分，卫生不合格者一次扣2次，若累计扣分超过5分则从剩余剩余得分中扣除，基础性评价总分15分扣完为止 + 修正Score为score + 加uid
                ],                                                                         //卫生不合格：检查中公共区域扣分超过10分（不包括10分）记一次宿舍全体不合格
            },
            {
                id: 'achievement', name: '成果性评价', maxScore: 10, children: [
                    {
                        id: 'security_work', name: '社会工作', children: [
                            { uid: 63, id: 'student_organization_management', name: '学生组织管理工作', score: 4, maxScore: 4 },//参与学校，校区，书院，学院，班级，社团等各级学生组织组织管理工作 + 修正Score为score + 加uid
                            {
                                id: 'personal_honors', name: '任职期间获得个人荣誉', children: [ // 修正childhren为children
                                    { uid: 64, id: 'national', name: '国家级', score: 10, maxscore: 10 },
                                    { uid: 65, id: 'provincial', name: '省级', score: 8.5, maxScore: 8.5 },
                                    { uid: 66, id: 'municipal', name: '市级', score: 7, maxScore: 7 },
                                    { uid: 67, id: 'university_level', name: '校级/校区级', score: 5.5, maxScore: 5.5 },
                                    { uid: 68, id: 'department_level', name: '院级/书院级', score: 4, maxScore: 4 },
                                ],
                            },
                            {
                                id: 'group_honors', name: '任职期间获得集体荣誉', children: [         //主要负责人取maxscore，其他干部根据实际情况按1.5递减 + 修正childhren为children
                                    { uid: 69, id: 'national', name: '国家级', score: 0, maxscore: 10 },
                                    { uid: 70, id: 'provincial', name: '省级', score: 0, maxScore: 8.5 },
                                    { uid: 71, id: 'municipal', name: '市级', score: 0, maxScore: 7 },
                                    { uid: 72, id: 'university_level', name: '校级/校区级', score: 0, maxScore: 5.5 },
                                    { uid: 73, id: 'department_level', name: '院级/书院级', score: 0, maxScore: 4 },
                                ],
                            },
                        ],
                    },
                    {
                        id: 'social_practice', name: '社会实践', children: [
                            {
                                id: 'personal_honors', name: '个人', children: [ // 修正childhren为children
                                    { uid: 74, id: 'national', name: '国家级', score: 10, maxscore: 10 },
                                    { uid: 75, id: 'provincial', name: '省级', score: 8.5, maxScore: 8.5 },
                                    { uid: 76, id: 'municipal', name: '市级', score: 7, maxScore: 7 },
                                    { uid: 77, id: 'university_level', name: '校级/校区级', score: 5.5, maxScore: 5.5 },
                                    { uid: 78, id: 'department_level', name: '院级/书院级', score: 4, maxScore: 4 },
                                ],
                            },
                            {
                                id: 'group_honors', name: '集体', children: [ // 修正childhren为children
                                    {
                                        id: 'national', name: '国家级', children: [
                                            { uid: 79, id: 'leader', name: '负责人', score: 10, maxScore: 10 },
                                            { uid: 80, id: 'second_place', name: '第二成员', score: 8.5, maxscore: 8.5 },
                                            { uid: 81, id: 'third_place', name: '第三成员', score: 7, maxScore: 7 },
                                            { uid: 82, id: 'other_rankings', name: '其它成员', score: 5.5, maxScore: 5.5 },
                                        ],
                                    },
                                    {
                                        id: 'provincial', name: '省级', children: [
                                            { uid: 83, id: 'leader', name: '负责人', score: 8.5, maxScore: 8.5 },
                                            { uid: 84, id: 'second_place', name: '第二成员', score: 7, maxscore: 7 },
                                            { uid: 85, id: 'third_place', name: '第三成员', score: 5.5, maxScore: 5.5 },
                                            { uid: 86, id: 'other_rankings', name: '其它成员', score: 4, maxScore: 4 },
                                        ],
                                    },
                                    {
                                        id: 'municipal', name: '市级', children: [
                                            { uid: 87, id: 'leader', name: '负责人', score: 7, maxScore: 7 },
                                            { uid: 88, id: 'second_place', name: '第二成员', score: 5.5, maxscore: 5.5 },
                                            { uid: 89, id: 'third_place', name: '第三成员', score: 4, maxScore: 4 },
                                            { uid: 90, id: 'other_rankings', name: '其它成员', score: 2.5, maxScore: 2.5 },
                                        ],
                                    },
                                    {
                                        id: 'university_level', name: '校级/校区级', children: [
                                            { uid: 91, id: 'leader', name: '负责人', score: 5.5, maxScore: 5.5 },
                                            { uid: 92, id: 'second_place', name: '第二成员', score: 4, maxscore: 4 },
                                            { uid: 93, id: 'third_place', name: '第三成员', score: 2.5, maxScore: 2.5 },
                                            { uid: 94, id: 'other_rankings', name: '其它成员', score: 1, maxScore: 1 },
                                        ],
                                    },
                                    {
                                        id: 'department_level', name: '院级/书院级', children: [
                                            { uid: 95, id: 'leader', name: '负责人', score: 4, maxScore: 4 },
                                            { uid: 96, id: 'second_place', name: '第二成员', score: 2.5, maxscore: 2.5 },
                                            { uid: 97, id: 'third_place', name: '第三成员', score: 1, maxScore: 1 },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 'volunteer', name: '志愿活动', children: [
                            {
                                id: 'personal_honors', name: '个人', children: [ // 修正childhren为children
                                    { uid: 98, id: 'national', name: '国家级', score: 10, maxscore: 10 },
                                    { uid: 99, id: 'provincial', name: '省级', score: 8.5, maxScore: 8.5 },
                                    { uid: 100, id: 'municipal', name: '市级', score: 7, maxScore: 7 },
                                    { uid: 101, id: 'university_level', name: '校级/校区级', score: 5.5, maxScore: 5.5 },
                                    { uid: 102, id: 'department_level', name: '院级/书院级', score: 4, maxScore: 4 },
                                ],
                            },
                            {
                                id: 'group_honors', name: '集体', children: [ // 修正childhren为children
                                    {
                                        id: 'national', name: '国家级', children: [
                                            { uid: 103, id: 'leader', name: '负责人', score: 10, maxScore: 10 },
                                            { uid: 104, id: 'second_place', name: '第二成员', score: 8.5, maxscore: 8.5 },
                                            { uid: 105, id: 'third_place', name: '第三成员', score: 7, maxScore: 7 },
                                            { uid: 106, id: 'other_rankings', name: '其它成员', score: 5.5, maxScore: 5.5 },
                                        ],
                                    },
                                    {
                                        id: 'provincial', name: '省级', children: [
                                            { uid: 107, id: 'leader', name: '负责人', score: 8.5, maxScore: 8.5 },
                                            { uid: 108, id: 'second_place', name: '第二成员', score: 7, maxscore: 7 },
                                            { uid: 109, id: 'third_place', name: '第三成员', score: 5.5, maxScore: 5.5 },
                                            { uid: 110, id: 'other_rankings', name: '其它成员', score: 4, maxScore: 4 },
                                        ],
                                    },
                                    {
                                        id: 'municipal', name: '市级', children: [
                                            { uid: 111, id: 'leader', name: '负责人', score: 7, maxScore: 7 },
                                            { uid: 112, id: 'second_place', name: '第二成员', score: 5.5, maxscore: 5.5 },
                                            { uid: 113, id: 'third_place', name: '第三成员', score: 4, maxScore: 4 },
                                            { uid: 114, id: 'other_rankings', name: '其它成员', score: 2.5, maxScore: 2.5 },
                                        ],
                                    },
                                    {
                                        id: 'university_level', name: '校级/校区级', children: [
                                            { uid: 115, id: 'leader', name: '负责人', score: 5.5, maxScore: 5.5 },
                                            { uid: 116, id: 'second_place', name: '第二成员', score: 4, maxscore: 4 },
                                            { uid: 117, id: 'third_place', name: '第三成员', score: 2.5, maxScore: 2.5 },
                                            { uid: 118, id: 'other_rankings', name: '其它成员', score: 1, maxScore: 1 },
                                        ],
                                    },
                                    {
                                        id: 'department_level', name: '院级/书院级', children: [
                                            { uid: 119, id: 'leader', name: '负责人', score: 4, maxScore: 4 },
                                            { uid: 120, id: 'second_place', name: '第二成员', score: 2.5, maxscore: 2.5 },
                                            { uid: 121, id: 'third_place', name: '第三成员', score: 1, maxScore: 1 },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 'dorm_work', name: '宿舍劳动', children: [
                            {
                                id: 'personal', name: '个人', children: [
                                    { uid: 122, id: 'first_prize', name: '一等奖', score: 4, maxScore: 4 },
                                    { uid: 123, id: 'second_prize', name: '二等奖', score: 3.5, maxScore: 3.5 },
                                    { uid: 124, id: 'third_prize', name: '三等奖', score: 3, maxScore: 3 },
                                    { uid: 125, id: 'participated', name: '参与未获奖', score: 2, maxScore: 2 },
                                ],
                            },
                            {
                                id: 'group', name: '集体', children: [
                                    {
                                        id: 'first_prize', name: '一等奖', children: [
                                            { uid: 126, id: 'leader', name: '负责人', score: 4, maxScore: 4 },
                                            { uid: 127, id: 'others', name: '其他成员', score: 3.5, maxscore: 3.5 },
                                        ],
                                    },
                                    {
                                        id: 'second_prize', name: '二等奖', children: [
                                            { uid: 128, id: 'leader', name: '负责人', score: 3.5, maxScore: 3.5 },
                                            { uid: 129, id: 'others', name: '其他成员', score: 3, maxscore: 3 },
                                        ],
                                    },
                                    {
                                        id: 'third_prize', name: '三等奖', children: [
                                            { uid: 130, id: 'leader', name: '负责人', score: 3, maxScore: 3 },
                                            { uid: 131, id: 'others', name: '其他成员', score: 2.5, maxscore: 2.5 },
                                        ],
                                    },
                                    { uid: 132, id: 'participated', name: '参与未获奖', score: 2, maxScore: 2 },
                                ],
                            },
                        ],
                    },
                    {
                        id: 'career_development', name: '生涯发展', children: [
                            {
                                id: 'personal_project', name: '个人项目', children: [ // 修正childhren为children
                                    {
                                        id: 'national', name: '国家级', children: [
                                            { uid: 133, id: 'first_prize', name: '一等奖', score: 10, maxScore: 10 },
                                            { uid: 134, id: 'second_prize', name: '二等奖', score: 8.5, maxscore: 8.5 },
                                            { uid: 135, id: 'third_prize', name: '三等奖', score: 7, maxScore: 7 },
                                        ],
                                    },
                                    {
                                        id: 'provincial', name: '省级', children: [
                                            { uid: 136, id: 'first_prize', name: '一等奖', score: 8.5, maxScore: 8.5 },
                                            { uid: 137, id: 'second_prize', name: '二等奖', score: 7, maxscore: 7 },
                                            { uid: 138, id: 'third_prize', name: '三等奖', score: 5.5, maxScore: 5.5 },
                                        ],
                                    },
                                    {
                                        id: 'municipal', name: '市级', children: [
                                            { uid: 139, id: 'first_prize', name: '一等奖', score: 7, maxScore: 7 },
                                            { uid: 140, id: 'second_prize', name: '二等奖', score: 5.5, maxscore: 5.5 },
                                            { uid: 141, id: 'third_prize', name: '三等奖', score: 4, maxScore: 4 },
                                        ],
                                    },
                                    {
                                        id: 'university_level', name: '校级/校区级', children: [
                                            { uid: 142, id: 'first_prize', name: '一等奖', score: 5.5, maxScore: 5.5 },
                                            { uid: 143, id: 'second_prize', name: '二等奖', score: 4, maxscore: 4 },
                                            { uid: 144, id: 'third_prize', name: '三等奖', score: 2.5, maxScore: 2.5 },
                                        ],
                                    },
                                    {
                                        id: 'department_level', name: '院级/书院级', children: [
                                            { uid: 145, id: 'first_prize', name: '一等奖', score: 4, maxScore: 4 },
                                            { uid: 146, id: 'second_prize', name: '二等奖', score: 2.5, maxscore: 2.5 },
                                            { uid: 147, id: 'third_prize', name: '三等奖', score: 1, maxScore: 1 },
                                        ],
                                    },
                                ],
                            },
                            {
                                id: 'group_project', name: '集体项目', children: [         //主要负责人取maxscore，其他成员根据实际情况按1.5递减 + 修正childhren为children
                                    { uid: 148, id: 'national', name: '国家级', score: 0, maxscore: 10 },
                                    { uid: 149, id: 'provincial', name: '省级', score: 0, maxScore: 8.5 },
                                    { uid: 150, id: 'municipal', name: '市级', score: 0, maxScore: 7 },
                                    { uid: 151, id: 'university_level', name: '校级/校区级', score: 0, maxScore: 5.5 },
                                    { uid: 152, id: 'department_level', name: '院级/书院级', score: 0, maxScore: 4 },
                                ],
                            },
                        ],
                    },
                    { uid: 153, id: 'discharge', name: '退役复学', score: 10, maxscore: 10 },
                    { uid: 154, id: 'students farm', name: '学生农场', score: 0, maxscore: 5 },      //劳动时长超过37h后可得满分，33h-36h可得4.5分,依次向下递减
                ],
            },
        ],
    },

    {
        id: 'innovation',
        name: '创新素养',
        maxScore: 45,
        children: [
            {
                id: 'basic', name: '基础素养', maxScore: 5, children: [
                    {
                        id: 'social_and_innovation_project', name: '科创项目赋分', children: [
                            {
                                id: 'national', name: '国家级', children: [
                                    { uid: 155, id: 'leader', name: '主持人', score: 4, maxScore: 4 },
                                    { uid: 156, id: 'second_third_fourth_place', name: '第二成员,第三成员和第四成员', score: 0.8, maxScore: 0.8 },
                                    { uid: 157, id: 'others', name: '其他成员', score: 0.5, maxScore: 0.5 },
                                ],
                            },
                            {
                                id: 'provincial', name: '省级', children: [
                                    { uid: 158, id: 'leader', name: '主持人', score: 3, maxScore: 3 },
                                    { uid: 159, id: 'second_third_fourth_place', name: '第二成员,第三成员和第四成员', score: 0.5, maxScore: 0.5 },
                                    { uid: 160, id: 'others', name: '其他成员', score: 0.3, maxScore: 0.3 },
                                ],
                            },
                            {
                                id: 'university_level', name: '校级', children: [
                                    { uid: 161, id: 'leader', name: '主持人', score: 2, maxScore: 2 },
                                    { uid: 162, id: 'second_third_fourth_place', name: '第二成员,第三成员和第四成员', score: 0.3, maxScore: 0.3 },
                                    { uid: 163, id: 'others', name: '其他成员', score: 0.2, maxScore: 0.2 },
                                ],
                            },
                            {
                                id: 'department_level', name: '院级', children: [
                                    { uid: 164, id: 'leader', name: '主持人', score: 1, maxScore: 1 },
                                    { uid: 165, id: 'second_third_fourth_place', name: '第二成员,第三成员和第四成员', score: 0.2, maxScore: 0.2 },
                                    { uid: 166, id: 'others', name: '其他成员', score: 0.1, maxScore: 0.1 },
                                ],
                            },
                        ],
                    },
                    {
                        id: 'paper', name: '论文发表', children: [
                            {
                                id: 'CSSCI_liberal_arts', name: 'CSSCI(文科)', children: [
                                    { uid: 167, id: 'first_auther', name: '第一作者', score: 5, maxScore: 5 },
                                    { uid: 168, id: 'second_auther', name: '第二作者', score: 1.5, maxScore: 1.5 },
                                    { uid: 169, id: 'other_auther', name: '其他作者', score: 0.5, maxScore: 0.5 },
                                ],
                            },
                            {
                                id: 'CSSCI_extended_liberal_arts', name: 'CSSCI_extended(文科)', children: [
                                    { uid: 170, id: 'first_auther', name: '第一作者', score: 3, maxScore: 3 },
                                    { uid: 171, id: 'second_auther', name: '第二作者', score: 1, maxScore: 1 },
                                    { uid: 172, id: 'other_auther', name: '其他作者', score: 0.3, maxScore: 0.3 },
                                ],
                            },
                            {
                                id: 'SCI_EI_science', name: 'SCI_EI(理科)', children: [
                                    { uid: 173, id: 'first_auther', name: '第一作者', score: 4, maxScore: 4 },
                                    { uid: 174, id: 'second_auther', name: '第二作者', score: 2.8, maxScore: 2.8 },
                                    { uid: 175, id: 'other_auther', name: '其他作者', score: 2.5, maxScore: 2.5 },
                                ],
                            },
                            {
                                id: 'SCI_EI_engineering', name: 'SCI_EI(工科)', children: [
                                    { uid: 176, id: 'first_auther', name: '第一作者', score: 5, maxScore: 5 },
                                    { uid: 177, id: 'second_auther', name: '第二作者', score: 0.5, maxScore: 0.5 },
                                    { uid: 178, id: 'other_auther', name: '其他作者', score: 0.15, maxScore: 0.15 },
                                ],
                            },
                            {
                                id: 'SCI_EI_medicine', name: 'SCI_EI(医科)', children: [                               //X为影响因子
                                    { uid: 179, id: 'first_auther', name: '第一作者', score: 3.5, maxScore: 33.5 },
                                    { uid: 180, id: 'second_auther', name: '第二作者', score: 2, maxScore: 32 },
                                    { uid: 181, id: 'other_auther', name: '其他作者', score: 0.5, maxScore: 30.5 },
                                ],
                            },
                            {
                                id: 'CCF_A', name: 'CCF A类会议论文及期刊论文', children: [
                                    { uid: 182, id: 'first_auther', name: '第一作者', score: 5, maxScore: 5 },
                                    { uid: 183, id: 'second_auther', name: '第二作者', score: 0.5, maxScore: 0.5 },
                                    { uid: 184, id: 'other_auther', name: '其他作者', score: 0.15, maxScore: 0.15 },
                                ],
                            },
                            {
                                id: 'CCF_B', name: 'CCF B类会议论文及期刊论文', children: [
                                    { uid: 185, id: 'first_auther', name: '第一作者', score: 4, maxScore: 4 },
                                    { uid: 186, id: 'second_auther', name: '第二作者', score: 0.4, maxScore: 0.4 },
                                    { uid: 187, id: 'other_auther', name: '其他作者', score: 0.13, maxScore: 0.13 },
                                ],
                            },
                            {
                                id: 'CCF_C', name: 'CCF C类会议论文及期刊论文', children: [
                                    { uid: 188, id: 'first_auther', name: '第一作者', score: 3, maxScore: 3 },
                                    { uid: 189, id: 'second_auther', name: '第二作者', score: 0.3, maxScore: 0.3 },
                                    { uid: 190, id: 'other_auther', name: '其他作者', score: 0.1, maxScore: 0.1 },
                                ],
                            },
                        ],
                    },
                    {
                        id: 'patent', name: '专利申请', children: [
                            {
                                id: 'national_invention', name: '国家申请专利', children: [
                                    { uid: 191, id: 'firstInventor_and_transfer', name: '第一发明人且成果实施转让', score: 5, maxScore: 5 },
                                    { uid: 192, id: 'firstInventor_and_nottransfer', name: '第一发明人且未实施转让', score: 4, maxScore: 4 },
                                    { uid: 193, id: 'otherInventor_and_nottransfer', name: '其它发明人且未实施转让', score: 2.5, maxScore: 2.5 },
                                ],
                            },
                            {
                                id: 'utility_model', name: '实用新型专利', children: [
                                    { uid: 194, id: 'firstInventor_and_transfer', name: '第一发明人且成果实施转让', score: 2, maxScore: 2 },
                                    { uid: 195, id: 'firstInventor_and_nottransfer', name: '第一发明人且未实施转让', score: 1.5, maxScore: 1.5 },
                                    { uid: 196, id: 'otherInventor_and_nottransfer', name: '其它发明人且未实施转让', score: 1, maxScore: 1 },
                                ],
                            },
                            {
                                id: 'design', name: '外观专利', children: [
                                    { uid: 197, id: 'firstInventor_and_transfer', name: '第一发明人且成果实施转让', score: 0.5, maxScore: 0.5 },
                                    { uid: 198, id: 'firstInventor_and_nottransfer', name: '第一发明人且未实施转让', score: 0.3, maxScore: 0.3 },
                                    { uid: 199, id: 'otherInventor_and_nottransfer', name: '其它发明人且未实施转让', score: 0.25, maxScore: 0.25 },
                                ],
                            },
                        ],
                    },
                    {
                        id: 'competition', name: '创新创业竞赛', children: [
                            {
                                id: 'A_A*_competition', name: 'A(A*)级创新创业竞赛', children: [
                                    {
                                        id: 'national_firstPrize', name: '国家一等奖项目', children: [
                                            {
                                                id: 'more_than_three_undergraduate', name: '成员多于三名本科生', children: [        //该部分前几名成员赋分在突破提升部分中
                                                    { uid: 200, id: 'fourth_fifth_place', name: '第四成员与第五成员', score: 4, maxScore: 4 },
                                                    { uid: 201, id: 'sixth_seventh_place', name: '第六成员与第七成员', score: 3, maxScore: 3 },
                                                    { uid: 202, id: 'eighth_ninth_place', name: '第八成员与第九成员', score: 2, maxScore: 2 },
                                                    { uid: 203, id: 'other_place', name: '其它成员', score: 1, maxScore: 1 },                   //10位及以上的成员
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        id: 'national_secondPrize', name: '国家二等奖项目', children: [
                                            {
                                                id: 'more_than_three_undergraduate', name: '成员多于三名本科生', children: [        //该部分前几名成员赋分在突破提升部分中
                                                    { uid: 204, id: 'fourth_fifth_place', name: '第四成员与第五成员', score: 2, maxScore: 2 },
                                                    { uid: 205, id: 'sixth_seventh_place', name: '第六成员与第七成员', score: 1.5, maxScore: 1.5 },
                                                    { uid: 206, id: 'eighth_ninth_place', name: '第八成员与第九成员', score: 1, maxScore: 1 },
                                                    { uid: 207, id: 'other_place', name: '其它成员', score: 0.5, maxScore: 0.5 },                   //10位及以上的成员
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        id: 'nationalFirstPrize_provincialFirstPrize', name: '国家三等奖项目与省级一等奖项目', children: [
                                            {
                                                id: 'more_than_three_undergraduate', name: '成员多于三名本科生', children: [        //该部分前几名成员赋分在突破提升部分中
                                                    { uid: 208, id: 'fourth_fifth_place', name: '第四成员与第五成员', score: 1.5, maxScore: 1.5 },
                                                    { uid: 209, id: 'sixth_seventh_place', name: '第六成员与第七成员', score: 1, maxScore: 1 },
                                                    { uid: 210, id: 'eighth_ninth_place', name: '第八成员与第九成员', score: 0.5, maxScore: 0.5 },
                                                    { uid: 211, id: 'other_place', name: '其它成员', score: 0.35, maxScore: 0.35 },                   //10位及以上的成员
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        id: 'provincial_secondPrize', name: '省级二等奖项目', children: [
                                            { uid: 212, id: 'less_than_three_undergraduate', name: '成员少于三名本科生', score: 2, maxScore: 2 },
                                            {
                                                id: 'more_than_three_undergraduate', name: '成员多于三名本科生', children: [
                                                    { uid: 213, id: 'first_to_third_place', name: '前三位成员', score: 2, maxScore: 2 },
                                                    { uid: 214, id: 'fourth_fifth_place', name: '第四成员与第五成员', score: 1, maxScore: 1 },
                                                    { uid: 215, id: 'sixth_seventh_place', name: '第六成员与第七成员', score: 0.5, maxScore: 0.5 },
                                                    { uid: 216, id: 'eighth_ninth_place', name: '第八成员与第九成员', score: 0.35, maxScore: 0.35 },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        id: 'provincialThirdPrize_and_universityFirstPrize', name: '省级三等奖项目和校级一等奖项目', children: [
                                            { uid: 217, id: 'less_than_three_undergraduate', name: '成员少于三名本科生', score: 1.5, maxScore: 1.5 },
                                            {
                                                id: 'more_than_three_undergraduate', name: '成员多于三名本科生', children: [
                                                    { uid: 218, id: 'first_to_third_place', name: '前三位成员', score: 1.5, maxScore: 1.5 },
                                                    { uid: 219, id: 'fourth_fifth_place', name: '第四成员与第五成员', score: 0.5, maxScore: 0.5 },
                                                    { uid: 220, id: 'sixth_seventh_place', name: '第六成员与第七成员', score: 0.35, maxScore: 0.35 },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        id: 'university_secondPrize', name: '校级二等奖项目', children: [
                                            { uid: 221, id: 'less_than_three_undergraduate', name: '成员少于三名本科生', score: 1, maxScore: 1 },
                                            {
                                                id: 'more_than_three_undergraduate', name: '成员多于三名本科生', children: [
                                                    { uid: 222, id: 'first_to_third_place', name: '前三位成员', score: 1, maxScore: 1 },
                                                    { uid: 223, id: 'fourth_fifth_place', name: '第四成员与第五成员', score: 0.35, maxScore: 0.35 },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        id: 'universityThirdPrize_and_departmentFirstPrize', name: '校级三等奖项目和院级一等奖项目', children: [
                                            { uid: 224, id: 'less_than_three_undergraduate', name: '成员少于三名本科生', score: 0.5, maxScore: 0.5 },
                                            {
                                                id: 'more_than_three_undergraduate', name: '成员多于三名本科生', children: [
                                                    { uid: 225, id: 'first_to_third_place', name: '前三位成员', score: 0.5, maxScore: 0.5 },
                                                    { uid: 226, id: 'fourth_fifth_place', name: '第四成员与第五成员', score: 0.2, maxScore: 0.2 },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                id: 'A-_A-*_competition', name: 'A-(A-*)级创新创业竞赛', children: [
                                    {
                                        id: 'national_firstPrize', name: '国家一等奖项目', children: [
                                            {
                                                id: 'more_than_three_undergraduate', name: '成员多于三名本科生', children: [        //该部分前几名成员赋分在突破提升部分中
                                                    { uid: 227, id: 'fourth_fifth_place', name: '第四成员与第五成员', score: 2, maxScore: 2 },
                                                    { uid: 228, id: 'sixth_seventh_place', name: '第六成员与第七成员', score: 1.5, maxScore: 1.5 },
                                                    { uid: 229, id: 'eighth_ninth_place', name: '第八成员与第九成员', score: 1, maxScore: 1 },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        id: 'national_secondPrize', name: '国家二等奖项目', children: [
                                            {
                                                id: 'more_than_three_undergraduate', name: '成员多于三名本科生', children: [        //该部分前几名成员赋分在突破提升部分中
                                                    { uid: 230, id: 'fourth_fifth_place', name: '第四成员与第五成员', score: 1, maxScore: 1 },
                                                    { uid: 231, id: 'sixth_seventh_place', name: '第六成员与第七成员', score: 0.75, maxScore: 0.75 },
                                                    { uid: 232, id: 'eighth_ninth_place', name: '第八成员与第九成员', score: 0.5, maxScore: 0.5 },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        id: 'nationalFirstPrize_provincialFirstPrize', name: '国家三等奖项目与省级一等奖项目', children: [
                                            { uid: 233, id: 'less_than_three_undergraduate', name: '成员少于三名本科生', score: 1.25, maxScore: 1.25 },
                                            {
                                                id: 'more_than_three_undergraduate', name: '成员多于三名本科生', children: [
                                                    { uid: 234, id: 'first_to_third_place', name: '前三位成员', score: 1.25, maxScore: 1.25 },
                                                    { uid: 235, id: 'fourth_fifth_place', name: '第四成员与第五成员', score: 0.75, maxScore: 0.75 },
                                                    { uid: 236, id: 'sixth_seventh_place', name: '第六成员与第七成员', score: 0.5, maxScore: 0.5 },
                                                    { uid: 237, id: 'eighth_ninth_place', name: '第八成员与第九成员', score: 0.25, maxScore: 0.25 },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        id: 'provincial_secondPrize', name: '省级二等奖项目', children: [
                                            { uid: 238, id: 'less_than_three_undergraduate', name: '成员少于三名本科生', score: 1, maxScore: 1 },
                                            {
                                                id: 'more_than_three_undergraduate', name: '成员多于三名本科生', children: [
                                                    { uid: 239, id: 'first_to_third_place', name: '前三位成员', score: 1, maxScore: 1 },
                                                    { uid: 240, id: 'fourth_fifth_place', name: '第四成员与第五成员', score: 0.5, maxScore: 0.5 },
                                                    { uid: 241, id: 'sixth_seventh_place', name: '第六成员与第七成员', score: 0.25, maxScore: 0.25 },
                                                    { uid: 242, id: 'eighth_ninth_place', name: '第八成员与第九成员', score: 0.175, maxScore: 0.175 },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        id: 'provincialThirdPrize_and_universityFirstPrize', name: '省级三等奖项目和校级一等奖项目', children: [
                                            { uid: 243, id: 'less_than_three_undergraduate', name: '成员少于三名本科生', score: 0.75, maxScore: 0.75 },
                                            {
                                                id: 'more_than_three_undergraduate', name: '成员多于三名本科生', children: [
                                                    { uid: 244, id: 'first_to_third_place', name: '前三位成员', score: 0.75, maxScore: 0.75 },
                                                    { uid: 245, id: 'fourth_fifth_place', name: '第四成员与第五成员', score: 0.25, maxScore: 0.25 },
                                                    { uid: 246, id: 'sixth_seventh_place', name: '第六成员与第七成员', score: 0.175, maxScore: 0.175 },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        id: 'university_secondPrize', name: '校级二等奖项目', children: [
                                            { uid: 247, id: 'less_than_three_undergraduate', name: '成员少于三名本科生', score: 0.5, maxScore: 0.5 },
                                            {
                                                id: 'more_than_three_undergraduate', name: '成员多于三名本科生', children: [
                                                    { uid: 248, id: 'first_to_third_place', name: '前三位成员', score: 0.5, maxScore: 0.5 },
                                                    { uid: 249, id: 'fourth_fifth_place', name: '第四成员与第五成员', score: 0.175, maxScore: 0.175 },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        id: 'universityThirdPrize_and_departmentFirstPrize', name: '校级三等奖项目和院级一等奖项目', children: [
                                            { uid: 250, id: 'less_than_three_undergraduate', name: '成员少于三名本科生', score: 0.25, maxScore: 0.25 },
                                            {
                                                id: 'more_than_three_undergraduate', name: '成员多于三名本科生', children: [
                                                    { uid: 251, id: 'first_to_third_place', name: '前三位成员', score: 0.25, maxScore: 0.25 },
                                                    { uid: 252, id: 'fourth_fifth_place', name: '第四成员与第五成员', score: 0.1, maxScore: 0.1 },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                id: 'B_B*_competition', name: 'B(B*)级创新创业竞赛', children: [
                                    {
                                        id: 'national_firstPrize', name: '国家一等奖项目', children: [
                                            { uid: 253, id: 'less_than_three_undergraduate', name: '成员少于三名本科生', score: 1.5, maxScore: 1.5 },
                                            {
                                                id: 'more_than_three_undergraduate', name: '成员多于三名本科生', children: [
                                                    { uid: 254, id: 'first_to_third_place', name: '前三位成员', score: 1.5, maxScore: 1.5 },
                                                    { uid: 255, id: 'fourth_fifth_place', name: '第四成员与第五成员', score: 1.3333, maxScore: 1.3333 },
                                                    { uid: 256, id: 'sixth_seventh_place', name: '第六成员与第七成员', score: 1, maxScore: 1 },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        id: 'national_secondPrize', name: '国家二等奖项目', children: [
                                            { uid: 257, id: 'less_than_three_undergraduate', name: '成员少于三名本科生', score: 1, maxScore: 1 },
                                            {
                                                id: 'more_than_three_undergraduate', name: '成员多于三名本科生', children: [
                                                    { uid: 258, id: 'first_to_third_place', name: '前三位成员', score: 1, maxScore: 1 },
                                                    { uid: 259, id: 'fourth_fifth_place', name: '第四成员与第五成员', score: 1.3333, maxScore: 1.3333 },
                                                    { uid: 260, id: 'sixth_seventh_place', name: '第六成员与第七成员', score: 0.5, maxScore: 0.5 },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        id: 'nationalFirstPrize_provincialFirstPrize', name: '国家三等奖项目与省级一等奖项目', children: [
                                            { uid: 261, id: 'less_than_three_undergraduate', name: '成员少于三名本科生', score: 0.8333, maxScore: 0.8333 },
                                            {
                                                id: 'more_than_three_undergraduate', name: '成员多于三名本科生', children: [
                                                    { uid: 262, id: 'first_to_third_place', name: '前三位成员', score: 0.8333, maxScore: 0.8333 },
                                                    { uid: 263, id: 'fourth_fifth_place', name: '第四成员与第五成员', score: 0.5, maxScore: 0.5 },
                                                    { uid: 264, id: 'sixth_seventh_place', name: '第六成员与第七成员', score: 0.3333, maxScore: 0.3333 },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        id: 'provincial_secondPrize', name: '省级二等奖项目', children: [
                                            { uid: 265, id: 'less_than_three_undergraduate', name: '成员少于三名本科生', score: 0.6667, maxScore: 0.6667 },
                                            {
                                                id: 'more_than_three_undergraduate', name: '成员多于三名本科生', children: [
                                                    { uid: 266, id: 'first_to_third_place', name: '前三位成员', score: 0.6667, maxScore: 0.6667 },
                                                    { uid: 267, id: 'fourth_fifth_place', name: '第四成员与第五成员', score: 0.3333, maxScore: 0.3333 },
                                                    { uid: 268, id: 'sixth_seventh_place', name: '第六成员与第七成员', score: 0.1667, maxScore: 0.1667 },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        id: 'provincialThirdPrize_and_universityFirstPrize', name: '省级三等奖项目和校级一等奖项目', children: [
                                            { uid: 269, id: 'less_than_three_undergraduate', name: '成员少于三名本科生', score: 0.5, maxScore: 0.5 },
                                            {
                                                id: 'more_than_three_undergraduate', name: '成员多于三名本科生', children: [
                                                    { uid: 270, id: 'first_to_third_place', name: '前三位成员', score: 0.5, maxScore: 0.5 },
                                                    { uid: 271, id: 'fourth_fifth_place', name: '第四成员与第五成员', score: 0.1667, maxScore: 0.1667 },
                                                    { uid: 272, id: 'sixth_seventh_place', name: '第六成员与第七成员', score: 0.1167, maxScore: 0.1167 },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        id: 'university_secondPrize', name: '校级二等奖项目', children: [
                                            { uid: 273, id: 'less_than_three_undergraduate', name: '成员少于三名本科生', score: 0.3333, maxScore: 0.3333 },
                                            {
                                                id: 'more_than_three_undergraduate', name: '成员多于三名本科生', children: [
                                                    { uid: 274, id: 'first_to_third_place', name: '前三位成员', score: 0.3333, maxScore: 0.3333 },
                                                    { uid: 275, id: 'fourth_fifth_place', name: '第四成员与第五成员', score: 0.1167, maxScore: 0.1167 },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        id: 'universityThirdPrize_and_departmentFirstPrize', name: '校级三等奖项目和院级一等奖项目', children: [
                                            { uid: 276, id: 'less_than_three_undergraduate', name: '成员少于三名本科生', score: 0.1667, maxScore: 0.1667 },
                                            {
                                                id: 'more_than_three_undergraduate', name: '成员多于三名本科生', children: [
                                                    { uid: 277, id: 'first_to_third_place', name: '前三位成员', score: 0.1667, maxScore: 0.1667 },
                                                    { uid: 278, id: 'fourth_fifth_place', name: '第四成员与第五成员', score: 0.0667, maxScore: 0.0667 },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                id: 'C_competition', name: 'C级创新创业竞赛', children: [
                                    {
                                        id: 'national_firstPrize', name: '国家一等奖项目', children: [
                                            { uid: 279, id: 'less_than_three_undergraduate', name: '成员少于三名本科生', score: 1.125, maxScore: 1.125 },
                                            {
                                                id: 'more_than_three_undergraduate', name: '成员多于三名本科生', children: [
                                                    { uid: 280, id: 'first_to_third_place', name: '前三位成员', score: 1.125, maxScore: 1.125 },
                                                    { uid: 281, id: 'fourth_fifth_place', name: '第四成员与第五成员', score: 1, maxScore: 1 },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        id: 'national_secondtPrize', name: '国家二等奖项目', children: [
                                            { uid: 282, id: 'less_than_three_undergraduate', name: '成员少于三名本科生', score: 0.75, maxScore: 0.75 },
                                            {
                                                id: 'more_than_three_undergraduate', name: '成员多于三名本科生', children: [
                                                    { uid: 283, id: 'first_to_third_place', name: '前三位成员', score: 0.75, maxScore: 0.75 },
                                                    { uid: 284, id: 'fourth_fifth_place', name: '第四成员与第五成员', score: 0.5, maxScore: 0.5 },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        id: 'nationalFirstPrize_provincialFirstPrize', name: '国家三等奖项目与省级一等奖项目', children: [
                                            { id: 'less_than_three_undergraduate', name: '成员少于三名本科生', score: 0.625, maxScore: 0.625 },
                                            {
                                                id: 'more_than_three_undergraduate', name: '成员多于三名本科生', children: [
                                                    { uid: 285, id: 'first_to_third_place', name: '前三位成员', score: 0.625, maxScore: 0.625 },
                                                    { uid: 286, id: 'fourth_fifth_place', name: '第四成员与第五成员', score: 0.375, maxScore: 0.375 },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        id: 'provincial_secondPrize', name: '省级二等奖项目', children: [
                                            { uid: 287, id: 'less_than_three_undergraduate', name: '成员少于三名本科生', score: 0.5, maxScore: 0.5 }, // 修正：原288→287
                                            {
                                                id: 'more_than_three_undergraduate', name: '成员多于三名本科生', children: [
                                                    { uid: 288, id: 'first_to_third_place', name: '前三位成员', score: 0.5, maxScore: 0.5 }, // 后续uid依次顺延
                                                    { uid: 289, id: 'fourth_fifth_place', name: '第四成员与第五成员', score: 0.25, maxScore: 0.25 },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        id: 'provincialThirdPrize_and_universityFirstPrize', name: '省级三等奖项目和校级一等奖项目', children: [
                                            { uid: 290, id: 'less_than_three_undergraduate', name: '成员少于三名本科生', score: 0.375, maxScore: 0.375 },
                                            {
                                                id: 'more_than_three_undergraduate', name: '成员多于三名本科生', children: [
                                                    { uid: 291, id: 'first_to_third_place', name: '前三位成员', score: 0.375, maxScore: 0.375 },
                                                    { uid: 292, id: 'fourth_fifth_place', name: '第四成员与第五成员', score: 0.125, maxScore: 0.125 },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        id: 'university_secondPrize', name: '校级二等奖项目', children: [
                                            { uid: 293, id: 'less_than_three_undergraduate', name: '成员少于三名本科生', score: 0.25, maxScore: 0.25 },
                                            {
                                                id: 'more_than_three_undergraduate', name: '成员多于三名本科生', children: [
                                                    { uid: 294, id: 'first_to_third_place', name: '前三位成员', score: 0.25, maxScore: 0.25 },
                                                    { uid: 295, id: 'fourth_fifth_place', name: '第四成员与第五成员', score: 0.0875, maxScore: 0.0875 },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        id: 'universityThirdPrize_and_departmentFirstPrize', name: '校级三等奖项目和院级一等奖项目', children: [
                                            { uid: 296, id: 'less_than_three_undergraduate', name: '成员少于三名本科生', score: 0.125, maxScore: 0.125 },
                                            {
                                                id: 'more_than_three_undergraduate', name: '成员多于三名本科生', children: [
                                                    { uid: 297, id: 'first_to_third_place', name: '前三位成员', score: 0.125, maxScore: 0.125 },
                                                    { uid: 298, id: 'fourth_fifth_place', name: '第四成员与第五成员', score: 0.05, maxScore: 0.05 },
                                                ],
                                            },
                                        ],
                                    },
                                ]
                            },
                            {
                                id: 'D_competition', name: 'D级创新创业竞赛', children: [
                                    {
                                        id: 'national_firstPrize', name: '国家一等奖项目', children: [
                                            { uid: 299, id: 'first_to_third_place', name: '前三位成员', score: 0.5625, maxScore: 0.5625 },
                                        ],
                                    },
                                    {
                                        id: 'national_secondPrize', name: '国家二等奖项目', children: [
                                            { uid: 300, id: 'first_to_third_place', name: '前三位成员', score: 0.375, maxScore: 0.375 },
                                        ],
                                    },
                                    {
                                        id: 'nationalThirdPrize_provincialFirstPrize', name: '国家三等奖项目与省级一等奖项目', children: [
                                            { uid: 301, id: 'first_to_third_place', name: '前三位成员', score: 0.3125, maxScore: 0.3125 },
                                        ],
                                    },
                                    {
                                        id: 'provincial_secondPrize', name: '省级二等奖项目', children: [
                                            { uid: 302, id: 'first_to_third_place', name: '前三位成员', score: 0.25, maxScore: 0.25 },
                                        ],
                                    },
                                    {
                                        id: 'provincialThirdPrize_and_universityFirstPrize', name: '省级三等奖项目和校级一等奖项目', children: [
                                            { uid: 303, id: 'first_to_third_place', name: '前三位成员', score: 0.1875, maxScore: 0.1875 },
                                        ],
                                    },
                                    {
                                        id: 'university_secondPrize', name: '校级二等奖项目', children: [
                                            { uid: 304, id: 'first_to_third_place', name: '前三位成员', score: 0.125, maxScore: 0.125 },
                                        ],
                                    },
                                    {
                                        id: 'universityThirdPrize_and_departmentFirstPrize', name: '校级三等奖项目和院级一等奖项目', children: [
                                            { uid: 305, id: 'first_to_third_place', name: '前三位成员', score: 0.0625, maxScore: 0.0625 },
                                        ],
                                    },
                                ],
                            },
                            {
                                id: 'E_competition', name: 'E级创新创业竞赛', children: [
                                    {
                                        id: 'national_firstPrize', name: '国家一等奖项目', children: [
                                            { uid: 306, id: 'first_place', name: '第一位成员', score: 0.2813, maxScore: 0.2813 },
                                        ],
                                    },
                                    {
                                        id: 'national_secondPrize', name: '国家二等奖项目', children: [
                                            { uid: 307, id: 'first_place', name: '第一位成员', score: 0.1875, maxScore: 0.1875 },
                                        ],
                                    },
                                    {
                                        id: 'nationalThirdPrize_provincialFirstPrize', name: '国家三等奖项目与省级一等奖项目', children: [
                                            { uid: 308, id: 'first_place', name: '第一位成员', score: 0.1563, maxScore: 0.1563 },
                                        ],
                                    },
                                    {
                                        id: 'provincial_secondPrize', name: '省级二等奖项目', children: [
                                            { uid: 309, id: 'first_place', name: '第一位成员', score: 0.125, maxScore: 0.125 },
                                        ],
                                    },
                                    {
                                        id: 'provincialThirdPrize_and_universityFirstPrize', name: '省级三等奖项目和校级一等奖项目', children: [
                                            { uid: 310, id: 'first_place', name: '第一位成员', score: 0.0938, maxScore: 0.0938 },
                                        ],
                                    },
                                    {
                                        id: 'university_secondPrize', name: '校级二等奖项目', children: [
                                            { uid: 311, id: 'first_place', name: '第一位成员', score: 0.0625, maxScore: 0.0625 },
                                        ],
                                    },
                                    {
                                        id: 'universityThirdPrize_and_departmentFirstPrize', name: '校级三等奖项目和院级一等奖项目', children: [
                                            { uid: 312, id: 'first_place', name: '第一位成员', score: 0.0313, maxScore: 0.0313 },
                                        ],
                                    },
                                ],
                            },
                        ]
                    },
                    {
                        id: 'entrepreneurship_practice', name: '创新创业实践', children: [                 //每个同学最多计算一个创业公司
                            { uid: 313, id: 'legal_morethanOneYear', name: '法人，盈利不少于一年', score: 4, maxScore: 4 },                               //需个人占股30%及以上
                            { uid: 314, id: 'legal_morethanSixMonth_lessthanOneYear', name: '法人，盈利超过六个月但少于一年', score: 2, maxScore: 2 },     //需个人占股30%及以上
                            { uid: 315, id: 'shareholder_morethanOneYear', name: '担任主要股东不少于一年', score: 1, maxScore: 1 },                       //需个人占股10%及以上
                        ],
                    },
                    { uid: 316, id: 'international_academic_exchange', name: '境外学术交流活动', score: 0, maxScore: 5 },       //参加长期境外学术交流项目（90天以上）最高赋分不超过5分，参加短期境外学术交流项目（90天以内）最高赋分不超过3分
                ]
            },
            {
                id: 'achievement', name: '突破提升', maxScore: 40, children: [
                    { uid: 317, id: 'scientific_reasearch', name: '科研成果', score: 0, maxScore: 40 },
                    { uid: 318, id: 'international_organization_internship', name: '国际组织实习', score: 0, maxScore: 40 },
                    {
                        id: 'competition', name: '创新创业竞赛', children: [
                            {
                                id: 'A_A*_competition', name: 'A(A*)级创新创业竞赛', children: [
                                    { uid: 319, id: 'national_firstPrize', name: '国家一等奖', score: 40, maxScore: 40 },
                                    { uid: 320, id: 'national_secondPrize', name: '国家二等奖', score: 30, maxScore: 30 },
                                    { uid: 321, id: 'national_thirdPrize', name: '国家三等奖', score: 10, maxScore: 10 },
                                ],
                            },
                            {
                                id: 'A-_A-*_competition', name: 'A-(A-*)级创新创业竞赛', children: [
                                    { uid: 322, id: 'national_firstPrize', name: '国家一等奖', score: 20, maxScore: 20 },
                                    { uid: 323, id: 'national_secondPrize', name: '国家二等奖', score: 10, maxScore: 10 },
                                ],
                            },
                        ],
                    },
                ],
            },
        ]
    }
];
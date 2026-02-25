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
                {id: 'basic', name: '体质测试', Score: 5, maxScore: 5},
                {id: 'sports_activity', name: '体育类集体活动', Score: 2, maxScore: 2, maxcount: 2},   //体育类集体活动参加一次积2分     
            ],
            },
            { id: 'achievement', name: '成果性评价', maxScore: 6,children: [
                {id: 'sports_competition', name: '体育竞赛', maxScore: 6,children:[
                    {id: 'personal_project', name: '个人项目', childhren:[
                        {id: 'national', name: '国家级', score: 6,maxscore: 6},
                        {id: 'provincial', name: '省级', children:[
                            {id: 'first_place', name: '第一名', score: 6, maxScore: 6},
                            {id: 'second_place', name: '第二名', score: 5.25, maxscore: 5.25},
                            {id: 'third_place', name: '第三名', score: 4.5, maxScore: 4.5},
                            {id:'other_rankings', name: '其它名次', score: 3.75, maxScore: 3.75},
                        ],
                        },
                        {id: 'university_level', name: '校级/校区级', children:[
                            {id: 'first_place', name: '第一名', score: 4.5, maxScore: 4.5},
                            {id: 'second_place', name: '第二名', score: 3.75, maxscore: 3.75},
                            {id: 'third_place', name: '第三名', score: 3, maxScore: 3},
                            {id:'other_rankings', name: '其它名次', score: 2.25, maxScore: 2.25},
                        ],
                        },
                        {id: 'department_level', name: '院级/书院级', children:[
                            {id: 'first_place', name: '第一名', score: 2.25, maxScore: 2.25},
                            {id: 'second_place', name: '第二名', score: 1.5, maxscore: 1.5},
                            {id: 'third_place', name: '第三名', score: 0.75, maxScore: 0.75},
                            {id:'other_rankings', name: '其它名次', score: 0.375, maxScore: 0.375},
                        ],
                        },
                        {id: 'participated', name: '参与未获奖', score: 0.3, maxscore: 0.3},
                    ],
                    },
                    {id: 'group_project', name: '集体项目', childhren:[
                        {id: 'national', name: '国家级', score: 6,maxscore: 6},
                        {id: 'provincial', name: '省级', children:[
                            {id: 'first_place', name: '第一名', score: 6, maxScore: 6},
                            {id: 'second_place', name: '第二名', score: 5.25, maxscore: 5.25},
                            {id: 'third_place', name: '第三名', score: 4.5, maxScore: 4.5},
                            {id:'other_rankings', name: '其它名次', score: 3.75, maxScore: 3.75},
                        ],
                        },
                        {id: 'university_level', name: '校级/校区级', children:[
                            {id: 'first_place', name: '第一名', score: 5.25, maxScore: 5.25},
                            {id: 'second_place', name: '第二名', score: 4.5, maxscore: 4.5},
                            {id: 'third_place', name: '第三名', score: 3.75, maxScore: 3.75},
                            {id:'other_rankings', name: '其它名次', score: 3, maxScore: 3},
                        ],
                        },
                        {id: 'department_level', name: '院级/书院级', children:[
                            {id: 'first_place', name: '第一名', score: 3, maxScore: 3},
                            {id: 'second_place', name: '第二名', score: 2.25, maxscore: 2.25},
                            {id: 'third_place', name: '第三名', score: 1.5, maxScore: 1.5},
                            {id:'other_rankings', name: '其它名次', score: 0.75, maxScore: 0.75},
                        ],
                        },
                        {id: 'participated', name: '参与未获奖', score: 0.3, maxscore: 0.3},
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
            { id: 'basic', name: '基础性评价', maxScore: 9,children:[
                {id: 'art_activities', name: '艺术类活动', score: 1.5,maxScore: 1.5},      //艺术类活动包括但不限于：观摩画展，艺术讲座，文艺演出，文艺竞赛，加入艺术类社团或团队
            ],
            },
            { id: 'achievement', name: '成果性评价', maxScore: 6,childhren:[
                //赛事种类包括但不限于：合唱比赛，器乐比赛，才艺比赛，社团风采比赛，征文比赛，演讲比赛，知识竞赛，辩论赛，宿舍文化节
                {id: 'art_competition', name: '艺术竞赛', maxScore: 6,children:[
                    {id: 'personal_project', name: '个人项目', childhren:[
                        {id: 'national', name: '国家级', score: 6,maxscore: 6},
                        {id: 'provincial', name: '省级', children:[
                            {id: 'first_place', name: '第一名', score: 6, maxScore: 6},
                            {id: 'second_place', name: '第二名', score: 5.25, maxscore: 5.25},
                            {id: 'third_place', name: '第三名', score: 4.5, maxScore: 4.5},
                            {id:'other_rankings', name: '其它名次', score: 3.75, maxScore: 3.75},
                        ],
                        },
                        {id: 'university_level', name: '校级/校区级', children:[
                            {id: 'first_place', name: '第一名', score: 4.5, maxScore: 4.5},
                            {id: 'second_place', name: '第二名', score: 3.75, maxscore: 3.75},
                            {id: 'third_place', name: '第三名', score: 3, maxScore: 3},
                            {id:'other_rankings', name: '其它名次', score: 2.25, maxScore: 2.25},
                        ],
                        },
                        {id: 'department_level', name: '院级/书院级', children:[
                            {id: 'first_place', name: '第一名', score: 2.25, maxScore: 2.25},
                            {id: 'second_place', name: '第二名', score: 1.5, maxscore: 1.5},
                            {id: 'third_place', name: '第三名', score: 0.75, maxScore: 0.75},
                            {id:'other_rankings', name: '其它名次', score: 0.375, maxScore: 0.375},
                        ],
                        },
                        {id: 'participated', name: '参与未获奖', score: 0.3, maxscore: 0.3},
                    ],
                    },
                    {id: 'group_project', name: '集体项目', childhren:[
                        {id: 'national', name: '国家级', score: 6,maxscore: 6},
                        {id: 'provincial', name: '省级', children:[
                            {id: 'first_place', name: '第一名', score: 6, maxScore: 6},
                            {id: 'second_place', name: '第二名', score: 5.25, maxscore: 5.25},
                            {id: 'third_place', name: '第三名', score: 4.5, maxScore: 4.5},
                            {id:'other_rankings', name: '其它名次', score: 3.75, maxScore: 3.75},
                        ],
                        },
                        {id: 'university_level', name: '校级/校区级', children:[
                            {id: 'first_place', name: '第一名', score: 5.25, maxScore: 5.25},
                            {id: 'second_place', name: '第二名', score: 4.5, maxscore: 4.5},
                            {id: 'third_place', name: '第三名', score: 3.75, maxScore: 3.75},
                            {id:'other_rankings', name: '其它名次', score: 3, maxScore: 3},
                        ],
                        },
                        {id: 'department_level', name: '院级/书院级', children:[
                            {id: 'first_place', name: '第一名', score: 3, maxScore: 3},
                            {id: 'second_place', name: '第二名', score: 2.25, maxscore: 2.25},
                            {id: 'third_place', name: '第三名', score: 1.5, maxScore: 1.5},
                            {id:'other_rankings', name: '其它名次', score: 0.75, maxScore: 0.75},
                        ],
                        },
                        {id: 'participated', name: '参与未获奖', score: 0.3, maxscore: 0.3},
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
            { id: 'basic', name: '基础性评价', maxScore: 15,children:[
                {id: 'volunteer', name: '志愿时长',score: 0,maxScore: 5},      //学生每学年完成40小时志愿活动可得5分，缺失每小时扣0.25分
                {id: 'social_practice', name: '社会实践', score: 5,maxScore: 5},  
                {id: 'dorm_work', name: '宿舍安全卫生', score: 0,maxScore: 5},    //满分5分，卫生不合格者一次扣2次，若累计扣分超过5分则从剩余剩余得分中扣除，基础性评价总分15分扣完为止
            ],                                                                         //卫生不合格：检查中公共区域扣分超过10分（不包括10分）记一次宿舍全体不合格
            },
            { id: 'achievement', name: '成果性评价', maxScore: 10, children:[
                {id: 'security_work', name: '社会工作', children:[
                    {id: 'student_organization_management', name: '学生组织管理工作', score: 4,maxScore: 4},//参与学校，校区，书院，学院，班级，社团等各级学生组织组织管理工作
                    {id: 'personal_honors', name: '任职期间获得个人荣誉',childhren:[
                        {id: 'national', name: '国家级', score: 10,maxscore: 10},
                        {id: 'provincial', name: '省级', score: 8.5,maxScore: 8.5},
                        {id: 'municipal', name: '市级', score: 7,maxScore: 7},
                        {id: 'university_level', name: '校级/校区级',score: 5.5,maxScore: 5.5},
                        {id: 'department_level', name: '院级/书院级',score: 4,maxScore: 4},
                    ],
                    },
                    {id: 'group_honors', name: '任职期间获得集体荣誉',childhren:[         //主要负责人取maxscore，其他干部根据实际情况按1.5递减
                        {id: 'national', name: '国家级', score: 0,maxscore: 10},
                        {id: 'provincial', name: '省级', score: 0,maxScore: 8.5},
                        {id: 'municipal', name: '市级', score: 0,maxScore: 7},
                        {id: 'university_level', name: '校级/校区级',score: 0,maxScore: 5.5},
                        {id: 'department_level', name: '院级/书院级',score: 0,maxScore: 4},
                    ],
                    },
                ],
                },
                {id: 'social_practice',name: '社会实践', children:[
                   {id: 'personal_honors', name: '个人',childhren:[
                        {id: 'national', name: '国家级', score: 10,maxscore: 10},
                        {id: 'provincial', name: '省级', score: 8.5,maxScore: 8.5},
                        {id: 'municipal', name: '市级', score: 7,maxScore: 7},
                        {id: 'university_level', name: '校级/校区级',score: 5.5,maxScore: 5.5},
                        {id: 'department_level', name: '院级/书院级',score: 4,maxScore: 4},
                    ],
                    },
                    {id: 'group_honors', name: '集体',childhren:[
                        {id: 'national', name: '国家级', children:[
                            {id: 'leader', name: '负责人', score: 10, maxScore: 10},
                            {id: 'second_place', name: '第二成员', score: 8.5, maxscore: 8.5},
                            {id: 'third_place', name: '第三成员', score: 7, maxScore: 7},
                            {id:'other_rankings', name: '其它成员', score: 5.5, maxScore: 5.5},
                        ],
                        },
                        {id: 'provincial', name: '省级', children:[
                            {id: 'leader', name: '负责人', score: 8.5, maxScore: 8.5},
                            {id: 'second_place', name: '第二成员', score: 7, maxscore: 7},
                            {id: 'third_place', name: '第三成员', score: 5.5, maxScore: 5.5},
                            {id:'other_rankings', name: '其它成员', score: 4, maxScore: 4},
                        ],
                        },
                        {id: 'municipal', name: '市级', children:[
                            {id: 'leader', name: '负责人', score: 7, maxScore: 7},
                            {id: 'second_place', name: '第二成员', score: 5.5, maxscore: 5.5},
                            {id: 'third_place', name: '第三成员', score: 4, maxScore: 4},
                            {id:'other_rankings', name: '其它成员', score: 2.5, maxScore: 2.5},
                        ],
                        },
                        {id: 'university_level', name: '校级/校区级',children:[
                            {id: 'leader', name: '负责人', score: 5.5, maxScore: 5.5},
                            {id: 'second_place', name: '第二成员', score: 4, maxscore: 4},
                            {id: 'third_place', name: '第三成员', score: 2.5, maxScore: 2.5},
                            {id:'other_rankings', name: '其它成员', score: 1, maxScore: 1},
                        ],
                        },
                        {id: 'department_level', name: '院级/书院级',children:[
                            {id: 'leader', name: '负责人', score: 4, maxScore: 4},
                            {id: 'second_place', name: '第二成员', score: 2.5, maxscore: 2.5},
                            {id: 'third_place', name: '第三成员', score: 1, maxScore: 1},
                        ],
                        },
                    ],
                    },
                ],
                },
                {id: 'volunteer',name: '志愿活动', children:[
                   {id: 'personal_honors', name: '个人',childhren:[
                        {id: 'national', name: '国家级', score: 10,maxscore: 10},
                        {id: 'provincial', name: '省级', score: 8.5,maxScore: 8.5},
                        {id: 'municipal', name: '市级', score: 7,maxScore: 7},
                        {id: 'university_level', name: '校级/校区级',score: 5.5,maxScore: 5.5},
                        {id: 'department_level', name: '院级/书院级',score: 4,maxScore: 4},
                    ],
                    },
                    {id: 'group_honors', name: '集体',childhren:[
                        {id: 'national', name: '国家级', children:[
                            {id: 'leader', name: '负责人', score: 10, maxScore: 10},
                            {id: 'second_place', name: '第二成员', score: 8.5, maxscore: 8.5},
                            {id: 'third_place', name: '第三成员', score: 7, maxScore: 7},
                            {id:'other_rankings', name: '其它成员', score: 5.5, maxScore: 5.5},
                        ],
                        },
                        {id: 'provincial', name: '省级', children:[
                            {id: 'leader', name: '负责人', score: 8.5, maxScore: 8.5},
                            {id: 'second_place', name: '第二成员', score: 7, maxscore: 7},
                            {id: 'third_place', name: '第三成员', score: 5.5, maxScore: 5.5},
                            {id:'other_rankings', name: '其它成员', score: 4, maxScore: 4},
                        ],
                        },
                        {id: 'municipal', name: '市级', children:[
                            {id: 'leader', name: '负责人', score: 7, maxScore: 7},
                            {id: 'second_place', name: '第二成员', score: 5.5, maxscore: 5.5},
                            {id: 'third_place', name: '第三成员', score: 4, maxScore: 4},
                            {id:'other_rankings', name: '其它成员', score: 2.5, maxScore: 2.5},
                        ],
                        },
                        {id: 'university_level', name: '校级/校区级',children:[
                            {id: 'leader', name: '负责人', score: 5.5, maxScore: 5.5},
                            {id: 'second_place', name: '第二成员', score: 4, maxscore: 4},
                            {id: 'third_place', name: '第三成员', score: 2.5, maxScore: 2.5},
                            {id:'other_rankings', name: '其它成员', score: 1, maxScore: 1},
                        ],
                        },
                        {id: 'department_level', name: '院级/书院级',children:[
                            {id: 'leader', name: '负责人', score: 4, maxScore: 4},
                            {id: 'second_place', name: '第二成员', score: 2.5, maxscore: 2.5},
                            {id: 'third_place', name: '第三成员', score: 1, maxScore: 1},
                        ],
                        },
                    ],
                    },
                ],
                },
                {id: 'dorm_work', name: '宿舍劳动', children:[
                    {id: 'personal', name: '个人', children:[
                        {id: 'first_prize', name: '一等奖', score: 4,maxScore: 4},
                        {id: 'second_prize', name: '二等奖', score: 3.5,maxScore: 3.5},
                        {id: 'third_prize', name: '三等奖', score: 3,maxScore: 3},
                        {id: 'participated', name: '参与未获奖', score: 2,maxScore: 2},
                    ],
                    },
                    {id: 'group', name: '集体', children:[
                        {id: 'first_prize', name: '一等奖', children:[
                            {id: 'leader', name: '负责人', score: 4, maxScore: 4},
                            {id: 'others', name: '其他成员', score: 3.5, maxscore: 3.5},
                        ],
                        },
                        {id: 'second_prize', name: '二等奖', children:[
                            {id: 'leader', name: '负责人', score: 3.5, maxScore: 3.5},
                            {id: 'others', name: '其他成员', score: 3, maxscore: 3},
                        ],
                        },
                        {id: 'third_prize', name: '三等奖', children:[
                            {id: 'leader', name: '负责人', score: 3, maxScore: 3},
                            {id: 'others', name: '其他成员', score: 2.5, maxscore: 2.5},
                        ],
                        },
                        {id: 'participated', name: '参与未获奖', score: 2,maxScore: 2},
                    ],
                    },
                ],
                },
                {id: 'career_development',name: '生涯发展',children:[
                    {id: 'personal_project', name: '个人项目', childhren:[
                        {id: 'national', name: '国家级',children:[
                            {id: 'first_prize', name: '一等奖', score: 10, maxScore: 10},
                            {id: 'second_prize', name: '二等奖', score: 8.5, maxscore: 8.5},
                            {id: 'third_prize', name: '三等奖', score: 7, maxScore: 7},
                        ],
                        },
                        {id: 'provincial', name: '省级', children:[
                            {id: 'first_prize', name: '一等奖', score: 8.5, maxScore: 8.5},
                            {id: 'second_prize', name: '二等奖', score: 7, maxscore: 7},
                            {id: 'third_prize', name: '三等奖', score: 5.5, maxScore: 5.5},
                        ],
                        },
                        {id: 'municipal', name: '市级', children:[
                            {id: 'first_prize', name: '一等奖', score: 7, maxScore: 7},
                            {id: 'second_prize', name: '二等奖', score: 5.5, maxscore: 5.5},
                            {id: 'third_prize', name: '三等奖', score: 4, maxScore: 4},
                        ],
                        },
                        {id: 'university_level', name: '校级/校区级', children:[
                            {id: 'first_prize', name: '一等奖', score: 5.5, maxScore: 5.5},
                            {id: 'second_prize', name: '二等奖', score: 4, maxscore: 4},
                            {id: 'third_prize', name: '三等奖', score: 2.5, maxScore: 2.5},
                        ],
                        },
                        {id: 'department_level', name: '院级/书院级', children:[
                            {id: 'first_prize', name: '一等奖', score: 4, maxScore: 4},
                            {id: 'second_prize', name: '二等奖', score: 2.5, maxscore: 2.5},
                            {id: 'third_prize', name: '三等奖', score: 1, maxScore: 1},
                        ],
                        },
                    ],
                    },
                    {id: 'group_project', name: '集体项目',childhren:[         //主要负责人取maxscore，其他成员根据实际情况按1.5递减
                        {id: 'national', name: '国家级', score: 0,maxscore: 10},
                        {id: 'provincial', name: '省级', score: 0,maxScore: 8.5},
                        {id: 'municipal', name: '市级', score: 0,maxScore: 7},
                        {id: 'university_level', name: '校级/校区级',score: 0,maxScore: 5.5},
                        {id: 'department_level', name: '院级/书院级',score: 0,maxScore: 4},
                    ],
                    },
                ],
                },
                {id: 'discharge', name: '退役复学', score: 10, maxscore: 10},
                {id: 'students farm', name: '学生农场',score: 0,maxscore: 5},      //劳动时长超过37h后可得满分，33h-36h可得4.5分,依次向下递减
            ],
            },
        ],
    },

    {
        id: 'innovation',
        name: '创新素养',
        maxScore: 45,
        children: [
            {id: 'foundation', name: '基础素养', maxScore: 5,children:[
                {id: 'social_and_innovation_project', name: '科创项目赋分', children:[
                    {id: 'national', name: '国家级',children:[
                        {id: 'leader', name: '主持人', score: 4, maxScore: 4},
                        {id: 'second_third_fourth_place', name: '第二成员,第三成员和第四成员', score: 0.8, maxscore: 0.8},
                        {id: 'others', name: '其他成员', score: 0.5, maxScore: 0.5},
                    ],
                    },
                    {id: 'provincial', name: '省级',children:[
                        {id: 'leader', name: '主持人', score: 3, maxScore: 3},
                        {id: 'second_third_fourth_place', name: '第二成员,第三成员和第四成员', score: 0.5, maxscore: 0.5},
                        {id: 'others', name: '其他成员', score: 0.3, maxScore: 0.3},
                    ],
                    },
                    {id: 'university_level', name: '校级',children:[
                        {id: 'leader', name: '主持人', score: 2, maxScore: 2},
                        {id: 'second_third_fourth_place', name: '第二成员,第三成员和第四成员', score: 0.3, maxscore: 0.3},
                        {id: 'others', name: '其他成员', score: 0.2, maxScore: 0.2},
                    ],
                    },
                    {id: 'department_level', name: '院级',children:[
                        {id: 'leader', name: '主持人', score: 1, maxScore: 1},
                        {id: 'second_third_fourth_place', name: '第二成员,第三成员和第四成员', score: 0.2, maxscore: 0.2},
                        {id: 'others', name: '其他成员', score: 0.1, maxScore: 0.1},
                    ],
                    },
                ],
                },
                {id: 'paper', name: '论文发表',children:[
                    {id: 'CSSCI_liberal_arts', name: 'CSSCI(文科)',children:[
                        {id: 'first_auther', name: '第一作者',score: 5,maxscore: 5},
                        {id: 'second_auther', name: '第二作者',score: 1.5,maxscore: 1.5},
                        {id: 'other_auther', name: '其他作者',score: 0.5,maxscore: 0.5},
                    ],
                    },
                    {id: 'CSSCI_extended_liberal_arts', name: 'CSSCI_extended(文科)',children:[
                        {id: 'first_auther', name: '第一作者',score: 3,maxscore: 3},
                        {id: 'second_auther', name: '第二作者',score: 1,maxscore: 1},
                        {id: 'other_auther', name: '其他作者',score: 0.3,maxscore: 0.3},
                    ],
                    },
                    {id: 'SCI_EI_science', name: 'SCI_EI(理科)',children:[
                        {id: 'first_auther', name: '第一作者',score: 4,maxscore: 4},
                        {id: 'second_auther', name: '第二作者',score: 2.8,maxscore: 2.8},
                        {id: 'other_auther', name: '其他作者',score: 2.5,maxscore: 2.5},
                    ],
                    },
                    {id: 'SCI_EI_engineering', name: 'SCI_EI(工科)',children:[
                        {id: 'first_auther', name: '第一作者',score: 5,maxscore: 5},
                        {id: 'second_auther', name: '第二作者',score: 0.5,maxscore: 0.5},
                        {id: 'other_auther', name: '其他作者',score: 0.15,maxscore: 0.15},
                    ],
                    },
                    {id: 'SCI_EI_medicine', name: 'SCI_EI(医科)',children:[                               //X为影响因子
                        {id: 'first_auther', name: '第一作者',score: 3.5+0.3*X,maxscore: 3.5+0.3*X},
                        {id: 'second_auther', name: '第二作者',score: 2+0.3*X,maxscore: 2+0.3*X},
                        {id: 'other_auther', name: '其他作者',score: 0.5+0.3*X,maxscore: 0.5+0.3*X},
                    ],
                    },
                    {id: 'CCF_A', name: 'CCF A类会议论文及期刊论文',children:[
                        {id: 'first_auther', name: '第一作者',score: 5,maxscore: 5},
                        {id: 'second_auther', name: '第二作者',score: 0.5,maxscore: 0.5},
                        {id: 'other_auther', name: '其他作者',score: 0.15,maxscore: 0.15},
                    ],
                    },
                    {id: 'CCF_B', name: 'CCF B类会议论文及期刊论文',children:[
                        {id: 'first_auther', name: '第一作者',score: 4,maxscore: 4},
                        {id: 'second_auther', name: '第二作者',score: 0.4,maxscore: 0.4},
                        {id: 'other_auther', name: '其他作者',score: 0.13,maxscore: 0.13},
                    ],
                    },
                    {id: 'CCF_C', name: 'CCF C类会议论文及期刊论文',children:[
                        {id: 'first_auther', name: '第一作者',score: 3,maxscore: 3},
                        {id: 'second_auther', name: '第二作者',score: 0.3,maxscore: 0.3},
                        {id: 'other_auther', name: '其他作者',score: 0.1,maxscore: 0.1},
                    ],
                    },
                ],
                },
                {id: 'patent',name: '专利申请',children:[
                    {id: 'national_invention',name: '国家申请专利',children:[
                        {id: 'firstInventor_and_tansfer',name: '第一发明人且成果实施转让',score: 5,maxScore:5},
                        {id: 'firstInventor_and_nottansfer',name: '第一发明人且未实施转让',score: 4,maxScore:4},
                        {id: 'otherInventor_and_nottansfer',name: '其它发明人且未实施转让',score: 2.5,maxScore:2.5},
                    ],
                    },
                    {id: 'utility_model',name: '实用新型专利',children:[
                        {id: 'firstInventor_and_tansfer',name: '第一发明人且成果实施转让',score: 2,maxScore:2},
                        {id: 'firstInventor_and_nottansfer',name: '第一发明人且未实施转让',score: 1.5,maxScore:1.5},
                        {id: 'otherInventor_and_nottansfer',name: '其它发明人且未实施转让',score: 1,maxScore:1},
                    ],
                    },
                    {id: 'design',name: '外观专利',children:[
                        {id: 'firstInventor_and_tansfer',name: '第一发明人且成果实施转让',score: 0.5,maxScore:0.5},
                        {id: 'firstInventor_and_nottansfer',name: '第一发明人且未实施转让',score: 0.3,maxScore:0.3},
                        {id: 'otherInventor_and_nottansfer',name: '其它发明人且未实施转让',score: 0.25,maxScore:0.25},
                    ],
                    },
                ],
                },
                {id: 'competition',name: '创新创业竞赛',children:[
                    {id: 'A_A*_competition',name: 'A(A*)级创新创业竞赛',children:[
                        {id: 'national_firstPrize',name:'国家一等奖项目',children:[
                            {id:'more_than_three_undergraduate',name: '成员多于三名本科生',children:[        //该部分前几名成员赋分在突破提升部分中
                                {id: 'fourth_fifth_place',name: '第四成员与第五成员',score: 4,maxScore: 4},
                                {id: 'sixth_seventh_place',name: '第六成员与第七成员',score: 3,maxScore: 3},
                                {id: 'eighth_ninth_place',name: '第八成员与第九成员',score: 2,maxScore: 2},
                                {id: 'other_place',name: '其它成员',score: 1,maxScore: 1},                   //10位及以上的成员
                            ],
                            },
                        ],
                        },
                        {id: 'national_secondtPrize',name:'国家二等奖项目',children:[
                            {id:'more_than_three_undergraduate',name: '成员多于三名本科生',children:[        //该部分前几名成员赋分在突破提升部分中
                                {id: 'fourth_fifth_place',name: '第四成员与第五成员',score: 2,maxScore: 2},
                                {id: 'sixth_seventh_place',name: '第六成员与第七成员',score: 1.5,maxScore: 1.5},
                                {id: 'eighth_ninth_place',name: '第八成员与第九成员',score: 1,maxScore: 1},
                                {id: 'other_place',name: '其它成员',score: 0.5,maxScore: 0.5},                   //10位及以上的成员
                            ],
                            },
                        ],
                        },
                        {id: 'nationalFirstPrize_provincialFirstPrize',name:'国家三等奖项目与省级一等奖项目',children:[
                            {id:'more_than_three_undergraduate',name: '成员多于三名本科生',children:[        //该部分前几名成员赋分在突破提升部分中
                                {id: 'fourth_fifth_place',name: '第四成员与第五成员',score: 1.5,maxScore: 1.5},
                                {id: 'sixth_seventh_place',name: '第六成员与第七成员',score: 1,maxScore: 1},
                                {id: 'eighth_ninth_place',name: '第八成员与第九成员',score: 0.5,maxScore: 0.5},
                                {id: 'other_place',name: '其它成员',score: 0.35,maxScore: 0.35},                   //10位及以上的成员
                            ],
                            },
                        ],
                        },
                        {id: 'provincial_secondPrize',name:'省级二等奖项目',children:[
                            {id: 'less_than_three_undergraduate',name: '成员少于三名本科生',score: 2,maxScore: 2},
                            {id:'more_than_three_undergraduate',name: '成员多于三名本科生',children:[   
                                {id: 'first_to_third_place',name: '前三位成员',score: 2,maxScore: 2},   
                                {id: 'fourth_fifth_place',name: '第四成员与第五成员',score: 1,maxScore: 1},
                                {id: 'sixth_seventh_place',name: '第六成员与第七成员',score: 0.5,maxScore: 0.5},
                                {id: 'eighth_ninth_place',name: '第八成员与第九成员',score: 0.35,maxScore: 0.35},                   
                            ],
                            },
                        ],
                        },
                        {id: 'provincialThirdPrize_and_universityFirstPrize',name:'省级三等奖项目和校级一等奖项目',children:[
                            {id: 'less_than_three_undergraduate',name: '成员少于三名本科生',score: 1.5,maxScore: 1.5},
                            {id:'more_than_three_undergraduate',name: '成员多于三名本科生',children:[   
                                {id: 'first_to_third_place',name: '前三位成员',score: 1.5,maxScore: 1.5},   
                                {id: 'fourth_fifth_place',name: '第四成员与第五成员',score: 0.5,maxScore: 0.5},
                                {id: 'sixth_seventh_place',name: '第六成员与第七成员',score: 0.35,maxScore: 0.35},                  
                            ],
                            },
                        ],
                        },
                        {id: 'university_secondPrize',name:'校级二等奖项目',children:[
                            {id: 'less_than_three_undergraduate',name: '成员少于三名本科生',score: 1,maxScore: 1},
                            {id:'more_than_three_undergraduate',name: '成员多于三名本科生',children:[   
                                {id: 'first_to_third_place',name: '前三位成员',score: 1,maxScore: 1},   
                                {id: 'fourth_fifth_place',name: '第四成员与第五成员',score: 0.35,maxScore: 0.35},                
                            ],
                            },
                        ],
                        },
                        {id: 'universityThirdPrize_and_departmentFirstPrize',name:'校级三等奖项目和院级一等奖项目',children:[
                            {id: 'less_than_three_undergraduate',name: '成员少于三名本科生',score: 0.5,maxScore: 0.5},
                            {id:'more_than_three_undergraduate',name: '成员多于三名本科生',children:[   
                                {id: 'first_to_third_place',name: '前三位成员',score: 0.5,maxScore: 0.5},   
                                {id: 'fourth_fifth_place',name: '第四成员与第五成员',score: 0.2,maxScore: 0.2},                
                            ],
                            },
                        ],
                        },
                    ],
                    },
                    {id: 'A-_A-*_competition',name: 'A-(A-*)级创新创业竞赛',children:[
                        {id: 'national_firstPrize',name:'国家一等奖项目',children:[
                            {id:'more_than_three_undergraduate',name: '成员多于三名本科生',children:[        //该部分前几名成员赋分在突破提升部分中
                                {id: 'fourth_fifth_place',name: '第四成员与第五成员',score: 2,maxScore: 2},
                                {id: 'sixth_seventh_place',name: '第六成员与第七成员',score: 1.5,maxScore: 1.5},
                                {id: 'eighth_ninth_place',name: '第八成员与第九成员',score: 1,maxScore: 1},
                            ],
                            },
                        ],
                        },
                        {id: 'national_secondtPrize',name:'国家二等奖项目',children:[
                            {id:'more_than_three_undergraduate',name: '成员多于三名本科生',children:[        //该部分前几名成员赋分在突破提升部分中
                                {id: 'fourth_fifth_place',name: '第四成员与第五成员',score: 1,maxScore: 1},
                                {id: 'sixth_seventh_place',name: '第六成员与第七成员',score: 0.75,maxScore: 0.75},
                                {id: 'eighth_ninth_place',name: '第八成员与第九成员',score: 0.5,maxScore: 0.5},
                            ],
                            },
                        ],
                        },
                        {id: 'nationalFirstPrize_provincialFirstPrize',name:'国家三等奖项目与省级一等奖项目',children:[
                            {id: 'less_than_three_undergraduate',name: '成员少于三名本科生',score: 1.25,maxScore: 1.25},
                            {id:'more_than_three_undergraduate',name: '成员多于三名本科生',children:[
                                {id: 'first_to_third_place',name: '前三位成员',score: 1.25,maxScore: 1.25},        
                                {id: 'fourth_fifth_place',name: '第四成员与第五成员',score: 0.75,maxScore: 0.75},
                                {id: 'sixth_seventh_place',name: '第六成员与第七成员',score: 0.5,maxScore: 0.5},
                                {id: 'eighth_ninth_place',name: '第八成员与第九成员',score: 0.25,maxScore: 0.25},
                            ],
                            },
                        ],
                        },
                        {id: 'provincial_secondPrize',name:'省级二等奖项目',children:[
                            {id: 'less_than_three_undergraduate',name: '成员少于三名本科生',score: 1,maxScore: 1},
                            {id:'more_than_three_undergraduate',name: '成员多于三名本科生',children:[   
                                {id: 'first_to_third_place',name: '前三位成员',score: 1,maxScore: 1},   
                                {id: 'fourth_fifth_place',name: '第四成员与第五成员',score: 0.5,maxScore: 0.5},
                                {id: 'sixth_seventh_place',name: '第六成员与第七成员',score: 0.25,maxScore: 0.25},
                                {id: 'eighth_ninth_place',name: '第八成员与第九成员',score: 0.175,maxScore: 0.175},                   
                            ],
                            },
                        ],
                        },
                        {id: 'provincialThirdPrize_and_universityFirstPrize',name:'省级三等奖项目和校级一等奖项目',children:[
                            {id: 'less_than_three_undergraduate',name: '成员少于三名本科生',score: 0.75,maxScore: 0.75},
                            {id:'more_than_three_undergraduate',name: '成员多于三名本科生',children:[   
                                {id: 'first_to_third_place',name: '前三位成员',score: 0.75,maxScore: 0.75},   
                                {id: 'fourth_fifth_place',name: '第四成员与第五成员',score: 0.25,maxScore: 0.25},
                                {id: 'sixth_seventh_place',name: '第六成员与第七成员',score: 0.175,maxScore: 0.175},                  
                            ],
                            },
                        ],
                        },
                        {id: 'university_secondPrize',name:'校级二等奖项目',children:[
                            {id: 'less_than_three_undergraduate',name: '成员少于三名本科生',score: 0.5,maxScore: 0.5},
                            {id:'more_than_three_undergraduate',name: '成员多于三名本科生',children:[   
                                {id: 'first_to_third_place',name: '前三位成员',score: 0.5,maxScore: 0.5},   
                                {id: 'fourth_fifth_place',name: '第四成员与第五成员',score: 0.175,maxScore: 0.175},                
                            ],
                            },
                        ],
                        },
                        {id: 'universityThirdPrize_and_departmentFirstPrize',name:'校级三等奖项目和院级一等奖项目',children:[
                            {id: 'less_than_three_undergraduate',name: '成员少于三名本科生',score: 0.25,maxScore: 0.25},
                            {id:'more_than_three_undergraduate',name: '成员多于三名本科生',children:[   
                                {id: 'first_to_third_place',name: '前三位成员',score: 0.25,maxScore: 0.25},   
                                {id: 'fourth_fifth_place',name: '第四成员与第五成员',score: 0.1,maxScore: 0.1},                
                            ],
                            },
                        ],
                        },
                    ],
                    },
                    {id: 'B_B*_competition',name: 'B(B*)级创新创业竞赛',children:[
                        {id: 'national_firstPrize',name:'国家一等奖项目',children:[
                            {id: 'less_than_three_undergraduate',name: '成员少于三名本科生',score: 1.5,maxScore: 1.5},
                            {id:'more_than_three_undergraduate',name: '成员多于三名本科生',children:[ 
                                {id: 'first_to_third_place',name: '前三位成员',score: 1.5,maxScore: 1.5},       
                                {id: 'fourth_fifth_place',name: '第四成员与第五成员',score: 1.3333,maxScore: 1.3333},
                                {id: 'sixth_seventh_place',name: '第六成员与第七成员',score: 1,maxScore: 1},
                            ],
                            },
                        ],
                        },
                        {id: 'national_secondtPrize',name:'国家二等奖项目',children:[
                            {id: 'less_than_three_undergraduate',name: '成员少于三名本科生',score: 1,maxScore: 1},
                            {id:'more_than_three_undergraduate',name: '成员多于三名本科生',children:[  
                                {id: 'first_to_third_place',name: '前三位成员',score: 1,maxScore: 1},      
                                {id: 'fourth_fifth_place',name: '第四成员与第五成员',score: 1.3333,maxScore: 1.3333},
                                {id: 'sixth_seventh_place',name: '第六成员与第七成员',score: 0.5,maxScore: 0.5},
                            ],
                            },
                        ],
                        },
                        {id: 'nationalFirstPrize_provincialFirstPrize',name:'国家三等奖项目与省级一等奖项目',children:[
                            {id: 'less_than_three_undergraduate',name: '成员少于三名本科生',score: 0.8333,maxScore: 0.8333},
                            {id:'more_than_three_undergraduate',name: '成员多于三名本科生',children:[
                                {id: 'first_to_third_place',name: '前三位成员',score: 0.8333,maxScore: 0.8333},        
                                {id: 'fourth_fifth_place',name: '第四成员与第五成员',score: 0.5,maxScore: 0.5},
                                {id: 'sixth_seventh_place',name: '第六成员与第七成员',score: 0.3333,maxScore: 0.3333},
                            ],
                            },
                        ],
                        },
                        {id: 'provincial_secondPrize',name:'省级二等奖项目',children:[
                            {id: 'less_than_three_undergraduate',name: '成员少于三名本科生',score: 0.6667,maxScore: 0.6667},
                            {id:'more_than_three_undergraduate',name: '成员多于三名本科生',children:[   
                                {id: 'first_to_third_place',name: '前三位成员',score: 0.6667,maxScore: 0.6667},   
                                {id: 'fourth_fifth_place',name: '第四成员与第五成员',score: 0.3333,maxScore: 0.3333},
                                {id: 'sixth_seventh_place',name: '第六成员与第七成员',score: 0.1667,maxScore: 0.1667},                
                            ],
                            },
                        ],
                        },
                        {id: 'provincialThirdPrize_and_universityFirstPrize',name:'省级三等奖项目和校级一等奖项目',children:[
                            {id: 'less_than_three_undergraduate',name: '成员少于三名本科生',score: 0.5,maxScore: 0.5},
                            {id:'more_than_three_undergraduate',name: '成员多于三名本科生',children:[   
                                {id: 'first_to_third_place',name: '前三位成员',score: 0.5,maxScore: 0.5},   
                                {id: 'fourth_fifth_place',name: '第四成员与第五成员',score: 0.1667,maxScore: 0.1667},
                                {id: 'sixth_seventh_place',name: '第六成员与第七成员',score: 0.1167,maxScore: 0.1167},                  
                            ],
                            },
                        ],
                        },
                        {id: 'university_secondPrize',name:'校级二等奖项目',children:[
                            {id: 'less_than_three_undergraduate',name: '成员少于三名本科生',score: 0.3333,maxScore: 0.3333},
                            {id:'more_than_three_undergraduate',name: '成员多于三名本科生',children:[   
                                {id: 'first_to_third_place',name: '前三位成员',score: 0.3333,maxScore: 0.3333},   
                                {id: 'fourth_fifth_place',name: '第四成员与第五成员',score: 0.1167,maxScore: 0.1167},                
                            ],
                            },
                        ],
                        },
                        {id: 'universityThirdPrize_and_departmentFirstPrize',name:'校级三等奖项目和院级一等奖项目',children:[
                            {id: 'less_than_three_undergraduate',name: '成员少于三名本科生',score: 0.1667,maxScore: 0.1667},
                            {id:'more_than_three_undergraduate',name: '成员多于三名本科生',children:[   
                                {id: 'first_to_third_place',name: '前三位成员',score: 0.1667,maxScore: 0.1667},   
                                {id: 'fourth_fifth_place',name: '第四成员与第五成员',score: 0.0667,maxScore: 0.0667},                
                            ],
                            },
                        ],
                        },
                    ],
                    },
                    {id: 'C_competition',name: 'C级创新创业竞赛',children:[
                        {id: 'national_firstPrize',name:'国家一等奖项目',children:[
                            {id: 'less_than_three_undergraduate',name: '成员少于三名本科生',score: 1.125,maxScore: 1.125},
                            {id:'more_than_three_undergraduate',name: '成员多于三名本科生',children:[ 
                                {id: 'first_to_third_place',name: '前三位成员',score: 1.125,maxScore: 1.125},       
                                {id: 'fourth_fifth_place',name: '第四成员与第五成员',score: 1,maxScore: 1},
                            ],
                            },
                        ],
                        },
                        {id: 'national_secondtPrize',name:'国家二等奖项目',children:[
                            {id: 'less_than_three_undergraduate',name: '成员少于三名本科生',score: 0.75,maxScore: 0.75},
                            {id:'more_than_three_undergraduate',name: '成员多于三名本科生',children:[  
                                {id: 'first_to_third_place',name: '前三位成员',score: 0.75,maxScore: 0.75},      
                                {id: 'fourth_fifth_place',name: '第四成员与第五成员',score: 0.5,maxScore: 0.5},
                            ],
                            },
                        ],
                        },
                        {id: 'nationalFirstPrize_provincialFirstPrize',name:'国家三等奖项目与省级一等奖项目',children:[
                            {id: 'less_than_three_undergraduate',name: '成员少于三名本科生',score: 0.625,maxScore: 0.625},
                            {id:'more_than_three_undergraduate',name: '成员多于三名本科生',children:[
                                {id: 'first_to_third_place',name: '前三位成员',score: 0.625,maxScore: 0.625},        
                                {id: 'fourth_fifth_place',name: '第四成员与第五成员',score: 0.375,maxScore: 0.375},
                            ],
                            },
                        ],
                        },
                        {id: 'provincial_secondPrize',name:'省级二等奖项目',children:[
                            {id: 'less_than_three_undergraduate',name: '成员少于三名本科生',score: 0.5,maxScore: 0.5},
                            {id:'more_than_three_undergraduate',name: '成员多于三名本科生',children:[   
                                {id: 'first_to_third_place',name: '前三位成员',score: 0.5,maxScore: 0.5},   
                                {id: 'fourth_fifth_place',name: '第四成员与第五成员',score: 0.25,maxScore: 0.25},            
                            ],
                            },
                        ],
                        },
                        {id: 'provincialThirdPrize_and_universityFirstPrize',name:'省级三等奖项目和校级一等奖项目',children:[
                            {id: 'less_than_three_undergraduate',name: '成员少于三名本科生',score: 0.375,maxScore: 0.375},
                            {id:'more_than_three_undergraduate',name: '成员多于三名本科生',children:[   
                                {id: 'first_to_third_place',name: '前三位成员',score: 0.375,maxScore: 0.375},   
                                {id: 'fourth_fifth_place',name: '第四成员与第五成员',score: 0.125,maxScore: 0.125},              
                            ],
                            },
                        ],
                        },
                        {id: 'university_secondPrize',name:'校级二等奖项目',children:[
                            {id: 'less_than_three_undergraduate',name: '成员少于三名本科生',score: 0.25,maxScore: 0.25},
                            {id:'more_than_three_undergraduate',name: '成员多于三名本科生',children:[   
                                {id: 'first_to_third_place',name: '前三位成员',score: 0.25,maxScore: 0.25},   
                                {id: 'fourth_fifth_place',name: '第四成员与第五成员',score: 0.0875,maxScore: 0.0875},                
                            ],
                            },
                        ],
                        },
                        {id: 'universityThirdPrize_and_departmentFirstPrize',name:'校级三等奖项目和院级一等奖项目',children:[
                            {id: 'less_than_three_undergraduate',name: '成员少于三名本科生',score: 0.125,maxScore: 0.125},
                            {id:'more_than_three_undergraduate',name: '成员多于三名本科生',children:[   
                                {id: 'first_to_third_place',name: '前三位成员',score: 0.125,maxScore: 0.125},   
                                {id: 'fourth_fifth_place',name: '第四成员与第五成员',score: 0.05,maxScore: 0.05},                
                            ],
                            },
                        ],
                        },
                    ],
                    },
                    {id: 'D_competition',name: 'D级创新创业竞赛',children:[
                        {id: 'national_firstPrize',name:'国家一等奖项目',children:[
                            {id: 'first_to_third_place',name: '前三位成员',score: 0.5625,maxScore: 0.5625},        
                        ],
                        },
                        {id: 'national_secondtPrize',name:'国家二等奖项目',children:[
                            {id: 'first_to_third_place',name: '前三位成员',score: 0.375,maxScore: 0.375},  
                        ],
                        },
                        {id: 'nationalFirstPrize_provincialFirstPrize',name:'国家三等奖项目与省级一等奖项目',children:[
                            {id: 'first_to_third_place',name: '前三位成员',score: 0.3125,maxScore: 0.3125},  
                        ],
                        },
                        {id: 'provincial_secondPrize',name:'省级二等奖项目',children:[
                            {id: 'first_to_third_place',name: '前三位成员',score: 0.25,maxScore: 0.25},  
                        ],
                        },
                        {id: 'provincialThirdPrize_and_universityFirstPrize',name:'省级三等奖项目和校级一等奖项目',children:[
                            {id: 'first_to_third_place',name: '前三位成员',score: 0.1875,maxScore: 0.1875},  
                        ],
                        },
                        {id: 'university_secondPrize',name:'校级二等奖项目',children:[
                            {id: 'first_to_third_place',name: '前三位成员',score: 0.125,maxScore: 0.125},  
                        ],
                        },
                        {id: 'universityThirdPrize_and_departmentFirstPrize',name:'校级三等奖项目和院级一等奖项目',children:[
                            {id: 'first_to_third_place',name: '前三位成员',score: 0.0625,maxScore: 0.0625},  
                        ],
                        },
                    ],
                    },
                    {id: 'E_competition',name: 'E级创新创业竞赛',children:[
                        {id: 'national_firstPrize',name:'国家一等奖项目',children:[
                            {id: 'first_place',name: '第一位成员',score: 0.2813,maxScore: 0.2813},        
                        ],
                        },
                        {id: 'national_secondtPrize',name:'国家二等奖项目',children:[
                            {id: 'first_place',name: '第一位成员',score: 0.1875,maxScore: 0.1875},  
                        ],
                        },
                        {id: 'nationalFirstPrize_provincialFirstPrize',name:'国家三等奖项目与省级一等奖项目',children:[
                            {id: 'first_place',name: '第一位成员',score: 0.1563,maxScore: 0.1563},  
                        ],
                        },
                        {id: 'provincial_secondPrize',name:'省级二等奖项目',children:[
                            {id: 'first_place',name: '第一位成员',score: 0.125,maxScore: 0.125},  
                        ],
                        },
                        {id: 'provincialThirdPrize_and_universityFirstPrize',name:'省级三等奖项目和校级一等奖项目',children:[
                            {id: 'first_place',name: '第一位成员',score: 0.0938,maxScore: 0.0938},  
                        ],
                        },
                        {id: 'university_secondPrize',name:'校级二等奖项目',children:[
                            {id: 'first_place',name: '第一位成员',score: 0.0625,maxScore: 0.0625},  
                        ],
                        },
                        {id: 'universityThirdPrize_and_departmentFirstPrize',name:'校级三等奖项目和院级一等奖项目',children:[
                            {id: 'first_place',name: '第一位成员',score: 0.0313,maxScore: 0.0313},  
                        ],
                        },
                    ],
                    },
                ],
                },
                {id: 'entrepreneurship_practice',name: '创新创业实践',children:[                 //每个同学最多计算一个创业公司
                    {id: 'legal_morethanOneYear',name: '法人，盈利不少于一年',score: 4,maxScore: 4},                               //需个人占股30%及以上
                    {id: 'legal_morethanSixMonth_lessthanOneYear',name: '法人，盈利超过六个月但少于一年',score: 2 maxScore: 2},     //需个人占股30%及以上
                    {id: 'shareholder_morethanOneYear',name: '担任主要股东不少于一年',score: 1,maxScore: 1},                       //需个人占股10%及以上
                ],
                },
                {id: 'intenational_academic_exchange', name: '境外学术交流活动',score: 0,maxScore:5},       //参加长期境外学术交流项目（90天以上）最高赋分不超过5分，参加短期境外学术交流项目（90天以内）最高赋分不超过3分
            ],
            },
            { id: 'breakthrough', name: '突破提升', maxScore: 40,children:[
                {id: 'scientific_reasearch',name: '科研成果',score: 0,maxScore: 40},
                {id: 'intenational_organization_intenship',name: '国际组织实习',score: 0,maxScore: 40},
                {id: 'competition',name: '创新创业竞赛',children:[
                    {id: 'A_A*_competition',name: 'A(A*)级创新创业竞赛',children:[
                        {id: 'national_firstPrize',name: '国家一等奖',score: 40,maxScore: 40},
                        {id: 'national_secondPrize',name: '国家二等奖',score: 30,maxScore: 30},
                        {id: 'national_thirdPrize',name: '国家三等奖',score: 10,maxScore: 10},
                    ],
                    },
                    {id: 'A-_A-*_competition',name: 'A-(A-*)级创新创业竞赛',children:[
                        {id: 'national_firstPrize',name: '国家一等奖',score: 20,maxScore: 20},
                        {id: 'national_secondPrize',name: '国家二等奖',score: 10,maxScore: 10},
                    ],
                    },
                ],
                },
            ],
            },
        ],
    },
]
const mockCourses = [
  {
    id: 1,
    name: '高等数学',
    subject: '数学',
    teacher: '张教授',
    classroom: '教学楼A-301',
    day_of_week: 1,
    start_period: 1,
    end_period: 2,
    week_range: '1-16',
    reminder: 1,
    reminder_minutes: 15,
    color: '#42b9ff'
  },
  {
    id: 2,
    name: '大学英语',
    subject: '英语',
    teacher: '李老师',
    classroom: '语言楼B-205',
    day_of_week: 1,
    start_period: 3,
    end_period: 4,
    week_range: '1-16',
    reminder: 1,
    reminder_minutes: 10,
    color: '#52c41a'
  },
  {
    id: 3,
    name: '数据结构',
    subject: '计算机',
    teacher: '王教授',
    classroom: '实验楼C-402',
    day_of_week: 2,
    start_period: 2,
    end_period: 4,
    week_range: '1-16',
    reminder: 0,
    color: '#faad14'
  },
  {
    id: 4,
    name: '操作系统',
    subject: '计算机',
    teacher: '赵老师',
    classroom: '实验楼C-402',
    day_of_week: 3,
    start_period: 1,
    end_period: 2,
    week_range: '1-16',
    reminder: 1,
    color: '#f5222d'
  },
  {
    id: 5,
    name: '软件工程',
    subject: '计算机',
    teacher: '刘教授',
    classroom: '教学楼A-401',
    day_of_week: 4,
    start_period: 3,
    end_period: 5,
    week_range: '1-16',
    reminder: 0,
    color: '#722ed1'
  },
  {
    id: 6,
    name: '体育',
    subject: '体育',
    teacher: '陈老师',
    classroom: '体育馆',
    day_of_week: 5,
    start_period: 4,
    end_period: 5,
    week_range: '1-16',
    reminder: 0,
    color: '#13c2c2'
  }
]

const mockTodos = [
  {
    id: 1,
    title: '完成数据结构作业',
    description: '课后习题P120-P130',
    category: '作业',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    reminder: 1,
    reminder_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 - 1 * 60 * 60 * 1000).toISOString(),
    completed: 0
  },
  {
    id: 2,
    title: '复习英语单词',
    description: '背诵Unit5-Unit8单词',
    category: '复习',
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    reminder: 0,
    completed: 0
  },
  {
    id: 3,
    title: '准备操作系统考试',
    description: '复习进程管理、内存管理章节',
    category: '考试',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    reminder: 1,
    completed: 0
  },
  {
    id: 4,
    title: '提交软件工程报告',
    description: '需求分析文档',
    category: '作业',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    reminder: 1,
    completed: 1
  },
  {
    id: 5,
    title: '阅读论文',
    description: '深度学习相关论文3篇',
    category: '阅读',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    reminder: 0,
    completed: 0
  }
]

const mockFocusRecords = [
  {
    id: 1,
    focus_duration: 25,
    rest_duration: 5,
    start_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000).toISOString(),
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: 2,
    focus_duration: 50,
    rest_duration: 10,
    start_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: 3,
    focus_duration: 75,
    rest_duration: 15,
    start_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000).toISOString(),
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
]

const mockNotes = [
  {
    id: 1,
    title: '数据结构笔记-链表',
    content: '链表是一种常见的数据结构，由一系列节点组成...',
    type: 0,
    subject: '计算机',
    tags: '数据结构,链表',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    title: '高数错题-极限计算',
    content: '题目：求极限 lim(x->0) sin(x)/x',
    type: 1,
    subject: '数学',
    tags: '极限,错题',
    answer: '答案：1',
    analysis: '利用重要极限公式，sin(x)/x在x趋近于0时的极限为1...',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    title: '操作系统笔记-进程调度',
    content: '进程调度算法包括：FCFS、SJF、RR、优先级调度...',
    type: 0,
    subject: '计算机',
    tags: '操作系统,进程调度',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
]

const mockStats = {
  daily: {
    date: new Date().toISOString().split('T')[0],
    focus_duration: 120,
    task_count: 5,
    completed_count: 2,
    completion_rate: 40
  },
  weekly: {
    week_start: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    week_end: new Date().toISOString().split('T')[0],
    total_focus: 520,
    daily_data: [
      { date: '周一', duration: 60 },
      { date: '周二', duration: 90 },
      { date: '周三', duration: 80 },
      { date: '周四', duration: 120 },
      { date: '周五', duration: 70 },
      { date: '周六', duration: 50 },
      { date: '周日', duration: 50 }
    ],
    task_completion_rate: 65
  }
}

module.exports = {
  mockCourses,
  mockTodos,
  mockFocusRecords,
  mockNotes,
  mockStats
}
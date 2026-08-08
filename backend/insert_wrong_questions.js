const http = require('http');

const wrongQuestions = [
  {
    userId: 3,
    subject: '高等数学',
    question: '求极限：lim(x->0) sin(x)/x',
    answer: '1',
    analysis: '利用重要极限lim(x->0) sin(x)/x = 1。也可以使用洛必达法则，分子分母同时求导得cos(x)/1，当x->0时cos(0)=1。'
  },
  {
    userId: 3,
    subject: '数据结构',
    question: '快速排序的平均时间复杂度是多少？最好和最坏情况呢？',
    answer: '平均O(n log n)，最好O(n log n)，最坏O(n²)',
    analysis: '快速排序采用分治策略，平均情况下每次划分将数组分成两部分。最坏情况发生在数组已经有序或逆序时，每次划分只能减少一个元素。'
  },
  {
    userId: 3,
    subject: '英语',
    question: 'He insisted on ____ the meeting.',
    answer: 'attending',
    analysis: 'insist on后面接动名词形式。insist on doing sth. 坚持做某事。类似的动词还有：suggest, recommend, avoid等。'
  },
  {
    userId: 3,
    subject: '操作系统',
    question: '进程和线程的主要区别是什么？',
    answer: '资源分配的基本单位 vs CPU调度的基本单位',
    analysis: '进程是资源分配的基本单位，拥有独立的地址空间、代码段、数据段等。线程是CPU调度的基本单位，共享进程的资源，开销更小，切换更快。'
  }
];

function insertWrongQuestion(wrong, callback) {
  const data = JSON.stringify(wrong);
  const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/api/wrong-questions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(data, 'utf8')
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      console.log('插入成功:', wrong.subject, '-', wrong.question.substring(0, 20) + '...');
      callback();
    });
  });

  req.on('error', (e) => {
    console.error('请求失败:', e);
    callback();
  });

  req.write(data, 'utf8');
  req.end();
}

function insertAll() {
  let index = 0;
  function next() {
    if (index < wrongQuestions.length) {
      insertWrongQuestion(wrongQuestions[index], () => {
        index++;
        setTimeout(next, 500);
      });
    } else {
      console.log('所有错题插入完成！');
    }
  }
  next();
}

insertAll();

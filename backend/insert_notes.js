const http = require('http');

const notes = [
  {
    userId: 3,
    title: '数据结构复习笔记',
    content: '链表是一种常见的数据结构，由一系列节点组成，每个节点包含数据和指向下一个节点的指针。链表的优点是插入和删除操作效率高，缺点是访问元素需要从头遍历。常见的链表类型包括单链表、双链表和循环链表。',
    tags: '数据结构,复习'
  },
  {
    userId: 3,
    title: '高等数学公式总结',
    content: '微积分基本公式：牛顿-莱布尼茨公式、泰勒展开式、洛必达法则。导数公式：sin x 的导数是 cos x，cos x 的导数是 -sin x。积分公式：∫x^n dx = x^(n+1)/(n+1) + C。',
    tags: '高数,公式'
  },
  {
    userId: 3,
    title: '英语单词背诵',
    content: '每天背诵20个单词，重点记忆词根词缀。本周背诵计划：周一到周五每天20个，周末复习巩固。推荐使用艾宾浩斯遗忘曲线进行复习。',
    tags: '英语,单词'
  },
  {
    userId: 3,
    title: '操作系统复习要点',
    content: '进程管理：进程与线程的区别、进程调度算法（FCFS、SJF、RR）。内存管理：分页、分段、虚拟内存。文件系统：文件结构、目录结构。',
    tags: '操作系统,复习'
  }
];

function insertNote(note, callback) {
  const data = JSON.stringify(note);
  const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/api/notes',
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
      console.log('插入成功:', JSON.parse(body).title);
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
    if (index < notes.length) {
      insertNote(notes[index], () => {
        index++;
        setTimeout(next, 500);
      });
    } else {
      console.log('所有笔记插入完成！');
    }
  }
  next();
}

insertAll();
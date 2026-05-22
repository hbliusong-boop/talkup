const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const DB_FILE = '/root/english_app.db';

function readDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  } catch (e) {}
  return { users: {}, scenarios: [], studyRecords: [], vocab: {}, userSettings: {}, tokens: {}, resetCodes: {}, phoneCodes: {}, userProgress: {} };
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

let db = readDB();
if (!db.userProgress) db.userProgress = {};

// Token 配置
const ACCESS_TOKEN_EXPIRE = 60 * 60;
const REFRESH_TOKEN_EXPIRE = 30 * 24 * 60 * 60;

function generateTokens(userId) {
  const accessToken = uuidv4();
  const refreshToken = uuidv4();
  const accessExpires = Date.now() + ACCESS_TOKEN_EXPIRE * 1000;
  const refreshExpires = Date.now() + REFRESH_TOKEN_EXPIRE * 1000;
  if (!db.tokens) db.tokens = {};
  db.tokens[accessToken] = { userId, expires: accessExpires, type: 'access' };
  db.tokens[refreshToken] = { userId, expires: refreshExpires, type: 'refresh' };
  writeDB(db);
  return { access_token: accessToken, refresh_token: refreshToken, expires_in: ACCESS_TOKEN_EXPIRE };
}

function verifyToken(token) {
  if (!db.tokens || !db.tokens[token]) return null;
  const tokenData = db.tokens[token];
  if (Date.now() > tokenData.expires) { delete db.tokens[token]; return null; }
  return tokenData;
}

function getUserId(req) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    const tokenData = verifyToken(auth.slice(7));
    if (tokenData) return tokenData.userId;
  }
  return req.query.user_id || (req.body && req.body.user_id);
}

// 默认管理员账号
if (!db.users['admin@talkup.cn']) {
  db.users['admin@talkup.cn'] = { id: 'admin001', email: 'admin@talkup.cn', password: 'ls123456', nickname: 'Admin', createdAt: new Date().toISOString() };
  writeDB(db);
}

// 场景数据 (UI设计格式)
const SCENARIOS = [
  { id: 1, cat: 'work', icon: 'person', t: '自我介绍', en: 'Self Introduction', desc: '学习如何用英语介绍自己，从名字到工作都能流利表达。', level: 'A1', time: 10, lessons: 6, learners: '42.1k', featured: true, sortOrder: 1,
    dialogues: [
      { sp: 'Agent', a: 'agent', en: 'Hello! Please introduce yourself.', zh: '你好！请介绍一下你自己。', vocab: [] },
      { sp: 'You', a: 'you', en: 'Hi, my name is Li Ming. I am from Beijing.', zh: '你好，我叫李明，来自北京。', vocab: ['name', 'from'] },
      { sp: 'Agent', a: 'agent', en: 'Nice to meet you! What do you do?', zh: '很高兴认识你！你是做什么工作的？', vocab: ['nice to meet you'] },
      { sp: 'You', a: 'you', en: 'I am a software engineer. I work at a tech company.', zh: '我是一名软件工程师。', vocab: ['engineer', 'company'] },
      { sp: 'Agent', a: 'agent', en: 'That sounds interesting! Do you enjoy it?', zh: '听起来很有趣！你喜欢吗？', vocab: ['interesting'] },
      { sp: 'You', a: 'you', en: 'Yes, I really enjoy it. The team is great.', zh: '是的，我很喜欢。团队很棒。', vocab: ['team'] }
    ]},
  { id: 2, cat: 'work', icon: 'briefcase', t: '面试准备', en: 'Interview Preparation', desc: '常见面试问题及回答技巧，用STAR法则展示你的能力。', level: 'A2', time: 20, lessons: 8, learners: '31.5k', featured: false, sortOrder: 2,
    dialogues: [
      { sp: 'Agent', a: 'agent', en: 'Why do you want to work here?', zh: '你为什么想在这里工作？', vocab: ['why', 'work'] },
      { sp: 'You', a: 'you', en: 'I am impressed by your company culture.', zh: '贵公司文化给我留下深刻印象。', vocab: ['impressed', 'culture'] },
      { sp: 'Agent', a: 'agent', en: 'What are your strengths?', zh: '你有什么优点？', vocab: ['strengths'] },
      { sp: 'You', a: 'you', en: 'I am organized and meet deadlines.', zh: '我有条理，善于按时完成。', vocab: ['organized', 'deadlines'] },
      { sp: 'Agent', a: 'agent', en: 'Tell me about a challenge.', zh: '说说一个挑战。', vocab: ['challenge'] },
      { sp: 'You', a: 'you', en: 'I delivered a project by working overtime.', zh: '我通过加班成功交付项目。', vocab: ['project', 'delivered'] }
    ]},
  { id: 3, cat: 'work', icon: 'trending_up', t: '薪资谈判', en: 'Salary Negotiation', desc: '如何谈论薪资，了解市场行情并获得合理报酬。', level: 'B1', time: 15, lessons: 6, learners: '18.2k', featured: false, sortOrder: 3,
    dialogues: [
      { sp: 'Agent', a: 'agent', en: 'What salary do you expect?', zh: '你期望多少薪资？', vocab: ['salary', 'expect'] },
      { sp: 'You', a: 'you', en: 'Around 25k to 30k per month.', zh: '月薪25000-30000。', vocab: ['around', 'per month'] },
      { sp: 'Agent', a: 'agent', en: 'What benefits matter to you?', zh: '什么福利对你重要？', vocab: ['benefits', 'matter'] },
      { sp: 'You', a: 'you', en: 'Health insurance and flexible hours.', zh: '医保和弹性时间。', vocab: ['insurance', 'flexible'] },
      { sp: 'Agent', a: 'agent', en: 'We can offer 28k plus bonus.', zh: '我们可以给28k加奖金。', vocab: ['bonus'] },
      { sp: 'You', a: 'you', en: 'That sounds reasonable.', zh: '听起来合理。', vocab: ['reasonable'] }
    ]},
  { id: 11, cat: 'travel', icon: 'plane', t: '机场值机', en: 'Airport Check-in', desc: '在值机柜台办理登机牌、托运行李，听懂工作人员的标准提问。', level: 'A2', time: 8, lessons: 6, learners: '68.7k', featured: true, sortOrder: 11,
    dialogues: [
      { sp: 'Agent', a: 'agent', en: 'Good morning. May I see your passport and ticket, please?', zh: '早上好。可以让我看一下您的护照和机票吗？', vocab: ['passport', 'ticket'] },
      { sp: 'You', a: 'you', en: 'Here you are. I am flying to San Francisco.', zh: '给您。我要飞旧金山。', vocab: ['flying'] },
      { sp: 'Agent', a: 'agent', en: 'Thank you. Are you checking any bags today?', zh: '谢谢。今天有要托运的行李吗？', vocab: ['checking', 'bags'] },
      { sp: 'You', a: 'you', en: 'Just one suitcase. My carry-on goes with me.', zh: '只有一件行李箱。这个随身包我带上飞机。', vocab: ['suitcase', 'carry-on'] },
      { sp: 'Agent', a: 'agent', en: 'Could you place it on the scale, please?', zh: '麻烦把它放上称重台好吗？', vocab: ['scale'] },
      { sp: 'You', a: 'you', en: 'Sure. Is it within the weight limit?', zh: '好的。在重量范围里吗？', vocab: ['weight', 'limit'] },
      { sp: 'Agent', a: 'agent', en: 'You are good — 22 kilos. Would you prefer a window or an aisle seat?', zh: '没问题——22公斤。您想要靠窗还是靠过道的座位？', vocab: ['kilos', 'window', 'aisle'] },
      { sp: 'You', a: 'you', en: 'A window seat, please.', zh: '靠窗的，谢谢。', vocab: [] },
      { sp: 'Agent', a: 'agent', en: 'Here is your boarding pass. Gate 14, boarding starts at 9:45. Have a pleasant flight.', zh: '这是您的登机牌。14号登机口，9点45开始登机。祝您旅途愉快。', vocab: ['boarding pass', 'gate', 'pleasant'] }
    ]},
  { id: 13, cat: 'travel', icon: 'restaurant', t: '餐厅点餐', en: 'Ordering at a Restaurant', desc: '点一杯燕麦拿铁、要冰、要加糖——把生活里最高频的对话学好。', level: 'A1', time: 6, lessons: 4, learners: '72.8k', featured: false, sortOrder: 13,
    dialogues: [
      { sp: 'Agent', a: 'agent', en: 'Hi, what can I get you?', zh: '嗨，想点什么？', vocab: ['get'] },
      { sp: 'You', a: 'you', en: 'Can I have an oat latte, iced, with extra sugar?', zh: '一杯燕麦拿铁，冰的，多加糖。', vocab: ['oat latte', 'iced', 'sugar'] },
      { sp: 'Agent', a: 'agent', en: 'What size would you like?', zh: '要中杯还是大杯？', vocab: ['size'] },
      { sp: 'You', a: 'you', en: 'Medium, please.', zh: '中杯，谢谢。', vocab: ['medium'] },
      { sp: 'Agent', a: 'agent', en: 'Would you like anything else?', zh: '还需要别的吗？', vocab: ['else'] },
      { sp: 'You', a: 'you', en: 'No, that is all. Thank you!', zh: '不用了，谢谢！', vocab: [] }
    ]},
  { id: 12, cat: 'travel', icon: 'bed', t: '酒店入住', en: 'Hotel Check-in', desc: '入住、要求换房、问Wi-Fi、退房——一次商旅必经的对话流程。', level: 'A2', time: 9, lessons: 5, learners: '45.2k', featured: false, sortOrder: 12,
    dialogues: [
      { sp: 'Agent', a: 'agent', en: 'Good evening. Reservation for Wang?', zh: '晚上好。王先生有预订吗？', vocab: ['reservation'] },
      { sp: 'You', a: 'you', en: 'Yes, double room for three nights.', zh: '是的，双人房三晚。', vocab: ['double', 'nights'] },
      { sp: 'Agent', a: 'agent', en: 'May I see your passport?', zh: '可以看一下护照吗？', vocab: ['passport'] },
      { sp: 'You', a: 'you', en: 'Here you go.', zh: '给您。', vocab: [] },
      { sp: 'Agent', a: 'agent', en: 'Breakfast is from 7 to 10 AM on the ground floor. Wi-Fi password is on the card.', zh: '早餐7到10点，底楼。Wi-Fi密码在卡上。', vocab: ['breakfast', 'Wi-Fi'] },
      { sp: 'You', a: 'you', en: 'Can I have a late checkout?', zh: '能晚退房吗？', vocab: ['checkout'] },
      { sp: 'Agent', a: 'agent', en: 'We can extend to 3 PM free of charge.', zh: '可以免费延到下午3点。', vocab: ['extend', 'charge'] }
    ]}
];

// 初始化场景
if (!db.scenarios || db.scenarios.length === 0) {
  db.scenarios = SCENARIOS;
  writeDB(db);
}

// ============ API 路由 ============

// 登录
app.post('/api/auth/login', (req, res) => { console.log('=== LOGIN DEBUG ==='); console.log('Raw body:', JSON.stringify(req.body)); const { email, password } = req.body; console.log('Email:', email, 'Password:', password); const user = db.users[email]; console.log('User found:', !!user); if (user) console.log('DB password:', user.password); 
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  user.lastLogin = new Date().toISOString();
  writeDB(db);
  const tokens = generateTokens(user.id);
  res.json({ id: user.id, email: user.email, nickname: user.nickname, ...tokens });
});

// 注册
app.post('/api/auth/register', (req, res) => {
  const { email, password, nickname } = req.body;
  if (db.users[email]) { return res.status(400).json({ error: 'Email already exists' }); }
  const user = { id: uuidv4(), email, password, nickname: nickname || email.split('@')[0], createdAt: new Date().toISOString() };
  db.users[email] = user;
  writeDB(db);
  const tokens = generateTokens(user.id);
  res.json({ id: user.id, email: user.email, nickname: user.nickname, ...tokens });
});

// 刷新Token
app.post('/api/auth/refresh', (req, res) => {
  const { refresh_token } = req.body;
  const tokenData = verifyToken(refresh_token);
  if (!tokenData || tokenData.type !== 'refresh') { return res.status(401).json({ error: 'Invalid refresh token' }); }
  delete db.tokens[refresh_token];
  const newTokens = generateTokens(tokenData.userId);
  res.json(newTokens);
});

// 登出
app.post('/api/auth/logout', (req, res) => {
  const { refresh_token } = req.body;
  if (refresh_token && db.tokens && db.tokens[refresh_token]) { delete db.tokens[refresh_token]; writeDB(db); }
  res.json({ success: true });
});

// 场景列表
app.get('/api/scenarios', (req, res) => {
  const userId = getUserId(req);
  let scenarios = db.scenarios || SCENARIOS;
  // 如果用户登录了，附加进度信息
  if (userId && db.userProgress && db.userProgress[userId]) {
    const progress = db.userProgress[userId];
    scenarios = scenarios.map(s => ({
      ...s,
      progress: progress[s.id] ? 100 : 0
    }));
  } else {
    scenarios = scenarios.map(s => ({ ...s, progress: 0 }));
  }
  res.json(scenarios);
});

// 场景详情
app.get('/api/scenarios/:id', (req, res) => {
  const scenario = (db.scenarios || SCENARIOS).find(s => s.id == req.params.id);
  if (!scenario) { return res.status(404).json({ error: 'Not found' }); }
  res.json(scenario);
});

// 记录学习
app.post('/api/study/record', (req, res) => {
  const { user_id, scenario_id, scenario_name, duration } = req.body;
  if (!user_id) { return res.status(400).json({ error: 'user_id required' }); }
  const record = { id: uuidv4(), user_id, scenario_id, scenario_name, duration: duration || 0, createdAt: new Date().toISOString() };
  db.studyRecords = db.studyRecords || [];
  db.studyRecords.push(record);
  // 更新用户进度
  if (!db.userProgress[user_id]) db.userProgress[user_id] = {};
  db.userProgress[user_id][scenario_id] = true;
  writeDB(db);
  res.json({ success: true, record });
});

// 学习历史
app.get('/api/study/history', (req, res) => {
  const user_id = req.query.user_id;
  const records = (db.studyRecords || []).filter(r => r.user_id == user_id);
  res.json(records.map(r => ({ id: r.id, scenario_id: r.scenario_id, scenario_name: r.scenario_name, duration: r.duration, date: r.createdAt })));
});

// 学习统计（增强版，用于日历）
app.get('/api/study/stats', (req, res) => {
  const user_id = req.query.user_id;
  const userRecords = (db.studyRecords || []).filter(r => r.user_id == user_id);
  const totalMinutes = userRecords.reduce((sum, r) => sum + (r.duration || 0), 0);
  
  // 计算连击
  const dates = [...new Set(userRecords.map(r => r.createdAt?.slice(0, 10)))].sort().reverse();
  const today = new Date().toISOString().slice(0, 10);
  let streak = 0, longest = 0, tempStreak = 0;
  const sortedDates = [...dates].sort();
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) { tempStreak = 1; }
    else {
      const diff = (new Date(sortedDates[i]) - new Date(sortedDates[i-1])) / (1000 * 60 * 60 * 24);
      if (diff === 1) { tempStreak++; } else { tempStreak = 1; }
    }
    longest = Math.max(longest, tempStreak);
  }
  // 当前连击
  if (dates[0] === today || dates[0] === new Date(Date.now() - 86400000).toISOString().slice(0, 10)) {
    streak = 1;
    for (let i = 1; i < dates.length; i++) {
      const diff = (new Date(dates[i-1]) - new Date(dates[i])) / (1000 * 60 * 60 * 24);
      if (diff === 1) streak++; else break;
    }
  }
  
  res.json({ 
    streak, 
    longest, 
    totalMinutes, 
    sessions: userRecords.length 
  });
});

// 用户学习日历数据
app.get('/api/study/calendar', (req, res) => {
  const user_id = req.query.user_id;
  if (!user_id) { return res.status(400).json({ error: 'user_id required' }); }
  const userRecords = (db.studyRecords || []).filter(r => r.user_id == user_id);
  
  // 按日期分组
  const byDate = {};
  userRecords.forEach(r => {
    const date = r.createdAt?.slice(0, 10);
    if (!byDate[date]) byDate[date] = { scenarios: [], totalMinutes: 0 };
    byDate[date].scenarios.push({ name: r.scenario_name, minutes: r.duration || 0, createdAt: r.createdAt });
    byDate[date].totalMinutes += r.duration || 0;
  });
  
  // 统计
  const totalMinutes = userRecords.reduce((sum, r) => sum + (r.duration || 0), 0);
  const dates = [...new Set(userRecords.map(r => r.createdAt?.slice(0, 10)))].sort().reverse();
  const today = new Date().toISOString().slice(0, 10);
  let streak = 0, longest = 0, tempStreak = 0;
  const sortedDates = [...dates].sort();
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) { tempStreak = 1; }
    else {
      const diff = (new Date(sortedDates[i]) - new Date(sortedDates[i-1])) / (1000 * 60 * 60 * 24);
      if (diff === 1) { tempStreak++; } else { tempStreak = 1; }
    }
    longest = Math.max(longest, tempStreak);
  }
  if (dates[0] === today || dates[0] === new Date(Date.now() - 86400000).toISOString().slice(0, 10)) {
    streak = 1;
    for (let i = 1; i < dates.length; i++) {
      const diff = (new Date(dates[i-1]) - new Date(dates[i])) / (1000 * 60 * 60 * 24);
      if (diff === 1) streak++; else break;
    }
  }
  
  res.json({
    streak,
    longest,
    totalMinutes,
    sessions: userRecords.length,
    history: byDate
  });
});

// 用户进度
app.get('/api/user/progress', (req, res) => {
  const user_id = req.query.user_id || getUserId(req);
  if (!user_id) { return res.status(400).json({ error: 'user_id required' }); }
  const progress = db.userProgress[user_id] || {};
  const completedScenarios = Object.keys(progress).filter(id => progress[id]);
  res.json({ completedScenarios, count: completedScenarios.length });
});

// 启动服务
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('Server running on port ' + PORT);
});

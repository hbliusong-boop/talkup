const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// Load enhanced scenarios
let SCENARIOS = [];
try {
  const enhancedData = require('/root/enhanced_scenarios.json');
  SCENARIOS = enhancedData;
  console.log('Loaded', SCENARIOS.length, 'enhanced scenarios');
} catch(e) {
  console.log('Using fallback scenarios:', e.message);
  // Fallback to minimal scenarios
  SCENARIOS = [
    { id: 1, cat: 'work', icon: 'person', t: '自我介绍', en: 'Self Introduction', desc: '学习如何用英语介绍自己。', level: 'A1', time: 10, lessons: 6, learners: '42.1k', featured: true, sortOrder: 1,
      dialogues: [{ sp: 'Agent', a: 'agent', en: 'Hello!', zh: '你好！', vocab: [] }] }
  ];
}

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = '/root/english_app.db';
function readDB() {
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
  catch(e) { return { scenarios: SCENARIOS, studyRecords: [], userProgress: {}, users: {} }; }
}
function writeDB(data) { fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)); }

// 初始化数据库
let db = readDB();
// 确保 enhanced scenarios 被加载
if (!db.scenarios || db.scenarios['1']?.goals) {
  // already enhanced
} else {
  db.scenarios = {};
  SCENARIOS.forEach(s => { db.scenarios[s.id] = s; });
  writeDB(db);
  console.log('Updated DB with enhanced scenarios');
}

function auth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const user = Object.values(db.users || {}).find(u => u.access_token === token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });
  req.user = user;
  next();
}

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const user = db.users ? Object.values(db.users).find(u => u.email === email) : null;
  if (!user || user.password !== password) return res.status(401).json({ error: 'Invalid credentials' });
  const access_token = uuidv4();
  const refresh_token = uuidv4();
  user.access_token = access_token;
  user.refresh_token = refresh_token;
  user.expires_in = Date.now() + 7*24*60*60*1000;
  db.users[email] = user;
  writeDB(db);
  res.json({ id: user.id, email: user.email, nickname: user.nickname, access_token, refresh_token, expires_in: 7*24*60*60 });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, nickname } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  if (db.users?.[email]) return res.status(409).json({ error: 'Email already exists' });
  const user = { id: uuidv4(), email, password, nickname: nickname || email.split('@')[0], createdAt: new Date().toISOString() };
  db.users = db.users || {};
  db.users[email] = user;
  const access_token = uuidv4();
  user.access_token = access_token;
  user.refresh_token = uuidv4();
  user.expires_in = Date.now() + 7*24*60*60*1000;
  writeDB(db);
  res.json({ id: user.id, email: user.email, nickname: user.nickname, access_token, refresh_token, expires_in: 7*24*60*60 });
});

app.get('/api/scenarios', (req, res) => {
  let scenarios = db.scenarios ? Object.values(db.scenarios) : SCENARIOS;
  // 不返回完整的 dialogues（太大），列表接口只返回基本信息
  const list = scenarios.map(({ dialogues, phrases, vocab, goals, ...rest }) => rest);
  res.json(list);
});

app.get('/api/scenarios/:id', (req, res) => {
  const scenario = (db.scenarios ? db.scenarios[req.params.id] : null) || SCENARIOS.find(s => s.id == req.params.id);
  if (!scenario) return res.status(404).json({ error: 'Not found' });
  res.json(scenario);
});

app.post('/api/study/record', (req, res) => {
  const { user_id, scenario_id, scenario_name, duration } = req.body;
  if (!user_id) return res.status(400).json({ error: 'user_id required' });
  const record = { id: uuidv4(), user_id, scenario_id, scenario_name, duration: duration || 0, createdAt: new Date().toISOString() };
  db.studyRecords = db.studyRecords || [];
  db.studyRecords.push(record);
  if (!db.userProgress) db.userProgress = {};
  if (!db.userProgress[user_id]) db.userProgress[user_id] = {};
  db.userProgress[user_id][scenario_id] = true;
  writeDB(db);
  res.json({ success: true, record });
});

app.get('/api/study/calendar', (req, res) => {
  const user_id = req.query.user_id;
  if (!user_id) return res.status(400).json({ error: 'user_id required' });
  const records = (db.studyRecords || []).filter(r => r.user_id == user_id);
  const history = {};
  records.forEach(r => {
    const date = r.createdAt?.slice(0,10);
    if (!history[date]) history[date] = { scenarios: [], totalMinutes: 0 };
    history[date].scenarios.push({ name: r.scenario_name || 'Unknown', minutes: r.duration || 0, createdAt: r.createdAt });
    history[date].totalMinutes += r.duration || 0;
  });
  const totalMinutes = records.reduce((sum, r) => sum + (r.duration || 0), 0);
  const dates = Object.keys(history).sort().reverse();
  const today = new Date().toISOString().slice(0,10);
  let streak = 0, longest = 0, tempStreak = 0;
  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const expectedStr = expected.toISOString().slice(0,10);
    if (dates.includes(expectedStr)) { tempStreak++; if (i === 0 || tempStreak > longest) longest = tempStreak; }
    else break;
  }
  streak = tempStreak;
  res.json({ streak, longest, totalMinutes, sessions: records.length, history });
});

app.get('/api/user/profile', auth, (req, res) => {
  const user = req.user;
  const completedScenarios = Object.keys(db.userProgress?.[user.id] || {}).length;
  res.json({ id: user.id, email: user.email, nickname: user.nickname, createdAt: user.createdAt, completedScenarios });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('TalkUp API running on port', PORT));
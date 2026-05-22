#!/usr/bin/env node
/**
 * TalkUp 场景内容生成工具
 * 
 * 使用方法:
 *   node gen_scene.js <场景参数 JSON>
 *   或交互式:
 *   node gen_scene.js --interactive
 * 
 * 示例:
 *   node gen_scene.js '{"cat":"work","t":"面试准备","en":"Interview Preparation","level":"B1","situation":"A manager interviews a candidate for a marketing position."}'
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════
// 1. SYSTEM PROMPT（固定不变）
// ═══════════════════════════════════════════════════════════
const SYSTEM_PROMPT = `You are a professional English learning content creator for TalkUp, a Chinese adult English learning app. Your task is to generate realistic, natural, pedagogically sound dialogue scenes.

# OUTPUT REQUIREMENTS
- Respond ONLY with valid JSON, no preamble, no markdown fences.
- Follow the exact schema provided in each request.
- All Chinese translations must be natural, not word-for-word.
- All English must sound native and natural for the stated CEFR level.

# QUALITY STANDARDS
- Dialogue must feel like real life, not a textbook.
- Every turn must serve a communicative purpose.
- Vocabulary and grammar must strictly match the CEFR level.
- Phrases should be reusable templates, not one-off sentences.
- Vocabulary words should be ones a learner genuinely needs.

# CEFR COMPLIANCE
- A1: Only GSL top 500 words. Simple present/past. 5-7 word sentences max.
- A2: GSL top 1000. Present perfect introduced. 8-10 words max per clause.
- B1: GSL top 2500 + topic vocab. Subordinate clauses ok. Natural length.
- B2: GSL top 4000 + idiomatic. Complex sentences ok. More nuanced functions.
- C1: Near-native. Idioms, implicit meaning, professional register.
- C2: Native-level. Subtle, nuanced, culturally aware.

# CHINESE USER CONTEXT
- Users are Chinese adults with some prior English exposure.
- Focus: everyday life and professional communication.
- Avoid: academic English, slang that wouldn't be used in professional contexts.
- Include: useful fixed expressions that transfer to real situations.`;

// ═══════════════════════════════════════════════════════════
// 2. USER PROMPT 模板
// ═══════════════════════════════════════════════════════════
function buildUserPrompt(params) {
  const {
    cat = "work",
    t,           // 场景中文名（必填）
    en,          // 场景英文名（必填）
    level = "A1",
    situation = "", // 情境描述
    role_a = "",    // 角色A描述
    role_b = "",    // 角色B描述
    turn_count = null,
    key_functions = "",
    must_include_vocab = ""
  } = params;

  // 根据等级自动设置轮次
  const autoTurnCount = turn_count || {
    A1: 6, A2: 7, B1: 9, B2: 11, C1: 12, C2: 14
  }[level] || 8;

  return `Generate a TalkUp dialogue scene with the following parameters:

## SCENE PARAMETERS
SCENE_TITLE_EN: ${en}
SCENE_TITLE_ZH: ${t}
CATEGORY: ${cat}  // work|travel|life|hotel|shop
CEFR_LEVEL: ${level}  // A1|A2|B1|B2|C1|C2
SITUATION: ${situation}
ROLE_A: ${role_a || `${en} agent`}
ROLE_B: ${role_b || `business traveler / user`}
TURN_COUNT: ${autoTurnCount}
KEY_FUNCTIONS: ${key_functions || "requesting information, expressing preference, confirming details"}
MUST_INCLUDE_VOCAB: ${must_include_vocab || ""}

## OUTPUT SCHEMA
Return a JSON object with this exact structure (no markdown fences):

{
  "scene": {
    "cat": "${cat}",
    "icon": "${params.icon || 'briefcase'}",
    "t": "${t}",
    "en": "${en}",
    "desc": "${params.desc || ''}",
    "description_en": "",
    "level": "${level}",
    "difficulty_score": ${params.difficulty_score || 1},
    "time": ${params.time || 10},
    "lessons": ${params.lessons || 6},
    "featured": ${params.featured || false},
    "cover_emoji": "${params.cover_emoji || '💼'}",
    "topic_tags": [${params.topic_tags ? `"${params.topic_tags.join('","')}"` : `"${cat}"`}],
    "function_tags": [${params.function_tags ? `"${params.function_tags.join('","')}"` : `"conversational"`}]
  },
  "goals": [
    "理解本场景的核心词汇和常用表达",
    "能够用目标语言进行基础回应",
    "掌握 N 个本场景核心词汇",
    "能够进行简单的角色扮演对话"
  ],
  "phrases": [
    {
      "tpl": ["phrase template with [slot] placeholders", "alternative template"],
      "blank": "中文填空模板，展示核心句型",
      "function_zh": "功能标签（2-4字）",
      "example_en": "英文例句",
      "example_zh": "中文翻译"
    }
  ],
  "vocab": [
    {
      "word": "单词或短语",
      "zh": "中文释义（准确、地道）",
      "ipa": "/国际音标/",
      "pos": "n.|v.|adj.|adv.|prep.|conj.|phr.",
      "cefr": "${level}",
      "example": "单词在场景中的典型例句"
    }
  ],
  "dialogues": [
    {
      "sp": "Agent",  // 显示名
      "a": "agent",   // 值：agent | user
      "en": "英文对话内容",
      "zh": "中文翻译（自然流畅）",
      "vocab": ["本句涉及的词汇列表（从vocab中选）"],
      "highlight_words": ["需要高亮的关键词（2-4个）"],
      "is_user_turn": false  // true=用户说，false=AI/对方说
    }
  ]
}

## REQUIREMENTS
1. goals: 4项中文目标，action-oriented，60字内
2. phrases: 4个模板句式，含槽位替换说明
3. vocab: 6-10个词汇，含准确中文释义（不是"释义待定"）
4. dialogues: 按TURN_COUNT生成，注意 is_user_turn 在 A speaker 为 false，B speaker 为 true
5. dialogues[0] 建议是 Agent 的开场白
6. 所有 zh 必须是自然中文，不逐字翻译`;
}

// ═══════════════════════════════════════════════════════════
// 3. AI 调用函数（支持 MiniMax / OpenAI 格式）
// ═══════════════════════════════════════════════════════════
async function callAI(userPrompt, systemPrompt = SYSTEM_PROMPT) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.MINIMAX_API_KEY;
  const model = process.env.AI_MODEL || 'gpt-4o';
  const baseURL = process.env.AI_BASE_URL || 'https://api.openai.com/v1';

  if (!apiKey) {
    throw new Error('请设置环境变量 OPENAI_API_KEY 或 MINIMAX_API_KEY');
  }

  const body = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 4000
  };

  return new Promise((resolve, reject) => {
    const url = new URL(`${baseURL}/chat/completions`);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) reject(new Error(json.error.message));
          else resolve(json.choices[0].message.content);
        } catch (e) {
          reject(new Error(`解析响应失败: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

// ═══════════════════════════════════════════════════════════
// 4. JSON 验证与清理
// ═══════════════════════════════════════════════════════════
function parseAndCleanJSON(raw) {
  // 移除可能的 markdown fences
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '');
  cleaned = cleaned.replace(/```$/, '');

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // 尝试提取 JSON block
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e2) {
        throw new Error(`JSON解析失败: ${e.message}\n原始内容:\n${cleaned.slice(0, 500)}`);
      }
    }
    throw new Error(`无法解析JSON: ${e.message}`);
  }
}

// ═══════════════════════════════════════════════════════════
// 5. 数据库导入格式转换
// ═══════════════════════════════════════════════════════════
function toDbFormat(generated) {
  const { scene, goals, phrases, vocab, dialogues } = generated;

  return {
    // scene 表字段
    id: scene.id || null,
    slug: "",
    cat: scene.cat || "work",
    icon: scene.icon || "briefcase",
    t: scene.t,
    en: scene.en,
    desc: scene.desc || "",
    description_en: scene.description_en || "",
    level: scene.level || "A1",
    difficulty_score: scene.difficulty_score || 1,
    time: scene.time || 10,
    lessons: scene.lessons || 6,
    learners: scene.learners || "0",
    featured: scene.featured || false,
    is_published: true,
    sort_order: scene.sort_order || 0,
    topic_tags: scene.topic_tags || [],
    function_tags: scene.function_tags || [],
    cover_emoji: scene.cover_emoji || "📚",

    // 扩展字段（存在 scene 表的 JSON 列中）
    goals: goals || [],
    phrases: phrases || [],
    vocab: (vocab || []).map(v => ({
      word: v.word,
      zh: v.zh,
      ipa: v.ipa || "",
      pos: v.pos || "",
      cefr: v.cefr || scene.level || "A1",
      example: v.example || ""
    })),
    dialogues: (dialogues || []).map((d, i) => ({
      sp: d.sp || (d.is_user_turn ? "You" : "Agent"),
      a: d.a || (d.is_user_turn ? "user" : "agent"),
      en: d.en,
      zh: d.zh,
      vocab: d.vocab || [],
      highlight_words: d.highlight_words || [],
      is_user_turn: !!d.is_user_turn
    }))
  };
}

// ═══════════════════════════════════════════════════════════
// 6. 主函数
// ═══════════════════════════════════════════════════════════
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║           TalkUp 场景内容生成工具 v1.0                      ║
╚══════════════════════════════════════════════════════════════╝

用法:
  node gen_scene.js <参数JSON>
  node gen_scene.js --interactive
  node gen_scene.js --validate <JSON文件>
  node gen_scene.js --example

环境变量:
  OPENAI_API_KEY    OpenAI API Key（必需）
  AI_MODEL           模型名称（默认: gpt-4o）
  AI_BASE_URL        API 基础URL（默认: https://api.openai.com/v1）

示例:
  node gen_scene.js '{"cat":"work","t":"面试准备","en":"Interview Preparation","level":"B1"}'

输出:
  - 生成结果保存到 output/{场景名}_{时间戳}.json
  - 屏幕打印完整 JSON
`);
    process.exit(0);
  }

  if (args.includes('--example')) {
    const example = {
      cat: "work",
      t: "面试准备",
      en: "Interview Preparation",
      level: "B1",
      situation: "A HR manager interviews a candidate for a marketing specialist position.",
      role_a: "HR manager, female, professional",
      role_b: "job candidate",
      key_functions: "self-introduction, describing experience, salary discussion",
      must_include_vocab: "skills, experience, salary, benefits",
      cover_emoji: "💼",
      featured: false,
      time: 20,
      lessons: 8
    };
    console.log('\n📋 示例参数:\n');
    console.log(JSON.stringify(example, null, 2));
    console.log('\n\n✅ 用以下命令生成:\n');
    console.log(`node gen_scene.js '${JSON.stringify(example)}'\n`);
    process.exit(0);
  }

  if (args.includes('--interactive')) {
    console.log('\n🎯 交互式生成（按 Ctrl+C 退出）\n');
    const rl = require('readline').createInterface({ input: process.stdin, output: process.stdout });

    const ask = (q) => new Promise(r => rl.question(q, r));
    const params = {};

    params.cat = await ask('分类 (work|travel|life|hotel|shop) [work]: ') || 'work';
    params.t = await ask('场景中文名: ');
    params.en = await ask('场景英文名: ');
    params.level = await ask('等级 (A1|A2|B1|B2|C1|C2) [A1]: ') || 'A1';
    params.situation = await ask('情境描述: ');
    params.cover_emoji = await ask('emoji图标 [💼]: ') || '💼';
    params.featured = (await ask('精选场景? (y/n) [n]: ')).toLowerCase() === 'y';
    params.time = parseInt(await ask('预计时长(分钟) [10]: ') || '10');
    params.lessons = parseInt(await ask('课程节数 [6]: ') || '6');

    rl.close();

    if (!params.t || !params.en) {
      console.error('❌ 错误: 场景中文名和英文名不能为空');
      process.exit(1);
    }

    return runGeneration(params);
  }

  // validate mode
  if (args.includes('--validate')) {
    const file = args[args.indexOf('--validate') + 1];
    if (!file) { console.error('❌ 请指定要验证的JSON文件'); process.exit(1); }
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      const db = toDbFormat(data);
      console.log('✅ JSON 结构验证通过');
      console.log('\n📦 数据库格式预览:');
      console.log(`  场景: ${db.t} (${db.level})`);
      console.log(`  goals: ${db.goals.length}项`);
      console.log(`  phrases: ${db.phrases.length}项`);
      console.log(`  vocab: ${db.vocab.length}项`);
      console.log(`  dialogues: ${db.dialogues.length}轮`);
      process.exit(0);
    } catch (e) {
      console.error('❌ 验证失败:', e.message);
      process.exit(1);
    }
  }

  // normal mode: parse JSON arg
  let params;
  if (args.length > 0) {
    try {
      params = JSON.parse(args.join(' '));
    } catch (e) {
      console.error('❌ 参数解析失败:', e.message);
      process.exit(1);
    }
  } else {
    console.error('❌ 请提供参数或使用 --interactive');
    console.error('   node gen_scene.js --help 查看帮助');
    process.exit(1);
  }

  await runGeneration(params);
}

async function runGeneration(params) {
  console.log('\n🎬 开始生成场景内容...\n');
  console.log('参数:', JSON.stringify(params, null, 2));

  try {
    // 1. 构建 prompt
    const userPrompt = buildUserPrompt(params);
    console.log('\n📡 调用 AI...\n');

    // 2. 调用 AI
    const raw = await callAI(userPrompt);
    console.log('📥 AI 响应已接收\n');

    // 3. 解析 JSON
    const generated = parseAndCleanJSON(raw);

    // 4. 转换为数据库格式
    const dbRecord = toDbFormat(generated);

    // 5. 保存结果
    const timestamp = Date.now();
    const safeName = dbRecord.t.replace(/\s+/g, '_');
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const outputFile = path.join(outputDir, `${safeName}_${timestamp}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(dbRecord, null, 2, 'utf8'));

    // 6. 输出到屏幕
    console.log('═'.repeat(60));
    console.log('✅ 生成完成!\n');
    console.log('📦 数据库记录预览:');
    console.log(`  场景: ${dbRecord.t} / ${dbRecord.en}`);
    console.log(`  分类: ${dbRecord.cat} | 等级: ${dbRecord.level}`);
    console.log(`  goals: ${dbRecord.goals.length}项`);
    dbRecord.goals.forEach((g, i) => console.log(`    ${i+1}. ${g}`));
    console.log(`  phrases: ${dbRecord.phrases.length}项`);
    dbRecord.phrases.forEach((p, i) => console.log(`    ${i+1}. ${p.function_zh}: ${p.blank}`));
    console.log(`  vocab: ${dbRecord.vocab.length}项`);
    dbRecord.vocab.slice(0, 3).forEach(v => console.log(`    • ${v.word}: ${v.zh}`));
    if (dbRecord.vocab.length > 3) console.log(`    ... 还有 ${dbRecord.vocab.length - 3} 项`);
    console.log(`  dialogues: ${dbRecord.dialogues.length}轮`);
    dbRecord.dialogues.slice(0, 2).forEach(d => console.log(`    [${d.sp}] ${d.en}`));
    if (dbRecord.dialogues.length > 2) console.log(`    ... 还有 ${dbRecord.dialogues.length - 2} 轮`);

    console.log(`\n💾 已保存到: ${outputFile}`);
    console.log('═'.repeat(60));

  } catch (e) {
    console.error('\n❌ 生成失败:', e.message);
    process.exit(1);
  }
}

main();

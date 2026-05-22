# TalkUp 代码管理规范 v1.0

> 所有代码改动必须遵循此规范，确保可追溯、可回滚。

---

## 目录
1. [仓库地址](#1-仓库地址)
2. [分支策略](#2-分支策略)
3. [开发流程](#3-开发流程)
4. [代码修改规范](#4-代码修改规范)
5. [提交规范](#5-提交规范)
6. [标签（Tag）管理](#6-标签tag管理)
7. [回滚操作](#7-回滚操作)
8. [服务器部署](#8-服务器部署)
9. [紧急情况处理](#9-紧急情况处理)

---

## 1. 仓库地址

```
GitHub: https://github.com/hbliusong-boop/talkup
```

**目录结构：**
```
talkup/
├── web/           # 前端网页（React/Babel 单文件）
├── server/        # 后端 Node.js
├── app/          # Flutter 移动端（待开发）
└── docs/         # 项目文档
```

---

## 2. 分支策略

**永远不在 `main` 分支直接开发。**

```
main        → 生产环境代码（稳定）
├── dev     → 开发主分支（所有功能合并到这里）
├── fix/xxx → 修复分支
└── feat/xxx → 功能分支
```

**常用操作：**

```bash
# 查看所有分支
git branch -a

# 创建开发分支（首次）
git checkout -b dev

# 切换到开发分支
git checkout dev

# 创建修复分支
git checkout -b fix/login-bug

# 创建功能分支
git checkout -b feat/calendar-api
```

---

## 3. 开发流程

### 标准流程：Feature Branch → Dev → Main

```
1. 从 dev 新建分支
2. 开发 + 测试
3. 提交到自己的分支
4. 合并到 dev
5. 测试通过后，打 tag 发布
```

### 具体命令：

```bash
# === 每次开始开发前 ===
git checkout dev          # 切换到开发分支
git pull origin dev      # 拉取最新代码
git checkout -b feat/xxx # 从 dev 新建功能分支

# === 开发中频繁做 ===
git add .
git commit -m "feat: 添加xxx功能"

# === 完成开发后 ===
git push origin feat/xxx     # 推送到远程
# → 在 GitHub 上创建 Pull Request → 合并到 dev

# === dev 分支测试通过后 ===
git checkout dev
git pull origin dev
git tag -a v1.0.1 -m "fix: 修复登录问题"  # 打标签
git push origin v1.0.1                          # 推送标签
git push origin dev                              # 推送 dev
```

---

## 4. 代码修改规范

### 4.1 修改前必读

**修改任何文件前，先问自己：**
1. 这个文件在哪个环境跑？（本地/服务器）
2. 改坏了怎么回滚？
3. 会不会影响其他功能？

### 4.2 修改流程

**方式 A：通过 Git 修改（推荐）**

```bash
# 1. 确认当前在正确的分支
git branch

# 2. 如果还没建分支，从 dev 新建
git checkout -b fix/detail-page-style

# 3. 用任意编辑器修改文件
# 例如：vim /var/www/talkup/detail.jsx

# 4. 提交
git add .
git commit -m "fix: 恢复详情页原始样式"

# 5. 推送到远程
git push origin fix/detail-page-style
```

**方式 B：直接在服务器修改（仅紧急修复）**

```bash
# 1. 先备份当前版本
cp /var/www/talkup/detail.jsx /var/www/talkup/detail.jsx.bak.$(date +%Y%m%d%H%M%S)

# 2. 修改文件
vim /var/www/talkup/detail.jsx

# 3. 测试确认 OK 后，必须 commit
git add .
git commit -m "emergency fix: 修复详情页崩溃"

# 4. 立即 push（不要让服务器和仓库不同步）
```

### 4.3 禁止操作

```
❌ 绝对禁止：git reset --hard（会丢失未提交的改动）
❌ 绝对禁止：git clean -fd（会删除未跟踪文件，包括源码）
❌ 绝对禁止：在 main 分支直接开发
❌ 绝对禁止：修改服务器文件后不 commit
```

---

## 5. 提交规范

### 5.1 提交信息格式

```
<类型>: <简短描述>

[可选：详细说明]
```

### 5.2 类型说明

| 类型 | 用途 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat: 添加学习日历页面` |
| `fix` | 修复 bug | `fix: 修复登录401错误` |
| `style` | 样式调整 | `style: 优化场景卡片布局` |
| `refactor` | 重构代码 | `refactor: 重构API调用` |
| `perf` | 性能优化 | `perf: 加速页面加载` |
| `docs` | 文档更新 | `docs: 更新部署文档` |
| `chore` | 杂项 | `chore: 添加.gitignore` |

### 5.3 示例

```bash
# 好提交
git commit -m "fix: 修复场景详情页硬编码问题"

git commit -m "feat: 添加学习记录API

- 新增 /api/study/record 端点
- 前端完成学习后调用记录
- 日历页面展示真实数据"

# 坏提交（禁止）
git commit -m "update"          # 太模糊
git commit -m "xxx"             # 完全没意义
git commit -m "asdfgh"          # 乱打
```

### 5.4 提交频率

```
✅ 好的习惯：
- 每完成一个小功能就 commit
- 每个 bug 修复就 commit
- 样式调整单独 commit

❌ 不好的习惯：
- 开发了一整天，最后一次性 commit
- 多个不相关改动放在一个 commit 里
```

---

## 6. 标签（Tag）管理

### 6.1 什么时候打 Tag？

```
每正式发布一个版本就打一个 tag
```

### 6.2 版本号规则

```
v<主版本>.<次版本>.<修订号>

v1.0.0  → 第一个正式发布
v1.0.1  → 小修复
v1.1.0  → 新增功能（向下兼容）
v2.0.0  → 重大更新（可能不兼容）
```

### 6.3 Tag 操作

```bash
# 打标签
git tag -a v1.0.0 -m "feat: 正式上线版本，包含登录、场景库、学习日历"

# 推送标签到远程（重要！单独 push）
git push origin v1.0.0

# 查看所有标签
git tag -l

# 查看某个标签的详情
git show v1.0.0

# 删除本地标签
git tag -d v1.0.0

# 删除远程标签
git push origin --delete v1.0.0
```

### 6.4 Tag 与部署对应关系

| Tag | 日期 | 说明 |
|-----|------|------|
| v1.0.0 | 2026-05-22 | Web 前端上线（登录、场景库、日历） |

---

## 7. 回滚操作

### 7.1 回滚单个文件

```bash
# 查看文件历史
git log --oneline detail.jsx

# 回滚到某个版本
git checkout abc1234 -- detail.jsx

# 提交回滚
git add .
git commit -m "revert: 回滚 detail.jsx 到 v1.0.0 版本"
```

### 7.2 回滚整个分支到某个版本

```bash
# 查看最近 10 个 commit
git log --oneline -10

# 回滚到指定 commit（会保留改动在工作区）
git reset --soft abc1234

# 或者完全回滚（会删除之后的所有改动，谨慎使用！）
git reset --hard abc1234
```

### 7.3 回滚到上一个 Tag

```bash
# 查看当前版本相对于 tag 的改动
git log v1.0.0..HEAD --oneline

# 强制回滚到 tag
git reset --hard v1.0.0

# 强制推送到远程（危险！需要 -f）
git push origin main -f
```

### 7.4 回滚注意事项

```
⚠️ 回滚前必读：
1. 回滚会丢失这个版本之后的所有改动
2. 如果改动很重要，先创建备份分支
3. 生产环境回滚前，确认无误

正确流程：
1. git checkout -b backup-$(date +%Y%m%d)   # 创建备份分支
2. git reset --hard v1.0.0                  # 回滚
3. 测试确认 OK
4. git push origin main -f                  # 强制推送
```

### 7.5 紧急回滚（服务器文件被改坏了）

```bash
# 查看服务器上文件的所有版本
git log --all --full-history -- /var/www/talkup/detail.jsx

# 从某个 tag 恢复
git checkout v1.0.0 -- /var/www/talkup/detail.jsx

# 或者从 main 分支恢复
git checkout origin/main -- /var/www/talkup/detail.jsx
```

---

## 8. 服务器部署

### 8.1 当前服务器信息

```
服务器 IP: 182.92.160.241
SSH 用户: root
密码: Ls_307330

Web 目录: /var/www/talkup/
后端目录: /root/
后端端口: 3000
```

### 8.2 部署流程

```bash
# === 在服务器上操作 ===

# 1. 备份当前版本
cp -r /var/www/talkup /var/www/talkup.bak.$(date +%Y%m%d)

# 2. 拉取最新代码
cd /var/www/talkup
git pull origin main

# 3. 重启后端
pkill -f 'node index'
cd /root && node index.js > server.log 2>&1 &

# 4. 验证
curl http://localhost:3000/api/scenarios | head -20
```

### 8.3 部署脚本（deploy.sh）

```bash
#!/bin/bash
# 部署脚本 - 放在 /root/deploy.sh

set -e

BACKUP_DIR="/var/www/talkup.bak.$(date +%Y%m%d%H%M%S)"
WEB_DIR="/var/www/talkup"

echo "=== TalkUp 部署开始 ==="
echo "时间: $(date)"
echo "备份目录: $BACKUP_DIR"

# 1. 备份
cp -r $WEB_DIR $BACKUP_DIR
echo "✅ 备份完成"

# 2. 拉取代码
cd $WEB_DIR
git pull origin main
echo "✅ 代码更新完成"

# 3. 重启后端
pkill -f 'node index' || true
sleep 1
cd /root && node index.js > /root/server.log 2>&1 &
echo "✅ 后端重启完成"

# 4. 验证
sleep 2
if curl -s http://localhost:3000/api/scenarios | grep -q "id"; then
    echo "✅ 验证通过"
else
    echo "❌ 验证失败，请检查！"
    exit 1
fi

echo "=== 部署完成 ==="
```

**使用方法：**
```bash
chmod +x /root/deploy.sh
/root/deploy.sh
```

---

## 9. 紧急情况处理

### 9.1 服务器文件损坏，但还没 push

```bash
# 查看最近一次正常 commit
git log --oneline -5

# 恢复单个文件
git checkout abc1234 -- /var/www/talkup/detail.jsx

# 恢复整个目录
git checkout abc1234 -- /var/www/talkup/
```

### 9.2 push 到远程后发现问题

```bash
# 立即撤销 push
git push -f origin v1.0.0~1  # 回滚本地
git push -f origin main         # 强制推送到远程（危险！）

# 更好的方式：新建 revert commit
git revert HEAD
git push origin main
```

### 9.3 生产环境故障应急

```
第一步：立即回滚到上一个稳定版本
第二步：排查问题
第三步：在 dev 分支修复
第四步：测试通过后重新发布
```

```bash
# 紧急回滚到 tag
cd /var/www/talkup
git checkout v1.0.0 -- .
git commit -m "emergency revert to v1.0.0"

# 重启服务
pkill -f 'node index'
cd /root && node index.js > /root/server.log 2>&1 &
```

---

## 快速参考卡

```bash
# === 日常开发 ===
git checkout dev && git pull                    # 开始前
git checkout -b feat/xxx                      # 新功能
git add . && git commit -m "xxx"               # 提交
git push origin feat/xxx                       # 推送

# === 发布 ===
git checkout dev && git pull
git tag -a v1.x.x -m "xxx"
git push origin v1.x.x
git push origin dev

# === 回滚 ===
git checkout -b emergency-backup               # 创建备份
git reset --hard v1.x.x                       # 回滚
git push -f origin main                        # 强制推送

# === 服务器部署 ===
/root/deploy.sh
```

---

## 记录

| 日期 | 版本 | 说明 |
|------|------|------|
| 2026-05-22 | v1.0 | 初始规范建立 |

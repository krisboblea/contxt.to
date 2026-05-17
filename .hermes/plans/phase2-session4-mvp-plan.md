# Phase 2 Session 4 — Dashboard MVP Plan

## 当前状态

| 功能 | 状态 | 备注 |
|------|------|------|
| Email magic link 登录 | ✅ | preview 测通，production 部署后生效 |
| Google OAuth | ✅ 代码就绪 | production 域名自动生效 |
| Dashboard 布局 (sidebar + header) | ✅ | Contexts, Collections(disabled), Analytics(disabled) |
| Context 列表 + 搜索 | ✅ | 搜索筛选正常 |
| Context 详情 (markdown 展示) | ✅ | Edit/Delete/Copy Link 都有 |
| New Context (AI 生成 title) | ✅ | 从 dashboard 创建 |
| Edit Context | ✅ | |
| Delete Context | ✅ | 确认弹窗 |
| Dashboard auth guard | ✅ | 未登录重定向 |

## 差距分析

### 问题 1：登录后的导航断裂

User 登录后，没有入口回到 Dashboard。Landing page 的 header 文件缺失（已删除），结果：

- Landing page → 没有 "Sign In" / "Dashboard" 按钮
- 用户登录后无法回到 Dashboard
- Dashboard 里没有回 Landing page 的链接

### 问题 2：Guest 创建的 Context 不可见

- Landing page Create Flow 创建的是 guest context（`userId: null`, `claimToken` 存在）
- Dashboard 过滤 `userId = session.user.id`
- **新用户 Dashboard 是空白的**，之前创建的内容全看不见
- Claim API 已存在，但没有 UI 触发

### 问题 3：缺少 "Create" 快捷入口

- Sidebar 里只有导航（Contexts/Collections/Analytics），没有 "+ New" 按钮
- 创建需手动去 `/dashboard/contexts/new`，不直观

### 问题 4：没有 User Menu

- Header 显示 avatar，但点了没反应
- 没有 Sign Out（除非删 cookie）

### 问题 5：统计信息为硬编码 0

- Views → 0（实际没追踪）
- AI Continuations → 0

---

## 实施计划

### Step 1：Landing Page 导航修复（~20min）

**目标：** 登录前后导航正常工作

- 恢复 header，条件渲染：
  - 未登录：显示 "Sign in" 按钮
  - 已登录：显示 "Dashboard" 链接 + "Sign out"
- 登录后 Landing page 的 Create 直接关联 userId（不走 claimToken）

**文件：**
- `src/components/landing/header.tsx` — 重写
- `src/app/(marketing)/layout.tsx` 或 `src/app/page.tsx` — 集成 header

### Step 2：Guest Context 自动接管（~30min）

**目标：** 用户登录后，之前用同一邮箱创建的 Context 自动归入账号

- 登录成功时（callbacks 里），查询 `Context where userId=null AND email=...`
- 批量更新这些 Context 的 `userId = session.user.id`
  - 注意：当前 Context 表没有 `email` 字段，guest context 通过 claimToken 记录
  - 方法 A：在 signIn callback 里匹配 claim 流程中已保存的 email
  - 方法 B：在 Context 表中加 email 字段记录 guest creator email
  - 方法 C：在 Dashboard 加 "Claim your contexts" UI，让用户输入 claimToken
- **推荐方案：** 简化做法 — Context 表加 `creatorEmail` 字段，signIn 时自动匹配

**文件：**
- `prisma/schema.prisma` — Context 加 `creatorEmail` 字段
- `src/auth.ts` — signIn callback 自动接管
- `src/app/api/claim/route.ts` — 顺便关联已登录用户

### Step 3：Dashboard Create 快捷入口（~15min）

**目标：** 用户能在 Dashboard 一目了然地创建新 Context

- Sidebar 底部加 "+ New Context" 按钮
- Context list 顶部加 "New Context" 卡片/按钮（empty state 时更明显）

**文件：**
- `src/components/dashboard/sidebar.tsx` — 加按钮
- `src/components/dashboard/context-list.tsx` — empty state 加创建引导

### Step 4：User Menu（~15min）

**目标：** 用户能退出登录

- Header 头像点击弹出 dropdown：Dashboard / Settings (stub) / Sign Out

**文件：**
- `src/components/dashboard/header.tsx` — 加 dropdown menu

### Step 5：Production 部署（~5min）

- Merge to main
- Deploy production
- 验证完整流程

### Step 6：Views 追踪（后续迭代）

- Context 表加 `viewCount` 字段（或独立 events 表）
- `s/[slug]` 访问时 +1
- Dashboard 展示真实数据

---

## 预计总工时

| Step | 时间 | 依赖 |
|------|------|------|
| 1. Landing nav | ~20min | 无 |
| 2. Guest context claim | ~30min | Step 1 |
| 3. Create shortcut | ~15min | 无 |
| 4. User menu | ~15min | 无 |
| 5. Production deploy | ~5min | Step 1-4 |
| **总计** | **~85min** | |

## 优先级建议

- **P0（必须做）**：Step 1 + Step 4 — 没有导航和退出，用户无法使用
- **P1（重要）**：Step 2 + Step 3 — 已有内容不可见，产品无法用
- **P2（部署）**：Step 5 — 上线验证
- **P3（后续）**：Step 6 — 数据增强

---
name: youmin-dev-guide
description: 企业官网全栈开发经验包 — React + Vite + Express + PostgreSQL + Vercel 部署。覆盖 CMS 内容管理、Admin 后台、SSG 静态生成、Serverless 数据库连接等模式。
---

# 企业官网全栈开发经验包

## 适用场景

- 企业官网（多页面、中文内容、CMS 后台管理）
- React + Vite 前端 + Express 后端 + PostgreSQL 数据库
- Vercel 部署（Serverless Functions + 静态资源）

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React 18, Vite 5, Tailwind CSS 3, react-router-dom 6, lucide-react |
| 后端 | Express 4 (Vercel Serverless), pg (node-postgres) |
| 数据库 | PostgreSQL (Supabase 托管, PGBouncer 连接池) |
| 认证 | JWT + bcryptjs |
| 邮件 | nodemailer + SMTP |
| 部署 | Vercel (静态 + Serverless Functions) |

---

## 架构模式

### 1. 内容管理 (CMS Pattern)

所有网站内容存储在 PostgreSQL 的 `content` 表中，使用 JSONB 字段（一个 key 对应一页的完整 JSON 对象）。

**为什么用 JSONB 而不是 35+ 张关系表？**
- 后台管理总是整体读写（不是字段级 patch）
- 只有一位管理员，无并发冲突
- 前端直接消费嵌套 JSON，无需组装
- 10 行数据 vs 35+ 张表的维护成本

```sql
CREATE TABLE content (
  key  TEXT PRIMARY KEY,      -- 'home', 'about', 'site', etc.
  data JSONB NOT NULL,        -- 完整嵌套内容对象
  updated_at TIMESTAMPTZ
);
```

**前端 ContentContext**：统一的内容读写层
```jsx
// 公开页面：读静态 content.json（秒开）
// 后台管理：读 API（实时编辑）
// 回退策略：API 不可用时用硬编码默认值

const { getContent, updateContent } = useContent()
const home = getContent('home')   // 获取首页内容
updateContent('home', newData)    // 保存修改
```

### 2. 双重路由 (Public / Admin Split)

```jsx
// App.jsx — 根据路径前缀切换两套路由树
const isAdmin = location.pathname.startsWith('/admin')

if (isAdmin) {
  return <AdminRoutes />   // AdminLayout + RequireAuth
}
return <PublicRoutes />    // Layout (Navbar + Footer)
```

**关键点**：
- 公开和后台完全独立的 Layout（不同导航、不同样式）
- 后台路由除 `/admin/login` 外全部需要认证
- ContentContext 在两者之上共享（Provider 包裹整个 App）

### 3. 后台编辑器模式 (EditorShell Pattern)

每个后台页面共享同一个编辑外壳：

```jsx
<EditorShell
  contentKey="home"           // 对应 content 表的 key
  title="首页内容"
  renderForm={(props) => <HomeForm {...props} />}
  onDataExtract={(data) => data}
/>
```

**EditorShell 负责**：加载数据、保存、重置、Toast 通知
**各页面 Form 负责**：渲染表单、本地状态管理、提交回调

---

## 关键踩坑

### 坑 1: Async 函数必须 await — 否则"成功"是假的

```jsx
// ❌ 错误：updateContent 是 async，但没有 await
const handleSave = (data) => {
  try {
    updateContent(key, data)        // Promise 被丢弃
    setToast('保存成功')             // 不管 API 是否成功都显示
  } catch { /* 永远抓不到异步错误 */ }
}

// ✅ 正确
const handleSave = async (data) => {
  try {
    await updateContent(key, data)  // 等待 API 完成
    setToast('保存成功')             // 真的成功了
  } catch (err) {
    setToast(err.message)           // 能抓到错误
  }
}
```

### 坑 2: Serverless 连接池 — max 必须为 1

```js
// ❌ 默认 pool 会创建 10 个连接，多个函数并发时打满 Supabase 限制(15)
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// ✅ Serverless 每个实例只需 1 个连接
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,                              // 关键
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
})
```

**Supabase 连接字符串**：必须用 Transaction Pooler（端口 6543）
```
DATABASE_URL=postgresql://...@aws-0-xxx.pooler.supabase.co:6543/postgres?pgbouncer=true
```

### 坑 3: Vercel Rewrite 会截断 URL 路径

```json
// vercel.json — /api/(.*) → /api 可能让 Express 看到错误的 URL
{ "source": "/api/(.*)", "destination": "/api" }
```

**应对**：
- Express 路由同时挂在 `/api/*` 和 `/*` 两个前缀下
- 添加中间件从 Vercel header 恢复原始路径
- 不使用并行请求（避免打满 pool）

### 坑 4: SSG + CDN 缓存 — 内容更新后页面不变

```
管理员保存 → DB 更新 → Deploy Hook → Vercel 重建 → 新 content.json
→ 但 CDN/浏览器可能缓存旧文件 → 用户看到旧内容
```

**应对**：
```json
// vercel.json — 对 content.json 禁用缓存
{ "source": "/content.json", "headers": [
  { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }
]}
```
```js
// 前端 — 加时间戳参数绕过浏览器缓存
fetch(`/content.json?t=${Date.now()}`)
```

### 坑 5: 模块级变量在 Serverless 中共享

```js
// ❌ pool 在模块顶层创建，warm start 时复用可能导致连接泄漏
const pool = new Pool(...)

// ✅ 用 max: 1 + 短超时 + 错误处理
pool.on('error', (err) => console.error('Pool error:', err))
```

### 坑 6: EditorShell 重渲染导致表单数据丢失

```jsx
// EditorShell 用 resetKey 计数器来触发表单重置
const [resetKey, setResetKey] = useState(0)
const handleReset = async () => {
  await resetContent(contentKey)
  setResetKey(k => k + 1)  // 改变 key 让 Form 的 useEffect 重新初始化
}

// Form 中监听 resetKey 变化
useEffect(() => {
  setForm(deepClone(data))
}, [data, resetKey])
```

---

## 纯静态生成 (SSG) 流程

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ scripts/     │     │  public/     │     │   dist/     │
│ fetch-       │──→  │  content.json│──→  │ content.json│
│ content.js   │     │  (构建产物)   │     │  (部署文件)  │
└─────────────┘     └──────────────┘     └─────────────┘
       │
       │ 读取 PostgreSQL
       ▼
  ┌──────────┐     管理员保存
  │ content  │ ←────────────── PUT /api/content/:key
  │  table   │
  └──────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ Vercel Deploy│  触发重新构建
                  │ Hook         │  约 1 分钟后新内容上线
                  └──────────────┘
```

---

## 项目结构规范

```
project/
  src/
    context/
      ContentContext.jsx    # 内容管理核心
      AuthContext.jsx       # JWT 认证
    components/
      Layout.jsx            # 公开页面 Layout
      Navbar.jsx
      Footer.jsx
      SectionTitle.jsx      # 统一标题组件
      ScrollReveal.jsx      # 滚动动画
      admin/
        AdminLayout.jsx     # 后台 Layout (侧边栏)
        EditorShell.jsx     # 编辑器外壳
        Toast.jsx
    pages/
      Home.jsx              # 公开页面
      admin/
        AdminHome.jsx       # 后台页面
    data/
      content.js            # 默认内容（API 不可用时的回退）
    lib/
      api.js                # fetch 封装（自动附加 JWT）
    utils/
      deepClone.js          # JSON.parse(JSON.stringify(...))
  server/
    index.js                # Express 入口（导出 app）
    db/
      pool.js               # pg Pool 配置
      schema.sql            # 建表语句
      seed.js               # 数据库初始化
    middleware/
      auth.js               # JWT 验证
      errorHandler.js       # 统一错误处理
    routes/
      auth.js               # 登录/密码重置/个人信息
      content.js            # 内容 CRUD
    utils/
      hash.js               # bcrypt 密码
      jwt.js                # JWT 签发/验证
      email.js              # nodemailer 发送
  scripts/
    fetch-content.js        # 构建前从数据库拉取内容
  api/
    index.js                # Vercel Serverless 入口
  public/
    content.json            # 构建生成（gitignore）
```

---

## 常用命令

```bash
npm run dev          # 本地开发（Vite :5173 + Express :3001）
npm run build        # 构建（拉取 DB 内容 → Vite 打包）
npm run db:init      # 初始化数据库（建表 + 填充默认数据）
npm start            # 生产模式启动 Express
```

## 环境变量

```bash
DATABASE_URL=         # Supabase Transaction Pooler 连接串
JWT_SECRET=           # JWT 签名密钥
ADMIN_USERNAME=       # 管理员用户名
ADMIN_EMAIL=          # 管理员邮箱
ADMIN_PASSWORD=       # 管理员密码
SITE_URL=             # 网站 URL（密码重置邮件中的链接）
SMTP_HOST/PORT/USER/PASS  # 邮件发送
DEPLOY_HOOK_URL=      # Vercel Deploy Hook（内容保存后触发重建）
```

# Supabase 集成指南

## 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com/)
2. 注册/登录账号
3. 创建新项目
4. 等待项目初始化完成（约 2 分钟）

## 2. 创建数据库表

在 Supabase Dashboard 中，进入 **SQL Editor**，执行以下 SQL：

```sql
-- 创建 books 表
CREATE TABLE IF NOT EXISTS books (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  cover TEXT,
  status TEXT NOT NULL CHECK (status IN ('想读', '在读', '已读')),
  rating INTEGER NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_rating ON books(rating);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at DESC);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 启用 Row Level Security (RLS)
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许所有人读取和写入（公开访问）
-- 注意：生产环境建议使用认证策略
CREATE POLICY "Allow public read access" ON books
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON books
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON books
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete" ON books
  FOR DELETE USING (true);
```

## 3. 获取 API 密钥

1. 在 Supabase Dashboard 中，进入 **Project Settings** → **API**
2. 复制以下信息：
   - **Project URL**（例如：`https://xxxxx.supabase.co`）
   - **anon/public key**（以 `eyJhbGci...` 开头）

## 4. 配置应用

编辑 `config.js` 文件，替换以下内容：

```javascript
const SUPABASE_CONFIG = {
  url: "YOUR_SUPABASE_URL", // 替换为你的 Project URL
  anonKey: "YOUR_SUPABASE_ANON_KEY", // 替换为你的 anon key
};
```

例如：

```javascript
const SUPABASE_CONFIG = {
  url: "https://abcdefghijklmnop.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
};
```

## 5. 测试

1. 刷新页面
2. 打开浏览器控制台（F12）
3. 应该看到 "使用 Supabase 数据库" 的日志
4. 尝试添加一本书，检查 Supabase Dashboard 的 **Table Editor** 中是否出现数据

## 6. 数据迁移（可选）

如果你之前使用 localStorage 存储了数据，可以手动迁移：

1. 在浏览器控制台执行：
```javascript
const oldData = JSON.parse(localStorage.getItem('booklist.books') || '[]');
console.log(oldData);
```

2. 复制数据，然后在 Supabase Dashboard 的 **Table Editor** 中手动添加，或使用 SQL：

```sql
INSERT INTO books (title, author, cover, status, rating, notes)
VALUES 
  ('书名1', '作者1', '封面URL', '想读', 5, '笔记内容'),
  ('书名2', '作者2', NULL, '已读', 4, NULL);
```

## 7. 安全建议

当前配置允许公开访问（适合个人使用）。如果需要更安全的配置：

1. 启用 Supabase Authentication
2. 修改 RLS 策略，只允许认证用户访问
3. 在应用中集成 Supabase Auth

## 故障排除

- **"Supabase 未配置"警告**：检查 `config.js` 中的 URL 和 Key 是否正确
- **"加载数据失败"**：检查网络连接和 Supabase 项目状态
- **"保存失败"**：检查 RLS 策略是否正确配置

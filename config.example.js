// Supabase 配置示例文件
// 复制此文件为 config.js 并填入你的实际配置

const SUPABASE_CONFIG = {
  // 从 Supabase Dashboard -> Project Settings -> API 获取
  url: "YOUR_SUPABASE_URL", // 例如：https://xxxxx.supabase.co
  anonKey: "YOUR_SUPABASE_ANON_KEY", // 例如：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
};

// 验证 URL 格式
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

// 初始化 Supabase 客户端
let supabase = null;

// 等待 Supabase 库加载完成
function initSupabase() {
  // 检查 Supabase 库是否已加载
  if (typeof window.supabase === "undefined") {
    console.warn("Supabase JS 库未加载，请检查 CDN 链接");
    return null;
  }

  // 验证配置
  if (!SUPABASE_CONFIG.url || SUPABASE_CONFIG.url === "YOUR_SUPABASE_URL") {
    console.warn("Supabase URL 未配置");
    return null;
  }

  if (!SUPABASE_CONFIG.anonKey || SUPABASE_CONFIG.anonKey === "YOUR_SUPABASE_ANON_KEY") {
    console.warn("Supabase anonKey 未配置");
    return null;
  }

  // 清理 URL（移除可能的空格和特殊字符）
  const cleanUrl = String(SUPABASE_CONFIG.url).trim();
  const cleanKey = String(SUPABASE_CONFIG.anonKey).trim();
  
  // 验证 URL 格式
  if (!isValidUrl(cleanUrl)) {
    console.error("❌ Supabase URL 格式无效");
    console.error("  URL:", cleanUrl);
    console.error("  请确保 URL 格式为: https://xxxxx.supabase.co");
    return null;
  }

  // 验证 URL 是否包含 supabase.co
  if (!cleanUrl.includes("supabase.co")) {
    console.error("❌ Supabase URL 格式不正确，应包含 'supabase.co'");
    return null;
  }

  try {
    supabase = window.supabase.createClient(cleanUrl, cleanKey);
    console.log("✅ Supabase 客户端初始化成功");
    return supabase;
  } catch (err) {
    console.error("❌ Supabase 初始化失败:", err);
    console.error("  错误类型:", err.name);
    console.error("  错误信息:", err.message);
    console.error("  URL:", cleanUrl);
    return null;
  }
}

// 数据库表名
const TABLE_NAME = "books";

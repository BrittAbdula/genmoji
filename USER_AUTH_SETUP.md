# 用户认证功能配置指南

## 概述

本项目现在支持用户登录功能，包括：
- Google 一键登录
- 用户生成的 emoji 自动关联和保存
- 我的 emoji 列表页面
- 响应式移动端体验

## 环境变量配置

在项目根目录创建 `.env.local` 文件，添加以下配置：

```bash
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here

# JWT Secret for backend authentication (后端需要)
JWT_SECRET=your-jwt-secret-key-here
```

## Google OAuth 设置

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API
4. 创建 OAuth 2.0 客户端 ID
5. 在授权的 JavaScript 来源中添加你的域名：
   - `http://localhost:3000` (开发环境)
   - `https://yourdomain.com` (生产环境)
6. 复制客户端 ID 到环境变量 `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

## 新增功能

### 1. 用户认证状态管理
- 使用 Zustand 进行状态管理
- 支持本地存储持久化
- 自动检查 token 有效性

### 2. 响应式登录体验
- 桌面端：Dialog 模式
- 移动端：Drawer 模式
- 统一的 Google 登录组件

### 3. 我的 Emoji 页面
- 路径：`/my-emojis`
- 支持分页加载
- 移动端优化的网格布局
- 登录状态检查

### 4. Header 集成
- 未登录：显示登录按钮
- 已登录：显示用户头像和下拉菜单
- 移动端 Drawer 中的用户信息展示

## API 集成

### 统一的 API 配置

项目现在使用统一的 API 配置管理所有端点：

```typescript
// src/lib/api-config.ts
export const API_BASE_URL = 'https://genmoji-api.genmojionline.com';
```

### API 端点

所有 API 都统一使用同一个基础 URL：

- **Emoji 相关**：生成、获取、搜索等
- **用户认证相关**：登录、获取用户信息、用户 emoji 管理等
- **操作相关**：点赞、评分等

### 使用示例

```typescript
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '@/lib/api-config';

// 获取用户信息
const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH_ME}`, {
  headers: getAuthHeaders(token)
});

// 生成器组件会自动传递用户 token
const emojiResponse = await genMoji(prompt, locale, image, model, token);
```

## 国际化支持

已为以下语言添加翻译：
- 英语 (en)
- 中文 (zh)
- 法语 (fr)
- 日语 (ja)

翻译键：
- `auth.login` - 登录
- `auth.logout` - 退出登录
- `auth.my_emojis` - 我的表情
- `my_emojis.title` - 我的表情
- 等等...

## 移动端优化

### 响应式设计
- 网格布局：移动端 2 列，桌面端最多 6 列
- 间距自适应：移动端较小间距
- 文字大小：移动端适配

### 触摸优化
- 按钮大小适合手指点击
- Drawer 替代 Dialog
- 简化的导航

### 性能优化
- 懒加载组件
- 最小化移动端渲染内容
- 优化的图片加载

## 使用示例

### 在组件中检查登录状态

```typescript
import { useAuthStore } from "@/store/auth-store";

function MyComponent() {
  const { isLoggedIn, user } = useAuthStore();
  
  if (!isLoggedIn) {
    return <LoginDialog />;
  }
  
  return <div>欢迎，{user?.name}！</div>;
}
```

### 自定义登录触发器

```typescript
<LoginDialog>
  <Button variant="ghost">自定义登录按钮</Button>
</LoginDialog>
```

## 注意事项

1. **安全性**：确保 JWT_SECRET 保密
2. **HTTPS**：生产环境必须使用 HTTPS
3. **CORS**：确保后端 CORS 配置正确
4. **域名配置**：Google OAuth 配置中的域名必须匹配

## 故障排除

### 登录失败
1. 检查 Google Client ID 是否正确
2. 确认域名在 Google OAuth 配置中
3. 检查浏览器控制台错误

### 状态不同步
1. 清除浏览器 localStorage
2. 检查网络连接
3. 确认后端 API 正常运行

### 移动端问题
1. 检查触摸事件是否正常
2. 确认 viewport 配置
3. 测试不同设备尺寸 
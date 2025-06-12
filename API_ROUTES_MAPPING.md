# API 路由映射表

本文档列出了前端调用的所有 API 端点，所有端点都统一使用 `https://genmoji-api.genmojionline.com` 作为基础URL。

## 统一 API 端点

所有 API 都部署在同一个服务上：

### Emoji 相关

| 端点 | URL | 方法 | 描述 |
|------|-----|------|------|
| `/genmoji/generate` | `https://genmoji-api.genmojionline.com/genmoji/generate` | POST | 生成新 emoji |
| `/genmoji/by-slug/{slug}` | `https://genmoji-api.genmojionline.com/genmoji/by-slug/{slug}` | GET | 通过 slug 获取单个 emoji |
| `/genmoji/list` | `https://genmoji-api.genmojionline.com/genmoji/list` | GET | 获取 emoji 列表 |
| `/genmoji/search` | `https://genmoji-api.genmojionline.com/genmoji/search` | GET | 搜索 emoji |
| `/genmoji/related/{slug}` | `https://genmoji-api.genmojionline.com/genmoji/related/{slug}` | GET | 获取相关 emoji |
| `/genmoji/by-base-slug/{baseSlug}` | `https://genmoji-api.genmojionline.com/genmoji/by-base-slug/{baseSlug}` | GET | 通过基础 slug 获取 emoji |
| `/genmoji/groups` | `https://genmoji-api.genmojionline.com/genmoji/groups` | GET | 获取分组数据 |

### 操作相关

| 端点 | URL | 方法 | 描述 |
|------|-----|------|------|
| `/action/{slug}/like` | `https://genmoji-api.genmojionline.com/action/{slug}/like` | POST | 点赞 emoji |
| `/action/{slug}` | `https://genmoji-api.genmojionline.com/action/{slug}` | POST | 执行 emoji 操作 |

### 用户认证相关

| 端点 | URL | 方法 | 描述 |
|------|-----|------|------|
| `/auth/google-login` | `https://genmoji-api.genmojionline.com/auth/google-login` | POST | Google 一键登录 |
| `/auth/me` | `https://genmoji-api.genmojionline.com/auth/me` | GET | 获取当前用户信息 |
| `/auth/my-emojis` | `https://genmoji-api.genmojionline.com/auth/my-emojis` | GET | 获取用户的 emoji 列表 |
| `/auth/logout` | `https://genmoji-api.genmojionline.com/auth/logout` | POST | 用户登出 |

## 代码示例

### 前端调用示例

```typescript
import { 
  API_BASE_URL,
  API_ENDPOINTS,
  getAuthHeaders,
  getApiUrl
} from '@/lib/api-config';

// 认证相关 API 调用
const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH_ME}`, {
  headers: getAuthHeaders(token)
});

// Emoji 相关 API 调用
const emojiUrl = getApiUrl(API_ENDPOINTS.EMOJI_BY_SLUG('happy-cat'), 'en');
const emojiResponse = await fetch(emojiUrl);
```



## 环境变量

确保在 `.env.local` 中配置：

```bash
# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

## 安全考虑

1. **JWT Token 验证**：所有需要认证的端点都应验证 JWT token
2. **CORS 配置**：确保正确配置 CORS 策略
3. **Rate Limiting**：考虑为 API 端点添加频率限制
4. **输入验证**：验证所有输入参数
5. **错误处理**：统一的错误响应格式

## 测试端点

可以使用以下工具测试 API 端点：

- **开发工具**：浏览器开发者工具
- **API 客户端**：Postman, Insomnia
- **命令行**：curl

```bash
# 测试获取用户信息
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     https://genmoji-api.genmojionline.com/auth/me

# 测试 Google 登录
curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"id_token":"GOOGLE_ID_TOKEN"}' \
     https://genmoji-api.genmojionline.com/auth/google-login
``` 
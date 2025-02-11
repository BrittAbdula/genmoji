import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
 
export default createMiddleware(routing);

export const config = {
  // 匹配所有路径，但排除静态资源和API路由
  matcher: [
    // 匹配所有路径
    '/((?!api|_next|.*\\..*).*)',
    // 匹配根路径
    '/',
    // 匹配语言前缀路径
    '/(zh|ja|fr)/:path*'
  ]
}; 
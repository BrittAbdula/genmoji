'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';

interface TimeAgoProps {
  date: string;
  className?: string;
}

export function TimeAgo({ date, className }: TimeAgoProps) {
  const t = useTranslations('emoji.detail.time');
  const locale = useLocale();
  const [timeAgo, setTimeAgo] = useState('');
  const [fullDate, setFullDate] = useState('');

  useEffect(() => {
    function getTimeAgo() {
      // 确保使用 UTC 时间进行计算
      const now = new Date();
      const utcNow = Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds()
      );
      
      // 将 ISO 字符串解析为 UTC 时间
      const past = new Date(date);
      const utcPast = Date.UTC(
        past.getUTCFullYear(),
        past.getUTCMonth(),
        past.getUTCDate(),
        past.getUTCHours(),
        past.getUTCMinutes(),
        past.getUTCSeconds()
      );

      // 计算时间差（毫秒）
      const diff = utcNow - utcPast;

      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const months = Math.floor(days / 30);
      const years = Math.floor(days / 365);

      if (minutes < 1) {
        return t('justNow');
      } else if (minutes < 60) {
        return t('minutesAgo', { minutes });
      } else if (hours < 24) {
        return t('hoursAgo', { hours });
      } else if (days < 30) {
        return t('daysAgo', { days });
      } else if (months < 12) {
        return t('monthsAgo', { months });
      } else {
        return t('yearsAgo', { years });
      }
    }

    // 格式化完整日期时间
    const formatFullDate = () => {
      try {
        const dateObj = new Date(date);
        return new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short',
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone // 使用用户本地时区
        }).format(dateObj);
      } catch (error) {
        console.error('Error formatting date:', error);
        return date;
      }
    };

    // 初始更新
    setTimeAgo(getTimeAgo());
    setFullDate(formatFullDate());

    // 每分钟更新一次相对时间
    const interval = setInterval(() => {
      setTimeAgo(getTimeAgo());
    }, 60000);

    return () => clearInterval(interval);
  }, [date, t, locale]);

  return (
    <time 
      dateTime={date} // 保持 ISO 格式的 UTC 时间用于机器可读性
      className={className}
      title={fullDate}
      aria-label={fullDate}
    >
      {timeAgo}
    </time>
  );
} 
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const saveToLocalStorage = (key: string, data: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

export const loadFromLocalStorage = (key: string) => {
  if (typeof window !== 'undefined') {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : null;
  }
  return null;
};

export const removeFromLocalStorage = (key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key);
  }
};

// 로컬 스토리지에서 step1, step2, step3 삭제
export const clearRegistrationSteps = () => {
  removeFromLocalStorage("step1");
  removeFromLocalStorage("step2");
  removeFromLocalStorage("step3");
};

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


// 시간 차이를 계산해 상대적인 시간으로 변환하는 함수
export const getRelativeTime = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
  
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second');
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return rtf.format(-diffInMinutes, 'minute');
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return rtf.format(-diffInHours, 'hour');
  }

  const diffInDays = Math.floor(diffInHours / 24);
  
  // 일주일 이상 경과 시 절대 날짜로 표시
  if (diffInDays >= 7) {
    return new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  }

  // 일주일 이내면 상대적인 날짜로 표시
  return rtf.format(-diffInDays, 'day');
};


export const generateMapKey = (searchParams: any) => {
  const paramEntries = Object.entries(searchParams || {}).sort(([a], [b]) => a.localeCompare(b));
  const paramString = paramEntries
    .map(([key, value]) => `${key}=${Array.isArray(value) ? value.join(',') : value}`)
    .join('&');
  return `map-${paramString || 'default'}`;
};


export const formatFileSize = (size: number): string => {
  if (size < 1024) return size + " B";
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + " KB";
  return (size / (1024 * 1024)).toFixed(2) + " MB";
};

export const isValidImageType = (file: File): boolean => {
  const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  return validTypes.includes(file.type);
};

export const createImagePreview = (file: File): string => {
  return URL.createObjectURL(file);
};

export const revokeImagePreview = (preview: string) => {
  URL.revokeObjectURL(preview);
};


export function generateTemporaryPassword(): string {
  const length = 10;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  
  // 최소 1개의 숫자 추가
  password += '0123456789'[Math.floor(Math.random() * 10)];
  
  // 최소 1개의 영문자 추가
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
  
  // 나머지 8자리 랜덤 생성
  for (let i = password.length; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  // 문자열을 섞어서 반환
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// ✅ 매물 슬러그 생성 함수
// 규칙: [지역]-[건물명앞3단어]-[타입]-[거래유형]-id[번호]
// 예시: bgc-the-fort-residences-condo-for-rent-id123
export const generatePropertySlug = (unit: {
  id: number
  sellType?: string | null
  type?: string | null
  address2?: string | null
  title?: string | null
}): string => {

  // 지역명 처리
  // address2 필드 사용 (BGC, Makati 등)
  const location = (unit.address2 || 'bgc')
    .toLowerCase()
    .replace(/\s+/g, '-')        // 공백 → 하이픈
    .replace(/[^a-z0-9-]/g, '') // 특수문자 제거
    .substring(0, 20)            // 최대 20자

  // 건물명/제목 처리
  // title 앞 3단어만 사용
  const buildingName = (unit.title || 'property')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // 특수문자 제거
    .trim()
    .split(/\s+/)                  // 단어 분리
    .slice(0, 3)                   // 앞 3단어만
    .join('-')
    .substring(0, 30)              // 최대 30자

  // 자산 타입 처리
  // condo, lot, commercial, office 등
  const type = (unit.type || 'property')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

  // 거래유형 처리
  const sellTypeMap: Record<string, string> = {
    'rent':  'for-rent',
    'sale':  'for-sale',
    'buy':   'for-sale',
    'lease': 'for-lease',
  }
  const sellType = sellTypeMap[
    unit.sellType?.toLowerCase() || ''
  ] || 'for-rent'

  // 최종 슬러그 조합
  return `${location}-${buildingName}-${type}-${sellType}-id${unit.id}`
}

// ✅ 슬러그에서 ID 추출 함수
// 예시: bgc-the-fort-condo-for-rent-id123 → 123
export const extractIdFromSlug = (slug: string): number | null => {
  const match = slug.match(/id(\d+)$/)
  return match ? parseInt(match[1]) : null
}
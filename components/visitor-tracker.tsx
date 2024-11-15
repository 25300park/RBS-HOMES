'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export function VisitorTracker() {
 const { status } = useSession(); // data 대신 status만 사용
 const pathname = usePathname();
 const isVisitRecorded = useRef(false);

 useEffect(() => {
   // session이 초기화되기 전(loading)이거나 이미 기록했으면 실행하지 않음
   if (status === 'loading' || isVisitRecorded.current) return;

   let sessionId = sessionStorage.getItem('visitorSessionId');
   if (!sessionId) {
     sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
     sessionStorage.setItem('visitorSessionId', sessionId);
   }

   const recordVisit = async () => {
     try {
       const response = await fetch('/api/visitor', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           sessionId,
           isLoggedIn: status === 'authenticated',
           path: pathname,
           userAgent: navigator.userAgent,
         }),
       });

       if (response.ok) {
         isVisitRecorded.current = true;
       }
     } catch (error) {
       console.error('Failed to record visit:', error);
     }
   };

   // 방문 기록
   recordVisit();

   // 페이지 나갈 때 이벤트
   const handleBeforeUnload = () => {
     fetch('/api/visitor/exit', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         sessionId,
       }),
       keepalive: true,
     }).catch(console.error);
   };

   window.addEventListener('beforeunload', handleBeforeUnload);

   return () => {
     window.removeEventListener('beforeunload', handleBeforeUnload);
   };
 }, [status, pathname]); // status와 pathname만 의존성으로 사용

 return null;
}
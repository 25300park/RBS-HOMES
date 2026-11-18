const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
 
const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()
 
app.prepare().then(() => {
  createServer(async (req, res) => {
    // CVE-2025-29927 완화: 외부 요청이 보낸 x-middleware-subrequest 헤더로
    // middleware(인증 검사)를 건너뛰지 못하도록 요청 처리 맨 앞에서 제거한다.
    delete req.headers['x-middleware-subrequest']

    try {
      // 프로덕션 환경에서 호스트 헤더 설정
      if (!dev) {
        // x-forwarded-host 헤더를 실제 도메인으로 설정
        req.headers['x-forwarded-host'] = 'rbs-homes.com';
        
        // 추가적인 프록시 헤더 설정
        req.headers['x-forwarded-proto'] = 'https';
        req.headers['x-real-ip'] = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      }

      // 요청 정보 로깅
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

      const parsedUrl = parse(req.url, true)
      
      // auth 관련 요청 로깅
      if (parsedUrl.pathname?.includes('/api/auth')) {
        console.log('Auth request:', {
          pathname: parsedUrl.pathname
        });
      }

      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Detailed error:', err);
      console.error('Stack trace:', err.stack);
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
      console.log('Environment:', process.env.NODE_ENV)
      console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
    })
})
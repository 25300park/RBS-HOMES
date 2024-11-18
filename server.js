const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
// hostname을 실제 도메인으로 변경
const hostname = process.env.NODE_ENV === 'production' ? 'rbs-homes.com' : 'localhost'
const port = 3000

const app = next({ 
  dev, 
  hostname,
  port,
  conf: {
    reactStrictMode: true,
    serverActions: {
      allowedOrigins: ["rbs-homes.com", "www.rbs-homes.com", "localhost:3000"]
    }
  }
})
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // CORS 헤더 설정
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      // x-forwarded-host 헤더 설정
      if (process.env.NODE_ENV === 'production') {
        req.headers['x-forwarded-host'] = 'rbs-homes.com';
      }

      const parsedUrl = parse(req.url, true)
      const { pathname, query } = parsedUrl

      // 헬스 체크 엔드포인트
      if (pathname === '/health') {
        res.statusCode = 200
        res.end('OK')
        return
      }

      // 기존 라우팅 로직
      if (pathname === '/a') {
        await app.render(req, res, '/a', query)
      } else if (pathname === '/b') {
        await app.render(req, res, '/b', query)
      } else {
        await handle(req, res, parsedUrl)
      }
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, '0.0.0.0', () => {  // 모든 IP에서 접근 가능하도록 설정
      console.log(`> Ready on http://${hostname}:${port}`)
      console.log('> Mode:', process.env.NODE_ENV)
    })
})

// 예기치 않은 에러 처리
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
})

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err)
})
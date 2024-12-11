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
    try {
      // 요청 정보 로깅
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
      console.log('Headers:', req.headers);

      const parsedUrl = parse(req.url, true)
      
      // auth 관련 요청 로깅
      if (parsedUrl.pathname?.includes('/api/auth')) {
        console.log('Auth request:', {
          pathname: parsedUrl.pathname,
          query: parsedUrl.query,
          headers: req.headers
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
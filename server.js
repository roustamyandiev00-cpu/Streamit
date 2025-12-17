const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { initSocket } = require('./src/lib/socket.js')
const { startRTMPServer, isAvailable } = require('./src/lib/rtmpServer.js')
const { startStreamMonitoring } = require('./src/lib/streamDiscovery.js')

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || 'localhost'
const port = parseInt(process.env.PORT || '3001', 10)

// Set NODE_ENV if not set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = dev ? 'development' : 'production'
}

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Initialize Socket.io with the HTTP server
  initSocket(httpServer)

  // Start RTMP server for livestreaming
  if (isAvailable()) {
    try {
      startRTMPServer()
      console.log('> RTMP Server available for livestreaming')
      
      // Start stream discovery/monitoring
      startStreamMonitoring(30000) // Check every 30 seconds
      console.log('> Stream Discovery service started')
    } catch (error) {
      console.warn('> RTMP Server failed to start:', error.message)
      console.warn('> Livestreaming will not be available')
    }
  } else {
    console.warn('> RTMP Server not available - install node-media-server for livestreaming')
  }

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
      console.log(`> Socket.io initialized and ready`)
    })
})


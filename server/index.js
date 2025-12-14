import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { searchRestaurants } from './searchEngine.js'
import crawler from './crawler.js'
import database from './database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Initialize crawler with Twitter API credentials (if available)
crawler.initialize(process.env.TWITTER_BEARER_TOKEN)

// Initialize database
await database.load()

// API endpoints
app.get('/api/search', async (req, res) => {
  const query = req.query.q || ''

  try {
    // First check database for real restaurants
    const dbRestaurants = await database.search(query)

    if (dbRestaurants.length > 0) {
      res.json({ restaurants: dbRestaurants, query, source: 'database' })
    } else {
      // Fall back to mock data if no results in database
      const restaurants = searchRestaurants(query)
      res.json({ restaurants, query, source: 'mock' })
    }
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({ error: 'Search failed', restaurants: [] })
  }
})

app.get('/api/restaurants/:id', async (req, res) => {
  const { id } = req.params

  try {
    // Try to find in database first
    const restaurant = await database.getById(id)

    if (restaurant) {
      res.json(restaurant)
    } else {
      // Fall back to mock data
      const allRestaurants = searchRestaurants('')
      const mockRestaurant = allRestaurants.find(r => r.id === parseInt(id))

      if (mockRestaurant) {
        res.json(mockRestaurant)
      } else {
        res.status(404).json({ error: 'Restaurant not found' })
      }
    }
  } catch (error) {
    console.error('Restaurant fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch restaurant' })
  }
})

// Crawler endpoints
app.post('/api/crawler/run', async (req, res) => {
  try {
    const { query, maxResults } = req.body

    if (!query) {
      return res.status(400).json({ error: 'Query is required' })
    }

    const result = await crawler.crawl(query, { maxResults })
    res.json(result)
  } catch (error) {
    console.error('Crawler error:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/crawler/stats', (req, res) => {
  res.json(crawler.getStats())
})

app.get('/api/crawler/status', (req, res) => {
  res.json({
    isRunning: crawler.isRunning,
    lastRun: crawler.lastRun,
    twitterConfigured: !!process.env.TWITTER_BEARER_TOKEN
  })
})

// Database endpoints
app.get('/api/database/stats', async (req, res) => {
  try {
    const stats = await database.getStats()
    res.json(stats)
  } catch (error) {
    console.error('Stats error:', error)
    res.status(500).json({ error: 'Failed to get stats' })
  }
})

app.get('/api/database/top', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const topRestaurants = await database.getTopRestaurants(limit)
    res.json(topRestaurants)
  } catch (error) {
    console.error('Top restaurants error:', error)
    res.status(500).json({ error: 'Failed to get top restaurants' })
  }
})

// Serve static files from dist folder in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')))

  // Catch-all route - only for non-API requests
  app.get('*', (req, res, next) => {
    // Don't intercept API routes
    if (req.path.startsWith('/api/')) {
      return next()
    }
    res.sendFile(path.join(__dirname, '../dist/index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`🚀 SocialBite running on http://localhost:${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})

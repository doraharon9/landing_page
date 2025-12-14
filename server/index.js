import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { searchRestaurants } from './searchEngine.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// API endpoints
app.get('/api/search', (req, res) => {
  const query = req.query.q || ''

  try {
    const restaurants = searchRestaurants(query)
    res.json({ restaurants, query })
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({ error: 'Search failed', restaurants: [] })
  }
})

app.get('/api/restaurants/:id', (req, res) => {
  const { id } = req.params
  const allRestaurants = searchRestaurants('')
  const restaurant = allRestaurants.find(r => r.id === parseInt(id))

  if (restaurant) {
    res.json(restaurant)
  } else {
    res.status(404).json({ error: 'Restaurant not found' })
  }
})

// Serve static files from dist folder in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')))

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`🚀 SocialBite running on http://localhost:${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})

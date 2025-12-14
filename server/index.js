import express from 'express'
import cors from 'cors'
import { searchRestaurants } from './searchEngine.js'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// Search endpoint
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

// Get restaurant by ID
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

app.listen(PORT, () => {
  console.log(`🚀 SocialBite API running on http://localhost:${PORT}`)
})

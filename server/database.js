import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Simple JSON Database
 * Stores restaurants discovered from social media
 * Can be upgraded to MongoDB/PostgreSQL later
 */
class Database {
  constructor() {
    this.dbPath = path.join(__dirname, 'restaurants.json')
    this.restaurants = []
    this.loaded = false
  }

  /**
   * Load database from file
   */
  async load() {
    try {
      const data = await fs.readFile(this.dbPath, 'utf-8')
      this.restaurants = JSON.parse(data)
      this.loaded = true
      console.log(`📂 Loaded ${this.restaurants.length} restaurants from database`)
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, start with empty database
        this.restaurants = []
        this.loaded = true
        console.log('📂 Created new database')
      } else {
        console.error('Database load error:', error.message)
      }
    }
  }

  /**
   * Save database to file
   */
  async save() {
    try {
      await fs.writeFile(this.dbPath, JSON.stringify(this.restaurants, null, 2))
      console.log(`💾 Saved ${this.restaurants.length} restaurants to database`)
    } catch (error) {
      console.error('Database save error:', error.message)
    }
  }

  /**
   * Add or update a restaurant
   */
  async upsertRestaurant(restaurant) {
    if (!this.loaded) await this.load()

    const existing = this.restaurants.find(r =>
      r.name.toLowerCase() === restaurant.name.toLowerCase() &&
      this.sameLocation(r, restaurant)
    )

    if (existing) {
      // Update existing restaurant
      Object.assign(existing, {
        ...restaurant,
        socialPosts: [
          ...(existing.socialPosts || []),
          ...(restaurant.socialPosts || [])
        ].slice(0, 50), // Keep last 50 posts
        updatedAt: new Date().toISOString(),
        mentionCount: (existing.mentionCount || 0) + (restaurant.mentionCount || 0)
      })
      console.log(`✏️  Updated restaurant: ${existing.name}`)
    } else {
      // Add new restaurant
      const newRestaurant = {
        id: this.generateId(),
        ...restaurant,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      this.restaurants.push(newRestaurant)
      console.log(`✨ Added new restaurant: ${newRestaurant.name}`)
    }

    await this.save()
  }

  /**
   * Check if two restaurants are in the same location
   */
  sameLocation(r1, r2) {
    if (r1.lat && r2.lat && r1.lng && r2.lng) {
      // Within ~1km
      const latDiff = Math.abs(r1.lat - r2.lat)
      const lngDiff = Math.abs(r1.lng - r2.lng)
      return latDiff < 0.01 && lngDiff < 0.01
    }

    if (r1.address && r2.address) {
      return r1.address.toLowerCase() === r2.address.toLowerCase()
    }

    return false
  }

  /**
   * Get all restaurants
   */
  async getAll() {
    if (!this.loaded) await this.load()
    return this.restaurants
  }

  /**
   * Search restaurants
   */
  async search(query) {
    if (!this.loaded) await this.load()

    const lowerQuery = query.toLowerCase()
    return this.restaurants.filter(r =>
      r.name.toLowerCase().includes(lowerQuery) ||
      r.cuisine?.toLowerCase().includes(lowerQuery) ||
      r.address?.toLowerCase().includes(lowerQuery) ||
      r.topTags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  /**
   * Get restaurant by ID
   */
  async getById(id) {
    if (!this.loaded) await this.load()
    return this.restaurants.find(r => r.id === id)
  }

  /**
   * Get top restaurants by social score
   */
  async getTopRestaurants(limit = 10) {
    if (!this.loaded) await this.load()
    return this.restaurants
      .sort((a, b) => (b.socialScore || 0) - (a.socialScore || 0))
      .slice(0, limit)
  }

  /**
   * Get statistics
   */
  async getStats() {
    if (!this.loaded) await this.load()

    return {
      totalRestaurants: this.restaurants.length,
      totalMentions: this.restaurants.reduce((sum, r) => sum + (r.mentionCount || 0), 0),
      avgSocialScore: Math.round(
        this.restaurants.reduce((sum, r) => sum + (r.socialScore || 0), 0) /
        (this.restaurants.length || 1)
      ),
      cuisineBreakdown: this.getCuisineBreakdown(),
      recentlyAdded: this.restaurants
        .filter(r => r.createdAt)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(r => ({ name: r.name, createdAt: r.createdAt }))
    }
  }

  /**
   * Get cuisine breakdown
   */
  getCuisineBreakdown() {
    const cuisines = {}
    this.restaurants.forEach(r => {
      const cuisine = r.cuisine || 'Unknown'
      cuisines[cuisine] = (cuisines[cuisine] || 0) + 1
    })
    return cuisines
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9)
  }

  /**
   * Clear all restaurants (use with caution!)
   */
  async clear() {
    this.restaurants = []
    await this.save()
  }
}

export default new Database()

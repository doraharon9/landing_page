import { restaurants } from './data.js'

// Simple natural language search engine
export function searchRestaurants(query) {
  if (!query || query.trim() === '') {
    // Return all restaurants sorted by social score
    return [...restaurants].sort((a, b) => b.socialScore - a.socialScore)
  }

  const lowerQuery = query.toLowerCase()
  const keywords = lowerQuery.split(' ').filter(word => word.length > 2)

  // Calculate relevance score for each restaurant
  const scoredRestaurants = restaurants.map(restaurant => {
    let score = 0

    // Search in restaurant name (high weight)
    if (restaurant.name.toLowerCase().includes(lowerQuery)) {
      score += 100
    }
    keywords.forEach(keyword => {
      if (restaurant.name.toLowerCase().includes(keyword)) {
        score += 50
      }
    })

    // Search in cuisine (high weight)
    if (restaurant.cuisine.toLowerCase().includes(lowerQuery)) {
      score += 80
    }
    keywords.forEach(keyword => {
      if (restaurant.cuisine.toLowerCase().includes(keyword)) {
        score += 40
      }
    })

    // Search in tags (medium weight)
    restaurant.topTags.forEach(tag => {
      if (tag.toLowerCase().includes(lowerQuery)) {
        score += 30
      }
      keywords.forEach(keyword => {
        if (tag.toLowerCase().includes(keyword)) {
          score += 15
        }
      })
    })

    // Search in address (low weight)
    if (restaurant.address.toLowerCase().includes(lowerQuery)) {
      score += 20
    }

    // Search in social posts (low weight)
    restaurant.socialPosts.forEach(post => {
      if (post.content.toLowerCase().includes(lowerQuery)) {
        score += 10
      }
      keywords.forEach(keyword => {
        if (post.content.toLowerCase().includes(keyword)) {
          score += 5
        }
      })
    })

    // Contextual search patterns
    const patterns = {
      // Cuisine types
      italian: ['italian', 'pasta', 'pizza'],
      mexican: ['mexican', 'tacos', 'taco'],
      japanese: ['japanese', 'sushi', 'ramen'],
      indian: ['indian', 'curry'],
      vegan: ['vegan', 'plant', 'vegetarian'],
      american: ['burger', 'american', 'breakfast'],

      // Meal types
      brunch: ['brunch', 'breakfast'],
      latenight: ['late', 'night'],

      // Atmosphere
      romantic: ['romantic', 'date'],
      casual: ['casual', 'comfort'],
      outdoor: ['outdoor', 'patio'],
      cozy: ['cozy'],

      // Preferences
      authentic: ['authentic', 'traditional'],
      healthy: ['healthy', 'organic'],
      spicy: ['spicy', 'hot'],
    }

    // Apply pattern matching
    Object.entries(patterns).forEach(([category, terms]) => {
      const matchesCategory = terms.some(term => lowerQuery.includes(term))
      if (matchesCategory) {
        const restaurantText = `${restaurant.name} ${restaurant.cuisine} ${restaurant.topTags.join(' ')}`.toLowerCase()
        if (terms.some(term => restaurantText.includes(term))) {
          score += 25
        }
      }
    })

    // Boost by social score (popularity)
    score += restaurant.socialScore / 100

    return { ...restaurant, relevanceScore: score }
  })

  // Filter out restaurants with no relevance and sort by score
  return scoredRestaurants
    .filter(r => r.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
}

/**
 * Post Processor
 * Extracts restaurant information from social media posts
 */

class PostProcessor {
  /**
   * Extract potential restaurant names from tweet text
   */
  extractRestaurantNames(text) {
    const restaurants = []

    // Common patterns for restaurant mentions
    const patterns = [
      /at\s+([A-Z][A-Za-z'\s&-]+)(?=\s+(?:restaurant|cafe|bar|bistro|pizza|taco|sushi))/gi,
      /@([A-Za-z0-9_]+)/g, // Twitter handles (often restaurant accounts)
      /([A-Z][A-Za-z'\s&-]+)\s+(?:restaurant|cafe|bar|bistro|diner|eatery)/gi,
      /"([^"]+)"/g, // Quoted names
    ]

    patterns.forEach(pattern => {
      const matches = text.matchAll(pattern)
      for (const match of matches) {
        const name = match[1]?.trim()
        if (name && name.length > 2 && name.length < 50) {
          restaurants.push(name)
        }
      }
    })

    return [...new Set(restaurants)] // Remove duplicates
  }

  /**
   * Extract location information from tweet
   */
  extractLocation(tweet, place) {
    const locations = []

    // From Twitter's geo data
    if (place?.full_name) {
      locations.push(place.full_name)
    }

    // From tweet text - look for location patterns
    const text = tweet.text
    const locationPatterns = [
      /in\s+([A-Z][A-Za-z\s]+(?:,\s*[A-Z]{2})?)/g,
      /at\s+(\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd))/gi,
      /@\s*([A-Z][A-Za-z\s]+,\s*[A-Z]{2})/g
    ]

    locationPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern)
      for (const match of matches) {
        const location = match[1]?.trim()
        if (location && location.length > 3) {
          locations.push(location)
        }
      }
    })

    return [...new Set(locations)]
  }

  /**
   * Extract cuisine type from post
   */
  extractCuisineType(text) {
    const cuisineKeywords = {
      'italian': ['italian', 'pizza', 'pasta', 'risotto'],
      'mexican': ['mexican', 'taco', 'burrito', 'enchilada', 'quesadilla'],
      'chinese': ['chinese', 'dumpling', 'noodle', 'dim sum'],
      'japanese': ['japanese', 'sushi', 'ramen', 'tempura', 'udon'],
      'indian': ['indian', 'curry', 'tandoori', 'biryani', 'naan'],
      'thai': ['thai', 'pad thai', 'curry'],
      'french': ['french', 'bistro', 'croissant'],
      'american': ['burger', 'bbq', 'steakhouse', 'diner'],
      'mediterranean': ['mediterranean', 'falafel', 'hummus', 'gyro'],
      'korean': ['korean', 'kimchi', 'bibimbap', 'bulgogi'],
      'vietnamese': ['vietnamese', 'pho', 'banh mi'],
      'vegan': ['vegan', 'plant-based'],
      'breakfast': ['breakfast', 'brunch', 'pancake'],
    }

    const lowerText = text.toLowerCase()
    const matchedCuisines = []

    for (const [cuisine, keywords] of Object.entries(cuisineKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        matchedCuisines.push(cuisine)
      }
    }

    return matchedCuisines
  }

  /**
   * Extract tags/hashtags from post
   */
  extractTags(tweet) {
    const tags = []

    if (tweet.entities?.hashtags) {
      tweet.entities.hashtags.forEach(hashtag => {
        tags.push(hashtag.tag.toLowerCase())
      })
    }

    return tags
  }

  /**
   * Process a tweet into structured restaurant data
   */
  processTweet(tweet, user, place) {
    const restaurantNames = this.extractRestaurantNames(tweet.text)
    const locations = this.extractLocation(tweet, place)
    const cuisines = this.extractCuisineType(tweet.text)
    const tags = this.extractTags(tweet)

    return {
      tweetId: tweet.id,
      text: tweet.text,
      createdAt: tweet.created_at,
      author: user?.username || 'unknown',
      authorVerified: user?.verified || false,
      metrics: {
        likes: tweet.public_metrics?.like_count || 0,
        retweets: tweet.public_metrics?.retweet_count || 0,
        replies: tweet.public_metrics?.reply_count || 0,
        quotes: tweet.public_metrics?.quote_count || 0
      },
      potentialRestaurants: restaurantNames,
      locations: locations,
      cuisines: cuisines,
      tags: tags,
      engagementScore: this.calculateEngagementScore(tweet.public_metrics)
    }
  }

  /**
   * Calculate engagement score for ranking
   */
  calculateEngagementScore(metrics) {
    if (!metrics) return 0

    return (
      (metrics.like_count || 0) * 1 +
      (metrics.retweet_count || 0) * 3 +
      (metrics.reply_count || 0) * 2 +
      (metrics.quote_count || 0) * 4
    )
  }

  /**
   * Group processed tweets by restaurant
   */
  groupByRestaurant(processedTweets) {
    const restaurantMap = new Map()

    processedTweets.forEach(tweet => {
      tweet.potentialRestaurants.forEach(restaurantName => {
        if (!restaurantMap.has(restaurantName)) {
          restaurantMap.set(restaurantName, {
            name: restaurantName,
            mentions: [],
            totalEngagement: 0,
            locations: new Set(),
            cuisines: new Set(),
            tags: new Set()
          })
        }

        const restaurant = restaurantMap.get(restaurantName)
        restaurant.mentions.push(tweet)
        restaurant.totalEngagement += tweet.engagementScore

        tweet.locations.forEach(loc => restaurant.locations.add(loc))
        tweet.cuisines.forEach(cuisine => restaurant.cuisines.add(cuisine))
        tweet.tags.forEach(tag => restaurant.tags.add(tag))
      })
    })

    // Convert Sets to Arrays and sort by engagement
    return Array.from(restaurantMap.values())
      .map(restaurant => ({
        ...restaurant,
        locations: Array.from(restaurant.locations),
        cuisines: Array.from(restaurant.cuisines),
        tags: Array.from(restaurant.tags),
        mentionCount: restaurant.mentions.length
      }))
      .sort((a, b) => b.totalEngagement - a.totalEngagement)
  }
}

export default new PostProcessor()

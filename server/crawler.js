import TwitterClient from './services/twitter-client.js'
import postProcessor from './services/post-processor.js'
import sentimentAnalyzer from './services/sentiment-analyzer.js'
import geocoder from './services/geocoder.js'
import database from './database.js'

/**
 * Social Media Crawler
 * Orchestrates the process of discovering restaurants from social media
 */
class SocialMediaCrawler {
  constructor() {
    this.twitterClient = null
    this.isRunning = false
    this.lastRun = null
    this.stats = {
      totalTweetsProcessed: 0,
      restaurantsDiscovered: 0,
      lastError: null
    }
  }

  /**
   * Initialize the crawler with API credentials
   */
  initialize(twitterBearerToken) {
    if (twitterBearerToken) {
      this.twitterClient = new TwitterClient(twitterBearerToken)
      console.log('🔑 Twitter client initialized')
    } else {
      console.warn('⚠️  Twitter API credentials not provided - crawler will use demo mode')
    }
  }

  /**
   * Run the crawler for a specific query
   */
  async crawl(query = 'restaurant NYC', options = {}) {
    if (this.isRunning) {
      throw new Error('Crawler is already running')
    }

    this.isRunning = true
    console.log(`🚀 Starting crawler for query: "${query}"`)

    try {
      // Step 1: Fetch tweets
      const { tweets, users, places } = this.twitterClient
        ? await this.twitterClient.searchTweets(query, options.maxResults || 50)
        : { tweets: [], users: [], places: [] }

      if (tweets.length === 0) {
        console.log('ℹ️  No tweets found. Using demo mode with mock data.')
        return await this.runDemoMode(query)
      }

      console.log(`📱 Fetched ${tweets.length} tweets`)
      this.stats.totalTweetsProcessed += tweets.length

      // Step 2: Process tweets
      const processedTweets = tweets.map((tweet, index) => {
        const user = users.find(u => u.id === tweet.author_id)
        const place = places.find(p => p.id === tweet.geo?.place_id)
        return postProcessor.processTweet(tweet, user, place)
      })

      // Step 3: Group by restaurant
      const restaurants = postProcessor.groupByRestaurant(processedTweets)
      console.log(`🍽️  Discovered ${restaurants.length} potential restaurants`)

      // Step 4: Enrich with sentiment and location data
      const enrichedRestaurants = await this.enrichRestaurants(restaurants)

      // Step 5: Save to database
      let savedCount = 0
      for (const restaurant of enrichedRestaurants) {
        if (restaurant.lat && restaurant.lng) {
          await database.upsertRestaurant(restaurant)
          savedCount++
        }
      }

      this.stats.restaurantsDiscovered += savedCount
      this.lastRun = new Date()

      console.log(`✅ Crawl complete! Saved ${savedCount} restaurants`)

      return {
        success: true,
        tweetsProcessed: tweets.length,
        restaurantsDiscovered: restaurants.length,
        restaurantsSaved: savedCount,
        restaurants: enrichedRestaurants
      }
    } catch (error) {
      console.error('❌ Crawler error:', error.message)
      this.stats.lastError = error.message
      throw error
    } finally {
      this.isRunning = false
    }
  }

  /**
   * Enrich restaurant data with sentiment and geocoding
   */
  async enrichRestaurants(restaurants) {
    const enriched = []

    for (const restaurant of restaurants) {
      console.log(`🔍 Processing: ${restaurant.name}`)

      // Analyze sentiment
      const sentimentResult = sentimentAnalyzer.calculateSocialScore(restaurant.mentions)
      const phrases = sentimentAnalyzer.extractTopPhrases(restaurant.mentions, 3)

      // Get coordinates
      const bestLocation = restaurant.locations[0] || ''
      const geoResult = await geocoder.geocodeRestaurant(restaurant.name, bestLocation)

      if (!geoResult) {
        console.log(`⚠️  Could not geocode: ${restaurant.name}`)
        continue // Skip restaurants we can't locate
      }

      // Determine cuisine
      const cuisine = restaurant.cuisines.length > 0
        ? restaurant.cuisines[0].charAt(0).toUpperCase() + restaurant.cuisines[0].slice(1)
        : 'Restaurant'

      // Format social posts
      const socialPosts = restaurant.mentions.slice(0, 10).map(mention => ({
        platform: 'Twitter',
        author: `@${mention.author}`,
        date: new Date(mention.createdAt).toLocaleDateString(),
        content: mention.text,
        likes: mention.metrics.likes
      }))

      enriched.push({
        name: restaurant.name,
        cuisine: cuisine,
        lat: geoResult.lat,
        lng: geoResult.lng,
        address: geoResult.displayName,
        image: `https://source.unsplash.com/800x600/?${encodeURIComponent(cuisine + ' food')}`,
        socialScore: sentimentResult.socialScore,
        instagramMentions: 0, // Will be populated when Instagram integration is added
        facebookMentions: 0, // Will be populated when Facebook integration is added
        twitterMentions: restaurant.mentionCount,
        mentionCount: restaurant.mentionCount,
        topTags: restaurant.tags.slice(0, 5),
        socialPosts: socialPosts,
        sentimentBreakdown: {
          positive: sentimentResult.positiveMentions,
          neutral: sentimentResult.neutralMentions,
          negative: sentimentResult.negativeMentions
        },
        topPositivePhrases: phrases.topPositive,
        topNegativePhrases: phrases.topNegative,
        lastUpdated: new Date().toISOString()
      })
    }

    return enriched
  }

  /**
   * Demo mode - generates sample data when API is not available
   */
  async runDemoMode(query) {
    console.log('🎭 Running in demo mode - generating sample restaurant')

    const sampleRestaurant = {
      name: `${query} Demo Restaurant`,
      cuisine: 'American',
      lat: 40.7580 + (Math.random() - 0.5) * 0.1,
      lng: -73.9855 + (Math.random() - 0.5) * 0.1,
      address: 'New York, NY, USA',
      image: 'https://source.unsplash.com/800x600/?restaurant,food',
      socialScore: Math.floor(Math.random() * 500) + 500,
      twitterMentions: Math.floor(Math.random() * 50) + 10,
      instagramMentions: 0,
      facebookMentions: 0,
      mentionCount: Math.floor(Math.random() * 50) + 10,
      topTags: ['delicious', 'foodie', 'mustry'],
      socialPosts: [
        {
          platform: 'Twitter',
          author: '@foodie_demo',
          date: new Date().toLocaleDateString(),
          content: `Just discovered this amazing spot! The food is incredible. Highly recommend! #${query.replace(/\s+/g, '')}`
        }
      ]
    }

    await database.upsertRestaurant(sampleRestaurant)

    return {
      success: true,
      tweetsProcessed: 0,
      restaurantsDiscovered: 1,
      restaurantsSaved: 1,
      restaurants: [sampleRestaurant],
      demoMode: true
    }
  }

  /**
   * Get crawler statistics
   */
  getStats() {
    return {
      ...this.stats,
      lastRun: this.lastRun,
      isRunning: this.isRunning,
      twitterConfigured: !!this.twitterClient
    }
  }
}

export default new SocialMediaCrawler()

import axios from 'axios'

/**
 * Twitter API Client
 * Handles authentication and API calls to Twitter/X
 */
class TwitterClient {
  constructor(bearerToken) {
    this.bearerToken = bearerToken
    this.baseURL = 'https://api.twitter.com/2'
  }

  /**
   * Search for tweets about restaurants in a specific location
   * @param {string} query - Search query (e.g., "restaurant NYC", "best tacos")
   * @param {number} maxResults - Maximum number of tweets to return (10-100)
   */
  async searchTweets(query, maxResults = 50) {
    if (!this.bearerToken) {
      console.warn('Twitter API bearer token not configured')
      return { data: [], meta: {} }
    }

    try {
      const response = await axios.get(`${this.baseURL}/tweets/search/recent`, {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`
        },
        params: {
          query: `${query} (restaurant OR cafe OR food OR dining) -is:retweet lang:en`,
          max_results: maxResults,
          'tweet.fields': 'created_at,public_metrics,geo,entities',
          'expansions': 'author_id,geo.place_id',
          'user.fields': 'username,verified',
          'place.fields': 'full_name,geo'
        }
      })

      return {
        tweets: response.data.data || [],
        users: response.data.includes?.users || [],
        places: response.data.includes?.places || [],
        meta: response.data.meta || {}
      }
    } catch (error) {
      if (error.response?.status === 429) {
        console.error('Twitter API rate limit exceeded')
      } else if (error.response?.status === 401) {
        console.error('Twitter API authentication failed - check bearer token')
      } else {
        console.error('Twitter API error:', error.message)
      }
      return { tweets: [], users: [], places: [], meta: {} }
    }
  }

  /**
   * Search for tweets with specific hashtags
   */
  async searchHashtag(hashtag, location = '', maxResults = 50) {
    const query = location
      ? `#${hashtag} ${location}`
      : `#${hashtag}`
    return this.searchTweets(query, maxResults)
  }

  /**
   * Get trending food/restaurant topics
   */
  async getTrendingTopics() {
    // This would require elevated API access
    // For now, return common food hashtags to search
    return [
      'foodie',
      'restaurant',
      'dining',
      'brunch',
      'dinner',
      'lunch',
      'instafood',
      'foodporn',
      'eats'
    ]
  }
}

export default TwitterClient

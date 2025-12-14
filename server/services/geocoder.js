import axios from 'axios'

/**
 * Geocoding Service
 * Converts addresses and location names to coordinates
 */
class Geocoder {
  constructor() {
    // Using OpenStreetMap's Nominatim (free, no API key required)
    this.baseURL = 'https://nominatim.openstreetmap.org'
    this.cache = new Map()
  }

  /**
   * Geocode a location to coordinates
   * @param {string} location - Address or place name
   * @returns {Promise<{lat: number, lng: number, displayName: string} | null>}
   */
  async geocode(location) {
    if (!location || location.trim().length < 3) {
      return null
    }

    // Check cache first
    const cacheKey = location.toLowerCase().trim()
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      const response = await axios.get(`${this.baseURL}/search`, {
        params: {
          q: location,
          format: 'json',
          limit: 1,
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'SocialBite/1.0' // Required by Nominatim
        }
      })

      if (response.data && response.data.length > 0) {
        const result = response.data[0]
        const coordinates = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          displayName: result.display_name,
          address: {
            city: result.address?.city || result.address?.town || result.address?.village,
            state: result.address?.state,
            country: result.address?.country,
            countryCode: result.address?.country_code
          }
        }

        // Cache the result
        this.cache.set(cacheKey, coordinates)

        // Rate limiting - wait 1 second between requests
        await this.sleep(1000)

        return coordinates
      }

      return null
    } catch (error) {
      console.error('Geocoding error:', error.message)
      return null
    }
  }

  /**
   * Geocode a restaurant name with location
   */
  async geocodeRestaurant(restaurantName, location) {
    const fullQuery = location
      ? `${restaurantName}, ${location}`
      : restaurantName

    return this.geocode(fullQuery)
  }

  /**
   * Batch geocode multiple locations
   */
  async geocodeBatch(locations) {
    const results = []

    for (const location of locations) {
      const result = await this.geocode(location)
      if (result) {
        results.push({ location, ...result })
      }
    }

    return results
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(lat, lng) {
    try {
      const response = await axios.get(`${this.baseURL}/reverse`, {
        params: {
          lat,
          lon: lng,
          format: 'json',
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'SocialBite/1.0'
        }
      })

      if (response.data) {
        return {
          displayName: response.data.display_name,
          address: response.data.address
        }
      }

      return null
    } catch (error) {
      console.error('Reverse geocoding error:', error.message)
      return null
    }
  }

  /**
   * Get best location from multiple location hints
   */
  async getBestLocation(locations) {
    if (!locations || locations.length === 0) return null

    // Try each location until we get a valid result
    for (const location of locations) {
      const result = await this.geocode(location)
      if (result) {
        return result
      }
    }

    return null
  }

  /**
   * Sleep helper for rate limiting
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear()
  }
}

export default new Geocoder()

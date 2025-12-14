# SocialBite Crawler - Social Media Restaurant Discovery

## Overview

The SocialBite Crawler automatically discovers restaurants from social media platforms (Twitter, Instagram, Facebook) and adds them to your platform with real social buzz data.

## Features

- **Twitter Integration**: Fetches real tweets about restaurants
- **Sentiment Analysis**: Analyzes positive/negative sentiment
- **Auto-Geocoding**: Automatically finds restaurant coordinates
- **Social Scoring**: Ranks restaurants by engagement and buzz
- **Database Storage**: Persists discovered restaurants

## Architecture

```
├── services/
│   ├── twitter-client.js      # Twitter API integration
│   ├── post-processor.js      # Extract restaurant data from posts
│   ├── sentiment-analyzer.js  # Analyze sentiment & calculate scores
│   └── geocoder.js            # Convert locations to coordinates
├── database.js                 # JSON database (can upgrade to MongoDB)
└── crawler.js                  # Main orchestrator
```

## Setup

### 1. Get Twitter API Credentials (Free Tier)

1. Go to https://developer.twitter.com
2. Sign up for a developer account
3. Create a new app
4. Get your **Bearer Token**

### 2. Add Environment Variable

Add to your Render environment variables:

```
TWITTER_BEARER_TOKEN=your_bearer_token_here
```

### 3. Run the Crawler

The crawler can run in two modes:

**With Twitter API** (real data):
```bash
POST /api/crawler/run
{
  "query": "best tacos NYC",
  "maxResults": 50
}
```

**Demo Mode** (without API):
- Automatically runs if no Twitter token is configured
- Generates sample restaurant data

## API Endpoints

### Crawler Control

**Run Crawler**
```
POST /api/crawler/run
Body: { "query": "restaurant NYC", "maxResults": 50 }
```

**Get Crawler Stats**
```
GET /api/crawler/stats
```

**Check Crawler Status**
```
GET /api/crawler/status
```

### Database

**Get Stats**
```
GET /api/database/stats
```

**Get Top Restaurants**
```
GET /api/database/top?limit=10
```

## How It Works

1. **Fetch**: Gets tweets mentioning restaurants
2. **Extract**: Identifies restaurant names, locations, cuisine types
3. **Analyze**: Calculates sentiment scores and engagement
4. **Geocode**: Finds exact coordinates for mapping
5. **Store**: Saves to database with all social data

## Data Structure

Each discovered restaurant includes:

```javascript
{
  name: "Restaurant Name",
  cuisine: "Italian",
  lat: 40.7580,
  lng: -73.9855,
  address: "123 Main St, NYC",
  socialScore: 850,
  twitterMentions: 45,
  mentionCount: 45,
  topTags: ["italian", "pasta", "romantic"],
  socialPosts: [
    {
      platform: "Twitter",
      author: "@foodie",
      date: "2025-12-14",
      content: "Amazing pasta!",
      likes: 234
    }
  ],
  sentimentBreakdown: {
    positive: 38,
    neutral: 5,
    negative: 2
  }
}
```

## Adding More Social Platforms

### Instagram (Coming Soon)
1. Get Instagram Graph API access
2. Add `instagram-client.js`
3. Update crawler to fetch Instagram posts

### Facebook (Coming Soon)
1. Get Facebook Graph API access
2. Add `facebook-client.js`
3. Update crawler aggregation

## Rate Limits

- **Twitter Free Tier**: 50,000 tweets/month
- **Geocoding (Nominatim)**: 1 request/second
- **Recommended**: Run crawler 1-2 times per day

## Scheduled Crawling

To run automatically, add to `server/index.js`:

```javascript
import cron from 'node-cron'

// Run every 6 hours
cron.schedule('0 */6 * * *', async () => {
  await crawler.crawl('restaurant NYC')
})
```

## Troubleshooting

**"Twitter API authentication failed"**
- Check your bearer token is correct
- Make sure environment variable is set

**"Could not geocode restaurant"**
- Restaurant name might be unclear
- Try crawling with more specific locations

**"No tweets found"**
- Query might be too specific
- Try broader terms like "restaurant" + location

## Future Enhancements

- [ ] Instagram integration
- [ ] Facebook integration
- [ ] TikTok integration
- [ ] Real-time streaming
- [ ] Image analysis for food photos
- [ ] Automatic menu extraction
- [ ] Price range detection
- [ ] Opening hours from posts
- [ ] Reservation link detection

## License

MIT

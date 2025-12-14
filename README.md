# SocialBite Platform

A real restaurant discovery platform powered by social media recommendations.

## Features

- **Natural Language Search**: Ask for restaurants in plain language like "best tacos near me" or "romantic Italian restaurant downtown"
- **Interactive Map**: View all restaurant locations on an interactive map with markers
- **Social Media Integration**: See real social media posts and mentions from Instagram, Facebook, and more
- **Restaurant Details**: Click any restaurant to see detailed information including social buzz, tags, and recent posts
- **Smart Filtering**: Advanced search algorithm that understands context and preferences

## Tech Stack

### Frontend
- React 18
- Vite (fast build tool)
- Leaflet (interactive maps)
- CSS3 with CSS Variables

### Backend
- Express.js
- Node.js
- REST API

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server (runs both frontend and backend):
```bash
npm run dev
```

This will start:
- Frontend on http://localhost:3000
- Backend API on http://localhost:3001

### Building for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
/src
  /components      - React components
    - SearchBar.jsx
    - Map.jsx
    - RestaurantList.jsx
    - RestaurantCard.jsx
    - RestaurantDetail.jsx
  - App.jsx        - Main application component
  - main.jsx       - Entry point
  - index.css      - Global styles

/server
  - index.js       - Express server
  - data.js        - Mock restaurant data
  - searchEngine.js - Natural language search logic

/public            - Static assets
```

## How It Works

1. **Search**: Users enter natural language queries
2. **Processing**: The search engine analyzes the query and matches it against restaurant data
3. **Ranking**: Results are ranked by relevance and social score
4. **Display**: Restaurants appear on the map and in the sidebar
5. **Details**: Users can click any restaurant to see full details and social posts

## API Endpoints

- `GET /api/search?q={query}` - Search restaurants
- `GET /api/restaurants/:id` - Get restaurant details

## Future Enhancements

- Real social media API integration (Instagram Graph API, Facebook API)
- User authentication and saved favorites
- User reviews and ratings
- Real-time social media data updates
- Mobile app
- Advanced filters (price range, distance, dietary restrictions)
- Reservation integration

## License

MIT

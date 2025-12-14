import { useState, useEffect } from 'react'
import './App.css'
import SearchBar from './components/SearchBar'
import Map from './components/Map'
import RestaurantList from './components/RestaurantList'
import RestaurantDetail from './components/RestaurantDetail'

function App() {
  const [restaurants, setRestaurants] = useState([])
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = async (query) => {
    setLoading(true)
    setSearchQuery(query)

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setRestaurants(data.restaurants || [])
    } catch (error) {
      console.error('Search failed:', error)
      setRestaurants([])
    } finally {
      setLoading(false)
    }
  }

  const handleRestaurantClick = (restaurant) => {
    setSelectedRestaurant(restaurant)
  }

  const handleCloseDetail = () => {
    setSelectedRestaurant(null)
  }

  // Load initial restaurants
  useEffect(() => {
    handleSearch('popular restaurants near me')
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <h1>🍽️ SocialBite</h1>
          <p className="tagline">Discover restaurants people actually love</p>
        </div>
      </header>

      <div className="search-container">
        <SearchBar onSearch={handleSearch} loading={loading} />
      </div>

      <div className="main-content">
        <div className="map-section">
          <Map
            restaurants={restaurants}
            selectedRestaurant={selectedRestaurant}
            onRestaurantClick={handleRestaurantClick}
          />
        </div>

        <div className="sidebar">
          <RestaurantList
            restaurants={restaurants}
            onRestaurantClick={handleRestaurantClick}
            selectedRestaurant={selectedRestaurant}
            loading={loading}
            searchQuery={searchQuery}
          />
        </div>
      </div>

      {selectedRestaurant && (
        <RestaurantDetail
          restaurant={selectedRestaurant}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  )
}

export default App

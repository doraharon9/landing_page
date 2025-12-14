import RestaurantCard from './RestaurantCard'
import './RestaurantList.css'

function RestaurantList({ restaurants, onRestaurantClick, selectedRestaurant, loading, searchQuery }) {
  if (loading) {
    return (
      <div className="restaurant-list">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Scanning social media for the best spots...</p>
        </div>
      </div>
    )
  }

  if (restaurants.length === 0) {
    return (
      <div className="restaurant-list">
        <div className="empty-state">
          <h3>No restaurants found</h3>
          <p>Try a different search query</p>
        </div>
      </div>
    )
  }

  return (
    <div className="restaurant-list">
      <div className="list-header">
        <h2>Found {restaurants.length} restaurants</h2>
        {searchQuery && <p className="search-info">for "{searchQuery}"</p>}
      </div>

      <div className="restaurant-cards">
        {restaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            onClick={() => onRestaurantClick(restaurant)}
            isSelected={selectedRestaurant?.id === restaurant.id}
          />
        ))}
      </div>
    </div>
  )
}

export default RestaurantList

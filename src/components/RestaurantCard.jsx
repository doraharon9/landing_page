import './RestaurantCard.css'

function RestaurantCard({ restaurant, onClick, isSelected }) {
  return (
    <div
      className={`restaurant-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="card-image">
        <img src={restaurant.image} alt={restaurant.name} />
        <div className="social-badge">
          🔥 {restaurant.socialScore}
        </div>
      </div>

      <div className="card-content">
        <h3 className="restaurant-name">{restaurant.name}</h3>
        <p className="restaurant-cuisine">{restaurant.cuisine}</p>
        <p className="restaurant-address">{restaurant.address}</p>

        <div className="card-stats">
          <div className="stat">
            <span className="stat-icon">📸</span>
            <span>{restaurant.instagramMentions} Instagram</span>
          </div>
          <div className="stat">
            <span className="stat-icon">💬</span>
            <span>{restaurant.facebookMentions} Facebook</span>
          </div>
        </div>

        {restaurant.topTags && restaurant.topTags.length > 0 && (
          <div className="card-tags">
            {restaurant.topTags.map((tag, index) => (
              <span key={index} className="tag">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default RestaurantCard

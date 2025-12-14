import './RestaurantDetail.css'

function RestaurantDetail({ restaurant, onClose }) {
  return (
    <div className="restaurant-detail-overlay" onClick={onClose}>
      <div className="restaurant-detail" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>

        <div className="detail-hero">
          <img src={restaurant.image} alt={restaurant.name} />
          <div className="hero-overlay">
            <h1>{restaurant.name}</h1>
            <p className="cuisine">{restaurant.cuisine}</p>
          </div>
        </div>

        <div className="detail-content">
          <div className="info-section">
            <h2>📍 Location</h2>
            <p>{restaurant.address}</p>
          </div>

          <div className="info-section">
            <h2>🔥 Social Buzz</h2>
            <div className="social-stats">
              <div className="stat-large">
                <div className="stat-number">{restaurant.socialScore}</div>
                <div className="stat-label">Total Mentions</div>
              </div>
              <div className="stat-large">
                <div className="stat-number">{restaurant.instagramMentions}</div>
                <div className="stat-label">Instagram Posts</div>
              </div>
              <div className="stat-large">
                <div className="stat-number">{restaurant.facebookMentions}</div>
                <div className="stat-label">Facebook Posts</div>
              </div>
            </div>
          </div>

          {restaurant.topTags && restaurant.topTags.length > 0 && (
            <div className="info-section">
              <h2>🏷️ Popular Tags</h2>
              <div className="tags-large">
                {restaurant.topTags.map((tag, index) => (
                  <span key={index} className="tag-large">#{tag}</span>
                ))}
              </div>
            </div>
          )}

          {restaurant.socialPosts && restaurant.socialPosts.length > 0 && (
            <div className="info-section">
              <h2>💬 Recent Social Posts</h2>
              <div className="social-posts">
                {restaurant.socialPosts.map((post, index) => (
                  <div key={index} className="social-post">
                    <div className="post-header">
                      <span className="post-platform">{post.platform}</span>
                      <span className="post-date">{post.date}</span>
                    </div>
                    <p className="post-content">{post.content}</p>
                    <div className="post-author">— {post.author}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RestaurantDetail

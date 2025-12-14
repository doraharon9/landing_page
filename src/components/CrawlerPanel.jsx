import { useState } from 'react'
import './CrawlerPanel.css'

function CrawlerPanel() {
  const [query, setQuery] = useState('best pizza NYC')
  const [maxResults, setMaxResults] = useState(20)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState(null)

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/crawler/status')
      const data = await response.json()
      setStatus(data)
    } catch (err) {
      console.error('Failed to check status:', err)
    }
  }

  const runCrawler = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/crawler/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, maxResults })
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Failed to run crawler')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="crawler-panel">
      <h2>🤖 Social Media Crawler</h2>

      <div className="status-section">
        <button onClick={checkStatus} className="status-button">
          Check Status
        </button>
        {status && (
          <div className="status-info">
            <p>✅ Twitter Configured: {status.twitterConfigured ? 'Yes' : 'No'}</p>
            <p>🔄 Running: {status.isRunning ? 'Yes' : 'No'}</p>
            <p>🕐 Last Run: {status.lastRun || 'Never'}</p>
          </div>
        )}
      </div>

      <div className="crawler-form">
        <div className="form-group">
          <label>Search Query:</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., best tacos NYC"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Max Results:</label>
          <input
            type="number"
            value={maxResults}
            onChange={(e) => setMaxResults(parseInt(e.target.value))}
            min="10"
            max="100"
            disabled={loading}
          />
        </div>

        <button
          onClick={runCrawler}
          disabled={loading || !query}
          className="run-button"
        >
          {loading ? '🔄 Crawling...' : '🚀 Run Crawler'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {result && (
        <div className="result-section">
          <h3>✅ Crawler Results</h3>
          <div className="result-stats">
            <div className="stat">
              <span className="stat-label">Tweets Processed:</span>
              <span className="stat-value">{result.tweetsProcessed}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Restaurants Discovered:</span>
              <span className="stat-value">{result.restaurantsDiscovered}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Restaurants Saved:</span>
              <span className="stat-value">{result.restaurantsSaved}</span>
            </div>
          </div>

          {result.demoMode && (
            <div className="demo-notice">
              ℹ️ Running in demo mode (no Twitter API data available)
            </div>
          )}

          {result.restaurants && result.restaurants.length > 0 && (
            <div className="restaurants-list">
              <h4>Discovered Restaurants:</h4>
              {result.restaurants.map((restaurant, index) => (
                <div key={index} className="restaurant-item">
                  <h5>{restaurant.name}</h5>
                  <p>📍 {restaurant.address}</p>
                  <p>🔥 Social Score: {restaurant.socialScore}</p>
                  <p>💬 {restaurant.mentionCount} mentions</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CrawlerPanel

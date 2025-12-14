import { useEffect, useRef } from 'react'
import L from 'leaflet'
import './Map.css'

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function Map({ restaurants, selectedRestaurant, onRestaurantClick }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([40.7128, -74.0060], 13)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current)
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    if (restaurants.length === 0) return

    // Add markers for each restaurant
    const bounds = []
    restaurants.forEach(restaurant => {
      const marker = L.marker([restaurant.lat, restaurant.lng])
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div class="map-popup">
            <h3>${restaurant.name}</h3>
            <p>${restaurant.cuisine}</p>
            <p class="social-score">🔥 ${restaurant.socialScore} social mentions</p>
          </div>
        `)
        .on('click', () => onRestaurantClick(restaurant))

      markersRef.current.push(marker)
      bounds.push([restaurant.lat, restaurant.lng])
    })

    // Fit map to show all markers
    if (bounds.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [restaurants, onRestaurantClick])

  useEffect(() => {
    if (!mapInstanceRef.current || !selectedRestaurant) return

    // Pan to selected restaurant
    mapInstanceRef.current.setView(
      [selectedRestaurant.lat, selectedRestaurant.lng],
      16,
      { animate: true }
    )
  }, [selectedRestaurant])

  return <div ref={mapRef} className="map" />
}

export default Map

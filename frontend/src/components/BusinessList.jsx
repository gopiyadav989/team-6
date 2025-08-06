import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function BusinessList({ user, token }) {
  const [businesses, setBusinesses] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    fetchBusinesses()
  }, [search, category])

  const fetchBusinesses = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (category) params.append('category', category)
      
      const response = await fetch(`http://localhost:3001/api/businesses?${params}`)
      const data = await response.json()
      setBusinesses(data)
    } catch (error) {
      console.error('Error fetching businesses:', error)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Local Businesses</h2>
        
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search businesses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Categories</option>
            <option value="Restaurant">Restaurant</option>
            <option value="Cafe">Cafe</option>
            <option value="Service">Service</option>
            <option value="Shop">Shop</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businesses.map((business) => (
          <div key={business.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={business.imageUrl || 'https://via.placeholder.com/400x200'}
              alt={business.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{business.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{business.description}</p>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">{business.category}</span>
                <span className="text-sm text-gray-500">{business.location}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-yellow-500">★</span>
                  <span className="ml-1 text-sm">
                    {business.averageRating || 'No ratings'} ({business.reviewCount || 0} reviews)
                  </span>
                </div>
                <Link
                  to={`/business/${business.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
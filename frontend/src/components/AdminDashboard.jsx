import { useState, useEffect } from 'react'

export default function AdminDashboard({ token }) {
  const [pendingReviews, setPendingReviews] = useState([])
  const [showAddBusiness, setShowAddBusiness] = useState(false)
  const [businessForm, setBusinessForm] = useState({
    name: '',
    description: '',
    category: '',
    location: '',
    imageUrl: ''
  })

  useEffect(() => {
    fetchPendingReviews()
  }, [])

  const fetchPendingReviews = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/reviews', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setPendingReviews(data)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }

  const handleReviewAction = async (reviewId, status) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        fetchPendingReviews()
      }
    } catch (error) {
      console.error('Error updating review:', error)
    }
  }

  const addBusiness = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:3001/api/admin/businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(businessForm)
      })

      if (response.ok) {
        setShowAddBusiness(false)
        setBusinessForm({
          name: '',
          description: '',
          category: '',
          location: '',
          imageUrl: ''
        })
        alert('Business added successfully!')
      }
    } catch (error) {
      console.error('Error adding business:', error)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => setShowAddBusiness(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add Business
        </button>
      </div>

      {showAddBusiness && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Add New Business</h3>
          <form onSubmit={addBusiness}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={businessForm.name}
                  onChange={(e) => setBusinessForm({...businessForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  required
                  value={businessForm.category}
                  onChange={(e) => setBusinessForm({...businessForm, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Category</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Cafe">Cafe</option>
                  <option value="Service">Service</option>
                  <option value="Shop">Shop</option>
                </select>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={businessForm.description}
                onChange={(e) => setBusinessForm({...businessForm, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows="3"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  required
                  value={businessForm.location}
                  onChange={(e) => setBusinessForm({...businessForm, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Image URL</label>
                <input
                  type="url"
                  value={businessForm.imageUrl}
                  onChange={(e) => setBusinessForm({...businessForm, imageUrl: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Add Business
              </button>
              <button
                type="button"
                onClick={() => setShowAddBusiness(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Pending Reviews ({pendingReviews.length})</h2>
        </div>
        
        {pendingReviews.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No pending reviews
          </div>
        ) : (
          <div className="divide-y">
            {pendingReviews.map((review) => (
              <div key={review.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold">{review.business.name}</h3>
                    <p className="text-sm text-gray-600">by {review.user.name} ({review.user.email})</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-yellow-500">★</span>
                    <span className="ml-1">{review.overallRating}/5</span>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4">{review.content}</p>
                
                <div className="text-sm text-gray-500 mb-4">
                  Quality: {review.qualityRating}/5 | 
                  Service: {review.serviceRating}/5 | 
                  Value: {review.valueRating}/5
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReviewAction(review.id, 'APPROVED')}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReviewAction(review.id, 'REJECTED')}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
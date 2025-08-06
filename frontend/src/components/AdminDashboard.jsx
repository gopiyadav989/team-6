import { useState, useEffect } from 'react'

export default function AdminDashboard({ token }) {
  const [pendingReviews, setPendingReviews] = useState([])
  const [showAddBusiness, setShowAddBusiness] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [processingReview, setProcessingReview] = useState(null)
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
      setLoading(true)
      const response = await fetch('http://localhost:3001/api/admin/reviews', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setPendingReviews(data)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReviewAction = async (reviewId, status) => {
    try {
      setProcessingReview(reviewId)
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
    } finally {
      setProcessingReview(null)
    }
  }

  const addBusiness = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
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
    } finally {
      setSubmitting(false)
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
                disabled={submitting}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submitting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                {submitting ? 'Adding...' : 'Add Business'}
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
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading reviews...</span>
          </div>
        ) : pendingReviews.length === 0 ? (
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
                    disabled={processingReview === review.id}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {processingReview === review.id && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => handleReviewAction(review.id, 'REJECTED')}
                    disabled={processingReview === review.id}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {processingReview === review.id && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
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
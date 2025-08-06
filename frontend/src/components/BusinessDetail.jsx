import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

export default function BusinessDetail({ user, token }) {
  const { id } = useParams()
  const [business, setBusiness] = useState(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    content: '',
    qualityRating: 5,
    serviceRating: 5,
    valueRating: 5,
    overallRating: 5
  })

  useEffect(() => {
    fetchBusiness()
  }, [id])

  const fetchBusiness = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/businesses/${id}`)
      const data = await response.json()
      setBusiness(data)
    } catch (error) {
      console.error('Error fetching business:', error)
    }
  }

  const submitReview = async (e) => {
    e.preventDefault()
    if (!token) return

    try {
      const response = await fetch('http://localhost:3001/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...reviewForm,
          businessId: id
        })
      })

      if (response.ok) {
        setShowReviewForm(false)
        setReviewForm({
          content: '',
          qualityRating: 5,
          serviceRating: 5,
          valueRating: 5,
          overallRating: 5
        })
        alert('Review submitted for approval!')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
    }
  }

  if (!business) return <div className="p-8">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <img
          src={business.imageUrl || 'https://via.placeholder.com/800x300'}
          alt={business.name}
          className="w-full h-64 object-cover"
        />
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">{business.name}</h1>
          <p className="text-gray-600 mb-4">{business.description}</p>
          <div className="flex justify-between items-center">
            <div>
              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mr-2">
                {business.category}
              </span>
              <span className="text-gray-500">{business.location}</span>
            </div>
            {user && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Write Review
              </button>
            )}
          </div>
        </div>
      </div>

      {showReviewForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
          <form onSubmit={submitReview}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Review Content</label>
              <textarea
                value={reviewForm.content}
                onChange={(e) => setReviewForm({...reviewForm, content: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows="4"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Quality</label>
                <select
                  value={reviewForm.qualityRating}
                  onChange={(e) => setReviewForm({...reviewForm, qualityRating: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Star</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Service</label>
                <select
                  value={reviewForm.serviceRating}
                  onChange={(e) => setReviewForm({...reviewForm, serviceRating: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Star</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Value</label>
                <select
                  value={reviewForm.valueRating}
                  onChange={(e) => setReviewForm({...reviewForm, valueRating: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Star</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Overall</label>
                <select
                  value={reviewForm.overallRating}
                  onChange={(e) => setReviewForm({...reviewForm, overallRating: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Star</option>)}
                </select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Submit Review
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Reviews</h3>
        {business.reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {business.reviews.map((review) => (
              <div key={review.id} className="border-b pb-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{review.user.name}</h4>
                  <div className="flex items-center">
                    <span className="text-yellow-500">★</span>
                    <span className="ml-1 text-sm">{review.overallRating}/5</span>
                  </div>
                </div>
                <p className="text-gray-600 mb-2">{review.content}</p>
                <div className="text-xs text-gray-500">
                  Quality: {review.qualityRating}/5 | 
                  Service: {review.serviceRating}/5 | 
                  Value: {review.valueRating}/5
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
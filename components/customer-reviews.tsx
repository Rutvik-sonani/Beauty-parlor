"use client"

import { useState, useEffect, useMemo } from "react"
import { useSupabaseData } from "@/contexts/supabase-data-context"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search, Star, Eye, EyeOff, Trash2, Edit, MessageSquare, Clock } from "lucide-react"

export function CustomerReviews() {
  const { reviews, customers, services, addReview, updateReview, deleteReview, loading, syncing } = useSupabaseData()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sourceFilter, setSourceFilter] = useState("all")

  const [isAddingReview, setIsAddingReview] = useState(false)
  const [editingReview, setEditingReview] = useState<any>(null)
  const [respondingTo, setRespondingTo] = useState<any>(null)

  const [reviewForm, setReviewForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    service: "",
    rating: 5,
    comment: "",
  })

  const [responseForm, setResponseForm] = useState("")

  const serviceOptions = [
    "Hair Cut & Style",
    "Facial Treatment",
    "Manicure & Pedicure",
    "Bridal Makeup",
    "Body Massage",
    "Hair Coloring",
    "Hair Styling Course",
    "Facial Treatment Course",
    "Bridal Makeup Course",
  ]

  // Helper functions to get names from IDs
  const getCustomerName = (customerId: number) => {
    const customer = customers.find(c => c.id === customerId)
    return customer ? customer.name : 'Unknown Customer'
  }

  const getCustomerEmail = (customerId: number) => {
    const customer = customers.find(c => c.id === customerId)
    return customer ? customer.email : ''
  }

  const getCustomerPhone = (customerId: number) => {
    const customer = customers.find(c => c.id === customerId)
    return customer ? customer.phone : ''
  }

  const getServiceName = (serviceId: number | null) => {
    if (!serviceId) return 'General Feedback'
    const service = services.find(s => s.id === serviceId)
    return service ? service.name : 'Unknown Service'
  }

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const customerName = getCustomerName(review.customer_id)
      const serviceName = getServiceName(review.service_id)
      const matchesSearch =
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || review.status.toLowerCase() === statusFilter
      const matchesSource = sourceFilter === "all" || review.source === sourceFilter
      return matchesSearch && matchesStatus && matchesSource
    })
  }, [reviews, customers, services, searchTerm, statusFilter, sourceFilter])

  const handleAddReview = async () => {
    if (!reviewForm.customerName || !reviewForm.service || !reviewForm.comment) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      // Find customer by name
      const customer = customers.find(c => c.name === reviewForm.customerName)
      if (!customer) {
        toast.error('Customer not found')
        return
      }

      // Find service by name
      const service = services.find(s => s.name === reviewForm.service)
      if (!service) {
        toast.error('Service not found')
        return
      }

      await addReview({
        customer_id: customer.id,
        service_id: service.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        status: "Published",
        response: null,
        date: new Date().toISOString().split('T')[0],
        source: "Admin Created"
      })
      
      setReviewForm({
        customerName: "",
        email: "",
        phone: "",
        service: "",
        rating: 5,
        comment: "",
      })
      setIsAddingReview(false)
      toast.success('Review added successfully!')
    } catch (error) {
      console.error('Error adding review:', error)
      toast.error('Failed to add review')
    }
  }

  const handleEditReview = async () => {
    if (!editingReview || !reviewForm.customerName || !reviewForm.service || !reviewForm.comment) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      // Find customer by name
      const customer = customers.find(c => c.name === reviewForm.customerName)
      if (!customer) {
        toast.error('Customer not found')
        return
      }

      // Find service by name
      const service = services.find(s => s.name === reviewForm.service)
      if (!service) {
        toast.error('Service not found')
        return
      }

      await updateReview(editingReview.id, {
        customer_id: customer.id,
        service_id: service.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      })
      
      setEditingReview(null)
      setReviewForm({
        customerName: "",
        email: "",
        phone: "",
        service: "",
        rating: 5,
        comment: "",
      })
      toast.success('Review updated successfully!')
    } catch (error) {
      console.error('Error updating review:', error)
      toast.error('Failed to update review')
    }
  }

  const handleDeleteReview = async (id: number) => {
    try {
      await deleteReview(id)
      toast.success('Review deleted successfully!')
    } catch (error) {
      console.error('Error deleting review:', error)
      toast.error('Failed to delete review')
    }
  }

  const toggleReviewVisibility = async (id: number) => {
    try {
      const review = reviews.find(r => r.id === id)
      if (!review) return

      const newStatus = review.status === "Published" ? "Hidden" : "Published"
      await updateReview(id, { status: newStatus })
      toast.success(`Review ${newStatus.toLowerCase()} successfully!`)
    } catch (error) {
      console.error('Error toggling review visibility:', error)
      toast.error('Failed to update review status')
    }
  }

  const approveReview = async (id: number) => {
    try {
      await updateReview(id, { status: "Published" })
      toast.success('Review approved successfully!')
    } catch (error) {
      console.error('Error approving review:', error)
      toast.error('Failed to approve review')
    }
  }

  const handleResponse = async (reviewId: number) => {
    if (!responseForm.trim()) {
      toast.error('Please enter a response')
      return
    }

    try {
      await updateReview(reviewId, { response: responseForm })
      setResponseForm("")
      setRespondingTo(null)
      toast.success('Response added successfully!')
    } catch (error) {
      console.error('Error adding response:', error)
      toast.error('Failed to add response')
    }
  }

  const startEdit = (review: any) => {
    setEditingReview(review)
    setReviewForm({
      customerName: getCustomerName(review.customer_id),
      email: getCustomerEmail(review.customer_id) || '',
      phone: getCustomerPhone(review.customer_id) || '',
      service: getServiceName(review.service_id),
      rating: review.rating,
      comment: review.comment,
    })
  }

  const startResponse = (review: any) => {
    setRespondingTo(review)
    setResponseForm(review.response || "")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Published":
        return "bg-green-100 text-green-700"
      case "Pending":
        return "bg-yellow-100 text-yellow-700"
      case "Hidden":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getSourceColor = (source: string) => {
    switch (source) {
      case "Website Feedback":
        return "bg-blue-100 text-blue-700"
      case "Direct Review":
        return "bg-purple-100 text-purple-700"
      case "Admin Created":
        return "bg-green-100 text-green-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const averageRating =
    reviews.length > 0 ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : "0.0"

  const pendingCount = reviews.filter((r) => r.status === "Pending").length
  const websiteFeedbackCount = reviews.filter((r) => r.source === "Website Feedback").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Customer Reviews & Feedback</h1>
          <p className="text-gray-600">Manage customer feedback, reviews, and testimonials</p>
        </div>
        <Dialog
          open={isAddingReview || !!editingReview}
          onOpenChange={(open) => {
            if (!open) {
              setIsAddingReview(false)
              setEditingReview(null)
              setReviewForm({
                customerName: "",
                email: "",
                phone: "",
                service: "",
                rating: 5,
                comment: "",
              })
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
              onClick={() => setIsAddingReview(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Review
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingReview ? "Edit Review" : "Add New Review"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={reviewForm.customerName}
                    onChange={(e) => setReviewForm({ ...reviewForm, customerName: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={reviewForm.email}
                    onChange={(e) => setReviewForm({ ...reviewForm, email: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={reviewForm.phone}
                    onChange={(e) => setReviewForm({ ...reviewForm, phone: e.target.value })}
                    className="rounded-xl"
                  />
                </div>

              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service">Service</Label>
                  <Select
                    value={reviewForm.service}
                    onValueChange={(value) => setReviewForm({ ...reviewForm, service: value })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceOptions.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating</Label>
                  <Select
                    value={reviewForm.rating.toString()}
                    onValueChange={(value) => setReviewForm({ ...reviewForm, rating: Number.parseInt(value) })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <SelectItem key={rating} value={rating.toString()}>
                          <div className="flex items-center gap-1">
                            {[...Array(rating)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 text-yellow-500 fill-current" />
                            ))}
                            <span className="ml-1">
                              {rating} Star{rating !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment">Review Comment</Label>
                <Textarea
                  id="comment"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="rounded-xl"
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={editingReview ? handleEditReview : handleAddReview}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl"
                >
                  {editingReview ? "Update Review" : "Add Review"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingReview(false)
                    setEditingReview(null)
                    setReviewForm({
                      customerName: "",
                      email: "",
                      phone: "",
                      service: "",
                      rating: 5,
                      comment: "",
                    })
                  }}
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="rounded-2xl border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-pink-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{averageRating}</p>
                <p className="text-sm text-gray-600">Average Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-green-100 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Eye className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {reviews.filter((r) => r.status === "Published").length}
                </p>
                <p className="text-sm text-gray-600">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-yellow-100 bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{pendingCount}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{websiteFeedbackCount}</p>
                <p className="text-sm text-gray-600">Website Feedback</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-purple-100 bg-gradient-to-br from-purple-50 to-violet-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{reviews.length}</p>
                <p className="text-sm text-gray-600">Total Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl border-pink-200"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 rounded-xl border-pink-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="hidden">Hidden</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-48 rounded-xl border-pink-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="Website Feedback">Website Feedback</SelectItem>
            <SelectItem value="Direct Review">Direct Review</SelectItem>
            <SelectItem value="Admin Created">Admin Created</SelectItem>
          </SelectContent>
        </Select>

      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <Card key={review.id} className="rounded-2xl border-pink-100">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`/placeholder.svg?height=48&width=48`} />
                    <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white">
                      {getCustomerName(review.customer_id)
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-800">{getCustomerName(review.customer_id)}</h4>
                      <Badge className={getStatusColor(review.status)}>{review.status}</Badge>
                      <div className="flex items-center gap-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {getServiceName(review.service_id)} • {review.date} • {getCustomerEmail(review.customer_id)} • {getCustomerPhone(review.customer_id)}
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getSourceColor(review.source)}>{review.source}</Badge>
                    </div>
                    <p className="text-gray-700 mb-3">{review.comment}</p>

                    {review.response && (
                      <div className="bg-gray-50 rounded-lg p-3 mt-3">
                        <p className="text-sm font-medium text-gray-800 mb-1">Our Response:</p>
                        <p className="text-sm text-gray-600">{review.response}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {review.status === "Pending" && (
                    <Button
                      size="sm"
                      onClick={() => approveReview(review.id)}
                      className="bg-green-600 hover:bg-green-700 rounded-lg"
                    >
                      Approve
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => startResponse(review)} className="rounded-lg">
                    <MessageSquare className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleReviewVisibility(review.id)}
                    className="rounded-lg"
                  >
                    {review.status === "Published" ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => startEdit(review)} className="rounded-lg">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteReview(review.id)}
                    className="rounded-lg border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No reviews found matching your criteria.</p>
        </div>
      )}

      {/* Response Dialog */}
      <Dialog open={!!respondingTo} onOpenChange={(open) => !open && setRespondingTo(null)}>
        <DialogContent className="rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle>Respond to Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-800 mb-1">{respondingTo?.customerName}</p>
              <p className="text-sm text-gray-600">{respondingTo?.comment}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="response">Your Response</Label>
              <Textarea
                id="response"
                value={responseForm}
                onChange={(e) => setResponseForm(e.target.value)}
                placeholder="Write your response to this review..."
                className="rounded-xl"
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleResponse(respondingTo?.id)}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl"
              >
                Send Response
              </Button>
              <Button variant="outline" onClick={() => setRespondingTo(null)} className="flex-1 rounded-xl">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

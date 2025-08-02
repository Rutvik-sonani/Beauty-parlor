"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSupabaseData } from "@/contexts/supabase-data-context"
import { toast } from "sonner"
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Star,
  GraduationCap,
  MessageCircle,
  Award,
  Users,
  Heart,
  CheckCircle,
  ShoppingBag,
  Package,
  FileText,
  Send,
  Gift,
  Crown,
  Shield,
  Truck,
  RefreshCw,
  X,
  Cookie,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

interface CustomerWebsiteProps {
  onAdminLogin: () => void
}

export function CustomerWebsite({ onAdminLogin }: CustomerWebsiteProps) {
  const { services = [], loading } = useSupabaseData()

  // Mock data for products, packages, courses until they're implemented in Supabase
  const products: any[] = []
  const packages: any[] = []
  const courses: any[] = []
  const [selectedService, setSelectedService] = useState("")
  const [selectedStaff, setSelectedStaff] = useState("")
  const [bookingStep, setBookingStep] = useState(1)
  const [currentPage, setCurrentPage] = useState("home")
  const [feedbackForm, setFeedbackForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    rating: 5,
    feedback: "",
  })

  const staff = [
    {
      id: 1,
      name: "Emma Wilson",
      role: "Senior Hair Stylist",
      specialization: ["Hair Cut", "Hair Color", "Hair Treatment"],
      experience: "8 years",
      rating: 4.9,
      image: "/placeholder.svg?height=150&width=150",
    },
    {
      id: 2,
      name: "Sophia Brown",
      role: "Facial Specialist",
      specialization: ["Facial Treatment", "Skin Care", "Anti-Aging"],
      experience: "6 years",
      rating: 4.8,
      image: "/placeholder.svg?height=150&width=150",
    },
    {
      id: 3,
      name: "Olivia Taylor",
      role: "Nail Technician",
      specialization: ["Manicure", "Pedicure", "Nail Art"],
      experience: "4 years",
      rating: 4.7,
      image: "/placeholder.svg?height=150&width=150",
    },
    {
      id: 4,
      name: "Isabella Garcia",
      role: "Makeup Artist",
      specialization: ["Bridal Makeup", "Party Makeup", "Photoshoot"],
      experience: "10 years",
      rating: 4.9,
      image: "/placeholder.svg?height=150&width=150",
    },
  ]

  const whyChooseUs = [
    {
      icon: Award,
      title: "15+ Years Experience",
      description: "Trusted by thousands of satisfied customers with proven expertise",
    },
    {
      icon: Users,
      title: "Expert Team",
      description: "Certified professionals with specialized training and continuous education",
    },
    {
      icon: Heart,
      title: "Premium Products",
      description: "Only international brands and organic products for best results",
    },
    {
      icon: CheckCircle,
      title: "Hygiene Standards",
      description: "Strict sanitization protocols and highest hygiene standards maintained",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      rating: 5,
      comment:
        "Amazing service! Emma did a fantastic job with my hair. The salon maintains excellent hygiene standards and uses premium products. Highly recommended!",
      service: "Hair Cut & Color",
    },
    {
      name: "Priya Patel",
      rating: 5,
      comment:
        "The facial treatment was so relaxing and effective. My skin feels amazing! Priya's expertise really shows in the results.",
      service: "Facial Treatment",
    },
    {
      name: "Jessica Wilson",
      rating: 5,
      comment:
        "Perfect bridal makeup for my wedding. Isabella is truly talented and made me feel like a princess on my special day!",
      service: "Bridal Makeup",
    },
    {
      name: "Anita Sharma",
      rating: 5,
      comment:
        "Completed the hair styling course here. Excellent training with hands-on practice. Now I'm running my own salon successfully!",
      service: "Hair Styling Course",
    },
  ]

  const handleFeedbackSubmit = () => {
    if (feedbackForm.name && feedbackForm.email && feedbackForm.feedback) {
      setFeedbackForm({
        name: "",
        email: "",
        phone: "",
        service: "",
        rating: 5,
        feedback: "",
      })

      toast.success("Thank you for your feedback! We appreciate your input and will review it shortly.")
    } else {
      toast.error("Please fill in all required fields")
    }
  }

  const renderPolicyPage = (policyType: string) => {
    const policies = {
      privacy: {
        title: "Privacy Policy",
        icon: Shield,
        content: [
          {
            section: "Information We Collect",
            content:
              "We collect personal information such as name, email, phone number, and appointment preferences to provide our beauty services effectively.",
          },
          {
            section: "How We Use Your Information",
            content:
              "Your information is used to schedule appointments, send reminders, provide personalized service recommendations, and improve our services.",
          },
          {
            section: "Data Protection",
            content:
              "We implement industry-standard security measures to protect your personal information and never share it with third parties without consent.",
          },
          {
            section: "Your Rights",
            content:
              "You have the right to access, update, or delete your personal information at any time by contacting our support team.",
          },
        ],
      },
      terms: {
        title: "Terms & Conditions",
        icon: FileText,
        content: [
          {
            section: "Service Agreement",
            content:
              "By booking our services, you agree to arrive on time, follow salon policies, and respect our staff and other customers.",
          },
          {
            section: "Payment Terms",
            content:
              "Payment is due at the time of service. We accept cash, cards, and digital payments. Prices are subject to change with notice.",
          },
          {
            section: "Liability",
            content:
              "While we maintain high safety standards, customers use our services at their own risk. We are not liable for allergic reactions to products.",
          },
          {
            section: "Intellectual Property",
            content:
              "All content, designs, and materials on this website are protected by copyright and belong to BeautyPro Salon.",
          },
        ],
      },
      refund: {
        title: "Refund Policy",
        icon: RefreshCw,
        content: [
          {
            section: "Service Refunds",
            content:
              "Refunds for services are considered on a case-by-case basis within 24 hours of service completion if you're unsatisfied.",
          },
          {
            section: "Product Refunds",
            content:
              "Unopened products can be returned within 7 days of purchase with original receipt for a full refund.",
          },
          {
            section: "Course Refunds",
            content:
              "Course fees are refundable up to 48 hours before the course start date, minus a 10% administrative fee.",
          },
          {
            section: "Processing Time",
            content: "Approved refunds will be processed within 5-7 business days to the original payment method.",
          },
        ],
      },
      shipping: {
        title: "Shipping Policy",
        icon: Truck,
        content: [
          {
            section: "Delivery Areas",
            content:
              "We deliver beauty products within the city limits. Delivery charges apply based on distance and order value.",
          },
          {
            section: "Delivery Timeline",
            content:
              "Standard delivery takes 2-3 business days. Express delivery (same day) is available for orders placed before 2 PM.",
          },
          {
            section: "Shipping Charges",
            content: "Free delivery on orders above ₹2000. Standard delivery: ₹100, Express delivery: ₹200.",
          },
          {
            section: "Order Tracking",
            content: "You'll receive tracking information via SMS and email once your order is dispatched.",
          },
        ],
      },
      cancellation: {
        title: "Cancellation Policy",
        icon: X,
        content: [
          {
            section: "Appointment Cancellation",
            content:
              "Appointments can be cancelled up to 4 hours before the scheduled time without penalty. Late cancellations may incur charges.",
          },
          {
            section: "Course Cancellation",
            content:
              "Course enrollments can be cancelled up to 48 hours before start date. Refund policy applies as per terms.",
          },
          {
            section: "Package Cancellation",
            content:
              "Beauty packages can be cancelled within 24 hours of booking. Partial usage may result in adjusted refunds.",
          },
          {
            section: "Emergency Cancellations",
            content:
              "In case of emergencies or illness, we offer flexible rescheduling options without additional charges.",
          },
        ],
      },
      cookies: {
        title: "Cookie Policy",
        icon: Cookie,
        content: [
          {
            section: "What Are Cookies",
            content:
              "Cookies are small text files stored on your device to enhance your browsing experience and remember your preferences.",
          },
          {
            section: "How We Use Cookies",
            content:
              "We use cookies to remember your appointment preferences, analyze website traffic, and provide personalized content.",
          },
          {
            section: "Cookie Types",
            content:
              "We use essential cookies for website functionality, analytics cookies for insights, and preference cookies for customization.",
          },
          {
            section: "Managing Cookies",
            content:
              "You can control cookie settings through your browser preferences. Disabling cookies may affect website functionality.",
          },
        ],
      },
    }

    const policy = policies[policyType as keyof typeof policies]
    if (!policy) return null

    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                <policy.icon className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">{policy.title}</h1>
            <p className="text-gray-600">Last updated: January 2024</p>
          </div>

          <Card className="rounded-2xl border-pink-100">
            <CardContent className="p-8">
              <div className="space-y-8">
                {policy.content.map((section, index) => (
                  <div key={index}>
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">{section.section}</h2>
                    <p className="text-gray-600 leading-relaxed">{section.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <Button
              onClick={() => setCurrentPage("home")}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (currentPage !== "home") {
    return renderPolicyPage(currentPage)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">BeautyPro Salon</h1>
                <p className="text-sm text-gray-600">Your Beauty Destination</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#services" className="text-gray-600 hover:text-pink-600 transition-colors">
                Services
              </a>
              <a href="#products" className="text-gray-600 hover:text-pink-600 transition-colors">
                Products
              </a>
              <a href="#packages" className="text-gray-600 hover:text-pink-600 transition-colors">
                Packages
              </a>
              <a href="#about" className="text-gray-600 hover:text-pink-600 transition-colors">
                About Us
              </a>
              <a href="#academy" className="text-gray-600 hover:text-pink-600 transition-colors">
                Academy
              </a>
              <a href="#feedback" className="text-gray-600 hover:text-pink-600 transition-colors">
                Feedback
              </a>
              <a href="#contact" className="text-gray-600 hover:text-pink-600 transition-colors">
                Contact
              </a>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl">
                    Book Appointment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-gray-800">Book Your Appointment</DialogTitle>
                  </DialogHeader>
                  <BookingForm
                    services={services}
                    staff={staff}
                    step={bookingStep}
                    setStep={setBookingStep}
                    selectedService={selectedService}
                    setSelectedService={setSelectedService}
                    selectedStaff={selectedStaff}
                    setSelectedStaff={setSelectedStaff}
                  />
                </DialogContent>
              </Dialog>
              <Button
                variant="ghost"
                onClick={onAdminLogin}
                className="text-xs text-gray-400 hover:text-gray-600"
                size="sm"
              >
                Admin
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Transform Your Beauty
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
              Experience Excellence
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover premium beauty services with our expert team. From hair styling to skincare, we provide
            personalized treatments in a luxurious environment with 15+ years of trusted expertise.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Book Now
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-gray-800">Book Your Appointment</DialogTitle>
                </DialogHeader>
                <BookingForm
                  services={services}
                  staff={staff}
                  step={bookingStep}
                  setStep={setBookingStep}
                  selectedService={selectedService}
                  setSelectedService={setSelectedService}
                  selectedStaff={selectedStaff}
                  setSelectedStaff={setSelectedStaff}
                />
              </DialogContent>
            </Dialog>
            <Button size="lg" variant="outline" className="rounded-xl border-pink-200 hover:bg-pink-50 bg-transparent">
              <Phone className="h-5 w-5 mr-2" />
              Call Us
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Indulge in our comprehensive range of beauty services designed to enhance your natural beauty
            </p>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading services...</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services
                .filter((service) => service.status === "Active")
                .map((service) => (
                  <Card
                    key={service.id}
                    className="rounded-2xl border-pink-100 hover:shadow-lg transition-shadow overflow-hidden"
                  >
                    <div className="h-48 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                      <img
                        src={service.image || "/placeholder.svg?height=200&width=300"}
                        alt={service.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{service.name}</h3>
                        <Badge variant="outline" className="border-pink-200 text-pink-700">
                          {service.category}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-lg font-bold text-purple-600">₹{service.price}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {service.duration}
                          </p>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
                              onClick={() => setSelectedService(service.id.toString())}
                            >
                              Book Now
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-gray-800">Book Your Appointment</DialogTitle>
                            </DialogHeader>
                            <BookingForm
                              services={services}
                              staff={staff}
                              step={bookingStep}
                              setStep={setBookingStep}
                              selectedService={selectedService}
                              setSelectedService={setSelectedService}
                              selectedStaff={selectedStaff}
                              setSelectedStaff={setSelectedStaff}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              {services.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Services Available</h3>
                  <p className="text-gray-500">Please check back later for our services.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Premium Products</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Shop our curated collection of professional-grade beauty products
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products
              .filter((product) => product.status === "Active")
              .map((product) => (
                <Card
                  key={product.id}
                  className="rounded-2xl border-pink-100 hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="h-48 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center relative">
                    <img
                      src={product.image || "/placeholder.svg?height=200&width=200"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.quantity === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="secondary" className="bg-red-500 text-white">
                          Out of Stock
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                      <Badge variant="outline" className="border-pink-200 text-pink-700">
                        {product.brand || product.category}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < 4 ? "text-yellow-500 fill-current" : "text-gray-300"}`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-1">4.5 (Reviews)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg font-bold text-purple-600">₹{product.price}</p>
                      </div>
                      <Button
                        disabled={product.quantity === 0}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl disabled:opacity-50"
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        {product.quantity > 0 ? "Add to Cart" : "Out of Stock"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Beauty Packages</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Save more with our specially curated beauty packages designed for every occasion
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {packages
              .filter((pkg) => pkg.status === "Active")
              .map((pkg) => (
                <Card
                  key={pkg.id}
                  className={`rounded-2xl border-pink-100 hover:shadow-lg transition-shadow overflow-hidden ${pkg.isPopular ? "ring-2 ring-purple-500 relative" : ""
                    }`}
                >
                  {pkg.isPopular && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                        <Crown className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <div className="h-48 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                    <img
                      src={pkg.image || "/placeholder.svg?height=300&width=400"}
                      alt={pkg.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{pkg.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{pkg.description}</p>

                    <div className="mb-4">
                      <h4 className="font-medium text-gray-800 mb-2">Package Includes:</h4>
                      <ul className="space-y-1">
                        {pkg.services.slice(0, 5).map((service: string, index: number) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {service}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-2xl font-bold text-purple-600">₹{pkg.price}</p>
                          {pkg.originalPrice && (
                            <p className="text-lg text-gray-500 line-through">₹{pkg.originalPrice}</p>
                          )}
                        </div>
                        {pkg.originalPrice && (
                          <p className="text-sm text-green-600 font-medium">
                            <Gift className="h-3 w-3 inline mr-1" />
                            Save ₹{pkg.originalPrice - pkg.price}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-medium text-gray-800">{pkg.duration}</p>
                      </div>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl">
                      <Package className="h-4 w-4 mr-2" />
                      Book Package
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">About BeautyPro Salon</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Learn about our journey, mission, and commitment to excellence in beauty services
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Our Story */}
            <div className="grid gap-12 lg:grid-cols-2 items-center mb-16">
              <div>
                <h3 className="text-3xl font-bold text-gray-800 mb-6">Our Story</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Founded in 2008, BeautyPro Salon began as a small beauty studio with a big dream - to create a space
                    where beauty meets artistry. Our founder, with over 15 years of experience in the beauty industry,
                    envisioned a salon that would not only provide exceptional services but also empower individuals to
                    embrace their unique beauty.
                  </p>
                  <p>
                    Today, we have grown into a full-service beauty destination, offering everything from hair styling
                    and skincare to makeup artistry and beauty education. Our journey has been marked by countless
                    satisfied clients, industry recognition, and a growing team of passionate beauty professionals.
                  </p>
                </div>
              </div>
              <div className="bg-gray-200 rounded-2xl h-96 flex items-center justify-center">
                <Users className="h-24 w-24 text-gray-400" />
              </div>
            </div>

            {/* Mission & Vision */}
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-8 mb-16">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="text-center">
                  <div className="bg-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-pink-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h3>
                  <p className="text-gray-600">
                    To provide exceptional beauty services that enhance our clients' natural beauty while creating a
                    welcoming, inclusive environment where everyone feels valued and beautiful.
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Vision</h3>
                  <p className="text-gray-600">
                    To be the leading beauty destination that sets industry standards for quality, innovation, and
                    customer satisfaction while empowering the next generation of beauty professionals.
                  </p>
                </div>
              </div>
            </div>

            {/* Values */}
            <div className="mb-16">
              <h3 className="text-3xl font-bold text-gray-800 text-center mb-12">Our Values</h3>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {whyChooseUs.map((item, index) => (
                  <Card
                    key={index}
                    className="rounded-2xl border-pink-100 text-center hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                          <item.icon className="h-8 w-8 text-purple-600" />
                        </div>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h4>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Team */}
            <div>
              <h3 className="text-3xl font-bold text-gray-800 text-center mb-12">Meet Our Expert Team</h3>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {staff.map((member, index) => (
                  <Card
                    key={index}
                    className="rounded-2xl border-pink-100 text-center hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <Avatar className="h-24 w-24 mx-auto mb-4">
                        <AvatarImage src={member.image || "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white text-lg">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <h4 className="text-lg font-semibold text-gray-800 mb-1">{member.name}</h4>
                      <p className="text-purple-600 font-medium mb-2">{member.role}</p>
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{member.rating}</span>
                      </div>
                      <p className="text-sm text-gray-600">{member.experience} experience</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Academy Section */}
      <section id="academy" className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Beauty Academy</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Start your career in beauty with our professional training courses
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {courses
              .filter((course) => course.status === "Active")
              .map((course) => (
                <Card key={course.id} className="rounded-2xl border-pink-100 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <GraduationCap className="h-6 w-6 text-purple-600" />
                      <CardTitle className="text-gray-800">{course.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{course.description}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{course.duration}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-medium text-purple-600">₹{course.price}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Students:</span>
                        <span className="font-medium">{course.enrolledStudents || 0}</span>
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl">
                      Enroll Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section id="feedback" className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Share Your Feedback</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We value your opinion! Share your experience and help us serve you better
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <Card className="rounded-2xl border-pink-100">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="feedback-name">Full Name *</Label>
                      <Input
                        id="feedback-name"
                        value={feedbackForm.name}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, name: e.target.value })}
                        placeholder="Your full name"
                        className="rounded-xl border-pink-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="feedback-email">Email *</Label>
                      <Input
                        id="feedback-email"
                        type="email"
                        value={feedbackForm.email}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, email: e.target.value })}
                        placeholder="your.email@example.com"
                        className="rounded-xl border-pink-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="feedback-phone">Phone Number</Label>
                      <Input
                        id="feedback-phone"
                        value={feedbackForm.phone}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, phone: e.target.value })}
                        placeholder="+91 98765-43210"
                        className="rounded-xl border-pink-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="feedback-service">Service Experienced</Label>
                      <Select
                        value={feedbackForm.service}
                        onValueChange={(value) => setFeedbackForm({ ...feedbackForm, service: value })}
                      >
                        <SelectTrigger className="rounded-xl border-pink-200">
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service.id} value={service.name}>
                              {service.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Rate Your Experience</Label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setFeedbackForm({ ...feedbackForm, rating })}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-8 w-8 transition-colors ${rating <= feedbackForm.rating
                              ? "text-yellow-500 fill-current"
                              : "text-gray-300 hover:text-yellow-400"
                              }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        {feedbackForm.rating} star{feedbackForm.rating !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="feedback-message">Your Feedback *</Label>
                    <Textarea
                      id="feedback-message"
                      value={feedbackForm.feedback}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback: e.target.value })}
                      placeholder="Share your experience, suggestions, or any feedback..."
                      className="rounded-xl border-pink-200 min-h-[120px]"
                      rows={5}
                    />
                  </div>

                  <Button
                    onClick={handleFeedbackSubmit}
                    disabled={!feedbackForm.name || !feedbackForm.email || !feedbackForm.feedback}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Submit Feedback
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">What Our Clients Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Read testimonials from our satisfied customers</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="rounded-2xl border-pink-100">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 text-sm">"{testimonial.comment}"</p>
                  <div>
                    <p className="font-semibold text-gray-800">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.service}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Get In Touch</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Visit us or get in touch for more information</p>
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="rounded-2xl border-pink-100">
              <CardHeader>
                <CardTitle className="text-gray-800">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-pink-600" />
                  <div>
                    <p className="font-medium text-gray-800">Address</p>
                    <p className="text-gray-600">123 Beauty Street, Downtown, City 12345</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-pink-600" />
                  <div>
                    <p className="font-medium text-gray-800">Phone</p>
                    <p className="text-gray-600">+91 98765-43210</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-pink-600" />
                  <div>
                    <p className="font-medium text-gray-800">WhatsApp</p>
                    <p className="text-gray-600">+91 98765-43210</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-pink-600" />
                  <div>
                    <p className="font-medium text-gray-800">Email</p>
                    <p className="text-gray-600">info@beautypro.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-pink-600" />
                  <div>
                    <p className="font-medium text-gray-800">Hours</p>
                    <p className="text-gray-600">Mon-Sat: 9AM-8PM, Sun: 10AM-6PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-pink-100">
              <CardHeader>
                <CardTitle className="text-gray-800">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="Your first name" className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Your last name" className="rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your.email@example.com" className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" placeholder="+91 98765-43210" className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="Your message..." className="rounded-xl" rows={4} />
                  </div>
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">BeautyPro Salon</h3>
                </div>
              </div>
              <p className="text-gray-400">
                Your trusted beauty destination for premium services and professional training.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Hair Styling</li>
                <li>Facial Treatments</li>
                <li>Nail Care</li>
                <li>Makeup</li>
                <li>Body Treatments</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Academy</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Hair Styling Course</li>
                <li>Facial Treatment Course</li>
                <li>Makeup Course</li>
                <li>Nail Art Course</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Policies</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button onClick={() => setCurrentPage("privacy")} className="hover:text-white transition-colors">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentPage("terms")} className="hover:text-white transition-colors">
                    Terms & Conditions
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentPage("refund")} className="hover:text-white transition-colors">
                    Refund Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentPage("shipping")} className="hover:text-white transition-colors">
                    Shipping Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentPage("cancellation")} className="hover:text-white transition-colors">
                    Cancellation Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentPage("cookies")} className="hover:text-white transition-colors">
                    Cookie Policy
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 BeautyPro Salon. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

interface Service {
  id: number;
  name: string;
  category: string;
  duration: string;
  price: number;
  description: string;
  status: string;
  image?: string;
}

interface Staff {
  id: number;
  name: string;
  role: string;
  specialization: string[];
  experience: string;
  rating: number;
  image: string;
}

const handleCustomerData = async (customerData: {
  name: string;
  phone: string;
  email: string;
  whatsapp: string;
  age: string;
}) => {
  try {
    // Check if customer already exists by phone number
    const { data: existingCustomers, error: fetchError } = await supabase
      .from("customers")
      .select("*")
      .eq("phone", customerData.phone);

    if (fetchError) {
      throw fetchError;
    }

    if (existingCustomers && existingCustomers.length > 0) {
      // Update existing customer
      const existingCustomer = existingCustomers[0];
      const updateData = {
        name: customerData.name, // Update name in case it changed
        email: customerData.email || existingCustomer.email,
        whatsapp: customerData.whatsapp || existingCustomer.whatsapp,
        age: customerData.age ? parseInt(customerData.age) : existingCustomer.age,
        total_visits: (existingCustomer.total_visits || 0) + 1,
        last_visit: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from("customers")
        .update(updateData)
        .eq("id", existingCustomer.id);

      if (updateError) throw updateError;
      console.log("Existing customer updated successfully:", existingCustomer.id);
      toast.success("Welcome back! Your visit count has been updated.");
    } else {
      // Insert new customer
      const newCustomerData = {
        name: customerData.name,
        phone: customerData.phone,
        email: customerData.email || null,
        whatsapp: customerData.whatsapp || null,
        age: customerData.age ? parseInt(customerData.age) : null,
        total_visits: 1,
        last_visit: new Date().toISOString(),
        join_date: new Date().toISOString(),
        tier: "Bronze",
        loyalty_points: 0,
        total_spent: 0,
        status: "Active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: newCustomer, error: insertError } = await supabase
        .from("customers")
        .insert([newCustomerData])
        .select();

      if (insertError) throw insertError;
      console.log("New customer created successfully:", newCustomer?.[0]?.id);
      toast.success("Welcome! Your customer profile has been created.");
    }
  } catch (error) {
    console.error("Error handling customer data:", error);
    toast.error("Failed to update customer data");
    throw error;
  }
};

// Booking Form Component
function BookingForm({
  services,
  staff,
  step,
  setStep,
  selectedService,
  setSelectedService,
  selectedStaff,
  setSelectedStaff,
}: any) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    whatsapp: "",
    age: "",
    date: "",
    time: "",
    notes: "",
  })
  const { appointments, addAppointment, syncing } = useSupabaseData()

  const handleSubmit = async () => {
    if (formData.firstName && formData.lastName && formData.email && formData.phone && formData.date && formData.time) {
      const selectedServiceData = services.find((s: Service) => s.id.toString() === selectedService);
      const selectedStaffData = selectedStaff ? staff.find((s: any) => s.id.toString() === selectedStaff) : staff[0];
      const durationMatch = selectedServiceData.duration.match(/\d+/);
      const duration = durationMatch ? parseInt(durationMatch[0], 10) : 0;

      const appointmentData = {
        customername: `${formData.firstName} ${formData.lastName}`,
        customerphone: formData.phone,
        customeremail: formData.email,
        service: selectedServiceData.name,
        staff: selectedStaffData.name,
        date: formData.date,
        time: formData.time,
        duration: duration,
        price: selectedServiceData.price,
        status: "Pending",
        notes: formData.notes,
      };

      try {
        // Handle customer data
        await handleCustomerData({
          name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          email: formData.email,
          whatsapp: formData.whatsapp,
          age: formData.age,
        });

        // Add appointment
        await addAppointment(appointmentData);
        toast.success("Booking request submitted! We will contact you shortly to confirm.");
        setStep(1);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          whatsapp: "",
          age: "",
          date: "",
          time: "",
          notes: "",
        });
      } catch (error) {
        console.error("Error adding appointment:", error);
        toast.error("Failed to add appointment");
      }
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  if (step === 1) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Service</h3>
          <div className="grid gap-3">
            {services
              .filter((service: any) => service.status === "Active")
              .map((service: any) => (
                <div
                  key={service.id}
                  className={`p-4 border rounded-xl cursor-pointer transition-colors ${selectedService === service.id.toString()
                    ? "border-pink-500 bg-pink-50"
                    : "border-gray-200 hover:border-pink-300"
                    }`}
                  onClick={() => setSelectedService(service.id.toString())}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-800">{service.name}</h4>
                      <p className="text-sm text-gray-600">{service.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-purple-600">₹{service.price}</p>
                      <p className="text-sm text-gray-500">{service.duration}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
        <Button
          onClick={() => setStep(3)}
          disabled={!selectedService}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
        >
          Next: Your Details
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Details</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Preferred Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Preferred Time *</Label>
              <Select value={formData.time} onValueChange={(value) => setFormData({ ...formData, time: value })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="09:00">9:00 AM</SelectItem>
                  <SelectItem value="10:00">10:00 AM</SelectItem>
                  <SelectItem value="11:00">11:00 AM</SelectItem>
                  <SelectItem value="12:00">12:00 PM</SelectItem>
                  <SelectItem value="14:00">2:00 PM</SelectItem>
                  <SelectItem value="15:00">3:00 PM</SelectItem>
                  <SelectItem value="16:00">4:00 PM</SelectItem>
                  <SelectItem value="17:00">5:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Special Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="rounded-xl"
              rows={3}
            />
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-xl">
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={
            !formData.firstName ||
            !formData.lastName ||
            !formData.email ||
            !formData.phone ||
            !formData.date ||
            !formData.time
          }
          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
        >
          Submit Booking
        </Button>
      </div>
    </div>
  )
}

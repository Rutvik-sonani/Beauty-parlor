"use client"

import { useState, useMemo } from "react"
import { useSupabaseData } from "@/contexts/supabase-data-context"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ShoppingCart, Plus, Minus, CreditCard, Smartphone, Wallet, Printer, Mail, CheckCircle, Search, UserPlus } from "lucide-react"

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  type: 'service' | 'product'
  originalStock?: number
}

interface Transaction {
  id: number
  customer: string
  customerPhone: string
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: string
  date: string
  discount?: number
  discountCode?: string
}

export function POS() {
  const { services, inventory, customers, addCustomer, updateInventoryItem, syncing } = useSupabaseData()
  
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null)
  const [discountCode, setDiscountCode] = useState("")
  const [discountAmount, setDiscountAmount] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: ''
  })

  // Filter active services and products
  const activeServices = useMemo(() => 
    services.filter(service => service.status === 'Active'), 
    [services]
  )

  const activeProducts = useMemo(() => 
    inventory.filter(product => product.status === 'Active' && product.stock > 0), 
    [inventory]
  )

  // Filter by search term
  const filteredServices = useMemo(() => 
    activeServices.filter(service => 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category?.toLowerCase().includes(searchTerm.toLowerCase())
    ), 
    [activeServices, searchTerm]
  )

  const filteredProducts = useMemo(() => 
    activeProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase())
    ), 
    [activeProducts, searchTerm]
  )

  // Calculate totals
  const subtotal = useMemo(() => 
    cart.reduce((sum, item) => sum + item.price * item.quantity, 0), 
    [cart]
  )
  
  const tax = useMemo(() => subtotal * 0.18, [subtotal])
  const total = useMemo(() => subtotal + tax - discountAmount, [subtotal, tax, discountAmount])

  // Get customer by phone
  const selectedCustomerData = useMemo(() => 
    customers.find(customer => customer.phone === selectedCustomer), 
    [customers, selectedCustomer]
  )

  const updateQuantity = (id: number, change: number) => {
    setCart(prevCart => {
      const updatedCart = prevCart.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(0, item.quantity + change)
          
          // Check stock for products
          if (item.type === 'product' && newQuantity > (item.originalStock || 0)) {
            toast.error('Not enough stock available')
            return item
          }
          
          return { ...item, quantity: newQuantity }
        }
        return item
      }).filter(item => item.quantity > 0)
      
      return updatedCart
    })
  }

  const addToCart = (item: any, type: 'service' | 'product') => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id && cartItem.type === type)
    
    if (existingItem) {
      updateQuantity(item.id, 1)
    } else {
      // Check stock for products
      if (type === 'product' && item.stock <= 0) {
        toast.error('Product out of stock')
        return
      }
      
      setCart(prevCart => [...prevCart, { 
        ...item, 
        quantity: 1, 
        type,
        originalStock: type === 'product' ? item.stock : undefined
      }])
    }
  }

  const applyDiscount = () => {
    // Simple discount logic - you can make this more sophisticated
    if (discountCode.toLowerCase() === 'welcome10') {
      const discount = subtotal * 0.10
      setDiscountAmount(discount)
      toast.success('10% discount applied!')
    } else if (discountCode.toLowerCase() === 'loyalty20') {
      const discount = subtotal * 0.20
      setDiscountAmount(discount)
      toast.success('20% loyalty discount applied!')
    } else {
      toast.error('Invalid discount code')
      setDiscountAmount(0)
    }
  }

  const clearDiscount = () => {
    setDiscountAmount(0)
    setDiscountCode("")
    toast.success('Discount cleared')
  }

  const addNewCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) {
      toast.error('Please fill in name and phone number')
      return
    }

    try {
      await addCustomer({
        name: newCustomer.name,
        phone: newCustomer.phone,
        email: newCustomer.email || null,
        birthday: null,
        loyalty_points: 0,
        total_visits: 0,
        last_visit: null,
        tier: 'Bronze',
        favorite_service: null,
        total_spent: 0,
        notes: null,
        status: 'Active',
        join_date: new Date().toISOString().split('T')[0],
        age: null,
        whatsapp: newCustomer.phone
      } as any)
      
      setSelectedCustomer(newCustomer.phone)
      setNewCustomer({ name: '', phone: '', email: '' })
      setShowNewCustomerDialog(false)
      toast.success('Customer added successfully!')
    } catch (error) {
      console.error('Error adding customer:', error)
      toast.error('Failed to add customer')
    }
  }

  const processPayment = async () => {
    if (!selectedPaymentMethod) {
      toast.error("Please select a payment method")
      return
    }
    if (!selectedCustomer) {
      toast.error("Please select a customer")
      return
    }
    if (cart.length === 0) {
      toast.error("Cart is empty")
      return
    }

    try {
      // Update inventory for products
      const productUpdates = cart
        .filter(item => item.type === 'product')
        .map(item => ({
          id: item.id,
          stock: (item.originalStock || 0) - item.quantity
        }))

      // Update inventory in database
      for (const update of productUpdates) {
        await updateInventoryItem(update.id, { stock: update.stock })
      }

      const transaction: Transaction = {
        id: Date.now(),
        customer: selectedCustomerData?.name || 'Walk-in Customer',
        customerPhone: selectedCustomer,
        items: cart,
        subtotal,
        tax,
        total,
        paymentMethod: selectedPaymentMethod,
        date: new Date().toLocaleString(),
        discount: discountAmount,
        discountCode: discountCode || undefined
      }

      setLastTransaction(transaction)
      setShowSuccessDialog(true)

      // Clear cart and form
      setCart([])
      setSelectedPaymentMethod("")
      setSelectedCustomer("")
      setDiscountCode("")
      setDiscountAmount(0)
      setSearchTerm("")

      toast.success('Payment processed successfully!')
    } catch (error) {
      console.error('Error processing payment:', error)
      toast.error('Failed to process payment')
    }
  }

  const handlePrint = () => {
    if (lastTransaction) {
      // Simulate printing
      toast.success("Receipt sent to printer!")
    }
  }

  const handleEmail = () => {
    if (lastTransaction && selectedCustomerData?.email) {
      // Simulate email sending
      toast.success("Receipt sent to customer's email!")
    } else {
      toast.error("No email address available for customer")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Point of Sale</h1>
          <p className="text-gray-600">Process sales and manage transactions</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Services & Products */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search Bar */}
          <Card className="rounded-2xl border-pink-100">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search services and products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card className="rounded-2xl border-pink-100">
            <CardHeader>
              <CardTitle className="text-gray-800">Services</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredServices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No services found</p>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {filteredServices.map((service) => (
                    <div
                      key={service.id}
                      className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-100 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => addToCart(service, "service")}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-800">{service.name}</h3>
                          <p className="text-sm text-gray-600">{service.duration}</p>
                          {service.category && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {service.category}
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">₹{service.price}</p>
                          <Button size="sm" className="mt-1 bg-pink-500 hover:bg-pink-600 rounded-lg">
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Products */}
          <Card className="rounded-2xl border-pink-100">
            <CardHeader>
              <CardTitle className="text-gray-800">Products</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No products found</p>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100 cursor-pointer hover:shadow-md transition-shadow ${
                        product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      onClick={() => product.stock > 0 && addToCart(product, "product")}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-800">{product.name}</h3>
                          <p className="text-sm text-gray-600">
                            Stock: {product.stock} {product.stock <= 5 && product.stock > 0 && (
                              <Badge variant="destructive" className="ml-1 text-xs">Low Stock</Badge>
                            )}
                          </p>
                          {product.category && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {product.category}
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">₹{product.price}</p>
                          <Button 
                            size="sm" 
                            className="mt-1 bg-purple-500 hover:bg-purple-600 rounded-lg"
                            disabled={product.stock <= 0}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cart & Checkout */}
        <div className="space-y-6">
          <Card className="rounded-2xl border-pink-100">
            <CardHeader>
              <CardTitle className="text-gray-800 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="customer">Customer</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowNewCustomerDialog(true)}
                    className="h-6 text-xs"
                  >
                    <UserPlus className="h-3 w-3 mr-1" />
                    New
                  </Button>
                </div>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.phone}>
                        {customer.name} - {customer.phone}
                      </SelectItem>
                    ))}
                    <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                  </SelectContent>
                </Select>
                {selectedCustomerData && (
                  <div className="text-xs text-gray-600">
                    Tier: {selectedCustomerData.tier} • Points: {selectedCustomerData.loyalty_points}
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Cart is empty</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={`${item.id}-${item.type}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{item.name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={
                              item.type === "service"
                                ? "border-pink-200 text-pink-700"
                                : "border-purple-200 text-purple-700"
                            }
                          >
                            {item.type}
                          </Badge>
                          <span className="text-sm text-gray-600">₹{item.price}</span>
                          {item.type === 'product' && item.originalStock && (
                            <span className="text-xs text-gray-500">
                              Stock: {item.originalStock - item.quantity}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0 rounded-full"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0 rounded-full"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount:</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Tax (18%):</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Discount/Coupon</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter coupon code" 
                    className="rounded-xl flex-1"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                  />
                  <Button 
                    variant="outline" 
                    className="rounded-xl"
                    onClick={applyDiscount}
                  >
                    Apply
                  </Button>
                </div>
                {discountAmount > 0 && (
                  <Button 
                    variant="outline" 
                    className="w-full rounded-xl text-red-600"
                    onClick={clearDiscount}
                  >
                    Clear Discount
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-pink-100">
            <CardHeader>
              <CardTitle className="text-gray-800">Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={selectedPaymentMethod === "card" ? "default" : "outline"}
                  className="flex items-center gap-2 rounded-xl"
                  onClick={() => setSelectedPaymentMethod("card")}
                >
                  <CreditCard className="h-4 w-4" />
                  Card
                </Button>
                <Button
                  variant={selectedPaymentMethod === "upi" ? "default" : "outline"}
                  className="flex items-center gap-2 rounded-xl"
                  onClick={() => setSelectedPaymentMethod("upi")}
                >
                  <Smartphone className="h-4 w-4" />
                  UPI
                </Button>
                <Button
                  variant={selectedPaymentMethod === "cash" ? "default" : "outline"}
                  className="flex items-center gap-2 rounded-xl"
                  onClick={() => setSelectedPaymentMethod("cash")}
                >
                  <Wallet className="h-4 w-4" />
                  Cash
                </Button>
                <Button
                  variant={selectedPaymentMethod === "wallet" ? "default" : "outline"}
                  className="flex items-center gap-2 rounded-xl"
                  onClick={() => setSelectedPaymentMethod("wallet")}
                >
                  <Wallet className="h-4 w-4" />
                  Wallet
                </Button>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
                onClick={processPayment}
                disabled={cart.length === 0 || syncing}
              >
                {syncing ? 'Processing...' : 'Process Payment'}
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 rounded-xl"
                  onClick={handlePrint}
                  disabled={!lastTransaction}
                >
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 rounded-xl"
                  onClick={handleEmail}
                  disabled={!lastTransaction}
                >
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Customer Dialog */}
      <Dialog open={showNewCustomerDialog} onOpenChange={setShowNewCustomerDialog}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-800">Add New Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">Name</Label>
              <Input
                id="new-name"
                placeholder="Enter customer name"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-phone">Phone</Label>
              <Input
                id="new-phone"
                placeholder="Enter phone number"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-email">Email (Optional)</Label>
              <Input
                id="new-email"
                type="email"
                placeholder="Enter email address"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                className="rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setShowNewCustomerDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl"
                onClick={addNewCustomer}
                disabled={syncing}
              >
                {syncing ? 'Adding...' : 'Add Customer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-800 flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Payment Successful!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {lastTransaction ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Transaction ID:</strong> {lastTransaction.id}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Customer:</strong> {lastTransaction.customer}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Phone:</strong> {lastTransaction.customerPhone}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Amount:</strong> ₹{lastTransaction.total.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Payment Method:</strong> {lastTransaction.paymentMethod}
                </p>
                {lastTransaction.discount && (
                  <p className="text-sm text-green-600">
                    <strong>Discount Applied:</strong> ₹{lastTransaction.discount.toFixed(2)}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  <strong>Date:</strong> {lastTransaction.date}
                </p>
              </div>
            ) : null}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print Receipt
              </Button>
              <Button variant="outline" className="flex-1 rounded-xl" onClick={handleEmail}>
                <Mail className="h-4 w-4 mr-2" />
                Email Receipt
              </Button>
            </div>
            <Button
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl"
              onClick={() => setShowSuccessDialog(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

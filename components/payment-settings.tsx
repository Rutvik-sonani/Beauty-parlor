"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Smartphone, Banknote, Settings, Save } from "lucide-react"

export function PaymentSettings() {
  const [paymentMethods, setPaymentMethods] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('paymentMethods')
      return saved ? JSON.parse(saved) : {
        cash: { enabled: true, name: "Cash Payment" },
        card: { enabled: true, name: "Card Payment" },
        upi: { enabled: true, name: "UPI Payment" },
        netbanking: { enabled: false, name: "Net Banking" }
      }
    }
    return {
      cash: { enabled: true, name: "Cash Payment" },
      card: { enabled: true, name: "Card Payment" },
      upi: { enabled: true, name: "UPI Payment" },
      netbanking: { enabled: false, name: "Net Banking" }
    }
  })

  const [razorpaySettings, setRazorpaySettings] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('razorpaySettings')
      return saved ? JSON.parse(saved) : {
        keyId: "",
        keySecret: "",
        enabled: false
      }
    }
    return {
      keyId: "",
      keySecret: "",
      enabled: false
    }
  })

  const [upiSettings, setUpiSettings] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('upiSettings')
      return saved ? JSON.parse(saved) : {
        upiId: "beautypro@paytm",
        qrCode: "",
        enabled: true
      }
    }
    return {
      upiId: "beautypro@paytm",
      qrCode: "",
      enabled: true
    }
  })

  const togglePaymentMethod = (method: string) => {
    setPaymentMethods(prev => ({
      ...prev,
      [method]: { ...prev[method], enabled: !prev[method].enabled }
    }))
  }

  const saveSettings = () => {
    localStorage.setItem('paymentMethods', JSON.stringify(paymentMethods))
    localStorage.setItem('razorpaySettings', JSON.stringify(razorpaySettings))
    localStorage.setItem('upiSettings', JSON.stringify(upiSettings))
    console.log("Payment settings saved")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Payment Settings</h2>
          <p className="text-gray-600">Configure payment methods and gateway settings</p>
        </div>
        <Button onClick={saveSettings} className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl">
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Payment Methods */}
        <Card className="rounded-2xl border-pink-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-pink-600" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(paymentMethods).map(([key, method]) => (
              <div key={key} className="flex items-center justify-between p-3 border rounded-xl">
                <div className="flex items-center gap-3">
                  {key === 'cash' && <Banknote className="h-5 w-5 text-green-600" />}
                  {key === 'card' && <CreditCard className="h-5 w-5 text-blue-600" />}
                  {key === 'upi' && <Smartphone className="h-5 w-5 text-purple-600" />}
                  {key === 'netbanking' && <Settings className="h-5 w-5 text-orange-600" />}
                  <span className="font-medium">{method.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={method.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                    {method.enabled ? "Active" : "Inactive"}
                  </Badge>
                  <Switch
                    checked={method.enabled}
                    onCheckedChange={() => togglePaymentMethod(key)}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Razorpay Settings */}
        <Card className="rounded-2xl border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Razorpay Gateway
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Razorpay</Label>
              <Switch
                checked={razorpaySettings.enabled}
                onCheckedChange={(checked) => setRazorpaySettings(prev => ({ ...prev, enabled: checked }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="razorpay-key">Key ID</Label>
              <Input
                id="razorpay-key"
                value={razorpaySettings.keyId}
                onChange={(e) => setRazorpaySettings(prev => ({ ...prev, keyId: e.target.value }))}
                placeholder="rzp_test_xxxxxxxxxx"
                className="rounded-xl"
                disabled={!razorpaySettings.enabled}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="razorpay-secret">Key Secret</Label>
              <Input
                id="razorpay-secret"
                type="password"
                value={razorpaySettings.keySecret}
                onChange={(e) => setRazorpaySettings(prev => ({ ...prev, keySecret: e.target.value }))}
                placeholder="xxxxxxxxxxxxxxxxxx"
                className="rounded-xl"
                disabled={!razorpaySettings.enabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* UPI Settings */}
        <Card className="rounded-2xl border-purple-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-purple-600" />
              UPI Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="upi-id">UPI ID</Label>
              <Input
                id="upi-id"
                value={upiSettings.upiId}
                onChange={(e) => setUpiSettings(prev => ({ ...prev, upiId: e.target.value }))}
                placeholder="yourstore@paytm"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qr-code">QR Code URL</Label>
              <Input
                id="qr-code"
                value={upiSettings.qrCode}
                onChange={(e) => setUpiSettings(prev => ({ ...prev, qrCode: e.target.value }))}
                placeholder="https://example.com/qr-code.png"
                className="rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card className="rounded-2xl border-green-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-green-600" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Active Payment Methods:</span>
                <span className="font-semibold">
                  {Object.values(paymentMethods).filter(m => m.enabled).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Online Gateway:</span>
                <Badge className={razorpaySettings.enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                  {razorpaySettings.enabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>UPI Payments:</span>
                <Badge className={upiSettings.enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                  {upiSettings.enabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
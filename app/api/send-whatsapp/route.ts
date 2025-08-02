import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { customers, message } = await request.json()

    // Only use server-side Knock API key
    const knockApiKey = process.env.KNOCK_API_KEY

    if (!knockApiKey) {
      return NextResponse.json({ error: "Knock API key not configured" }, { status: 500 })
    }

    // Send messages to each customer via Knock
    const promises = customers.map(async (customer: { phone: string; name: string }) => {
      const response = await fetch("https://api.knock.app/v1/workflows/whatsapp-message/trigger", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${knockApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipients: [
            {
              id: customer.phone,
              phone_number: customer.phone,
              name: customer.name,
            },
          ],
          data: {
            message: message,
            customer_name: customer.name,
          },
        }),
      })

      return response.json()
    })

    const results = await Promise.all(promises)

    return NextResponse.json({
      success: true,
      message: `Messages sent to ${customers.length} customers`,
      results,
    })
  } catch (error) {
    console.error("Error sending WhatsApp messages:", error)
    return NextResponse.json({ error: "Failed to send messages" }, { status: 500 })
  }
}

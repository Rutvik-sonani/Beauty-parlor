"use server"

interface Customer {
  phone: string
  name: string
}

export async function sendWhatsAppMessages(customers: Customer[], message: string) {
  try {
    const knockApiKey = process.env.KNOCK_API_KEY

    if (!knockApiKey) {
      throw new Error("Knock API key not configured")
    }

    // Send messages to each customer via Knock
    const promises = customers.map(async (customer) => {
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

      if (!response.ok) {
        throw new Error(`Failed to send message to ${customer.name}`)
      }

      return response.json()
    })

    const results = await Promise.all(promises)

    return {
      success: true,
      message: `Messages sent to ${customers.length} customers`,
      results,
    }
  } catch (error) {
    console.error("Error sending WhatsApp messages:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send messages",
    }
  }
}

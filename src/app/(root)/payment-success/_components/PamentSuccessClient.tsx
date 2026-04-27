"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

type Status = "loading" | "success" | "failed"

export default function PaymentSuccessClient({
  reference,
  orderId,
}: {
  reference: string | null
  orderId: string | null
}) {
  const [status, setStatus] = useState<Status>("loading")

  // Example theme (replace with your useTheme())
  const theme = {
    primary: "#16a34a",
    primaryLight: "#dcfce7",
    primaryText: "#065f46",
  }

  useEffect(() => {
    if (!reference) {
      setStatus("failed")
      return
    }

    const verify = async () => {
      try {
        const res = await fetch(
          `/api/verify-payment?reference=${reference}&orderId=${orderId}`
        )

        const data = await res.json()

        if (data.success) {
          setStatus("success")
        } else {
          setStatus("failed")
        }
      } catch {
        setStatus("failed")
      }
    }

    verify()
  }, [reference, orderId])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 text-center">

        {status === "loading" && (
          <>
            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-gray-400" />
            <h2 className="text-lg font-bold text-gray-800">
              Verifying payment...
            </h2>
          </>
        )}

        {status === "success" && (
          <>
            <div
              className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: theme.primaryLight }}
            >
              <CheckCircle className="w-7 h-7" style={{ color: theme.primary }} />
            </div>

            <h2 className="text-xl font-bold mb-2 text-gray-900">
              Payment Successful 🎉
            </h2>

            <p className="text-sm text-gray-500 mb-4">
              Your order has been confirmed and is being processed.
            </p>

            <div
              className="text-xs p-3 rounded-xl"
              style={{
                backgroundColor: `${theme.primary}10`,
                color: theme.primaryText,
              }}
            >
              Reference: {reference}
            </div>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />

            <h2 className="text-lg font-bold text-gray-900">
              Payment Failed
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              We couldn’t confirm your payment. Please try again.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
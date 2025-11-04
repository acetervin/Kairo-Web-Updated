import React, { useState } from "react";
import { apiUrl } from "@/utils/apiConfig";

interface MpesaButtonProps {
  amount: string;
  currency: string;
  intent: string;
}

export default function MpesaButton({ amount, currency, intent }: MpesaButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const createOrder = async () => {
    const orderPayload = {
      amount: amount,
      currency: currency,
      intent: intent,
    };
    const response = await fetch(apiUrl("/api/mpesa/order"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });
    const output = await response.json();
    return { orderId: output.id };
  };

  const captureOrder = async (orderId: string) => {
    const response = await fetch(apiUrl(`/api/mpesa/order/${orderId}/capture`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data;
  };

  const onApprove = async (data: any) => {
    setLoading(true);
    try {
      const orderData = await captureOrder(data.orderId);
      setMessage("Payment successful!");
      console.log("Capture result", orderData);
    } catch (error) {
      setMessage("Payment failed.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onCancel = () => {
    setMessage("Payment cancelled.");
  };

  const onError = (error: any) => {
    setMessage("An error occurred during payment.");
    console.error(error);
  };

  const handleClick = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { orderId } = await createOrder();
      // Simulate payment approval for demo purposes
      await onApprove({ orderId });
    } catch (error) {
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="bg-white border border-gray-300 rounded-lg py-2 px-6 flex items-center justify-center space-x-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          "Processing..."
        ) : (
          <>
            <span className="font-bold text-lg text-gray-800">
              M-<span className="text-green-600">PESA</span>
            </span>
          </>
        )}
      </button>
      {message && <p className="mt-2 text-sm text-center">{message}</p>}
    </div>
  );
}

import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_51RORfCI0cIptDIR44TIePNPcAZhZyZATnmI1lTuKslHmd6pUFYZmUTcAvve1zyyR9ZGufTaJiwVvDOeiS4kFzrmv00ffYBpFO6";

console.log("Stripe publishable key:", stripePublishableKey ? "✓ Found" : "✗ Missing");
console.log("Environment variables:", import.meta.env);

if (!stripePublishableKey) {
  console.warn("Stripe publishable key not found. Payment functionality will be limited.");
}

export const stripePromise = loadStripe(stripePublishableKey || "");

export const createPaymentIntent = async (amount: number, bookingId?: number) => {
  try {
    const response = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        amount,
        bookingId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create payment intent");
    }

    const { clientSecret } = await response.json();
    return clientSecret;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
};

export const confirmPayment = async (paymentIntentId: string, bookingId: number) => {
  try {
    const response = await fetch("/api/confirm-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        paymentIntentId,
        bookingId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to confirm payment");
    }

    return await response.json();
  } catch (error) {
    console.error("Error confirming payment:", error);
    throw error;
  }
};

// Stripe configuration options
export const stripeOptions = {
  mode: "payment" as const,
  currency: "usd",
  appearance: {
    theme: "night" as const,
    variables: {
      colorPrimary: "#D4AF37", // gold-accent
      colorBackground: "#1B1C1F", // slate-panel
      colorText: "#EDEDED", // text-primary
      colorDanger: "#F16C6C", // alert-red
      borderRadius: "12px",
    },
    rules: {
      ".Input": {
        backgroundColor: "#1B1C1F",
        border: "1px solid #374151",
        color: "#EDEDED",
      },
      ".Input:focus": {
        borderColor: "#D4AF37",
      },
      ".Label": {
        color: "#EDEDED",
        fontWeight: "600",
      },
    },
  },
};

export default stripePromise;

"use client";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";

interface PayPalProviderProps {
  children: React.ReactNode;
}

const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

export default function PayPalProvider({ children }: PayPalProviderProps) {
  // If PayPal is not yet configured, render children without PayPal context
  if (!clientId || clientId === "your_paypal_client_id_here") {
    return <>{children}</>;
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: "EUR",
        intent: "capture",
        components: "buttons",
      }}
    >
      {children}
    </PayPalScriptProvider>
  );
}

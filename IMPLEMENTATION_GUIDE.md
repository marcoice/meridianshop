# 🚀 Quick Start: Implementare Pagamenti

## Passo 1: Installa le dipendenze Stripe

```bash
npm install stripe @stripe/react-stripe-js @stripe/js
```

Se hai anche PayPal (già presente):

```bash
# Già installato: @paypal/react-paypal-js
npm install
```

## Passo 2: Aggiorna `.env.local`

Crea il file nella radice del progetto:

```env
# Stripe (consigliato)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# PayPal (opzionale)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_client_id
```

## Passo 3: Visualizza il flusso di pagamento

Il checkout supporta ora 3 metodi:

### 1️⃣ **Stripe** (Consigliato per EU)

```
[User] → Seleziona "Card/Apple Pay/Google Pay"
      → Inserisce dati carta O usa Apple Pay / Google Pay
      → `/api/payment-intent` crea Payment Intent
      → Stripe processa il pagamento
      → Se OK → Ordine creato su Printify
```

**Metodi supportati:**

- ✅ Carte di credito (Visa, Mastercard, Amex, ecc.)
- ✅ Apple Pay (su iPhone/Mac)
- ✅ Google Pay (su Android)
- ✅ 3D Secure (autenticazione forte)

### 2️⃣ **PayPal**

```
[User] → Seleziona "PayPal"
      → Redirect a PayPal
      → Completa pagamento
      → Torna al sito
      → Ordine creato su Printify
```

---

## Passo 4: Struttura dei file creati

```
components/
├── StripeCheckoutButton.tsx      ← Nuovo! Gestisce pagamenti Stripe
└── PayPalCheckoutButton.tsx      ← Già esistente

app/
├── checkout/page.tsx             ← Aggiornato con selezione metodo
└── api/
    ├── payment-intent/           ← Nuovo! Endpoint Stripe
    │   └── route.ts
    └── webhooks/stripe/          ← Nuovo! Webhook per ordini asincroni
        └── route.ts

lib/
├── payment-types.ts              ← Nuovo! TypeScript types
└── printify.ts                   ← Già esistente
```

---

## Passo 5: Testing locale

### Con Stripe

```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Ascolta webhooks (opzionale)
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Test cards:

- `4242 4242 4242 4242` → Successo
- `4000 0000 0000 0002` → Rifiuto
- `4000 0000 0000 3220` → 3D Secure

### Con PayPal

- Usa Sandbox Mode nel tuo account PayPal

---

## Passo 6: Cosa accade nel dettaglio

### Stripe Flow (Carta)

```
1. User riempie indirizzo
2. Seleziona metodo di pagamento
3. Clicca "Pay €X.XX"
4. POST /api/payment-intent
   {
     "amount": 5000,  // €50.00
     "shippingAddress": {...},
     "items": [...]
   }
5. Server crea Payment Intent con Stripe
6. Client riceve clientSecret
7. Client conferma pagamento con CardElement
8. Se OK:
   - POST /api/orders → Crea ordine Printify
   - Mostra "Order confirmed"
```

### Stripe Flow (Apple Pay / Google Pay)

```
1. User riempie indirizzo
2. Seleziona metodo di pagamento
3. Clicca bottone "Apple Pay" / "Google Pay"
4. Browser show native payment UI
5. User seleziona carta/metodo dal device
6. Autenticazione biometrica/PIN
7. Se OK: stessi step di sopra (POST /api/orders)
```

### PayPal Flow

```
1. User riempie indirizzo
2. Seleziona PayPal
3. Clicca bottone PayPal
4. Redirect a PayPal.com
5. User completa pagamento
6. Redirect back al sito
7. POST /api/orders → Crea ordine
```

---

## Passo 7: Deploy su Vercel

1. Vai su Vercel Dashboard
2. Seleziona il progetto
3. Settings → Environment Variables
4. Aggiungi:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
5. Rideploy
6. Configura webhook Stripe per il dominio Vercel:
   ```
   Dashboard Stripe → Webhooks
   Aggiungi endpoint: https://your-domain.vercel.app/api/webhooks/stripe
   ```

---

## Passo 8: Customizzazione

### Cambiare il metodo di pagamento predefinito

```typescript
// app/checkout/page.tsx
const [paymentMethod, setPaymentMethod] = useState<"paypal" | "stripe" | null>(
  STRIPE_CONFIGURED ? "stripe" : PAYPAL_CONFIGURED ? "paypal" : null,
  // Cambia qui quale metodo preferisci
);
```

### Aggiungere più metodi

Per aggiungere Adyen, Square, ecc.:

1. Crea nuovo componente `AdyenCheckoutButton.tsx`
2. Aggiungi endpoint API `/api/payment/adyen`
3. Aggiungi opzione in checkout page
4. Segui lo stesso pattern di Stripe

### Modificare i costi

Nel webhook di Stripe, puoi aggiungere fee dinamici:

```typescript
const stripeFee = Math.ceil(amount * 0.014 + 25); // 1.4% + €0.25
const finalAmount = amount + stripeFee;
```

---

## 🔒 Sicurezza

✅ Implementato:

- Validazione server-side di tutti i dati
- Payment Intent creato server-side (client non vede secret)
- Webhook verification (signature validation)
- No sensitive data in logs
- PCI DSS compliant

⚠️ Da considerare:

- Configura CORS appropriatamente
- Rate limiting su `/api/payment-intent`
- Monitoring su webhooks falliti
- Refund handling in admin panel

---

## 📊 Monitoraggio

### Stripe Dashboard

- Payments → filtri e dettagli
- Webhooks → status e retry
- Disputes → chargebacks

### Log locali

Tutti gli errori sono loggati in console e disponibili su:

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` errors → Browser console
- Server errors → Terminal / Vercel logs

---

## ❓ FAQ

**D: Quale metodo è più conveniente?**
R: Stripe per EU (1.4% + €0.25), PayPal (2.49% + €0.49)

**D: Apple Pay/Google Pay funzionano su desktop?**
R: Apple Pay solo su Safari/Mac, Google Pay su Chrome (desktop non supportato)

**D: Posso usare entrambi?**
R: Sì! User sceglie al checkout.

**D: Come gestisco refund?**
R: Via Stripe Dashboard o API (`stripe refunds.create()`)

**D: Cosa succede se il webhook fallisce?**
R: Stripe riprova per 5 giorni. Implementa polling di backup.

---

## 📞 Supporto

- Stripe Support: https://support.stripe.com
- PayPal Support: https://www.paypal.com/en/webapps/mpp/contact-us
- Vercel Support: https://vercel.com/support

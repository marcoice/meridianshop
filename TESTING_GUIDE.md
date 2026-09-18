# 🧪 Testing Payments Locally

## Setup per Testing Locale

### 1. Installa Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows (usando Scoop)
scoop install stripe

# Linux
curl https://files.stripe.com/stripe-cli/install.sh -o install.sh && sh install.sh

# Windows (Manual download)
# https://github.com/stripe/stripe-cli/releases
```

### 2. Configura Stripe CLI

```bash
# Login con il tuo account Stripe
stripe login

# Output: Your pairing code is: pc_...
# Clicca il link e autorizza
```

### 3. Avvia il webhook listener

```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Ascolta webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Output: Ready! Your webhook signing secret is: whsec_test_...
```

### 4. Aggiungi il secret a `.env.local`

```env
STRIPE_WEBHOOK_SECRET=whsec_test_... # Dal comando sopra
```

---

## Testing Stripe Payments

### Test Cards

| Card Number           | Name                 | Result                     |
| --------------------- | -------------------- | -------------------------- |
| `4242 4242 4242 4242` | Visa (Success)       | ✅ Payment succeeds        |
| `4000 0000 0000 0002` | Visa (Fail)          | ❌ Payment declined        |
| `4000 0000 0000 3220` | Visa (3D Secure)     | 🔐 Requires authentication |
| `5555 5555 5555 4444` | Mastercard (Success) | ✅ Payment succeeds        |
| `5200 0000 0000 0007` | Mastercard (Fail)    | ❌ Payment declined        |
| `3782 822463 10005`   | Amex (Success)       | ✅ Payment succeeds        |
| `6011 1111 1111 1117` | Discover (Success)   | ✅ Payment succeeds        |

### Scadenze e CVV

- **Scadenza**: Qualsiasi data futura (es. `12/25`)
- **CVV**: Qualsiasi numero di 3-4 cifre (es. `123`)
- **Nome**: Qualsiasi testo

---

## Testing nel Browser

### Step-by-step

1. Vai a `http://localhost:3000/checkout`
2. Compila il modulo di indirizzo:
   ```
   First name: John
   Last name: Doe
   Email: john@example.com
   Phone: +1 (555) 123-4567
   Country: US
   Address: 123 Main St
   City: New York
   ZIP: 10001
   ```
3. Clicca "Continue to payment"
4. Seleziona "Card / Apple Pay / Google Pay"
5. Compila la carta:
   ```
   Card: 4242 4242 4242 4242
   Date: 12/25
   CVC: 123
   Name: John Doe
   ```
6. Clicca "Pay €..."

### Risultati attesi

✅ Success (`4242...`):

```
→ Payment processing...
→ ✓ Order confirmed!
→ Webhook ricevuto: payment_intent.succeeded
→ Ordine creato su Printify
```

❌ Failure (`4000 0000 0000 0002`):

```
→ Payment processing...
→ ❌ Error: Card declined
→ Back to payment form
→ Nessun webhook inviato
```

---

## Testing Webhooks

### Trigger manuale di webhook

```bash
# Simula un pagamento riuscito
stripe trigger payment_intent.succeeded

# Simula un pagamento fallito
stripe trigger payment_intent.payment_failed

# Simula altre event
stripe trigger charge.refunded
stripe trigger customer.created
```

### Verifica webhook in arrivo

```bash
# Terminal con stripe listen
# Vedrai:
# 2024-09-18 14:30:00   --> payment_intent.succeeded [evt_test_...]
# 2024-09-18 14:30:00   <--  [200] Request processed successfully
```

### Debug webhook nel codice

Aggiungi logging in `/api/webhooks/stripe/route.ts`:

```typescript
export async function POST(request: Request) {
  const body = await request.text();
  console.log("🔔 Webhook ricevuto:");
  console.log(body);
  // ... resto del codice
}
```

---

## Testing Apple Pay e Google Pay

### Apple Pay

**Solo su Safari/Mac**

```bash
# 1. Assicurati di avere Safari
# 2. Vai su https://localhost:3000/checkout
#    (Nota: HTTPS required, non HTTP)
# 3. Vedrai bottone "Apple Pay"
# 4. Usa il test payment method di Apple
```

### Google Pay

**Solo su Chrome/Android**

```bash
# 1. Usa Chrome nel dev server
# 2. Apri Chrome DevTools (F12)
# 3. Simula un device Android:
#    - Ctrl+Shift+M per device mode
#    - Seleziona "Pixel 5" o altro Android
# 4. Ricarica la pagina
# 5. Vedrai bottone "Google Pay"
# 6. Clicca e testa
```

---

## Testing PayPal

### Sandbox Testing

1. Vai a https://developer.paypal.com
2. Sandbox → Accounts
3. Crea 2 test accounts:
   - **Business**: Riceve pagamenti
   - **Personal**: Invia pagamenti
4. Usa Personal per fare test

### Flusso di pagamento

```bash
# 1. Checkout → Seleziona PayPal
# 2. Clicca bottone PayPal
# 3. Redirect a sandbox.paypal.com
# 4. Login con Personal account
# 5. Approva pagamento
# 6. Redirect back a checkout
# 7. Vedrai "Order confirmed"
```

---

## Network Inspection

### Vedi tutte le API calls

1. Apri Chrome DevTools (F12)
2. Network tab
3. Filtra per `api/`

#### Payment Intent Request

```
POST /api/payment-intent
Content-Type: application/json

{
  "amount": 5000,
  "items": [...],
  "shippingAddress": {...}
}

Response:
{
  "clientSecret": "pi_test_...",
  "id": "pi_test_..."
}
```

#### Order Creation Request

```
POST /api/orders
Content-Type: application/json

{
  "line_items": [...],
  "shipping_method": 1,
  "address_to": {...}
}

Response:
{
  "id": "...",
  "status": "draft",
  ...
}
```

---

## Environment Variables per Testing

Aggiungi queste a `.env.local`:

```env
# Stripe Test Mode
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# PayPal Sandbox
NEXT_PUBLIC_PAYPAL_CLIENT_ID=ABc...  # Sandbox client ID

# Debugging
NODE_ENV=development
DEBUG=*
```

---

## Troubleshooting

### "Webhook secret not found"

```
✓ Esegui: stripe listen --forward-to localhost:3000/api/webhooks/stripe
✓ Copia il STRIPE_WEBHOOK_SECRET
✓ Aggiungi a .env.local
```

### "Payment Intent failed"

```
✓ Controlla STRIPE_SECRET_KEY
✓ Verifica amount > 0
✓ Controlla i logs di Stripe Dashboard
✓ Usa test card 4242 4242 4242 4242
```

### "Apple Pay not showing"

```
✓ Solo su Safari (non Chrome)
✓ Deve essere HTTPS (non localhost funziona con Safari)
✓ Verifica Stripe configurata
```

### "Google Pay not showing"

```
✓ Usa Chrome (non Safari)
✓ Simula device Android con DevTools
✓ Controlla che Stripe sia configurata
```

### "Order non creato dopo pagamento"

```
✓ Controlla webhook listener è attivo
✓ Verifica STRIPE_WEBHOOK_SECRET
✓ Vedi i logs nel terminal con stripe listen
✓ Controlla Printify API keys
```

---

## Mock Testing (senza Stripe)

Se vuoi testare senza connessione Stripe:

```typescript
// app/api/payment-intent/route.ts (mock mode)
if (process.env.NODE_ENV === "test") {
  return NextResponse.json({
    clientSecret: "pi_test_mock_",
    id: "pi_test_mock_",
  });
}
```

Aggiungi a `.env.local`:

```
NODE_ENV=test
```

---

## Continuous Testing

### Crea uno script di test

```bash
#!/bin/bash
# test-payment.sh

echo "Testing payment flow..."

# 1. Create payment intent
curl -X POST http://localhost:3000/api/payment-intent \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "shippingAddress": {
      "first_name": "John",
      "last_name": "Doe",
      "email": "test@example.com",
      "phone": "+1 555-0123",
      "country": "US",
      "address1": "123 Main St",
      "city": "NYC",
      "zip": "10001"
    },
    "items": []
  }'
```

Esegui:

```bash
chmod +x test-payment.sh
./test-payment.sh
```

---

## Monitoring in Produzione

Una volta su Vercel:

1. **Stripe Dashboard**
   - https://dashboard.stripe.com/payments
   - Vedi tutte le transazioni
   - Debug payments falliti

2. **Vercel Logs**
   - https://vercel.com → Project → Deployments → Logs
   - Vedi errori API

3. **Email notifications**
   - Setup nel tuo account Stripe
   - Ricevi alerts per pagamenti falliti

---

## Best Practices

✅ Sempre testare locale prima di puscare
✅ Usare test card numbers ufficiali
✅ Monitorare webhook failures
✅ Implementare retry logic
✅ Logga tutti i pagamenti
✅ Test in staging prima di produzione

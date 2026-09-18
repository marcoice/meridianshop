# ⚡ Quick Setup Checklist

Seguire questi step in ordine per implementare i pagamenti.

## ✅ Step 1: Installa i pacchetti

```bash
npm install stripe @stripe/react-stripe-js @stripe/js
```

**Alternativa**: Se npm ha problemi di connessione, aggiungi manualmente a `package.json`:

```json
{
  "dependencies": {
    "@stripe/js": "^6.9.0",
    "@stripe/react-stripe-js": "^2.9.0",
    "stripe": "^17.1.0"
  }
}
```

Poi esegui `npm install`

---

## ✅ Step 2: Configura variabili d'ambiente

Crea `.env.local` nella radice del progetto:

```env
# Stripe (richiesto per Apple Pay / Google Pay / Carte)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51234567890...
STRIPE_SECRET_KEY=sk_test_51234567890...
STRIPE_WEBHOOK_SECRET=whsec_test_123456...

# PayPal (opzionale)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=ABc123def456...
PAYPAL_SECRET_KEY=EFg789hij012...
```

**Dove ottenere le chiavi:**

- **Stripe**: https://dashboard.stripe.com/apikeys
- **PayPal**: https://developer.paypal.com/apps-and-credentials
- **Webhook Secret**: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

---

## ✅ Step 3: Verifica i file creati

Controlla che questi file siano presenti:

```
components/
├── StripeCheckoutButton.tsx       ← NUOVO
└── PayPalCheckoutButton.tsx       ✓ (già presente)

app/
├── checkout/page.tsx              ← MODIFICATO
└── api/
    ├── payment-intent/            ← NUOVO
    │   └── route.ts
    ├── orders/route.ts            ✓ (già presente)
    └── webhooks/stripe/           ← NUOVO
        └── route.ts

lib/
├── payment-types.ts               ← NUOVO
├── payment-utils.ts               ← NUOVO
├── types.ts                       ✓ (già presente)
└── printify.ts                    ✓ (già presente)

Docs/
├── PAYMENT_SETUP.md               ← NUOVO
├── IMPLEMENTATION_GUIDE.md        ← NUOVO
├── TESTING_GUIDE.md               ← NUOVO
├── ARCHITECTURE.md                ← NUOVO
└── SETUP_CHECKLIST.md             ← QUESTO FILE
```

---

## ✅ Step 4: Testa localmente

```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Webhook listener (se usi Stripe)
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Test pagamento Stripe

1. Vai a http://localhost:3000/checkout
2. Riempi il form (ex: John Doe, john@example.com)
3. Clicca "Continue to payment"
4. Seleziona "Card"
5. Usa: `4242 4242 4242 4242` (test card)
6. Scadenza: `12/25`
7. CVC: `123`
8. Clicca "Pay €..."
9. ✓ Dovrebbe mostrare "Order confirmed"

### Test pagamento PayPal

1. Seleziona "PayPal" al checkout
2. Clicca bottone PayPal
3. Usa sandbox account da https://developer.paypal.com
4. Approva pagamento
5. Torna al sito e vedi "Order confirmed"

---

## ✅ Step 5: Deploy su Vercel

1. Vai su https://vercel.com/dashboard
2. Seleziona il tuo progetto
3. Settings → Environment Variables
4. Aggiungi:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_...
   STRIPE_SECRET_KEY = sk_live_...
   STRIPE_WEBHOOK_SECRET = whsec_live_...
   NEXT_PUBLIC_PAYPAL_CLIENT_ID = (sandbox o live)
   ```
5. Clicca "Save"
6. Vercel rideploy automaticamente

---

## ✅ Step 6: Configura webhook Stripe per Produzione

```bash
# 1. Login a Stripe
stripe login

# 2. Vai su https://dashboard.stripe.com/webhooks
# 3. Aggiungi endpoint:
#    URL: https://your-domain.vercel.app/api/webhooks/stripe
#    Events: payment_intent.succeeded, payment_intent.payment_failed
# 4. Salva e copia il signing secret
# 5. Aggiungi in Vercel env: STRIPE_WEBHOOK_SECRET
```

---

## ✅ Step 7 (Opzionale): Abilita solo Stripe

Se vuoi disabilitare PayPal e usare solo Stripe:

1. Rimuovi dipendenza PayPal:

   ```bash
   npm uninstall @paypal/react-paypal-js
   ```

2. Rimuovi variabili `.env.local`:

   ```
   # NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
   # PAYPAL_SECRET_KEY=...
   ```

3. Modifica `app/checkout/page.tsx`:
   ```typescript
   const paymentMethod = "stripe"; // Forza Stripe come unico metodo
   ```

---

## ✅ Step 8 (Opzionale): Customizzazione Branding

### Colori Stripe

In `components/StripeCheckoutButton.tsx`:

```typescript
const CARD_STYLE = {
  base: {
    fontSize: "16px",
    color: "#C9A84C", // Cambia colore
    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
  },
};
```

### Testi custom

In `app/checkout/page.tsx`:

```typescript
"Pay €{totalEur}"; // Cambia il testo del bottone
```

---

## 🔍 Verifica di funzionamento

### Checklist finale

- [ ] Variabili d'ambiente configurate (`.env.local`)
- [ ] Dipendenze installate (`npm install`)
- [ ] Dev server avviato (`npm run dev`)
- [ ] Webhook listener attivo (se Stripe)
- [ ] Test pagamento Stripe eseguito
- [ ] Test pagamento PayPal eseguito (se abilitato)
- [ ] Ordine creato su Printify
- [ ] Email di conferma ricevuta
- [ ] Webhook ricevuti (stripe logs)
- [ ] Pagina "Order confirmed" mostra

---

## 📊 Costi operativi (stima EU)

### Stripe

- €0.014 per 1€ + €0.25 flat = ~1.64% per transazione
- Es: €100 → €1.64 commissione

### PayPal

- €0.0249 per 1€ + €0.49 flat = ~2.98% per transazione
- Es: €100 → €2.98 commissione

### Printify

- Varia per prodotto
- Controllare dashboard Printify

---

## 🐛 Troubleshooting rapido

| Errore                            | Soluzione                                                              |
| --------------------------------- | ---------------------------------------------------------------------- |
| "Cannot find module '@stripe/js'" | `npm install stripe @stripe/react-stripe-js @stripe/js`                |
| "Missing STRIPE_WEBHOOK_SECRET"   | Esegui `stripe listen --forward-to localhost:3000/api/webhooks/stripe` |
| "Payment failed"                  | Usa test card `4242 4242 4242 4242`                                    |
| "Apple Pay not showing"           | Deve essere HTTPS e Safari                                             |
| "Google Pay not showing"          | Simula Android device in Chrome DevTools                               |
| "Order non creato"                | Verifica webhook listener e Printify API key                           |
| "CORS error"                      | Controlla che API response headers siano corretti                      |

---

## 📞 Supporto

- **Stripe**: https://support.stripe.com
- **PayPal**: https://developer.paypal.com/docs
- **Vercel**: https://vercel.com/support
- **Printify**: https://printify.com/support

---

## 📝 Note importanti

⚠️ **Non commettere nel git:**

- `.env.local` (aggiungere a `.gitignore`)
- Chiavi API di produzione
- Secret keys

✅ **Sempre:**

- Testare locale prima di pushare
- Usare variabili d'ambiente
- Validare input server-side
- Loggare transazioni importanti

🔒 **Sicurezza:**

- Mai logare card number
- Stripe gestisce PCI compliance
- Webhook signatures verificate
- HTTPS in produzione

---

## ✅ Cosa è implementato

- ✅ Pagamenti Stripe (carte, Apple Pay, Google Pay)
- ✅ Pagamenti PayPal (alternativa)
- ✅ Selezione metodo di pagamento
- ✅ Validazione indirizzo
- ✅ Integrazione Printify
- ✅ Webhook handling
- ✅ Email di conferma
- ✅ Error handling completo
- ✅ Responsive design

---

## 🚀 Cosa puoi aggiungere

- Refund API
- Admin panel per ordini
- Tracking spedizione
- Multiple lingue
- Gift cards
- Subscription payments
- Inventory management
- Analytics dashboard

---

**Sei pronto! Inizia dal Step 1 e segui l'ordine.** ✨

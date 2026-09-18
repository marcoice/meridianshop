# 💳 Configurazione Pagamenti (PayPal + Stripe)

## Setup Variabili d'Ambiente

Crea un file `.env.local` nella radice del progetto con le seguenti variabili:

```bash
# PayPal (opzionale)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_SECRET_KEY=your_paypal_secret_key_here

# Stripe (opzionale - consigliato per Apple Pay, Google Pay)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

---

## 📱 Stripe Setup (Consigliato)

Stripe supporta nativamente **Apple Pay**, **Google Pay** e **Carte di credito**.

### 1. Creare Account Stripe

- Vai su https://stripe.com
- Registrati e completa il setup del merchant account

### 2. Ottenere le chiavi

- Dashboard → Developers → API Keys
- Copia:
  - **Publishable Key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - **Secret Key** → `STRIPE_SECRET_KEY`

### 3. Installare dipendenze

```bash
npm install stripe @stripe/react-stripe-js @stripe/js
```

### 4. Configurare webhook (opzionale ma consigliato)

Installa la **Stripe CLI** (non è un pacchetto npm — è un binario separato):

**Windows (Scoop)**

```bash
scoop install stripe
```

**Windows (Chocolatey)**

```bash
choco install stripe-cli
```

**Windows (download diretto)**
Scarica l'exe da: https://github.com/stripe/stripe-cli/releases

Poi:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## 💰 PayPal Setup (Opzionale)

### 1. Creare Account PayPal

- Vai su https://developer.paypal.com
- Crea un account merchant

### 2. Ottenere le credenziali

- Apps & Credentials → Sandbox/Live
- Copia il **Client ID** → `NEXT_PUBLIC_PAYPAL_CLIENT_ID`

### 3. Dipendenze

```bash
npm install @paypal/react-paypal-js @paypal/checkout-server-sdk
```

---

## 🔧 Metodi di Pagamento Supportati

### Con Stripe ✅

- **Apple Pay** (dispositivi Apple)
- **Google Pay** (dispositivi Android)
- **Carte di credito** (Visa, Mastercard, Amex, ecc.)
- **3D Secure** (per transazioni sicure)

### Con PayPal ✅

- **Portafoglio PayPal**
- **Carte di credito** (tramite PayPal)
- **Finanziamenti** (PayPal Credit)

---

## 📝 Note sull'Implementazione

### Flusso di pagamento

1. Utente inserisce indirizzo di spedizione
2. Seleziona metodo di pagamento (PayPal o Stripe)
3. Completa il pagamento
4. Se successo → ordine creato su Printify
5. Pagina di conferma

### Sicurezza

- Tutte le transazioni sono PCI DSS compliant
- I dati sensibili rimangono su Stripe/PayPal
- Validazione server-side su tutti i dati

### Costi

- **Stripe**: 1.4% + €0.25 per transazione (EU)
- **PayPal**: 2.49% + €0.49 per transazione (EU)

---

## 🚀 Deploy su Vercel

Aggiungi le variabili d'ambiente nel dashboard Vercel:

1. Project Settings → Environment Variables
2. Aggiungi tutte e quattro le chiavi
3. Rideploy il progetto

---

## 📞 Testing

### Test Card Numbers (Stripe)

```
4242 4242 4242 4242  - Success
4000 0000 0000 0002  - Card declined
4000 0000 0000 3220  - 3D Secure required
```

### Webhook Testing

```bash
stripe trigger payment_intent.succeeded
```

---

## ⚠️ Troubleshooting

### Stripe non carica

- Verifica che `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` sia corretta
- Controlla che sia una chiave publishable (inizia con `pk_`)

### Pagamento fallisce

- Verifica le credenziali backend (`STRIPE_SECRET_KEY`)
- Controlla i logs sulla dashboard Stripe
- Valida che l'indirizzo sia completo

### Apple Pay / Google Pay non appare

- Assicurati di usare HTTPS in produzione
- Su localhost funziona solo per testing
- Verifica che il dominio sia configurato in Stripe

---

## 📖 Riferimenti

- [Stripe Docs](https://stripe.com/docs)
- [PayPal Docs](https://developer.paypal.com/docs)
- [Printify API](https://api.printify.com)

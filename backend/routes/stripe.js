import { Router } from 'express'
import Stripe from 'stripe'

const router = Router()

let stripe = null
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
}

router.post('/create-checkout-session', async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Stripe not configured' })

  const { userId, email } = req.body
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: 'Sıla Yolu AI Premium', description: 'Alle Premium Features' },
          unit_amount: 990,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?premium=success`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?premium=cancel`,
      metadata: { userId },
      customer_email: email,
    })
    res.json({ url: session.url })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) return res.sendStatus(400)
  const sig = req.headers['stripe-signature']
  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      console.log('Premium aktiviert für userId:', session.metadata.userId)
    }
    res.json({ received: true })
  } catch (e) {
    res.status(400).send(`Webhook Error: ${e.message}`)
  }
})

export default router

import { createSubscription, recordPayment, validatePromoCode, usePromoCode } from '../../../lib/revenue'
import { getSubscriptionPlans } from '../../../lib/revenue'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId, planId, period, promoCode, paymentMethod } = req.body

  if (!userId || !planId) {
    return res.status(400).json({ error: 'User ID and Plan ID required' })
  }

  try {
    const plans = await getSubscriptionPlans()
    const plan = plans.find(p => p.Plan_ID === planId)

    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan' })
    }

    let amount = period === 'monthly' ? parseFloat(plan.Price_Monthly) : parseFloat(plan.Price_Yearly)
    let discount = null

    if (promoCode) {
      discount = await validatePromoCode(promoCode, planId)
      if (discount) {
        if (discount.discountType === 'percentage') {
          amount = amount * (1 - discount.discountValue / 100)
        } else {
          amount = amount - discount.discountValue
        }
        await usePromoCode(promoCode, planId)
      }
    }

    // Here integrate with Stripe
    // const stripePayment = await createStripePayment(userId, amount, planId, period)

    const subscriptionId = await createSubscription(userId, planId, period)
    
    await recordPayment(
      userId,
      amount,
      plan.Currency,
      `${planId}_${period}`,
      paymentMethod,
      'stripe_payment_id' // stripePayment.id
    )

    res.status(200).json({
      success: true,
      subscriptionId,
      amount,
      discount
    })
  } catch (error) {
    console.error('Subscription error:', error)
    res.status(500).json({ error: 'Failed to create subscription' })
  }
}

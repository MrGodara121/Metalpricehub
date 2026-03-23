import { getAffiliateEarnings, getTotalAffiliateEarnings } from '../../../lib/revenue'

export default async function handler(req, res) {
  const { affiliateId } = req.query

  if (!affiliateId) {
    return res.status(400).json({ error: 'Affiliate ID required' })
  }

  try {
    const earnings = await getAffiliateEarnings(affiliateId)
    const total = await getTotalAffiliateEarnings(affiliateId)

    res.status(200).json({
      earnings,
      total,
      pending: earnings.filter(e => e.Status === 'pending').reduce((sum, e) => sum + parseFloat(e.Commission), 0),
      paid: earnings.filter(e => e.Status === 'paid').reduce((sum, e) => sum + parseFloat(e.Commission), 0)
    })
  } catch (error) {
    console.error('Affiliate earnings error:', error)
    res.status(500).json({ error: 'Failed to fetch earnings' })
  }
}

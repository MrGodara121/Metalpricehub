import { trackAffiliateClick } from '../../../lib/revenue'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId, partnerId } = req.body

  if (!partnerId) {
    return res.status(400).json({ error: 'Partner ID required' })
  }

  try {
    await trackAffiliateClick(userId || 'anonymous', partnerId)
    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Affiliate click error:', error)
    res.status(500).json({ error: 'Failed to track click' })
  }
}

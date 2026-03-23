import { getRevenueAnalytics, getMonthlyRevenue } from '../../../lib/revenue'
import { authenticateAdmin } from '../../../lib/utils/auth'

export default async function handler(req, res) {
  const admin = authenticateAdmin(req)
  if (!admin) {
    return res.status(401).json({ error: 'Admin access required' })
  }

  const { startDate, endDate, year, month } = req.query

  try {
    let data
    if (year && month) {
      data = await getMonthlyRevenue(year, month)
    } else if (startDate && endDate) {
      data = await getRevenueAnalytics(startDate, endDate)
    } else {
      data = await getRevenueAnalytics(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      )
    }

    const summary = {
      totalRevenue: data.reduce((sum, d) => sum + parseFloat(d.Total_Revenue), 0),
      totalAdRevenue: data.reduce((sum, d) => sum + parseFloat(d.Ad_Revenue), 0),
      totalAffiliateRevenue: data.reduce((sum, d) => sum + parseFloat(d.Affiliate_Revenue), 0),
      totalSubscriptionRevenue: data.reduce((sum, d) => sum + parseFloat(d.Subscription_Revenue), 0),
      totalNewSubscribers: data.reduce((sum, d) => sum + parseInt(d.New_Subscribers), 0),
      totalAffiliateClicks: data.reduce((sum, d) => sum + parseInt(d.Affiliate_Clicks), 0),
      totalAffiliateSales: data.reduce((sum, d) => sum + parseInt(d.Affiliate_Sales), 0)
    }

    res.status(200).json({ data, summary })
  } catch (error) {
    console.error('Revenue analytics error:', error)
    res.status(500).json({ error: 'Failed to fetch analytics' })
  }
}

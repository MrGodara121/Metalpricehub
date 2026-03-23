import { getSheetData, appendToSheet, updateSheet } from './sheets'
import { getConfig } from './sheets'

// ==================== ADSENSE ====================

export async function getAdsenseConfig() {
  const data = await getSheetData('adsense_config')
  const config = {}
  data.forEach(item => { config[item.Key] = item.Value })
  return config
}

export function shouldShowAds(userPlan) {
  const config = getAdsenseConfig()
  if (config.disable_ads_for_pro === 'TRUE' && userPlan !== 'free') {
    return false
  }
  return config.adsense_enabled === 'TRUE'
}

export function getAdSlots() {
  return {
    sidebar: process.env.AD_SLOT_SIDEBAR,
    in_content: process.env.AD_SLOT_IN_CONTENT,
    header: process.env.AD_SLOT_HEADER,
    footer: process.env.AD_SLOT_FOOTER
  }
}

// ==================== AFFILIATE ====================

export async function getAffiliateConfig() {
  const data = await getSheetData('affiliate_config')
  const config = {}
  data.forEach(item => { config[item.Key] = item.Value })
  return config
}

export async function getAffiliatePartners() {
  return await getSheetData('affiliate_partners')
}

export async function generateAffiliateLink(userId, partnerId, productUrl) {
  const config = await getAffiliateConfig()
  const partners = await getAffiliatePartners()
  const partner = partners.find(p => p.Partner_ID === partnerId)
  
  if (!partner) return productUrl
  
  const trackingUrl = `${partner.Website}/?ref=${partner.API_KEY}&uid=${userId}`
  return trackingUrl
}

export async function trackAffiliateClick(userId, partnerId) {
  const config = await getAffiliateConfig()
  const now = new Date().toISOString()
  
  await appendToSheet('affiliate_clicks', [
    `click-${Date.now()}`,
    userId,
    partnerId,
    now,
    'pending'
  ])
}

export async function trackAffiliateSale(userId, partnerId, saleAmount, orderId) {
  const config = await getAffiliateConfig()
  const partners = await getAffiliatePartners()
  const partner = partners.find(p => p.Partner_ID === partnerId)
  
  let commission = 0
  if (partner.Commission_Type === 'percentage') {
    commission = saleAmount * (partner.Commission_Rate / 100)
  } else {
    commission = partner.Commission_Rate
  }
  
  const transactionId = `tr-${Date.now()}`
  
  await appendToSheet('affiliate_earnings', [
    transactionId,
    userId,
    partnerId,
    saleAmount,
    commission,
    partner.Commission_Type,
    'pending',
    new Date().toISOString(),
    ''
  ])
  
  return { transactionId, commission }
}

export async function getAffiliateEarnings(affiliateId) {
  const earnings = await getSheetData('affiliate_earnings')
  return earnings.filter(e => e.Affiliate_ID === affiliateId)
}

export async function getTotalAffiliateEarnings(affiliateId) {
  const earnings = await getAffiliateEarnings(affiliateId)
  const total = earnings.reduce((sum, e) => sum + parseFloat(e.Commission), 0)
  return total
}

// ==================== SUBSCRIPTIONS ====================

export async function getSubscriptionPlans() {
  return await getSheetData('subscription_plans')
}

export async function getFeaturesMatrix() {
  return await getSheetData('features_matrix')
}

export async function getUserFeatures(userPlan) {
  const features = await getFeaturesMatrix()
  const userFeatures = {}
  features.forEach(feature => {
    userFeatures[feature.Feature] = feature[userPlan] || feature.Free
  })
  return userFeatures
}

export async function createSubscription(userId, planId, period = 'monthly') {
  const plans = await getSubscriptionPlans()
  const plan = plans.find(p => p.Plan_ID === planId)
  
  if (!plan) throw new Error('Plan not found')
  
  const amount = period === 'monthly' ? plan.Price_Monthly : plan.Price_Yearly
  const startDate = new Date().toISOString().split('T')[0]
  const endDate = new Date()
  endDate.setMonth(endDate.getMonth() + (period === 'monthly' ? 1 : 12))
  
  const subscriptionId = `sub-${Date.now()}`
  
  await appendToSheet('subscription_users', [
    userId,
    planId,
    'active',
    startDate,
    endDate.toISOString().split('T')[0],
    'TRUE',
    'stripe',
    startDate,
    endDate.toISOString().split('T')[0],
    subscriptionId
  ])
  
  return subscriptionId
}

export async function cancelSubscription(userId) {
  const subscriptions = await getSheetData('subscription_users')
  const userSub = subscriptions.find(s => s.User_ID === userId && s.Status === 'active')
  
  if (userSub) {
    const rowIndex = subscriptions.indexOf(userSub) + 2
    await updateSheet('subscription_users', `F${rowIndex}`, [['FALSE']]) // Auto Renew = FALSE
    await updateSheet('subscription_users', `D${rowIndex}`, [['cancelled']]) // Status = cancelled
  }
}

export async function recordPayment(userId, amount, currency, plan, paymentMethod, stripeId) {
  await appendToSheet('payment_transactions', [
    `pay-${Date.now()}`,
    userId,
    plan,
    amount,
    currency,
    'completed',
    paymentMethod,
    stripeId,
    new Date().toISOString()
  ])
  
  // Update revenue analytics
  const today = new Date().toISOString().split('T')[0]
  const analytics = await getSheetData('revenue_analytics')
  const todayData = analytics.find(a => a.Date === today)
  
  if (todayData) {
    const rowIndex = analytics.indexOf(todayData) + 2
    const newSubs = parseInt(todayData.New_Subscribers) + 1
    const newRevenue = parseFloat(todayData.Subscription_Revenue) + amount
    await updateSheet('revenue_analytics', `F${rowIndex}`, [[newSubs.toString()]])
    await updateSheet('revenue_analytics', `E${rowIndex}`, [[newRevenue.toString()]])
  } else {
    await appendToSheet('revenue_analytics', [
      today,
      '0',
      '0',
      amount.toString(),
      amount.toString(),
      '1',
      '1',
      '0',
      '0'
    ])
  }
}

// ==================== PROMO CODES ====================

export async function validatePromoCode(code, planId) {
  const promos = await getSheetData('promo_codes')
  const promo = promos.find(p => p.Code === code && p.Plan === planId && p.Is_Active === 'TRUE')
  
  if (!promo) return null
  
  const today = new Date().toISOString().split('T')[0]
  if (promo.Valid_From > today || promo.Valid_To < today) return null
  
  if (parseInt(promo.Max_Uses) <= parseInt(promo.Used_Count)) return null
  
  return {
    discountType: promo.Discount_Type,
    discountValue: parseFloat(promo.Discount_Value),
    code: promo.Code
  }
}

export async function usePromoCode(code, planId) {
  const promos = await getSheetData('promo_codes')
  const promoIndex = promos.findIndex(p => p.Code === code && p.Plan === planId)
  
  if (promoIndex !== -1) {
    const rowIndex = promoIndex + 2
    const newCount = parseInt(promos[promoIndex].Used_Count) + 1
    await updateSheet('promo_codes', `K${rowIndex}`, [[newCount.toString()]])
  }
}

// ==================== REVENUE ANALYTICS ====================

export async function updateRevenueAnalytics(date, data) {
  const analytics = await getSheetData('revenue_analytics')
  const existing = analytics.find(a => a.Date === date)
  
  if (existing) {
    const rowIndex = analytics.indexOf(existing) + 2
    await updateSheet('revenue_analytics', `B${rowIndex}`, [[data.adRevenue.toString()]])
    await updateSheet('revenue_analytics', `C${rowIndex}`, [[data.affiliateRevenue.toString()]])
    await updateSheet('revenue_analytics', `D${rowIndex}`, [[data.subscriptionRevenue.toString()]])
    await updateSheet('revenue_analytics', `E${rowIndex}`, [[data.totalRevenue.toString()]])
    await updateSheet('revenue_analytics', `F${rowIndex}`, [[data.newSubscribers.toString()]])
    await updateSheet('revenue_analytics', `G${rowIndex}`, [[data.activeSubscribers.toString()]])
    await updateSheet('revenue_analytics', `H${rowIndex}`, [[data.affiliateClicks.toString()]])
    await updateSheet('revenue_analytics', `I${rowIndex}`, [[data.affiliateSales.toString()]])
  } else {
    await appendToSheet('revenue_analytics', [
      date,
      data.adRevenue,
      data.affiliateRevenue,
      data.subscriptionRevenue,
      data.totalRevenue,
      data.newSubscribers,
      data.activeSubscribers,
      data.affiliateClicks,
      data.affiliateSales
    ])
  }
}

export async function getRevenueAnalytics(startDate, endDate) {
  const analytics = await getSheetData('revenue_analytics')
  return analytics.filter(a => a.Date >= startDate && a.Date <= endDate)
}

export async function getMonthlyRevenue(year, month) {
  const analytics = await getSheetData('revenue_analytics')
  const monthStr = `${year}-${month.toString().padStart(2, '0')}`
  return analytics.filter(a => a.Date.startsWith(monthStr))
}

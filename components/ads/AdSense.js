import { useEffect } from 'react'
import { shouldShowAds, getAdSlots } from '../../lib/revenue'

export default function AdSense({ type = 'sidebar', userPlan = 'free' }) {
  const [showAds, setShowAds] = useState(false)
  const [adCode, setAdCode] = useState('')

  useEffect(() => {
    const show = shouldShowAds(userPlan)
    setShowAds(show)
    
    if (show && typeof window !== 'undefined') {
      const slots = getAdSlots()
      const slotId = slots[type]
      
      setAdCode(`
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-client="${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}"
             data-ad-slot="${slotId}"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script>
          (adsbygoogle = window.adsbygoogle || []).push({});
        </script>
      `)
    }
  }, [type, userPlan])

  if (!showAds) return null

  return (
    <div className="ad-container my-4">
      <div className="text-xs text-gray-400 text-center mb-1">Advertisement</div>
      <div dangerouslySetInnerHTML={{ __html: adCode }} />
    </div>
  )
}

import { useState } from 'react'
import { generateAffiliateLink, trackAffiliateClick } from '../../lib/revenue'

export default function AffiliateLink({ partnerId, productUrl, children, className }) {
  const [clicked, setClicked] = useState(false)
  const [link, setLink] = useState(productUrl)

  useEffect(() => {
    const userId = localStorage.getItem('userId')
    generateAffiliateLink(userId, partnerId, productUrl).then(setLink)
  }, [partnerId, productUrl])

  const handleClick = async () => {
    if (!clicked) {
      const userId = localStorage.getItem('userId')
      await trackAffiliateClick(userId, partnerId)
      setClicked(true)
    }
  }

  return (
    <a
      href={link}
      target="_blank"
      rel="sponsored noopener noreferrer"
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  )
}

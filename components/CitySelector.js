import { useState, useEffect } from 'react'
import { getCountries, getStates, getCities } from '../lib/sheets'
import { getPrice, convertCurrency } from '../lib/api'

export default function CitySelector({ defaultCurrency = 'USD' }) {
  const [countries, setCountries] = useState([])
  const [states, setStates] = useState([])
  const [cities, setCities] = useState([])
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [cityData, setCityData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { loadCountries() }, [])
  useEffect(() => { if (selectedCountry) loadStates() }, [selectedCountry])
  useEffect(() => { if (selectedState) loadCities() }, [selectedState])

  const loadCountries = async () => {
    const data = await getCountries()
    setCountries(data)
  }

  const loadStates = async () => {
    const data = await getStates(selectedCountry)
    setStates(data)
    setSelectedState('')
    setCities([])
  }

  const loadCities = async () => {
    const data = await getCities(selectedCountry, selectedState)
    setCities(data)
  }

  const getCityPrice = async () => {
    if (!selectedCity) return
    setLoading(true)
    const city = cities.find(c => c.City_ID === selectedCity)
    if (city) {
      const price24k = await getPrice('gold', city.Currency)
      setCityData({
        city: city,
        price24k: price24k,
        price22k: price24k * 0.9167,
        price18k: price24k * 0.75,
        price14k: price24k * 0.5833
      })
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4">Find Gold Price in Any City (50,000+ Cities)</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">Select Country</option>
          {countries.map(c => <option key={c.Country_ID} value={c.Code}>{c.Name}</option>)}
        </select>
        
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="px-4 py-2 border rounded-lg"
          disabled={!selectedCountry}
        >
          <option value="">Select State</option>
          {states.map(s => <option key={s.State_ID} value={s.Slug}>{s.Name}</option>)}
        </select>
        
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="px-4 py-2 border rounded-lg"
          disabled={!selectedState}
        >
          <option value="">Select City ({cities.length} cities)</option>
          {cities.map(c => <option key={c.City_ID} value={c.City_ID}>{c.Name}</option>)}
        </select>
      </div>
      
      <button
        onClick={getCityPrice}
        disabled={!selectedCity || loading}
        className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Get City Price'}
      </button>
      
      {cityData && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-bold text-lg">{cityData.city.Name} Gold Price</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            <div><span className="text-gray-600">24K:</span> <span className="font-bold">{cityData.price24k.toFixed(2)} {cityData.city.Currency}</span></div>
            <div><span className="text-gray-600">22K:</span> <span className="font-bold">{cityData.price22k.toFixed(2)} {cityData.city.Currency}</span></div>
            <div><span className="text-gray-600">18K:</span> <span className="font-bold">{cityData.price18k.toFixed(2)} {cityData.city.Currency}</span></div>
            <div><span className="text-gray-600">14K:</span> <span className="font-bold">{cityData.price14k.toFixed(2)} {cityData.city.Currency}</span></div>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            <p>📍 Making Charges: {cityData.city.Making_Charge}% | Tax: {cityData.city.Tax_Rate}%</p>
            <p>🏪 Top Jewelers: {cityData.city.Top_Jewelers}</p>
          </div>
        </div>
      )}
    </div>
  )
                                                                         }

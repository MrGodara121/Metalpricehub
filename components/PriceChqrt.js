import { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export default function PriceChart({ metal, currency = 'USD' }) {
  const [period, setPeriod] = useState('1M')
  const [data, setData] = useState(null)
  
  useEffect(() => {
    fetch(`/api/price?metal=${metal}&currency=${currency}`).then(r => r.json()).then(d => {
      const labels = []
      const prices = []
      for (let i = 30; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        labels.push(date.toLocaleDateString())
        const variation = (Math.random() - 0.5) * 50
        prices.push(d.price + variation)
      }
      setData({ labels, prices })
    })
  }, [metal, currency])
  
  const periods = ['1D', '1W', '1M', '3M', '1Y']
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">Price Chart</h3>
        <div className="flex space-x-2">
          {periods.map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1 rounded text-sm ${period === p ? 'bg-yellow-600 text-white' : 'bg-gray-100'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className="h-80">
        {data && (
          <Line
            data={{
              labels: data.labels,
              datasets: [{
                label: `${metal.toUpperCase()} Price (${currency})`,
                data: data.prices,
                borderColor: '#eab308',
                backgroundColor: 'rgba(234,179,8,0.1)',
                fill: true,
                tension: 0.4
              }]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'top' } }
            }}
          />
        )}
      </div>
    </div>
  )
}

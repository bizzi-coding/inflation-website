import { useState, useMemo } from 'react'
import { Wallet, TrendingDown } from 'lucide-react'
import inflationData from './data/inflation.json'

function formatMoney(value) {
  if (value == null || Number.isNaN(value)) return '—'
  const rounded = Math.round(value)
  return rounded.toLocaleString('ru-RU') + ' ₽'
}

function App() {
  const [salary, setSalary] = useState('')
  const [year, setYear] = useState(String(inflationData[0]?.year ?? 2024))

  const monthly = useMemo(() => (salary === '' ? null : parseFloat(salary)), [salary])
  const yearInfo = useMemo(
    () => inflationData.find((d) => String(d.year) === year),
    [year]
  )

  const result = useMemo(() => {
    if (monthly == null || Number.isNaN(monthly) || monthly <= 0 || !yearInfo) return null
    const annual = monthly * 12
    const rate = yearInfo.rate / 100
    const loss = annual - annual / (1 + rate)
    const real = annual - loss
    return { annual, rate: yearInfo.rate, loss, real }
  }, [monthly, yearInfo])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 p-6 sm:p-8">
          <div className="flex items-center gap-2 text-slate-700 mb-6">
            <Wallet className="w-6 h-6 text-slate-500" strokeWidth={1.8} />
            <h1 className="text-xl font-semibold tracking-tight">
              Калькулятор инфляции ЗП
            </h1>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-600">Зарплата в месяц</span>
              <input
                type="number"
                min="0"
                step="1000"
                placeholder="100 000"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200/80 transition"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-600">Год</span>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200/80 transition appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.25rem', paddingRight: '2.5rem' }}
              >
                {inflationData.map((d) => (
                  <option key={d.year} value={String(d.year)}>
                    {d.year} (инфляция {d.rate}%)
                  </option>
                ))}
              </select>
            </label>
          </div>

          {result && (
            <div className="mt-6 rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-3">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Годовая зарплата</span>
                <span className="font-medium text-slate-800">{formatMoney(result.annual)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Инфляция за {year}</span>
                <span className="font-medium text-slate-800">{result.rate.toFixed(2)}%</span>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                <TrendingDown className="w-4 h-4 text-red-500 shrink-0" strokeWidth={2} />
                <div className="flex justify-between flex-1 items-baseline gap-2">
                  <span className="text-sm font-medium text-slate-700">Потеря покупательной способности</span>
                  <span className="text-lg font-semibold text-red-500 tabular-nums">
                    {formatMoney(result.loss)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-sm pt-1">
                <span className="text-slate-600">Реальная стоимость заработанного</span>
                <span className="font-medium text-slate-800">{formatMoney(result.real)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App

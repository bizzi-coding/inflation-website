import { useState, useMemo } from 'react'
import { Wallet, TrendingDown } from 'lucide-react'
import inflationData from './data/inflation.json'

const years = inflationData.map((d) => d.year)
const yearMin = Math.min(...years)
const yearMax = Math.max(...years)
const rateByYear = Object.fromEntries(inflationData.map((d) => [d.year, d.rate]))

function formatMoney(value) {
  if (value == null || Number.isNaN(value)) return '—'
  const rounded = Math.round(value)
  return rounded.toLocaleString('ru-RU') + ' ₽'
}

function App() {
  const [salary, setSalary] = useState('')
  const [yearFrom, setYearFrom] = useState(String(yearMin))
  const [yearTo, setYearTo] = useState(String(yearMax))

  const handleYearFromChange = (value) => {
    setYearFrom(value)
    if (Number(value) > Number(yearTo)) setYearTo(value)
  }
  const handleYearToChange = (value) => {
    setYearTo(value)
    if (Number(value) < Number(yearFrom)) setYearFrom(value)
  }

  const monthly = useMemo(() => (salary === '' ? null : parseFloat(salary)), [salary])

  const result = useMemo(() => {
    if (monthly == null || Number.isNaN(monthly) || monthly <= 0) return null
    const from = Number(yearFrom)
    const to = Number(yearTo)
    if (from > to) return null

    let factor = 1
    for (let y = from; y <= to; y++) {
      const r = rateByYear[y]
      if (r != null) factor *= 1 + r / 100
    }
    const totalInflationPercent = (factor - 1) * 100
    const annual = monthly * 12
    const loss = annual - annual / factor
    const real = annual - loss

    return {
      annual,
      totalInflationPercent,
      loss,
      real,
      yearFrom: from,
      yearTo: to,
    }
  }, [monthly, yearFrom, yearTo])

  const selectClass =
    'rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200/80 transition appearance-none cursor-pointer w-full'
  const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.75rem center',
    backgroundSize: '1.25rem',
    paddingRight: '2.5rem',
  }

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

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-medium text-slate-600">С какого года</span>
                <select
                  value={yearFrom}
                  onChange={(e) => handleYearFromChange(e.target.value)}
                  className={`mt-1.5 ${selectClass}`}
                  style={selectStyle}
                >
                  {years.map((y) => (
                    <option key={y} value={String(y)}>{y}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-600">По какой год</span>
                <select
                  value={yearTo}
                  onChange={(e) => handleYearToChange(e.target.value)}
                  className={`mt-1.5 ${selectClass}`}
                  style={selectStyle}
                >
                  {years.map((y) => (
                    <option key={y} value={String(y)}>{y}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {result && (
            <div className="mt-6 rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Общая инфляция за период</span>
                <span className="font-semibold text-slate-800">
                  {result.totalInflationPercent.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-slate-500 -mt-1">
                {result.yearFrom} — {result.yearTo}
              </p>
              <div className="flex justify-between text-sm text-slate-600 pt-1 border-t border-slate-200">
                <span>Годовая зарплата</span>
                <span className="font-medium text-slate-800">{formatMoney(result.annual)}</span>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                <TrendingDown className="w-4 h-4 text-red-500 shrink-0" strokeWidth={2} />
                <div className="flex justify-between flex-1 items-baseline gap-2 min-w-0">
                  <span className="text-sm font-medium text-slate-700">Потеря покупательной способности</span>
                  <span className="text-lg font-semibold text-red-500 tabular-nums shrink-0">
                    {formatMoney(result.loss)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-sm pt-1">
                <span className="text-slate-600">Реальная покупательная способность</span>
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

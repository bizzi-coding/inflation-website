import { useState, useMemo } from 'react'
import { Wallet, TrendingDown, Send } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
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

/** Генерирует данные для графика: реальная стоимость годовой ЗП по годам (накопленная инфляция). */
function getChartData(annual, yearFrom, yearTo) {
  const data = []
  let factor = 1
  for (let y = yearFrom; y <= yearTo; y++) {
    data.push({ year: y, value: Math.round(annual / factor) })
    const r = rateByYear[y]
    if (r != null) factor *= 1 + r / 100
  }
  return data
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

  const chartData = useMemo(() => {
    if (!result) return []
    return getChartData(result.annual, result.yearFrom, result.yearTo)
  }, [result])

  const telegramUrl = useMemo(() => {
    if (!result) return ''
    const times = Number((1 + result.totalInflationPercent / 100).toFixed(1))
    const siteUrl = window.location.href
    const message = [
      '📉 Мои деньги просто сгорели...',
      '',
      'За период с ' + result.yearFrom + ' по ' + result.yearTo + ' накопленная инфляция составила ' + result.totalInflationPercent.toFixed(1) + '%.',
      'Это значит, что моя зарплата обесценилась почти в ' + times + ' раза!',
      '',
      'Проверь свои потери тут: 🔍 ' + siteUrl,
    ].join('\n')
    return 'tg://msg_url?url=&text=' + encodeURIComponent(message)
  }, [result])

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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4">
      <div className="flex-1 w-full flex flex-col items-center justify-center">
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

              <div className="mt-4 -mx-1 w-full" style={{ minHeight: 300 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="chartBurn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(v) => (v >= 1e6 ? `${(v / 1e6).toFixed(1)} млн` : `${(v / 1e3).toFixed(0)} тыс`)}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                      width={42}
                    />
                    <Tooltip
                      content={({ active, payload }) =>
                        active && payload?.[0] ? (
                          <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-sm">
                            <span className="text-slate-500">{payload[0].payload.year}:</span>{' '}
                            <span className="font-semibold text-slate-800">
                              {formatMoney(payload[0].value)}
                            </span>
                          </div>
                        ) : null
                      }
                      cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#ef4444"
                      strokeWidth={2}
                      fill="url(#chartBurn)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-[#0088cc] text-white py-3 px-4 font-medium hover:bg-[#006699] transition-colors no-underline"
              >
                <Send className="w-4 h-4" strokeWidth={2} />
                Поделиться в Telegram
              </a>
            </div>
          )}
        </div>
      </div>
      </div>
      <p className="text-sm text-gray-400 text-center pt-6 pb-2">
        Vibecoded by Crypto Bizzi.
      </p>
    </div>
  )
}

export default App

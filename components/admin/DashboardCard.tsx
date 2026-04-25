interface DashboardCardProps {
  label: string
  value: string
  icon: string
  color?: 'amber' | 'green' | 'red' | 'blue'
  sub?: string
}

const colorMap = {
  amber: 'border-amber-500 bg-amber-50',
  green: 'border-green-500 bg-green-50',
  red:   'border-red-500 bg-red-50',
  blue:  'border-blue-500 bg-blue-50',
}

const textMap = {
  amber: 'text-amber-700',
  green: 'text-green-700',
  red:   'text-red-700',
  blue:  'text-blue-700',
}

export default function DashboardCard({ label, value, icon, color = 'amber', sub }: DashboardCardProps) {
  return (
    <div className={`rounded-2xl p-5 border-l-4 bg-white shadow-sm ${colorMap[color]}`}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-2xl font-bold ${textMap[color]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

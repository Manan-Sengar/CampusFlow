import { Route } from 'lucide-react'
import { Link } from 'react-router-dom'

interface BrandProps {
  compact?: boolean
  inverse?: boolean
  linked?: boolean
}

export function Brand({ compact = false, inverse = false, linked = true }: BrandProps) {
  const content = (
    <span className={`brand${inverse ? ' brand--inverse' : ''}`}>
      <span className="brand__mark" aria-hidden="true">
        <Route size={compact ? 18 : 20} strokeWidth={2.4} />
      </span>
      <span className="brand__name">CampusFlow</span>
    </span>
  )

  if (!linked) {
    return content
  }

  return (
    <Link className="brand-link" to="/" aria-label="CampusFlow home">
      {content}
    </Link>
  )
}

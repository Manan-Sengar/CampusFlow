import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Brand } from '../components/ui/Brand.tsx'

export function NotFoundPage() {
  return (
    <main className="not-found">
      <Brand />
      <div className="not-found__code">404</div>
      <div>
        <h1>This page isn’t on the map.</h1>
        <p>The address may be incorrect, or the page may have moved.</p>
      </div>
      <Link className="button button--primary" to="/">
        <ArrowLeft size={17} aria-hidden="true" />
        Return home
      </Link>
    </main>
  )
}

import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'
import PoliticaContenido, { VERSION_POLITICA } from '../components/PoliticaContenido'
import '../styles/privacidad.css'

/**
 * Página pública de la política. El texto no vive acá sino en PoliticaContenido,
 * porque el modal del registro muestra exactamente el mismo: quien acepta tiene
 * que estar aceptando lo que leyó.
 */
export default function PrivacidadPage() {
  return (
    <div className="legal">
      <header className="legal__topbar">
        <Link to="/" className="legal__marca" aria-label="TesisTrack — ir al inicio">
          <BrandLogo variant="inline" />
        </Link>
        <Link to="/" className="legal__volver">
          <span aria-hidden="true">←</span> Volver al inicio
        </Link>
      </header>

      <main className="legal__hoja legal-texto">
        <p className="legal__version">
          Versión {VERSION_POLITICA} · Vigente desde el {VERSION_POLITICA}
        </p>
        <h1>Política de privacidad</h1>

        <PoliticaContenido />
      </main>
    </div>
  )
}

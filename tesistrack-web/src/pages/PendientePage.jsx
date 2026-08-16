import { Card, PageHead } from '../components/ui'

/**
 * Pantallas todavía no construidas. El endpoint del backend ya existe y está
 * probado; lo que falta es la interfaz. Se muestra explícito para no simular
 * una funcionalidad que no está.
 */
export default function PendientePage({ titulo, descripcion, endpoints }) {
  return (
    <>
      <PageHead titulo={titulo} descripcion={descripcion} />
      <Card>
        <div className="pendiente">
          <span className="pendiente__marca">En construcción</span>
          <p>
            Esta pantalla todavía no está armada. La API que la va a alimentar ya funciona y está
            verificada:
          </p>
          <ul className="pendiente__endpoints">
            {endpoints.map((e) => (
              <li key={e}>
                <code>{e}</code>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </>
  )
}

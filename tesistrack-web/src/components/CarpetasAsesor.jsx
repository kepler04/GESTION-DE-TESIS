import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Vacio } from './ui'

/**
 * Las carpetas del asesor, siempre a la vista, con el código adelante.
 *
 * La primera versión las escondía detrás del botón "Mis áreas" y solo mostraba
 * la tabla de proyectos. Un asesor recién llegado —sin ningún asesorado todavía—
 * entraba a Proyectos, veía "no tenés proyectos asignados" y ni rastro del área
 * que acababa de crear. Era justo al revés de lo que necesita: sin código a mano
 * no puede invitar a nadie, y sin invitar a nadie nunca va a tener proyectos.
 */
export default function CarpetasAsesor({ areas, proyectos, onAdministrar, administrando }) {
  const [copiado, setCopiado] = useState(null)

  return (
    <Card
      titulo="Mis carpetas"
      accion={
        <button type="button" className="btn btn--sutil" onClick={onAdministrar}>
          {administrando ? 'Cerrar' : 'Administrar'}
        </button>
      }
    >
      {areas.length === 0 ? (
        <Vacio
          cta={
            <button type="button" className="btn btn--primario" onClick={onAdministrar}>
              Crear mi primera carpeta
            </button>
          }
        >
          Una carpeta te da un código para invitar a tus asesorados. Se lo pasás, lo pegan al crear
          su tesis y aparecen acá.
        </Vacio>
      ) : (
        <div className="carpetas">
          {areas.map((a) => {
            const cuantos = proyectos.filter((p) => p.area?.id === a.id).length
            return (
              <article key={a.id} className="carpeta">
                <h3 className="carpeta__nombre">{a.nombre}</h3>
                <p className="carpeta__cuenta">
                  {cuantos === 0
                    ? 'Todavía sin asesorados'
                    : `${cuantos} ${cuantos === 1 ? 'tesis' : 'tesis'}`}
                </p>

                <p className="carpeta__etiqueta">Código para invitar</p>
                <div className="carpeta__codigo-caja">
                  <code className="carpeta__codigo">{a.codigo}</code>
                  <button
                    type="button"
                    className="btn btn--sutil"
                    onClick={() => {
                      navigator.clipboard?.writeText(a.codigo)
                      setCopiado(a.id)
                      setTimeout(() => setCopiado(null), 1800)
                    }}
                  >
                    {copiado === a.id ? '✓ Copiado' : 'Copiar'}
                  </button>
                </div>

                <Link className="btn btn--primario carpeta__abrir" to={`/espacios/${a.id}`}>
                  Abrir espacio
                </Link>
              </article>
            )
          })}
        </div>
      )}
    </Card>
  )
}

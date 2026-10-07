import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { proximasReuniones } from '../api/tesistrack'
import BotonUnirse from './BotonUnirse'
import { Card, Vacio, fechaHora } from './ui'

/**
 * Lo próximo que tiene el usuario para unirse: las sesiones de su espacio y las
 * asesorías programadas de sus tesis, en una sola lista y la más cercana destacada
 * con su botón. Lo usan el Dashboard del estudiante y el del asesor.
 */
export default function ProximasReuniones({ rol }) {
  const [reuniones, setReuniones] = useState(null)

  useEffect(() => {
    let cancelado = false
    proximasReuniones()
      .then((lista) => !cancelado && setReuniones(lista))
      // Un fallo acá no debe tumbar el Dashboard: se muestra como "sin reuniones".
      .catch(() => !cancelado && setReuniones([]))
    return () => {
      cancelado = true
    }
  }, [])

  if (reuniones === null) return null

  const [siguiente, ...resto] = reuniones

  return (
    <Card
      titulo="Próximas reuniones"
      accion={
        <Link className="btn btn--sutil" to="/asesorias">
          Asesorías
        </Link>
      }
    >
      {!siguiente ? (
        <Vacio>
          No hay reuniones programadas.{' '}
          {rol === 'ESTUDIANTE'
            ? 'Podés proponerle una a tu asesor desde Asesorías.'
            : 'Programá una desde Asesorías o creá una sesión en tu clase.'}
        </Vacio>
      ) : (
        <>
          <div className="reunion-destacada">
            <div>
              <Etiqueta reunion={siguiente} />
              <strong className="reunion-destacada__titulo">{siguiente.titulo}</strong>
              <span className="lista__meta">
                {fechaHora(siguiente.fechaHora)} · {contexto(siguiente)}
              </span>
            </div>
            <BotonUnirse enlace={siguiente.enlace} />
          </div>

          {resto.length > 0 && (
            <ul className="lista">
              {resto.map((r) => (
                <li key={`${r.tipo}-${r.id}`}>
                  <div>
                    <Etiqueta reunion={r} />
                    <strong>{r.titulo}</strong>
                    <span className="lista__meta">
                      {fechaHora(r.fechaHora)} · {contexto(r)}
                    </span>
                  </div>
                  <BotonUnirse enlace={r.enlace} className="btn btn--sutil" />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Card>
  )
}

function Etiqueta({ reunion }) {
  return (
    <span className="tag">{reunion.tipo === 'SESION' ? 'Sesión de clase' : 'Asesoría'}</span>
  )
}

function contexto(reunion) {
  return reunion.tipo === 'SESION' ? reunion.areaNombre : reunion.proyectoTitulo
}

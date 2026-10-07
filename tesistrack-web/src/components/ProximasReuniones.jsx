import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { proximasReuniones } from '../api/tesistrack'
import BotonUnirse from './BotonUnirse'
import Icono from './Icono'
import { Card, Seccion, Vacio } from './ui'
import { diaYHora } from '../utils/formato'

/**
 * Lo próximo que tiene el usuario para unirse: las sesiones de su clase y las
 * asesorías programadas de sus tesis, en una sola lista, cada una con su botón.
 *
 * - `variante="seccion"` (Dashboard del profesor): una fila por reunión, con la
 *   fecha en bloque.
 * - `variante="tarjeta"` (columna lateral del Dashboard del estudiante): la más
 *   cercana destacada y el resto en una lista corta.
 */
export default function ProximasReuniones({ rol, variante = 'seccion' }) {
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

  const vacio = (
    <Vacio icono="calendario">
      No hay reuniones programadas.{' '}
      {rol === 'ESTUDIANTE'
        ? 'Podés proponerle una a tu profesor desde Asesorías.'
        : 'Programá una desde Asesorías o creá una sesión en tu clase.'}
    </Vacio>
  )

  if (variante === 'tarjeta') {
    const [siguiente, ...resto] = reuniones
    return (
      <Card
        titulo={
          <>
            <span className="card__titulo-icono">
              <Icono nombre="calendario" />
            </span>
            Próximas reuniones
          </>
        }
      >
        {!siguiente ? (
          vacio
        ) : (
          <>
            <div className="proximo reunion-destacada">
              <Etiqueta reunion={siguiente} />
              <strong className="proximo__titulo">{siguiente.titulo}</strong>
              <span className="proximo__meta">
                {diaYHora(siguiente.fechaHora)} · {contexto(siguiente)}
              </span>
              <BotonUnirse enlace={siguiente.enlace} />
            </div>
            {resto.length > 0 && (
              <ul className="lista">
                {resto.slice(0, 3).map((r) => (
                  <li key={`${r.tipo}-${r.id}`}>
                    <div>
                      <strong>{r.titulo}</strong>
                      <span className="lista__meta">{diaYHora(r.fechaHora)}</span>
                    </div>
                    <BotonUnirse enlace={r.enlace} chico />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </Card>
    )
  }

  return (
    <Seccion
      titulo="Próximas reuniones"
      accion={
        <Link className="btn btn--fantasma" to="/asesorias">
          Asesorías
        </Link>
      }
    >
      {reuniones.length === 0 ? (
        vacio
      ) : (
        <ul className="reuniones">
          {reuniones.map((r) => (
            <li key={`${r.tipo}-${r.id}`} className="reunion">
              <FechaBloque valor={r.fechaHora} />
              <div className="reunion__cuerpo">
                <div className="reunion__titulo">
                  <Etiqueta reunion={r} />
                  {r.titulo}
                </div>
                <p className="reunion__meta">
                  {diaYHora(r.fechaHora)} · {contexto(r)}
                </p>
              </div>
              <BotonUnirse enlace={r.enlace} />
            </li>
          ))}
        </ul>
      )}
    </Seccion>
  )
}

function Etiqueta({ reunion }) {
  const esSesion = reunion.tipo === 'SESION'
  return (
    <span className={`tipo-reunion ${esSesion ? '' : 'tipo-reunion--asesoria'}`}>
      <Icono nombre={esSesion ? 'video' : 'persona'} />
      {esSesion ? 'Sesión de clase' : 'Asesoría'}
    </span>
  )
}

/**
 * El día y el mes en bloque, como en un calendario de papel. Acepta un instante o
 * una fecha sola (`2026-10-19`), que se lee como día local y no como medianoche UTC
 * (que en Lima sería el día anterior).
 */
export function FechaBloque({ valor }) {
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(valor) ? `${valor}T00:00:00` : valor)
  return (
    <span className="fecha-bloque" aria-hidden="true">
      <strong>{String(d.getDate()).padStart(2, '0')}</strong>
      <span>{d.toLocaleDateString('es', { month: 'short' }).replace('.', '')}</span>
    </span>
  )
}

function contexto(reunion) {
  return reunion.tipo === 'SESION' ? reunion.areaNombre : reunion.proyectoTitulo || 'Tema por definir'
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { proximasReuniones } from '../api/tesistrack'
import BotonUnirse from './BotonUnirse'
import Icono from './Icono'
import { fecha } from './ui'
import { diasHasta } from '../utils/formato'

/** Cuánto antes de una reunión (y cuánto después de empezada) pasa a ser "lo de ahora". */
const VENTANA_REUNION_MS = 60 * 60 * 1000
const ABIERTOS = ['PENDIENTE', 'EN_PROCESO']

/**
 * La única acción principal del Inicio del estudiante: lo más urgente que tiene que
 * hacer ahora (Decisión 33). Una sola, para que no tenga que decidir por dónde
 * empezar. El orden:
 *
 * 1. Una reunión que ya empezó o empieza en menos de una hora → Unirse.
 * 2. Un hito vencido sin entregar → subirlo (está atrasado).
 * 3. Observaciones sin corregir → subir la versión corregida.
 * 4. Una reunión más tarde, hoy → Unirse.
 * 5. El tema por definir → registrarlo.
 * 6. El próximo hito abierto → subirlo antes de la fecha.
 * 7. Nada de lo anterior → está al día.
 */
export default function AccionPrincipal({ data, onRegistrarTema }) {
  const [reuniones, setReuniones] = useState(null)

  useEffect(() => {
    let cancelado = false
    proximasReuniones()
      .then((r) => !cancelado && setReuniones(r))
      .catch(() => !cancelado && setReuniones([]))
    return () => {
      cancelado = true
    }
  }, [])

  if (reuniones === null) return null
  const accion = elegir(data, reuniones)

  return (
    <section className={`accion-principal accion-principal--${accion.tono}`} aria-labelledby="accion-principal-titulo">
      <span className="accion-principal__icono" aria-hidden="true">
        <Icono nombre={accion.icono} />
      </span>
      <div className="accion-principal__cuerpo">
        <p className="etiqueta-mayus">Lo que te toca ahora</p>
        <h2 id="accion-principal-titulo">{accion.titulo}</h2>
        <p>{accion.texto}</p>
      </div>
      <div className="accion-principal__boton">
        {accion.tipo === 'reunion' && <BotonUnirse enlace={accion.reunion.enlace} />}
        {accion.tipo === 'entrega' && (
          <Link className="btn btn--primario" to={`/mi-tesis?pestana=entregas&hito=${accion.hito.id}&corregir=1`}>
            <Icono nombre="entregas" />
            {accion.boton}
          </Link>
        )}
        {accion.tipo === 'tema' && (
          <button type="button" className="btn btn--primario" onClick={onRegistrarTema}>
            Registrar mi tema
          </button>
        )}
        {accion.tipo === 'ok' && data.proyecto.area && (
          <Link className="btn btn--sutil" to={`/clases/${data.proyecto.area.id}`}>
            Ir a mi clase
          </Link>
        )}
        {accion.tipo === 'ok' && !data.proyecto.area && (
          <Link className="btn btn--sutil" to="/mi-tesis">
            Ver mi tesis
          </Link>
        )}
      </div>
    </section>
  )
}

function elegir(data, reuniones) {
  const ahora = Date.now()
  const hoy = new Date().toDateString()
  const abiertos = data.proximosHitos.filter((h) => ABIERTOS.includes(h.estado))

  const yaEmpieza = reuniones.find((r) => Math.abs(new Date(r.fechaHora).getTime() - ahora) <= VENTANA_REUNION_MS)
  if (yaEmpieza) {
    const empezo = new Date(yaEmpieza.fechaHora).getTime() <= ahora
    return {
      tipo: 'reunion',
      tono: 'acento',
      icono: 'video',
      reunion: yaEmpieza,
      titulo: empezo ? `${yaEmpieza.titulo}: ya empezó` : `${yaEmpieza.titulo} empieza ${hora(yaEmpieza.fechaHora)}`,
      texto: yaEmpieza.tipo === 'SESION' ? 'Es una sesión de toda la clase.' : 'Es una asesoría de tu grupo con tu profesor.',
    }
  }

  const vencido = abiertos
    .filter((h) => h.fechaLimite && diasHasta(h.fechaLimite) < 0)
    .sort((a, b) => a.fechaLimite.localeCompare(b.fechaLimite))[0]
  if (vencido) {
    const dias = -diasHasta(vencido.fechaLimite)
    return {
      tipo: 'entrega',
      tono: 'alerta',
      icono: 'alerta',
      hito: vencido,
      boton: 'Subir entrega',
      titulo: `${vencido.nombre} venció hace ${dias === 1 ? '1 día' : `${dias} días`}`,
      texto: 'Subilo cuanto antes: tu profesor lo está esperando.',
    }
  }

  const observacion = data.observacionesPendientes[0]
  if (observacion) {
    const n = data.observacionesPendientes.length
    return {
      tipo: 'entrega',
      tono: 'aviso',
      icono: 'observaciones',
      hito: { id: observacion.hitoId },
      boton: 'Subir versión corregida',
      titulo: n === 1 ? `Corregí la observación de ${observacion.hitoNombre}` : `Tenés ${n} observaciones por corregir`,
      texto: `“${recortar(observacion.descripcion)}”`,
    }
  }

  const masTarde = reuniones.find((r) => new Date(r.fechaHora).toDateString() === hoy)
  if (masTarde) {
    return {
      tipo: 'reunion',
      tono: 'acento',
      icono: 'video',
      reunion: masTarde,
      titulo: `Hoy ${hora(masTarde.fechaHora)}: ${masTarde.titulo}`,
      texto: 'El botón te lleva a la videollamada.',
    }
  }

  if (!data.proyecto.titulo) {
    return {
      tipo: 'tema',
      tono: 'acento',
      icono: 'tesis',
      titulo: 'Registrá el tema de tu tesis',
      texto: 'Cuando lo tengas, anotalo: tu profesor lo ve y te puede orientar.',
    }
  }

  const proximo = [...abiertos]
    .filter((h) => h.fechaLimite)
    .sort((a, b) => a.fechaLimite.localeCompare(b.fechaLimite))[0] ?? abiertos[0]
  if (proximo) {
    const dias = proximo.fechaLimite ? diasHasta(proximo.fechaLimite) : null
    return {
      tipo: 'entrega',
      tono: dias !== null && dias <= 3 ? 'aviso' : 'acento',
      icono: 'entregas',
      hito: proximo,
      boton: 'Subir entrega',
      titulo: `Próximo: ${proximo.nombre}`,
      texto: proximo.fechaLimite
        ? `Vence el ${fecha(proximo.fechaLimite)}${dias === 0 ? ' (hoy)' : dias === 1 ? ' (mañana)' : ` (quedan ${dias} días)`}.`
        : 'Todavía no tiene fecha límite.',
    }
  }

  return {
    tipo: 'ok',
    tono: 'ok',
    icono: 'tareas',
    titulo: 'Estás al día',
    texto: 'No tenés entregas pendientes ni observaciones por corregir.',
  }
}

function hora(valor) {
  return `a las ${new Date(valor).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}`
}

function recortar(texto, largo = 140) {
  return texto.length > largo ? `${texto.slice(0, largo).trimEnd()}…` : texto
}

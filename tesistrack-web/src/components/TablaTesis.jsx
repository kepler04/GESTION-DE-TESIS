import { Link } from 'react-router-dom'
import EstadoBadge from './EstadoBadge'
import { fecha, nombres } from './ui'

/**
 * La lista de tesis de una persona, con lo que cada rol puede hacerles.
 *
 * Las acciones son opcionales: el coordinador solo lee (Decisión 8), así que no las
 * pasa y la columna no aparece. Quitar de la lista y borrar son dos salidas
 * distintas a propósito (Decisión 17): quitarla no destruye nada y es reversible;
 * borrarla se lleva el trabajo del estudiante y no tiene vuelta atrás.
 */
export default function TablaTesis({ proyectos, rol, onDesvincular, onBorrar }) {
  const esAsesor = rol === 'ASESOR'
  const conAcciones = Boolean(onDesvincular || onBorrar)

  return (
    <div className="tabla-scroll">
      <table className="tabla">
        <thead>
          <tr>
            <th>Tesis</th>
            <th>{esAsesor ? 'Alumnos' : 'Estudiantes'}</th>
            <th>Asesor</th>
            <th>Clase</th>
            <th>Estado</th>
            <th>Creada</th>
            {conAcciones && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {proyectos.map((p) => (
            <tr key={p.id}>
              <td>
                <strong>{p.titulo || <em className="tenue">Tema por definir</em>}</strong>
                {p.descripcion && <span className="lista__meta">{p.descripcion}</span>}
              </td>
              <td>{nombres(p.estudiantes)}</td>
              <td>{p.asesor?.name ?? <em className="tenue">Sin asignar</em>}</td>
              <td>
                {p.area ? (
                  rol === 'COORDINADOR' ? (
                    p.area.nombre
                  ) : (
                    <Link to={`/clases/${p.area.id}`}>{p.area.nombre}</Link>
                  )
                ) : p.asesor ? (
                  <span className="tenue">Asesoría privada</span>
                ) : (
                  <em className="tenue">Sin clase</em>
                )}
              </td>
              <td>
                <EstadoBadge estado={p.estado} tipo="proyecto" />
              </td>
              <td>{fecha(p.createdAt)}</td>
              {conAcciones && (
                <td>
                  <div className="tabla__acciones">
                    {onDesvincular && p.asesor && (
                      <button
                        type="button"
                        className="btn btn--sutil"
                        onClick={() => onDesvincular(p)}
                        title="La tesis sigue existiendo; deja de estar a tu cargo"
                      >
                        Quitar de mi lista
                      </button>
                    )}
                    {onBorrar && (
                      <button
                        type="button"
                        className="btn btn--sutil tabla__borrar"
                        onClick={() => onBorrar(p)}
                      >
                        Borrar
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

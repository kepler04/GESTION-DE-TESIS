/**
 * Cuerpo de la política de privacidad.
 *
 * Vive acá y no dentro de la página porque lo usan dos lugares: la página
 * pública `/privacidad` y el modal del registro. Si el texto viviera duplicado,
 * tarde o temprano uno de los dos quedaría desactualizado — y el usuario acepta
 * el que ve, así que tienen que ser el mismo.
 *
 * Si se agrega o se saca un campo del registro, hay que actualizar esta tabla y
 * subir `app.politica.version` en el backend: cada usuario queda asociado a la
 * versión que aceptó.
 */
export const VERSION_POLITICA = '2026-08-16'

const DATOS = [
  {
    dato: 'Nombre',
    porque: 'Identifica quién subió cada entrega y quién registró cada observación.',
    obligatorio: true,
  },
  { dato: 'Correo electrónico', porque: 'Es tu usuario para iniciar sesión.', obligatorio: true },
  {
    dato: 'Contraseña',
    porque: 'Se guarda cifrada con BCrypt. Nadie del equipo puede leerla.',
    obligatorio: true,
  },
  {
    dato: 'Rol (estudiante o asesor)',
    porque: 'Define qué podés ver y hacer dentro de la plataforma.',
    obligatorio: true,
  },
  { dato: 'Carrera', porque: 'Da contexto académico a la tesis.', obligatorio: false },
  {
    dato: 'Universidad u organización',
    porque: 'Da contexto sobre el ámbito en el que se desarrolla la tesis.',
    obligatorio: false,
  },
  {
    dato: 'Teléfono',
    porque: 'Permite un canal de contacto alternativo al correo.',
    obligatorio: false,
  },
  { dato: 'Ubicación', porque: 'Da contexto geográfico al proyecto.', obligatorio: false },
]

export default function PoliticaContenido() {
  return (
    <>
      <div className="legal__aviso" role="note">
        <strong>Borrador pendiente de revisión.</strong> Este texto describe con exactitud los datos
        que TesisTrack guarda hoy, pero todavía no fue revisado por un profesional legal y tiene
        tramos sin completar, marcados <code>[así]</code>. No debe publicarse como está.
      </div>

      <section>
        <h2>Quién trata tus datos</h2>
        <p>
          El responsable del tratamiento es <code>[razón social o nombre del equipo]</code>, con
          domicilio en <code>[dirección]</code> y correo de contacto{' '}
          <code>[correo de contacto]</code>.
        </p>
        <p>
          TesisTrack es un proyecto académico desarrollado en el marco del Programa Especializado en
          Fundamentos de Programación y Desarrollo Web Full-Stack.
        </p>
      </section>

      <section>
        <h2>Qué datos recolectamos y para qué</h2>
        <p>
          Solo los que cargás al registrarte. No usamos cookies de seguimiento ni herramientas de
          analítica de terceros, y no perfilamos tu comportamiento.
        </p>

        <div className="legal__tabla-scroll">
          <table className="legal__tabla">
            <thead>
              <tr>
                <th>Dato</th>
                <th>Para qué se usa</th>
                <th>¿Es obligatorio?</th>
              </tr>
            </thead>
            <tbody>
              {DATOS.map((d) => (
                <tr key={d.dato}>
                  <td>
                    <strong>{d.dato}</strong>
                  </td>
                  <td>{d.porque}</td>
                  <td>{d.obligatorio ? 'Sí' : 'No, podés dejarlo vacío'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p>
          Además guardamos el contenido que generás usando la plataforma: proyectos, hitos, entregas,
          observaciones, asesorías, acuerdos y tareas.
        </p>
      </section>

      <section>
        <h2>Quién puede ver tus datos</h2>
        <ul>
          <li>
            <strong>Tu nombre, correo y rol</strong> son visibles para las personas que comparten un
            proyecto con vos: el estudiante y el asesor de esa tesis.
          </li>
          <li>
            <strong>Teléfono, ubicación, carrera y organización</strong> no se muestran en ninguna
            pantalla de la plataforma ni se incluyen en las respuestas de la API que consumen otros
            usuarios.
          </li>
          <li>
            El <strong>coordinador académico</strong> puede consultar los proyectos y su avance, en
            modo lectura.
          </li>
          <li>No vendemos, cedemos ni compartimos tus datos con terceros con fines comerciales.</li>
        </ul>
      </section>

      <section>
        <h2>Dónde se guardan</h2>
        <p>
          En una base de datos PostgreSQL alojada en{' '}
          <code>[proveedor y región, p. ej. AWS RDS — us-east-1]</code>. Las contraseñas se almacenan
          con un hash BCrypt, nunca en texto plano.
        </p>
      </section>

      <section>
        <h2>Cuánto tiempo los conservamos</h2>
        <p>
          Mientras tu cuenta esté activa. Si pedís la baja, eliminamos tus datos personales en un
          plazo de <code>[plazo, p. ej. 30 días]</code>.
        </p>
      </section>

      <section>
        <h2>Tus derechos</h2>
        <p>
          Podés ejercer tus derechos de acceso, rectificación, cancelación y oposición sobre tus
          datos personales, conforme a la Ley N.º 29733 de Protección de Datos Personales y su
          reglamento. Para hacerlo, escribinos a <code>[correo de contacto]</code>.
        </p>
        <p>
          También podés retirar tu consentimiento en cualquier momento; eso implica dar de baja tu
          cuenta, porque sin esos datos la plataforma no puede funcionar.
        </p>
      </section>

      <section>
        <h2>Cambios en esta política</h2>
        <p>
          Cada versión queda identificada por su fecha. Registramos qué versión aceptó cada usuario y
          en qué momento. Si el texto cambia de forma sustancial, te pediremos que aceptes la nueva
          versión antes de seguir usando la plataforma.
        </p>
      </section>
    </>
  )
}

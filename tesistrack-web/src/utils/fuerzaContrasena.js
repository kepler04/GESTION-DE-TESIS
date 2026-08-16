/**
 * Evalúa qué tan resistente es una contraseña y qué le falta para mejorar.
 *
 * La lógica vive fuera del componente para que se pueda razonar (y más adelante
 * testear) sin montar React.
 *
 * Criterio: lo que más protege es la **longitud**, no la variedad de símbolos.
 * Una frase larga en minúsculas aguanta muchísimo más que ocho caracteres con
 * un `$` metido a presión. Por eso la longitud pesa más en el puntaje y la
 * sugerencia principal casi siempre es "hacela más larga".
 *
 * Esto NO valida: el único requisito duro sigue siendo el mínimo de 8 caracteres
 * que exige el backend. El medidor informa, no bloquea — trabar el registro por
 * una heurística de fuerza empuja a la gente a inventar variantes peores.
 */

/** Las que aparecen primero en cualquier ataque de diccionario. */
const COMUNES = [
  'password',
  'contrasena',
  'contraseña',
  '12345678',
  '123456789',
  '1234567890',
  'qwerty',
  'qwertyui',
  'abc123',
  'admin',
  'administrador',
  'iloveyou',
  'welcome',
  'bienvenido',
  'letmein',
  'monkey',
  'dragon',
  'football',
  'usuario',
  'tesis',
  'tesistrack',
  'universidad',
]

/** 4 por longitud + 2 por variedad. */
const PUNTAJE_MAXIMO = 6

const NIVELES = [
  { nivel: 0, etiqueta: 'Muy débil', clase: 'muy-debil' },
  { nivel: 1, etiqueta: 'Débil', clase: 'debil' },
  { nivel: 2, etiqueta: 'Aceptable', clase: 'aceptable' },
  { nivel: 3, etiqueta: 'Fuerte', clase: 'fuerte' },
  { nivel: 4, etiqueta: 'Muy fuerte', clase: 'muy-fuerte' },
]

/** Quita los dígitos y símbolos del final: "password123!" sigue siendo "password". */
function raiz(texto) {
  return texto.replace(/[\d\W_]+$/, '')
}

function tieneSecuencia(texto) {
  const bajo = texto.toLowerCase()
  const series = ['abcdefghijklmnopqrstuvwxyz', '01234567890', 'qwertyuiop', 'asdfghjkl']
  for (const serie of series) {
    for (let i = 0; i + 4 <= serie.length; i++) {
      if (bajo.includes(serie.slice(i, i + 4))) return true
    }
  }
  return false
}

export default function evaluarContrasena(valor, { email = '' } = {}) {
  if (!valor) return null

  const bajo = valor.toLowerCase()
  const avisos = []
  let puntos = 0

  // --- longitud: lo que más pesa ---
  if (valor.length >= 8) puntos += 1
  if (valor.length >= 12) puntos += 1
  if (valor.length >= 16) puntos += 2

  // --- variedad de caracteres ---
  const clases = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(valor)).length
  if (clases >= 2) puntos += 1
  if (clases >= 3) puntos += 1

  // --- penalizaciones ---
  const esComun = COMUNES.some((c) => bajo === c || raiz(bajo) === c)
  if (esComun) {
    avisos.push('Está entre las contraseñas más usadas del mundo: la prueban primero.')
    puntos = Math.min(puntos, 1)
  }

  const local = email.split('@')[0]?.toLowerCase()
  if (local && local.length >= 3 && bajo.includes(local)) {
    avisos.push('Contiene tu correo, que es justo lo primero que alguien conoce de vos.')
    puntos = Math.min(puntos, 1)
  }

  if (/^(.)\1+$/.test(valor)) {
    avisos.push('Es el mismo carácter repetido.')
    puntos = 0
  } else if (tieneSecuencia(valor)) {
    avisos.push('Tiene una secuencia previsible del teclado o del abecedario.')
    puntos = Math.min(puntos, 2)
  }

  if (valor.length < 8) {
    puntos = 0
  }

  // Una frase larga se sostiene sola. Sin esto, "caballo correcto batería grapa"
  // puntuaba por debajo de "T3sis!Track#2026$Lima" pese a resistir bastante más,
  // y el medidor terminaría empujando a la gente hacia contraseñas cortas con
  // símbolos: difíciles de recordar y más fáciles de romper.
  if (valor.length >= 24 && avisos.length === 0) {
    puntos = PUNTAJE_MAXIMO
  }

  // --- qué conviene hacer ahora ---
  let sugerencia = null
  if (valor.length < 8) {
    sugerencia = `Te faltan ${8 - valor.length} caracteres para el mínimo.`
  } else if (avisos.length > 0) {
    sugerencia = 'Probá con algo que no se pueda adivinar a partir de tus datos.'
  } else if (valor.length < 12) {
    sugerencia = 'Sumarle largo la fortalece más que agregarle símbolos.'
  } else if (clases < 3) {
    sugerencia = 'Ya tiene buen largo. Mezclar mayúsculas o números la sube un escalón.'
  }

  const indice = Math.max(
    0,
    Math.min(NIVELES.length - 1, Math.round((puntos / PUNTAJE_MAXIMO) * (NIVELES.length - 1))),
  )
  const nivel = NIVELES[indice]
  const enElTope = indice === NIVELES.length - 1

  return {
    ...nivel,
    porcentaje: ((indice + 1) / NIVELES.length) * 100,
    avisos,
    // En el nivel máximo no hay escalón que subir: seguir sugiriendo mejoras
    // suena a que nunca alcanza y no ayuda a nadie.
    sugerencia: enElTope ? null : sugerencia,
    cumpleMinimo: valor.length >= 8,
  }
}

export const CANTIDAD_NIVELES = NIVELES.length

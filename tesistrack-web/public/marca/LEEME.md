# Logo de TesisTrack

Pegá los archivos **en esta misma carpeta**, con estos nombres exactos.
No hay que tocar nada de código: la app los toma sola al recargar.

| Archivo | Obligatorio | Dónde se usa |
|---|---|---|
| `logo.png` | **sí** | Tarjeta de login (fondo claro) y, si falta el de abajo, también la barra lateral |
| `logo-blanco.png` | opcional | Barra lateral (fondo azul oscuro) |

## Si solo ponés `logo.png`

Alcanza. Para la barra lateral oscura la app le aplica un filtro que lo
invierte, así que un logo **negro sobre fondo transparente** se ve blanco ahí.

Funciona bien con logos de un solo color. Si el logo tiene varios colores, el
filtro los va a distorsionar — en ese caso agregá `logo-blanco.png`.

## Si además ponés `logo-blanco.png`

La barra lateral usa ese y no aplica ningún filtro. Es la opción recomendada
si el logo tiene color.

## Recomendaciones

- **Fondo transparente** (PNG con canal alfa). Con fondo blanco se va a ver un
  recuadro sobre la tarjeta gris del login y sobre el azul de la barra.
- **Ancho ~600 px**, o el doble del tamaño en que se muestra, para que no se
  vea borroso en pantallas retina.
- El logo se escala solo: hasta 104 px de alto en el login y 56 px en la barra.

## Mientras no haya archivo

Se muestra una marca provisional dibujada en SVG (el birrete con "TK"). No es
el logo definitivo: es un relleno para que la pantalla no quede vacía.

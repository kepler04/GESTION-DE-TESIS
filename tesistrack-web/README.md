# TesisTrack — Frontend

Frontend React de TesisTrack. Consume la API del backend Spring Boot (`../tesistrack-app`).

## Stack

- React **18.3.1** (versión exacta fijada — no actualizar sin decisión explícita, ver nota de Arquitectura en el vault de Obsidian)
- Vite

## Cómo correr en local

1. Copiar `.env.example` a `.env` y ajustar `VITE_API_URL` si el backend no corre en `http://localhost:8080`.
2. Instalar dependencias:
   ```
   npm install
   ```
3. Levantar en modo desarrollo:
   ```
   npm run dev
   ```

Requiere que el backend (`../tesistrack-app`) esté corriendo para que el health check en pantalla funcione.

## Build de producción

```
npm run build
```

## Despliegue

Pensado para desplegar en **Vercel** (free tier), configurando `VITE_API_URL` como variable de entorno apuntando a la URL del backend en AWS.

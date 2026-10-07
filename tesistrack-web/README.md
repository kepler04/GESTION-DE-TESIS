# TesisTrack — Frontend

Frontend React de TesisTrack. Consume la API del backend Spring Boot (`../tesistrack-app`).

## Stack

- React **18.3.1** (versión exacta fijada — no actualizar sin decisión explícita, ver nota de Arquitectura en el vault de Obsidian)
- Vite

## Cómo correr en local

1. Instalar dependencias:
   ```
   npm install
   ```
2. Levantar en modo desarrollo:
   ```
   npm run dev
   ```

Queda siempre en **http://localhost:5173** (`strictPort`: si está ocupado, falla en vez de saltar a otro puerto). Vite reenvía `/api` al backend en `http://localhost:8080`, igual que hace nginx en Docker, así que no hay que configurar nada (`.env.development` ya trae `VITE_API_URL` vacío).

Requiere que el backend (`../tesistrack-app`) esté corriendo.

## Build de producción

```
npm run build
```

## Despliegue

Pensado para desplegar en **Vercel** (free tier), configurando `VITE_API_URL` como variable de entorno apuntando a la URL del backend en AWS (ver `.env.example`). En Docker no hace falta: nginx reenvía `/api` al backend.

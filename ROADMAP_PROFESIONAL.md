# TRACKION AGENDA - Roadmap profesional

## Estado actual

La carpeta actual contiene un prototipo PWA local. Funciona en navegador, guarda datos en `localStorage`, permite crear tareas, agentes, invitados, subtareas, evidencias y archivos, y ya tiene una base visual para control operativo.

No debe considerarse todavia una version comercial multiusuario. La sincronizacion real PC/movil y el control de licencias requieren backend, autenticacion y almacenamiento en nube.

## Recomendacion de arquitectura

### 1. IONOS

Usar IONOS para:

- Dominio.
- Web comercial.
- Landing de venta.
- Paginas legales.
- Backend ligero si se decide alojarlo alli.

No usar IONOS como almacen principal de fotos, videos, audios y documentos de usuarios. Ese almacenamiento puede crecer a gigas por usuario y convertiria a TRACKION en custodio directo de datos privados.

### 2. Firebase / Google Cloud

Usar Firebase para:

- Login de usuarios.
- Identidad de agenda propietaria.
- Sincronizacion PC/movil.
- Firestore para tareas, subtareas, agentes, invitados, permisos, estados, alarmas e historial.
- Cloud Functions para jobs programados, avisos y validacion de licencias.

Punto critico: el prototipo actual usa un `deviceId` local. Para comercializar, debe cambiarse a `userId` + `agendaId`, de modo que el mismo usuario vea la misma agenda en movil y PC.

### 3. Google Drive del propietario

Usar Google Drive del usuario propietario para:

- Fotos.
- Videos.
- Audios.
- PDF, DOC, PSD, CDR, XML, TXT y otros archivos pesados.

Estructura recomendada:

```text
Google Drive del propietario/
  TRACKION AGENDA/
    agenda-{agendaId}/
      tareas/
        tarea-{taskId}/
          archivos/
          subtareas/
            subtarea-{subtaskId}/
              archivos/
```

TRACKION guardaria en Firestore solo metadatos:

- `driveFileId`
- nombre
- tipo MIME
- tamano
- propietario
- tarea/subtarea asociada
- fecha de carga
- estado leido/no leido
- permisos visibles para agentes/invitados

Ventaja: el usuario conserva sus archivos y TRACKION reduce coste y responsabilidad sobre datos privados.

## Protocolo de venta y cobro

### Planes sugeridos

- Personal: 6,90 EUR/mes o 69 EUR/ano.
- Pro: 14,90 EUR/mes o 149 EUR/ano.
- Empresa: desde 39 EUR/mes.
- WhatsApp automatico: extra mensual, porque requiere API oficial y coste por conversacion/proveedor.
- Almacenamiento gestionado por TRACKION: extra por GB, solo si el cliente no quiere usar Drive propio.

### Flujo comercial

1. Cliente compra en la web.
2. Stripe crea suscripcion.
3. Firebase crea usuario y agenda.
4. Usuario conecta Google Drive.
5. TRACKION crea carpeta de agenda en Drive.
6. Usuario instala PWA en movil o usa plataforma web en PC.
7. Cada apertura valida licencia activa.
8. Si hay impago, entra en periodo de gracia.
9. Si sigue impago, modo solo lectura.
10. Si cancela, conserva sus archivos en su Drive y puede exportar metadatos.

## WhatsApp automatico

El navegador no puede enviar WhatsApp automaticamente sin abrir WhatsApp ni sin accion del usuario. Para ello se necesita:

- WhatsApp Business Platform o proveedor autorizado.
- Backend con cola de avisos.
- Plantillas aprobadas por WhatsApp.
- Consentimiento del destinatario.
- Registro de envio y errores.

Avisos recomendados:

- 48 horas antes del vencimiento.
- 24 horas antes del vencimiento.
- Aviso al agente asignado.
- Aviso al propietario en tareas personales.
- Aviso al invitado si procede.

## Siguiente fase tecnica

1. Sustituir `deviceId` por autenticacion real.
2. Crear modelo `users/agendas/tasks/subtasks`.
3. Integrar Stripe Billing.
4. Integrar Google Drive OAuth y subida reanudable.
5. Crear permisos reales para agentes e invitados.
6. Crear backend de avisos.
7. Crear modo offline con cola de sincronizacion.
8. Crear panel de administracion de licencias.
9. Crear politicas legales: privacidad, tratamiento de datos, terminos y soporte.


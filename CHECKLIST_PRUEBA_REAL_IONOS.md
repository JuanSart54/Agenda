# TRACKION AGENDA - Checklist antes de subir a IONOS

## Directorio correcto

La aplicacion esta en:

```text
C:\cursorjj\Agenda
```

Subir a IONOS el contenido de esa carpeta, no la carpeta padre.

## Se puede probar ya

- Apertura desde dominio HTTPS en PC.
- Instalacion como PWA en movil.
- Navegacion responsive PC/movil.
- Creacion y edicion de tareas, subtareas, agentes e invitados.
- Galeria de fotos, videos y audios.
- Avisadores de evidencias pendientes de revisar.
- Exportacion e importacion manual de respaldo JSON.

## Prueba con propietario PC/movil

La base de sincronizacion del propietario ya esta preparada con Firebase Auth:

- Login por email y contrasena.
- Crear cuenta.
- Recuperacion de contrasena por email.
- Guardado Firestore por `uid` + `agendaId`.

Para probarlo hay que configurar Firebase en `config.js` y cambiar `syncMode` a `"firebase"`.

## No esta lista todavia para prueba multiusuario real completa

Estado pendiente:

- Reglas Firestore estrictas para propietario, agentes e invitados.
- Login/rol especifico para agentes.
- Login/rol especifico para invitados visualizadores.
- Escritura segura de agentes de vuelta en la agenda propietaria.
- Lectura segura de invitados sin modificar estados del propietario.
- Almacenamiento pesado en Google Drive del propietario o Storage por usuario.

## Antes de pedir pruebas a amigos

Desarrollar primero:

1. Reglas Firebase para propietario, agentes e invitados.
2. Invitaciones autenticadas por rol.
3. Escritura de agentes en tareas/subtareas asignadas.
4. Lectura de invitados sin marcar evidencias como revisadas por el propietario.
5. Sincronizacion Firestore en tiempo real.
6. Almacenamiento de archivos en Google Drive del propietario o Storage por usuario.
7. Panel propietario/admin para activar, suspender o poner en solo lectura agendas por licencia.

## Subida a IONOS para prueba tecnica

Si se sube ahora a IONOS, usarlo solo como prueba tecnica de instalacion y navegacion.

En `config.js` cambiar:

```js
appBaseUrl: "https://TU-DOMINIO/"
```

Mantener claro que, mientras `syncMode` sea `"local"`, PC y movil no compartiran datos automaticamente. Para sincronizar propietario PC/movil, configurar Firebase y entrar con el mismo email en ambos dispositivos.

## Panel de licencias futuro

Debe incluir:

- Lista de agendas activas.
- Estado de suscripcion: trial, activa, gracia, impagada, cancelada.
- Boton para suspender agenda.
- Modo solo lectura por impago.
- Fecha de proxima renovacion.
- Historial de pagos.
- Integracion Stripe Billing.
- Validacion de licencia en cada apertura de la app.

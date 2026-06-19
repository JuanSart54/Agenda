# TRACKION AGENDA

Prototipo web local de TRACKION AGENDA para organizacion personal, tareas compartidas, agentes, evidencias y seguimiento operativo.

## Ejecutar

```powershell
python -m http.server 1455
```

Abrir:

```text
http://localhost:1455
```

## Funciones implementadas

- Alta y edicion de tareas personales, compartidas y permanentes.
- Titulo, palabras clave, fecha de alta automatica, fecha prevista, recordatorio, descripcion, categoria y prioridad.
- Estados: nueva, comenzada, pausa/no continuar y terminada.
- Agentes y visualizadores.
- Avance de 0 a 10.
- Evidencias con fotos, videos, audios y archivos relacionados.
- Modo de carga desde dispositivo o camara, con fecha/hora y GPS cuando el navegador lo permita.
- Subtareas dentro de tareas, con agente, vencimiento, avance, permisos de invitados y aviso visual de cargas pendientes.
- Filtros combinados por texto, estado, tipo, categoria, evidencias y ordenacion.
- Contadores de alarmas, evidencias nuevas, subtareas e invitados.
- Panel CONFIG con telefono del propietario, criterio de almacenamiento y respaldo local.
- Exportacion/importacion JSON de datos locales.
- Estadisticas y grafica simple de evolucion.
- Pie obligatorio de empresa.

## Siguiente fase tecnica

La version actual funciona en `localStorage` cuando `syncMode` esta en `"local"` y ya esta preparada como PWA instalable. Tambien incluye base de Firebase Auth para entrar con email/contrasena, crear cuenta, cerrar sesion y recuperar contrasena por email. Para produccion comercial, consultar `ROADMAP_PROFESIONAL.md`: los archivos pesados deben almacenarse preferentemente en Google Drive del propietario o Storage por usuario, y los roles de agentes/invitados deben endurecerse con reglas de seguridad.

## PWA

- `manifest.webmanifest` permite instalar la Agenda en PC y movil.
- `sw.js` cachea la app para abrirla incluso sin conexion.
- `register-sw.js` registra el service worker y muestra el boton de instalacion cuando el navegador lo permite.

## Sincronizacion

Por defecto `config.js` usa:

```js
syncMode: "local"
```

Para activar Firebase:

1. Crear proyecto en Firebase / Google Cloud.
2. Activar Firestore.
3. Copiar `config.example.js` sobre `config.js`.
4. Pegar las claves web de Firebase.
5. Cambiar `appBaseUrl` al dominio final, por ejemplo `https://agenda.negotecnica.com/`.

Cuando `syncMode` sea `firebase`, `data-store.js` usa Firebase Auth y guarda tareas en Firestore por usuario autenticado:

```text
trackionUsers/{uid}/agendas/{agendaId}
```

Esto permite que el propietario entre con el mismo email/contrasena en PC y movil y vea la misma agenda. La recuperacion de contrasena usa el email de Firebase Auth.

Pendiente para comercializacion: reglas Firestore estrictas, roles reales de agentes/invitados, invitaciones autenticadas y panel de licencias/suscripciones.

## Compartir por WhatsApp

El boton `WhatsApp` genera un enlace de importacion. En local apunta a `localhost`; en produccion usara `appBaseUrl`. Al abrir el enlace, la tarea se incorpora a la Agenda del receptor.

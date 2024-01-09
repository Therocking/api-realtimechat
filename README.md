# Chat en tiempo real
Aplicación de comunocación en tiempo real.

## Iniciar
En este código de ejemplo se utiliza la db turso [Documentación de turso](https://docs.turso.tech/). Genera el un token de la db para utilzarla.

1. Ejecutar ```npm i``` para cargar los módulos.
2. Crear el archivo ```.env``` y colocar las siguientes credenciales para turso: ```DB_URL``` y ```DB_TOKEN```.

## Objetivo
Mi objetivo con este proyecto es crear una aplicación utilizando y reforzando los conocimientos que tengo y agregarlo a mi portafolio de proyectos.

## Requerimientos

### Implementaciones iniciales
- Registro de usuarios.
- Autenticación de usuarios.
- Chat público.
- Chat privado(chat entre dos personas).
- Chat grupal.

## Casos de uso 
- Crear cuenta.
- Ingresar con cuenta existente.
- Ingresar con AuthO.
- Escribir en el chat.
- Crear un chat.

## Endpoints
- /v1/api/auth/register - POST
- /v1/api/auth/login - POST
- /v1/api/chats - GET
- /v1/api/chats/public - GET
- /v1/api/chats/private - GET - POST
- /v1/api/chats/private/:id - GET - POST - PUT - DELETE
- /v1/api/chats/gruop - GET - POST
- /v1/api/chats/gruop/:id - GET - POST - PUT - DELETE

## Problemas
### Problma #1: espacios privados
- Crear función que tome el nombre de espacio que se quiere crear, crear su db, configurar la db con custom values, redireccionar al chat.

### Problema #2: Persistencia de datos
- Encontrar una forma de guardar los chats( guardar las conversaciones, usuarios, etc).

### Problema #3: Mensajes duplicados

### Problema #4: Multiples mesajes al mismo tiempo

### Otras implementaciones
- Mensajes Multimedia:
Permite a los usuarios compartir imágenes y otros tipos de contenido multimedia en los chats.
Emojis y Reacciones:

- Implementa emojis y reacciones para que los usuarios puedan expresar sus emociones de manera rápida y divertida.
Notificaciones en Tiempo Real:

- Envía notificaciones en tiempo real a los usuarios cuando reciben nuevos mensajes, incluso si no están activos en la aplicación.
Búsqueda de Mensajes:

- Proporciona una función de búsqueda para que los usuarios puedan encontrar rápidamente mensajes antiguos en sus conversaciones.
Presencia del Usuario:

- Muestra la presencia en tiempo real de los usuarios (por ejemplo, si están en línea, desconectados o ausentes).
Chats Grupales:

- Permite la creación de chats grupales donde múltiples usuarios pueden participar y comunicarse.
Integración con Redes Sociales:

- Ofrece la posibilidad de vincular cuentas de redes sociales para facilitar la conexión con amigos y compartir contenido en otros canales.
Estadísticas y Analytics:

Modo Nocturno/Tema Personalizable:

- Permite a los usuarios personalizar la apariencia de la aplicación con temas oscuros, claros u otras opciones de personalización.
Banderas y Reportes:

Traducción Automática:

- Facilita la comunicación entre usuarios que hablan diferentes idiomas mediante la implementación de traducción automática.
Sistema de Puntos o Logros:

- Motiva a los usuarios a participar y ser activos en la plataforma mediante un sistema de puntos o logros.
Cifrado de Extremo a Extremo:

- Mejora la privacidad y seguridad de las conversaciones mediante la implementación de cifrado de extremo a extremo.

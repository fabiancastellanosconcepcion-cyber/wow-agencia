# 🎓 Academia WoW — Guía de instalación

## Archivos creados

| Archivo | Qué es |
|---|---|
| `academia.html` | Landing page del curso (la que ve el cliente) |
| `login.html` | Página de acceso para estudiantes |
| `portal.html` | El curso completo (protegido) |
| `admin.html` | Tu panel para gestionar estudiantes |

---

## PASO 1 — Crear cuenta en Supabase (gratis)

1. Ve a **https://supabase.com** y crea una cuenta gratuita
2. Crea un nuevo proyecto (ponle "academia-wow")
3. Una vez creado, ve a **Settings → API**
4. Copia estos dos valores:
   - **Project URL** → algo como `https://xxxxx.supabase.co`
   - **anon public key** → una clave larga

---

## PASO 2 — Poner tus claves en los archivos

En los archivos `login.html`, `portal.html` y `admin.html` busca estas líneas y reemplaza:

```javascript
const SUPABASE_URL = 'TU_SUPABASE_URL';       // ← pon tu Project URL
const SUPABASE_ANON_KEY = 'TU_SUPABASE_ANON_KEY'; // ← pon tu anon key
```

En `admin.html` también cambia:
```javascript
const ADMIN_EMAIL = 'TU_EMAIL_DE_ADMIN@gmail.com'; // ← pon TU email
```

---

## PASO 3 — Configurar Supabase Auth

1. En Supabase ve a **Authentication → Settings**
2. En "Site URL" pon: `https://wowcreativa.com`
3. En "Redirect URLs" agrega: `https://wowcreativa.com/portal.html`
4. En **Authentication → Email Templates** personaliza el email de invitación con el nombre de Academia WoW

---

## PASO 4 — Agregar "Academia WoW" al navbar de tu web principal

En tu `index.html` busca el navbar y agrega este link:

```html
<li><a href="/academia.html">Academia WoW</a></li>
```

---

## PASO 5 — Subir archivos a Netlify

Sube los 4 archivos HTML a la raíz de tu web en Netlify:
- `academia.html`
- `login.html`  
- `portal.html`
- `admin.html`

---

## PASO 6 — Crear tu cuenta de admin

1. Ve a **https://wowcreativa.com/admin.html**
2. En Supabase ve a **Authentication → Users → Invite user**
3. Invita tu propio email
4. Recibirás un link para crear tu contraseña
5. Ya puedes entrar al panel admin

---

## Cómo funciona el flujo completo

```
Cliente ve la landing (academia.html)
    ↓
Elige cómo pagar y te manda comprobante por WhatsApp
    ↓
Tú entras a admin.html y agregas su nombre + email
    ↓
Tú le creas manualmente el usuario en Supabase:
  Authentication → Users → Invite user → pones su email
    ↓
Supabase le manda un email automático para crear su contraseña
    ↓
El cliente entra a login.html con su email y contraseña
    ↓
Accede a portal.html y ve el curso completo
```

---

## Cómo agregar tus videos al curso

En `portal.html` busca el array `LESSONS` al inicio del script.
Cada lección tiene un campo `videoId`. Cuando tengas el video listo:

**Si usas YouTube (videos no listados):**
```javascript
videoId: 'dQw4w9WgXcQ'  // El ID al final de la URL de YouTube
```

**Si usas Vimeo:**
Cambia la línea del iframe en la función `loadLesson()`:
```javascript
src="https://player.vimeo.com/video/${l.videoId}"
```

---

## Tu panel admin está en:
`https://wowcreativa.com/admin.html`

**Guarda esta URL de forma privada. No la compartas.**

---

## Soporte
¿Algún problema con la configuración? Escríbeme y te ayudo paso a paso.

# 🚀 Configuración — Netlify Function para invitar estudiantes

## Archivos que tienes que subir a Netlify

```
tu-proyecto/
├── admin.html          ← (el nuevo, reemplaza el anterior)
├── netlify/
│   └── functions/
│       └── invite-student.js   ← (nuevo archivo)
└── ... (resto de tus archivos)
```

---

## PASO 1 — Crear la tabla "students" en Supabase

Ve a **Supabase → SQL Editor** y ejecuta esto:

```sql
CREATE TABLE students (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Solo el admin autenticado puede ver/modificar la tabla
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin only" ON students
  USING (auth.jwt() ->> 'email' = 'wowagenciacreativa2026@gmail.com');
```

---

## PASO 2 — Agregar variables de entorno en Netlify

Ve a **Netlify → tu sitio → Site configuration → Environment variables** y agrega:

| Variable | Valor |
|---|---|
| `SUPABASE_URL` | `https://zqkofhreflxkspsbzqxl.supabase.co` |
| `SUPABASE_SERVICE_KEY` | `(tu service_role key)` |
| `SITE_URL` | `https://wowcreativa.com` |

> ⚠️ La `SUPABASE_SERVICE_KEY` nunca va en el código. Solo en las variables de entorno de Netlify.

---

## PASO 3 — Subir los archivos a Netlify

Sube a la raíz de tu proyecto en Netlify:
- `admin.html` (reemplaza el anterior)
- `netlify/functions/invite-student.js` (nueva carpeta y archivo)

Si usas drag & drop en Netlify, asegúrate de subir la carpeta completa con la estructura correcta.

---

## PASO 4 — Configurar Supabase Auth (email de invitación)

Ve a **Supabase → Authentication → Email Templates → Invite user**

Puedes personalizar el mensaje que reciben los estudiantes. El link de confirmación los llevará a `portal.html` automáticamente.

También en **Authentication → URL Configuration**:
- Site URL: `https://wowcreativa.com`
- Redirect URLs: `https://wowcreativa.com/portal.html`

---

## Cómo funciona ahora el flujo completo

```
Cliente paga → te manda comprobante por WhatsApp
        ↓
Tú entras a admin.html
        ↓
Pones nombre + email → clic en "Agregar"
        ↓
Netlify Function llama a Supabase con tu service_role key
        ↓
Supabase crea el usuario Y le manda email automático
        ↓
El estudiante recibe el correo, crea su contraseña
        ↓
Entra a login.html → accede a portal.html
```

Todo desde un solo clic en tu panel admin. ✅

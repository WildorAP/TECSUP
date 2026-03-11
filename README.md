# Canales Hidráulicos - Sistema de Cálculos

Se diseña una app web para hacer cálculos hidráulicos de canales abiertos. Básicamente, ingresas datos de tu canal (caudal, pendiente, rugosidad, etc.) y la app te calcula las dimensiones óptimas, te muestra gráficos y te deja guardar todo en la nube.

## ¿Qué hace esta app?

Esta aplicación te ayuda a diseñar canales hidráulicos de forma rápida y profesional:

- **Calcula secciones óptimas**: Te dice cuál es el mejor ancho y profundidad para tu canal según el caudal que necesitas mover
- **Guarda tus proyectos**: Todos tus cálculos quedan guardados en la nube con tu cuenta personal
- **Genera reportes PDF**: Descarga reportes profesionales con todos los resultados y gráficos
- **Visualiza resultados**: Gráficos interactivos que muestran la sección transversal de tu canal
- **Historial completo**: Revisa, edita o elimina cálculos anteriores cuando quieras

**Módulos disponibles:**
- ✅ Sección Óptima (diseño de máxima eficiencia)
- 🔜 Tirante Normal
- 🔜 Tirante Crítico
- 🔜 Salto Hidráulico
- 🔜 Curva de Remanso

## ¿Cómo instalar y ejecutar?

### Lo que necesitas antes de empezar:

- **Node.js** (versión 18 o superior) -(https://nodejs.org/)
- **Backend: Supabase** (es gratis) -(https://supabase.com)
- **Frintend: VITE, con JAVASCRIPTS**

### Paso 1: Clona el proyecto

```bash
git clone https://github.com/WildorAP/TECSUP.git
cd TECSUP
```

### Paso 2: Instala las dependencias

```bash
npm install
```

### Paso 3: Configura tu base de datos en Supabase

**3.1. Crea tu proyecto en Supabase:**
1. Entra a [supabase.com](https://supabase.com) y crea una cuenta
2. Dale a "New Project" y ponle un nombre




**3.2. Conecta la app con Supabase:**

1. Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

2. Obtén tus credenciales:
   - En Supabase, ve a **Project Settings** (el ícono de engranaje)
   - Busca la sección **API**
   - Copia la **Project URL** y la **anon/public key**

3. Abre el archivo `.env` que acabas de crear y pega tus credenciales:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_publica_aqui
```

### Paso 4: ¡Arranca la app!

```bash
npm run dev
```

Listo, abre tu navegador en `http://localhost:5173` y ya puedes usar la app 🎉

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx          # Barra de navegación
│   │   ├── Footer.jsx          # Pie de página
│   │   └── MainLayout.jsx      # Layout principal
│   └── ProtectedRoute.jsx      # Protección de rutas
├── config/
│   └── supabase.js             # Cliente de Supabase
├── modules/
│   └── SeccionOptima.jsx       # Módulo de Sección Óptima
├── pages/
│   ├── Login.jsx               # Página de login
│   ├── Register.jsx            # Página de registro
│   ├── Dashboard.jsx           # Dashboard principal
│   └── Historial.jsx           # Historial de cálculos
├── services/
│   └── calculationService.js   # Servicios de cálculos
├── store/
│   └── authStore.js            # Estado de autenticación (Zustand)
├── utils/
│   ├── constants.js            # Constantes físicas
│   └── hydraulicFormulas.js    # Fórmulas hidráulicas
├── App.jsx                     # Componente principal
└── main.jsx                    # Punto de entrada
```

## ¿Cómo usar la app?

### Primera vez: Crea tu cuenta

1. Abre la app en tu navegador
2. Dale a "Regístrate aquí"
3. Llena el formulario con tu email y contraseña
4. Revisa tu correo (a veces cae en spam) y confirma tu cuenta
5. Inicia sesión y listo

### Hacer un cálculo de sección óptima

1. En el Dashboard, entra a **"Sección Óptima"**
2. Llena los datos de tu canal:
   - **Caudal Q** (m³/s) - Ejemplo: 10
   - **Talud Z** (H:V) - Ejemplo: 1.5 (significa 1.5 horizontal por 1 vertical)
   - **Manning n** - Ejemplo: 0.013 (concreto liso) o 0.020 (tierra)
   - **Pendiente S** (m/m) - Ejemplo: 0.001 (0.1%)
3. Dale a **"Calcular Sección Óptima"**
4. Revisa los resultados: tirante, ancho, velocidad, etc.
5. Si quieres guardarlo, dale a **"Guardar Cálculo"** y ponle un nombre
6. Para descargar el reporte, dale a **"Descargar PDF"**

### Ver tus cálculos anteriores

1. En el menú de arriba, entra a **"Historial"**
2. Ahí verás todos tus cálculos guardados
3. Dale a **"Ver"** para abrir uno y editarlo
4. Si ya no lo necesitas, dale al ícono de basura para eliminarlo

## ¿Qué tecnologías usamos?

Esta app está construida con herramientas modernas y probadas:

**Frontend (lo que ves):**
- **React 19** - La librería principal para construir la interfaz
- **Vite** - Para que el desarrollo sea súper rápido
- **TailwindCSS + DaisyUI** - Para que se vea bonito sin escribir mucho CSS
- **Recharts** - Para los gráficos interactivos del canal
- **React Router** - Para navegar entre páginas sin recargar

**Backend (donde se guarda todo):**
- **Supabase** - Es como Firebase pero open source. Maneja:
  - La autenticación (login/registro)
  - La base de datos PostgreSQL
  - Las políticas de seguridad (cada quien ve solo sus cálculos)

**Otras herramientas útiles:**
- **Zustand** - Manejo de estado global (más simple que Redux)
- **jsPDF + Canvg** - Para generar los reportes PDF con gráficos
- **React Toastify** - Las notificaciones que aparecen arriba
- **Lucide React** - Los íconos bonitos que ves por toda la app
- **date-fns** - Para formatear fechas de forma legible

## Módulos Disponibles

### ✅ Sección Óptima
Diseño de canal trapezoidal con máxima eficiencia hidráulica. Calcula las dimensiones óptimas que minimizan el perímetro mojado para un caudal dado.

**Fórmulas utilizadas:**
- Relación óptima: `b/y = 2·tan(θ/2)` donde `θ = arctan(1/Z)`
- Ecuación de Manning: `Q = (1/n)·A·R^(2/3)·√S`
- Método de Newton-Raphson para convergencia

### 🔜 Próximos Módulos
- Tirante Normal
- Tirante Crítico
- Salto Hidráulico
- Curva de Remanso
- Energía Específica

## 🐛 Si algo no funciona...

**"Faltan variables de entorno de Supabase"**
- Revisa que el archivo `.env` exista en la raíz del proyecto
- Verifica que copiaste bien la URL y la key de Supabase
- Reinicia el servidor (`Ctrl+C` y luego `npm run dev`)

**No puedo guardar cálculos**
- Asegúrate de haber ejecutado el script SQL en Supabase (Paso 3.2)
- Verifica que iniciaste sesión en la app
- Revisa la consola del navegador (F12) para ver errores





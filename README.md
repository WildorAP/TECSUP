# 🌊 Canales Hidráulicos - Sistema de Cálculos

Aplicación web para cálculos hidráulicos de canales abiertos con arquitectura modular, autenticación y sistema de reportes.

## 🚀 Características

- ✅ **Autenticación completa** con Supabase Auth
- ✅ **Módulo de Sección Óptima** (Diseño de máxima eficiencia hidráulica)
- ✅ **Historial de cálculos** guardados en la nube
- ✅ **Gráficos interactivos** con Recharts
- ✅ **Interfaz moderna** con TailwindCSS + DaisyUI
- ✅ **Arquitectura modular** escalable
- 🔜 Generación de reportes PDF
- 🔜 Más módulos (Tirante Normal, Tirante Crítico, Salto Hidráulico)

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta en Supabase (gratuita)

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
cd CANALES
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Supabase

#### 3.1. Crear proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto
4. Espera a que se complete la configuración

#### 3.2. Crear las tablas en Supabase

Ve a **SQL Editor** en tu proyecto de Supabase y ejecuta:

```sql
-- Tabla de cálculos
CREATE TABLE calculations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  module_type TEXT NOT NULL,
  name TEXT NOT NULL,
  input_data JSONB NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_calculations_user_id ON calculations(user_id);
CREATE INDEX idx_calculations_module_type ON calculations(module_type);
CREATE INDEX idx_calculations_created_at ON calculations(created_at DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad: Los usuarios solo pueden ver/editar sus propios cálculos
CREATE POLICY "Users can view their own calculations"
  ON calculations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calculations"
  ON calculations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calculations"
  ON calculations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calculations"
  ON calculations FOR DELETE
  USING (auth.uid() = user_id);
```

#### 3.3. Configurar variables de entorno

1. Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

2. Obtén tus credenciales de Supabase:
   - Ve a **Project Settings** > **API**
   - Copia la **Project URL**
   - Copia la **anon/public key**

3. Edita el archivo `.env`:
```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

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

## 🎯 Uso

### 1. Registro e Inicio de Sesión

1. Abre la aplicación en tu navegador
2. Haz clic en "Regístrate aquí"
3. Completa el formulario de registro
4. Verifica tu correo electrónico (revisa spam)
5. Inicia sesión con tus credenciales

### 2. Realizar un Cálculo

1. Desde el Dashboard, haz clic en **"Sección Óptima"**
2. Ingresa los datos:
   - **Caudal Q** (m³/s)
   - **Talud Z** (H:V) - Ejemplo: 1.5
   - **Coeficiente de Manning n** - Ejemplo: 0.013 (concreto)
   - **Pendiente S** (m/m) - Ejemplo: 0.001
3. Haz clic en **"Calcular Sección Óptima"**
4. Revisa los resultados y el gráfico
5. Haz clic en **"Guardar Cálculo"** para guardarlo

### 3. Ver Historial

1. Haz clic en **"Historial"** en la barra de navegación
2. Verás todos tus cálculos guardados
3. Haz clic en **"Ver"** para cargar un cálculo anterior
4. Puedes eliminar cálculos con el botón de basura

## 🔧 Tecnologías Utilizadas

- **React 19** - Framework frontend
- **Vite** - Build tool
- **React Router** - Navegación
- **Supabase** - Backend (Auth + Database)
- **Zustand** - Estado global
- **TailwindCSS** - Estilos
- **DaisyUI** - Componentes UI
- **Recharts** - Gráficos
- **React Hook Form** - Formularios
- **React Toastify** - Notificaciones
- **Lucide React** - Iconos
- **date-fns** - Manejo de fechas

## 📚 Módulos Disponibles

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

## 🐛 Solución de Problemas

### Error: "Faltan variables de entorno de Supabase"
- Verifica que el archivo `.env` existe
- Verifica que las variables están correctamente configuradas
- Reinicia el servidor de desarrollo

### Error al guardar cálculos
- Verifica que las tablas están creadas en Supabase
- Verifica que las políticas RLS están configuradas
- Verifica que estás autenticado

### Los estilos no se cargan
- Ejecuta `npm install` nuevamente
- Verifica que TailwindCSS está configurado correctamente
- Limpia la caché: `npm run build` y luego `npm run dev`

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Autor

Desarrollado para ingeniería hidráulica - TECSUP

---

¿Preguntas o sugerencias? Abre un issue en el repositorio.

-- ============================================
-- CONFIGURACIÓN DE BASE DE DATOS SUPABASE
-- Sistema de Cálculos Hidráulicos de Canales
-- ============================================

-- 1. TABLA DE CÁLCULOS
-- Almacena todos los cálculos realizados por los usuarios
CREATE TABLE IF NOT EXISTS calculations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_type TEXT NOT NULL CHECK (module_type IN (
    'optimal-section',
    'normal-depth',
    'critical-depth',
    'hydraulic-jump',
    'specific-energy',
    'flow-profile'
  )),
  name TEXT NOT NULL,
  input_data JSONB NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ÍNDICES PARA MEJORAR RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_calculations_user_id ON calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_calculations_module_type ON calculations(module_type);
CREATE INDEX IF NOT EXISTS idx_calculations_created_at ON calculations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calculations_name ON calculations(name);

-- 3. FUNCIÓN PARA ACTUALIZAR TIMESTAMP AUTOMÁTICAMENTE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. TRIGGER PARA ACTUALIZAR updated_at
DROP TRIGGER IF EXISTS update_calculations_updated_at ON calculations;
CREATE TRIGGER update_calculations_updated_at
  BEFORE UPDATE ON calculations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;

-- 6. POLÍTICAS DE SEGURIDAD
-- Los usuarios solo pueden ver sus propios cálculos
DROP POLICY IF EXISTS "Users can view their own calculations" ON calculations;
CREATE POLICY "Users can view their own calculations"
  ON calculations FOR SELECT
  USING (auth.uid() = user_id);

-- Los usuarios solo pueden insertar sus propios cálculos
DROP POLICY IF EXISTS "Users can insert their own calculations" ON calculations;
CREATE POLICY "Users can insert their own calculations"
  ON calculations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios solo pueden actualizar sus propios cálculos
DROP POLICY IF EXISTS "Users can update their own calculations" ON calculations;
CREATE POLICY "Users can update their own calculations"
  ON calculations FOR UPDATE
  USING (auth.uid() = user_id);

-- Los usuarios solo pueden eliminar sus propios cálculos
DROP POLICY IF EXISTS "Users can delete their own calculations" ON calculations;
CREATE POLICY "Users can delete their own calculations"
  ON calculations FOR DELETE
  USING (auth.uid() = user_id);

-- 7. VISTA PARA ESTADÍSTICAS (OPCIONAL)
CREATE OR REPLACE VIEW calculation_stats AS
SELECT 
  user_id,
  module_type,
  COUNT(*) as total_calculations,
  MIN(created_at) as first_calculation,
  MAX(created_at) as last_calculation
FROM calculations
GROUP BY user_id, module_type;

-- ============================================
-- DATOS DE EJEMPLO (OPCIONAL - SOLO PARA TESTING)
-- ============================================
-- Descomentar las siguientes líneas si quieres datos de prueba
-- NOTA: Reemplaza 'tu-user-id-aqui' con un UUID real de un usuario

/*
INSERT INTO calculations (user_id, module_type, name, input_data, results) VALUES
(
  'tu-user-id-aqui',
  'optimal-section',
  'Canal Principal - Sector A',
  '{"caudal": "10", "talud": "1.5", "rugosidad": "0.013", "pendiente": "0.001"}',
  '{"tirante": 1.2345, "anchoSolera": 2.4690, "area": 5.2345, "perimetroMojado": 7.8901, "radioHidraulico": 0.6634, "velocidad": 1.9123, "energiaEspecifica": 1.4201, "anchoSuperficial": 6.1725, "numeroFroude": 0.7234, "tipoFlujo": "Subcrítico", "iteraciones": 5, "relacionBY": 2.0000}'
);
*/

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ejecuta estas consultas para verificar que todo está correcto

-- Ver todas las tablas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Ver políticas RLS
SELECT * 
FROM pg_policies 
WHERE tablename = 'calculations';

-- Ver índices
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'calculations';

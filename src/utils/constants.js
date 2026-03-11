// Constantes físicas
export const GRAVITY = 9.81; // m/s²

// Coeficientes de Manning típicos
export const MANNING_COEFFICIENTS = {
  CONCRETE: 0.013,
  EARTH: 0.020,
  GRAVEL: 0.025,
  ROCK: 0.035,
};

// Tolerancias para cálculos iterativos
export const CALCULATION_TOLERANCE = 0.0001;
export const MAX_ITERATIONS = 1000;

// Tipos de módulos
export const MODULE_TYPES = {
  OPTIMAL_SECTION: 'optimal-section',
  NORMAL_DEPTH: 'normal-depth',
  CRITICAL_DEPTH: 'critical-depth',
  HYDRAULIC_JUMP: 'hydraulic-jump',
};

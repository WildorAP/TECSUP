import { GRAVITY } from './constants';

/**
 * Calcula el área hidráulica de un canal trapezoidal
 * @param {number} b - Ancho de solera (m)
 * @param {number} y - Tirante (m)
 * @param {number} Z - Talud (H:V)
 * @returns {number} Área (m²)
 */
export const calculateTrapezoidalArea = (b, y, Z) => {
  return b * y + Z * y * y;
};

/**
 * Calcula el perímetro mojado de un canal trapezoidal
 * @param {number} b - Ancho de solera (m)
 * @param {number} y - Tirante (m)
 * @param {number} Z - Talud (H:V)
 * @returns {number} Perímetro mojado (m)
 */
export const calculateTrapezoidalPerimeter = (b, y, Z) => {
  return b + 2 * y * Math.sqrt(1 + Z * Z);
};

/**
 * Calcula el radio hidráulico
 * @param {number} A - Área (m²)
 * @param {number} P - Perímetro mojado (m)
 * @returns {number} Radio hidráulico (m)
 */
export const calculateHydraulicRadius = (A, P) => {
  return A / P;
};

/**
 * Calcula el caudal usando la ecuación de Manning
 * @param {number} n - Coeficiente de Manning
 * @param {number} A - Área (m²)
 * @param {number} R - Radio hidráulico (m)
 * @param {number} S - Pendiente (m/m)
 * @returns {number} Caudal (m³/s)
 */
export const calculateManningFlow = (n, A, R, S) => {
  return (1 / n) * A * Math.pow(R, 2 / 3) * Math.sqrt(S);
};

/**
 * Calcula el número de Froude
 * @param {number} v - Velocidad (m/s)
 * @param {number} A - Área (m²)
 * @param {number} T - Ancho superficial (m)
 * @returns {number} Número de Froude
 */
export const calculateFroude = (v, A, T) => {
  return v / Math.sqrt(GRAVITY * (A / T));
};

/**
 * Calcula la energía específica
 * @param {number} y - Tirante (m)
 * @param {number} v - Velocidad (m/s)
 * @returns {number} Energía específica (m)
 */
export const calculateSpecificEnergy = (y, v) => {
  return y + (v * v) / (2 * GRAVITY);
};

/**
 * Calcula el ancho superficial de un canal trapezoidal
 * @param {number} b - Ancho de solera (m)
 * @param {number} y - Tirante (m)
 * @param {number} Z - Talud (H:V)
 * @returns {number} Ancho superficial (m)
 */
export const calculateTopWidth = (b, y, Z) => {
  return b + 2 * Z * y;
};

/**
 * Determina el tipo de flujo según el número de Froude
 * @param {number} F - Número de Froude
 * @returns {string} Tipo de flujo
 */
export const getFlowType = (F) => {
  if (F < 1) return 'Subcrítico';
  if (F > 1) return 'Supercrítico';
  return 'Crítico';
};

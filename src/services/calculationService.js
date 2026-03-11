import { supabase } from '../config/supabase';

/**
 * Guarda un cálculo en Supabase
 */
export const saveCalculation = async (moduleType, name, inputData, results) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Usuario no autenticado');

  const { data, error } = await supabase
    .from('calculations')
    .insert({
      user_id: user.id,
      module_type: moduleType,
      name,
      input_data: inputData,
      results,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Obtiene todos los cálculos del usuario
 */
export const getCalculations = async (moduleType = null) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Usuario no autenticado');

  let query = supabase
    .from('calculations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (moduleType) {
    query = query.eq('module_type', moduleType);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

/**
 * Actualiza un cálculo existente
 */
export const updateCalculation = async (id, name, inputData, results) => {
  const { data, error } = await supabase
    .from('calculations')
    .update({
      name,
      input_data: inputData,
      results,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Elimina un cálculo
 */
export const deleteCalculation = async (id) => {
  const { error } = await supabase
    .from('calculations')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

/**
 * Obtiene un cálculo por ID
 */
export const getCalculationById = async (id) => {
  const { data, error } = await supabase
    .from('calculations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

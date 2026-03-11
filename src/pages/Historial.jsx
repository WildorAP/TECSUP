import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCalculations, deleteCalculation } from '../services/calculationService';
import { toast } from 'react-toastify';
import { Trash2, Eye, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Historial() {
  const [calculations, setCalculations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadCalculations();
  }, [filter]);

  const loadCalculations = async () => {
    try {
      setLoading(true);
      const moduleType = filter === 'all' ? null : filter;
      const data = await getCalculations(moduleType);
      setCalculations(data);
    } catch (error) {
      toast.error('Error al cargar el historial');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este cálculo?')) return;

    try {
      await deleteCalculation(id);
      toast.success('Cálculo eliminado');
      loadCalculations();
    } catch (error) {
      toast.error('Error al eliminar el cálculo');
    }
  };

  const handleView = (calculation) => {
    // Navegar al módulo correspondiente con los datos
    if (calculation.module_type === 'optimal-section') {
      navigate('/modulos/seccion-optima', { state: { calculation } });
    }
  };

  const getModuleName = (moduleType) => {
    const names = {
      'optimal-section': 'Sección Óptima',
      'normal-depth': 'Tirante Normal',
      'critical-depth': 'Tirante Crítico',
      'hydraulic-jump': 'Salto Hidráulico',
    };
    return names[moduleType] || moduleType;
  };

  const getModuleColor = (moduleType) => {
    const colors = {
      'optimal-section': 'badge-warning',
      'normal-depth': 'badge-info',
      'critical-depth': 'badge-success',
      'hydraulic-jump': 'badge-secondary',
    };
    return colors[moduleType] || 'badge-neutral';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Historial de Cálculos</h1>
          <p className="text-base-content/70">
            {calculations.length} cálculo{calculations.length !== 1 ? 's' : ''} guardado{calculations.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="form-control w-full md:w-auto">
          <select
            className="select select-bordered"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Todos los módulos</option>
            <option value="optimal-section">Sección Óptima</option>
            <option value="normal-depth">Tirante Normal</option>
            <option value="critical-depth">Tirante Crítico</option>
            <option value="hydraulic-jump">Salto Hidráulico</option>
          </select>
        </div>
      </div>

      {calculations.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-16 w-16 mx-auto text-base-content/30 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No hay cálculos guardados</h3>
          <p className="text-base-content/70 mb-6">
            Comienza realizando cálculos desde el dashboard
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary"
          >
            Ir al Dashboard
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {calculations.map((calc) => (
            <div key={calc.id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="card-title">{calc.name}</h2>
                      <span className={`badge ${getModuleColor(calc.module_type)}`}>
                        {getModuleName(calc.module_type)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-base-content/70">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(calc.created_at), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(calc)}
                      className="btn btn-primary btn-sm"
                    >
                      <Eye className="h-4 w-4" />
                      Ver
                    </button>
                    <button
                      onClick={() => handleDelete(calc.id)}
                      className="btn btn-error btn-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

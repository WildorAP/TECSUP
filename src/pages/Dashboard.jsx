import { Link } from 'react-router-dom';
import { Ruler, Calculator, TrendingUp, Waves } from 'lucide-react';

export default function Dashboard() {
  const modules = [
    {
      id: 'optimal-section',
      title: 'Sección Óptima',
      description: 'Diseño de canal trapezoidal con máxima eficiencia hidráulica',
      icon: Ruler,
      color: 'bg-orange-500',
      path: '/modulos/seccion-optima',
    },
    {
      id: 'normal-depth',
      title: 'Tirante Normal',
      description: 'Cálculo de tirante normal en canales',
      icon: Calculator,
      color: 'bg-blue-500',
      path: '#',
      disabled: true,
    },
    {
      id: 'critical-depth',
      title: 'Tirante Crítico',
      description: 'Determinación del tirante crítico',
      icon: TrendingUp,
      color: 'bg-green-500',
      path: '#',
      disabled: true,
    },
    {
      id: 'hydraulic-jump',
      title: 'Salto Hidráulico',
      description: 'Análisis de salto hidráulico',
      icon: Waves,
      color: 'bg-purple-500',
      path: '#',
      disabled: true,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Dashboard de Cálculos Hidráulicos</h1>
        <p className="text-lg text-base-content/70">
          Selecciona un módulo para comenzar tus cálculos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const Icon = module.icon;
          
          if (module.disabled) {
            return (
              <div
                key={module.id}
                className="card bg-base-200 shadow-xl opacity-50 cursor-not-allowed"
              >
                <div className="card-body">
                  <div className={`${module.color} w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="card-title">{module.title}</h2>
                  <p className="text-base-content/70">{module.description}</p>
                  <div className="badge badge-warning mt-2">Próximamente</div>
                </div>
              </div>
            );
          }

          return (
            <Link
              key={module.id}
              to={module.path}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
            >
              <div className="card-body">
                <div className={`${module.color} w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h2 className="card-title">{module.title}</h2>
                <p className="text-base-content/70">{module.description}</p>
                <div className="card-actions justify-end mt-4">
                  <button className="btn btn-primary btn-sm">
                    Abrir Módulo
                  </button>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <h3 className="font-bold">¡Bienvenido!</h3>
          <div className="text-xs">Todos tus cálculos se guardarán automáticamente en tu historial.</div>
        </div>
      </div>
    </div>
  );
}

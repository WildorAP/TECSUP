import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Ruler, Download, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import jsPDF from 'jspdf';
import { Canvg } from 'canvg';
import { saveCalculation, updateCalculation } from '../services/calculationService';
import { GRAVITY, CALCULATION_TOLERANCE, MAX_ITERATIONS } from '../utils/constants';
import {
  calculateTrapezoidalArea,
  calculateTrapezoidalPerimeter,
  calculateHydraulicRadius,
  calculateTopWidth,
  calculateFroude,
  calculateSpecificEnergy,
  getFlowType,
} from '../utils/hydraulicFormulas';

export default function SeccionOptima() {
  const location = useLocation();
  const navigate = useNavigate();
  const graficoRef = useRef(null);

  const [datos, setDatos] = useState({
    caudal: '',
    talud: '',
    rugosidad: '',
    pendiente: '',
  });

  const [resultado, setResultado] = useState(null);
  const [datosGrafico, setDatosGrafico] = useState([]);
  const [mostrarModalGuardar, setMostrarModalGuardar] = useState(false);
  const [nombreCalculo, setNombreCalculo] = useState('');
  const [calculoId, setCalculoId] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Cargar cálculo si viene desde el historial
  useEffect(() => {
    if (location.state?.calculation) {
      const calc = location.state.calculation;
      setDatos(calc.input_data);
      setResultado(calc.results);
      setNombreCalculo(calc.name);
      setCalculoId(calc.id);
      
      // Regenerar gráfico
      setTimeout(() => {
        generarGrafico(calc.input_data, calc.results);
      }, 100);
    }
  }, [location]);

  const calcularSeccionOptima = () => {
    const Q = parseFloat(datos.caudal);
    const Z = parseFloat(datos.talud);
    const n = parseFloat(datos.rugosidad);
    const S = parseFloat(datos.pendiente);

    if (isNaN(Q) || isNaN(Z) || isNaN(n) || isNaN(S) || Q <= 0 || Z < 0 || n <= 0 || S <= 0) {
      toast.error('Por favor ingrese valores válidos');
      return;
    }

    // Cálculo de sección óptima usando Newton-Raphson
    const theta = Math.atan(1 / Z);
    const relacion_b_y = 2 * Math.tan(theta / 2);

    let y = 0.1;
    let error = 1;
    let iteraciones = 0;

    while (error > CALCULATION_TOLERANCE && iteraciones < MAX_ITERATIONS) {
      const b = y * relacion_b_y;
      const A = calculateTrapezoidalArea(b, y, Z);
      const P = calculateTrapezoidalPerimeter(b, y, Z);
      const R = calculateHydraulicRadius(A, P);
      const Qcalc = (1 / n) * A * Math.pow(R, 2 / 3) * Math.sqrt(S);

      const db = relacion_b_y;
      const dA = db * y + b + 2 * Z * y;
      const dP = db + 2 * Math.sqrt(1 + Z * Z);
      const dR = (dA * P - A * dP) / (P * P);
      const dQ = (1 / n) * Math.sqrt(S) * (dA * Math.pow(R, 2 / 3) + A * (2 / 3) * Math.pow(R, -1 / 3) * dR);

      const dy = (Q - Qcalc) / dQ;
      y = y + dy;
      error = Math.abs(dy);
      iteraciones++;
    }

    if (iteraciones >= MAX_ITERATIONS) {
      toast.error('El método no convergió. Revise los datos ingresados.');
      return;
    }

    const b = y * relacion_b_y;
    const A = calculateTrapezoidalArea(b, y, Z);
    const P = calculateTrapezoidalPerimeter(b, y, Z);
    const R = calculateHydraulicRadius(A, P);
    const v = Q / A;
    const T = calculateTopWidth(b, y, Z);
    const F = calculateFroude(v, A, T);
    const E = calculateSpecificEnergy(y, v);

    const resultadoFinal = {
      tirante: y,
      anchoSolera: b,
      area: A,
      perimetroMojado: P,
      radioHidraulico: R,
      velocidad: v,
      energiaEspecifica: E,
      anchoSuperficial: T,
      numeroFroude: F,
      tipoFlujo: getFlowType(F),
      iteraciones,
      relacionBY: relacion_b_y,
    };

    setResultado(resultadoFinal);
    generarGrafico(datos, resultadoFinal);
    toast.success('Cálculo completado exitosamente');
  };

  const generarGrafico = (datosEntrada, resultadoCalculo) => {
    const y = resultadoCalculo.tirante;
    const b = resultadoCalculo.anchoSolera;
    const Z = parseFloat(datosEntrada.talud);
    const T = calculateTopWidth(b, y, Z);

    const puntos = [];
    const numPuntos = 100;

    // Lado izquierdo
    for (let i = numPuntos; i >= 0; i--) {
      const profundidad = y * (i / numPuntos);
      const x = -b / 2 - Z * profundidad;
      puntos.push({
        x: parseFloat(x.toFixed(3)),
        canal: parseFloat(profundidad.toFixed(3)),
        agua: profundidad <= y ? parseFloat(profundidad.toFixed(3)) : null,
      });
    }

    // Fondo
    puntos.push({ x: parseFloat((-b / 2).toFixed(3)), canal: 0, agua: 0 });
    puntos.push({ x: parseFloat((b / 2).toFixed(3)), canal: 0, agua: 0 });

    // Lado derecho
    for (let i = 0; i <= numPuntos; i++) {
      const profundidad = y * (i / numPuntos);
      const x = b / 2 + Z * profundidad;
      puntos.push({
        x: parseFloat(x.toFixed(3)),
        canal: parseFloat(profundidad.toFixed(3)),
        agua: profundidad <= y ? parseFloat(profundidad.toFixed(3)) : null,
      });
    }

    setDatosGrafico(puntos);
  };

  const handleGuardar = async () => {
    if (!nombreCalculo.trim()) {
      toast.error('Por favor ingrese un nombre para el cálculo');
      return;
    }

    if (!resultado) {
      toast.error('Debe realizar un cálculo antes de guardar');
      return;
    }

    setGuardando(true);

    try {
      if (calculoId) {
        await updateCalculation(calculoId, nombreCalculo, datos, resultado);
        toast.success('Cálculo actualizado exitosamente');
      } else {
        const nuevoCalculo = await saveCalculation('optimal-section', nombreCalculo, datos, resultado);
        setCalculoId(nuevoCalculo.id);
        toast.success('Cálculo guardado exitosamente');
      }
      setMostrarModalGuardar(false);
    } catch (error) {
      toast.error('Error al guardar el cálculo');
      console.error(error);
    } finally {
      setGuardando(false);
    }
  };

  const generarPDF = async () => {
    if (!resultado) {
      toast.error('Debe realizar un cálculo antes de generar el PDF');
      return;
    }

    try {
      toast.info('Generando PDF...');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPos = margin;

      // Encabezado
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('REPORTE DE SECCIÓN ÓPTIMA', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Diseño de Máxima Eficiencia Hidráulica', pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // Información del cálculo
      if (nombreCalculo) {
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Proyecto: ${nombreCalculo}`, margin, yPos);
        yPos += 8;
      }

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, margin, yPos);
      yPos += 12;

      // Datos de entrada
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DATOS DE ENTRADA', margin, yPos);
      yPos += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const datosEntrada = [
        `Caudal (Q): ${datos.caudal} m³/s`,
        `Talud (Z): ${datos.talud} (H:V)`,
        `Coeficiente de Manning (n): ${datos.rugosidad}`,
        `Pendiente (S): ${datos.pendiente} m/m`,
      ];

      datosEntrada.forEach(dato => {
        pdf.text(`• ${dato}`, margin + 5, yPos);
        yPos += 6;
      });
      yPos += 8;

      // Resultados principales
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RESULTADOS PRINCIPALES', margin, yPos);
      yPos += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const resultadosPrincipales = [
        `Tirante óptimo (y): ${resultado.tirante.toFixed(4)} m`,
        `Ancho de solera (b): ${resultado.anchoSolera.toFixed(4)} m`,
        `Relación b/y: ${resultado.relacionBY.toFixed(4)}`,
      ];

      resultadosPrincipales.forEach(res => {
        pdf.text(`• ${res}`, margin + 5, yPos);
        yPos += 6;
      });
      yPos += 8;

      // Parámetros geométricos
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PARÁMETROS GEOMÉTRICOS', margin, yPos);
      yPos += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const parametrosGeom = [
        `Área hidráulica (A): ${resultado.area.toFixed(4)} m²`,
        `Perímetro mojado (P): ${resultado.perimetroMojado.toFixed(4)} m`,
        `Radio hidráulico (R): ${resultado.radioHidraulico.toFixed(4)} m`,
        `Ancho superficial (T): ${resultado.anchoSuperficial.toFixed(4)} m`,
      ];

      parametrosGeom.forEach(param => {
        pdf.text(`• ${param}`, margin + 5, yPos);
        yPos += 6;
      });
      yPos += 8;

      // Parámetros hidráulicos
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PARÁMETROS HIDRÁULICOS', margin, yPos);
      yPos += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const parametrosHidr = [
        `Velocidad (v): ${resultado.velocidad.toFixed(4)} m/s`,
        `Energía específica (E): ${resultado.energiaEspecifica.toFixed(4)} m`,
        `Número de Froude (F): ${resultado.numeroFroude.toFixed(4)}`,
        `Tipo de flujo: ${resultado.tipoFlujo}`,
        `Iteraciones: ${resultado.iteraciones}`,
      ];

      parametrosHidr.forEach(param => {
        pdf.text(`• ${param}`, margin + 5, yPos);
        yPos += 6;
      });
      yPos += 10;

      // Capturar gráfico SVG si existe
      if (graficoRef.current && datosGrafico.length > 0) {
        try {
          // Esperar un momento para asegurar que el SVG esté completamente renderizado
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Buscar el elemento SVG dentro del contenedor
          const svgElement = graficoRef.current.querySelector('svg');
          
          if (svgElement) {
            // Clonar el SVG para no modificar el original
            const svgClone = svgElement.cloneNode(true);
            
            // Obtener dimensiones del SVG
            const svgWidth = svgElement.clientWidth || 800;
            const svgHeight = svgElement.clientHeight || 400;
            
            // Establecer atributos de tamaño en el clon
            svgClone.setAttribute('width', svgWidth);
            svgClone.setAttribute('height', svgHeight);
            
            // Serializar el SVG a string
            const svgString = new XMLSerializer().serializeToString(svgClone);
            
            // Crear un canvas para convertir SVG a imagen
            const canvas = document.createElement('canvas');
            const scale = 3; // Mayor escala para mejor calidad
            canvas.width = svgWidth * scale;
            canvas.height = svgHeight * scale;
            const ctx = canvas.getContext('2d');
            
            // Fondo blanco
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Usar canvg para renderizar SVG en canvas
            const v = await Canvg.from(ctx, svgString, {
              ignoreMouse: true,
              ignoreAnimation: true,
              scaleWidth: canvas.width,
              scaleHeight: canvas.height,
            });
            
            await v.render();
            
            // Convertir canvas a imagen
            const imgData = canvas.toDataURL('image/png', 1.0);
            
            // Calcular dimensiones para el PDF
            const imgWidth = pageWidth - 2 * margin;
            const aspectRatio = svgHeight / svgWidth;
            const imgHeight = imgWidth * aspectRatio;

            // Nueva página si no hay espacio
            if (yPos + imgHeight > pageHeight - margin) {
              pdf.addPage();
              yPos = margin;
            }

            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('SECCIÓN TRANSVERSAL', margin, yPos);
            yPos += 8;

            pdf.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight);
            yPos += imgHeight + 5;
          } else {
            throw new Error('No se encontró el elemento SVG');
          }
        } catch (error) {
          console.error('Error al capturar gráfico SVG:', error);
          // Agregar nota si falla la captura
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'italic');
          pdf.text('(El gráfico no pudo ser capturado)', margin, yPos);
        }
      }

      // Pie de página
      const totalPages = pdf.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.text(
          `Página ${i} de ${totalPages} - Generado por Sistema de Cálculos Hidráulicos`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Guardar PDF
      const nombreArchivo = nombreCalculo 
        ? `Seccion_Optima_${nombreCalculo.replace(/\s+/g, '_')}.pdf`
        : `Seccion_Optima_${new Date().getTime()}.pdf`;
      
      pdf.save(nombreArchivo);
      toast.success('PDF generado exitosamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast.error('Error al generar el PDF');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={() => navigate('/dashboard')}
        className="btn btn-ghost mb-4"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Volver al Dashboard
      </button>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-500 p-3 rounded-lg">
              <Ruler className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Sección Óptima</h1>
              <p className="text-base-content/70">Diseño de máxima eficiencia hidráulica</p>
            </div>
          </div>

          <div className="alert alert-info mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div className="text-sm">
              <strong>Sección Óptima:</strong> Diseño de canal trapezoidal con máxima eficiencia hidráulica.
              Minimiza el perímetro mojado para una misma área, reduciendo costos de construcción.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Caudal Q (m³/s)</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={datos.caudal}
                onChange={(e) => setDatos({ ...datos, caudal: e.target.value })}
                className="input input-bordered"
                placeholder="10.0"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Talud Z (H:V)</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={datos.talud}
                onChange={(e) => setDatos({ ...datos, talud: e.target.value })}
                className="input input-bordered"
                placeholder="1.5"
              />
              <label className="label">
                <span className="label-text-alt">Ejemplo: Z=1 (1:1), Z=1.5 (1.5:1)</span>
              </label>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Coeficiente de Manning n</span>
              </label>
              <input
                type="number"
                step="0.001"
                value={datos.rugosidad}
                onChange={(e) => setDatos({ ...datos, rugosidad: e.target.value })}
                className="input input-bordered"
                placeholder="0.013"
              />
              <label className="label">
                <span className="label-text-alt">Concreto: 0.013, Tierra: 0.020</span>
              </label>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Pendiente S (m/m)</span>
              </label>
              <input
                type="number"
                step="0.0001"
                value={datos.pendiente}
                onChange={(e) => setDatos({ ...datos, pendiente: e.target.value })}
                className="input input-bordered"
                placeholder="0.001"
              />
              <label className="label">
                <span className="label-text-alt">Ejemplo: 0.001 = 0.1%</span>
              </label>
            </div>
          </div>

          <button
            onClick={calcularSeccionOptima}
            className="btn btn-primary w-full mb-6"
          >
            <Ruler className="h-5 w-5 mr-2" />
            Calcular Sección Óptima
          </button>

          {resultado && (
            <>
              <div className="divider">Resultados</div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="stat bg-orange-50 rounded-lg">
                  <div className="stat-title">Tirante Óptimo y</div>
                  <div className="stat-value text-orange-600">{resultado.tirante.toFixed(4)}</div>
                  <div className="stat-desc">metros</div>
                </div>
                <div className="stat bg-blue-50 rounded-lg">
                  <div className="stat-title">Ancho de Solera b</div>
                  <div className="stat-value text-blue-600">{resultado.anchoSolera.toFixed(4)}</div>
                  <div className="stat-desc">metros</div>
                </div>
                <div className="stat bg-green-50 rounded-lg">
                  <div className="stat-title">Relación b/y</div>
                  <div className="stat-value text-green-600">{resultado.relacionBY.toFixed(4)}</div>
                  <div className="stat-desc">adimensional</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="card bg-base-200">
                  <div className="card-body">
                    <h3 className="card-title text-sm">Parámetros Geométricos</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Área hidráulica A:</span>
                        <span className="font-semibold">{resultado.area.toFixed(4)} m²</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Perímetro mojado P:</span>
                        <span className="font-semibold">{resultado.perimetroMojado.toFixed(4)} m</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Radio hidráulico R:</span>
                        <span className="font-semibold">{resultado.radioHidraulico.toFixed(4)} m</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ancho superficial T:</span>
                        <span className="font-semibold">{resultado.anchoSuperficial.toFixed(4)} m</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card bg-base-200">
                  <div className="card-body">
                    <h3 className="card-title text-sm">Parámetros Hidráulicos</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Velocidad v:</span>
                        <span className="font-semibold">{resultado.velocidad.toFixed(4)} m/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Energía específica E:</span>
                        <span className="font-semibold">{resultado.energiaEspecifica.toFixed(4)} m</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Número de Froude F:</span>
                        <span className="font-semibold">{resultado.numeroFroude.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tipo de flujo:</span>
                        <span className={`badge ${resultado.tipoFlujo === 'Subcrítico' ? 'badge-info' : resultado.tipoFlujo === 'Supercrítico' ? 'badge-warning' : 'badge-success'}`}>
                          {resultado.tipoFlujo}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {datosGrafico.length > 0 && (
                <div className="card bg-base-200 mb-6">
                  <div className="card-body">
                    <h3 className="card-title">Sección Transversal Óptima</h3>
                    <div ref={graficoRef}>
                      <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={datosGrafico} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                          <defs>
                            <linearGradient id="colorCanal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#8B7355" stopOpacity={0.9} />
                              <stop offset="100%" stopColor="#6B5345" stopOpacity={0.9} />
                            </linearGradient>
                            <linearGradient id="colorAgua" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#67E8F9" stopOpacity={0.8} />
                              <stop offset="100%" stopColor="#0891B2" stopOpacity={0.3} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="x"
                            label={{ value: 'Distancia horizontal (m)', position: 'insideBottom', offset: -5 }}
                            type="number"
                            domain={['dataMin', 'dataMax']}
                          />
                          <YAxis
                            label={{ value: 'Profundidad (m)', angle: -90, position: 'insideLeft' }}
                            domain={[0, 'auto']}
                          />
                          <Tooltip />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="canal"
                            name="Canal"
                            stroke="#8B7355"
                            fill="url(#colorCanal)"
                          />
                          <Area
                            type="monotone"
                            dataKey="agua"
                            name="Agua"
                            stroke="#0891B2"
                            fill="url(#colorAgua)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setMostrarModalGuardar(true)}
                  className="btn btn-success flex-1"
                >
                  <Save className="h-5 w-5 mr-2" />
                  {calculoId ? 'Actualizar Cálculo' : 'Guardar Cálculo'}
                </button>
                <button 
                  onClick={generarPDF}
                  className="btn btn-info flex-1"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Descargar PDF
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal para guardar */}
      {mostrarModalGuardar && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Guardar Cálculo</h3>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Nombre del Cálculo</span>
              </label>
              <input
                type="text"
                value={nombreCalculo}
                onChange={(e) => setNombreCalculo(e.target.value)}
                className="input input-bordered"
                placeholder="Ej: Canal Principal - Sector A"
              />
            </div>
            <div className="modal-action">
              <button
                onClick={() => setMostrarModalGuardar(false)}
                className="btn"
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                className={`btn btn-primary ${guardando ? 'loading' : ''}`}
                disabled={guardando}
              >
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

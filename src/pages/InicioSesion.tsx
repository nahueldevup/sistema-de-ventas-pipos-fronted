import { ShoppingBag, CheckCircle, Mail, Lock, Eye, ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom" // <-- Importamos el gancho de navegación

export default function InicioSesion() {
  // Inicializamos la función para navegar entre pantallas
  const navigate = useNavigate();

  // Esta función se ejecuta cuando el usuario envía el formulario
  const simularIngreso = (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página recargue como en el HTML viejo
    
    // Aquí en el futuro enviaremos el correo y clave a tu backend.
    // Por ahora, lo mandamos directamente a la ruta del panel:
    navigate("/panel");
  };

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Lado Izquierdo: Visual (Oculto en celulares, visible en pantallas grandes) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-brand-900 via-brand-600 to-brand-800 relative overflow-hidden flex-col justify-center items-center text-white p-12">
        <div className="relative z-10 max-w-md text-center">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg border border-white/30">
            <ShoppingBag className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight">Bienvenido a Pipos</h1>
          <p className="text-blue-100 text-lg font-medium leading-relaxed">
            Tu sistema de POS venta diseñado para potenciar tu negocio con eficiencia y control total.
          </p>
          
          <div className="mt-12 flex gap-4 justify-center">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <CheckCircle className="w-4 h-4 text-green-300" />
              <span className="text-sm font-medium">Control de Stock</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <CheckCircle className="w-4 h-4 text-green-300" />
              <span className="text-sm font-medium">Reportes en Tiempo Real</span>
            </div>
          </div>
        </div>
        
        {/* Círculos decorativos de fondo */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      </div>

      {/* Lado Derecho: Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background relative">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-2">Iniciar Sesión</h2>
            <p className="text-slate-500">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={simularIngreso} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Correo electrónico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="email" 
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-all shadow-sm" 
                  placeholder="tu@correo.com" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="password" 
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-all shadow-sm" 
                  placeholder="••••••••" 
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
                  <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <a href="#" className="text-sm font-medium text-brand-600 hover:text-brand-500">¿Olvidaste tu contraseña?</a>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              ENTRAR
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              ¿No tienes cuenta? <a href="#" className="font-bold text-brand-600 hover:text-brand-500 transition-colors">REGISTRARME</a>
            </p>
          </div>
          
          <button className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 cursor-pointer">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  )
}
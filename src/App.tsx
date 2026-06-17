import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "@/hooks/ThemeContext"
import InicioSesion from "@/pages/InicioSesion"
import PanelControlLayout from "@/layouts/PanelControlLayout"
import PanelControl from "@/pages/PanelControl"
import Productos from "@/pages/Productos"
import Vender from "@/pages/Vender"

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Login — sin sidebar ni header */}
          <Route path="/" element={<InicioSesion />} />

          {/* Rutas protegidas con layout (sidebar + header) */}
          <Route element={<PanelControlLayout />}>
            <Route path="/panel" element={<PanelControl />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/vender" element={<Vender />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
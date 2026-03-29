import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "@/hooks/ThemeContext"
import InicioSesion from "@/pages/InicioSesion"
import PanelControlLayout from "@/layouts/PanelControlLayout"
import PanelControl from "@/pages/PanelControl"
import Productos from "@/pages/Productos"

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<InicioSesion />} />
          
          <Route path="/panel" element={
            <PanelControlLayout>
              <PanelControl />
            </PanelControlLayout>
          } />

          <Route path="/productos" element={
            <PanelControlLayout>
              <Productos />
            </PanelControlLayout>
          } />

        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
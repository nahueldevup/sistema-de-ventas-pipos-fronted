import { useState } from "react"
import { Outlet } from "react-router-dom"
import { useTheme } from "@/hooks/useTheme"
import Sidebar from "./Sidebar"
export default function PanelControlLayout() {
  const { isDark } = useTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="flex h-screen w-screen overflow-hidden relative">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isExpanded={isExpanded}
        onToggleExpanded={() => setIsExpanded((prev) => !prev)}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Botón flotante para menú en mobile */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className={`
            md:hidden absolute top-4 left-4 z-10 p-2.5 rounded-xl shadow-md cursor-pointer
            ${isDark ? "bg-[#222a26] text-white" : "bg-white text-slate-800 border border-slate-200"}
          `}
          aria-label="Abrir menú"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>

        <main
          className={`flex-1 overflow-y-auto p-6 scroll-smooth hide-scrollbar ${
            isDark ? "bg-[#181f1c]" : "bg-white"
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
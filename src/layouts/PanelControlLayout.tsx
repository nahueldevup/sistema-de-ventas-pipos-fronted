import { useState, useCallback } from "react"
import { Outlet } from "react-router-dom"
import { useTheme } from "@/hooks/useTheme"
import Sidebar from "./Sidebar"
import Header from "./Header"

export default function PanelControlLayout() {
  const { isDark } = useTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)

  const handleMenuClick = useCallback(() => {
    if (window.innerWidth >= 768) {
      setIsExpanded((prev) => !prev)
    } else {
      setIsSidebarOpen(true)
    }
  }, [])

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isExpanded={isExpanded}
        onToggleExpanded={() => setIsExpanded((prev) => !prev)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={handleMenuClick} />

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
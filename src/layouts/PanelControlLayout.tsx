import { useState } from "react"
import Sidebar from "./Sidebar"
import Header from "./Header"

export default function PanelControlLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopPinned, setIsDesktopPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleMenuClick = () => {
    if (window.innerWidth >= 768) {
      setIsDesktopPinned(!isDesktopPinned);
    } else {
      setIsSidebarOpen(true);
    }
  };

  const handleMainClick = () => {
    if (window.innerWidth >= 768 && isDesktopPinned) {
      setIsDesktopPinned(false);
    }
  };

  return (
    <div className="bg-background text-foreground antialiased h-screen overflow-hidden flex transition-colors duration-300">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        isDesktopPinned={isDesktopPinned}
        isHovered={isHovered}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onToggleMenu={handleMenuClick}
      />
      
      <main 
        className="flex-1 flex flex-col h-screen overflow-hidden relative"
        onClick={handleMainClick}
      >
        <Header onMenuClick={handleMenuClick} />
        
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth hide-scrollbar">
          {children}
        </div>
      </main>
    </div>
  )
}
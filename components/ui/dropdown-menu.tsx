import React, { useState, useRef, useEffect } from "react";

// Create Context
interface DropdownContextType {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  triggerRef: React.RefObject<HTMLDivElement>;
  menuRef: React.RefObject<HTMLDivElement>;
}

const DropdownContext = React.createContext<DropdownContextType | undefined>(undefined);

// Hook to use context
function useDropdownContext() {
  const context = React.useContext(DropdownContext);
  if (context === undefined) {
    throw new Error("useDropdownContext must be used within a DropdownMenu");
  }
  return context;
}

// Dropdown Menu
export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const contextValue = { open, setOpen, triggerRef, menuRef };

  return (
    <DropdownContext.Provider value={contextValue}>
      <div className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

// Dropdown Trigger
export function DropdownMenuTrigger({ children }: { children: React.ReactNode }) {
  const { setOpen, triggerRef, open } = useDropdownContext();
  
  return (
    <div 
      ref={triggerRef}
      onClick={() => setOpen(!open)} 
      className="inline-flex cursor-pointer"
    >
      {children}
    </div>
  );
}

// Dropdown Content
export function DropdownMenuContent({ children, className = "" }: { children: React.ReactNode; className?: string; }) {
  const { open, menuRef } = useDropdownContext();

  if (!open) return null;

  return (
    <div
      ref={menuRef}
      className={`absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 ${className}`}
    >
      <div className="py-1">{children}</div>
    </div>
  );
}

// Dropdown Checkbox Item
export function DropdownMenuCheckboxItem({ children, checked = false, onCheckedChange }: { children: React.ReactNode; checked?: boolean; onCheckedChange?: (checked: boolean) => void; }) {
  const handleClick = () => {
    if (onCheckedChange) {
      onCheckedChange(!checked);
    }
  };

  return (
    <div
      className={`flex items-center px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${checked ? 'bg-gray-50 dark:bg-gray-700' : ''}`}
      onClick={handleClick}
    >
      <div className="mr-2 h-4 w-4 flex items-center justify-center">
        {checked && (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        )}
      </div>
      <span>{children}</span>
    </div>
  );
}

// Dropdown Separator
export function DropdownMenuSeparator() {
  return <div className="my-1 h-px bg-gray-200 dark:bg-gray-700"></div>;
}

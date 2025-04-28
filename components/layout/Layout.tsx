import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  backgroundClass?: string;
  backgroundStyle?: React.CSSProperties;
}

const Layout = ({ children, backgroundClass = "", backgroundStyle = {} }: LayoutProps) => {
  return (
    <div 
      className={`min-h-screen flex flex-col ${backgroundClass}`}
      style={backgroundStyle}
    >
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
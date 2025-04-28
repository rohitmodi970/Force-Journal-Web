
import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogTrigger } from "@/components/ui/dialog";
import WaitlistForm from "./WaitlistForm";
import { Sparkles } from "lucide-react";

interface CallToActionProps {
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonLink?: string;
}

const CallToAction = ({
  title,
  subtitle,
  buttonText,
  buttonLink = "#",
}: CallToActionProps) => {
  return (
    <div className="relative overflow-hidden backdrop-blur-xl bg-white/30 dark:bg-black/20 border border-purple-100 dark:border-purple-900/30 rounded-3xl p-12 md:p-16 shadow-2xl">
      <div className="relative z-10">
        <h3 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent animate-fade-in flex items-center justify-center gap-3">
          <Sparkles className="w-6 h-6 text-purple-500" />
          {title}
          <Sparkles className="w-6 h-6 text-indigo-500" />
        </h3>
        
        {subtitle && (
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 animate-fade-in max-w-2xl mx-auto text-center">
            {subtitle}
          </p>
        )}
        
        <div className="animate-fade-in text-center">
          <Dialog>
            <DialogTrigger asChild>
              <button
                className="inline-flex items-center gap-2 px-10 py-5 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 animate-pulse-soft"
                aria-label={buttonText}
              >
                {buttonText}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </DialogTrigger>
            <DialogPortal>
              <DialogOverlay className="bg-black/60 backdrop-blur-sm animate-fade-in" />
              <DialogContent className="sm:max-w-md md:max-w-lg bg-transparent border-none shadow-none p-0">
                <WaitlistForm />
              </DialogContent>
            </DialogPortal>
          </Dialog>
        </div>
      </div>
      
      {/* Enhanced background effects */}
      <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-gradient-to-br from-purple-300 to-indigo-300 dark:from-purple-700 dark:to-indigo-800 rounded-full opacity-50 blur-3xl"></div>
      <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-indigo-300 to-purple-300 dark:from-indigo-700 dark:to-purple-800 rounded-full opacity-50 blur-3xl"></div>
      
      {/* Add animated particles */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-2 h-2 rounded-full bg-purple-400 animate-float opacity-70"></div>
        <div className="absolute bottom-1/3 left-1/4 w-3 h-3 rounded-full bg-indigo-400 animate-float opacity-70" style={{animationDelay: "1.5s"}}></div>
        <div className="absolute top-2/3 right-1/3 w-2 h-2 rounded-full bg-blue-400 animate-float opacity-70" style={{animationDelay: "2.2s"}}></div>
        <div className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-purple-300 animate-float opacity-70" style={{animationDelay: "0.7s"}}></div>
        <div className="absolute bottom-1/4 right-1/2 w-3 h-3 rounded-full bg-indigo-300 animate-float opacity-70" style={{animationDelay: "1.2s"}}></div>
      </div>
    </div>
  );
};

export default CallToAction;

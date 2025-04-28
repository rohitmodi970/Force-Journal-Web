"use client"
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";

const waitlistSchema = z.object({
  email: z.string().email("Enter a valid email."),
});

type WaitlistFormValues = z.infer<typeof waitlistSchema>;

export default function WaitlistForm() {
  const { register, handleSubmit, reset, formState } = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistSchema),
  });
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = (data: WaitlistFormValues) => {
    setLoading(true);
    setTimeout(() => {
      toast({
        title: "You're on the waitlist!",
        description: "We'll reach out as soon as access is available.",
        variant: "default",
      });
      reset();
      setLoading(false);
    }, 1200);
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-lg mx-auto animate-fade-in glass-morphism px-10 py-12 rounded-2xl shadow-2xl border border-white/30 relative mb-2"
      style={{
        background: "linear-gradient(135deg, rgba(155,135,245,0.18) 0%, rgba(255,255,255,0.15) 100%)",
        boxShadow: "0 8px 60px 0 rgba(155,135,245,0.19)",
      }}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-12 -right-12 w-36 h-36 opacity-80">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path fill="#9B87F5" d="M41.3,-68.5C54.4,-61.9,66.6,-52.7,75.4,-40.3C84.1,-27.8,89.4,-12.1,87.8,2.8C86.3,17.7,78,31.7,68.2,44.2C58.4,56.7,47.2,67.8,34,74.5C20.8,81.3,5.5,83.8,-8.9,81.5C-23.2,79.3,-36.7,72.3,-47.9,62.8C-59.2,53.3,-68.3,41.3,-73.2,27.8C-78.1,14.3,-78.8,-0.6,-75.2,-14.4C-71.7,-28.2,-63.9,-40.8,-53.1,-48.8C-42.2,-56.8,-28.2,-60.2,-15,-65.4C-1.9,-70.5,10.3,-77.4,22.9,-77.1C35.5,-76.7,48.4,-69.1,61.2,-61.5Z" />
          </svg>
        </div>
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-indigo-200/30 dark:bg-indigo-700/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 -left-6 transform -translate-y-1/2">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-40">
            <path d="M30 0L36.5 23.5L60 30L36.5 36.5L30 60L23.5 36.5L0 30L23.5 23.5L30 0Z" fill="url(#paint0_linear)" />
            <defs>
              <linearGradient id="paint0_linear" x1="0" y1="0" x2="60" y2="60" gradientUnits="userSpaceOnUse">
                <stop stopColor="#9B87F5" />
                <stop offset="1" stopColor="#6366F1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="absolute -top-4 right-12 transform">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-40">
            <circle cx="20" cy="20" r="20" fill="url(#paint1_linear)" />
            <defs>
              <linearGradient id="paint1_linear" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#9B87F5" />
                <stop offset="1" stopColor="#6366F1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      
      <div className="relative">
        <h3 className="flex items-center justify-center gap-2 text-2xl font-bold mb-5 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Join the Force Waitlist
          <Sparkles className="h-5 w-5 text-indigo-500" />
        </h3>
        
        <div className="relative mb-6">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Your best email"
            {...register("email")}
            aria-invalid={!!formState.errors.email}
            className="mb-1 bg-white/70 dark:bg-black/20 border-gray-300 dark:border-gray-700 focus:border-primary/70 shadow-none transition-all placeholder-gray-400 text-lg pl-4 pr-4 py-6 rounded-xl"
            disabled={loading}
          />
          {formState.errors.email && (
            <div className="text-red-500 text-xs mt-1 animate-fade-in pl-1">
              {formState.errors.email.message}
            </div>
          )}
        </div>
        
        <div className="transition-transform hover:scale-105">
          <Button
            type="submit"
            disabled={loading}
            className="w-full text-lg py-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 shadow-lg hover:shadow-2xl hover:-translate-y-[2px] transition-all duration-300 rounded-xl font-medium"
          >
            {loading ? (
              <span className="inline-flex gap-2 items-center">
                <span className="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Joining...
              </span>
            ) : (
              "Join Waitlist"
            )}
          </Button>
        </div>
        
        <div className="pt-5 text-center text-base text-gray-500 dark:text-gray-400 animate-fade-in">
          Private beta launches <strong className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">May 2025</strong>. Global rollout in Q3 2025.
        </div>
      </div>
    </form>
  );
}

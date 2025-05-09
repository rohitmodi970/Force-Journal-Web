
import { redirect } from 'next/navigation';

export default function About() {
  // This is a server component, so we'll use a Next.js redirect
  redirect('https://force-en.vercel.app/about');
  
  // The following will never be reached due to the redirect above
  return null;
}

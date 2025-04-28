import { useEffect } from 'react';
import { redirect } from 'next/navigation';

export default function About() {
  // This is a server component, so we'll use a Next.js redirect
  redirect('https://force-about-page.vercel.app/');
  
  // The following will never be reached due to the redirect above
  return null;
}

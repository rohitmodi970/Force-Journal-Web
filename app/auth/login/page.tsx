"use client"    
import LoginForm from '@/components/LoginForm';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
const Login: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const redirectToDashboard = () => {
    if (session) {
      router.push('/');
    }
  };
  redirectToDashboard();

  return (
    <>
      <LoginForm/>
    </>
  );
};

export default Login;
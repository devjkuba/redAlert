import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { queryClient } from '@/lib/queryClient';

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem('token'); 
    queryClient.clear();
    router.replace('/login');         
  }, [router]);

  return null;
}
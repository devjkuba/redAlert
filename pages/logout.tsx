import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { queryClient } from '@/lib/queryClient';

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    const doLogout = async () => {
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      queryClient.clear();
      router.replace("/login");
    };

    doLogout();    
  }, [router]);

  return null;
}
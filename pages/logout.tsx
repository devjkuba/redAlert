import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { queryClient } from '@/lib/queryClient';
import { idbDelete } from '@/lib/indexeddb';

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    const doLogout = async () => {
      await idbDelete("token");
      queryClient.clear();
      router.replace("/login");
    };

    doLogout();    
  }, [router]);

  return null;
}
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import '@/lib/i18n';
import useAuthToken from '@/hooks/useAuthToken';

const Home = () => {
  const router = useRouter();
  const token = useAuthToken();

  useEffect(() => {
    if (token) {
      router.push('/alert');
    } else {
      router.push('/login');
    }
  }, [router, token]);

  return null;
};

export default Home;
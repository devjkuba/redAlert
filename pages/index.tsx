import { useEffect } from 'react';
import { useRouter } from 'next/router';
import '@/lib/i18n';

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/alert');
    } else {
      router.push('/login');
    }
  }, [router]);

  return null;
};

export default Home;
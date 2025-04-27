const useAuthToken = () => {
    if (typeof window === 'undefined') {
        return null; 
      }

    const token = localStorage?.getItem('token');
    return token ?? null;
  };

export default useAuthToken;

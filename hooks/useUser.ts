import { useQuery } from '@tanstack/react-query'

export type User = {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
  organizationId: number
}

const fetchUser = async (): Promise<User | null> => {
  const token = localStorage.getItem('token')
  if (!token) return null

  const res = await fetch(`${process.env.NEXT_PUBLIC_API}api/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (res.status === 401) {
    window.location.href = '/login';
  }

  if (!res.ok) throw new Error('Failed to fetch user data')
  return res.json()
}

export const useUser = () =>
  useQuery<User | null>({
    queryKey: ['user'],
    queryFn: fetchUser,
    enabled: typeof window !== 'undefined', // jen client-side
    staleTime: 1000 * 60 * 60, // cache na 1 hour
    retry: false,
  })
export default useUser;
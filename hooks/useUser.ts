import Cookies from 'js-cookie'
import { useQuery } from '@tanstack/react-query'

export type Organization = {
  id: number
  name: string
  country: string
  city: string
  street: string
  postalCode: string
  subscriptionPaid: boolean
  subscriptionValidUntil: Date | null
  gpsLat: number
  gpsLng: number
  watching: Organization[]
  hasMonitoring: boolean
  monitoringCount: number
  activeUntil: Date | null
}

export type User = {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
  emailNotificationsEnabled: boolean
  organizationId: number
  organization: Organization
  isDevice: false
}

export type Device = {
  id: number
  name: string
  phoneNumber: string
  organizationId: number
  organization: Organization
  isDevice: true
}

export type UserOrDevice = User | Device

const fetchUser = async (): Promise<UserOrDevice | null> => {
  const token = Cookies.get('token')
  if (!token) return null

  const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/user`, {
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
  useQuery<UserOrDevice | null>({
    queryKey: ['user'],
    queryFn: fetchUser,
    enabled: typeof window !== 'undefined',
    staleTime: 1000 * 60 * 60,
    retry: true,
  })
export default useUser;
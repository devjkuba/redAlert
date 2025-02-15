'use client'

import Link from 'next/link'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import { toast, Toaster } from 'sonner'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'

const formSchema = z.object({
  email: z.string().email({ message: 'Neplatná e-mailová adresa' }),
  password: z
    .string()
    .min(6, { message: 'Heslo musí mít alespoň 6 znaků' })
    .regex(/[a-zA-Z0-9]/, { message: 'Heslo musí být alfanumerické' }),
})

export default function LoginPreview() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const router = useRouter()

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const res = await fetch('http://localhost:4000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const data = await res.json()
      if (res.ok) {
        toast.success('Přihlášení úspěšné!')
        localStorage.setItem('token', data.token)
        router.push('/alert')
      } else if (res.status === 401) {
        toast.error('Neplatné přihlašovací údaje. Zkuste to znovu.')
      } else {
        toast.error(data.message || 'Přihlášení se nezdařilo.')
      }
    } catch (error) {
      console.error('Form submission error', error)
      toast.error('Chyba při odesílání formuláře. Zkuste to znovu.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <div className="flex justify-center mb-4">
              <img
                src="../logo.png"
                alt="Logo"
                className="h-20"
              />
            </div>
          <CardTitle className="text-2xl">Přihlášení</CardTitle>
          <CardDescription>
          Zadejte svůj e-mail a&nbsp;heslo pro přihlášení k&nbsp;vašemu účtu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <FormControl>
                        <Input
                          id="email"
                          placeholder="jannovak@email.cz"
                          type="email"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <div className="flex justify-between items-center">
                        <FormLabel htmlFor="password">Heslo</FormLabel>
                        <Link
                          href="#"
                          className="ml-auto inline-block text-sm underline"
                        >
                          Zapomněli jste heslo?
                        </Link>
                      </div>
                      <FormControl>
                        <PasswordInput
                          id="password"
                          placeholder="******"
                          autoComplete="current-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </div>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Nemáte účet? Ozvěte se správci Vaší organizace, pokud není registrována.{' '}
            <Link href="/register" className="underline">
              Zaregistrujte vaši organizaci
            </Link>
          </div>
          <Toaster position='bottom-center' />
        </CardContent>
      </Card>
    </div>
  )
}

// pages/users/edit/[id].tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useAuthToken from '@/hooks/useAuthToken';

export default function EditUser() {
  const router = useRouter();
  const { id } = router.query;
  const token = useAuthToken();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (id) {
      fetch(`/api/users/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setFirstName(data.firstName);
          setLastName(data.lastName);
        });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ firstName, lastName, password }),
    });

    router.push('/users');
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Editace uživatele</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Jméno"
        />
        <Input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Příjmení"
        />
        <Input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nové heslo (nepovinné)"
          type="password"
        />
        <Button type="submit">Uložit</Button>
      </form>
    </div>
  );
}

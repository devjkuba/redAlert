import { useEffect, useState } from 'react';

interface Organization {
  id: string; 
  name: string;
}

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gdprConsent, setGdprConsent] = useState(true);
  const [dataProtectionConsent, setDataProtectionConsent] = useState(true);
  const [termsConsent, setTermsConsent] = useState(true);
  const [message, setMessage] = useState('');
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!gdprConsent || !dataProtectionConsent || !termsConsent) {
      setMessage('Musíte potvrdit všechny souhlasy.');
      return;
    }

    const res = await fetch('http://localhost:4000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ firstName, lastName, organization, email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage('Registrace úspěšná!');
    } else {
      setMessage(data.message);
    }
  };

  useEffect(() => {
    const fetchOrganizations = async () => {
      const res = await fetch('http://localhost:4000/api/organizations');
      const data = await res.json();
      setOrganizations(data);
    };

    fetchOrganizations();
  }, []);

  return (
    <main className="flex flex-col items-center flex-grow p-4 pt-16 pb-16 overflow-auto">
      <div className="flex flex-col items-center w-full max-w-md"> 
      <h1 className="text-2xl font-bold mb-6">Registrace</h1>
      <form onSubmit={handleRegister} className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <input
          type="text"
          placeholder="Jméno"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          className="border border-gray-300 rounded-lg p-2 mb-4 w-full"
        />
        <input
          type="text"
          placeholder="Příjmení"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          className="border border-gray-300 rounded-lg p-2 mb-4 w-full"
        />
        <select
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          required
          className="border border-gray-300 rounded-lg p-2 mb-4 w-full"
        >
          <option value="">Vyber organizaci</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.name}>
              {org.name}
            </option>
          ))}
        </select>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border border-gray-300 rounded-lg p-2 mb-4 w-full"
        />
        <input
          type="password"
          placeholder="Heslo"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border border-gray-300 rounded-lg p-2 mb-4 w-full"
        />

        {/* GDPR Consent Checkbox */}
        <div className="flex items-start mb-4">
          <input
            type="checkbox"
            checked={gdprConsent}
            onChange={(e) => setGdprConsent(e.target.checked)}
            className="mr-2"
          />
          <label className="text-sm text-gray-600">
            Souhlasím se zpracováním osobních údajů v souladu s <a href="/gdpr-policy" className="text-gray-800 underline">GDPR</a>.
          </label>
        </div>
        
        {/* Data Protection Consent Checkbox */}
        <div className="flex items-start mb-4">
          <input
            type="checkbox"
            checked={dataProtectionConsent}
            onChange={(e) => setDataProtectionConsent(e.target.checked)}
            className="mr-2"
          />
          <label className="text-sm text-gray-600">
            Potvrzuji, že jsem si přečetl/a <a href="/data-protection" className="text-gray-800 underline">Ochranu osobních údajů</a>.
          </label>
        </div>
        
        {/* Terms Consent Checkbox */}
        <div className="flex items-start mb-4">
          <input
            type="checkbox"
            checked={termsConsent}
            onChange={(e) => setTermsConsent(e.target.checked)}
            className="mr-2"
          />
          <label className="text-sm text-gray-600">
            Souhlasím s <a href="/terms" className="text-gray-800 underline">podmínkami používání</a>.
          </label>
        </div>

        <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-500 transition-all duration-300 transform hover:scale-105 active:scale-95">
          Registrovat se
        </button>
      </form>
      {message && <p className="mt-4 text-red-500">{message}</p>}
      </div>
    </main>
  );
};

export default Register;

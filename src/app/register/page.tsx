import { headers } from 'next/headers';
import RegisterForm from './RegisterForm';

async function getSubdomainData(subdomain: string) {
  const backend = process.env.NEXT_PUBLIC_BACKEND || 'not set';
  const res = await fetch(`${backend}/subdomain/${subdomain}`, {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch subdomain data');
  }
  
  return res.json();
}

export default async function RegisterPage() {
  const headersList = await headers();
  const subdomain = headersList.get('x-subdomain') || 'unknown';
  const tenantData = await getSubdomainData(subdomain);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <RegisterForm subdomain={subdomain} tenantData={tenantData} />
    </div>
  );
} 
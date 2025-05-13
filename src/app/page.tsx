import TenantLogin from './TenantLogin';
import Competitions from './components/Competitions';

export default async function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <TenantLogin />
        <Competitions />
      </div>
    </main>
  );
}

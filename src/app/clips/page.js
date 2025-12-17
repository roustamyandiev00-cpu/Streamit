import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../lib/auth';
import { redirect } from 'next/navigation';
import ClipManager from '../../components/ClipManager';
import AnimatedContainer from '../../components/AnimatedContainer';

export default async function ClipsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <AnimatedContainer className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <ClipManager />
      </div>
    </AnimatedContainer>
  );
}


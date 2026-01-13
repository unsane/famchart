import { useApp } from '@/context/AppContext';
import { FamilySelector } from '@/components/FamilySelector';
import { Dashboard } from '@/components/Dashboard';

const Index = () => {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <FamilySelector />;
  }

  return <Dashboard />;
};

export default Index;

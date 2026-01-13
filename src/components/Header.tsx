import { motion } from 'framer-motion';
import { LogOut, Settings, Gift } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { familyMembers } from '@/data/familyMembers';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import famLogo from '@/assets/fam-logo.jpg';

export const Header = () => {
  const { currentUser, setCurrentUser } = useApp();
  const member = familyMembers.find(m => m.id === currentUser);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card shadow-card sticky top-0 z-50 border-b border-border"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={famLogo} alt="FamChart Logo" className="w-10 h-10 rounded-lg object-cover" />
            <h1 className="text-2xl font-display font-bold text-gradient-hero">
              FamChart
            </h1>
          </Link>

          <div className="flex items-center gap-3">
            {member && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-xl">
                <span className="text-xl">{member.emoji}</span>
                <span className="font-semibold hidden sm:inline">{member.name}</span>
              </div>
            )}

            <Link to="/rewards">
              <Button variant="gold" size="sm" className="gap-2">
                <Gift className="w-4 h-4" />
                <span className="hidden sm:inline">Rewards</span>
              </Button>
            </Link>

            <Link to="/admin">
              <Button variant="ghost" size="icon" title="Admin Settings">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>

            {currentUser && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentUser(null)}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Switch</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

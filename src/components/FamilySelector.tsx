import { motion } from 'framer-motion';
import { FamilyMember } from '@/types';
import { familyMembers } from '@/data/familyMembers';
import { useApp } from '@/context/AppContext';
import { getPointsForMember } from '@/lib/storage';
import famLogo from '@/assets/fam-logo.jpg';

export const FamilySelector = () => {
  const { setCurrentUser, completedTasks } = useApp();

  const handleSelect = (member: FamilyMember) => {
    setCurrentUser(member);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-muted to-background">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <img 
          src={famLogo} 
          alt="FamChart Logo" 
          className="w-32 h-32 mx-auto mb-6 rounded-2xl shadow-lg object-cover"
        />
        <h1 className="text-5xl md:text-6xl font-display font-bold text-gradient-hero mb-4">
          FamChart ✨
        </h1>
        <p className="text-xl text-muted-foreground font-medium">
          Who's ready for adventure today?
        </p>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 max-w-3xl px-2">
        {familyMembers.map((member, index) => {
          const totalPoints = getPointsForMember(completedTasks, member.id, 'all');
          
          return (
            <motion.button
              key={member.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelect(member.id)}
              className="group relative bg-card rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-card hover:shadow-lg transition-all duration-300 w-full sm:w-48 border-2 border-transparent hover:border-primary/30 overflow-hidden"
            >
              {/* Hover glow effect - positioned behind content */}
              <div 
                className="absolute inset-0 rounded-3xl bg-gradient-hero opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
                aria-hidden="true"
              />
              
              {/* Content - always on top */}
              <div className="relative z-10">
                <div className="text-5xl sm:text-7xl mb-2 sm:mb-4 group-hover:animate-wiggle">
                  {member.emoji}
                </div>
                <h2 className="text-lg sm:text-2xl font-display font-bold text-foreground mb-1 sm:mb-2">
                  {member.name}
                </h2>
                <div className="flex items-center justify-center gap-1 text-points-gold font-bold">
                  <span className="text-lg">⭐</span>
                  <span>{totalPoints} pts</span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <motion.a
        href="/admin"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
      >
        <span>⚙️</span>
        <span>Admin Settings</span>
      </motion.a>
    </div>
  );
};

import { FamilyMemberData } from '@/types';

export const familyMembers: FamilyMemberData[] = [
  {
    id: 'mom',
    name: 'Mom',
    emoji: '👩',
    color: 'primary',
  },
  {
    id: 'dad',
    name: 'Dad',
    emoji: '👨‍🦰',
    color: 'secondary',
  },
  {
    id: 'son',
    name: 'Vincent',
    emoji: '🧒',
    color: 'accent',
  },
];

export const categoryInfo = {
  chores: { label: 'Chores', emoji: '🧹', color: 'bg-lavender' },
  homework: { label: 'Homework', emoji: '📚', color: 'bg-sky' },
  educational: { label: 'Learning', emoji: '🎓', color: 'bg-success' },
  dates: { label: 'Events', emoji: '📅', color: 'bg-peach' },
};

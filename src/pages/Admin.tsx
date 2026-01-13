import { AdminLayout } from '@/components/admin/AdminLayout';
import { TaskManager } from '@/components/admin/TaskManager';
import { RewardsManager } from '@/components/admin/RewardsManager';
import { Leaderboard } from '@/components/admin/Leaderboard';
import { VincentManager } from '@/components/admin/VincentManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Admin = () => {
  return (
    <AdminLayout>
      <Tabs defaultValue="tasks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1 gap-1">
          <TabsTrigger value="tasks" className="py-2 sm:py-3 font-display text-sm sm:text-base">
            📋 <span className="hidden xs:inline">Tasks</span><span className="xs:hidden">Tasks</span>
          </TabsTrigger>
          <TabsTrigger value="rewards" className="py-2 sm:py-3 font-display text-sm sm:text-base">
            🎁 <span className="hidden xs:inline">Rewards</span><span className="xs:hidden">Rewards</span>
          </TabsTrigger>
          <TabsTrigger value="vincent" className="py-2 sm:py-3 font-display text-sm sm:text-base">
            🧒 <span className="hidden xs:inline">Vincent</span><span className="xs:hidden">Vincent</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="py-2 sm:py-3 font-display text-sm sm:text-base">
            🏆 <span className="hidden xs:inline">Stats</span><span className="xs:hidden">Stats</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <TaskManager />
        </TabsContent>

        <TabsContent value="rewards">
          <RewardsManager />
        </TabsContent>

        <TabsContent value="vincent">
          <VincentManager />
        </TabsContent>

        <TabsContent value="stats">
          <Leaderboard />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default Admin;

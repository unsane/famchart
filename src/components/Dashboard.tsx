import { PointsDisplay } from './PointsDisplay';
import { CalendarView } from './CalendarView';
import { Header } from './Header';

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <PointsDisplay />
          <CalendarView />
        </div>
      </main>
    </div>
  );
};

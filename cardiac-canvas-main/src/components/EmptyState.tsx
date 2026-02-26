import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileUp, BarChart2 } from 'lucide-react';

export function EmptyState() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <BarChart2 className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">No Data Loaded</h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        Upload a heart disease CSV file to start exploring the dashboard and visualizations.
      </p>
      <Button onClick={() => navigate('/')} className="gap-2">
        <FileUp className="h-4 w-4" />
        Upload CSV File
      </Button>
    </div>
  );
}

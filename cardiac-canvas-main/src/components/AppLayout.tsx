import { ReactNode, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { FileUp, FileText } from 'lucide-react';
import { parseCSV } from '@/lib/csvParser';
import { toast } from 'sonner';

export function AppLayout({ children }: { children: ReactNode }) {
  const { data, setData } = useData();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = parseCSV(ev.target?.result as string, file.name);
        setData(parsed);
        toast.success(`Loaded ${parsed.rows.length} patients from ${file.name}`);
        navigate('/overview');
      } catch (err) {
        toast.error('Failed to parse CSV. Please check the file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-14 flex items-center gap-3 border-b border-border bg-card px-4 shrink-0">
            <SidebarTrigger />
            <div className="w-px h-6 bg-border" />
            <div className="flex items-center gap-2 flex-1">
              {data ? (
                <>
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                    {data.filename}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    · {data.rows.length} patients
                  </span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">No data loaded</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <FileUp className="h-3.5 w-3.5" />
                {data ? 'Load New File' : 'Upload CSV'}
              </Button>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

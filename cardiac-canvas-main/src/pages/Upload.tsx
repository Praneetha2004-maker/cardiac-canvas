import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { parseCSV } from '@/lib/csvParser';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, HeartPulse, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function UploadPage() {
  const { setData } = useData();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file.');
      return;
    }
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = parseCSV(ev.target?.result as string, file.name);
        setData(parsed);
        toast.success(`Loaded ${parsed.rows.length} patients from ${file.name}`);
        navigate('/overview');
      } catch (err) {
        toast.error('Failed to parse CSV. Please check the file format.');
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  }, [setData, navigate]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <HeartPulse className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">CardioInsight</h1>
          <p className="text-sm text-muted-foreground">Heart Disease Analysis Dashboard</p>
        </div>
      </div>

      {/* Upload Zone */}
      <Card className="w-full max-w-lg border-2 border-dashed transition-colors duration-200"
        style={{ borderColor: isDragging ? 'hsl(var(--primary))' : undefined }}>
        <CardContent
          className={cn(
            'p-12 flex flex-col items-center text-center cursor-pointer transition-colors duration-200',
            isDragging && 'bg-primary/5'
          )}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className={cn(
            'flex h-16 w-16 items-center justify-center rounded-full mb-4 transition-colors',
            isDragging ? 'bg-primary/10' : 'bg-muted'
          )}>
            <Upload className={cn('h-8 w-8 transition-colors', isDragging ? 'text-primary' : 'text-muted-foreground')} />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            {isLoading ? 'Processing...' : 'Upload Heart Disease CSV'}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Drag & drop your CSV file here, or click to browse
          </p>
          <Button
            className="gap-2"
            disabled={isLoading}
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
          >
            <FileText className="h-4 w-4" />
            Select CSV File
          </Button>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
        </CardContent>
      </Card>

      {/* Expected columns */}
      <div className="mt-8 w-full max-w-lg">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Expected columns (Cleveland Heart Disease format)
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { col: 'age', desc: 'Patient age (years)' },
            { col: 'sex', desc: 'Gender (0=Female, 1=Male)' },
            { col: 'cp', desc: 'Chest pain type (0–3)' },
            { col: 'trestbps', desc: 'Resting blood pressure' },
            { col: 'chol', desc: 'Serum cholesterol (mg/dl)' },
            { col: 'fbs', desc: 'Fasting blood sugar >120' },
            { col: 'thalach', desc: 'Max heart rate achieved' },
            { col: 'exang', desc: 'Exercise-induced angina' },
            { col: 'oldpeak', desc: 'ST depression' },
            { col: 'target', desc: 'Heart disease (0=No, 1=Yes)' },
          ].map(({ col, desc }) => (
            <div key={col} className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 text-clinical-teal shrink-0" />
              <span><code className="font-mono text-foreground">{col}</code> — {desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

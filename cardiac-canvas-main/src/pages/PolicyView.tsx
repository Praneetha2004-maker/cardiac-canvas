import { useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { detectColumns } from '@/lib/csvParser';
import { EmptyState } from '@/components/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';

export default function PolicyView() {
  const { data } = useData();
  const cols = useMemo(() => data ? detectColumns(data.columns) : null, [data]);

  // Exercise angina vs disease prevalence
  const anginaData = useMemo(() => {
    if (!data || !cols?.exerciseAngina || !cols?.target) return [];
    const groups = { 'With Angina': { disease: 0, healthy: 0 }, 'No Angina': { disease: 0, healthy: 0 } };
    data.rows.forEach(r => {
      const g = Number(r[cols.exerciseAngina!]) === 1 ? 'With Angina' : 'No Angina';
      if (Number(r[cols.target!]) === 1) groups[g].disease++;
      else groups[g].healthy++;
    });
    return Object.entries(groups).map(([name, v]) => ({ name, ...v }));
  }, [data, cols]);

  // Resting BP distribution by disease
  const bpData = useMemo(() => {
    if (!data || !cols?.restingBP || !cols?.target) return [];
    const buckets: Record<string, { disease: number; healthy: number }> = {
      '<110': { disease: 0, healthy: 0 },
      '110–129': { disease: 0, healthy: 0 },
      '130–139': { disease: 0, healthy: 0 },
      '140–159': { disease: 0, healthy: 0 },
      '160+': { disease: 0, healthy: 0 },
    };
    data.rows.forEach(r => {
      const bp = Number(r[cols.restingBP!]);
      const key =
        bp < 110 ? '<110' :
        bp < 130 ? '110–129' :
        bp < 140 ? '130–139' :
        bp < 160 ? '140–159' : '160+';
      const d = Number(r[cols.target!]) === 1 ? 'disease' : 'healthy';
      buckets[key][d]++;
    });
    return Object.entries(buckets).map(([name, v]) => ({ name, ...v }));
  }, [data, cols]);

  // Cholesterol buckets
  const cholData = useMemo(() => {
    if (!data || !cols?.cholesterol || !cols?.target) return [];
    const buckets: Record<string, { disease: number; healthy: number }> = {
      'Normal (<200)': { disease: 0, healthy: 0 },
      'Borderline (200–239)': { disease: 0, healthy: 0 },
      'High (240+)': { disease: 0, healthy: 0 },
    };
    data.rows.forEach(r => {
      const chol = Number(r[cols.cholesterol!]);
      const key = chol < 200 ? 'Normal (<200)' : chol < 240 ? 'Borderline (200–239)' : 'High (240+)';
      const d = Number(r[cols.target!]) === 1 ? 'disease' : 'healthy';
      buckets[key][d]++;
    });
    return Object.entries(buckets).map(([name, v]) => ({ name, ...v }));
  }, [data, cols]);

  // Fasting blood sugar
  const fbsData = useMemo(() => {
    if (!data || !cols?.fastingBS || !cols?.target) return [];
    const groups = {
      'FBS > 120 mg/dl': { disease: 0, healthy: 0 },
      'FBS ≤ 120 mg/dl': { disease: 0, healthy: 0 },
    };
    data.rows.forEach(r => {
      const g = Number(r[cols.fastingBS!]) === 1 ? 'FBS > 120 mg/dl' : 'FBS ≤ 120 mg/dl';
      if (Number(r[cols.target!]) === 1) groups[g].disease++;
      else groups[g].healthy++;
    });
    return Object.entries(groups).map(([name, v]) => ({ name, ...v }));
  }, [data, cols]);

  // ST Slope
  const slopeLabels: Record<number, string> = { 0: 'Upsloping', 1: 'Flat', 2: 'Downsloping' };
  const slopeData = useMemo(() => {
    if (!data || !cols?.stSlope || !cols?.target) return [];
    const counts: Record<string, { disease: number; healthy: number }> = {};
    data.rows.forEach(r => {
      const s = Number(r[cols.stSlope!]);
      const label = slopeLabels[s] ?? `Slope ${s}`;
      if (!counts[label]) counts[label] = { disease: 0, healthy: 0 };
      if (Number(r[cols.target!]) === 1) counts[label].disease++;
      else counts[label].healthy++;
    });
    return Object.entries(counts).map(([name, v]) => ({ name, ...v }));
  }, [data, cols]);

  if (!data || !cols) return <EmptyState />;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Policy View</h1>
        <p className="text-sm text-muted-foreground mt-1">Population-level trends — Ramesh's perspective</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Exercise Angina vs. Disease Prevalence">
          <BarChart data={anginaData} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="disease" name="Heart Disease" fill="hsl(var(--destructive))" radius={[4,4,0,0]} />
            <Bar dataKey="healthy" name="No Disease" fill="hsl(var(--clinical-healthy))" radius={[4,4,0,0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Fasting Blood Sugar Impact">
          <BarChart data={fbsData} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="disease" name="Heart Disease" fill="hsl(var(--destructive))" radius={[4,4,0,0]} />
            <Bar dataKey="healthy" name="No Disease" fill="hsl(var(--clinical-healthy))" radius={[4,4,0,0]} />
          </BarChart>
        </ChartCard>
      </div>

      <ChartCard title="Resting Blood Pressure Distribution by Disease Status" height={260}>
        <BarChart data={bpData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="disease" name="Heart Disease" fill="hsl(var(--destructive))" radius={[4,4,0,0]} />
          <Bar dataKey="healthy" name="No Disease" fill="hsl(var(--clinical-healthy))" radius={[4,4,0,0]} />
        </BarChart>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Cholesterol Levels vs. Disease Rate">
          <BarChart data={cholData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={130} />
            <Tooltip />
            <Legend />
            <Bar dataKey="disease" name="Disease" fill="hsl(var(--destructive))" radius={[0,4,4,0]} />
            <Bar dataKey="healthy" name="Healthy" fill="hsl(var(--clinical-healthy))" radius={[0,4,4,0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="ST Slope (Activity Proxy) vs. Disease">
          <BarChart data={slopeData} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="disease" name="Disease" fill="hsl(var(--destructive))" radius={[4,4,0,0]} />
            <Bar dataKey="healthy" name="Healthy" fill="hsl(var(--clinical-healthy))" radius={[4,4,0,0]} />
          </BarChart>
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, children, height = 240 }: { title: string; children: React.ReactElement; height?: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          {children}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

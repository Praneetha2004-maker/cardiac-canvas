import { useMemo, useState } from 'react';
import { useData } from '@/context/DataContext';
import { detectColumns } from '@/lib/csvParser';
import { EmptyState } from '@/components/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend, Cell
} from 'recharts';

const CHEST_PAIN_LABELS: Record<number, string> = {
  0: 'Typical Angina', 1: 'Atypical Angina', 2: 'Non-Anginal', 3: 'Asymptomatic',
};

export default function ClinicalView() {
  const { data } = useData();
  const cols = useMemo(() => data ? detectColumns(data.columns) : null, [data]);

  const ageRange = useMemo(() => {
    if (!data || !cols?.age) return [20, 80];
    const ages = data.rows.map(r => Number(r[cols.age!])).filter(a => !isNaN(a));
    return [Math.min(...ages), Math.max(...ages)];
  }, [data, cols]);

  const [ageFilter, setAgeFilter] = useState<[number, number]>([ageRange[0], ageRange[1]]);
  const [showMale, setShowMale] = useState(true);
  const [showFemale, setShowFemale] = useState(true);
  const [showAngina, setShowAngina] = useState<boolean | null>(null);

  const filtered = useMemo(() => {
    if (!data || !cols) return [];
    return data.rows.filter(r => {
      const age = cols.age ? Number(r[cols.age]) : null;
      const sex = cols.gender ? Number(r[cols.gender]) : null;
      const angina = cols.exerciseAngina ? Number(r[cols.exerciseAngina]) : null;
      if (age !== null && (age < ageFilter[0] || age > ageFilter[1])) return false;
      if (sex !== null) {
        if (!showMale && sex === 1) return false;
        if (!showFemale && sex === 0) return false;
      }
      if (showAngina !== null && angina !== null && angina !== (showAngina ? 1 : 0)) return false;
      return true;
    });
  }, [data, cols, ageFilter, showMale, showFemale, showAngina]);

  // Scatter: Cholesterol vs Age colored by disease
  const scatterData = useMemo(() => filtered.map(r => ({
    x: cols?.age ? Number(r[cols.age]) : 0,
    y: cols?.cholesterol ? Number(r[cols.cholesterol]) : 0,
    disease: cols?.target ? Number(r[cols.target]) : 0,
  })).filter(d => d.x > 0 && d.y > 0), [filtered, cols]);

  // Max HR vs Age
  const hrData = useMemo(() => filtered.map(r => ({
    x: cols?.age ? Number(r[cols.age]) : 0,
    y: cols?.maxHR ? Number(r[cols.maxHR]) : 0,
    disease: cols?.target ? Number(r[cols.target]) : 0,
  })).filter(d => d.x > 0 && d.y > 0), [filtered, cols]);

  // Chest pain breakdown
  const chestPainData = useMemo(() => {
    const counts: Record<string, { disease: number; healthy: number }> = {};
    filtered.forEach(r => {
      const cp = cols?.chestPain ? Number(r[cols.chestPain]) : null;
      const label = cp !== null ? (CHEST_PAIN_LABELS[cp] ?? `Type ${cp}`) : 'Unknown';
      if (!counts[label]) counts[label] = { disease: 0, healthy: 0 };
      if (cols?.target && Number(r[cols.target]) === 1) counts[label].disease++;
      else counts[label].healthy++;
    });
    return Object.entries(counts).map(([name, v]) => ({ name, ...v }));
  }, [filtered, cols]);

  // Risk factor bar
  const riskData = useMemo(() => {
    if (!data || !cols?.target) return [];
    const diseased = filtered.filter(r => Number(r[cols.target!]) === 1);
    const healthy = filtered.filter(r => Number(r[cols.target!]) === 0);
    const factors = [
      { key: cols.cholesterol, label: 'Cholesterol' },
      { key: cols.restingBP, label: 'Resting BP' },
      { key: cols.age, label: 'Age' },
      { key: cols.oldpeak, label: 'ST Depression' },
    ].filter(f => f.key);
    return factors.map(f => {
      const avg = (arr: typeof filtered) =>
        arr.length ? arr.reduce((s, r) => s + Number(r[f.key!] ?? 0), 0) / arr.length : 0;
      return { name: f.label, disease: +avg(diseased).toFixed(1), healthy: +avg(healthy).toFixed(1) };
    });
  }, [filtered, cols, data]);

  if (!data || !cols) return <EmptyState />;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Clinical View</h1>
        <p className="text-sm text-muted-foreground mt-1">Risk factor analysis — Dr. Sharma's perspective</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-8 items-center">
          <div className="space-y-2 min-w-[200px] flex-1">
            <Label className="text-xs text-muted-foreground">
              Age Range: {ageFilter[0]} – {ageFilter[1]} yrs
            </Label>
            <Slider
              min={ageRange[0]}
              max={ageRange[1]}
              step={1}
              value={ageFilter}
              onValueChange={(v) => setAgeFilter(v as [number, number])}
            />
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Switch id="male" checked={showMale} onCheckedChange={setShowMale} />
              <Label htmlFor="male" className="text-sm">Male</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="female" checked={showFemale} onCheckedChange={setShowFemale} />
              <Label htmlFor="female" className="text-sm">Female</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="angina"
                checked={showAngina === true}
                onCheckedChange={(v) => setShowAngina(v ? true : null)}
              />
              <Label htmlFor="angina" className="text-sm">Exercise Angina Only</Label>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{filtered.length} patients shown</p>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ScatterCard
          title="Age vs. Cholesterol"
          subtitle="Colored by disease status"
          data={scatterData}
          xLabel="Age"
          yLabel="Cholesterol (mg/dl)"
        />
        <ScatterCard
          title="Age vs. Max Heart Rate"
          subtitle="Colored by disease status"
          data={hrData}
          xLabel="Age"
          yLabel="Max HR (bpm)"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Chest Pain Type Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chestPainData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={110} />
                <Tooltip />
                <Legend />
                <Bar dataKey="disease" name="Disease" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
                <Bar dataKey="healthy" name="Healthy" fill="hsl(var(--clinical-healthy))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Risk Factor Comparison</CardTitle>
            <p className="text-xs text-muted-foreground">Average values: disease vs healthy</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={riskData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={90} />
                <Tooltip />
                <Legend />
                <Bar dataKey="disease" name="With Disease" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
                <Bar dataKey="healthy" name="No Disease" fill="hsl(var(--clinical-healthy))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ScatterCard({ title, subtitle, data, xLabel, yLabel }: {
  title: string; subtitle: string;
  data: { x: number; y: number; disease: number }[];
  xLabel: string; yLabel: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" dataKey="x" name={xLabel} tick={{ fontSize: 11 }} label={{ value: xLabel, position: 'insideBottom', offset: -5, fontSize: 11 }} />
            <YAxis type="number" dataKey="y" name={yLabel} tick={{ fontSize: 11 }} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={data.filter(d => d.disease === 1)} name="Disease" fill="hsl(var(--destructive))" fillOpacity={0.6} />
            <Scatter data={data.filter(d => d.disease === 0)} name="Healthy" fill="hsl(var(--clinical-healthy))" fillOpacity={0.6} />
            <Legend />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

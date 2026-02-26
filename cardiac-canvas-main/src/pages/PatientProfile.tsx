import { useMemo, useState } from 'react';
import { useData } from '@/context/DataContext';
import { detectColumns } from '@/lib/csvParser';
import { EmptyState } from '@/components/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine
} from 'recharts';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface Benchmark {
  label: string;
  key: string | null;
  unit: string;
  healthy: [number, number]; // [min, max] healthy range
}

export default function PatientProfile() {
  const { data } = useData();
  const cols = useMemo(() => data ? detectColumns(data.columns) : null, [data]);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  const benchmarks: Benchmark[] = useMemo(() => ([
    { label: 'Cholesterol', key: cols?.cholesterol ?? null, unit: 'mg/dl', healthy: [100, 200] as [number, number] },
    { label: 'Resting BP', key: cols?.restingBP ?? null, unit: 'mmHg', healthy: [90, 120] as [number, number] },
    { label: 'Max Heart Rate', key: cols?.maxHR ?? null, unit: 'bpm', healthy: [100, 170] as [number, number] },
    { label: 'Age', key: cols?.age ?? null, unit: 'yrs', healthy: [20, 55] as [number, number] },
    { label: 'ST Depression', key: cols?.oldpeak ?? null, unit: '', healthy: [0, 1.5] as [number, number] },
  ] as Benchmark[]).filter(b => b.key), [cols]);

  const averages = useMemo(() => {
    if (!data) return {};
    const result: Record<string, number> = {};
    benchmarks.forEach(b => {
      if (!b.key) return;
      const vals = data.rows.map(r => Number(r[b.key!])).filter(v => !isNaN(v) && v > 0);
      result[b.key] = vals.length ? vals.reduce((a, x) => a + x, 0) / vals.length : 0;
    });
    return result;
  }, [data, benchmarks]);

  if (!data || !cols) return <EmptyState />;

  const patient = data.rows[selectedIdx];
  const isDisease = cols.target ? Number(patient[cols.target]) === 1 : null;

  // Comparison bar data
  const compData = benchmarks.map(b => ({
    name: b.label,
    patient: b.key ? +Number(patient[b.key]).toFixed(1) : 0,
    average: b.key ? +averages[b.key].toFixed(1) : 0,
    unit: b.unit,
  })).filter(d => d.patient > 0);

  // Risk flags
  const flags = benchmarks.flatMap(b => {
    if (!b.key) return [];
    const val = Number(patient[b.key]);
    const avg = averages[b.key];
    if (!avg || isNaN(val) || val === 0) return [];
    const pctDiff = ((val - avg) / avg) * 100;
    const [min, max] = b.healthy;
    const outOfRange = val < min || val > max;
    if (outOfRange || Math.abs(pctDiff) > 20) {
      return [{
        label: b.label,
        value: val,
        unit: b.unit,
        pctDiff,
        severity: Math.abs(pctDiff) > 30 || outOfRange ? 'high' : 'medium',
        outOfRange,
      }];
    }
    return [];
  });

  // Risk score (0–100)
  const riskScore = Math.min(100, Math.round(
    flags.reduce((s, f) => s + (f.severity === 'high' ? 25 : 15), 0) +
    (isDisease === true ? 20 : 0)
  ));

  const riskColor =
    riskScore >= 70 ? 'hsl(var(--destructive))' :
    riskScore >= 40 ? 'hsl(var(--clinical-warning))' :
    'hsl(var(--clinical-healthy))';

  const recommendations: Record<string, string> = {
    'Cholesterol': 'Consider dietary changes: reduce saturated fats, increase fiber intake.',
    'Resting BP': 'Monitor blood pressure regularly. Reduce sodium intake and increase physical activity.',
    'Max Heart Rate': 'Consult a cardiologist regarding cardiovascular fitness levels.',
    'ST Depression': 'Schedule an ECG and stress test. This may indicate myocardial ischemia.',
    'Age': 'Age is a non-modifiable risk factor. Increase monitoring frequency.',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Patient Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Individual risk explorer — Anita's perspective</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Select patient:</span>
          <Select
            value={String(selectedIdx)}
            onValueChange={(v) => setSelectedIdx(Number(v))}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Patient #" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {data.rows.map((_, i) => (
                <SelectItem key={i} value={String(i)}>Patient #{i + 1}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Risk Gauge */}
        <Card className="flex flex-col items-center justify-center py-6">
          <CardHeader className="pb-0 text-center">
            <CardTitle className="text-base">Risk Score</CardTitle>
            <p className="text-xs text-muted-foreground">Based on clinical indicators</p>
          </CardHeader>
          <CardContent className="flex flex-col items-center pt-2">
            <ResponsiveContainer width={180} height={160}>
              <RadialBarChart
                innerRadius={50}
                outerRadius={80}
                data={[{ value: riskScore, fill: riskColor }]}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar dataKey="value" cornerRadius={4} background={{ fill: 'hsl(var(--muted))' }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <p className="text-4xl font-bold mt-[-40px]" style={{ color: riskColor }}>{riskScore}</p>
            <p className="text-sm text-muted-foreground mt-1">/ 100</p>
            <Badge
              className="mt-3"
              style={{
                backgroundColor: riskColor,
                color: 'white',
              }}
            >
              {riskScore >= 70 ? 'High Risk' : riskScore >= 40 ? 'Moderate Risk' : 'Low Risk'}
            </Badge>
            {isDisease !== null && (
              <p className="text-xs text-muted-foreground mt-2">
                Dataset label: <span className="font-medium">{isDisease ? 'Heart Disease' : 'No Disease'}</span>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Patient Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Patient Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {benchmarks.slice(0, 6).map(b => {
                if (!b.key) return null;
                const val = patient[b.key];
                return (
                  <div key={b.label} className="flex justify-between text-sm py-1 border-b border-border last:border-0">
                    <span className="text-muted-foreground">{b.label}</span>
                    <span className="font-medium">{val !== undefined ? `${val} ${b.unit}`.trim() : 'N/A'}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Risk Flags */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Risk Flags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {flags.length === 0 ? (
              <div className="flex items-center gap-2 text-clinical-healthy">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">All indicators within normal range</span>
              </div>
            ) : (
              flags.map(f => (
                <div
                  key={f.label}
                  className="flex items-start gap-2 p-2 rounded-lg"
                  style={{
                    backgroundColor: f.severity === 'high'
                      ? 'hsl(var(--destructive) / 0.08)'
                      : 'hsl(var(--clinical-warning) / 0.1)',
                  }}
                >
                  <AlertTriangle
                    className="h-4 w-4 mt-0.5 shrink-0"
                    style={{ color: f.severity === 'high' ? 'hsl(var(--destructive))' : 'hsl(var(--clinical-warning))' }}
                  />
                  <div>
                    <p className="text-xs font-semibold text-foreground">{f.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {f.value} {f.unit} · {f.pctDiff > 0 ? '+' : ''}{f.pctDiff.toFixed(0)}% vs average
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Patient vs. Dataset Average</CardTitle>
          <p className="text-xs text-muted-foreground">Comparison across key clinical indicators</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={compData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v, name) => [v, name]} />
              <Legend />
              <Bar dataKey="patient" name="This Patient" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
              <Bar dataKey="average" name="Dataset Average" fill="hsl(var(--muted-foreground))" radius={[4,4,0,0]} fillOpacity={0.5} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {flags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Actionable Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {flags.map(f => (
              <div key={f.label} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Info className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{f.label}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {recommendations[f.label] ?? 'Consult your healthcare provider for personalized advice.'}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

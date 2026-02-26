import { useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { detectColumns } from '@/lib/csvParser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, HeartPulse, Activity, Droplets } from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { EmptyState } from '@/components/EmptyState';

const COLORS = {
  disease: 'hsl(var(--destructive))',
  healthy: 'hsl(var(--clinical-healthy))',
  male: 'hsl(var(--primary))',
  female: 'hsl(var(--clinical-teal))',
};

export default function Overview() {
  const { data } = useData();

  const stats = useMemo(() => {
    if (!data) return null;
    const cols = detectColumns(data.columns);
    const rows = data.rows;

    const total = rows.length;
    const targetCol = cols.target;
    const withDisease = targetCol
      ? rows.filter(r => Number(r[targetCol]) === 1).length
      : 0;
    const ageCol = cols.age;
    const avgAge = ageCol
      ? Math.round(rows.reduce((s, r) => s + Number(r[ageCol] ?? 0), 0) / total)
      : null;
    const cholCol = cols.cholesterol;
    const avgChol = cholCol
      ? Math.round(rows.reduce((s, r) => s + Number(r[cholCol] ?? 0), 0) / total)
      : null;

    // Donut data
    const donutData = targetCol ? [
      { name: 'Heart Disease', value: withDisease },
      { name: 'No Disease', value: total - withDisease },
    ] : [];

    // Age distribution
    const ageBuckets: Record<string, number> = {
      '<40': 0, '40–49': 0, '50–59': 0, '60–69': 0, '70+': 0,
    };
    if (ageCol) {
      rows.forEach(r => {
        const age = Number(r[ageCol]);
        if (age < 40) ageBuckets['<40']++;
        else if (age < 50) ageBuckets['40–49']++;
        else if (age < 60) ageBuckets['50–59']++;
        else if (age < 70) ageBuckets['60–69']++;
        else ageBuckets['70+']++;
      });
    }
    const ageData = Object.entries(ageBuckets).map(([name, count]) => ({ name, count }));

    // Gender breakdown
    const genderCol = cols.gender;
    const genderMap: Record<string, { healthy: number; disease: number }> = {
      Male: { healthy: 0, disease: 0 },
      Female: { healthy: 0, disease: 0 },
    };
    if (genderCol && targetCol) {
      rows.forEach(r => {
        const g = Number(r[genderCol]) === 1 ? 'Male' : 'Female';
        const d = Number(r[targetCol]) === 1 ? 'disease' : 'healthy';
        genderMap[g][d]++;
      });
    }
    const genderData = Object.entries(genderMap).map(([name, v]) => ({ name, ...v }));

    return { total, withDisease, avgAge, avgChol, donutData, ageData, genderData, cols };
  }, [data]);

  if (!data || !stats) {
    return <EmptyState />;
  }

  const prevalence = ((stats.withDisease / stats.total) * 100).toFixed(1);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">High-level summary of the uploaded dataset</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Patients" value={stats.total.toLocaleString()} color="text-primary" />
        <StatCard icon={HeartPulse} label="With Heart Disease" value={`${prevalence}%`} sub={`${stats.withDisease} patients`} color="text-destructive" />
        <StatCard icon={Activity} label="Average Age" value={stats.avgAge ? `${stats.avgAge} yrs` : 'N/A'} color="text-clinical-teal" />
        <StatCard icon={Droplets} label="Avg Cholesterol" value={stats.avgChol ? `${stats.avgChol} mg/dl` : 'N/A'} color="text-clinical-warning" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Donut */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Heart Disease Prevalence</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={stats.donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  <Cell fill={COLORS.disease} />
                  <Cell fill={COLORS.healthy} />
                </Pie>
                <Tooltip formatter={(v: number) => [`${v} patients`, '']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gender Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gender Breakdown by Disease Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stats.genderData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="disease" name="Heart Disease" fill={COLORS.disease} radius={[4, 4, 0, 0]} />
                <Bar dataKey="healthy" name="No Disease" fill={COLORS.healthy} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Age Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Age Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.ageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" name="Patients" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, sub, color,
}: {
  icon: React.ElementType; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <div className={`p-2 rounded-lg bg-muted`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

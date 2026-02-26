export interface PatientRow {
  [key: string]: string | number;
}

export interface ParsedData {
  rows: PatientRow[];
  columns: string[];
  filename: string;
}

export function parseCSV(content: string, filename: string): ParsedData {
  const lines = content.trim().split('\n');
  if (lines.length < 2) throw new Error('CSV must have a header and at least one data row.');

  const rawHeaders = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const columns = rawHeaders;

  const rows: PatientRow[] = lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const row: PatientRow = {};
    columns.forEach((col, i) => {
      const val = values[i]?.trim().replace(/^"|"$/g, '') ?? '';
      const num = Number(val);
      row[col] = isNaN(num) || val === '' ? val : num;
    });
    return row;
  }).filter(row => Object.values(row).some(v => v !== '' && v !== null && v !== undefined));

  return { rows, columns, filename };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/** Tries to detect common column names for heart disease datasets */
export function detectColumns(columns: string[]) {
  const lower = columns.map(c => c.toLowerCase());
  const find = (candidates: string[]) =>
    columns[lower.findIndex(c => candidates.some(cand => c.includes(cand)))] ?? null;

  return {
    age: find(['age']),
    gender: find(['sex', 'gender']),
    cholesterol: find(['chol', 'cholesterol']),
    restingBP: find(['trestbps', 'restingbp', 'resting_bp', 'blood_pressure', 'bp']),
    maxHR: find(['thalach', 'maxhr', 'max_hr', 'max heart rate', 'thalach']),
    target: find(['target', 'heart_disease', 'heartdisease', 'disease', 'num', 'condition']),
    chestPain: find(['cp', 'chest_pain', 'chestpain', 'chest pain']),
    fastingBS: find(['fbs', 'fasting_bs', 'fasting_blood_sugar']),
    exerciseAngina: find(['exang', 'exercise_angina', 'exerciseangina']),
    stSlope: find(['slope', 'st_slope', 'stslope']),
    oldpeak: find(['oldpeak', 'st_depression']),
    bmi: find(['bmi', 'body_mass']),
  };
}

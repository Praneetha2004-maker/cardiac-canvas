
## Heart Disease Analysis Dashboard

A multi-page, interactive web dashboard for analyzing heart disease data from a user-uploaded CSV file. Styled in a **Clinical & Minimal** aesthetic (white/light grey backgrounds, blue/teal accents, clean typography), with a collapsible sidebar for navigation between pages.

---

### Core Architecture

**CSV Upload & Parsing**
- A prominent upload zone on the home/landing page lets users drag-and-drop or browse for their CSV file
- The app parses the CSV in-browser (no backend needed) and stores the data in app state
- Once uploaded, users are automatically redirected to the Overview dashboard
- A persistent header will show the loaded filename and a button to load a different file

**Sidebar Navigation**
- Collapsible left sidebar with 4 navigation items:
  1. **Overview** — high-level summary
  2. **Clinical View** (Dr. Sharma scenario)
  3. **Policy View** (Ramesh scenario)
  4. **Patient Profile** (Anita scenario)

---

### Page 1 — Overview
- **Summary stat cards**: Total patients, % with heart disease, average age, average cholesterol
- **Heart disease prevalence donut chart** (yes vs. no)
- **Age distribution bar chart** across all patients
- **Gender breakdown** (stacked bar or pie)

---

### Page 2 — Clinical View (Dr. Sharma)
Focused on risk factors for middle-aged patients and clinical indicators:
- **Filters panel**: Age range slider, gender toggle, smoking/exercise toggles
- **BMI vs. Cholesterol scatter plot** colored by disease status
- **Chest pain type breakdown** (bar chart)
- **Max heart rate vs. Age** scatter plot
- **Risk factor heatmap / ranked bar** showing which factors correlate most with disease

---

### Page 3 — Policy View (Ramesh)
Population-level trends and lifestyle correlations:
- **Exercise-induced angina vs. disease prevalence** (grouped bar)
- **Resting blood pressure distribution** by disease status (box-style bar chart)
- **Cholesterol level buckets** (normal / borderline / high) vs. disease rate
- **Fasting blood sugar impact** chart
- **Sedentary lifestyle proxy** (ST slope / exercise data) comparison chart

---

### Page 4 — Patient Profile (Anita)
Individual patient explorer:
- **Patient selector** (dropdown or row selector from a data table)
- **Risk gauge** — a visual "risk score" based on the patient's indicators compared to averages
- **Personal vs. benchmark comparison** bar chart (cholesterol, BP, resting HR, etc.)
- **Highlighted risk flags** (e.g., "Cholesterol is 30% above healthy average")
- **Actionable recommendations** panel based on above-average risk indicators

---

### Design Details
- Color palette: White background, slate/grey sidebar, blue (`#2563EB`) primary accent, teal for positive/healthy indicators, red/orange for risk flags
- Recharts library for all charts (already installed)
- Responsive layout — works on desktop and tablet
- Graceful "no data" empty states on each page until a CSV is uploaded


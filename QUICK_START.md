# Quick Start - Patient Care Feature

## 🚀 Start Immediately (No Database Required)

The app works without database setup! Analyses just won't be saved.

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend (in project root)
npm run dev
```

Go to http://localhost:5173 and start using the app!

## 💾 Optional: Enable Analysis Saving (5 minutes)

To save and view past analyses, set up the database:

### Step 1: Create Database Table
1. Open your Supabase project dashboard
2. Go to **SQL Editor** → **New Query**
3. Copy/paste from `scripts/create_analyses_table.sql`
4. Click **Run**

### Step 2: Verify It Works
Run an analysis, then check Patient Care page - your analysis should appear!

## ✅ Test the Complete Flow

1. **Sign In**: Go to http://localhost:5173 and sign in
2. **Run Analysis**: 
   - Go to Dashboard
   - Select "Clinical Mode"
   - Fill in patient profile (age, sex, condition)
   - Enter a query (e.g., "metformin for type 2 diabetes")
   - Click "Analyze"
3. **View Results**: Wait for analysis to complete
4. **Check Patient Care**:
   - Navigate to "Patient Care" page
   - See your analysis listed
   - Click "Generate Report" for patient summary
   - Click "Discussion Points" for clinician questions
   - Click "Download" to save report

## 🎯 What's Working

- ✅ Dashboard saves analyses automatically
- ✅ Patient Care loads from database
- ✅ Generate Report modal
- ✅ Discussion Points modal
- ✅ Download functionality
- ✅ Safety tier color coding
- ✅ User-specific data (RLS enabled)

## 🐛 Troubleshooting

**"relation 'analyses' does not exist"**
→ Run the SQL script in Supabase

**Analyses not showing**
→ Check browser console, verify you're signed in

**Backend not responding**
→ Make sure backend is running on port 3001

## 📁 Key Files

- `src/pages/Dashboard.tsx` - Saves analyses
- `src/pages/PatientCare.tsx` - Displays analyses
- `src/lib/database.ts` - Database functions
- `scripts/create_analyses_table.sql` - Database schema

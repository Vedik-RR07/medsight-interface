# Database Setup for Patient Care Feature

The Patient Care page now saves and retrieves analysis results from Supabase. Follow these steps to set up the database:

## 1. Create the Analyses Table

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** (in the left sidebar)
3. Click **New Query**
4. Copy and paste the contents of `scripts/create_analyses_table.sql`
5. Click **Run** to execute the SQL

This will create:
- The `analyses` table with all required columns
- Indexes for performance
- Row Level Security (RLS) policies so users can only see their own analyses

## 2. Verify the Setup

After running the SQL, you can verify the table was created:

1. Go to **Table Editor** in Supabase
2. You should see the `analyses` table listed
3. Click on it to see the schema

## 3. Test the Flow

1. Start your backend: `cd backend && npm run dev`
2. Start your frontend: `npm run dev`
3. Sign in to the application
4. Run an analysis from the Dashboard
5. Navigate to the Patient Care page
6. You should see your analysis listed!

## Table Schema

```
analyses
├── id (UUID, primary key)
├── user_id (UUID, foreign key to auth.users)
├── query (TEXT)
├── mode (TEXT: 'clinical' or 'research')
├── patient_age (INTEGER, nullable)
├── patient_sex (TEXT, nullable)
├── patient_condition (TEXT, nullable)
├── safety_tier (TEXT, nullable)
├── summary (TEXT)
├── confidence (NUMERIC)
├── full_results (JSONB)
└── created_at (TIMESTAMP)
```

## Features Now Working

✅ **Dashboard**: Automatically saves analyses to database after completion
✅ **Patient Care**: Loads recent analyses from database
✅ **Generate Report**: Creates patient-friendly summary modal
✅ **Discussion Points**: Shows questions for clinician modal
✅ **Download**: Downloads plain-language report as text file
✅ **Safety Tier Display**: Color-coded badges for safety levels
✅ **Row Level Security**: Users can only see their own analyses

## Troubleshooting

**Error: "relation 'analyses' does not exist"**
- Make sure you ran the SQL script in Supabase SQL Editor

**Error: "permission denied for table analyses"**
- Check that RLS policies were created correctly
- Verify you're signed in with a valid user

**Analyses not showing up**
- Check browser console for errors
- Verify the user_id matches between auth.users and analyses table
- Check Supabase logs for any database errors

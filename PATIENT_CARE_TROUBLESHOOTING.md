# Patient Care Page - Troubleshooting Guide

## Issue: "Failed to load recent analyses" Error

This error appears when the Supabase database table hasn't been created yet. **The page will still work** - it just won't be able to save or load analyses.

### Quick Fix Options

#### Option 1: Set Up Database (Recommended for Full Functionality)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy/paste the contents of `scripts/create_analyses_table.sql`
5. Click **Run**
6. Refresh the Patient Care page

#### Option 2: Use Without Database (Works Immediately)
The page now gracefully handles missing database:
- ✅ Page loads without errors
- ✅ Shows "No analyses yet" message
- ✅ "Go to Dashboard" button works
- ❌ Analyses won't be saved
- ❌ Can't view past analyses

### What Changed

**Before**: Page showed error toast and failed to load
**Now**: Page loads normally, just shows empty state if database isn't set up

### Current Behavior

1. **Dashboard**: 
   - Tries to save analyses to database
   - If save fails, logs error to console
   - Continues to Results page normally
   - User experience is NOT affected

2. **Patient Care**:
   - Tries to load analyses from database
   - If load fails, shows empty state
   - No error toast shown to user
   - Page remains fully functional

### Testing Without Database

You can test the app without setting up the database:

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `npm run dev`
3. Sign in
4. Run an analysis from Dashboard
5. View results (works normally)
6. Go to Patient Care page
7. See "No analyses yet" message
8. Click "Go to Dashboard" to run more analyses

### Testing With Database

Once you run the SQL script:

1. Run an analysis from Dashboard
2. Go to Patient Care page
3. See your analysis listed with:
   - Query text
   - Date/time
   - Safety tier badge
   - Confidence score
4. Click "Generate Report" to see patient summary
5. Click "Discussion Points" to see clinician questions
6. Click download icon to save report

### Common Issues

**Issue**: Page shows "No analyses yet" even after running analyses
**Solution**: 
- Check if database table was created (run SQL script)
- Check browser console for errors
- Verify you're signed in with the same account

**Issue**: "relation 'analyses' does not exist" in console
**Solution**: Run the SQL script in Supabase SQL Editor

**Issue**: Analyses save but don't show up
**Solution**: 
- Check Supabase Table Editor to see if data is there
- Verify RLS policies were created
- Check that user_id matches between auth and analyses table

### Console Errors (Safe to Ignore)

These errors in the console are safe to ignore if you haven't set up the database yet:
- "Failed to save analysis"
- "Error loading analyses"
- "relation 'analyses' does not exist"

The app will work normally - you just won't have persistence.

### Need Help?

1. Check browser console (F12) for detailed errors
2. Check Supabase logs in dashboard
3. Verify backend is running on port 3001
4. Verify frontend is running on port 5173

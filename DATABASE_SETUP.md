# Database Setup Instructions

## Quick Setup

1. **Open your Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project: `rtdupcgddvqybyptptmh`

2. **Create Database Tables**
   - Go to SQL Editor in your Supabase dashboard
   - Copy and paste the entire content from `scripts/create-tables.sql`
   - Click "Run" to execute the script

3. **Verify Setup**
   - Refresh your application
   - Check the browser console for success messages
   - You should see: "✅ Database connection successful"

## Troubleshooting

### If you see "Tables not created" error:
- Make sure you ran the SQL script in Supabase dashboard
- Check that all tables were created successfully
- Verify your Supabase URL and API key in `.env` file

### If data is not persisting:
- Check browser console for error messages
- Verify your Supabase project is active
- Ensure you have proper permissions set up

### If real-time updates aren't working:
- Make sure Realtime is enabled in your Supabase project
- Check that the tables have Row Level Security (RLS) properly configured

## Environment Variables

Make sure your `.env` file has:
```
NEXT_PUBLIC_SUPABASE_URL="https://rtdupcgddvqybyptptmh.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key_here"
```

## Testing the Connection

The app will automatically test the database connection on startup and show status messages in the console.
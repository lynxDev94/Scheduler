# Supabase Setup for Task-Master

## Step 1: Environment Variables

Create a `.env.local` file in your project root with your Supabase credentials:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://hlyokovzyeeapovqdudh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Step 2: Database Schema Setup

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to "SQL Editor" in the left sidebar
4. Copy and paste the entire contents of `supabase-schema.sql`
5. Click "Run" to execute the SQL

## Step 3: Verify Setup

After running the SQL, you should see:
- ✅ 3 tables created: `organizations`, `employees`, `schedules`
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ RLS policies created for data protection
- ✅ Indexes created for performance
- ✅ Triggers created for automatic timestamp updates

## Step 4: Test Connection

The Supabase client is now configured and ready to use. You can test it by:

1. Starting your development server: `npm run dev`
2. The app should connect to Supabase without errors
3. Check the browser console for any connection issues

## Database Structure

### Organizations Table
- Stores business information (name, hours, settings)
- Each user can have multiple organizations
- Protected by RLS (users only see their own)

### Employees Table
- Stores employee information (name, role, rate, availability)
- Linked to organizations
- Soft delete (is_active flag)

### Schedules Table
- Stores shift assignments
- Linked to both organizations and employees
- Supports both weekly patterns and specific dates

## Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Clerk Integration**: Uses Clerk user IDs for authentication
- **Cascade Deletes**: Deleting an organization removes all related data
- **Soft Deletes**: Employees are marked inactive rather than deleted

## Usage Examples

```typescript
// Create an organization
import { createOrganization } from '@/lib/database'

const org = await createOrganization({
  name: "Joe's Coffee Shop",
  owner_id: "clerk_user_id",
  business_hours: { monday: "6AM-10PM" },
  timezone: "America/New_York"
})

// Add an employee
import { createEmployee } from '@/lib/database'

const employee = await createEmployee({
  organization_id: org.id,
  first_name: "Sarah",
  last_name: "Johnson",
  role: "Barista",
  hourly_rate: 15.50
})

// Create a schedule
import { createSchedule } from '@/lib/database'

const schedule = await createSchedule({
  organization_id: org.id,
  employee_id: employee.id,
  day_of_week: 1, // Monday
  start_time: "09:00",
  end_time: "17:00"
})
```

## Next Steps

1. ✅ Supabase is now configured
2. ✅ Database schema is set up
3. ✅ Security policies are in place
4. 🔄 Ready to build dashboard features
5. 🔄 Ready to implement employee management
6. 🔄 Ready to build scheduling interface

## Troubleshooting

### Common Issues:

1. **Environment Variables Not Found**
   - Make sure `.env.local` is in the project root
   - Restart your development server after adding env vars

2. **RLS Policy Errors**
   - Make sure you're authenticated with Clerk
   - Check that the user ID matches the owner_id

3. **Connection Errors**
   - Verify your Supabase URL and keys
   - Check that your project is active in Supabase dashboard

### Getting Help:

- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
- Check the browser console for detailed error messages 
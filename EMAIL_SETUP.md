# Momster Email System Setup

## Overview
Automated email system with editable templates for welcome, re-engagement, and goodbye emails.

## Features
- ✅ Welcome email sent automatically on sign-up
- ✅ Re-engagement email for users inactive for 7+ days
- ✅ Goodbye email when user deletes account
- ✅ Admin panel for editing email templates
- ✅ Support for Greek and English languages
- ✅ User activity tracking

## Edge Functions

### 1. send-welcome-email
- **Trigger**: Called after user sign-up in Auth.tsx
- **Purpose**: Sends welcome email to new users
- **Public**: Yes (verify_jwt = false)

### 2. send-reengagement-email
- **Trigger**: Should be scheduled via cron job (see below)
- **Purpose**: Sends re-engagement emails to inactive users
- **Public**: Yes (verify_jwt = false)

### 3. send-goodbye-email
- **Trigger**: Called when user deletes account
- **Purpose**: Sends goodbye email
- **Public**: Yes (verify_jwt = false)

## Setting up Cron Job for Re-engagement Emails

To automatically send re-engagement emails, set up a Supabase cron job:

1. Go to your Lovable Cloud dashboard
2. Navigate to Database → SQL Editor
3. Enable `pg_cron` and `pg_net` extensions if not already enabled:
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_cron;
   CREATE EXTENSION IF NOT EXISTS pg_net;
   ```

4. Create the cron job (runs daily at 9 AM UTC):
   ```sql
   SELECT cron.schedule(
     'send-reengagement-emails-daily',
     '0 9 * * *',
     $$
     SELECT net.http_post(
         url:='https://unjmflimsliqjnstmtrg.supabase.co/functions/v1/send-reengagement-email',
         headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuam1mbGltc2xpcWpuc3RtdHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MTU5NjcsImV4cCI6MjA3ODI5MTk2N30.wk7JwLW_016_TyCP3910EyDNxISU_FNQ4j7tslO9mcg"}'::jsonb,
         body:='{}'::jsonb
     ) as request_id;
     $$
   );
   ```

## Admin Panel

Admins can edit email templates via the Admin page:
- Navigate to Admin → Email Templates tab
- Click "Επεξεργασία" (Edit) on any template
- Modify subject and body for both Greek and English
- Click "Αποθήκευση" (Save)

## Email Variables

All emails support the following variables:
- `{user_name}` - User's full name

## Email Templates

### Welcome Email
- **Key**: `welcome`
- **Sent**: On user sign-up
- **Variables**: {user_name}

### Verification Email
- **Key**: `verification`
- **Sent**: [Not yet implemented]
- **Variables**: {user_name}, {verification_link}

### Re-engagement Email
- **Key**: `reengagement`
- **Sent**: 7 days after last activity
- **Variables**: {user_name}

### Goodbye Email
- **Key**: `goodbye`
- **Sent**: On account deletion
- **Variables**: {user_name}

## Resend Configuration

Make sure your Resend API key is configured:
1. Verify your domain at https://resend.com/domains
2. Add your RESEND_API_KEY secret in Lovable Cloud

**Important**: Update the `from` field in all edge functions from `onboarding@resend.dev` to your verified domain email (e.g., `hello@yourdomain.com`)

## Testing

Test emails manually by calling the edge functions:

```javascript
// Test welcome email
await supabase.functions.invoke('send-welcome-email', {
  body: {
    userId: 'user-id',
    email: 'test@example.com',
    fullName: 'Test User',
    language: 'el'
  }
});

// Test re-engagement email (processes all inactive users)
await supabase.functions.invoke('send-reengagement-email', {
  body: {}
});

// Test goodbye email
await supabase.functions.invoke('send-goodbye-email', {
  body: {
    email: 'test@example.com',
    fullName: 'Test User',
    language: 'el'
  }
});
```

## Activity Tracking

User activity is automatically tracked:
- On page load (via useActivityTracker hook in App.tsx)
- Every 5 minutes while user is active
- Used to determine who should receive re-engagement emails

## Database Tables

### email_templates
Stores editable email templates with Greek and English versions.

### user_activity
Tracks user's last activity and re-engagement email status.

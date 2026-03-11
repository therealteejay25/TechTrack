# Resend Email Setup

## Quick Setup (5 minutes)

### 1. Get Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Go to **API Keys** in the dashboard
4. Click **Create API Key**
5. Copy the API key

### 2. Add to Environment Variables

Open `techtrack-api/.env` and update:

```env
RESEND_API_KEY=re_your_actual_api_key_here
```

### 3. Install Dependencies

```bash
cd techtrack-api
pnpm install
```

### 4. Test Email Sending

The system will automatically send invitation emails when you invite a new team member.

## Default Email Address

The system uses Resend's default testing email: `onboarding@resend.dev`

This works immediately for testing. For production, you'll need to:
1. Verify your own domain in Resend
2. Update the `from` address in `techtrack-api/src/lib/email.ts`

## Email Template

The invitation email includes:
- Welcome message
- Organization name
- Role information
- Accept invitation button
- Expiry notice (48 hours)

## Free Tier Limits

Resend free tier includes:
- 100 emails per day
- 3,000 emails per month
- Perfect for testing and small teams

## Troubleshooting

If emails aren't sending:
1. Check your API key is correct in `.env`
2. Restart the backend server
3. Check console for error messages
4. Verify the recipient email is valid

## Production Setup

For production:
1. Add your domain to Resend
2. Verify DNS records
3. Update `from` email in `src/lib/email.ts`:
   ```typescript
   from: 'TechTrack <noreply@yourdomain.com>'
   ```

# Google reCAPTCHA v3 Setup Guide

This guide will help you set up Google reCAPTCHA v3 for the newsletter subscription form to prevent spam.

## Prerequisites

- A Google account
- Access to your website's domain

## Step 1: Register Your Site with Google reCAPTCHA

1. Go to the [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click on the **+** button to create a new site
3. Fill in the registration form:
   - **Label**: Enter a name for your site (e.g., "Colour Clouds Newsletter")
   - **reCAPTCHA type**: Select **reCAPTCHA v3**
   - **Domains**: Add your domains:
     - For production: `colourclouds.digital` (or your actual domain)
     - For development: `localhost`
   - **Accept the reCAPTCHA Terms of Service**
4. Click **Submit**

## Step 2: Get Your API Keys

After registration, you'll receive two keys:

1. **Site Key** (Public key) - Used in the frontend
2. **Secret Key** (Private key) - Used in the backend

Keep these keys secure, especially the Secret Key!

## Step 3: Configure Environment Variables

1. Open your `.env.local` file (create it if it doesn't exist)
2. Add the following environment variables:

```env
# Google reCAPTCHA v3 Configuration
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-site-key-here
RECAPTCHA_SECRET_KEY=your-secret-key-here
```

Replace `your-site-key-here` and `your-secret-key-here` with the actual keys from Step 2.

## Step 4: Test the Implementation

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to any page with the newsletter form (e.g., footer, newsletter popup)

3. Try subscribing to the newsletter:
   - Fill in a valid email address
   - Click "Subscribe to Newsletter"
   - You should see a success message if everything is configured correctly

4. Check the browser console for any reCAPTCHA-related errors

## Step 5: Verify in Production

1. Deploy your changes to production

2. Test the newsletter subscription on your live site

3. Monitor the [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin) for:
   - Request statistics
   - Score distribution
   - Potential issues

## How It Works

### Frontend (Client-Side)

1. The `ReCaptchaProvider` component wraps the entire app in `app/layout.tsx`
2. The newsletter form uses the `useGoogleReCaptcha` hook to execute reCAPTCHA challenges
3. When the form is submitted, a reCAPTCHA token is generated with the action `newsletter_submit`
4. The token is sent to the API along with the form data

### Backend (Server-Side)

1. The API route (`app/api/newsletter/route.ts`) receives the reCAPTCHA token
2. The `verifyRecaptcha` function sends the token to Google's verification API
3. Google returns a response with:
   - `success`: Whether the token is valid
   - `score`: A value from 0.0 (bot) to 1.0 (human)
   - `action`: The action name that was used
4. The API verifies:
   - The token is valid
   - The score is above the threshold (default: 0.5)
   - The action matches the expected action
5. If verification passes, the subscription is processed

## Score Thresholds

reCAPTCHA v3 returns a score from 0.0 to 1.0:

- **1.0**: Very likely a human
- **0.5**: Neutral (default threshold)
- **0.0**: Very likely a bot

You can adjust the minimum score threshold in `lib/recaptcha.ts`:

```typescript
const isRecaptchaValid = await verifyRecaptcha(
  recaptchaToken,
  'newsletter_submit',
  0.5 // Change this value (0.0 to 1.0)
);
```

**Recommendations:**
- **0.3-0.5**: Balanced protection (recommended for most sites)
- **0.5-0.7**: Stricter protection (may block some legitimate users)
- **0.7-1.0**: Very strict (may significantly impact user experience)

## Troubleshooting

### "reCAPTCHA not yet loaded" Error

**Cause**: The reCAPTCHA script hasn't finished loading when the form is submitted.

**Solution**: Wait a moment after the page loads before submitting the form. The script usually loads within 1-2 seconds.

### "reCAPTCHA verification failed" Error

**Possible causes:**
1. Invalid or expired token
2. Score below threshold
3. Action mismatch
4. Network issues

**Solutions:**
1. Check the browser console for detailed error messages
2. Verify your environment variables are correct
3. Check the reCAPTCHA Admin Console for error reports
4. Try lowering the score threshold temporarily for testing

### reCAPTCHA Badge Not Showing

**Cause**: The reCAPTCHA script may not be loading properly.

**Solution**: 
1. Check the browser console for errors
2. Verify the site key is correct
3. Ensure your domain is registered in the reCAPTCHA Admin Console

### High Bot Traffic Despite reCAPTCHA

**Solutions:**
1. Lower the score threshold (make it stricter)
2. Add additional validation (e.g., email domain checks)
3. Implement rate limiting (already included in the API)
4. Monitor the reCAPTCHA Admin Console for patterns

## Additional Security Measures

The newsletter API already includes:

1. **Rate Limiting**: 5 requests per minute per IP address
2. **Input Validation**: Email format and length checks
3. **Input Sanitization**: XSS prevention
4. **Honeypot Field**: Hidden field to catch simple bots
5. **Timestamp Validation**: Prevents form replay attacks

## Resources

- [Google reCAPTCHA Documentation](https://developers.google.com/recaptcha/docs/v3)
- [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
- [reCAPTCHA Best Practices](https://developers.google.com/recaptcha/docs/v3#best_practices)

## Support

If you encounter any issues:

1. Check the browser console for errors
2. Review the server logs for API errors
3. Verify all environment variables are set correctly
4. Consult the Google reCAPTCHA documentation

---

**Note**: reCAPTCHA v3 runs in the background and doesn't interrupt the user experience with challenges. It's designed to be invisible to legitimate users while effectively blocking bots.

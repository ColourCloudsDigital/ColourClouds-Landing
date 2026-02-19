# Google reCAPTCHA Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Your reCAPTCHA Keys

1. Visit: https://www.google.com/recaptcha/admin
2. Click the **+** button
3. Fill in:
   - **Label**: Colour Clouds Forms
   - **Type**: Select **reCAPTCHA v3**
   - **Domains**: Add `localhost` and your production domain
4. Click **Submit**
5. Copy both keys (Site Key and Secret Key)

### Step 2: Configure Environment Variables

1. Open or create `.env.local` in your project root
2. Add these lines (replace with your actual keys):

```env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
RECAPTCHA_SECRET_KEY=6LcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Step 3: Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
# Start it again
npm run dev
```

### Step 4: Test All Forms

Test all protected forms:

#### Newsletter Form (Footer)
1. Go to http://localhost:3000
2. Scroll to the footer
3. Enter your email in the newsletter form
4. Click "Subscribe to Newsletter"
5. You should see a success message!

#### Newsletter Popup
1. Go to http://localhost:3000
2. Wait 5 seconds for the popup to appear
3. Enter your email
4. Click "Done"
5. You should see a success message!

#### Contact Form
1. Go to http://localhost:3000/contact
2. Fill in all fields (name, email, subject, message)
3. Click "Send Message"
4. You should see a success message!

## ✅ That's It!

All your forms are now protected by Google reCAPTCHA v3:
- ✅ Newsletter form (footer)
- ✅ Newsletter popup
- ✅ Contact form

## 🔍 Verify It's Working

### Check the Browser Console

1. Open Developer Tools (F12)
2. Go to the Console tab
3. You should see no reCAPTCHA errors
4. Look for the reCAPTCHA badge in the bottom-right corner of the page

### Check the Network Tab

1. Open Developer Tools (F12)
2. Go to the Network tab
3. Submit any form
4. Look for a request to the API (`/api/newsletter` or `/api/contact`)
5. Check the request payload - it should include `recaptchaToken`

### Check the reCAPTCHA Admin Console

1. Go to https://www.google.com/recaptcha/admin
2. Click on your site
3. You should see request statistics
4. Check the score distribution
5. View requests by action:
   - `newsletter_submit` - Footer form
   - `newsletter_popup` - Popup form
   - `contact_submit` - Contact form

## 🛠️ Troubleshooting

### "reCAPTCHA not yet loaded" or "Security check not ready"

**Solution**: Wait 1-2 seconds after page load before submitting the form.

### "reCAPTCHA verification failed"

**Check**:
1. Are your environment variables correct?
2. Did you restart the dev server after adding the keys?
3. Is `localhost` added to your reCAPTCHA domains?

### No reCAPTCHA badge visible

**Check**:
1. Is `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` set correctly?
2. Did you restart the dev server?
3. Check the browser console for errors

### Form submits but no reCAPTCHA protection

**Check**:
1. Are both environment variables set?
2. Did you restart the server after adding them?
3. Check the API logs for reCAPTCHA verification messages

## 📊 Monitoring

After deployment, monitor your reCAPTCHA:

1. Visit: https://www.google.com/recaptcha/admin
2. Select your site
3. View:
   - Request volume by action
   - Score distribution
   - Potential issues
4. Track each form separately:
   - Newsletter footer: `newsletter_submit`
   - Newsletter popup: `newsletter_popup`
   - Contact form: `contact_submit`

## 🎯 Score Threshold

The default threshold is **0.5** (balanced protection).

To adjust it, edit `lib/recaptcha.ts`:

```typescript
const isRecaptchaValid = await verifyRecaptcha(
  recaptchaToken,
  'newsletter_submit', // or 'newsletter_popup' or 'contact_submit'
  0.5 // Change this: 0.3 (lenient) to 0.7 (strict)
);
```

## 📚 Need More Help?

- **Detailed Setup**: See `RECAPTCHA_SETUP.md`
- **Implementation Details**: See `RECAPTCHA_IMPLEMENTATION_SUMMARY.md`
- **Google Docs**: https://developers.google.com/recaptcha/docs/v3

## 🔐 Security Notes

- **Never commit** `.env.local` to Git
- **Keep your Secret Key secret** - never expose it in client-side code
- **Monitor regularly** for unusual patterns
- **Adjust threshold** based on real-world data
- **Test all forms** before deploying to production

## 🎉 What's Protected

All forms with submit buttons are now protected:

1. **Newsletter Subscription** (Footer)
   - Location: Footer on all pages
   - Action: `newsletter_submit`
   - Protection: reCAPTCHA + Rate limiting + Validation

2. **Newsletter Popup**
   - Location: Popup after 5 seconds
   - Action: `newsletter_popup`
   - Protection: reCAPTCHA + Rate limiting + Validation

3. **Contact Form**
   - Location: `/contact` page
   - Action: `contact_submit`
   - Protection: reCAPTCHA + Rate limiting + Honeypot + Timestamp validation

---

**Need help?** Check the troubleshooting section or review the detailed setup guide.

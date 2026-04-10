Password reset (Supabase) — setup instructions

1) Purpose
- Provide a stable HTTPS fallback page for Supabase password recovery links so mobile clients receive a reliable handoff when email clients (eg. Gmail) open links inside an embedded webview.

2) Files added
- `web/reset-redirect/index.html` — static page that parses Supabase recovery tokens (from the URL fragment) and attempts to open the native app using the `marchecd://auth/reset-password` deep link. If the app cannot be opened it provides copy/open-in-browser instructions.

3) Required steps (Supabase dashboard)
- In Supabase Dashboard → Authentication → Settings → Redirect URLs add the following:
  - `https://marchecd.tech/reset-redirect` (or your production domain + path where `web/reset-redirect/index.html` is hosted)
  - `marchecd://auth/reset-password` (optional but useful)
  - Any Expo dev URL you use for testing (exp://.../--/auth/reset-password)

4) App env setup
- Add the following to your environment config used by the app build (e.g. `.env`, EAS secrets, or Expo config):

```
EXPO_PUBLIC_PASSWORD_RESET_REDIRECT_URL=https://marchecd.tech/reset-redirect
```

Auth code in `contexts/AuthContext.tsx` already reads `EXPO_PUBLIC_PASSWORD_RESET_REDIRECT_URL` and will use it as the `redirectTo` when calling `supabase.auth.resetPasswordForEmail(...)`. Ensure the value is set and matches the redirect URL registered in Supabase.

5) Host the fallback page
- Deploy the contents of `web/reset-redirect/index.html` so it is reachable at the URL you registered with Supabase (e.g. https://marchecd.tech/reset-redirect). If you already host a static site, add the file there. The page is intentionally small and static.

6) Best practices and notes
- The most robust production approach uses platform app links / universal links (Android Asset Links & Apple App Site Association). When configured, clicking HTTPS links will open the app directly instead of relying on app-schemes. Implement these when you have control of your domain and app store configuration.
- Gmail (and other mail apps) often open links in an in-app webview that blocks app-schemes. The static fallback page helps users re-open the flow in the system browser or copy the deep-link into the app.
- For phone (SMS/OTP) resets, configure an SMS provider (Twilio, Vonage, MessageBird) in Supabase and add relevant rate-limit settings in the dashboard.

7) Verify end-to-end
- Update env with `EXPO_PUBLIC_PASSWORD_RESET_REDIRECT_URL` and redeploy app.
- Register the redirect URL in Supabase.
- Trigger a password reset email for a test user and confirm the email points to the redirect URL.
- Open the email link in a mobile mail client: if it opens the fallback page, press "Open in app".

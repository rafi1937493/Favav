# Facebook Utility

A Next.js utility application deployed on Vercel providing:
1. Direct shortcut to Facebook's official session logout endpoint.
2. Protected numeric Facebook User ID lookup via Meta's Graph API.

## Environment Variables

Configure the following variables in Vercel:
- `ADMIN_PASSWORD`: A private passcode required to run lookups.
- `FACEBOOK_ACCESS_TOKEN`: Your Meta Graph API Access Token (App token, User token, or System User token).
- `GRAPH_API_VERSION`: Graph API version (default: `v21.0`).

## Tech Stack
- Next.js (App Router)
- React & TypeScript
- Tailwind CSS
- Lucide React icons

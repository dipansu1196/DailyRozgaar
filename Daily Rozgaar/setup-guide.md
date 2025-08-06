# Cloud Deployment Setup Guide

## Step 1: Setup Supabase (Free Database)

1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project
3. Go to Settings > API and copy:
   - Project URL
   - anon public key
   - service_role key
4. Go to SQL Editor and run the schema from `database/schema.sql`

## Step 2: Setup Cloudinary (Free Image Storage)

1. Go to [cloudinary.com](https://cloudinary.com) and create account
2. Go to Dashboard and copy:
   - Cloud name
   - API Key
   - API Secret

## Step 3: Update Environment Variables

Replace values in `.env` file:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Test Locally

```bash
node server-cloud.js
```

## Step 6: Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Add environment variables in Vercel dashboard
4. Update `vercel.json` to use `server-cloud.js`

## Free Tier Limits:
- Supabase: 500MB database, 2GB bandwidth
- Cloudinary: 25GB storage, 25GB bandwidth
- Vercel: 100GB bandwidth
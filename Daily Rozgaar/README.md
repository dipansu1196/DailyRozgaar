# Daily Rozgaar - Worker-Customer Matching Platform

A web application that connects customers with local workers (laborers, electricians, plumbers, painters, carpenters, etc.) in their area.

## Features

### For Customers:
- Register with profile image and location details
- Browse workers by category in their area
- Send service requests to workers
- View worker profiles and contact information
- Track request status (pending/accepted)
- Update profile information

### For Workers:
- Register with profile image, Aadhaar card, and skills
- Receive service requests from customers
- Accept or reject requests
- Contact customers directly
- Update profile information
- Auto-generated password based on Aadhaar and DOB

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Cloudinary
- **Frontend**: HTML, CSS, JavaScript, Bootstrap
- **Deployment**: Vercel

## Setup Instructions

### 1. Prerequisites
- Node.js (v14 or higher)
- Supabase account
- Cloudinary account

### 2. Environment Setup
1. Copy `.env.example` to `.env`
2. Update the following variables in `.env`:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

SESSION_SECRET=your_session_secret
```

### 3. Database Setup
1. Go to your Supabase project
2. Navigate to SQL Editor
3. Run the schema from `database/schema.sql`

### 4. Installation
```bash
npm install
```

### 5. Running the Application

#### Development:
```bash
npm run dev
```

#### Production:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Deployment

### Vercel Deployment
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Add environment variables in Vercel dashboard
4. The app will be deployed using `server-cloud.js`

## Project Structure

```
├── config/
│   ├── database.js      # Supabase configuration
│   └── cloudinary.js    # Cloudinary configuration
├── database/
│   └── schema.sql       # Database schema
├── public/
│   ├── image/          # Static images
│   ├── *.css           # Stylesheets
│   └── *.js            # Client-side JavaScript
├── *.html              # HTML pages
├── server.js           # Local development server
├── server-cloud.js     # Production server (Vercel)
├── package.json        # Dependencies
├── vercel.json         # Vercel configuration
└── .env                # Environment variables
```

## API Endpoints

### Authentication
- `POST /customerloginaction` - Customer login
- `POST /workerloginaction` - Worker login
- `GET /logout` - Logout

### Registration
- `POST /register` - Worker registration
- `POST /register-customer` - Customer registration

### Profiles
- `GET /customerprofile` - Get customer profile
- `GET /workerprofile` - Get worker profile
- `POST /updateDetails` - Update customer profile
- `POST /updateWorkerDetails` - Update worker profile

### Services
- `GET /profiles` - Get workers by category and location
- `GET /worker/:id` - Get specific worker details
- `POST /sendRequests/:workerId` - Send service request
- `POST /cancelRequests/:workerId` - Cancel service request
- `GET /checkRequestStatus/:workerId` - Check request status

### Worker Requests
- `GET /workerrequests` - Get requests for worker
- `POST /worker/request/accept` - Accept request
- `POST /worker/request/reject` - Reject request
- `POST /worker/request/delete` - Delete completed request

## Features

### Multi-language Support
- English and Hindi language support
- Dynamic language switching

### Location-based Matching
- PIN code-based location detection
- Automatic city/state population
- Workers matched by ZIP code

### Image Management
- Profile image upload (500KB limit)
- Aadhaar card image upload for workers
- Cloudinary integration for image storage

### Security Features
- Session-based authentication
- Input validation
- File size restrictions
- SQL injection protection via Supabase

## Free Tier Limits
- **Supabase**: 500MB database, 2GB bandwidth
- **Cloudinary**: 25GB storage, 25GB bandwidth  
- **Vercel**: 100GB bandwidth

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.
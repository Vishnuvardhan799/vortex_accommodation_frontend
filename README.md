# Vortex 2026 Accommodation System - Frontend

React + TypeScript frontend for the Vortex 2026 Accommodation & Registration Check System.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling
- **Axios** - HTTP client
- **Headless UI** - Accessible UI components
- **Vitest** - Testing framework
- **React Testing Library** - Component testing
- **fast-check** - Property-based testing

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

#### Environment Variables

| Variable              | Description                                   | Required | Default               |
| --------------------- | --------------------------------------------- | -------- | --------------------- |
| `VITE_API_URL`        | Backend API URL                               | Yes      | http://localhost:8000 |
| `VITE_API_SECRET_KEY` | API authentication token (must match backend) | Yes      | -                     |

**Important Notes:**

- All environment variables must be prefixed with `VITE_` to be exposed to the application
- The `VITE_API_SECRET_KEY` must match the `API_SECRET_KEY` configured in the backend
- For production deployment, update `VITE_API_URL` to your backend domain
- Never commit the `.env` file to version control (it's in `.gitignore`)
- Use strong, randomly generated keys for production environments

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at http://localhost:5173

### Building for Production

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

### Testing

Run all tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run tests with UI:

```bash
npm run test:ui
```

Generate coverage report:

```bash
npm run test:coverage
```

## Project Structure

```
src/
├── components/          # React components
│   ├── SearchComponent.tsx
│   ├── ResultsDisplay.tsx
│   ├── AccommodationForm.tsx
│   ├── DuplicateWarningModal.tsx
│   └── ErrorDisplay.tsx
├── services/           # API client and services
│   └── api.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   └── validation.ts
├── test/               # Test setup
│   └── setup.ts
├── App.tsx             # Main app component
├── main.tsx            # App entry point
└── index.css           # Global styles
```

## Features

- **Participant Search** - Search by email with real-time validation
- **Results Display** - View registration and accommodation details
- **Accommodation Form** - Add new accommodation entries
- **Duplicate Detection** - Warning modal for duplicate entries
- **Error Handling** - Comprehensive error display with field-specific messages
- **Responsive Design** - Mobile-friendly interface

## Performance Optimizations

- Code splitting with lazy loading
- React.memo for component memoization
- Debounced search input
- Optimized bundle with tree-shaking
- TailwindCSS purging for minimal CSS

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Deployment

### Vercel Deployment (Recommended)

1. **Install Vercel CLI** (optional):

```bash
npm i -g vercel
```

2. **Deploy via GitHub** (recommended):
   - Push your code to GitHub
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository
   - Vercel will automatically detect the Vite configuration
   - Set environment variables in Vercel dashboard:
     - `VITE_API_URL` - Your backend API URL
     - `VITE_API_SECRET_KEY` - Your API secret key
   - Deploy!

3. **Deploy via CLI**:

```bash
cd frontend
vercel
```

Follow the prompts and set environment variables when asked.

**Vercel Features:**

- Automatic HTTPS
- Global CDN
- Automatic deployments on git push
- Preview deployments for pull requests
- Zero configuration needed (uses `vercel.json`)

### Netlify Deployment

1. **Deploy via GitHub** (recommended):
   - Push your code to GitHub
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your repository
   - Netlify will automatically detect the configuration from `netlify.toml`
   - Set environment variables in Netlify dashboard:
     - `VITE_API_URL` - Your backend API URL
     - `VITE_API_SECRET_KEY` - Your API secret key
   - Deploy!

2. **Deploy via CLI**:

```bash
npm i -g netlify-cli
cd frontend
netlify deploy --prod
```

**Netlify Features:**

- Automatic HTTPS
- Global CDN
- Continuous deployment
- Deploy previews
- Form handling and serverless functions

### Manual Build and Deploy

Build the production bundle:

```bash
npm run build
```

The `dist/` directory will contain the optimized production build. You can deploy this to any static hosting service:

- AWS S3 + CloudFront
- Google Cloud Storage
- Azure Static Web Apps
- GitHub Pages
- Any web server (nginx, Apache, etc.)

**Important:** Ensure your web server is configured to:

1. Serve `index.html` for all routes (SPA routing)
2. Set appropriate cache headers for static assets
3. Enable gzip/brotli compression
4. Serve over HTTPS

### Environment Variables for Production

Set these in your deployment platform:

- `VITE_API_URL` - Your backend API URL (e.g., `https://api.vortex2026.com`)
- `VITE_API_SECRET_KEY` - Must match the backend `API_SECRET_KEY`

**Security Note:** Never commit `.env` files with real credentials to version control!

### Post-Deployment Checklist

- [ ] Verify the app loads correctly
- [ ] Test search functionality
- [ ] Test accommodation form submission
- [ ] Verify API calls are working (check browser console)
- [ ] Test on mobile devices
- [ ] Verify HTTPS is enabled
- [ ] Check that environment variables are set correctly
- [ ] Test error handling (try invalid inputs)
- [ ] Verify CORS is configured correctly on backend
# vortex_accommodation_frontend

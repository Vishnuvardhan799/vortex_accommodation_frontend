# Vortex 2026 Accommodation System - Frontend

React + TypeScript frontend for the Vortex 2026 Accommodation & Registration Check System.

A responsive, mobile-friendly web application for event volunteers to manage participant check-in, accommodation assignments, and event registrations during Vortex 2026 (March 6-8, NIT Trichy).

## Features

- Fast participant search by email with real-time validation
- View registration details and accommodation status
- Add accommodation entries with duplicate detection
- Register participants for events and workshops
- Comprehensive error handling with field-specific messages
- Mobile-responsive design with TailwindCSS
- Section-based navigation (Search, Accommodation, Events)
- Lazy loading for optimal performance

## Tech Stack

- **React 18** - UI library with hooks
- **TypeScript** - Type safety and better DX
- **Vite** - Lightning-fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client with interceptors
- **Headless UI** - Accessible UI components
- **Vitest** - Fast unit testing framework
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
├── components/                      # React components
│   ├── Navbar.tsx                   # Navigation component
│   ├── SearchComponent.tsx          # Participant search
│   ├── ResultsDisplay.tsx           # Search results display
│   ├── AccommodationForm.tsx        # Accommodation entry form
│   ├── DuplicateWarningModal.tsx    # Duplicate confirmation modal
│   ├── EventRegistrationForm.tsx    # Event/workshop registration
│   ├── ErrorDisplay.tsx             # Error message display
│   └── *.test.tsx                   # Component tests
├── services/                        # API client and services
│   ├── api.ts                       # Axios client with interceptors
│   └── api.test.ts                  # API service tests
├── types/                           # TypeScript type definitions
│   └── index.ts                     # Shared types and interfaces
├── utils/                           # Utility functions
│   └── validation.ts                # Input validation helpers
├── test/                            # Test setup
│   └── setup.ts                     # Vitest configuration
├── App.tsx                          # Main app component with state
├── main.tsx                         # App entry point
└── index.css                        # Global styles (TailwindCSS)
```

## Application Sections

The app uses section-based navigation:

1. **Search Section** (Landing page)
   - Search participants by email
   - View registration and accommodation details
   - Quick access to add accommodation

2. **Accommodation Section**
   - Add new accommodation entries
   - Duplicate detection and confirmation
   - Form validation with error messages

3. **Events & Workshops Section**
   - Register participants for events
   - Register participants for workshops
   - Real-time validation

## Performance Optimizations

- Code splitting with lazy loading (AccommodationForm, DuplicateWarningModal)
- React.memo for component memoization
- Optimized bundle with tree-shaking
- TailwindCSS purging for minimal CSS
- Vite's fast HMR for development

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development Tips

### Hot Module Replacement (HMR)

Vite provides instant HMR. Changes to components will reflect immediately without full page reload.

### TypeScript Strict Mode

The project uses strict TypeScript configuration. Ensure all types are properly defined.

### Component Testing

Each component has a corresponding `.test.tsx` file. Run tests in watch mode during development:

```bash
npm run test:watch
```

### Styling with TailwindCSS

Use Tailwind utility classes. Avoid custom CSS unless absolutely necessary. Check `tailwind.config.js` for theme customization.

### API Integration

All API calls go through `src/services/api.ts`. The Axios client includes:

- Automatic API key injection
- Request/response interceptors
- Error handling
- Base URL configuration

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
- [ ] Test search functionality with valid email
- [ ] Test accommodation form submission
- [ ] Test event registration form
- [ ] Verify API calls are working (check browser console)
- [ ] Test on mobile devices (iOS and Android)
- [ ] Verify HTTPS is enabled
- [ ] Check that environment variables are set correctly
- [ ] Test error handling (try invalid inputs)
- [ ] Verify CORS is configured correctly on backend
- [ ] Test duplicate detection workflow
- [ ] Verify navigation between sections works
- [ ] Check loading states and error messages

## Troubleshooting

### Common Issues

1. **API connection errors**
   - Verify `VITE_API_URL` is correct in `.env`
   - Check that backend is running
   - Verify `VITE_API_SECRET_KEY` matches backend

2. **CORS errors**
   - Ensure frontend URL is in backend's `ALLOWED_ORIGINS`
   - Check browser console for specific CORS error

3. **Build errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Clear Vite cache: `rm -rf node_modules/.vite`
   - Check TypeScript errors: `npx tsc --noEmit`

4. **Environment variables not working**
   - Ensure variables are prefixed with `VITE_`
   - Restart dev server after changing `.env`
   - For production, set variables in deployment platform

5. **Styling issues**
   - Run `npm run build` to check for TailwindCSS purge issues
   - Verify class names are not dynamically generated

## Contributing

This is an internal project for Vortex 2026. For questions or issues, contact the development team.

## License

Internal use only - Vortex 2026 Event

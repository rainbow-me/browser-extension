# Sentry Setup for Chrome Extension

This document describes the complete Sentry setup for the Rainbow Chrome extension, including error reporting and sourcemap uploads across all extension contexts.

## Overview

Sentry is configured to monitor errors across all extension entry points:

- **Background**: Service worker handling extension lifecycle
- **Popup**: Main extension UI  
- **Content**: Content script injected into web pages
- **Inpage**: Provider script injected into page context
- **Iframe**: Notification iframe for in-page notifications

## Environment Variables

Add these environment variables to your `.env` file:

```bash
# Sentry Configuration
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ORG=your-org-name
SENTRY_PROJECT=your-project-name
SENTRY_AUTH_TOKEN=your-auth-token

# Optional: Override environment detection (defaults to auto-detection)
SENTRY_ENVIRONMENT=development
```

### Environment Detection

The system uses the `SENTRY_ENVIRONMENT` variable to determine deployment environment:

- **Production**: Set by GitHub workflow when building from `master` branch
- **Development**: Set by GitHub workflow for all other builds (PRs, feature branches)
- **Local**: Defaults to `development` if not set

The environment is configured in `.github/workflows/build.yml`:
```yaml
env:
  SENTRY_ENVIRONMENT: ${{ github.ref == 'refs/heads/master' && 'production' || 'development' }}
```

This ensures production sourcemaps are only uploaded for master branch CI builds, while development builds are properly tagged for testing.

### Getting Sentry Configuration Values

1. **DSN**: Found in your Sentry project settings under "Client Keys (DSN)"
2. **ORG**: Your Sentry organization slug
3. **PROJECT**: Your Sentry project slug  
4. **AUTH_TOKEN**: Generate from User Settings → Auth Tokens with `project:write` scope

## Sourcemap Upload

Sourcemaps are automatically uploaded during production builds when all Sentry environment variables are configured. The upload happens via the `@sentry/webpack-plugin` integrated into the build process.

### Build Configuration

The webpack configuration includes:

```javascript
sentryWebpackPlugin({
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  release: {
    name: require('../package.json').version,
  },
  sourcemaps: {
    assets: ['./build/**/*.js', './build/**/*.js.map'],
    ignore: ['node_modules/**'],
  },
  telemetry: false,
})
```

## Error Reporting

### Ignored Errors

Common extension-specific errors are filtered out:

- "Duplicate script ID"
- "Could not establish connection"
- "The message port closed"
- "The browser is shutting down"

### Context Tagging

Each entry point is tagged with its context for easier debugging:

- `context: 'background'`
- `context: 'popup'`
- `context: 'content'`
- `context: 'inpage'`
- `context: 'iframe'`

### User Context

The extension sets user context including:
- Device ID
- Wallet address hash (hashed for privacy)
- Wallet type (owned/hardware/watched)
- Extension context information

## Testing

### Manual Testing

1. **Build with Sentry**: `yarn build` (ensures sourcemaps are generated)
2. **Load extension**: Load the built extension in Chrome
3. **Trigger errors**: Cause deliberate errors in different contexts
4. **Check Sentry**: Verify errors appear in Sentry dashboard with proper context

### Sourcemap Verification

To verify sourcemaps are working:

1. Check that errors show original TypeScript line numbers
2. Verify stack traces point to source files, not minified bundles
3. Confirm function names are preserved in stack traces

## Build Process

The build process includes two stages:

1. **Main Build**: Builds background, content, and inpage scripts
2. **UI Build**: Builds popup with chunk splitting
3. **Sourcemap Upload**: Uploads sourcemaps to Sentry (production only)

## Development vs Production

- **Development**: Sentry is disabled (`IS_DEV=true`)
- **Testing**: Sentry is disabled (`IS_TESTING=true`)
- **Production**: Sentry is enabled with full error reporting and sourcemap uploads

### Environment-Based Deployment

The build system uses the `SENTRY_ENVIRONMENT` variable to determine deployment context:

- **Production Environment**: 
  - Set by GitHub workflow for master branch builds
  - Sourcemaps uploaded with `production` environment tag
  - Full error reporting enabled
  
- **Development Environment**:
  - Set by GitHub workflow for PR and feature branch builds
  - Local builds default to `development` environment
  - Sourcemaps uploaded with `development` environment tag
  - Useful for testing and development debugging

This separation allows you to:
- Keep production and development errors separate in Sentry
- Test sourcemap functionality in development without cluttering production data
- Maintain proper release tracking for actual production deployments
- Simplify environment detection logic by using workflow-level configuration

## File Structure

```
src/
├── core/
│   └── sentry/
│       └── index.ts          # Sentry initialization and configuration
├── entries/
│   ├── background/
│   │   └── index.ts          # initializeSentry('background')
│   ├── popup/
│   │   └── App.tsx           # initializeSentry('popup')
│   ├── content/
│   │   └── index.ts          # initializeSentry('content')
│   ├── inpage/
│   │   └── index.ts          # initializeSentry('inpage')
│   └── iframe/
│       └── index.ts          # initializeSentry('iframe')
└── ...
```

## Troubleshooting

### Sourcemaps Not Uploading

1. Verify all environment variables are set
2. Check that `@sentry/webpack-plugin` is installed
3. Ensure build is running in production mode
4. Verify auth token has correct permissions

### Errors Not Appearing

1. Check that DSN is correct
2. Verify error isn't in ignored list
3. Ensure context is properly initialized
4. Check browser console for Sentry initialization errors

### Missing Context Tags

1. Verify `initializeSentry()` is called with correct context
2. Check that context is passed to Sentry initialization
3. Ensure imports are correct in entry point files

## Maintenance

- Update ignored errors list as needed
- Monitor Sentry quota usage
- Rotate auth tokens periodically
- Review and update sampling rates based on volume
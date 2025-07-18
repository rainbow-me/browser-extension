# Sentry Testing Guide

This guide provides comprehensive testing procedures for verifying that Sentry error reporting and sourcemap uploads work correctly across all extension contexts.

## Prerequisites

1. **Environment Variables**: Ensure these are set in your `.env` file:
   ```bash
   SENTRY_DSN=https://your-dsn@sentry.io/project-id
   SENTRY_ORG=your-org-name
   SENTRY_PROJECT=your-project-name
   SENTRY_AUTH_TOKEN=your-auth-token
   ```

2. **Production Build**: Sentry only works in production builds
   ```bash
   yarn build
   ```

3. **Load Extension**: Load the built extension in Chrome

## Manual Testing Methods

### Method 1: Browser Console Commands

After loading the extension, you can test each context using browser console commands:

#### Background Context Test
1. Open Chrome DevTools → Background Page (chrome://extensions → Developer mode → Background page)
2. Run in console:
   ```javascript
   // Test basic error reporting
   import('chrome-extension://your-extension-id/background.js').then(() => {
     // This will trigger test functions if available
   });
   
   // Or manually trigger an error
   throw new Error('Test background error');
   ```

#### Popup Context Test
1. Open extension popup
2. Open DevTools for popup (F12)
3. Run in console:
   ```javascript
   // Test popup error
   throw new Error('Test popup error');
   
   // Test with context
   if (window.Sentry) {
     window.Sentry.captureException(new Error('Test popup error with context'));
   }
   ```

#### Content Script Context Test
1. Open any webpage
2. Open DevTools (F12)
3. Run in console:
   ```javascript
   // This will test the content script context
   window.dispatchEvent(new CustomEvent('test-sentry-content'));
   ```

#### Inpage Context Test
1. Open any webpage
2. Open DevTools (F12)
3. Run in console:
   ```javascript
   // Test inpage provider errors
   if (window.ethereum) {
     window.ethereum.request({ method: 'invalid_method' });
   }
   ```

### Method 2: Automatic Test Integration

For automated testing, you can temporarily add test calls to entry points:

#### Background (src/entries/background/index.ts)
```typescript
// Add after initializeSentry('background');
if (process.env.NODE_ENV === 'production') {
  setTimeout(() => {
    import('~/core/sentry/test').then(({ runSentryTests }) => {
      runSentryTests('background');
    });
  }, 5000);
}
```

#### Popup (src/entries/popup/App.tsx)
```typescript
// Add in useEffect
useEffect(() => {
  if (process.env.NODE_ENV === 'production') {
    import('~/core/sentry/test').then(({ runSentryTests }) => {
      runSentryTests('popup');
    });
  }
}, []);
```

#### Content (src/entries/content/index.ts)
```typescript
// Add after initializeSentry('content');
if (process.env.NODE_ENV === 'production') {
  setTimeout(() => {
    import('~/core/sentry/test').then(({ runSentryTests }) => {
      runSentryTests('content');
    });
  }, 2000);
}
```

#### Inpage (src/entries/inpage/index.ts)
```typescript
// Add after initializeSentry('inpage');
if (process.env.NODE_ENV === 'production') {
  setTimeout(() => {
    import('~/core/sentry/test').then(({ runSentryTests }) => {
      runSentryTests('inpage');
    });
  }, 3000);
}
```

## Verification Checklist

### 1. Sourcemap Upload Verification
- [ ] Build completes without errors
- [ ] Check build logs for "Sourcemap upload successful" messages
- [ ] Verify in Sentry dashboard that sourcemaps are uploaded for the current release

### 2. Error Reporting Verification
For each context (background, popup, content, inpage):
- [ ] Errors appear in Sentry dashboard
- [ ] Context tag is correctly set (`context: 'background'`, etc.)
- [ ] Stack traces show TypeScript file names (not minified)
- [ ] Line numbers point to source code (not minified)
- [ ] Function names are preserved

### 3. Context-Specific Features
- [ ] **Background**: Service worker errors are captured
- [ ] **Popup**: UI errors and React errors are captured
- [ ] **Content**: Page interaction errors are captured
- [ ] **Inpage**: Provider/Web3 errors are captured

### 4. Additional Context
- [ ] User context is set correctly
- [ ] Breadcrumbs are attached to errors
- [ ] Custom context data is included
- [ ] Ignored errors are properly filtered

## Common Issues and Solutions

### Sourcemaps Not Uploading
1. **Check environment variables** - All Sentry env vars must be set
2. **Verify auth token permissions** - Token needs `project:write` scope
3. **Check build configuration** - Ensure `sentryWebpackPlugin` is in both webpack configs
4. **Review build logs** - Look for upload success/failure messages

### Errors Not Appearing
1. **Verify DSN** - Check if DSN is correct and accessible
2. **Check environment** - Sentry is disabled in dev/test environments
3. **Review ignored errors** - Error might be in the ignore list
4. **Check browser console** - Look for Sentry initialization errors

### Stack Traces Show Minified Code
1. **Verify sourcemap upload** - Check if sourcemaps were uploaded successfully
2. **Check release matching** - Ensure release version matches between upload and runtime
3. **Verify sourcemap paths** - Check if sourcemap paths are correct in build

### Missing Context Tags
1. **Check initialization** - Ensure `initializeSentry()` is called with correct context
2. **Verify imports** - Check if sentry module is properly imported
3. **Review scope setting** - Ensure context tags are set in initial scope

## Testing Workflow

1. **Set up environment** - Configure Sentry environment variables
2. **Build extension** - Run production build with sourcemap upload
3. **Load extension** - Install built extension in Chrome
4. **Test each context** - Run tests for all four contexts
5. **Verify in Sentry** - Check dashboard for errors and sourcemaps
6. **Clean up** - Remove test code before committing

## Automated Testing

For CI/CD integration, consider:
- Automated sourcemap upload verification
- Sentry API checks for successful uploads
- Integration tests that verify error reporting
- Release tagging automation

Remember to remove any test code before committing to production!
import { startPortalHost } from './handlePortalHost';

// This handler needs to stay, as it's triggered from the shared @rainbow/provider package
// The prefetchDappMetadata is now handled via the portal host's eth_request method
// which routes to the appropriate handler based on the method name
export const handlePrefetchDappMetadata = () => {
  // The portal host already handles this via the eth_request handler
  // when method is 'prefetchDappMetadata'
  // This function just ensures the portal host is initialized
  startPortalHost();
};

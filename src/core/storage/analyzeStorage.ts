
interface QueryState {
  data: unknown;
  dataUpdatedAt?: number;
}

interface QueryInfo {
  queryKey: string | object[];
  state?: QueryState;
}

interface ReactQueryStore {
  clientState: {
    queries: QueryInfo[];
  };
}

async function analyzeLocalStorage() {
  const items = await chrome.storage.local.get(null);
  const output = ['[LocalStorage Analysis]\n'];

  Object.entries(items).forEach(([key, value]) => {
    const size = new TextEncoder().encode(JSON.stringify(value)).length;
    output.push(`${key}, ${(size / 1024).toFixed(2)} KB`);
  });

  console.log(output.join('\n'));
}

async function analyzeReactQueryStore() {
  const output = ['[React Query Store Analysis]\n'];

  const key = 'rainbow.react-query';
  output.push(`Analyzing key: ${key}`);

  const store = await chrome.storage.local.get([key]);
  const outerValue = store[key];
  if (!outerValue) return;

  try {
    const { clientState } = JSON.parse(outerValue) as ReactQueryStore;

    if (!clientState?.queries) {
      output.push('No queries found in clientState');
      return;
    }

    const queries = clientState.queries;
    output.push(`Found ${queries.length} queries`);

    const querySizes = queries.map((query: QueryInfo) => {
      const dataString = JSON.stringify(query.state?.data || {});
      return {
        size: dataString.length,
        queryKey: query.queryKey,
        lastUpdated: query.state?.dataUpdatedAt,
        // Get the first part of the queryKey as the type
        type: (() => {
          if (!Array.isArray(query.queryKey)) {
            return 'unknown';
          }
          if (typeof query.queryKey[0] === 'object') {
            return Object.keys(query.queryKey[0]).join(',');
          }
          return query.queryKey[0];
        })(),
      };
    });

    // Sort by size
    querySizes.sort((a, b) => b.size - a.size);

    // Log top 10 largest queries
    output.push('\nTop 10 Largest Queries:');
    querySizes.slice(0, 10).forEach((query, index) => {
      output.push(`\n#${index + 1}:`);
      output.push(`Type: ${query.type}`);
      output.push(`Size: ${(query.size / 1024).toFixed(2)} KB`);
      output.push(`Query Key: ${JSON.stringify(query.queryKey)}`);
      if (query.lastUpdated) {
        output.push(
          `Last Updated: ${new Date(query.lastUpdated).toISOString()}`,
        );
      }
    });

    // Calculate size distribution
    const totalSize = querySizes.reduce((sum, q) => sum + q.size, 0);
    output.push(`\nTotal Size: ${(totalSize / 1024).toFixed(2)} KB`);

    // Group by type
    const sizeByType = querySizes.reduce(
      (acc: Record<string, number>, query) => {
        acc[query.type] = (acc[query.type] || 0) + query.size;
        return acc;
      },
      {},
    );

    output.push('\nSize by Query Type:');
    Object.entries(sizeByType)
      .sort(([, a], [, b]) => b - a)
      .forEach(([type, size]) => {
        output.push(`${type}: ${(size / 1024).toFixed(2)} KB`);
      });

    // Size ranges distribution
    const ranges = {
      '1MB+': 0,
      '500KB-1MB': 0,
      '100KB-500KB': 0,
      '10KB-100KB': 0,
      '<10KB': 0,
    };

    querySizes.forEach((q) => {
      const sizeKB = q.size / 1024;
      if (sizeKB >= 1024) ranges['1MB+'] += 1;
      else if (sizeKB >= 500) ranges['500KB-1MB'] += 1;
      else if (sizeKB >= 100) ranges['100KB-500KB'] += 1;
      else if (sizeKB >= 10) ranges['10KB-100KB'] += 1;
      else ranges['<10KB'] += 1;
    });

    output.push('\nQuery Size Distribution:');
    Object.entries(ranges).forEach(([range, count]) => {
      output.push(`${range}: ${count} queries`);
    });
    console.log(output.join('\n'));
  } catch (error) {
    console.log('Error analyzing queries:', error);
  }
}

const IS_DEV = process.env.IS_DEV === 'true';

export async function analyzeStorage() {
  if (IS_DEV) {
    await analyzeLocalStorage();
    await analyzeReactQueryStore();
  }
}

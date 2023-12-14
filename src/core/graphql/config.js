exports.config = {
  ens: {
    schema: {
      url: 'https://api.thegraph.com/subgraphs/name/ensdomains/ens',
      method: 'POST',
    },
    document: './queries/ens.graphql',
  },
  metadata: {
    document: './queries/metadata.graphql',
    schema: { method: 'GET', url: 'https://metadata.p.rainbow.me/v1/graph' },
  },
};

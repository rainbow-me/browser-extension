exports.config = {
  ens: {
    schema: {
      url: 'https://api.thegraph.com/subgraphs/name/ensdomains/ens',
      method: 'POST',
    },
    document: './queries/ens.graphql',
  },
  metadata: {
    schema: {
      method: 'GET',
      url: 'https://metadata.p.rainbow.me/v1/graph',
    },
    document: './queries/metadata.graphql',
  },
  metadataStaging: {
    schema: {
      method: 'GET',
      url: 'https://metadata.s.rainbow.me/v1/graph',
    },
    document: './queries/metadataStaging.graphql',
  },
};

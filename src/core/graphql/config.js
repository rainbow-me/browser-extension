exports.config = {
  ens: {
    schema: {
      url: `https://gateway-arbitrum.network.thegraph.com/api/${process.env.GRAPH_ENS_API_KEY}/subgraphs/id/5XqPmWe6gjyrJtFn9cLy237i4cWw2j9HcUJEXsP5qGtH`,
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
};

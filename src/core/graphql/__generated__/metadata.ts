import { DocumentNode } from 'graphql';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Any: any;
  Time: any;
  TokenNetworks: any;
};

export enum CacheControlScope {
  Private = 'PRIVATE',
  Public = 'PUBLIC'
}

export type Contract = {
  __typename?: 'Contract';
  address: Scalars['String'];
  chainID: Scalars['Int'];
  iconURL: Scalars['String'];
  name: Scalars['String'];
  type: Scalars['Int'];
};

export type ContractFunction = {
  __typename?: 'ContractFunction';
  address?: Maybe<Scalars['String']>;
  chainID: Scalars['Int'];
  hex: Scalars['String'];
  humanText: Scalars['String'];
  text: Scalars['String'];
};

export type DApp = {
  __typename?: 'DApp';
  colors: DAppColors;
  description: Scalars['String'];
  iconURL: Scalars['String'];
  name: Scalars['String'];
  shortName: Scalars['String'];
  status: DAppStatus;
  url: Scalars['String'];
};

export type DAppColors = {
  __typename?: 'DAppColors';
  fallback?: Maybe<Scalars['String']>;
  primary: Scalars['String'];
  shadow?: Maybe<Scalars['String']>;
};

export enum DAppStatus {
  Scam = 'SCAM',
  Unverified = 'UNVERIFIED',
  Verified = 'VERIFIED'
}

export type EnsMarquee = {
  __typename?: 'ENSMarquee';
  accounts?: Maybe<Array<EnsMarqueeAccount>>;
};

export type EnsMarqueeAccount = {
  __typename?: 'ENSMarqueeAccount';
  address: Scalars['String'];
  avatar: Scalars['String'];
  name: Scalars['String'];
};

export type EnsProfile = {
  __typename?: 'ENSProfile';
  address: Scalars['String'];
  chainID: Scalars['Int'];
  fields: Array<EnsProfileField>;
  name: Scalars['String'];
  resolverAddress: Scalars['String'];
  reverseResolverAddress: Scalars['String'];
};

export type EnsProfileField = {
  __typename?: 'ENSProfileField';
  key: Scalars['String'];
  value: Scalars['String'];
};

export type NftAllowlist = {
  __typename?: 'NFTAllowlist';
  addresses?: Maybe<Array<Scalars['String']>>;
  chainID: Scalars['Int'];
};

export type Query = {
  __typename?: 'Query';
  contract?: Maybe<Contract>;
  contractFunction?: Maybe<ContractFunction>;
  contracts?: Maybe<Array<Maybe<Contract>>>;
  dApp?: Maybe<DApp>;
  dApps?: Maybe<Array<Maybe<DApp>>>;
  ensMarquee?: Maybe<EnsMarquee>;
  nftAllowlist?: Maybe<NftAllowlist>;
  resolveENSProfile?: Maybe<EnsProfile>;
  reverseResolveENSProfile?: Maybe<EnsProfile>;
  rewards?: Maybe<Rewards>;
  token?: Maybe<Token>;
};


export type QueryContractArgs = {
  address: Scalars['String'];
  chainID: Scalars['Int'];
};


export type QueryContractFunctionArgs = {
  address?: InputMaybe<Scalars['String']>;
  chainID: Scalars['Int'];
  hex: Scalars['String'];
};


export type QueryDAppArgs = {
  shortName?: InputMaybe<Scalars['String']>;
  url?: InputMaybe<Scalars['String']>;
};


export type QueryNftAllowlistArgs = {
  chainID: Scalars['Int'];
};


export type QueryResolveEnsProfileArgs = {
  chainID: Scalars['Int'];
  fields?: InputMaybe<Array<Scalars['String']>>;
  name: Scalars['String'];
};


export type QueryReverseResolveEnsProfileArgs = {
  address: Scalars['String'];
  chainID: Scalars['Int'];
  fields?: InputMaybe<Array<Scalars['String']>>;
};


export type QueryRewardsArgs = {
  address?: InputMaybe<Scalars['String']>;
  project: RewardsProject;
};


export type QueryTokenArgs = {
  address: Scalars['String'];
  chainID: Scalars['Int'];
  currency?: InputMaybe<Scalars['String']>;
};

export type RewardStats = {
  __typename?: 'RewardStats';
  actions: Array<RewardStatsAction>;
  position: RewardsStatsPosition;
};

export type RewardStatsAction = {
  __typename?: 'RewardStatsAction';
  amount: RewardsAmount;
  rewardPercent: Scalars['Float'];
  type: RewardStatsActionType;
};

export enum RewardStatsActionType {
  Bridge = 'BRIDGE',
  Swap = 'SWAP'
}

export type Rewards = {
  __typename?: 'Rewards';
  earnings?: Maybe<RewardsEarnings>;
  leaderboard: RewardsLeaderboard;
  meta: RewardsMeta;
  stats?: Maybe<RewardStats>;
};

export type RewardsAmount = {
  __typename?: 'RewardsAmount';
  token: Scalars['Float'];
  usd: Scalars['Float'];
};

export type RewardsAsset = {
  __typename?: 'RewardsAsset';
  assetCode: Scalars['String'];
  chainID: Scalars['Int'];
  decimals: Scalars['Int'];
  iconURL?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  symbol: Scalars['String'];
};

export type RewardsEarnings = {
  __typename?: 'RewardsEarnings';
  multiplier: RewardsEarningsMultiplierMultiplier;
  pending: RewardsAmount;
  total: RewardsAmount;
  updatedAt: Scalars['Int'];
};

export type RewardsEarningsMultiplierBreakdown = {
  __typename?: 'RewardsEarningsMultiplierBreakdown';
  amount: Scalars['Float'];
  qualifier: Scalars['String'];
};

export type RewardsEarningsMultiplierMultiplier = {
  __typename?: 'RewardsEarningsMultiplierMultiplier';
  amount: Scalars['Float'];
  breakdown: Array<RewardsEarningsMultiplierBreakdown>;
};

export type RewardsLeaderboard = {
  __typename?: 'RewardsLeaderboard';
  accounts?: Maybe<Array<RewardsLeaderboardAccount>>;
  updatedAt: Scalars['Int'];
};

export type RewardsLeaderboardAccount = {
  __typename?: 'RewardsLeaderboardAccount';
  address: Scalars['String'];
  avatarURL?: Maybe<Scalars['String']>;
  earnings: RewardsLeaderboardEarnings;
  ens?: Maybe<Scalars['String']>;
};

export type RewardsLeaderboardEarnings = {
  __typename?: 'RewardsLeaderboardEarnings';
  base: RewardsAmount;
  bonus: RewardsAmount;
};

export type RewardsMeta = {
  __typename?: 'RewardsMeta';
  color: Scalars['String'];
  distribution: RewardsMetaDistribution;
  end: Scalars['Int'];
  status: RewardsMetaStatus;
  title: Scalars['String'];
  token: RewardsMetaToken;
};

export type RewardsMetaDistribution = {
  __typename?: 'RewardsMetaDistribution';
  left: Scalars['Float'];
  next: Scalars['Int'];
  total: Scalars['Float'];
};

export enum RewardsMetaStatus {
  Finished = 'FINISHED',
  Ongoing = 'ONGOING',
  Paused = 'PAUSED'
}

export type RewardsMetaToken = {
  __typename?: 'RewardsMetaToken';
  asset: RewardsAsset;
};

export enum RewardsProject {
  Optimism = 'OPTIMISM'
}

export type RewardsStatsPosition = {
  __typename?: 'RewardsStatsPosition';
  change: RewardsStatsPositionChange;
  current: Scalars['Int'];
};

export type RewardsStatsPositionChange = {
  __typename?: 'RewardsStatsPositionChange';
  h24?: Maybe<Scalars['Int']>;
};

export type Token = {
  __typename?: 'Token';
  allTime: TokenAllTime;
  circulatingSupply?: Maybe<Scalars['Float']>;
  colors: TokenColors;
  decimals: Scalars['Int'];
  description?: Maybe<Scalars['String']>;
  fullyDilutedValuation?: Maybe<Scalars['Float']>;
  iconUrl?: Maybe<Scalars['String']>;
  links?: Maybe<TokenLinks>;
  marketCap?: Maybe<Scalars['Float']>;
  name: Scalars['String'];
  networks: Scalars['TokenNetworks'];
  price: TokenPrice;
  priceCharts: TokenPriceCharts;
  symbol: Scalars['String'];
  totalSupply?: Maybe<Scalars['Float']>;
  volume1d?: Maybe<Scalars['Float']>;
};

export type TokenAllTime = {
  __typename?: 'TokenAllTime';
  highDate?: Maybe<Scalars['Time']>;
  highValue?: Maybe<Scalars['Float']>;
  lowDate?: Maybe<Scalars['Time']>;
  lowValue?: Maybe<Scalars['Float']>;
};

export type TokenColors = {
  __typename?: 'TokenColors';
  fallback?: Maybe<Scalars['String']>;
  primary: Scalars['String'];
  shadow?: Maybe<Scalars['String']>;
};

export type TokenLink = {
  __typename?: 'TokenLink';
  url: Scalars['String'];
};

export type TokenLinks = {
  __typename?: 'TokenLinks';
  facebook?: Maybe<TokenLink>;
  homepage?: Maybe<TokenLink>;
  reddit?: Maybe<TokenLink>;
  telegram?: Maybe<TokenLink>;
  twitter?: Maybe<TokenLink>;
};

export type TokenPrice = {
  __typename?: 'TokenPrice';
  relativeChange24h?: Maybe<Scalars['Float']>;
  value?: Maybe<Scalars['Float']>;
};

export type TokenPriceChart = {
  __typename?: 'TokenPriceChart';
  aggregates?: Maybe<TokenPriceChartAggregates>;
  /**
   * points is an array of [Int, Float] pairs
   *     where the first element is the timestamp and the second is the price
   */
  points?: Maybe<Array<Maybe<Array<Maybe<Scalars['Any']>>>>>;
  timeEnd?: Maybe<Scalars['Time']>;
  timeStart?: Maybe<Scalars['Time']>;
};

export type TokenPriceChartAggregates = {
  __typename?: 'TokenPriceChartAggregates';
  avg?: Maybe<Scalars['Float']>;
  first?: Maybe<Scalars['Float']>;
  last?: Maybe<Scalars['Float']>;
  max?: Maybe<Scalars['Float']>;
  min?: Maybe<Scalars['Float']>;
};

export type TokenPriceCharts = {
  __typename?: 'TokenPriceCharts';
  day?: Maybe<TokenPriceChart>;
  hour?: Maybe<TokenPriceChart>;
  max?: Maybe<TokenPriceChart>;
  month?: Maybe<TokenPriceChart>;
  week?: Maybe<TokenPriceChart>;
  year?: Maybe<TokenPriceChart>;
};

export type GetContractFunctionQueryVariables = Exact<{
  chainID: Scalars['Int'];
  hex: Scalars['String'];
  address: Scalars['String'];
}>;


export type GetContractFunctionQuery = { __typename?: 'Query', contractFunction?: { __typename?: 'ContractFunction', text: string } | null };

export type ResolveEnsProfileQueryVariables = Exact<{
  chainId: Scalars['Int'];
  name: Scalars['String'];
  fields?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
}>;


export type ResolveEnsProfileQuery = { __typename?: 'Query', resolveENSProfile?: { __typename?: 'ENSProfile', address: string, resolverAddress: string, reverseResolverAddress: string, fields: Array<{ __typename?: 'ENSProfileField', key: string, value: string }> } | null };

export type ReverseResolveEnsProfileQueryVariables = Exact<{
  chainId: Scalars['Int'];
  address: Scalars['String'];
  fields?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
}>;


export type ReverseResolveEnsProfileQuery = { __typename?: 'Query', reverseResolveENSProfile?: { __typename?: 'ENSProfile', name: string, resolverAddress: string, reverseResolverAddress: string, fields: Array<{ __typename?: 'ENSProfileField', key: string, value: string }> } | null };


export const GetContractFunctionDocument = gql`
    query getContractFunction($chainID: Int!, $hex: String!, $address: String!) {
  contractFunction(chainID: $chainID, hex: $hex, address: $address) {
    text
  }
}
    `;
export const ResolveEnsProfileDocument = gql`
    query resolveENSProfile($chainId: Int!, $name: String!, $fields: [String!]) {
  resolveENSProfile(chainID: $chainId, name: $name, fields: $fields) {
    address
    resolverAddress
    reverseResolverAddress
    fields {
      key
      value
    }
  }
}
    `;
export const ReverseResolveEnsProfileDocument = gql`
    query reverseResolveENSProfile($chainId: Int!, $address: String!, $fields: [String!]) {
  reverseResolveENSProfile(chainID: $chainId, address: $address, fields: $fields) {
    name
    resolverAddress
    reverseResolverAddress
    fields {
      key
      value
    }
  }
}
    `;
export type Requester<C = {}, E = unknown> = <R, V>(doc: DocumentNode, vars?: V, options?: C) => Promise<R> | AsyncIterable<R>
export function getSdk<C, E>(requester: Requester<C, E>) {
  return {
    getContractFunction(variables: GetContractFunctionQueryVariables, options?: C): Promise<GetContractFunctionQuery> {
      return requester<GetContractFunctionQuery, GetContractFunctionQueryVariables>(GetContractFunctionDocument, variables, options) as Promise<GetContractFunctionQuery>;
    },
    resolveENSProfile(variables: ResolveEnsProfileQueryVariables, options?: C): Promise<ResolveEnsProfileQuery> {
      return requester<ResolveEnsProfileQuery, ResolveEnsProfileQueryVariables>(ResolveEnsProfileDocument, variables, options) as Promise<ResolveEnsProfileQuery>;
    },
    reverseResolveENSProfile(variables: ReverseResolveEnsProfileQueryVariables, options?: C): Promise<ReverseResolveEnsProfileQuery> {
      return requester<ReverseResolveEnsProfileQuery, ReverseResolveEnsProfileQueryVariables>(ReverseResolveEnsProfileDocument, variables, options) as Promise<ReverseResolveEnsProfileQuery>;
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;
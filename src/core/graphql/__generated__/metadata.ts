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
  TokenBridging: any;
  TokenNetworks: any;
};

export enum CacheControlScope {
  Private = 'PRIVATE',
  Public = 'PUBLIC'
}

export type ClaimablePoints = {
  __typename?: 'ClaimablePoints';
  error?: Maybe<PointsError>;
  meta: PointsMeta;
  user: UserClaimablePoints;
};

export type Contract = {
  __typename?: 'Contract';
  address: Scalars['String'];
  chainID: Scalars['Int'];
  created?: Maybe<Scalars['Time']>;
  iconURL: Scalars['String'];
  name: Scalars['String'];
  sourceCodeVerified?: Maybe<Scalars['Boolean']>;
  type: Scalars['Int'];
  typeLabel: Scalars['String'];
};

export type ContractFunction = {
  __typename?: 'ContractFunction';
  address?: Maybe<Scalars['String']>;
  chainID: Scalars['Int'];
  hex: Scalars['String'];
  humanText: Scalars['String'];
  text: Scalars['String'];
};

export type CustomNetwork = {
  __typename?: 'CustomNetwork';
  defaultExplorerURL: Scalars['String'];
  defaultRPCURL: Scalars['String'];
  iconURL: Scalars['String'];
  id: Scalars['Int'];
  name: Scalars['String'];
  nativeAsset: CustomNetworkNativeAsset;
  testnet: CustomNetworkTestnet;
};

export type CustomNetworkNativeAsset = {
  __typename?: 'CustomNetworkNativeAsset';
  address: Scalars['String'];
  decimals: Scalars['Int'];
  iconURL: Scalars['String'];
  symbol: Scalars['String'];
};

export type CustomNetworkTestnet = {
  __typename?: 'CustomNetworkTestnet';
  FaucetURL: Scalars['String'];
  isTestnet: Scalars['Boolean'];
  mainnetChainID: Scalars['Int'];
};

export type DApp = {
  __typename?: 'DApp';
  colors: DAppColors;
  description: Scalars['String'];
  iconURL: Scalars['String'];
  name: Scalars['String'];
  report: DAppReport;
  shortName: Scalars['String'];
  status: DAppStatus;
  trending?: Maybe<Scalars['Boolean']>;
  url: Scalars['String'];
};

export type DAppColors = {
  __typename?: 'DAppColors';
  fallback?: Maybe<Scalars['String']>;
  primary: Scalars['String'];
  shadow?: Maybe<Scalars['String']>;
};

export enum DAppRankingPeriod {
  Day = 'DAY',
  Week = 'WEEK'
}

export type DAppReport = {
  __typename?: 'DAppReport';
  url: Scalars['String'];
};

export enum DAppStatus {
  Scam = 'SCAM',
  Unverified = 'UNVERIFIED',
  Verified = 'VERIFIED'
}

export enum Device {
  App = 'APP',
  Bx = 'BX'
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

export type Message = {
  method: Scalars['String'];
  params: Array<Scalars['String']>;
};

export type MessageResult = {
  __typename?: 'MessageResult';
  error?: Maybe<TransactionError>;
  report?: Maybe<TransactionReport>;
  scanning?: Maybe<TransactionScanningResult>;
  simulation?: Maybe<TransactionSimulationResult>;
};

export type Mutation = {
  __typename?: 'Mutation';
  claimUserRewards?: Maybe<UserClaimTransaction>;
  onboardPoints?: Maybe<Points>;
  redeemCode?: Maybe<RedeemedPoints>;
};


export type MutationClaimUserRewardsArgs = {
  address: Scalars['String'];
};


export type MutationOnboardPointsArgs = {
  address: Scalars['String'];
  referral?: InputMaybe<Scalars['String']>;
  signature: Scalars['String'];
};


export type MutationRedeemCodeArgs = {
  address: Scalars['String'];
  code: Scalars['String'];
};

export type NftAllowlist = {
  __typename?: 'NFTAllowlist';
  addresses?: Maybe<Array<Scalars['String']>>;
  chainID: Scalars['Int'];
};

export type Network = {
  __typename?: 'Network';
  colors: NetworkColors;
  defaultExplorer: NetworkExplorer;
  defaultRPC: NetworkRpc;
  enabledServices: NetworkEnabledServices;
  favorites: Array<Maybe<NetworkTokenFavorites>>;
  gasUnits: NetworkGasUnits;
  icons: NetworkIcons;
  id: Scalars['ID'];
  internal: Scalars['Boolean'];
  label: Scalars['String'];
  mainnetId: Scalars['ID'];
  name: Scalars['String'];
  nativeAsset: NetworkAsset;
  nativeWrappedAsset: NetworkAsset;
  opStack: Scalars['Boolean'];
  testnet: Scalars['Boolean'];
};

export type NetworkAddys = {
  __typename?: 'NetworkAddys';
  approvals: Scalars['Boolean'];
  assets: Scalars['Boolean'];
  interactionsWith: Scalars['Boolean'];
  positions: Scalars['Boolean'];
  summary: Scalars['Boolean'];
  transactions: Scalars['Boolean'];
};

export type NetworkAsset = {
  __typename?: 'NetworkAsset';
  address: Scalars['String'];
  colors: NetworkAssetColors;
  decimals: Scalars['Int'];
  iconURL: Scalars['String'];
  name: Scalars['String'];
  symbol: Scalars['String'];
};

export type NetworkAssetColors = {
  __typename?: 'NetworkAssetColors';
  fallback: Scalars['String'];
  primary: Scalars['String'];
  shadow: Scalars['String'];
};

export type NetworkColors = {
  __typename?: 'NetworkColors';
  dark: Scalars['String'];
  light: Scalars['String'];
};

export type NetworkEnabledServices = {
  __typename?: 'NetworkEnabledServices';
  addys: NetworkAddys;
  meteorology: NetworkMeteorology;
  nftProxy: NetworkNftProxy;
  notifications: NetworkNotifications;
  swap: NetworkSwap;
  tokenSearch: NetworkTokenSearch;
};

export type NetworkExplorer = {
  __typename?: 'NetworkExplorer';
  label: Scalars['String'];
  tokenURL: Scalars['String'];
  transactionURL: Scalars['String'];
  url: Scalars['String'];
};

export type NetworkGasBasicUnits = {
  __typename?: 'NetworkGasBasicUnits';
  approval: Scalars['String'];
  eoaTransfer: Scalars['String'];
  swap: Scalars['String'];
  swapPermit: Scalars['String'];
  tokenTransfer: Scalars['String'];
};

export type NetworkGasUnits = {
  __typename?: 'NetworkGasUnits';
  basic: NetworkGasBasicUnits;
  wrapped: NetworkGasWrappedUnits;
};

export type NetworkGasWrappedUnits = {
  __typename?: 'NetworkGasWrappedUnits';
  unwrap: Scalars['String'];
  wrap: Scalars['String'];
};

export type NetworkIcon = {
  __typename?: 'NetworkIcon';
  largeURL: Scalars['String'];
  smallURL: Scalars['String'];
};

export type NetworkIcons = {
  __typename?: 'NetworkIcons';
  badge: NetworkIcon;
  badgeURL: Scalars['String'];
  dark: NetworkIcon;
  light: NetworkIcon;
  uncropped: NetworkIcon;
};

export type NetworkMeteorology = {
  __typename?: 'NetworkMeteorology';
  eip1559: Scalars['Boolean'];
  enabled: Scalars['Boolean'];
  legacy: Scalars['Boolean'];
};

export type NetworkNftProxy = {
  __typename?: 'NetworkNFTProxy';
  enabled: Scalars['Boolean'];
};

export type NetworkNotifications = {
  __typename?: 'NetworkNotifications';
  enabled: Scalars['Boolean'];
  transactions: Scalars['Boolean'];
};

export type NetworkRpc = {
  __typename?: 'NetworkRPC';
  enabledDevices: Array<Maybe<Device>>;
  url: Scalars['String'];
};

export type NetworkSwap = {
  __typename?: 'NetworkSwap';
  bridge: Scalars['Boolean'];
  bridgeExactOutput: Scalars['Boolean'];
  enabled: Scalars['Boolean'];
  swap: Scalars['Boolean'];
  swapExactOutput: Scalars['Boolean'];
};

export type NetworkTokenFavorites = {
  __typename?: 'NetworkTokenFavorites';
  address: Scalars['String'];
};

export type NetworkTokenSearch = {
  __typename?: 'NetworkTokenSearch';
  enabled: Scalars['Boolean'];
};

export type Points = {
  __typename?: 'Points';
  error?: Maybe<PointsError>;
  leaderboard: PointsLeaderboard;
  meta: PointsMeta;
  user: PointsUser;
};

export type PointsEarnings = {
  __typename?: 'PointsEarnings';
  total: Scalars['Int'];
};

export type PointsError = {
  __typename?: 'PointsError';
  message: Scalars['String'];
  type: PointsErrorType;
};

export enum PointsErrorType {
  AlreadyClaimed = 'ALREADY_CLAIMED',
  AlreadyUsedCode = 'ALREADY_USED_CODE',
  AwardingNotOngoing = 'AWARDING_NOT_ONGOING',
  BlockedUser = 'BLOCKED_USER',
  ExistingUser = 'EXISTING_USER',
  InvalidRedemptionCode = 'INVALID_REDEMPTION_CODE',
  InvalidReferralCode = 'INVALID_REFERRAL_CODE',
  NonExistingUser = 'NON_EXISTING_USER',
  NoBalance = 'NO_BALANCE',
  NoClaim = 'NO_CLAIM'
}

export type PointsLeaderboard = {
  __typename?: 'PointsLeaderboard';
  accounts?: Maybe<Array<PointsLeaderboardAccount>>;
  stats: PointsLeaderboardStats;
};

export type PointsLeaderboardAccount = {
  __typename?: 'PointsLeaderboardAccount';
  address: Scalars['String'];
  avatarURL: Scalars['String'];
  earnings: PointsLeaderboardEarnings;
  ens: Scalars['String'];
};

export type PointsLeaderboardEarnings = {
  __typename?: 'PointsLeaderboardEarnings';
  total: Scalars['Int'];
};

export type PointsLeaderboardStats = {
  __typename?: 'PointsLeaderboardStats';
  rank_cutoff: Scalars['Int'];
  total_points: Scalars['Int'];
  total_users: Scalars['Int'];
};

export type PointsMeta = {
  __typename?: 'PointsMeta';
  distribution: PointsMetaDistribution;
  rewards: PointsMetaRewards;
  status: PointsMetaStatus;
};

export type PointsMetaDistribution = {
  __typename?: 'PointsMetaDistribution';
  last: PointsMetaLastDistribution;
  next: Scalars['Int'];
};

export type PointsMetaLastDistribution = {
  __typename?: 'PointsMetaLastDistribution';
  ended_at: Scalars['Int'];
  started_at: Scalars['Int'];
};

export type PointsMetaRewards = {
  __typename?: 'PointsMetaRewards';
  total: Scalars['String'];
};

export enum PointsMetaStatus {
  Finished = 'FINISHED',
  Ongoing = 'ONGOING',
  Paused = 'PAUSED'
}

export enum PointsOnboardDisplayType {
  Bonus = 'BONUS',
  NftCollection = 'NFT_COLLECTION',
  UsdAmount = 'USD_AMOUNT'
}

export type PointsOnboarding = {
  __typename?: 'PointsOnboarding';
  categories?: Maybe<Array<PointsOnboardingCategory>>;
  earnings: PointsOnboardingEarnings;
};

export type PointsOnboardingCategory = {
  __typename?: 'PointsOnboardingCategory';
  data: PointsOnboardingCategoryData;
  display_type: PointsOnboardDisplayType;
  earnings: PointsOnboardingEarnings;
  type: Scalars['String'];
};

export type PointsOnboardingCategoryData = {
  __typename?: 'PointsOnboardingCategoryData';
  owned_collections: Scalars['Int'];
  total_collections: Scalars['Int'];
  usd_amount: Scalars['Float'];
};

export type PointsOnboardingEarnings = {
  __typename?: 'PointsOnboardingEarnings';
  total: Scalars['Int'];
};

export type PointsRewards = {
  __typename?: 'PointsRewards';
  claimable: Scalars['String'];
  claimed: Scalars['String'];
  total: Scalars['String'];
};

export type PointsStats = {
  __typename?: 'PointsStats';
  last_airdrop: PointsStatsPositionLastAirdrop;
  last_period: PointsStatsPositionLastPeriod;
  onboarding: PointsStatsOnboarding;
  position: PointsStatsPosition;
  referral: PointsStatsReferral;
};

export type PointsStatsOnboarding = {
  __typename?: 'PointsStatsOnboarding';
  onboarded_at: Scalars['Time'];
};

export type PointsStatsPosition = {
  __typename?: 'PointsStatsPosition';
  current: Scalars['Int'];
  unranked: Scalars['Boolean'];
};

export type PointsStatsPositionLastAirdrop = {
  __typename?: 'PointsStatsPositionLastAirdrop';
  differences: Array<Maybe<PointsStatsPositionLastAirdropDifference>>;
  earnings: PointsEarnings;
  position: PointsStatsPosition;
};

export type PointsStatsPositionLastAirdropDifference = {
  __typename?: 'PointsStatsPositionLastAirdropDifference';
  earnings: PointsEarnings;
  group_id: Scalars['String'];
  type: Scalars['String'];
};

export type PointsStatsPositionLastPeriod = {
  __typename?: 'PointsStatsPositionLastPeriod';
  earnings: PointsEarnings;
  position: PointsStatsPosition;
};

export type PointsStatsReferral = {
  __typename?: 'PointsStatsReferral';
  qualified_referees: Scalars['Int'];
  total_referees: Scalars['Int'];
};

export type PointsUser = {
  __typename?: 'PointsUser';
  earnings: PointsEarnings;
  earnings_by_type: Array<Maybe<PointsUserEarningByType>>;
  onboarding: PointsOnboarding;
  referralCode: Scalars['String'];
  rewards: PointsRewards;
  stats: PointsStats;
};

export type PointsUserEarningByType = {
  __typename?: 'PointsUserEarningByType';
  earnings: PointsEarnings;
  type: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  claimablePoints?: Maybe<ClaimablePoints>;
  contract?: Maybe<Contract>;
  contractFunction?: Maybe<ContractFunction>;
  contracts?: Maybe<Array<Maybe<Contract>>>;
  customNetworks?: Maybe<Array<Maybe<CustomNetwork>>>;
  dApp?: Maybe<DApp>;
  dApps?: Maybe<Array<Maybe<DApp>>>;
  ensMarquee?: Maybe<EnsMarquee>;
  network?: Maybe<Network>;
  networks?: Maybe<Array<Maybe<Network>>>;
  nftAllowlist?: Maybe<NftAllowlist>;
  points?: Maybe<Points>;
  pointsOnboardChallenge: Scalars['String'];
  redemptionCode?: Maybe<RedemptionCodeInfo>;
  resolveENSProfile?: Maybe<EnsProfile>;
  reverseResolveENSProfile?: Maybe<EnsProfile>;
  rewards?: Maybe<Rewards>;
  simulateMessage?: Maybe<MessageResult>;
  simulateTransactions?: Maybe<Array<Maybe<TransactionResult>>>;
  token?: Maybe<Token>;
  tokenInteractions?: Maybe<Array<Maybe<TokenInteraction>>>;
  validateReferral?: Maybe<ValidatedReferral>;
};


export type QueryClaimablePointsArgs = {
  address?: InputMaybe<Scalars['String']>;
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


export type QueryContractsArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};


export type QueryCustomNetworksArgs = {
  includeTestnets?: InputMaybe<Scalars['Boolean']>;
};


export type QueryDAppArgs = {
  shortName?: InputMaybe<Scalars['String']>;
  url?: InputMaybe<Scalars['String']>;
};


export type QueryDAppsArgs = {
  period?: InputMaybe<DAppRankingPeriod>;
  trending?: InputMaybe<Scalars['Boolean']>;
};


export type QueryNetworkArgs = {
  chainID: Scalars['Int'];
};


export type QueryNetworksArgs = {
  device?: InputMaybe<Device>;
  includeTestnets?: InputMaybe<Scalars['Boolean']>;
};


export type QueryNftAllowlistArgs = {
  chainID: Scalars['Int'];
};


export type QueryPointsArgs = {
  address?: InputMaybe<Scalars['String']>;
};


export type QueryPointsOnboardChallengeArgs = {
  address: Scalars['String'];
  referral?: InputMaybe<Scalars['String']>;
};


export type QueryRedemptionCodeArgs = {
  code: Scalars['String'];
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


export type QuerySimulateMessageArgs = {
  address: Scalars['String'];
  chainID: Scalars['Int'];
  currency?: InputMaybe<Scalars['String']>;
  domain?: InputMaybe<Scalars['String']>;
  message: Message;
};


export type QuerySimulateTransactionsArgs = {
  chainID: Scalars['Int'];
  currency?: InputMaybe<Scalars['String']>;
  domain?: InputMaybe<Scalars['String']>;
  transactions?: InputMaybe<Array<Transaction>>;
};


export type QueryTokenArgs = {
  address: Scalars['String'];
  chainID: Scalars['Int'];
  currency?: InputMaybe<Scalars['String']>;
};


export type QueryTokenInteractionsArgs = {
  address: Scalars['String'];
  chainID: Scalars['Int'];
  currency?: InputMaybe<Scalars['String']>;
  tokenAddress: Scalars['String'];
};


export type QueryValidateReferralArgs = {
  referral: Scalars['String'];
};

export type RedeemedPoints = {
  __typename?: 'RedeemedPoints';
  earnings: RedeemedPointsEarnings;
  error?: Maybe<PointsError>;
  redemption_code: RedemptionCode;
};

export type RedeemedPointsEarnings = {
  __typename?: 'RedeemedPointsEarnings';
  total: Scalars['Int'];
};

export type RedemptionCode = {
  __typename?: 'RedemptionCode';
  code: Scalars['String'];
};

export type RedemptionCodeEarnings = {
  __typename?: 'RedemptionCodeEarnings';
  max: Scalars['Int'];
  min: Scalars['Int'];
  type: RedemptionCodeScoringType;
};

export type RedemptionCodeInfo = {
  __typename?: 'RedemptionCodeInfo';
  earnings: RedemptionCodeEarnings;
  error?: Maybe<PointsError>;
  redemption_code: RedemptionCode;
};

export enum RedemptionCodeScoringType {
  Fixed = 'FIXED',
  Range = 'RANGE',
  Unknown = 'UNKNOWN'
}

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
  colors: TokenColors;
  decimals: Scalars['Int'];
  iconURL?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  symbol: Scalars['String'];
};

export type RewardsDailyAmount = {
  __typename?: 'RewardsDailyAmount';
  day: Scalars['Int'];
  token: Scalars['Float'];
  usd: Scalars['Float'];
};

export type RewardsEarnings = {
  __typename?: 'RewardsEarnings';
  daily?: Maybe<Array<RewardsDailyAmount>>;
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
  bridging: Scalars['TokenBridging'];
  circulatingSupply?: Maybe<Scalars['Float']>;
  colors: TokenColors;
  creationDate?: Maybe<Scalars['Time']>;
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
  status: TokenStatus;
  symbol: Scalars['String'];
  totalSupply?: Maybe<Scalars['Float']>;
  transferable: Scalars['Boolean'];
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

export type TokenInteraction = {
  __typename?: 'TokenInteraction';
  amount: Scalars['String'];
  chainID: Scalars['Int'];
  direction: TokenInteractionDirection;
  explorerLabel: Scalars['String'];
  explorerURL: Scalars['String'];
  interactedAt: Scalars['Int'];
  price: Scalars['Float'];
  transactionHash: Scalars['String'];
  type: TokenInteractionType;
};

export enum TokenInteractionDirection {
  In = 'IN',
  Out = 'OUT',
  Unknown = 'UNKNOWN'
}

export enum TokenInteractionType {
  Bought = 'BOUGHT',
  Received = 'RECEIVED',
  Sent = 'SENT',
  Sold = 'SOLD',
  Unknown = 'UNKNOWN'
}

export type TokenLink = {
  __typename?: 'TokenLink';
  url: Scalars['String'];
};

export type TokenLinks = {
  __typename?: 'TokenLinks';
  coingecko?: Maybe<TokenLink>;
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
  /** pricePresentAt time when the price is present for the first time */
  pricePresentAt?: Maybe<Scalars['Time']>;
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

export enum TokenStatus {
  Scam = 'SCAM',
  Unknown = 'UNKNOWN',
  Unverified = 'UNVERIFIED',
  Verified = 'VERIFIED'
}

export type Transaction = {
  data: Scalars['String'];
  from: Scalars['String'];
  to: Scalars['String'];
  value: Scalars['String'];
};

export enum TransactionAssetInterface {
  Erc20 = 'ERC20',
  Erc721 = 'ERC721',
  Erc1155 = 'ERC1155'
}

export enum TransactionAssetType {
  Native = 'NATIVE',
  Nft = 'NFT',
  Token = 'TOKEN'
}

export type TransactionError = {
  __typename?: 'TransactionError';
  message: Scalars['String'];
  type: TransactionErrorType;
};

export enum TransactionErrorType {
  InsufficientBalance = 'INSUFFICIENT_BALANCE',
  Revert = 'REVERT',
  Unsupported = 'UNSUPPORTED'
}

export type TransactionGasResult = {
  __typename?: 'TransactionGasResult';
  estimate: Scalars['String'];
  used: Scalars['String'];
};

export type TransactionReport = {
  __typename?: 'TransactionReport';
  url: Scalars['String'];
};

export type TransactionResult = {
  __typename?: 'TransactionResult';
  error?: Maybe<TransactionError>;
  gas?: Maybe<TransactionGasResult>;
  report?: Maybe<TransactionReport>;
  scanning?: Maybe<TransactionScanningResult>;
  simulation?: Maybe<TransactionSimulationResult>;
};

export enum TransactionScanResultType {
  Malicious = 'MALICIOUS',
  Ok = 'OK',
  Warning = 'WARNING'
}

export type TransactionScanningResult = {
  __typename?: 'TransactionScanningResult';
  description: Scalars['String'];
  result: TransactionScanResultType;
};

export type TransactionSimulationApproval = {
  __typename?: 'TransactionSimulationApproval';
  asset: TransactionSimulationAsset;
  expiration?: Maybe<Scalars['Time']>;
  quantityAllowed: Scalars['String'];
  quantityAtRisk: Scalars['String'];
  spender: TransactionSimulationTarget;
};

export type TransactionSimulationAsset = {
  __typename?: 'TransactionSimulationAsset';
  assetCode: Scalars['String'];
  creationDate?: Maybe<Scalars['Time']>;
  decimals: Scalars['Int'];
  iconURL: Scalars['String'];
  interface: TransactionAssetInterface;
  name: Scalars['String'];
  network: Scalars['String'];
  status: VerificationStatus;
  symbol: Scalars['String'];
  tokenId: Scalars['String'];
  type: TransactionAssetType;
};

export type TransactionSimulationChange = {
  __typename?: 'TransactionSimulationChange';
  asset: TransactionSimulationAsset;
  price: Scalars['Float'];
  quantity: Scalars['String'];
};

export type TransactionSimulationMeta = {
  __typename?: 'TransactionSimulationMeta';
  to?: Maybe<TransactionSimulationTarget>;
  transferTo?: Maybe<TransactionSimulationTarget>;
};

export type TransactionSimulationResult = {
  __typename?: 'TransactionSimulationResult';
  approvals?: Maybe<Array<Maybe<TransactionSimulationApproval>>>;
  in?: Maybe<Array<Maybe<TransactionSimulationChange>>>;
  meta?: Maybe<TransactionSimulationMeta>;
  out?: Maybe<Array<Maybe<TransactionSimulationChange>>>;
};

export type TransactionSimulationTarget = {
  __typename?: 'TransactionSimulationTarget';
  address: Scalars['String'];
  created?: Maybe<Scalars['Time']>;
  function: Scalars['String'];
  iconURL: Scalars['String'];
  name: Scalars['String'];
  sourceCodeStatus?: Maybe<VerificationStatus>;
};

export type UserClaimTransaction = {
  __typename?: 'UserClaimTransaction';
  chainID: Scalars['Int'];
  error?: Maybe<PointsError>;
  txHash: Scalars['String'];
  uoHash: Scalars['String'];
};

export type UserClaimablePoints = {
  __typename?: 'UserClaimablePoints';
  earnings: PointsEarnings;
};

export type ValidatedReferral = {
  __typename?: 'ValidatedReferral';
  error?: Maybe<PointsError>;
  valid: Scalars['Boolean'];
};

export enum VerificationStatus {
  Unknown = 'UNKNOWN',
  Unverified = 'UNVERIFIED',
  Verified = 'VERIFIED'
}

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

export type AboutTokenQueryVariables = Exact<{
  chainId: Scalars['Int'];
  address: Scalars['String'];
  currency?: InputMaybe<Scalars['String']>;
}>;


export type AboutTokenQuery = { __typename?: 'Query', token?: { __typename?: 'Token', marketCap?: number | null, fullyDilutedValuation?: number | null, bridging: any, circulatingSupply?: number | null, totalSupply?: number | null, networks: any, volume1d?: number | null, description?: string | null, allTime: { __typename?: 'TokenAllTime', highValue?: number | null, lowValue?: number | null }, price: { __typename?: 'TokenPrice', value?: number | null }, links?: { __typename?: 'TokenLinks', homepage?: { __typename?: 'TokenLink', url: string } | null, twitter?: { __typename?: 'TokenLink', url: string } | null, facebook?: { __typename?: 'TokenLink', url: string } | null, reddit?: { __typename?: 'TokenLink', url: string } | null, telegram?: { __typename?: 'TokenLink', url: string } | null } | null } | null };

export type PriceChartQueryVariables = Exact<{
  chainId: Scalars['Int'];
  address: Scalars['String'];
  day: Scalars['Boolean'];
  hour: Scalars['Boolean'];
  week: Scalars['Boolean'];
  month: Scalars['Boolean'];
  year: Scalars['Boolean'];
}>;


export type PriceChartQuery = { __typename?: 'Query', token?: { __typename?: 'Token', priceCharts: { __typename?: 'TokenPriceCharts', day?: { __typename?: 'TokenPriceChart', points?: Array<Array<any | null> | null> | null } | null, hour?: { __typename?: 'TokenPriceChart', points?: Array<Array<any | null> | null> | null } | null, week?: { __typename?: 'TokenPriceChart', points?: Array<Array<any | null> | null> | null } | null, month?: { __typename?: 'TokenPriceChart', points?: Array<Array<any | null> | null> | null } | null, year?: { __typename?: 'TokenPriceChart', points?: Array<Array<any | null> | null> | null } | null } } | null };

export type DAppQueryVariables = Exact<{
  shortName: Scalars['String'];
  url: Scalars['String'];
  status: Scalars['Boolean'];
}>;


export type DAppQuery = { __typename?: 'Query', dApp?: { __typename?: 'DApp', name: string, status?: DAppStatus, iconURL: string, url: string, description: string, shortName: string, colors: { __typename?: 'DAppColors', primary: string, fallback?: string | null, shadow?: string | null } } | null };

export type AssetFragment = { __typename?: 'TransactionSimulationAsset', assetCode: string, decimals: number, iconURL: string, name: string, network: string, symbol: string, type: TransactionAssetType, interface: TransactionAssetInterface, tokenId: string, status: VerificationStatus };

export type ChangeFragment = { __typename?: 'TransactionSimulationChange', quantity: string, asset: { __typename?: 'TransactionSimulationAsset', assetCode: string, decimals: number, iconURL: string, name: string, network: string, symbol: string, type: TransactionAssetType, interface: TransactionAssetInterface, tokenId: string, status: VerificationStatus } };

export type TargetFragment = { __typename?: 'TransactionSimulationTarget', address: string, name: string, iconURL: string, function: string, created?: any | null, sourceCodeStatus?: VerificationStatus | null };

export type SimulateTransactionsQueryVariables = Exact<{
  chainId: Scalars['Int'];
  transactions: Array<Transaction> | Transaction;
  domain?: InputMaybe<Scalars['String']>;
}>;


export type SimulateTransactionsQuery = { __typename?: 'Query', simulateTransactions?: Array<{ __typename?: 'TransactionResult', scanning?: { __typename?: 'TransactionScanningResult', result: TransactionScanResultType, description: string } | null, error?: { __typename?: 'TransactionError', message: string, type: TransactionErrorType } | null, gas?: { __typename?: 'TransactionGasResult', estimate: string } | null, simulation?: { __typename?: 'TransactionSimulationResult', in?: Array<{ __typename?: 'TransactionSimulationChange', quantity: string, asset: { __typename?: 'TransactionSimulationAsset', assetCode: string, decimals: number, iconURL: string, name: string, network: string, symbol: string, type: TransactionAssetType, interface: TransactionAssetInterface, tokenId: string, status: VerificationStatus } } | null> | null, out?: Array<{ __typename?: 'TransactionSimulationChange', quantity: string, asset: { __typename?: 'TransactionSimulationAsset', assetCode: string, decimals: number, iconURL: string, name: string, network: string, symbol: string, type: TransactionAssetType, interface: TransactionAssetInterface, tokenId: string, status: VerificationStatus } } | null> | null, approvals?: Array<{ __typename?: 'TransactionSimulationApproval', quantityAllowed: string, quantityAtRisk: string, expiration?: any | null, asset: { __typename?: 'TransactionSimulationAsset', assetCode: string, decimals: number, iconURL: string, name: string, network: string, symbol: string, type: TransactionAssetType, interface: TransactionAssetInterface, tokenId: string, status: VerificationStatus }, spender: { __typename?: 'TransactionSimulationTarget', address: string, name: string, iconURL: string, function: string, created?: any | null, sourceCodeStatus?: VerificationStatus | null } } | null> | null, meta?: { __typename?: 'TransactionSimulationMeta', transferTo?: { __typename?: 'TransactionSimulationTarget', address: string, name: string, iconURL: string, function: string, created?: any | null, sourceCodeStatus?: VerificationStatus | null } | null, to?: { __typename?: 'TransactionSimulationTarget', address: string, name: string, iconURL: string, function: string, created?: any | null, sourceCodeStatus?: VerificationStatus | null } | null } | null } | null } | null> | null };

export type SimulateTransactionsWithoutGasQueryVariables = Exact<{
  chainId: Scalars['Int'];
  transactions: Array<Transaction> | Transaction;
  domain?: InputMaybe<Scalars['String']>;
}>;


export type SimulateTransactionsWithoutGasQuery = { __typename?: 'Query', simulateTransactions?: Array<{ __typename?: 'TransactionResult', scanning?: { __typename?: 'TransactionScanningResult', result: TransactionScanResultType, description: string } | null, error?: { __typename?: 'TransactionError', message: string, type: TransactionErrorType } | null, simulation?: { __typename?: 'TransactionSimulationResult', in?: Array<{ __typename?: 'TransactionSimulationChange', quantity: string, asset: { __typename?: 'TransactionSimulationAsset', assetCode: string, decimals: number, iconURL: string, name: string, network: string, symbol: string, type: TransactionAssetType, interface: TransactionAssetInterface, tokenId: string, status: VerificationStatus } } | null> | null, out?: Array<{ __typename?: 'TransactionSimulationChange', quantity: string, asset: { __typename?: 'TransactionSimulationAsset', assetCode: string, decimals: number, iconURL: string, name: string, network: string, symbol: string, type: TransactionAssetType, interface: TransactionAssetInterface, tokenId: string, status: VerificationStatus } } | null> | null, approvals?: Array<{ __typename?: 'TransactionSimulationApproval', quantityAllowed: string, quantityAtRisk: string, expiration?: any | null, asset: { __typename?: 'TransactionSimulationAsset', assetCode: string, decimals: number, iconURL: string, name: string, network: string, symbol: string, type: TransactionAssetType, interface: TransactionAssetInterface, tokenId: string, status: VerificationStatus }, spender: { __typename?: 'TransactionSimulationTarget', address: string, name: string, iconURL: string, function: string, created?: any | null, sourceCodeStatus?: VerificationStatus | null } } | null> | null, meta?: { __typename?: 'TransactionSimulationMeta', transferTo?: { __typename?: 'TransactionSimulationTarget', address: string, name: string, iconURL: string, function: string, created?: any | null, sourceCodeStatus?: VerificationStatus | null } | null, to?: { __typename?: 'TransactionSimulationTarget', address: string, name: string, iconURL: string, function: string, created?: any | null, sourceCodeStatus?: VerificationStatus | null } | null } | null } | null } | null> | null };

export type SimulateMessageQueryVariables = Exact<{
  chainId: Scalars['Int'];
  address: Scalars['String'];
  message: Message;
  domain?: InputMaybe<Scalars['String']>;
  currency?: InputMaybe<Scalars['String']>;
}>;


export type SimulateMessageQuery = { __typename?: 'Query', simulateMessage?: { __typename?: 'MessageResult', scanning?: { __typename?: 'TransactionScanningResult', result: TransactionScanResultType, description: string } | null, simulation?: { __typename?: 'TransactionSimulationResult', in?: Array<{ __typename?: 'TransactionSimulationChange', quantity: string, asset: { __typename?: 'TransactionSimulationAsset', assetCode: string, decimals: number, iconURL: string, name: string, network: string, symbol: string, type: TransactionAssetType, interface: TransactionAssetInterface, tokenId: string, status: VerificationStatus } } | null> | null, out?: Array<{ __typename?: 'TransactionSimulationChange', quantity: string, asset: { __typename?: 'TransactionSimulationAsset', assetCode: string, decimals: number, iconURL: string, name: string, network: string, symbol: string, type: TransactionAssetType, interface: TransactionAssetInterface, tokenId: string, status: VerificationStatus } } | null> | null, approvals?: Array<{ __typename?: 'TransactionSimulationApproval', quantityAllowed: string, quantityAtRisk: string, expiration?: any | null, asset: { __typename?: 'TransactionSimulationAsset', assetCode: string, decimals: number, iconURL: string, name: string, network: string, symbol: string, type: TransactionAssetType, interface: TransactionAssetInterface, tokenId: string, status: VerificationStatus }, spender: { __typename?: 'TransactionSimulationTarget', address: string, name: string, iconURL: string, function: string, created?: any | null, sourceCodeStatus?: VerificationStatus | null } } | null> | null, meta?: { __typename?: 'TransactionSimulationMeta', transferTo?: { __typename?: 'TransactionSimulationTarget', address: string, name: string, iconURL: string, function: string, created?: any | null, sourceCodeStatus?: VerificationStatus | null } | null, to?: { __typename?: 'TransactionSimulationTarget', address: string, name: string, iconURL: string, function: string, created?: any | null, sourceCodeStatus?: VerificationStatus | null } | null } | null } | null, error?: { __typename?: 'TransactionError', message: string, type: TransactionErrorType } | null } | null };

export type ValidatePointsReferralCodeMutationVariables = Exact<{
  address: Scalars['String'];
  referral?: InputMaybe<Scalars['String']>;
}>;


export type ValidatePointsReferralCodeMutation = { __typename?: 'Mutation', onboardPoints?: { __typename?: 'Points', error?: { __typename?: 'PointsError', type: PointsErrorType } | null } | null };

export type ValidatePointsSignatureMutationVariables = Exact<{
  address: Scalars['String'];
  signature: Scalars['String'];
  referral?: InputMaybe<Scalars['String']>;
}>;


export type ValidatePointsSignatureMutation = { __typename?: 'Mutation', onboardPoints?: { __typename?: 'Points', error?: { __typename?: 'PointsError', type: PointsErrorType } | null, meta: { __typename?: 'PointsMeta', status: PointsMetaStatus, distribution: { __typename?: 'PointsMetaDistribution', next: number } }, leaderboard: { __typename?: 'PointsLeaderboard', stats: { __typename?: 'PointsLeaderboardStats', total_users: number, total_points: number }, accounts?: Array<{ __typename?: 'PointsLeaderboardAccount', address: string, ens: string, avatarURL: string, earnings: { __typename?: 'PointsLeaderboardEarnings', total: number } }> | null }, user: { __typename?: 'PointsUser', referralCode: string, onboarding: { __typename?: 'PointsOnboarding', earnings: { __typename?: 'PointsOnboardingEarnings', total: number }, categories?: Array<{ __typename?: 'PointsOnboardingCategory', type: string, display_type: PointsOnboardDisplayType, data: { __typename?: 'PointsOnboardingCategoryData', usd_amount: number, total_collections: number, owned_collections: number }, earnings: { __typename?: 'PointsOnboardingEarnings', total: number } }> | null }, earnings: { __typename?: 'PointsEarnings', total: number }, stats: { __typename?: 'PointsStats', position: { __typename?: 'PointsStatsPosition', current: number } } } } | null };

export type ValidateReferralQueryVariables = Exact<{
  code: Scalars['String'];
}>;


export type ValidateReferralQuery = { __typename?: 'Query', validateReferral?: { __typename?: 'ValidatedReferral', valid: boolean, error?: { __typename?: 'PointsError', type: PointsErrorType, message: string } | null } | null };

export type GetPointsOnboardChallengeQueryVariables = Exact<{
  address: Scalars['String'];
  referral?: InputMaybe<Scalars['String']>;
}>;


export type GetPointsOnboardChallengeQuery = { __typename?: 'Query', pointsOnboardChallenge: string };

export type PointsQueryVariables = Exact<{
  address: Scalars['String'];
}>;


export type PointsQuery = { __typename?: 'Query', points?: { __typename?: 'Points', error?: { __typename?: 'PointsError', message: string, type: PointsErrorType } | null, meta: { __typename?: 'PointsMeta', status: PointsMetaStatus, distribution: { __typename?: 'PointsMetaDistribution', next: number }, rewards: { __typename?: 'PointsMetaRewards', total: string } }, leaderboard: { __typename?: 'PointsLeaderboard', stats: { __typename?: 'PointsLeaderboardStats', total_users: number, total_points: number, rank_cutoff: number }, accounts?: Array<{ __typename?: 'PointsLeaderboardAccount', address: string, ens: string, avatarURL: string, earnings: { __typename?: 'PointsLeaderboardEarnings', total: number } }> | null }, user: { __typename?: 'PointsUser', referralCode: string, earnings_by_type: Array<{ __typename?: 'PointsUserEarningByType', type: string, earnings: { __typename?: 'PointsEarnings', total: number } } | null>, earnings: { __typename?: 'PointsEarnings', total: number }, rewards: { __typename?: 'PointsRewards', total: string, claimable: string, claimed: string }, stats: { __typename?: 'PointsStats', position: { __typename?: 'PointsStatsPosition', unranked: boolean, current: number }, referral: { __typename?: 'PointsStatsReferral', total_referees: number, qualified_referees: number }, last_airdrop: { __typename?: 'PointsStatsPositionLastAirdrop', position: { __typename?: 'PointsStatsPosition', unranked: boolean, current: number }, earnings: { __typename?: 'PointsEarnings', total: number }, differences: Array<{ __typename?: 'PointsStatsPositionLastAirdropDifference', type: string, group_id: string, earnings: { __typename?: 'PointsEarnings', total: number } } | null> }, last_period: { __typename?: 'PointsStatsPositionLastPeriod', position: { __typename?: 'PointsStatsPosition', unranked: boolean, current: number }, earnings: { __typename?: 'PointsEarnings', total: number } } } } } | null };

export type RedeemCodeForPointsMutationVariables = Exact<{
  address: Scalars['String'];
  redemptionCode: Scalars['String'];
}>;


export type RedeemCodeForPointsMutation = { __typename?: 'Mutation', redeemCode?: { __typename?: 'RedeemedPoints', earnings: { __typename?: 'RedeemedPointsEarnings', total: number }, redemption_code: { __typename?: 'RedemptionCode', code: string }, error?: { __typename?: 'PointsError', type: PointsErrorType, message: string } | null } | null };

export type ClaimUserRewardsMutationVariables = Exact<{
  address: Scalars['String'];
}>;


export type ClaimUserRewardsMutation = { __typename?: 'Mutation', claimUserRewards?: { __typename?: 'UserClaimTransaction', chainID: number, uoHash: string, txHash: string, error?: { __typename?: 'PointsError', type: PointsErrorType, message: string } | null } | null };

export type ExternalTokenQueryVariables = Exact<{
  address: Scalars['String'];
  chainId: Scalars['Int'];
  currency?: InputMaybe<Scalars['String']>;
}>;


export type ExternalTokenQuery = { __typename?: 'Query', token?: { __typename?: 'Token', decimals: number, iconUrl?: string | null, name: string, networks: any, symbol: string, price: { __typename?: 'TokenPrice', relativeChange24h?: number | null, value?: number | null } } | null };

export const AssetFragmentDoc = gql`
    fragment asset on TransactionSimulationAsset {
  assetCode
  decimals
  iconURL
  name
  network
  symbol
  type
  interface
  tokenId
  status
}
    `;
export const ChangeFragmentDoc = gql`
    fragment change on TransactionSimulationChange {
  asset {
    ...asset
  }
  quantity
}
    ${AssetFragmentDoc}`;
export const TargetFragmentDoc = gql`
    fragment target on TransactionSimulationTarget {
  address
  name
  iconURL
  function
  created
  sourceCodeStatus
}
    `;
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
export const AboutTokenDocument = gql`
    query aboutToken($chainId: Int!, $address: String!, $currency: String) {
  token(chainID: $chainId, address: $address, currency: $currency) {
    marketCap
    fullyDilutedValuation
    allTime {
      highValue
      lowValue
    }
    bridging
    circulatingSupply
    totalSupply
    networks
    volume1d
    description
    price {
      value
    }
    links {
      homepage {
        url
      }
      twitter {
        url
      }
      facebook {
        url
      }
      reddit {
        url
      }
      telegram {
        url
      }
    }
  }
}
    `;
export const PriceChartDocument = gql`
    query priceChart($chainId: Int!, $address: String!, $day: Boolean!, $hour: Boolean!, $week: Boolean!, $month: Boolean!, $year: Boolean!) {
  token(chainID: $chainId, address: $address) {
    priceCharts {
      day @include(if: $day) {
        points
      }
      hour @include(if: $hour) {
        points
      }
      week @include(if: $week) {
        points
      }
      month @include(if: $month) {
        points
      }
      year @include(if: $year) {
        points
      }
    }
  }
}
    `;
export const DAppDocument = gql`
    query dApp($shortName: String!, $url: String!, $status: Boolean!) {
  dApp(shortName: $shortName, url: $url) {
    name
    status @include(if: $status)
    colors {
      primary
      fallback
      shadow
    }
    iconURL
    url
    description
    shortName
  }
}
    `;
export const SimulateTransactionsDocument = gql`
    query simulateTransactions($chainId: Int!, $transactions: [Transaction!]!, $domain: String) {
  simulateTransactions(
    chainID: $chainId
    transactions: $transactions
    domain: $domain
  ) {
    scanning {
      result
      description
    }
    error {
      message
      type
    }
    gas {
      estimate
    }
    simulation {
      in {
        ...change
      }
      out {
        ...change
      }
      approvals {
        asset {
          ...asset
        }
        spender {
          ...target
        }
        quantityAllowed
        quantityAtRisk
        expiration
      }
      meta {
        transferTo {
          ...target
        }
        to {
          ...target
        }
      }
    }
  }
}
    ${ChangeFragmentDoc}
${AssetFragmentDoc}
${TargetFragmentDoc}`;
export const SimulateTransactionsWithoutGasDocument = gql`
    query simulateTransactionsWithoutGas($chainId: Int!, $transactions: [Transaction!]!, $domain: String) {
  simulateTransactions(
    chainID: $chainId
    transactions: $transactions
    domain: $domain
  ) {
    scanning {
      result
      description
    }
    error {
      message
      type
    }
    simulation {
      in {
        ...change
      }
      out {
        ...change
      }
      approvals {
        asset {
          ...asset
        }
        spender {
          ...target
        }
        quantityAllowed
        quantityAtRisk
        expiration
      }
      meta {
        transferTo {
          ...target
        }
        to {
          ...target
        }
      }
    }
  }
}
    ${ChangeFragmentDoc}
${AssetFragmentDoc}
${TargetFragmentDoc}`;
export const SimulateMessageDocument = gql`
    query simulateMessage($chainId: Int!, $address: String!, $message: Message!, $domain: String, $currency: String) {
  simulateMessage(
    chainID: $chainId
    address: $address
    message: $message
    domain: $domain
    currency: $currency
  ) {
    scanning {
      result
      description
    }
    simulation {
      in {
        ...change
      }
      out {
        ...change
      }
      approvals {
        asset {
          ...asset
        }
        spender {
          ...target
        }
        quantityAllowed
        quantityAtRisk
        expiration
      }
      meta {
        transferTo {
          ...target
        }
        to {
          ...target
        }
      }
    }
    error {
      message
      type
    }
  }
}
    ${ChangeFragmentDoc}
${AssetFragmentDoc}
${TargetFragmentDoc}`;
export const ValidatePointsReferralCodeDocument = gql`
    mutation validatePointsReferralCode($address: String!, $referral: String) {
  onboardPoints(address: $address, signature: "", referral: $referral) {
    error {
      type
    }
  }
}
    `;
export const ValidatePointsSignatureDocument = gql`
    mutation validatePointsSignature($address: String!, $signature: String!, $referral: String) {
  onboardPoints(address: $address, signature: $signature, referral: $referral) {
    error {
      type
    }
    meta {
      distribution {
        next
      }
      status
    }
    leaderboard {
      stats {
        total_users
        total_points
      }
      accounts {
        address
        earnings {
          total
        }
        ens
        avatarURL
      }
    }
    user {
      onboarding {
        earnings {
          total
        }
        categories {
          data {
            usd_amount
            total_collections
            owned_collections
          }
          type
          display_type
          earnings {
            total
          }
        }
      }
      referralCode
      earnings {
        total
      }
      stats {
        position {
          current
        }
      }
    }
  }
}
    `;
export const ValidateReferralDocument = gql`
    query validateReferral($code: String!) {
  validateReferral(referral: $code) {
    valid
    error {
      type
      message
    }
  }
}
    `;
export const GetPointsOnboardChallengeDocument = gql`
    query getPointsOnboardChallenge($address: String!, $referral: String) {
  pointsOnboardChallenge(address: $address, referral: $referral)
}
    `;
export const PointsDocument = gql`
    query points($address: String!) {
  points(address: $address) {
    error {
      message
      type
    }
    meta {
      distribution {
        next
      }
      status
      rewards {
        total
      }
    }
    leaderboard {
      stats {
        total_users
        total_points
        rank_cutoff
      }
      accounts {
        address
        earnings {
          total
        }
        ens
        avatarURL
      }
    }
    user {
      referralCode
      earnings_by_type {
        type
        earnings {
          total
        }
      }
      earnings {
        total
      }
      rewards {
        total
        claimable
        claimed
      }
      stats {
        position {
          unranked
          current
        }
        referral {
          total_referees
          qualified_referees
        }
        last_airdrop {
          position {
            unranked
            current
          }
          earnings {
            total
          }
          differences {
            type
            group_id
            earnings {
              total
            }
          }
        }
        last_period {
          position {
            unranked
            current
          }
          earnings {
            total
          }
        }
      }
    }
  }
}
    `;
export const RedeemCodeForPointsDocument = gql`
    mutation redeemCodeForPoints($address: String!, $redemptionCode: String!) {
  redeemCode(address: $address, code: $redemptionCode) {
    earnings {
      total
    }
    redemption_code {
      code
    }
    error {
      type
      message
    }
  }
}
    `;
export const ClaimUserRewardsDocument = gql`
    mutation claimUserRewards($address: String!) {
  claimUserRewards(address: $address) {
    error {
      type
      message
    }
    chainID
    uoHash
    txHash
  }
}
    `;
export const ExternalTokenDocument = gql`
    query externalToken($address: String!, $chainId: Int!, $currency: String) {
  token(address: $address, chainID: $chainId, currency: $currency) {
    decimals
    iconUrl
    name
    networks
    price {
      relativeChange24h
      value
    }
    symbol
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
    },
    aboutToken(variables: AboutTokenQueryVariables, options?: C): Promise<AboutTokenQuery> {
      return requester<AboutTokenQuery, AboutTokenQueryVariables>(AboutTokenDocument, variables, options) as Promise<AboutTokenQuery>;
    },
    priceChart(variables: PriceChartQueryVariables, options?: C): Promise<PriceChartQuery> {
      return requester<PriceChartQuery, PriceChartQueryVariables>(PriceChartDocument, variables, options) as Promise<PriceChartQuery>;
    },
    dApp(variables: DAppQueryVariables, options?: C): Promise<DAppQuery> {
      return requester<DAppQuery, DAppQueryVariables>(DAppDocument, variables, options) as Promise<DAppQuery>;
    },
    simulateTransactions(variables: SimulateTransactionsQueryVariables, options?: C): Promise<SimulateTransactionsQuery> {
      return requester<SimulateTransactionsQuery, SimulateTransactionsQueryVariables>(SimulateTransactionsDocument, variables, options) as Promise<SimulateTransactionsQuery>;
    },
    simulateTransactionsWithoutGas(variables: SimulateTransactionsWithoutGasQueryVariables, options?: C): Promise<SimulateTransactionsWithoutGasQuery> {
      return requester<SimulateTransactionsWithoutGasQuery, SimulateTransactionsWithoutGasQueryVariables>(SimulateTransactionsWithoutGasDocument, variables, options) as Promise<SimulateTransactionsWithoutGasQuery>;
    },
    simulateMessage(variables: SimulateMessageQueryVariables, options?: C): Promise<SimulateMessageQuery> {
      return requester<SimulateMessageQuery, SimulateMessageQueryVariables>(SimulateMessageDocument, variables, options) as Promise<SimulateMessageQuery>;
    },
    validatePointsReferralCode(variables: ValidatePointsReferralCodeMutationVariables, options?: C): Promise<ValidatePointsReferralCodeMutation> {
      return requester<ValidatePointsReferralCodeMutation, ValidatePointsReferralCodeMutationVariables>(ValidatePointsReferralCodeDocument, variables, options) as Promise<ValidatePointsReferralCodeMutation>;
    },
    validatePointsSignature(variables: ValidatePointsSignatureMutationVariables, options?: C): Promise<ValidatePointsSignatureMutation> {
      return requester<ValidatePointsSignatureMutation, ValidatePointsSignatureMutationVariables>(ValidatePointsSignatureDocument, variables, options) as Promise<ValidatePointsSignatureMutation>;
    },
    validateReferral(variables: ValidateReferralQueryVariables, options?: C): Promise<ValidateReferralQuery> {
      return requester<ValidateReferralQuery, ValidateReferralQueryVariables>(ValidateReferralDocument, variables, options) as Promise<ValidateReferralQuery>;
    },
    getPointsOnboardChallenge(variables: GetPointsOnboardChallengeQueryVariables, options?: C): Promise<GetPointsOnboardChallengeQuery> {
      return requester<GetPointsOnboardChallengeQuery, GetPointsOnboardChallengeQueryVariables>(GetPointsOnboardChallengeDocument, variables, options) as Promise<GetPointsOnboardChallengeQuery>;
    },
    points(variables: PointsQueryVariables, options?: C): Promise<PointsQuery> {
      return requester<PointsQuery, PointsQueryVariables>(PointsDocument, variables, options) as Promise<PointsQuery>;
    },
    redeemCodeForPoints(variables: RedeemCodeForPointsMutationVariables, options?: C): Promise<RedeemCodeForPointsMutation> {
      return requester<RedeemCodeForPointsMutation, RedeemCodeForPointsMutationVariables>(RedeemCodeForPointsDocument, variables, options) as Promise<RedeemCodeForPointsMutation>;
    },
    claimUserRewards(variables: ClaimUserRewardsMutationVariables, options?: C): Promise<ClaimUserRewardsMutation> {
      return requester<ClaimUserRewardsMutation, ClaimUserRewardsMutationVariables>(ClaimUserRewardsDocument, variables, options) as Promise<ClaimUserRewardsMutation>;
    },
    externalToken(variables: ExternalTokenQueryVariables, options?: C): Promise<ExternalTokenQuery> {
      return requester<ExternalTokenQuery, ExternalTokenQueryVariables>(ExternalTokenDocument, variables, options) as Promise<ExternalTokenQuery>;
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;
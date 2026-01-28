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

export type Authorization = {
  address: Scalars['String'];
  chainId: Scalars['String'];
  nonce: Scalars['String'];
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

export type Colors = {
  __typename?: 'Colors';
  /** Fallback color for secondary UI elements */
  fallback: Scalars['String'];
  /** Primary brand color in hex format (e.g., #FF0000) */
  primary: Scalars['String'];
  /** Shadow color for depth and emphasis */
  shadow: Scalars['String'];
};

/** CompetitionWindow defines a time period for the King of the Hill competition */
export type CompetitionWindow = {
  __typename?: 'CompetitionWindow';
  /** Total duration of the window in seconds */
  durationSeconds: Scalars['Int'];
  /** UTC timestamp when the competition window ends */
  end: Scalars['Int'];
  /** Time interval representation (e.g., "1h", "24h") */
  interval: Scalars['String'];
  /** Whether this is the currently active competition window */
  isActive: Scalars['Boolean'];
  /** How much time is left in the current window */
  secondsRemaining: Scalars['Int'];
  /** UTC timestamp when the competition window begins */
  start: Scalars['Int'];
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

export type DAppV2 = {
  __typename?: 'DAppV2';
  /** Canonical name of the DApp protocol */
  canonicalProtocolName: Scalars['String'];
  /** Blockchain network ID where the DApp is deployed */
  chainId: Scalars['Int'];
  /** Color theme configuration for the DApp */
  colors: Colors;
  /** URL to the DApp's logo/icon image */
  iconURL: Scalars['String'];
  /** Unique identifier for the DApp */
  protocolID: Scalars['String'];
  /** Display name of the DApp */
  protocolName: Scalars['String'];
  /** Normalized identifier for the DApp (e.g., 'uniswap', 'aave') */
  protocolNameID: Scalars['String'];
  /** Version of the DApp protocol */
  protocolVersion: Scalars['String'];
  /** Website URL of the DApp */
  siteURL: Scalars['String'];
};

export type DAppV2Result = {
  __typename?: 'DAppV2Result';
  count: Scalars['Int'];
  result: Array<DAppV2>;
};

export enum Device {
  App = 'APP',
  Bx = 'BX'
}

export type DurationSummary = {
  __typename?: 'DurationSummary';
  /** The duration period this summary covers */
  duration: Scalars['String'];
  /** End timestamp of the summary period (Unix timestamp) */
  end: Scalars['Time'];
  /** Start timestamp of the summary period (Unix timestamp) */
  start: Scalars['Time'];
  /** Detailed trade statistics for this duration */
  stats: Stats;
};

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

export type KingOfTheHill = {
  __typename?: 'KingOfTheHill';
  /** The current token in the King of the Hill competition */
  current: KingOfTheHillToken;
  /** The previous token that held the title */
  lastWinner?: Maybe<KingOfTheHillToken>;
};

/**  KingOfTheHill represents token in the King of the Hill competition */
export type KingOfTheHillRankingElem = {
  __typename?: 'KingOfTheHillRankingElem';
  /** Ranking position of the token in the competition */
  rank: Scalars['Int'];
  /**
   * Token details.
   * Note: This object may not resolve all fields defined in the Token type,
   * as only a subset of data is available in this context.
   */
  token: Token;
  /** Current time window for the competition */
  windowTradingVolume: Scalars['String'];
};

export type KingOfTheHillRankings = {
  __typename?: 'KingOfTheHillRankings';
  /** The leaderboard of the King of the Hill competition */
  rankings: Array<KingOfTheHillRankingElem>;
  /** Current time window for the competition */
  window: CompetitionWindow;
};

/** KingOfTheHillToken represents a token in the King of the Hill competition. */
export type KingOfTheHillToken = {
  __typename?: 'KingOfTheHillToken';
  /** Ranking details for the token in the competition */
  rankingDetails: RankingDetails;
  /**
   * Token details.
   * Note: This object may not resolve all fields defined in the Token type,
   * as only a subset of data is available in this context.
   */
  token: Token;
  /** Current time window for the competition */
  window: CompetitionWindow;
};

export type Launchpad = {
  __typename?: 'Launchpad';
  /** The name of the launchpad or associated launch platform. */
  name: Scalars['String'];
  /** Platform associated with the launchpad. */
  platform: Scalars['String'];
  /** URL to the platform's icon or logo. */
  platformIconURL: Scalars['String'];
  /** The protocol or platform powering the launchpad. */
  protocol: Scalars['String'];
  /** URL to the protocol's icon or logo. */
  protocolIconURL: Scalars['String'];
  /** The social interface or community platform associated with the launchpad. */
  socialInterface: Scalars['String'];
  /** URL to the social interface's icon or logo. */
  socialInterfaceIconURL: Scalars['String'];
};

export type LaunchpadResult = {
  __typename?: 'LaunchpadResult';
  /** Token Creator address. */
  creatorAddress: Scalars['String'];
  /** Indicates whether launchpad information is available for this token. */
  isLaunchpadAvailable: Scalars['Boolean'];
  /** launchpad associated with tokens. */
  launchpad?: Maybe<Launchpad>;
};

/** Represents a liquidity pool of Rainbow token, typically pairing the token with another asset. */
export type LiquidityPool = {
  __typename?: 'LiquidityPool';
  /** The contract address of the liquidity pool. */
  address: Scalars['ID'];
  chainId: Scalars['Int'];
  /** The contract address of the first token in the pair. */
  token0Address: Scalars['String'];
  /** The contract address of the second token in the pair (often the base currency like WETH). */
  token1Address: Scalars['String'];
};

/** Represents market data for a token. */
export type MarketData = {
  __typename?: 'MarketData';
  /** Number of unique holders of the token. */
  holders?: Maybe<Scalars['Int']>;
  /** The fully diluted market cap. */
  marketCapFDV: Scalars['String'];
  /** Trading volume for the last 24 hours in USD. */
  volume24h: Scalars['String'];
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
  nativeAssetNeedsApproval: Scalars['Boolean'];
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

export type NetworkDelegation = {
  __typename?: 'NetworkDelegation';
  enabled7702: Scalars['Boolean'];
};

export type NetworkEnabledServices = {
  __typename?: 'NetworkEnabledServices';
  addys: NetworkAddys;
  delegation: NetworkDelegation;
  launcher: NetworkLauncher;
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

export type NetworkLauncher = {
  __typename?: 'NetworkLauncher';
  v1: NetworkLauncherVersion;
};

export type NetworkLauncherVersion = {
  __typename?: 'NetworkLauncherVersion';
  contractAddress: Scalars['String'];
  enabled: Scalars['Boolean'];
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
  dAppsV2?: Maybe<DAppV2Result>;
  ensMarquee?: Maybe<EnsMarquee>;
  kingOfTheHill?: Maybe<KingOfTheHill>;
  kingOfTheHillLeaderBoard?: Maybe<KingOfTheHillRankings>;
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
  stats?: Maybe<RainbowTokenStats>;
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
  chainID?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  typeID?: InputMaybe<Scalars['Int']>;
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


export type QueryDAppsV2Args = {
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  protocolIDs?: InputMaybe<Array<Scalars['String']>>;
};


export type QueryKingOfTheHillArgs = {
  currency?: InputMaybe<Scalars['String']>;
};


export type QueryKingOfTheHillLeaderBoardArgs = {
  currency?: InputMaybe<Scalars['String']>;
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


export type QueryStatsArgs = {
  address: Scalars['String'];
  chainID: Scalars['Int'];
  currency?: InputMaybe<Scalars['String']>;
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

export type RainbowTokenDetails = {
  __typename?: 'RainbowTokenDetails';
  /** Information about the primary liquidity pool associated with this token, if available. */
  liquidityPool?: Maybe<LiquidityPool>;
  /** Descriptive metadata associated with the token. */
  metadata?: Maybe<RainbowTokenMetadata>;
  /** Data retrieved directly from the blockchain regarding the token. */
  onchainData?: Maybe<RainbowTokenOnchainData>;
};

/** Contains descriptive metadata for a token. */
export type RainbowTokenMetadata = {
  __typename?: 'RainbowTokenMetadata';
  /** A text description of the token. */
  description?: Maybe<Scalars['String']>;
  /** A URL pointing to the token's logo image. */
  logoUrl?: Maybe<Scalars['String']>;
  /** A URI (often IPFS or HTTP) pointing to more detailed token metadata conforming to a standard (e.g., ERC721/ERC1155). */
  tokenUri?: Maybe<Scalars['String']>;
};

/** Contains data about the token fetched directly from the blockchain. */
export type RainbowTokenOnchainData = {
  __typename?: 'RainbowTokenOnchainData';
  /** The address of the account that originally deployed the token contract. */
  creatorAddress?: Maybe<Scalars['String']>;
  /**
   * The Merkle root hash, often used for verified airdrop distributions.
   * May be zero if not applicable. (Included for completeness, might be niche)
   */
  merkleRoot?: Maybe<Scalars['String']>;
  /** The total supply of the token currently in existence (as a string to handle large numbers). */
  totalSupply: Scalars['String'];
};

export type RainbowTokenStats = {
  __typename?: 'RainbowTokenStats';
  /** Number of data buckets used (meaning might need clarification from source) */
  bucketCount: Scalars['Int'];
  /** Timestamp of the last known transaction included in the summary (Unix timestamp) */
  lastTransaction: Scalars['Time'];
  /** liquidity pool */
  liquidityPool: LiquidityPool;
  /** An array of summaries for different predefined time durations */
  summary: Array<Maybe<DurationSummary>>;
};

export type RankingDetails = {
  __typename?: 'RankingDetails';
  /** Timestamp when this market data was last refreshed */
  lastUpdated: Scalars['Int'];
  /** Metric that determined the winner , supported values are "volume", "latestTransaction", "volume24h"  */
  rankingCriteria: Scalars['String'];
  /** Reason for the token's victory (e.g., "highest volume") */
  rankingCriteriaDesc: Scalars['String'];
  /** Trading volume specific to the current competition window */
  windowTradingVolume: Scalars['String'];
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

export type Stats = {
  __typename?: 'Stats';
  /** Volume attributed to buy transactions */
  buyVolume: Scalars['Float'];
  /** Number of unique wallets that bought */
  buyers: Scalars['Int'];
  /** Number of buy transactions */
  buys: Scalars['Int'];
  /** Price change in percentage (e.g., 5.0 means +5%, -3.2 means -3.2%) */
  priceChangePct: Scalars['Float'];
  /** Volume attributed to sell transactions */
  sellVolume: Scalars['Float'];
  /** Number of unique wallets that sold */
  sellers: Scalars['Int'];
  /** Number of sell transactions */
  sells: Scalars['Int'];
  /** Total number of transactions (buys + sells) */
  transactions: Scalars['Int'];
  /** Number of unique wallets that traded */
  uniques: Scalars['Int'];
  /** Total volume of trades in the specified currency */
  volume: Scalars['Float'];
};

export type Token = {
  __typename?: 'Token';
  address: Scalars['String'];
  allTime: TokenAllTime;
  bridging: Scalars['TokenBridging'];
  chainId: Scalars['Int'];
  circulatingSupply?: Maybe<Scalars['Float']>;
  colors: TokenColors;
  creationDate?: Maybe<Scalars['Time']>;
  decimals: Scalars['Int'];
  description?: Maybe<Scalars['String']>;
  fullyDilutedValuation?: Maybe<Scalars['Float']>;
  iconUrl?: Maybe<Scalars['String']>;
  launchpad?: Maybe<LaunchpadResult>;
  links?: Maybe<TokenLinks>;
  marketCap?: Maybe<Scalars['Float']>;
  /**
   * Grouped market-related for the token.
   *
   * Note: All internal fields related to market performance (e.g., market cap, volume, holders)
   * are being consolidated under this object for better structure and maintainability.
   * Prefer accessing market-related values through this field going forward.
   */
  marketData?: Maybe<MarketData>;
  name: Scalars['String'];
  networks: Scalars['TokenNetworks'];
  price: TokenPrice;
  priceCharts: TokenPriceCharts;
  rainbow: Scalars['Boolean'];
  rainbowTokenDetails?: Maybe<RainbowTokenDetails>;
  status: TokenStatus;
  symbol: Scalars['String'];
  totalSupply?: Maybe<Scalars['Float']>;
  transferable: Scalars['Boolean'];
  type: Scalars['String'];
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
  farcaster?: Maybe<TokenLink>;
  homepage?: Maybe<TokenLink>;
  other?: Maybe<TokenLink>;
  rainbow?: Maybe<TokenLink>;
  reddit?: Maybe<TokenLink>;
  telegram?: Maybe<TokenLink>;
  twitter?: Maybe<TokenLink>;
};

export type TokenPrice = {
  __typename?: 'TokenPrice';
  relativeChange24h?: Maybe<Scalars['Float']>;
  updatedAt?: Maybe<Scalars['Time']>;
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
  authorization_list?: InputMaybe<Array<InputMaybe<Authorization>>>;
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

export type TransactionSimulationDelegation = {
  __typename?: 'TransactionSimulationDelegation';
  address: Scalars['String'];
  created?: Maybe<Scalars['Time']>;
  iconURL: Scalars['String'];
  name: Scalars['String'];
  sourceCodeStatus?: Maybe<VerificationStatus>;
};

export type TransactionSimulationMeta = {
  __typename?: 'TransactionSimulationMeta';
  to?: Maybe<TransactionSimulationTarget>;
  transferTo?: Maybe<TransactionSimulationTarget>;
};

export type TransactionSimulationResult = {
  __typename?: 'TransactionSimulationResult';
  approvals?: Maybe<Array<Maybe<TransactionSimulationApproval>>>;
  delegation?: Maybe<TransactionSimulationDelegation>;
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


export type SimulateTransactionsQuery = { __typename?: 'Query', simulateTransactions?: Array<{ __typename?: 'TransactionResult', scanning?: { __typename?: 'TransactionScanningResult', result: TransactionScanResultType, description: string } | null, error?: { __typename?: 'TransactionError', message: string, type: TransactionErrorType } | null, gas?: { __typename?: 'TransactionGasResult', estimate: string } | null, simulation?: { __typename?: 'TransactionSimulationResult', in?: Array<{ __typename?: 'TransactionSimulationChange', quantity: string, asset: { __typename?: 'TransactionSimulationAsset', assetCode: string, decimals: number, iconURL: string, name: string, network: string, symbol: string, type: TransactionAssetType, interface: TransactionAssetInterface, tokenId: string, status: VerificationStatus } } | null> | null, out?: Array<{ __typename?: 'TransactionSimulationChange', quantity: string, asset: { __typename?: 'TransactionSimulationAsset', assetCode: string, decimals: number, iconURL: string, name: string, network: string, symbol: string, type: TransactionAssetType, interface: TransactionAssetInterface, tokenId: string, status: VerificationStatus } } | null> | null, approvals?: Array<{ __typename?: 'TransactionSimulationApproval', quantityAllowed: string, quantityAtRisk: string, expiration?: any | null, asset: { __typename?: 'TransactionSimulationAsset', assetCode: string, decimals: number, iconURL: string, name: string, network: string, symbol: string, type: TransactionAssetType, interface: TransactionAssetInterface, tokenId: string, status: VerificationStatus }, spender: { __typename?: 'TransactionSimulationTarget', address: string, name: string, iconURL: string, function: string, created?: any | null, sourceCodeStatus?: VerificationStatus | null } } | null> | null, meta?: { __typename?: 'TransactionSimulationMeta', transferTo?: { __typename?: 'TransactionSimulationTarget', address: string, name: string, iconURL: string, function: string, created?: any | null, sourceCodeStatus?: VerificationStatus | null } | null, to?: { __typename?: 'TransactionSimulationTarget', address: string, name: string, iconURL: string, function: string, created?: any | null, sourceCodeStatus?: VerificationStatus | null } | null } | null, delegation?: { __typename?: 'TransactionSimulationDelegation', address: string, name: string, iconURL: string, created?: any | null, sourceCodeStatus?: VerificationStatus | null } | null } | null } | null> | null };

export type SimulateMessageQueryVariables = Exact<{
  chainId: Scalars['Int'];
  address: Scalars['String'];
  message: Message;
  domain?: InputMaybe<Scalars['String']>;
  currency?: InputMaybe<Scalars['String']>;
}>;


export type SimulateMessageQuery = { __typename?: 'Query', simulateMessage?: { __typename?: 'MessageResult', scanning?: { __typename?: 'TransactionScanningResult', result: TransactionScanResultType, description: string } | null, simulation?: { __typename?: 'TransactionSimulationResult', in?: Array<{ __typename?: 'TransactionSimulationChange', quantity: string, asset: { __typename?: 'TransactionSimulationAsset', assetCode: string, decimals: number, iconURL: string, name: string, network: string, symbol: string, type: TransactionAssetType, interface: TransactionAssetInterface, tokenId: string, status: VerificationStatus } } | null> | null, out?: Array<{ __typename?: 'TransactionSimulationChange', quantity: string, asset: { __typename?: 'TransactionSimulationAsset', assetCode: string, decimals: number, iconURL: string, name: string, network: string, symbol: string, type: TransactionAssetType, interface: TransactionAssetInterface, tokenId: string, status: VerificationStatus } } | null> | null, approvals?: Array<{ __typename?: 'TransactionSimulationApproval', quantityAllowed: string, quantityAtRisk: string, expiration?: any | null, asset: { __typename?: 'TransactionSimulationAsset', assetCode: string, decimals: number, iconURL: string, name: string, network: string, symbol: string, type: TransactionAssetType, interface: TransactionAssetInterface, tokenId: string, status: VerificationStatus }, spender: { __typename?: 'TransactionSimulationTarget', address: string, name: string, iconURL: string, function: string, created?: any | null, sourceCodeStatus?: VerificationStatus | null } } | null> | null, meta?: { __typename?: 'TransactionSimulationMeta', transferTo?: { __typename?: 'TransactionSimulationTarget', address: string, name: string, iconURL: string, function: string, created?: any | null, sourceCodeStatus?: VerificationStatus | null } | null, to?: { __typename?: 'TransactionSimulationTarget', address: string, name: string, iconURL: string, function: string, created?: any | null, sourceCodeStatus?: VerificationStatus | null } | null } | null } | null, error?: { __typename?: 'TransactionError', message: string, type: TransactionErrorType } | null } | null };

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
      delegation {
        address
        name
        iconURL
        created
        sourceCodeStatus
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
    simulateMessage(variables: SimulateMessageQueryVariables, options?: C): Promise<SimulateMessageQuery> {
      return requester<SimulateMessageQuery, SimulateMessageQueryVariables>(SimulateMessageDocument, variables, options) as Promise<SimulateMessageQuery>;
    },
    externalToken(variables: ExternalTokenQueryVariables, options?: C): Promise<ExternalTokenQuery> {
      return requester<ExternalTokenQuery, ExternalTokenQueryVariables>(ExternalTokenDocument, variables, options) as Promise<ExternalTokenQuery>;
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;
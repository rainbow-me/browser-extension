import { hex } from 'chroma-js';
import { motion } from 'framer-motion';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { hexToNumber, isAddress, isHex } from 'viem';
import { Address, useMutation } from 'wagmi';
import { z } from 'zod';

import { getAccounts } from '~/core/keychain';
import { i18n } from '~/core/languages';
import { SupportedCurrencyKey, supportedCurrencies } from '~/core/references';
import {
  appSessionsStore,
  currentCurrencyStore,
  useRainbowChainsStore,
} from '~/core/state';
import { useContactsStore } from '~/core/state/contacts';
import { currentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { useRainbowChainAssetsStore } from '~/core/state/rainbowChainAssets';
import { walletNamesStore } from '~/core/state/walletNames';
import { ChainId } from '~/core/types/chains';
import { getDappHost, getDappHostname } from '~/core/utils/connectedApps';
import { mapToRange } from '~/core/utils/mapToRange';
import { isLowerCaseMatch } from '~/core/utils/strings';
import {
  Box,
  Button,
  Inline,
  Separator,
  Stack,
  Symbol,
  Text,
} from '~/design-system';
import { foregroundColorVars } from '~/design-system/styles/core.css';
import { globalColors } from '~/design-system/styles/designTokens';
import { delay } from '~/test/utils';

import { importWithSecret } from '../../handlers/wallet';

const t = {
  chainId: z.string().transform((s, ctx) => {
    const chainId = isHex(s) ? hexToNumber(s) : +s;
    if (isNaN(chainId)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid ChainId' });
      return z.NEVER;
    }
    return chainId;
  }),
  address: z
    .string()
    .refine((s) => isAddress(s), { message: 'Invalid address' })
    .transform((s) => s.toLowerCase() as Address),
};

const account = z.object({
  address: t.address,
  name: z.string().optional(),
});
type Account = z.infer<typeof account>;

const contact = z.object({
  address: t.address,
  name: z.string(),
});
type Contact = z.infer<typeof contact>;

const networkConfiguration = z.object({
  chainId: t.chainId,
  nickname: z.string(),
  rpcPrefs: z.object({
    blockExplorerUrl: z.string(),
  }),
  rpcUrl: z.string(),
  ticker: z.string(),
});
type NetworkConfiguration = z.infer<typeof networkConfiguration>;

const connectedDapp = z.object({
  origin: z.string({ description: 'dapp url' }),
  permissions: z.object({
    eth_accounts: z.object({
      id: z.string(),
      parentCapability: z.string(),
      invoker: z.string({ description: 'dapp url' }),
      caveats: z.array(
        z.object({ type: z.string(), value: z.array(t.address) }),
      ),
      date: z.number(),
    }),
  }),
});
type ConnectedDapp = z.infer<typeof connectedDapp>;

export const stateLogsSchema = z
  .object({
    metamask: z.object({
      identities: z
        .record(account)
        .transform((o) => Object.values(o) as Account[]),
      accounts: z
        .record(account)
        .transform((o) => Object.values(o) as Account[]),
      networkConfigurations: z
        .record(networkConfiguration)
        .transform((o) => Object.values(o) as NetworkConfiguration[]),
      // metamask address book is like { [chainId]: { [address]: { name, address, ... } }
      addressBook: z
        .record(z.record(contact))
        .transform(
          (addressBook) =>
            Object.values(addressBook).flatMap((chainAddressBook) =>
              Object.values(chainAddressBook),
            ) as Contact[],
        ),
      theme: z
        .union([z.literal('light'), z.literal('dark'), z.literal('os')])
        .transform((t) => (t === 'os' ? 'system' : t)),
      selectedAddress: t.address,
      currentCurrency: z
        .string()
        .optional()
        .transform(
          (c) =>
            Object.keys(supportedCurrencies).find((s) =>
              isLowerCaseMatch(s, c),
            ) as SupportedCurrencyKey | undefined,
        ),
      subjects: z
        .record(connectedDapp)
        .transform((o) => Object.values(o) as ConnectedDapp[]),
      allTokens: z
        .record(
          t.chainId,
          z.record(
            t.address,
            z.array(
              z.object({
                address: t.address,
                symbol: z.string(),
                decimals: z.number(),
                name: z.string(),
              }),
            ),
          ),
        )
        .transform((allTokens) =>
          Object.entries(allTokens)
            .map(([chainId, addressToTokens]) =>
              Object.values(addressToTokens).map(
                (tokens) =>
                  tokens?.map((token) => ({
                    ...token,
                    chainId: +chainId as ChainId,
                  })),
              ),
            )
            .flat(2)
            .filter(Boolean),
        ),
      ignoredNfts: z.array(
        z.object({
          address: t.address,
          tokenId: z.string(),
        }),
      ),
    }),
  })
  .transform((o) => o.metamask);

type MetamaskStateLogs = z.infer<typeof stateLogsSchema>;

const stopFromOpeningTheDroppedFile = (e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  e.stopPropagation();
};

function BrowseFilesButton({
  onFileChange,
  children,
}: PropsWithChildren<{
  onFileChange: (files: File | null) => void;
}>) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        style={{ display: 'none' }}
        type="file"
        accept=".json"
        ref={fileInputRef}
        onChange={(e) => {
          onFileChange(e.target.files?.[0] || null);
          e.target.value = '';
        }}
      />
      <Box
        as={motion.button}
        padding="3px"
        margin="-3px"
        borderRadius="4px"
        tabIndex={1}
        borderWidth="0px"
        style={{ background: hex(globalColors.blue10).alpha(0).hex() }}
        whileFocus={{ background: globalColors.blueA10, scale: 1.04 }}
        whileHover={{ background: globalColors.blueA10, scale: 1.04 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => fileInputRef.current?.click()}
      >
        <Text color="blue" size="12pt" weight="medium" as="span">
          {children}
        </Text>
      </Box>
    </>
  );
}

const DropOrBrowse = ({
  onFileChange,
}: {
  onFileChange: (files: File | null) => void;
}) => {
  return (
    <>
      <Box
        style={{ height: 62, marginTop: -14 }}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Symbol symbol="doc.badge.plus" color="pink" size={35} weight="bold" />
      </Box>

      <Stack space="8px" alignItems="center">
        <Inline space="4px" wrap={false}>
          <Text color="labelSecondary" size="12pt" weight="medium">
            {i18n.t('import_from_metamask.drag-n-drop_or')}
          </Text>
          <BrowseFilesButton onFileChange={onFileChange}>
            {i18n.t('import_from_metamask.browse')}
          </BrowseFilesButton>
          <Text color="labelSecondary" size="12pt" weight="medium">
            {i18n.t('import_from_metamask.to_import')}
          </Text>
        </Inline>

        <Box
          borderRadius="5px"
          padding="4px"
          background="surfaceSecondaryElevated"
          borderColor="buttonStroke"
          borderWidth="1px"
        >
          <Text color="labelSecondary" size="12pt" weight="medium">
            {i18n.t('import_from_metamask.metamask_state_logs_file_name')}
          </Text>
        </Box>
      </Stack>
    </>
  );
};

function ProgressCircle({ progress }: { progress: number }) {
  const size = 48;
  const strokeWidth = 2;
  const viewportSize = size + strokeWidth * 2;
  const pathLength = mapToRange(progress, [0, 100], [0, 1]);
  return (
    <svg
      width={viewportSize}
      height={viewportSize}
      viewBox={`0 0 ${viewportSize} ${viewportSize}`}
      style={{ transform: 'rotate(-90deg)' }}
    >
      <circle
        r={size / 2}
        cx={viewportSize / 2}
        cy={viewportSize / 2}
        fill="transparent"
        stroke={foregroundColorVars.separator}
        strokeWidth={strokeWidth}
      />
      <motion.circle
        r={size / 2}
        cx={viewportSize / 2}
        cy={viewportSize / 2}
        fill="transparent"
        stroke={foregroundColorVars.pink}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
        initial={{ pathLength }}
        animate={{ pathLength }}
        transition={{ duration: 0.5 }}
      />
    </svg>
  );
}

function ImportingFile() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setTimeout(() => setProgress(15), 100);
    setTimeout(() => setProgress(40), 1400);
    setTimeout(() => setProgress(55), 2500);
    setTimeout(() => setProgress(75), 3200);
    setTimeout(() => setProgress(100), 5000);
  }, []);

  return (
    <>
      <Box
        as={motion.div}
        position="relative"
        animate={{ scale: progress === 100 ? 0.9 : 1 }}
        transition={{ delay: 0.5, duration: 0.2 }}
        style={{ height: 62, marginTop: -14 }}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <ProgressCircle progress={progress} />
        <Box
          position="absolute"
          style={{
            top: 'calc(50% + 1px)',
            left: 'calc(50% + 1.2px)', // opticaly align icon with circle
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Symbol
            symbol="doc.text.magnifyingglass"
            color="pink"
            size={22}
            weight="bold"
          />
        </Box>
      </Box>

      <Stack space="8px" alignItems="center">
        <Text color="labelSecondary" size="12pt" weight="bold">
          {i18n.t('import_from_metamask.importing')}
        </Text>

        <Box
          borderRadius="5px"
          padding="4px"
          background="surfaceSecondaryElevated"
          borderColor="buttonStroke"
          borderWidth="1px"
        >
          <Text color="labelSecondary" size="12pt" weight="medium">
            {i18n.t('import_from_metamask.metamask_state_logs_file_name')}
          </Text>
        </Box>
      </Stack>
    </>
  );
}

function DoneCircle() {
  const size = 50;
  const strokeWidth = 2;
  const viewportSize = size + strokeWidth * 2 + 4 + 7;
  const center = viewportSize / 2;
  const radius = size / 2;
  return (
    <svg
      width={viewportSize}
      height={viewportSize}
      viewBox={`0 0 ${viewportSize} ${viewportSize}`}
      style={{ transform: 'rotate(-90deg)' }}
    >
      <circle
        r={radius}
        cx={center}
        cy={center}
        fill="transparent"
        stroke={foregroundColorVars.green}
        strokeWidth={strokeWidth}
      />
      <motion.circle
        initial={{ opacity: 0, scale: 0.84 }}
        animate={{ opacity: 0.09, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        r={radius + 4}
        cx={center}
        cy={center}
        fill="transparent"
        stroke={foregroundColorVars.green}
        strokeWidth={1}
      />
      <motion.circle
        initial={{ opacity: 0, scale: 0.68 }}
        animate={{ opacity: 0.03, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        r={radius + 7}
        cx={center}
        cy={center}
        fill="transparent"
        stroke={foregroundColorVars.green}
        strokeWidth={1}
      />
    </svg>
  );
}

function ImportDone() {
  return (
    <>
      <Box
        as={motion.div}
        position="relative"
        initial={{ scale: 0.864 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ height: 62, marginTop: -14 }}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <DoneCircle />
        <Box
          position="absolute"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Symbol symbol="checkmark" color="green" size={22} weight="bold" />
        </Box>
      </Box>

      <Stack space="8px" alignItems="center">
        <Text color="labelSecondary" size="12pt" weight="bold">
          {i18n.t('import_from_metamask.done')}
        </Text>

        <Box
          borderRadius="5px"
          padding="4px"
          background="surfaceSecondaryElevated"
          borderColor="buttonStroke"
          borderWidth="1px"
        >
          <Text color="labelSecondary" size="12pt" weight="medium">
            {i18n.t('import_from_metamask.metamask_state_logs_file_name')}
          </Text>
        </Box>
      </Stack>
    </>
  );
}

function ImportError() {
  return (
    <>
      <Box
        as={motion.div}
        position="relative"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ height: 62 }}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Symbol symbol="xmark.circle" color="red" size={48} weight="bold" />
      </Box>

      <Stack space="8px" alignItems="center">
        <Text color="labelSecondary" size="12pt" weight="bold">
          {i18n.t('import_from_metamask.error')}
        </Text>

        <Box
          borderRadius="5px"
          padding="4px"
          background="surfaceSecondaryElevated"
          borderColor="buttonStroke"
          borderWidth="1px"
        >
          <Text color="labelSecondary" size="12pt" weight="medium">
            {i18n.t('import_from_metamask.metamask_state_logs_file_name')}
          </Text>
        </Box>
      </Stack>
    </>
  );
}

const importStateLogs = async (stateLogs: MetamaskStateLogs) => {
  // contacts
  const contacts = useContactsStore.getState();
  const contactsToImport = stateLogs.addressBook.filter(
    (c) => !contacts.isContact(c),
  );
  contactsToImport.forEach((contact) => contacts.saveContact({ contact }));

  // accounts
  const accounts = await getAccounts();
  const accountsToImport = stateLogs.accounts.filter(
    (account) => !accounts.includes(account.address),
  );
  const walletNames = walletNamesStore.getState();
  accountsToImport.forEach((account) => {
    importWithSecret(account.address);
    const { name, address } = account;
    if (name) walletNames.saveWalletName({ address, name });
  });

  // currency
  if (stateLogs.currentCurrency) {
    currentCurrencyStore
      .getState()
      .setCurrentCurrency(stateLogs.currentCurrency);
  }

  // TODO: add hidden nfts when we support it (stateLogs.ignoredNfts)

  // dapp sessions
  stateLogs.subjects.forEach((s) => {
    const accounts = s.permissions.eth_accounts.caveats
      .filter((c) => c.type === 'restrictReturnedAccounts')
      .flatMap((c) => c.value);
    accounts.forEach((account) => {
      appSessionsStore.getState().addSession({
        address: account,
        chainId: ChainId.mainnet,
        url: s.origin,
        host: getDappHost(s.origin),
      });
    });
  });

  // tokens
  const { addRainbowChainAsset } = useRainbowChainAssetsStore.getState();
  stateLogs.allTokens.forEach((token) => {
    addRainbowChainAsset({
      chainId: token.chainId,
      rainbowChainAsset: token,
    });
  });

  // networks
  const customNetwork = useRainbowChainsStore.getState();
  stateLogs.networkConfigurations.forEach(
    ({ chainId, nickname, ticker, rpcPrefs, rpcUrl }) => {
      const decimals = 18;
      customNetwork.addCustomRPC({
        chain: {
          network: String(chainId), // deprecated just here for now to make ts happy
          id: chainId,
          name: nickname,
          nativeCurrency: {
            name: ticker,
            symbol: ticker,
            decimals,
          },
          blockExplorers: {
            default: {
              name: getDappHostname(rpcPrefs.blockExplorerUrl),
              url: rpcPrefs.blockExplorerUrl,
            },
          },
          rpcUrls: {
            default: { http: [rpcUrl] },
            public: { http: [rpcUrl] },
          },
        },
      });
    },
  );

  await delay(4200);

  // theme
  currentThemeStore.getState().setCurrentTheme(stateLogs.theme);

  await delay(1500);
};

function BackgroundGradient() {
  return (
    <Box
      position="absolute"
      style={{
        overflow: 'hidden',
        top: 0.5,
        borderRadius: 10,
        opacity: 0.25,
      }}
    >
      <motion.svg
        width="100%"
        height={205}
        filter="url(#f1)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <defs>
          <filter id="f1" x="0" y="0">
            <feGaussianBlur in="SourceGraphic" stdDeviation="60" />
          </filter>
        </defs>
        <motion.g
          style={{ translateY: 40, translateX: 80 }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 10 }}
        >
          <circle fill={foregroundColorVars.pink} r={40} cx={0} cy={0} />
          <circle fill={foregroundColorVars.orange} r={40} cx={120} cy={0} />
          <circle fill={foregroundColorVars.blue} r={40} cx={0} cy={120} />
          <circle fill={foregroundColorVars.purple} r={40} cx={120} cy={120} />
        </motion.g>
      </motion.svg>
    </Box>
  );
}

export function ImportFromMetamask() {
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  useEffect(() => {
    const onBlur = () => setIsDraggingOver(false);
    document.addEventListener('blur', onBlur);
    return () => {
      document.removeEventListener('blur', onBlur);
    };
  }, []);

  const { mutate: handleStateLogs, status } = useMutation(
    async (stateLogsFile: File | null) => {
      if (!stateLogsFile) return;

      const stateLogsText = await stateLogsFile.text();
      const stateLogs = stateLogsSchema.parse(JSON.parse(stateLogsText));

      return await importStateLogs(stateLogs);
    },
  );

  const isSuccessOrError = ['success', 'error'].includes(status);

  return (
    <Box
      paddingHorizontal="20px"
      paddingBottom="20px"
      justifyContent="space-between"
      alignItems="center"
      display="flex"
      flexDirection="column"
      flexGrow="1"
      onDragOver={(e) => {
        stopFromOpeningTheDroppedFile(e);
        setIsDraggingOver(true);
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={(e) => {
        stopFromOpeningTheDroppedFile(e);
        setIsDraggingOver(false);
        handleStateLogs(e.dataTransfer.files[0]);
      }}
    >
      <Stack space="24px" alignItems="center" paddingHorizontal="14px">
        <Stack space="12px" alignItems="center">
          <Text size="16pt" weight="bold">
            {i18n.t('import_from_metamask.title')}
          </Text>
          <Text
            color="labelTertiary"
            size="12pt"
            weight="medium"
            align="center"
          >
            {i18n.t('import_from_metamask.description')}
          </Text>
        </Stack>

        <Separator color="separatorTertiary" width={106} />

        <Box
          as={motion.div}
          gap="4px"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          borderRadius="12px"
          borderColor={isSuccessOrError ? 'separator' : 'separatorSecondary'}
          borderWidth="2px"
          style={{
            borderStyle: isSuccessOrError ? 'solid' : 'dashed',
            height: 210,
          }}
          width="full"
          position="relative"
          initial={{
            borderColor: isSuccessOrError
              ? foregroundColorVars.separatorSecondary
              : foregroundColorVars.buttonStroke,
          }}
          animate={{
            borderColor: isSuccessOrError
              ? foregroundColorVars.buttonStroke
              : foregroundColorVars.separatorSecondary,
          }}
          transition={{ duration: 0.5 }}
        >
          {(status === 'loading' || isDraggingOver) && <BackgroundGradient />}
          {status === 'idle' && <DropOrBrowse onFileChange={handleStateLogs} />}
          {status === 'loading' && <ImportingFile />}
          {status === 'error' && <ImportError />}
          {status === 'success' && <ImportDone />}
        </Box>

        <Separator color="separatorTertiary" width={106} />

        <Stack space="12px" alignItems="center">
          <Box
            borderRadius="8px"
            padding="8px"
            background="surfaceSecondaryElevated"
            borderColor="buttonStroke"
            borderWidth="1px"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            width="full"
          >
            <Text color="orange" size="12pt" weight="medium">
              {i18n.t('import_from_metamask.settings')}
            </Text>
            <Symbol
              symbol="arrow.right"
              color="labelQuaternary"
              size={8}
              weight="medium"
            />
            <Text color="orange" size="12pt" weight="medium">
              {i18n.t('import_from_metamask.advanced')}
            </Text>
            <Symbol
              symbol="arrow.right"
              color="labelQuaternary"
              size={8}
              weight="medium"
            />
            <Text color="orange" size="12pt" weight="medium">
              {i18n.t('import_from_metamask.download_state_logs')}
            </Text>
          </Box>
          <Text
            color="labelSecondary"
            size="12pt"
            weight="medium"
            align="center"
          >
            Download your State logs from MetaMask here and import them here to
            Rainbow.
          </Text>
        </Stack>
      </Stack>

      <motion.div
        initial={{ opacity: status === 'idle' ? 0.2 : 1 }}
        animate={{ opacity: status === 'idle' ? 1 : 0.2 }}
        style={{ width: '100%' }}
      >
        <Button
          height="44px"
          variant="flat"
          color="fill"
          width="full"
          disabled={status !== 'idle'}
        >
          {i18n.t('import_from_metamask.do_this_later')}
        </Button>
      </motion.div>
    </Box>
  );
}

import '../styles/global.css';
import clsx from 'clsx';
import { kebabCase, uniqBy } from 'lodash';
import type { AppProps } from 'next/app';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { Box } from '../../components/Box/Box';
import { Text } from '../../components/Text/Text';
import { Inset } from '../../components/Inset/Inset';
import { Stack } from '../../components/Stack/Stack';
import { semanticColorVars } from '../../styles/core.css';
import * as docs from '../docs';
import { Docs } from '../types';
import { useTheme } from '../hooks/useTheme';
import SunIcon from '../icons/SunIcon';
import MoonIcon from '../icons/MoonIcon';
import * as styles from '../styles/app.css';

function App({ Component, pageProps }: AppProps) {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  return (
    <Box style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <DesktopSidebar />
      {showMobileSidebar && (
        <MobileSidebar onHideSidebar={() => setShowMobileSidebar(false)} />
      )}
      <MobileHeader onToggleSidebar={() => setShowMobileSidebar((x) => !x)} />
      <Content>
        <Component {...pageProps} />
      </Content>
    </Box>
  );
}

export default App;

// ////////////////////////////////////////////////////////////////
// Theme toggler

function ThemeToggle() {
  const { theme, nextTheme, toggleTheme } = useTheme();
  return (
    <Box style={{ position: 'fixed', right: '24px', top: '24px' }}>
      {theme && (
        <Box onClick={toggleTheme} style={{ cursor: 'default' }}>
          <Box
            style={{
              color: semanticColorVars.foregroundColors.label,
              width: 28,
              height: 28,
            }}
          >
            {nextTheme === 'light' ? <SunIcon /> : <MoonIcon />}
          </Box>
        </Box>
      )}
    </Box>
  );
}

// ////////////////////////////////////////////////////////////////
// Mobile header

function MobileHeader({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  return (
    <Box className={styles.mobileHeader}>
      <Box className={styles.container} style={{ height: '100%' }}>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '100%',
          }}
        >
          <Link href="/" passHref>
            {/* TODO: <Link> */}
            <Box as="a" style={{ cursor: 'pointer' }}>
              <Image
                alt="rainbow icon"
                src="/rainbow-icon@128w.png"
                width={32}
                height={32}
              />
            </Box>
          </Link>
          <Box onClick={() => onToggleSidebar()}>
            <Text size="32pt" weight="semibold">
              🍔
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// ////////////////////////////////////////////////////////////////
// Sidebar

const categoryOrder: [string, string[]][] = [
  ['Layout', ['Box']],
  ['Contexts', []],
  ['Tokens', []],
];

const docsByCategory = Object.values(docs).reduce(
  (currentCategories: { [key: string]: Docs[] }, { default: doc }) => {
    return {
      ...currentCategories,
      [doc.category]: [...(currentCategories[doc.category] || []), doc],
    };
  },
  {},
);

const orderedDocsByCategory: [string, Docs[]][] = categoryOrder.map((order) => {
  const [category, subCategoryNames] = order;
  const subCategories = uniqBy(
    [
      ...subCategoryNames.map(
        (subCategoryName) =>
          docsByCategory[category].find(
            (subCategory) => subCategory.name === subCategoryName,
          ) as Docs,
      ),
      ...docsByCategory[category],
    ],
    'name',
  );
  return [category, subCategories];
});

function DesktopSidebar() {
  return (
    <Box className={styles.desktopSidebar}>
      <ThemeToggle />
      <Sidebar />
    </Box>
  );
}

function MobileSidebar({ onHideSidebar }: { onHideSidebar: () => void }) {
  return (
    <Box className={styles.mobileSidebar}>
      <Box className={styles.container}>
        <Inset top="12px">
          <SidebarItems onSelect={() => onHideSidebar()} />
        </Inset>
      </Box>
    </Box>
  );
}

function Sidebar() {
  return (
    <Inset horizontal="16px" top="52px">
      <Stack space="36px">
        <Link href="/" passHref>
          {/* TODO: <Link> */}
          <Box as="a" style={{ cursor: 'pointer' }}>
            <Image
              alt="rainbow icon"
              src="/rainbow-icon@128w.png"
              width={36}
              height={36}
            />
          </Box>
        </Link>
        <SidebarItems />
      </Stack>
    </Inset>
  );
}

export function SidebarItems({ onSelect }: { onSelect?: () => void }) {
  return (
    <Stack space="36px">
      {orderedDocsByCategory.map(([category, docs], i) => (
        <Stack key={i} space="24px">
          <Text color="labelSecondary" size="16pt" weight="semibold">
            {category}
          </Text>
          <Stack space="20px">
            {docs.map(({ name, category }, i) => (
              <Link
                key={i}
                href={`/${kebabCase(category)}/${kebabCase(name)}`}
                passHref
              >
                {/* TODO: <Link> */}
                <Box as="a" onClick={onSelect} style={{ cursor: 'pointer' }}>
                  <Text size="20pt" weight="semibold">
                    {name}
                  </Text>
                </Box>
              </Link>
            ))}
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}

// ////////////////////////////////////////////////////////////////
// Content

function Content({ children }: { children: React.ReactNode }) {
  return (
    <Box className={clsx(styles.content, styles.container)}>
      <Inset top="52px" bottom="80px">
        {children}
      </Inset>
    </Box>
  );
}

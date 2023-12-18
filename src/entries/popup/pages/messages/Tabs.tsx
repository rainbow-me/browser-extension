import * as TabsPrimitive from '@radix-ui/react-tabs';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CSSProperties,
  PropsWithChildren,
  createContext,
  useContext,
  useState,
} from 'react';

import { i18n } from '~/core/languages';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { Box, Inline, Inset, Separator, Symbol, Text } from '~/design-system';

import {
  overflowGradientDark,
  overflowGradientLight,
} from './OverflowGradient.css';

function TabTrigger({ value }: { value: string }) {
  const { selectedTab } = useContext(TabContext);
  return (
    <TabsPrimitive.Trigger value={value} asChild>
      <Box
        as={motion.div}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.99 }}
        tabIndex={0}
        margin="-8px"
        padding="8px"
        flexGrow="1"
        flexBasis="0"
        position="relative"
      >
        <Text align="center" size="14pt" weight="bold" color="label">
          {value}
        </Text>
        {selectedTab === value && (
          <Box
            as={motion.div}
            layoutId="selected-tab-indicator"
            style={{ inset: 0 }}
            position="absolute"
            borderRadius="8px"
            background="separator"
          />
        )}
      </Box>
    </TabsPrimitive.Trigger>
  );
}

export function TabContent({
  children,
  value,
}: PropsWithChildren<{ value: string }>) {
  return (
    <TabsPrimitive.Content value={value} asChild>
      <motion.div
        initial={{ x: 10, opacity: 0.4 }}
        animate={{ x: 0, opacity: 1 }}
      >
        {children}
      </motion.div>
    </TabsPrimitive.Content>
  );
}

export function TabsNav() {
  const { tabs } = useContext(TabContext);
  return (
    <>
      <TabsPrimitive.List asChild>
        <Inline space="16px" alignVertical="center" wrap={false}>
          {tabs.map((t) => (
            <TabTrigger key={t} value={t} />
          ))}
        </Inline>
      </TabsPrimitive.List>
      <Inset top="20px">
        <Separator color="separatorTertiary" />
      </Inset>
    </>
  );
}

const TabContext = createContext<{ tabs: string[]; selectedTab: string }>({
  tabs: [],
  selectedTab: '',
});

function ScrollableWithGradient({
  children,
  expanded,
  onExpand,
}: PropsWithChildren<{
  expanded: boolean;
  onExpand: VoidFunction;
}>) {
  const [isScrollable, setIsScrollable] = useState(false);
  const { currentTheme } = useCurrentThemeStore();
  const overflowGradient =
    currentTheme === 'dark' ? overflowGradientDark : overflowGradientLight;

  return (
    <Box
      className={isScrollable ? overflowGradient : undefined}
      style={{
        overflowX: 'visible',
        overflowY: 'hidden',
      }}
      paddingTop="4px"
      marginTop="-4px"
      marginBottom="-20px"
      marginHorizontal="-20px"
      paddingHorizontal="20px"
    >
      <Box
        style={{
          maxHeight: '100%',
          overflow: isScrollable ? 'scroll' : 'visible',
        }}
        paddingTop="4px"
        marginTop="-4px"
        paddingBottom="52px"
        paddingHorizontal="20px"
        marginHorizontal="-20px"
        gap="16px"
        display="flex"
        flexDirection="column"
        ref={(e) => {
          if (!e) return;
          setIsScrollable(e.scrollHeight > e.clientHeight);
        }}
      >
        {children}
        {(isScrollable || expanded) && (
          <ViewMoreButton onClick={onExpand} isActive={expanded} />
        )}
      </Box>
    </Box>
  );
}

export function TabFloatingButton(
  props: PropsWithChildren<{ onClick: VoidFunction; style: CSSProperties }>,
) {
  return (
    <Box
      as={motion.button}
      tabIndex={-1}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3 }}
      position="absolute"
      paddingRight="8px"
      paddingLeft="8px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      background="fillSecondary"
      backdropFilter="blur(10px)"
      boxShadow="12px"
      borderRadius="8px"
      borderWidth="1px"
      borderColor="separatorSecondary"
      gap="4px"
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      style={{ height: '28px', ...props.style, zIndex: 3 }}
    />
  );
}

function ViewMoreButton({
  onClick,
  isActive,
}: {
  onClick: VoidFunction;
  isActive: boolean;
}) {
  return (
    <TabFloatingButton
      style={{
        width: isActive ? 'auto' : '28px',
        bottom: 12,
        right: 12,
      }}
      onClick={onClick}
    >
      <Symbol
        symbol={
          isActive
            ? 'arrow.down.right.and.arrow.up.left'
            : 'arrow.up.left.and.arrow.down.right'
        }
        size={12}
        color="labelSecondary"
        weight="bold"
      />
      {isActive && (
        <Text size="14pt" weight="semibold" color="labelSecondary">
          {i18n.t('close')}
        </Text>
      )}
    </TabFloatingButton>
  );
}

export function CopyButton({
  withLabel,
  onClick,
}: {
  withLabel: boolean;
  onClick: VoidFunction;
}) {
  return (
    <TabFloatingButton onClick={onClick} style={{ bottom: 12, left: 12 }}>
      <Symbol
        symbol="square.on.square"
        size={12}
        color="labelSecondary"
        weight="bold"
      />
      {withLabel && (
        <Text size="14pt" weight="semibold" color="labelSecondary">
          {i18n.t('copy')}
        </Text>
      )}
    </TabFloatingButton>
  );
}

export function Tabs({
  children,
  tabs,
  initialTab = tabs[0],
  expanded,
  onExpand,
}: PropsWithChildren<{
  tabs: string[];
  initialTab?: string;
  expanded: boolean;
  onExpand: VoidFunction;
}>) {
  const [tab, setTab] = useState(initialTab);

  return (
    <TabContext.Provider value={{ tabs, selectedTab: tab }}>
      <TabsPrimitive.Root
        defaultValue={initialTab}
        onValueChange={setTab}
        orientation="horizontal"
        asChild
      >
        <Box
          as={motion.div}
          layout="preserve-aspect"
          transition={{
            layout: {
              type: 'spring',
              bounce: 0.2,
              duration: expanded ? 0.6 : 1,
            },
          }}
          display="flex"
          flexDirection="column"
          padding="20px"
          background="surfaceSecondaryElevated"
          borderRadius="20px"
          borderColor="separatorSecondary"
          borderWidth="1px"
          width="full"
          position="relative"
          style={{ maxHeight: expanded ? '100%' : 300, overflow: 'hidden' }}
        >
          {tabs.length > 1 && <TabsNav />}
          <AnimatePresence mode="wait">
            <ScrollableWithGradient
              key={tab}
              expanded={expanded}
              onExpand={onExpand}
            >
              {children}
            </ScrollableWithGradient>
          </AnimatePresence>
        </Box>
      </TabsPrimitive.Root>
    </TabContext.Provider>
  );
}

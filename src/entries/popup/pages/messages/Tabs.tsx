import * as TabsPrimitive from '@radix-ui/react-tabs';
import { motion } from 'framer-motion';
import { PropsWithChildren, createContext, useContext, useState } from 'react';

import { Box, Inline, Text } from '~/design-system';

function TabTrigger({ value }: { value: string }) {
  const { selectedTab } = useContext(TabContext);
  return (
    <TabsPrimitive.Trigger value={value} asChild>
      <Box
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
          <motion.div
            layoutId="selected-tab-indicator"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '8px',
              background: 'rgba(245, 248, 255, 0.12)',
            }}
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
    <TabsPrimitive.List asChild>
      <Inline space="16px" alignVertical="center" wrap={false}>
        {tabs.map((t) => (
          <TabTrigger key={t} value={t} />
        ))}
      </Inline>
    </TabsPrimitive.List>
  );
}

const TabContext = createContext<{ tabs: string[]; selectedTab: string }>({
  tabs: [],
  selectedTab: '',
});

export function Tabs({
  children,
  tabs,
  initialTab = tabs[0],
}: PropsWithChildren<{ tabs: string[]; initialTab?: string }>) {
  const [tab, setTab] = useState(initialTab);

  return (
    <TabContext.Provider value={{ tabs, selectedTab: tab }}>
      <TabsPrimitive.Root
        defaultValue={initialTab}
        onValueChange={setTab}
        orientation="horizontal"
        asChild
      >
        {children}
      </TabsPrimitive.Root>
    </TabContext.Provider>
  );
}

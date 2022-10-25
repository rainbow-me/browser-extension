import { Box, Stack, Text } from '../../';

export default function Index() {
  return (
    <>
      <Text size="32pt" weight="bold">
        RDS Web
      </Text>
      <Box style={{ height: '44px' }} />
      <Stack space="44px">
        <Text size="20pt" weight="medium">
          The goal of Rainbow Design System is to make it fast and easy to build
          and maintain standard Rainbow designs. As much as possible, component
          APIs at the screen level should be high level, reading the way a
          designer would describe them.
        </Text>
        <Text size="20pt" weight="medium">
          You ideally shouldn&apos;t have to write a bunch of low-level styling
          or manually adjust padding and margins on individual components to
          create visual balance. To achieve this, we need to start at the
          foundations and build up in layers.
        </Text>
        <Text size="20pt" weight="medium">
          These docs are not currently intended to be exhaustive, instead
          providing an overview of the core parts of the system. This is still a
          work in progress. APIs are incomplete and likely to change.
        </Text>
      </Stack>
    </>
  );
}

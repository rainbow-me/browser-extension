import React from 'react';

import { Code } from '../../docs/components/Code';
import { Paragraph } from '../../docs/components/Paragraph';
import { createExample } from '../../docs/createDocs';
import source from '../../docs/utils/source.macro';
import { Button } from '../Button/Button';
import { Inline } from '../Inline/Inline';
import { Stack } from '../Stack/Stack';

export const basic = createExample({
  name: 'Basic',
  showThemes: true,
  Example: () =>
    source(
      <Inline space="10px" wrap={false}>
        <Button color="accent" height="36px" variant="raised">
          Button
        </Button>
        <Button color="accent" height="36px" variant="flat">
          Button
        </Button>
        <Button color="accent" height="36px" variant="tinted">
          Button
        </Button>
        <Button color="accent" height="36px" variant="stroked">
          Button
        </Button>
        <Button height="36px" variant="white">
          Button
        </Button>
        <Button color="accent" height="36px" variant="transparent">
          Button
        </Button>
      </Inline>,
    ),
});

export const colors = createExample({
  name: 'Colors',
  showThemes: 'toggle',
  Example: () =>
    source(
      <Stack space="20px">
        <Inline space="10px" wrap={false}>
          <Button color="accent" height="36px" variant="raised">
            Button
          </Button>
          <Button color="accent" height="36px" variant="flat">
            Button
          </Button>
          <Button color="accent" height="36px" variant="tinted">
            Button
          </Button>
          <Button color="accent" height="36px" variant="stroked">
            Button
          </Button>
          <Button color="accent" height="36px" variant="transparent">
            Button
          </Button>
        </Inline>
        <Inline space="10px" wrap={false}>
          <Button color="blue" height="36px" variant="raised">
            Button
          </Button>
          <Button color="blue" height="36px" variant="flat">
            Button
          </Button>
          <Button color="blue" height="36px" variant="tinted">
            Button
          </Button>
          <Button color="blue" height="36px" variant="stroked">
            Button
          </Button>
          <Button color="blue" height="36px" variant="transparent">
            Button
          </Button>
        </Inline>
        <Inline space="10px" wrap={false}>
          <Button color="green" height="36px" variant="raised">
            Button
          </Button>
          <Button color="green" height="36px" variant="flat">
            Button
          </Button>
          <Button color="green" height="36px" variant="tinted">
            Button
          </Button>
          <Button color="green" height="36px" variant="stroked">
            Button
          </Button>
          <Button color="green" height="36px" variant="transparent">
            Button
          </Button>
        </Inline>
        <Inline space="10px" wrap={false}>
          <Button color="orange" height="36px" variant="raised">
            Button
          </Button>
          <Button color="orange" height="36px" variant="flat">
            Button
          </Button>
          <Button color="orange" height="36px" variant="tinted">
            Button
          </Button>
          <Button color="orange" height="36px" variant="stroked">
            Button
          </Button>
          <Button color="orange" height="36px" variant="transparent">
            Button
          </Button>
        </Inline>
        <Inline space="10px" wrap={false}>
          <Button color="pink" height="36px" variant="raised">
            Button
          </Button>
          <Button color="pink" height="36px" variant="flat">
            Button
          </Button>
          <Button color="pink" height="36px" variant="tinted">
            Button
          </Button>
          <Button color="pink" height="36px" variant="stroked">
            Button
          </Button>
          <Button color="pink" height="36px" variant="transparent">
            Button
          </Button>
        </Inline>
        <Inline space="10px" wrap={false}>
          <Button color="purple" height="36px" variant="raised">
            Button
          </Button>
          <Button color="purple" height="36px" variant="flat">
            Button
          </Button>
          <Button color="purple" height="36px" variant="tinted">
            Button
          </Button>
          <Button color="purple" height="36px" variant="stroked">
            Button
          </Button>
          <Button color="purple" height="36px" variant="transparent">
            Button
          </Button>
        </Inline>
        <Inline space="10px" wrap={false}>
          <Button color="red" height="36px" variant="raised">
            Button
          </Button>
          <Button color="red" height="36px" variant="flat">
            Button
          </Button>
          <Button color="red" height="36px" variant="tinted">
            Button
          </Button>
          <Button color="red" height="36px" variant="stroked">
            Button
          </Button>
          <Button color="red" height="36px" variant="transparent">
            Button
          </Button>
        </Inline>
        <Inline space="10px" wrap={false}>
          <Button color="yellow" height="36px" variant="raised">
            Button
          </Button>
          <Button color="yellow" height="36px" variant="flat">
            Button
          </Button>
          <Button color="yellow" height="36px" variant="tinted">
            Button
          </Button>
          <Button color="yellow" height="36px" variant="stroked">
            Button
          </Button>
          <Button color="yellow" height="36px" variant="transparent">
            Button
          </Button>
        </Inline>
        <Inline space="10px" wrap={false}>
          <Button color="fill" height="36px" variant="raised">
            Button
          </Button>
          <Button color="fill" height="36px" variant="flat">
            Button
          </Button>
          <Button color="fill" height="36px" variant="stroked">
            Button
          </Button>
        </Inline>
        <Inline space="10px" wrap={false}>
          <Button color="fillSecondary" height="36px" variant="raised">
            Button
          </Button>
          <Button color="fillSecondary" height="36px" variant="flat">
            Button
          </Button>
          <Button color="fillSecondary" height="36px" variant="stroked">
            Button
          </Button>
        </Inline>
        <Inline space="10px" wrap={false}>
          <Button color="surfacePrimaryElevated" height="36px" variant="raised">
            Button
          </Button>
          <Button color="surfacePrimaryElevated" height="36px" variant="flat">
            Button
          </Button>
          <Button
            color="surfacePrimaryElevated"
            height="36px"
            variant="stroked"
          >
            Button
          </Button>
        </Inline>
        <Inline space="10px" wrap={false}>
          <Button
            color="surfacePrimaryElevatedSecondary"
            height="36px"
            variant="raised"
          >
            Button
          </Button>
          <Button
            color="surfacePrimaryElevatedSecondary"
            height="36px"
            variant="flat"
          >
            Button
          </Button>
          <Button
            color="surfacePrimaryElevatedSecondary"
            height="36px"
            variant="stroked"
          >
            Button
          </Button>
        </Inline>
        <Inline space="10px" wrap={false}>
          <Button
            color="surfaceSecondaryElevated"
            height="36px"
            variant="raised"
          >
            Button
          </Button>
          <Button color="surfaceSecondaryElevated" height="36px" variant="flat">
            Button
          </Button>
          <Button
            color="surfaceSecondaryElevated"
            height="36px"
            variant="stroked"
          >
            Button
          </Button>
        </Inline>
      </Stack>,
    ),
});

export const sizes = createExample({
  name: 'Sizes',
  showThemes: 'toggle',
  Example: () =>
    source(
      <Stack space="20px">
        <Inline space="10px" wrap={false}>
          <Button color="accent" height="44px" variant="raised">
            Button
          </Button>
          <Button color="accent" height="44px" variant="flat">
            Button
          </Button>
          <Button color="accent" height="44px" variant="tinted">
            Button
          </Button>
          <Button color="accent" height="44px" variant="stroked">
            Button
          </Button>
          <Button height="44px" variant="white">
            Button
          </Button>
          <Button color="accent" height="44px" variant="transparent">
            Button
          </Button>
        </Inline>
        <Inline space="10px" wrap={false}>
          <Button color="accent" height="36px" variant="raised">
            Button
          </Button>
          <Button color="accent" height="36px" variant="flat">
            Button
          </Button>
          <Button color="accent" height="36px" variant="tinted">
            Button
          </Button>
          <Button color="accent" height="36px" variant="stroked">
            Button
          </Button>
          <Button height="36px" variant="white">
            Button
          </Button>
          <Button color="accent" height="36px" variant="transparent">
            Button
          </Button>
        </Inline>
        <Inline space="10px" wrap={false}>
          <Button color="accent" height="32px" variant="raised">
            Button
          </Button>
          <Button color="accent" height="32px" variant="flat">
            Button
          </Button>
          <Button color="accent" height="32px" variant="tinted">
            Button
          </Button>
          <Button color="accent" height="32px" variant="stroked">
            Button
          </Button>
          <Button height="32px" variant="white">
            Button
          </Button>
          <Button color="accent" height="32px" variant="transparent">
            Button
          </Button>
        </Inline>
        <Inline space="10px" wrap={false}>
          <Button color="accent" height="28px" variant="raised">
            Button
          </Button>
          <Button color="accent" height="28px" variant="flat">
            Button
          </Button>
          <Button color="accent" height="28px" variant="tinted">
            Button
          </Button>
          <Button color="accent" height="28px" variant="stroked">
            Button
          </Button>
          <Button height="28px" variant="white">
            Button
          </Button>
          <Button color="accent" height="28px" variant="transparent">
            Button
          </Button>
        </Inline>
        <Inline space="10px" wrap={false}>
          <Button color="accent" height="24px" variant="raised">
            Button
          </Button>
          <Button color="accent" height="24px" variant="flat">
            Button
          </Button>
          <Button color="accent" height="24px" variant="tinted">
            Button
          </Button>
          <Button color="accent" height="24px" variant="stroked">
            Button
          </Button>
          <Button height="24px" variant="white">
            Button
          </Button>
          <Button color="accent" height="24px" variant="transparent">
            Button
          </Button>
        </Inline>
      </Stack>,
    ),
});

export const widths = createExample({
  name: 'Widths',
  description: (
    <>
      <Paragraph>
        A button can either span the width of the container via{' '}
        <Code>full</Code>, or span the width of its content via <Code>fit</Code>
        .
      </Paragraph>
    </>
  ),
  Example: () =>
    source(
      <Stack space="10px">
        <Button color="accent" height="44px" variant="raised">
          Button
        </Button>
        <Button color="accent" height="44px" variant="flat" width="full">
          Button
        </Button>
      </Stack>,
    ),
});

export const emojis = createExample({
  name: 'Emojis',
  showThemes: true,
  Example: () =>
    source(
      <Inline space="10px" wrap={false}>
        <Button color="accent" icon="🤡" height="44px" variant="raised">
          Button
        </Button>
        <Button color="accent" icon="🤡" height="36px" variant="flat">
          Button
        </Button>
        <Button color="accent" icon="🤡" height="32px" variant="tinted">
          Button
        </Button>
        <Button color="accent" icon="🤡" height="28px" variant="stroked">
          Button
        </Button>
        <Button icon="🤡" height="24px" variant="white">
          Button
        </Button>
      </Inline>,
    ),
});

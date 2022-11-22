import React from 'react';

import { createExample } from '../../docs/createDocs';
import source from '../../docs/utils/source.macro';
import { Inline } from '../Inline/Inline';

import { Symbol } from './Symbol';

export const basic = createExample({
  name: 'Basic',
  showThemes: true,
  Example: () =>
    source(
      <Inline space="10px">
        <Symbol symbol="qrcode" weight="semibold" size="32pt" />
        <Symbol symbol="arrow.left" weight="semibold" size="32pt" />
        <Symbol symbol="binoculars.fill" weight="semibold" size="32pt" />
        <Symbol symbol="chevron.down" weight="semibold" size="32pt" />
        <Symbol
          symbol="person.crop.circle.fill"
          weight="semibold"
          size="32pt"
        />
        <Symbol
          symbol="square.on.square.dashed"
          weight="semibold"
          size="32pt"
        />
      </Inline>,
    ),
});

export const sizes = createExample({
  name: 'Sizes',
  Example: () =>
    source(
      <Inline space="10px">
        <Symbol symbol="qrcode" weight="semibold" size="32pt" />
        <Symbol symbol="qrcode" weight="semibold" size="26pt" />
        <Symbol symbol="qrcode" weight="semibold" size="23pt" />
        <Symbol symbol="qrcode" weight="semibold" size="20pt" />
        <Symbol symbol="qrcode" weight="semibold" size="16pt" />
        <Symbol symbol="qrcode" weight="semibold" size="14pt" />
        <Symbol symbol="qrcode" weight="semibold" size="12pt" />
        <Symbol symbol="qrcode" weight="semibold" size="11pt" />
      </Inline>,
    ),
});

export const weights = createExample({
  name: 'Weights',
  Example: () =>
    source(
      <Inline space="10px">
        <Symbol symbol="qrcode" weight="heavy" size="32pt" />
        <Symbol symbol="qrcode" weight="bold" size="32pt" />
        <Symbol symbol="qrcode" weight="semibold" size="32pt" />
        <Symbol symbol="qrcode" weight="medium" size="32pt" />
        <Symbol symbol="qrcode" weight="regular" size="32pt" />
      </Inline>,
    ),
});

export const colors = createExample({
  name: 'Colors',
  showThemes: true,
  Example: () =>
    source(
      <Inline space="10px">
        <Symbol color="accent" symbol="qrcode" weight="heavy" size="32pt" />
        <Symbol color="blue" symbol="qrcode" weight="heavy" size="32pt" />
        <Symbol color="green" symbol="qrcode" weight="heavy" size="32pt" />
        <Symbol color="label" symbol="qrcode" weight="heavy" size="32pt" />
        <Symbol
          color="labelQuaternary"
          symbol="qrcode"
          weight="heavy"
          size="32pt"
        />
        <Symbol
          color="labelSecondary"
          symbol="qrcode"
          weight="heavy"
          size="32pt"
        />
        <Symbol
          color="labelTertiary"
          symbol="qrcode"
          weight="heavy"
          size="32pt"
        />
        <Symbol color="orange" symbol="qrcode" weight="heavy" size="32pt" />
        <Symbol color="pink" symbol="qrcode" weight="heavy" size="32pt" />
        <Symbol color="purple" symbol="qrcode" weight="heavy" size="32pt" />
        <Symbol color="red" symbol="qrcode" weight="heavy" size="32pt" />
        <Symbol color="yellow" symbol="qrcode" weight="heavy" size="32pt" />
      </Inline>,
    ),
});

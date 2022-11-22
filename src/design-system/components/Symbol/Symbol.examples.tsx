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
        <Symbol symbol="qrcode" weight="semibold" size={32} />
        <Symbol symbol="arrow.left" weight="semibold" size={32} />
        <Symbol symbol="binoculars.fill" weight="semibold" size={32} />
        <Symbol symbol="chevron.down" weight="semibold" size={32} />
        <Symbol symbol="person.crop.circle.fill" weight="semibold" size={32} />
        <Symbol symbol="square.on.square.dashed" weight="semibold" size={32} />
      </Inline>,
    ),
});

export const sizes = createExample({
  name: 'Sizes',
  Example: () =>
    source(
      <Inline space="10px">
        <Symbol symbol="qrcode" weight="semibold" size={32} />
        <Symbol symbol="qrcode" weight="semibold" size={26} />
        <Symbol symbol="qrcode" weight="semibold" size={23} />
        <Symbol symbol="qrcode" weight="semibold" size={20} />
        <Symbol symbol="qrcode" weight="semibold" size={16} />
        <Symbol symbol="qrcode" weight="semibold" size={14} />
        <Symbol symbol="qrcode" weight="semibold" size={12} />
        <Symbol symbol="qrcode" weight="semibold" size={11} />
      </Inline>,
    ),
});

export const weights = createExample({
  name: 'Weights',
  Example: () =>
    source(
      <Inline space="10px">
        <Symbol symbol="qrcode" weight="heavy" size={32} />
        <Symbol symbol="qrcode" weight="bold" size={32} />
        <Symbol symbol="qrcode" weight="semibold" size={32} />
        <Symbol symbol="qrcode" weight="medium" size={32} />
        <Symbol symbol="qrcode" weight="regular" size={32} />
      </Inline>,
    ),
});

export const colors = createExample({
  name: 'Colors',
  showThemes: true,
  Example: () =>
    source(
      <Inline space="10px">
        <Symbol color="accent" symbol="qrcode" weight="heavy" size={32} />
        <Symbol color="blue" symbol="qrcode" weight="heavy" size={32} />
        <Symbol color="green" symbol="qrcode" weight="heavy" size={32} />
        <Symbol color="label" symbol="qrcode" weight="heavy" size={32} />
        <Symbol
          color="labelQuaternary"
          symbol="qrcode"
          weight="heavy"
          size={32}
        />
        <Symbol
          color="labelSecondary"
          symbol="qrcode"
          weight="heavy"
          size={32}
        />
        <Symbol
          color="labelTertiary"
          symbol="qrcode"
          weight="heavy"
          size={32}
        />
        <Symbol color="orange" symbol="qrcode" weight="heavy" size={32} />
        <Symbol color="pink" symbol="qrcode" weight="heavy" size={32} />
        <Symbol color="purple" symbol="qrcode" weight="heavy" size={32} />
        <Symbol color="red" symbol="qrcode" weight="heavy" size={32} />
        <Symbol color="yellow" symbol="qrcode" weight="heavy" size={32} />
      </Inline>,
    ),
});

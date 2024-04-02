import parseMilliseconds from 'parse-ms';

import { i18n } from '../languages';

const buildLocalizedTimeUnitString = ({
  plural,
  short,
  unit,
}: {
  plural?: boolean;
  short: boolean;
  unit: string;
}) => {
  const length = short ? 'short' : 'long';
  const plurality = plural ? 'plural' : 'singular';

  return i18n.t(`time.${unit}.${length}.${plurality}`);
};

const getHighestResolutionUnit = (
  timeUnitKey?: string,
  timeUnitValues?: { [key: string]: number },
) => {
  const highestResolutionUnit = timeUnitKey || 'seconds';
  return {
    unit: highestResolutionUnit,
    value: timeUnitValues?.[highestResolutionUnit] || 0,
  };
};

/**
 * @desc get time string for minimal unit
 * @param {String} [value='']
 * @param {Boolean} [short=true]
 * @param {Boolean} [plural=false]
 * @return {String}
 */
export const getMinimalTimeUnitStringForMs = (
  value: number,
  plural?: boolean,
  short = true,
): string => {
  const ms = Number(value);

  // eslint-disable-next-line prefer-const
  let { days, hours, minutes, seconds, milliseconds } = parseMilliseconds(ms);

  if (!seconds && milliseconds) seconds = milliseconds / 1000;

  const times = { days, hours, minutes, seconds };
  const timeUnitKey = Object.entries(times).find(
    ([, value]) => value !== 0,
  )?.[0];

  const { unit: highestResolutionUnit, value: highestResolutionValue } =
    getHighestResolutionUnit(timeUnitKey, { days, hours, minutes, seconds });

  const label = buildLocalizedTimeUnitString({
    plural,
    short,
    unit: highestResolutionUnit,
  });

  return `${highestResolutionValue} ${label}`;
};

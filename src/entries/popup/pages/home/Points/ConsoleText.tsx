import { motion } from 'framer-motion';

import { textStyles } from '~/design-system';
import { TextProps } from '~/design-system/components/Text/Text';

export default function ConsoleText({
  children,
  color = 'labelTertiary',
}: {
  color?: TextProps['color'];
  children: string;
}) {
  if (typeof children !== 'string')
    throw '<ConsoleText /> children must be string';
  return (
    <motion.span
      className={textStyles({
        textShadow: `16px ${color}`,
        textAlign: 'left',
        fontSize: '14pt mono',
        fontFamily: 'mono',
        fontWeight: 'semibold',
        color,
      })}
    >
      {children.split('').map((char, i) => (
        <motion.span
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
          }}
          key={`${char} ${i}`}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}

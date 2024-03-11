import { Box } from '~/design-system';

export function TokenMarkedHighlighter() {
  return (
    <Box
      background="accent"
      style={{
        position: 'absolute',
        height: '60%',
        top: '50%',
        left: '1.4px',
        transform: 'translateY(-50%)',
        borderTopRightRadius: '3px',
        borderBottomRightRadius: '3px',
        width: '2px',
      }}
    />
  );
}

import { LinkProps, Link as RRLink } from 'react-router-dom';

export function Link(props: LinkProps) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <RRLink {...props} style={{ cursor: 'default', ...props.style }} />;
}

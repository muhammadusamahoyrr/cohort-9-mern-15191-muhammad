import PropTypes from 'prop-types';
import clsx from 'clsx';

export default function Avatar({ name = '', className = '' }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <span className={clsx('avatar', className)} aria-hidden="true">
      {initials || '·'}
    </span>
  );
}

Avatar.propTypes = {
  name: PropTypes.string,
  className: PropTypes.string,
};


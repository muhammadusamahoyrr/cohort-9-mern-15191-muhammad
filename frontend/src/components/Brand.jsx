import PropTypes from 'prop-types';

export default function Brand({ size = 'md' }) {
  return (
    <span className={`brand brand--${size}`}>
      <span className="brand__mark" aria-hidden="true" />
      <span className="brand__name">Notebook</span>
    </span>
  );
}

Brand.propTypes = {
  size: PropTypes.string,
};


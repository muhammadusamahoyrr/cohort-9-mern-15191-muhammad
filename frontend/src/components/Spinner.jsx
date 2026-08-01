import PropTypes from 'prop-types';

export default function Spinner({ label = 'Loading...', inline = false }) {
  if (inline) {
    return <span className="spinner" role="status" aria-label={label} />;
  }

  return (
    <div className="spinner-wrap" role="status">
      <span className="spinner spinner--page" />
      <span>{label}</span>
    </div>
  );
}

Spinner.propTypes = {
  label: PropTypes.string,
  inline: PropTypes.bool,
};


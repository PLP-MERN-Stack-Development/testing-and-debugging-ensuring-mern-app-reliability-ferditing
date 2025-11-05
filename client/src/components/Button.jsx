import React from 'react';
import PropTypes from 'prop-types';

const variantClassMap = { primary: 'btn-primary', secondary: 'btn-secondary', danger: 'btn-danger' };
const sizeClassMap = { sm: 'btn-sm', md: 'btn-md', lg: 'btn-lg' };

export default function Button({ children, variant = 'primary', size = 'md', disabled = false, className = '', onClick, ...rest }) {
  const variantClass = variantClassMap[variant] || variantClassMap.primary;
  const sizeClass = sizeClassMap[size] || sizeClassMap.md;
  const disabledClass = disabled ? 'btn-disabled' : '';
  const combinedClass = `btn ${variantClass} ${sizeClass} ${disabledClass} ${className}`.trim();

  const handleClick = (e) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (onClick) onClick(e);
  };

  return (
    <button type="button" role="button" className={combinedClass} disabled={disabled} onClick={handleClick} {...rest}>
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func
};

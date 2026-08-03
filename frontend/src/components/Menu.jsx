import { useId, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import useDismiss from '../hooks/useDismiss';

export default function Menu({
  label,
  icon: Icon,
  triggerClass = 'iconbtn',
  items = [],
  align = 'right',
  dark = false,
  iconSize,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const menuId = useId();

  useDismiss(ref, open, () => setOpen(false));

  return (
    <div className="menu" ref={ref}>
      <button
        type="button"
        className={triggerClass}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        {Icon && <Icon {...(iconSize ? { width: iconSize, height: iconSize } : {})} />}
      </button>

      {open && (
        <div
          id={menuId}
          className={clsx('menu__panel', `menu__panel--${align}`, dark && 'menu__panel--dark')}
          role="menu"
        >
          {items.map((item, i) =>
            item.separator ? (
              <hr key={`sep-${i}`} className="menu__rule" />
            ) : item.heading ? (
              <p key={`head-${i}`} className="menu__heading">
                {item.label}
              </p>
            ) : (
              <button
                key={item.key || i}
                type="button"
                role="menuitem"
                className={clsx(
                  'menu__item',
                  item.danger && 'menu__item--danger',
                  item.checked && 'menu__item--checked'
                )}
                disabled={item.disabled}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpen(false);
                  item.onSelect?.();
                }}
              >
                {item.icon && <item.icon width={16} height={16} />}
                <span>{item.label}</span>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

Menu.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType,
  triggerClass: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.object),
  align: PropTypes.oneOf(['left', 'right']),
  dark: PropTypes.bool,
  iconSize: PropTypes.number,
};


import {
  ChevronDown,
  Link,
  Maximize2,
  MoreHorizontal,
  Palette,
  Pencil,
  Printer,
  Search,
  SquareCheckBig,
  Star,
  Trash2,
  X,
} from 'lucide-react';

const defaults = {
  size: 20,
  strokeWidth: 1.6,
  'aria-hidden': true,
  focusable: 'false',
};

export const WriteIcon = (p) => <Pencil {...defaults} {...p} />;
export const TodoIcon = (p) => <SquareCheckBig {...defaults} {...p} />;
export const ChevronDownIcon = (p) => <ChevronDown {...defaults} {...p} />;

export const SearchIcon = (p) => <Search {...defaults} {...p} />;
export const StarIcon = (p) => <Star {...defaults} {...p} />;
export const MoreIcon = (p) => <MoreHorizontal {...defaults} {...p} />;
export const TrashIcon = (p) => <Trash2 {...defaults} {...p} />;

export const CloseIcon = (p) => <X {...defaults} {...p} />;
export const ExpandIcon = (p) => <Maximize2 {...defaults} {...p} />;
export const ColorIcon = (p) => <Palette {...defaults} {...p} />;
export const LinkIcon = (p) => <Link {...defaults} {...p} />;
export const PrintIcon = (p) => <Printer {...defaults} {...p} />;


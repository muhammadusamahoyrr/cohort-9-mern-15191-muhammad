/* Every icon in the app comes from lucide. They're aliased here so swapping
   one out is a one-line change instead of a hunt through the components. */

import {
  Activity,
  AlarmClock,
  ArrowUpDown,
  Brush,
  Camera,
  ChevronDown,
  Code,
  Combine,
  Copy,
  ExternalLink,
  Filter,
  FolderInput,
  Globe,
  History,
  Info,
  Link,
  Lock,
  Mail,
  Maximize2,
  Mic,
  MoreHorizontal,
  NotebookText,
  Palette,
  PanelLeft,
  Paperclip,
  Pencil,
  Plus,
  Printer,
  RotateCcw,
  Redo2,
  Search,
  Settings,
  Share,
  SquareCheckBig,
  Star,
  Tag,
  Trash2,
  Undo2,
  User,
  Users,
  Video,
  X,
} from 'lucide-react';

// lucide draws at 24px with a 2px stroke. Our chrome is smaller and lighter.
const defaults = {
  size: 20,
  strokeWidth: 1.6,
  'aria-hidden': true,
  focusable: 'false',
};

// nav rail + top bar
export const SearchIcon = (p) => <Search {...defaults} {...p} />;
export const NotesIcon = (p) => <NotebookText {...defaults} {...p} />;
export const SharedIcon = (p) => <Users {...defaults} {...p} />;
export const ReminderIcon = (p) => <AlarmClock {...defaults} {...p} />;
export const BoardIcon = (p) => <PanelLeft {...defaults} {...p} />;
export const TrashIcon = (p) => <Trash2 {...defaults} {...p} />;
export const SettingsIcon = (p) => <Settings {...defaults} {...p} />;
export const PlusIcon = (p) => <Plus {...defaults} {...p} />;
export const ChevronDownIcon = (p) => <ChevronDown {...defaults} {...p} />;

// the new-note types
export const WriteIcon = (p) => <Pencil {...defaults} {...p} />;
export const CaptureIcon = (p) => <Camera {...defaults} {...p} />;
export const TodoIcon = (p) => <SquareCheckBig {...defaults} {...p} />;
export const AttachIcon = (p) => <Paperclip {...defaults} {...p} />;
export const DrawIcon = (p) => <Brush {...defaults} {...p} />;
export const AudioIcon = (p) => <Mic {...defaults} {...p} />;
export const VideoIcon = (p) => <Video {...defaults} {...p} />;

// list + card controls
export const StarIcon = (p) => <Star {...defaults} {...p} />;
export const MoreIcon = (p) => <MoreHorizontal {...defaults} {...p} />;
export const SortIcon = (p) => <ArrowUpDown {...defaults} {...p} />;
export const FilterIcon = (p) => <Filter {...defaults} {...p} />;

// editor chrome
export const CloseIcon = (p) => <X {...defaults} {...p} />;
export const ExpandIcon = (p) => <Maximize2 {...defaults} {...p} />;
export const ColorIcon = (p) => <Palette {...defaults} {...p} />;
export const TagIcon = (p) => <Tag {...defaults} {...p} />;
export const ShareIcon = (p) => <Share {...defaults} {...p} />;
export const CollaboratorIcon = (p) => <User {...defaults} {...p} />;
export const UndoIcon = (p) => <Undo2 {...defaults} {...p} />;
export const RedoIcon = (p) => <Redo2 {...defaults} {...p} />;
export const RotateIcon = (p) => <RotateCcw {...defaults} {...p} />;

// the note overflow and share menus
export const InfoIcon = (p) => <Info {...defaults} {...p} />;
export const HistoryIcon = (p) => <History {...defaults} {...p} />;
export const ActivityIcon = (p) => <Activity {...defaults} {...p} />;
export const MergeIcon = (p) => <Combine {...defaults} {...p} />;
export const LockIcon = (p) => <Lock {...defaults} {...p} />;
export const CopyIcon = (p) => <Copy {...defaults} {...p} />;
export const MoveIcon = (p) => <FolderInput {...defaults} {...p} />;
export const PrintIcon = (p) => <Printer {...defaults} {...p} />;
export const LinkIcon = (p) => <Link {...defaults} {...p} />;
export const MailIcon = (p) => <Mail {...defaults} {...p} />;
export const GlobeIcon = (p) => <Globe {...defaults} {...p} />;
export const CodeIcon = (p) => <Code {...defaults} {...p} />;
export const ExportIcon = (p) => <ExternalLink {...defaults} {...p} />;

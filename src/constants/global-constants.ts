import BarChart from '@/components/icons/bar_chart';
import Calendar from '@/components/icons/calendar';
import CheckCircle from '@/components/icons/check_circled';
import Chip from '@/components/icons/chip';
import ClipboardIcon from '@/components/icons/clipboardIcon';
import Compass from '@/components/icons/compass';
import Database from '@/components/icons/database';
import Flag from '@/components/icons/flag';
import Headphone from '@/components/icons/headphone';
import Home from '@/components/icons/home';
import Info from '@/components/icons/info';
import LinkIcon from '@/components/icons/link';
import Lock from '@/components/icons/lock';
import Message from '@/components/icons/messages';
import Notification from '@/components/icons/notification';
import Payment from '@/components/icons/payment';
import Person from '@/components/icons/person';
import Pipelines from '@/components/icons/pipelines';
import PluraCategory from '@/components/icons/plura-category';
import Power from '@/components/icons/power';
import Receipt from '@/components/icons/receipt';
import Send from '@/components/icons/send';
import Settings from '@/components/icons/settings';
import Shield from '@/components/icons/shield';
import Star from '@/components/icons/star';
import Tune from '@/components/icons/tune';
import Video from '@/components/icons/video_recorder';
import Wallet from '@/components/icons/wallet';
import Warning from '@/components/icons/warning';

export type Role = 'AGENCY_OWNER' | 'AGENCY_ADMIN' | 'SUB_ACCOUNT_USER' | 'SUB_ACCOUNT_GUEST';

export const roles: { [key in Role]: Role } = {
  AGENCY_OWNER: 'AGENCY_OWNER',
  AGENCY_ADMIN: 'AGENCY_ADMIN',
  SUB_ACCOUNT_USER: 'SUB_ACCOUNT_USER',
  SUB_ACCOUNT_GUEST: 'SUB_ACCOUNT_GUEST',
};

export type Url = 'SUB_ACCOUNT' | 'SIGN_IN' | 'AGENCY' | 'BILLING' | 'LAUNCHPAD' | 'SETTINGS' | 'ALL_SUB_ACCOUNTS' | 'TEAM' | 'HOME' | 'SIGN_UP' | 'FUNNELS' | 'MEDIA' | 'PIPELINES' | 'CONTACTS' | 'MEMBER' | 'MEMBERS';

export const urls: { [key in Url]: string } = {
  SUB_ACCOUNT: '/subaccount',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  AGENCY: '/agency',
  BILLING: '/billing',
  LAUNCHPAD: '/launchpad',
  FUNNELS: '/funnels',
  MEDIA: '/media',
  SETTINGS: '/settings',
  PIPELINES: '/pipelines',
  CONTACTS: '/contacts',
  ALL_SUB_ACCOUNTS: '/all-subaccounts',
  TEAM: '/team',
  HOME: '/',
  MEMBER: '/member',
  MEMBERS: '/members',
};

export type AccountTypes = 'AGENCY' | 'SUB_ACCOUNT' | 'MEMBER';

export const accountTypes: { [key in AccountTypes]: string } = {
  AGENCY: 'agency',
  SUB_ACCOUNT: 'subaccount',
  MEMBER: 'member',
};

export const icons = [
  {
    value: 'chart',
    label: 'Bar Chart',
    path: BarChart,
  },
  {
    value: 'headphone',
    label: 'Headphones',
    path: Headphone,
  },
  {
    value: 'send',
    label: 'Send',
    path: Send,
  },
  {
    value: 'pipelines',
    label: 'Pipelines',
    path: Pipelines,
  },
  {
    value: 'calendar',
    label: 'Calendar',
    path: Calendar,
  },
  {
    value: 'settings',
    label: 'Settings',
    path: Settings,
  },
  {
    value: 'check',
    label: 'Check Circled',
    path: CheckCircle,
  },
  {
    value: 'chip',
    label: 'Chip',
    path: Chip,
  },
  {
    value: 'compass',
    label: 'Compass',
    path: Compass,
  },
  {
    value: 'database',
    label: 'Database',
    path: Database,
  },
  {
    value: 'flag',
    label: 'Flag',
    path: Flag,
  },
  {
    value: 'home',
    label: 'Home',
    path: Home,
  },
  {
    value: 'info',
    label: 'Info',
    path: Info,
  },
  {
    value: 'link',
    label: 'Link',
    path: LinkIcon,
  },
  {
    value: 'lock',
    label: 'Lock',
    path: Lock,
  },
  {
    value: 'messages',
    label: 'Messages',
    path: Message,
  },
  {
    value: 'notification',
    label: 'Notification',
    path: Notification,
  },
  {
    value: 'payment',
    label: 'Payment',
    path: Payment,
  },
  {
    value: 'power',
    label: 'Power',
    path: Power,
  },
  {
    value: 'receipt',
    label: 'Receipt',
    path: Receipt,
  },
  {
    value: 'shield',
    label: 'Shield',
    path: Shield,
  },
  {
    value: 'star',
    label: 'Star',
    path: Star,
  },
  {
    value: 'tune',
    label: 'Tune',
    path: Tune,
  },
  {
    value: 'videorecorder',
    label: 'Video Recorder',
    path: Video,
  },
  {
    value: 'wallet',
    label: 'Wallet',
    path: Wallet,
  },
  {
    value: 'warning',
    label: 'Warning',
    path: Warning,
  },
  {
    value: 'person',
    label: 'Person',
    path: Person,
  },
  {
    value: 'category',
    label: 'Category',
    path: PluraCategory,
  },
  {
    value: 'clipboardIcon',
    label: 'Clipboard Icon',
    path: ClipboardIcon,
  },
];

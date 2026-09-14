import type { LucideIcon } from 'lucide-react'
import { ArrowLeftRight, Droplet, LayoutDashboard } from 'lucide-react'
import type { TranslationKey } from '../i18n/types'

export interface NavLinkItem {
  type: 'link'
  to: string
  labelKey: TranslationKey
  icon: LucideIcon
  end?: boolean
}

export interface NavGroupItem {
  type: 'group'
  labelKey: TranslationKey
  icon: LucideIcon
  children: { to: string; labelKey: TranslationKey }[]
}

export type NavItem = NavLinkItem | NavGroupItem

export const navigationItems: NavItem[] = [
  {
    type: 'link',
    to: '/',
    labelKey: 'nav.dashboard',
    icon: LayoutDashboard,
    end: true,
  },
  {
    type: 'group',
    labelKey: 'nav.campaigns',
    icon: Droplet,
    children: [
      { to: '/reports/blood-donation', labelKey: 'nav.bloodDonation' },
      { to: '/staff', labelKey: 'nav.staff' },
    ],
  },
  {
    type: 'group',
    labelKey: 'nav.dutyOfChange',
    icon: ArrowLeftRight,
    children: [
      { to: '/duty-change/form', labelKey: 'nav.dutyFillForm' },
      { to: '/duty-change/employees', labelKey: 'nav.dutyChangeEmployees' },
    ],
  },
]

export const operationalReportSummaries = [
  {
    id: 'blood-donation',
    nameKey: 'reports.bloodDonation.name',
    descriptionKey: 'reports.bloodDonation.description',
    icon: Droplet,
    route: '/reports/blood-donation',
  },
] as const

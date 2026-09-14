import type { LucideIcon } from 'lucide-react'
import { Droplet, LayoutDashboard, Settings, Users } from 'lucide-react'
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
    children: [{ to: '/reports/blood-donation', labelKey: 'nav.bloodDonation' }],
  },
  {
    type: 'link',
    to: '/employees',
    labelKey: 'nav.employees',
    icon: Users,
  },
  {
    type: 'link',
    to: '/settings',
    labelKey: 'nav.settings',
    icon: Settings,
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

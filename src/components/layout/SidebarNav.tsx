import { NavLink, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { navigationItems, type NavItem } from '../../config/navigation'
import { useI18n } from '../../i18n/I18nProvider'
import { CollapsiblePanel, panelMotion } from '../ui/ExpandableSearchMenu'

function NavLinkClasses(isActive: boolean, nested = false) {
  return [
    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    panelMotion,
    nested ? 'ps-10' : '',
    isActive
      ? 'bg-nav-active-bg text-nav-active-fg'
      : 'text-nav-idle hover:bg-nav-hover-bg hover:text-foreground',
  ].join(' ')
}

function SidebarNavItem({ item }: { item: NavItem }) {
  const location = useLocation()
  const { t } = useI18n()
  const isGroup = item.type === 'group'
  const isGroupActive =
    isGroup && item.children.some((child) => location.pathname.startsWith(child.to))
  const [open, setOpen] = useState(isGroupActive)

  if (item.type === 'link') {
    const Icon = item.icon
    return (
      <NavLink
        to={item.to}
        end={item.end}
        className={({ isActive }) => NavLinkClasses(isActive)}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {t(item.labelKey)}
      </NavLink>
    )
  }

  const Icon = item.icon

  return (
    <div>
      <button
        type="button"
        className={`${NavLinkClasses(isGroupActive)} w-full justify-between`}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span className="flex items-center gap-3">
          <Icon className="h-4 w-4 shrink-0" />
          {t(item.labelKey)}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform ${panelMotion} ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <CollapsiblePanel open={open}>
        <div className="mt-1 space-y-1">
          {item.children.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              className={({ isActive }) => NavLinkClasses(isActive, true)}
              tabIndex={open ? undefined : -1}
            >
              {t(child.labelKey)}
            </NavLink>
          ))}
        </div>
      </CollapsiblePanel>
    </div>
  )
}

export function SidebarNav() {
  const { t } = useI18n()

  return (
    <nav className="space-y-1" aria-label={t('nav.main')}>
      {navigationItems.map((item) => (
        <SidebarNavItem key={item.type === 'link' ? item.to : item.labelKey} item={item} />
      ))}
    </nav>
  )
}

import { Home, Tent, MessageCircle, User } from 'lucide-react'

export const sidebarLinks = [
  {
    route: '/',
    label: 'Home',
    icon: Home,
  },
  {
    route: '/camp',
    label: 'Camp',
    icon: Tent,
  },
  {
    route: '/chat',
    label: 'Chat',
    icon: MessageCircle,
  },
  {
    route: '/profile',
    label: 'Profile',
    icon: User,
  },
]

// Tab routes in order for swipe navigation
export const TAB_ROUTES = sidebarLinks.map((link) => link.route)
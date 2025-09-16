// utils/menuItems.ts
import type { MenuItem } from '~/types/menu'

export const menuItems: MenuItem[] = [
  {
    title: 'sidebar.dashboard',
    icon: 'mdi-home',
    to: '/dashboard',
    value: 'dashboard',
    //permission: 'view_dashboard'
  },
  {
    title: 'sidebar.userManagement',
    icon: 'mdi-account-key',
    value: 'users',
    //permission: 'view_users',
    children: [
      {
        title: 'sidebar.users',
        icon: 'mdi-account-group',
        to: '/dashboard/users',
        value: 'users-list',
        //permission: 'view_users_list'
      },
      {
        title: 'sidebar.groups',
        icon: 'mdi-account-group-outline',
        to: '/dashboard/groups',
        value: 'groups',
        //permission: 'view_groups'
      }
    ]
  },
  {
    title: 'sidebar.banks',
    icon: 'mdi-bank',
    to: '/dashboard/banks',
    value: 'banks',
    //permission: 'view_banks',
    badge: {
      text: 'common.new',
      color: 'orange'
    }
  },
  {
    title: 'sidebar.checkOrders',
    icon: 'mdi-file-document',
    value: 'checks',
    // permission: 'view_orders',
    children: [
      {
        title: 'sidebar.orders',
        icon: 'mdi-file-document-outline',
        to: '/dashboard/orders',
        value: 'orders-list',
        //permission: 'view_orders_list'
      },
      {
        title: 'sidebar.orderSync',
        icon: 'mdi-sync',
        to: '/dashboard/orders/sync',
        value: 'orders-sync',
        //permission: 'view_order_sync'
      },
      {
        title: 'sidebar.printSync',
        icon: 'mdi-printer',
        to: '/dashboard/orders/print',
        value: 'print-sync',
        //permission: 'view_print_sync'
      },
      {
        title: 'sidebar.bankDelivery',
        icon: 'mdi-bank-transfer',
        to: '/dashboard/orders/bank-delivery',
        value: 'bank-delivery',
        //permission: 'view_bank_delivery'
      },
      {
        title: 'sidebar.bankSubmission',
        icon: 'mdi-bank-check',
        to: '/dashboard/orders/bank-submission',
        value: 'bank-submission',
        //permission: 'view_bank_submission'
      }
    ]
  },
  {
    title: 'sidebar.reports',
    icon: 'mdi-chart-box',
    value: 'reports',
    permission: 'view_reports',
    children: [
      {
        title: 'sidebar.orderPrint',
        icon: 'mdi-printer',
        to: '/dashboard/reports/order-print',
        value: 'order-print',
        //permission: 'view_order_print'
      }
    ]
  },
  {
    title: 'sidebar.settings',
    icon: 'mdi-cog',
    value: 'settings',
    //permission: 'view_settings',
    children: [
      {
        title: 'sidebar.ledgerData',
        icon: 'mdi-book',
        to: '/dashboard/settings/ledger',
        value: 'ledger-data',
        //permission: 'view_ledger_data'
      },
      {
        title: 'sidebar.ledgerSettings',
        icon: 'mdi-cog-outline',
        to: '/dashboard/settings/ledger-settings',
        value: 'ledger-settings',
        //permission: 'view_ledger_settings'
      },
      {
        title: 'sidebar.changePassword',
        icon: 'mdi-key',
        to: '/dashboard/settings/password',
        value: 'change-password',
        //permission: 'view_change_password'
      }
    ]
  }
]
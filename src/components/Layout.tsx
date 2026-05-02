import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const SIDEBAR_WIDTH = 256;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const menuGroups = [
    {
      key: 'products',
      title: t('nav.productsGroup'),
      items: [
        { label: t('nav.productCategories'), path: '/categories' },
        { label: t('nav.productsList'), path: '/products' },
      ],
    },
    {
      key: 'prices',
      title: t('nav.priceManagement'),
      items: [
        { label: t('nav.priceList'), path: '/prices' },
        { label: t('nav.priceCategories'), path: '/price-types' },
      ],
    },
    {
      key: 'orders',
      title: t('nav.orders'),
      items: [{ label: t('nav.ordersList'), path: '/orders' }],
    },
    {
      key: 'delivery',
      title: t('nav.delivery'),
      items: [
        { label: t('nav.clients'), path: '/customers' },
        { label: t('nav.expeditors'), path: '/expeditors' },
      ],
    },
  ];

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    products: true,
    prices: false,
    orders: false,
    delivery: false,
  });

  const openRoute = (path: string) => {
    navigate(path);
    setMobileOpen(false);
    setUserMenuOpen(false);
  };

  const toggleGroup = (groupKey: string) => {
    setOpenGroups((current) => ({ ...current, [groupKey]: !current[groupKey] }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white">
        <div className="flex h-14 items-center justify-between px-3 lg:px-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
              onClick={() => setMobileOpen((current) => !current)}
              aria-label="Toggle sidebar"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h12" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => openRoute('/')}
              className="text-lg font-semibold text-slate-900"
            >
              {t('layout.brandName')}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            <div className="relative">
              <button
                type="button"
                className="flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                onClick={() => setUserMenuOpen((current) => !current)}
                aria-expanded={userMenuOpen}
                aria-label="Open user menu"
              >
                <img
                  className="h-8 w-8 rounded-full"
                  src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                  alt="User"
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-md border border-slate-200 bg-white p-2 shadow-lg">
                  <div className="mb-2 border-b border-slate-200 px-2 pb-2">
                    <p className="text-sm font-semibold text-slate-900">Admin User</p>
                    <p className="text-xs text-slate-500">admin@example.com</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openRoute('/')}
                    className="w-full rounded px-2 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-100"
                  >
                    {t('nav.dashboard')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/25 md:hidden"
          aria-label="Close sidebar"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed bottom-0 left-0 top-14 z-40 w-64 border-r border-slate-200 bg-white transition-transform duration-200 md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: SIDEBAR_WIDTH }}
      >
        <div className="flex h-full flex-col overflow-y-auto p-3">
          <nav className="flex-1">
            <ul className="space-y-2 text-sm font-medium text-slate-700">
              <li>
                <button
                  type="button"
                  onClick={() => openRoute('/')}
                  className={`flex w-full items-center gap-3 rounded-md px-2 py-2 transition ${
                    location.pathname === '/'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 6.025A7.5 7.5 0 1 0 17.975 14H10V6.025Z" />
                    <path d="M13.5 3c-.169 0-.334.014-.5.025V11h7.975c.011-.166.025-.331.025-.5A7.5 7.5 0 0 0 13.5 3Z" />
                  </svg>
                  <span>{t('nav.dashboard')}</span>
                </button>
              </li>

              {menuGroups.map((group) => {
                const hasActiveChild = group.items.some((item) => location.pathname === item.path);
                const isOpen = openGroups[group.key] || hasActiveChild;

                return (
                  <li key={group.key}>
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.key)}
                      className={`flex w-full items-center justify-between rounded-md px-2 py-2 text-left transition ${
                        hasActiveChild || isOpen
                          ? 'bg-slate-100 text-slate-900'
                          : 'hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 4h1.5L9 16m0 0h8m-8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-8.5-3h9.25L19 7H7.312" />
                        </svg>
                        <span>{group.title}</span>
                      </span>
                      <svg
                        className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="m19 9-7 7-7-7" />
                      </svg>
                    </button>

                    {isOpen && (
                      <ul className="mt-1 space-y-1 py-1">
                        {group.items.map((item) => {
                          const isActive = location.pathname === item.path;

                          return (
                            <li key={item.path}>
                              <button
                                type="button"
                                onClick={() => openRoute(item.path)}
                                className={`block w-full rounded-md py-1.5 pl-10 pr-2 text-left text-sm transition ${
                                  isActive
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                              >
                                {item.label}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-4 rounded-md border border-indigo-200 bg-indigo-50 p-3 text-xs text-indigo-900">
            <p className="font-semibold">Beta version</p>
            <p className="mt-1 text-indigo-800">Navigation style updated to the new sidebar layout.</p>
          </div>
        </div>
      </aside>

      <main className="pt-14 md:pl-64">
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
};

export default Layout;

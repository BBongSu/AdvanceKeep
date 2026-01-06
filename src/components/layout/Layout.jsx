import React, { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { MENU_ITEMS } from '../../constants';

function Layout({ isDarkMode, toggleDarkMode, searchQuery, setSearchQuery }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState(MENU_ITEMS.NOTES);
    const [viewMode, setViewMode] = useState('card');
    const [sortOrder, setSortOrder] = useState('latest');

    const toggleSidebar = useCallback(() => {
        setSidebarOpen((prev) => !prev);
    }, []);

    const handleMenuClick = useCallback((menuId) => {
        setActiveMenu(menuId);
        setSidebarOpen(false);
    }, []);

    return (
        <div className={`app ${isDarkMode ? 'dark' : ''}`}>
            <Header
                toggleSidebar={toggleSidebar}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                isDarkMode={isDarkMode}
                onToggleDarkMode={toggleDarkMode}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
            />
            <Sidebar
                isOpen={sidebarOpen}
                onMenuClick={handleMenuClick}
                activeMenu={activeMenu}
            />
            <main className="main">
                <Outlet context={{ searchQuery, viewMode, sortOrder }} />
            </main>
        </div>
    );
}

export default Layout;

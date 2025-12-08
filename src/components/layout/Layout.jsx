import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { MENU_ITEMS } from '../../constants';

function Layout({ isDarkMode, toggleDarkMode, searchQuery, setSearchQuery }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState(MENU_ITEMS.NOTES);
    const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'

    const toggleSidebar = () => {
        setSidebarOpen((prev) => !prev);
    };

    const handleMenuClick = (menuId) => {
        setActiveMenu(menuId);
        setSidebarOpen(false);
    };

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
            />
            <Sidebar
                isOpen={sidebarOpen}
                onMenuClick={handleMenuClick}
                activeMenu={activeMenu}
            />
            <main className="main">
                <Outlet context={{ searchQuery, viewMode }} />
            </main>
        </div>
    );
}

export default Layout;

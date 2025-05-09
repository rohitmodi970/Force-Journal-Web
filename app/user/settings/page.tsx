"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { useTheme, ColorOption } from "@/utilities/context/ThemeContext"
import { User, Bell, Shield, Moon, Sun, ChevronRight, Palette, Settings as SettingsIcon } from 'lucide-react'

const SettingsPage = () => {
    const { currentTheme, isDarkMode, colorOptions, setCurrentTheme, toggleDarkMode } = useTheme();
    const [activeTab, setActiveTab] = useState('appearance');

    // Function to get text/background styles based on current theme
    const getThemeStyles = (isSelected = false) => {
        if (isSelected) {
            return {
                backgroundColor: currentTheme.light,
                color: currentTheme.primary,
                borderColor: currentTheme.primary
            };
        }
        return {};
    };

    const tabs = [
        { id: 'appearance', icon: <Palette size={18} />, label: 'Appearance' },
        { id: 'profile', icon: <User size={18} />, label: 'Profile' },
        { id: 'notifications', icon: <Bell size={18} />, label: 'Notifications' },
        { id: 'security', icon: <Shield size={18} />, label: 'Security' }
    ];

    // Color swatch component for theme selection
    const ColorSwatch = ({ color, selected, onClick }: { color: ColorOption; selected: boolean; onClick: () => void }) => (
        <button
            className={`w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center ${selected ? 'ring-4 ring-offset-2' : 'hover:scale-110'}`}
            style={{ 
                backgroundColor: color.primary,
                boxShadow: selected ? `0 0 0 2px ${isDarkMode ? '#374151' : 'white'}` : 'none',
                border: `1px solid ${color.primary}`
            }}
            onClick={onClick}
            aria-label={`Select ${color.name} theme`}
        >
            {selected && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            )}
        </button>
    );

    return (
        <div className="min-h-screen transition-colors duration-200 pt-28"
            style={{ 
                backgroundColor: 'var(--bg-page)', 
                color: 'var(--text-primary)'
            }}
        >
            <div className="container mx-auto p-4 md:p-6 lg:p-8">
                <div className="flex items-center mb-8 gap-3">
                    <SettingsIcon size={24} style={{ color: currentTheme.primary }} />
                    <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1">
                        <div className="rounded-xl shadow-sm overflow-hidden"
                            style={{ 
                                backgroundColor: 'var(--bg-secondary)',
                                borderColor: isDarkMode ? '#374151' : '#E5E7EB'
                            }}
                        >
                            <nav className="flex flex-col">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center px-4 py-3 transition-all duration-200 ${activeTab === tab.id ? 'font-medium' : 'hover:bg-opacity-50'}`}
                                        style={getThemeStyles(activeTab === tab.id)}
                                    >
                                        <span className="mr-3">{tab.icon}</span>
                                        <span>{tab.label}</span>
                                        <ChevronRight 
                                            size={18} 
                                            className="ml-auto"
                                            style={{ 
                                                opacity: activeTab === tab.id ? 1 : 0.5,
                                                color: activeTab === tab.id ? currentTheme.primary : 'inherit'
                                            }}
                                        />
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="rounded-xl shadow-sm p-5 md:p-6"
                            style={{ 
                                backgroundColor: 'var(--bg-secondary)',
                                borderColor: isDarkMode ? '#374151' : '#E5E7EB'
                            }}
                        >
                            {/* Appearance Tab */}
                            {activeTab === 'appearance' && (
                                <div>
                                    <h2 className="text-xl font-semibold mb-6">Appearance Settings</h2>
                                    
                                    {/* Theme Selector */}
                                    <div className="mb-8">
                                        <h3 className="text-lg font-medium mb-4">Color Theme</h3>
                                        <div className="flex flex-wrap gap-4">
                                            {colorOptions.map((color) => (
                                                <ColorSwatch 
                                                    key={color.name}
                                                    color={color}
                                                    selected={currentTheme.name === color.name}
                                                    onClick={() => setCurrentTheme(color)}
                                                />
                                            ))}
                                        </div>
                                        
                                        {/* Current Theme Preview */}
                                        <div className="mt-6 rounded-lg p-4 flex items-center justify-between"
                                            style={{ backgroundColor: currentTheme.light }}
                                        >
                                            <div>
                                                <span className="font-medium" style={{ color: currentTheme.primary }}>
                                                    Current Theme: {currentTheme.name}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: currentTheme.primary }}></div>
                                                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: currentTheme.medium }}></div>
                                                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: currentTheme.light }}></div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Dark Mode Toggle */}
                                    <div className="mb-4">
                                        <h3 className="text-lg font-medium mb-4">Mode</h3>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <button
                                                onClick={() => isDarkMode && toggleDarkMode()}
                                                className={`flex-1 rounded-lg p-4 flex items-center justify-between transition-all duration-200 ${!isDarkMode ? 'ring-2' : 'opacity-80 hover:opacity-100'}`}
                                                style={{ 
                                                    backgroundColor: isDarkMode ? 'var(--bg-page)' : 'white',
                                                    borderColor: !isDarkMode ? currentTheme.primary : 'transparent'
                                                }}
                                            >
                                                <div className="flex items-center">
                                                    <Sun size={20} className="mr-3 text-yellow-500" />
                                                    <span>Light Mode</span>
                                                </div>
                                                {!isDarkMode && (
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={currentTheme.primary} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                )}
                                            </button>
                                            
                                            <button
                                                onClick={() => !isDarkMode && toggleDarkMode()}
                                                className={`flex-1 rounded-lg p-4 flex items-center justify-between transition-all duration-200 ${isDarkMode ? 'ring-2' : 'opacity-80 hover:opacity-100'}`}
                                                style={{ 
                                                    backgroundColor: isDarkMode ? '#1a1e24' : '#334155',
                                                    color: 'white',
                                                    borderColor: isDarkMode ? currentTheme.primary : 'transparent'
                                                }}
                                            >
                                                <div className="flex items-center">
                                                    <Moon size={20} className="mr-3 text-indigo-300" />
                                                    <span>Dark Mode</span>
                                                </div>
                                                {isDarkMode && (
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={currentTheme.primary} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <div>
                                    <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
                                    <div className="space-y-4">
                                        <Link 
                                            href="/user/profile" 
                                            className="p-4 rounded-lg hover:bg-opacity-80 transition-all flex items-center justify-between"
                                            style={{ backgroundColor: isDarkMode ? '#2a303c' : '#f8fafc' }}
                                        >
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                                                    style={{ backgroundColor: currentTheme.light, color: currentTheme.primary }}
                                                >
                                                    <User size={18} />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium">View Profile</h3>
                                                    <p className="text-sm opacity-70">See how others view your profile</p>
                                                </div>
                                            </div>
                                            <ChevronRight size={20} className="opacity-60" />
                                        </Link>
                                        
                                        <Link 
                                            href="/user/profile/manage-profile" 
                                            className=" p-4 rounded-lg hover:bg-opacity-80 transition-all flex items-center justify-between"
                                            style={{ backgroundColor: isDarkMode ? '#2a303c' : '#f8fafc' }}
                                        >
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                                                    style={{ backgroundColor: currentTheme.light, color: currentTheme.primary }}
                                                >
                                                    <SettingsIcon size={18} />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium">Manage Profile</h3>
                                                    <p className="text-sm opacity-70">Update your profile information</p>
                                                </div>
                                            </div>
                                            <ChevronRight size={20} className="opacity-60" />
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Notifications Tab */}
                            {activeTab === 'notifications' && (
                                <div>
                                    <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>
                                    <div className="space-y-4">
                                        <Link 
                                            href="/user/notifications" 
                                            className=" p-4 rounded-lg hover:bg-opacity-80 transition-all flex items-center justify-between"
                                            style={{ backgroundColor: isDarkMode ? '#2a303c' : '#f8fafc' }}
                                        >
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                                                    style={{ backgroundColor: currentTheme.light, color: currentTheme.primary }}
                                                >
                                                    <Bell size={18} />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium">Notification Settings</h3>
                                                    <p className="text-sm opacity-70">Manage all your notification preferences</p>
                                                </div>
                                            </div>
                                            <ChevronRight size={20} className="opacity-60" />
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <div>
                                    <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
                                    <div className="space-y-4">
                                        <Link 
                                            href="/user/security" 
                                            className=" p-4 rounded-lg hover:bg-opacity-80 transition-all flex items-center justify-between"
                                            style={{ backgroundColor: isDarkMode ? '#2a303c' : '#f8fafc' }}
                                        >
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                                                    style={{ backgroundColor: currentTheme.light, color: currentTheme.primary }}
                                                >
                                                    <Shield size={18} />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium">Security Settings</h3>
                                                    <p className="text-sm opacity-70">Manage your account security</p>
                                                </div>
                                            </div>
                                            <ChevronRight size={20} className="opacity-60" />
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
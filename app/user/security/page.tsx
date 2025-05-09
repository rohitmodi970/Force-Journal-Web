import React from 'react'
import { Shield, AlertTriangle, Key, Activity, Bell, Smartphone } from 'lucide-react'

const Security = () => {
    return (
        <div className="p-6 max-w-4xl mx-auto pt-28">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-3">Account Security</h1>
            
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-8 shadow-sm">
                <div className="flex items-center space-x-3 mb-3">
                    <AlertTriangle className="h-6 w-6 text-blue-600" />
                    <p className="text-xl font-semibold text-blue-800">Feature Coming Soon</p>
                </div>
                <p className="text-gray-700">We're currently developing enhanced security features to better protect your account. These features will be available in the near future.</p>
            </div>
            
            <h2 className="text-2xl font-semibold mt-8 mb-5 text-gray-800">Upcoming Security Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FeatureCard 
                    icon={<Key className="h-6 w-6 text-indigo-600" />}
                    title="Two-Factor Authentication (2FA)"
                    description="Add an extra layer of security to your account with verification codes."
                />
                
                <FeatureCard 
                    icon={<Shield className="h-6 w-6 text-green-600" />}
                    title="Password Strength Monitoring"
                    description="Get insights on your password security and recommendations for improvement."
                />
                
                <FeatureCard 
                    icon={<Activity className="h-6 w-6 text-red-600" />}
                    title="Login Activity Tracking"
                    description="Monitor when and where your account is accessed for suspicious activity."
                />
                
                <FeatureCard 
                    icon={<Bell className="h-6 w-6 text-yellow-600" />}
                    title="Security Notifications"
                    description="Receive alerts about important security events related to your account."
                />
                
                <FeatureCard 
                    icon={<Smartphone className="h-6 w-6 text-purple-600" />}
                    title="Device Management"
                    description="View and manage all devices currently logged into your account."
                />
            </div>
        </div>
    )
}

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-3 mb-3">
            {icon}
            <h3 className="font-semibold text-lg">{title}</h3>
        </div>
        <p className="text-gray-600">{description}</p>
    </div>
)

export default Security

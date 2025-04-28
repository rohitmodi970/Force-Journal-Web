"use client"
import { Check,AlertCircle,Info,AlertTriangle } from 'lucide-react'
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
    message: string
    type?: ToastType
    visible: boolean
    onClose?: () => void
    duration?: number
}

const Toast: React.FC<ToastProps> = ({
    message,
    type = 'info',
    visible,
    onClose,
    duration = 3000,
}) => {
    React.useEffect(() => {
        if (visible && onClose) {
            const timer = setTimeout(() => {
                onClose()
            }, duration)
            
            return () => clearTimeout(timer)
        }
    }, [visible, onClose, duration])

    const typeStyles = {
        success: "bg-green-100 border-green-400 text-green-700",
        error: "bg-red-100 border-red-400 text-red-700",
        info: "bg-blue-100 border-blue-400 text-blue-700",
        warning: "bg-yellow-100 border-yellow-400 text-yellow-700"
    }

    const icons = {
        success: <Check size={18} />,
        error: <AlertCircle size={18} />,
        info: <Info size={18} />,
        warning: <AlertTriangle size={18} />
    }

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`fixed top-4 right-4 border px-4 py-3 rounded shadow-lg z-50 flex items-center ${typeStyles[type]}`}
                    style={{ maxWidth: "calc(100% - 2rem)" }}
                >
                    <div className="mr-2">{icons[type]}</div>
                    <p>{message}</p>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default Toast

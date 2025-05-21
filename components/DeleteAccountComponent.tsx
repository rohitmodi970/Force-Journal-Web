"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { AlertTriangle } from 'lucide-react'

const DeleteAccountComponent = ({ theme }: { theme: any }) => {
    const router = useRouter()
    const { data: session } = useSession()
    const [reason, setReason] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [confirmText, setConfirmText] = useState('')
    const [confirmationStep, setConfirmationStep] = useState(false)

    const proceedToConfirmation = () => {
        if (!reason.trim()) {
            setError('Please provide a reason for deleting your account')
            return
        }
        setConfirmationStep(true)
        setError('')
    }

    const handleAccountDeletion = async () => {
        if (confirmText !== 'DELETE') {
            setError('Please type DELETE to confirm account deletion')
            return
        }

        setIsSubmitting(true)
        setError('')

        try {
            const response = await fetch('/api/user/deleteAccount', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reason }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete account')
            }

            // Redirect to the goodbye page
            router.push('/user/account/deleted')
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const cancelDeletion = () => {
        if (confirmationStep) {
            setConfirmationStep(false)
            setConfirmText('')
        } else {
            setReason('')
        }
        setError('')
    }

    return (
        <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
                <AlertTriangle size={20} className="mr-2 text-red-500" />
                Delete Account
            </h3>
            
            <div className="bg-red-50 rounded-lg p-4 mb-6" style={{ borderLeft: `4px solid ${theme.primary}` }}>
                <p className="text-red-700">
                    Warning: Deleting your account will permanently remove all your data and cannot be undone.
                </p>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                    <p className="text-red-700">{error}</p>
                </div>
            )}
            
            {!confirmationStep ? (
                <div className="space-y-4">
                    <div>
                        <label htmlFor="reason" className="block text-sm font-medium mb-1">
                            Please tell us why you're leaving
                        </label>
                        <textarea
                            id="reason"
                            name="reason"
                            rows={3}
                            className="w-full border rounded-md p-2 text-sm"
                            style={{ 
                                borderColor: 'var(--border-color)',
                                backgroundColor: 'var(--bg-page)'
                            }}
                            placeholder="Your feedback helps us improve our service..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                    <div>
                        <button
                            type="button"
                            onClick={proceedToConfirmation}
                            className="px-4 py-2 rounded-md text-white text-sm transition-colors"
                            style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}
                        >
                            Request Account Deletion
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="font-medium text-red-600">
                        This action cannot be undone. All your data will be permanently deleted.
                    </p>
                    <div>
                        <label htmlFor="confirm" className="block text-sm font-medium mb-1">
                            To confirm deletion, please type <strong>DELETE</strong> in the field below:
                        </label>
                        <input
                            id="confirm"
                            type="text"
                            className="w-full border rounded-md p-2 text-sm"
                            style={{ 
                                borderColor: 'var(--border-color)',
                                backgroundColor: 'var(--bg-page)'
                            }}
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                        />
                    </div>
                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={cancelDeletion}
                            className="px-4 py-2 rounded-md text-sm border transition-colors"
                            style={{ 
                                backgroundColor: 'var(--bg-page)',
                                borderColor: 'var(--border-color)'
                            }}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleAccountDeletion}
                            className="px-4 py-2 rounded-md text-white text-sm transition-colors"
                            style={{ 
                                backgroundColor: confirmText === 'DELETE' ? '#ef4444' : '#f87171',
                                opacity: confirmText === 'DELETE' ? 1 : 0.6 
                            }}
                            disabled={isSubmitting || confirmText !== 'DELETE'}
                        >
                            {isSubmitting ? 'Deleting...' : 'Delete My Account Permanently'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DeleteAccountComponent
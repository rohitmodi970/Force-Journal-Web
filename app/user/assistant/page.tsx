'use client'

import React from 'react'
import { MessagesSquare, Clock, SparklesIcon, BrainCircuit, Zap, Construction } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const Assistant = () => {
    return (
        <div className="container mx-auto py-16 px-4 md:px-6">
            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-16"
            >
                <div className="flex justify-center mb-4">
                    <Construction className="h-16 w-16 text-primary" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">AI Assistant Coming Soon</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    We're building a powerful AI companion to help with your mental wellness journey.
                </p>
            </motion.div>

            {/* Feature Previews */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                {features.map((feature, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 * index }}
                        className="bg-card rounded-lg shadow-lg p-6 border border-border hover:shadow-xl transition-shadow"
                    >
                        <div className="flex items-center mb-4">
                            <div className="mr-4 p-2 rounded-full bg-primary/10">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold">{feature.title}</h3>
                        </div>
                        <p className="text-muted-foreground">{feature.description}</p>
                    </motion.div>
                ))}
            </div>

            {/* Preview Image/Animation */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="bg-gradient-to-br from-primary/30 to-secondary/30 rounded-2xl p-8 mb-16 shadow-lg"
            >
                <div className="mx-auto max-w-4xl">
                    <div className="aspect-video bg-card rounded-lg flex items-center justify-center border border-border">
                        <div className="text-center p-8">
                            <MessagesSquare className="h-16 w-16 mx-auto mb-4 text-primary" />
                            <div className="flex space-x-1 justify-center mb-8">
                                <div className="animate-pulse h-3 w-3 bg-primary rounded-full"></div>
                                <div className="animate-pulse h-3 w-3 bg-primary rounded-full" style={{ animationDelay: '300ms' }}></div>
                                <div className="animate-pulse h-3 w-3 bg-primary rounded-full" style={{ animationDelay: '600ms' }}></div>
                            </div>
                            <h3 className="text-xl font-medium">AI Assistant Interface Preview</h3>
                            <p className="text-muted-foreground mt-2">Development in progress</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* CTA */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="text-center"
            >
                <p className="text-lg mb-6">Want to be notified when our AI Assistant launches?</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link 
                        href="/user/journal/my-diary"
                        className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                        Go to Journal
                    </Link>
                    <button
                        className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-medium hover:bg-secondary/90 transition-colors"
                        onClick={() => alert('You will be notified when the Assistant launches!')}
                    >
                        Notify Me
                    </button>
                </div>
            </motion.div>
        </div>
    )
}

const features = [
    {
        icon: <BrainCircuit className="h-6 w-6 text-primary" />,
        title: "AI-Powered Insights",
        description: "Get personalized insights and patterns from your journal entries to understand your emotional trends."
    },
    {
        icon: <MessagesSquare className="h-6 w-6 text-primary" />,
        title: "Conversational Support",
        description: "Chat with our AI assistant about your feelings, get coping strategies, or simply reflect on your day."
    },
    {
        icon: <Zap className="h-6 w-6 text-primary" />,
        title: "Prompt Suggestions",
        description: "Receive thoughtful journal prompts based on your recent entries to inspire deeper reflection."
    },
    {
        icon: <Clock className="h-6 w-6 text-primary" />,
        title: "Progress Tracking",
        description: "Monitor your mental wellness journey with visual representations of your emotional patterns over time."
    },
    {
        icon: <SparklesIcon className="h-6 w-6 text-primary" />,
        title: "Guided Exercises",
        description: "Access personalized mindfulness and reflection exercises based on your emotional state."
    },
    {
        icon: <Clock className="h-6 w-6 text-primary" />,
        title: "Smart Reminders",
        description: "Get gentle reminders to journal, practice mindfulness, or engage with personalized wellness activities."
    },
]

export default Assistant

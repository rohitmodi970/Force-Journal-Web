import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, ChevronRight, ChevronDown, ArrowLeft,
    CheckCircle, Brain, FileText, Heart, ArrowRight,
    Sparkles, MessageCircle, Activity, Compass,
    Loader2
} from 'lucide-react';
import TypingText from './ui/TypingText';

const SnapStart = () => {
    const [currentSection, setCurrentSection] = useState(0);
    const [loading, setLoading] = useState(false);
    const totalSections = 10; // Landing + 8 questions + final welcome
    const [answers, setAnswers] = useState({});
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [submitStatus, setSubmitStatus] = useState<'loading' | 'success' | 'error' | null>(null);
    // Handle section navigation
    const goToNextSection = () => {
        if (currentSection === 0) {
            setLoading(true);
            setCurrentSection(currentSection + 1); // Change section immediately

            // Keep loading true for 3 seconds
            setTimeout(() => {
                setLoading(false);
            }, 3000);
        } else {
            // Add smooth transition with scroll to top
            window.scrollTo(0, 0);
            setCurrentSection(currentSection + 1);
        }
    };

    const goToPrevSection = () => {
        window.scrollTo(0, 0);
        setCurrentSection(currentSection - 1);
    };

    // Save answer to state
    // Save answer to state
    const handleInputChange = (question: string, answer: string) => {
        setFormData(prev => ({ ...prev, [question]: answer }));
    };
    // Handle checkbox selection
    const handleCheckboxChange = (question: string, option: string, checked: boolean) => {
        const currentAnswers = formData[question] || [];

        if (checked) {
            setFormData(prev => ({
                ...prev,
                [question]: [...currentAnswers, option]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [question]: currentAnswers.filter((item: string) => item !== option)
            }));
        }
    };
    const handleSubmit = async () => {
        try {
            setSubmitStatus('loading');

            // Mock API call - replace with actual backend integration
            // const response = await fetch('/api/onboarding', {
            //   method: 'POST',
            //   headers: {
            //     'Content-Type': 'application/json',
            //   },
            //   body: JSON.stringify(formData),
            // });

            // Simulate API response
            await new Promise(resolve => setTimeout(resolve, 1500));

            // if (!response.ok) throw new Error('Failed to submit');
            // const data = await response.json();

            setSubmitStatus('success');
            console.log('Data ready for submission:', formData);

            // Navigate to welcome screen after successful submission
            setTimeout(() => goToNextSection(), 500);

        } catch (error) {
            console.error('Submission error:', error);
            setSubmitStatus('error');

            // Reset status after showing error
            setTimeout(() => setSubmitStatus(null), 3000);
        }
    };
    // Questions array
    const questions = [
        "Do you ever get drawn to explore your inner thoughts and patterns?",
        "How do you currently capture your ideas and reflections?",
        "What personal growth journey are you currently on?",
        "What's one question you've been asking yourself lately?",
        "If you could understand one pattern in your thinking better, what would it be?",
        "How would you describe the relationship between your thoughts and your physical sensations?",
        "When you feel 'stuck' energetically, what approaches have helped you shift that state?"
    ];

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        },
        exit: {
            opacity: 0,
            transition: { duration: 0.3 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 24 }
        }
    };
    return (
        <div className="min-h-screen w-full overflow-x-hidden">
            {/* Landing Section */}
            {currentSection === 0 && (
                <div id="landing" className="flex justify-center items-center min-h-screen flex-col gap-3 bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="text-center text-4xl font-bold leading-tight relative">
                        <span className="text-7xl relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">F</span>
                        <span className="relative z-10">O</span>
                        <span className="relative z-10">R</span>
                        <span className="relative z-10">C</span>
                        <span className="relative z-10">E</span>
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-200 to-purple-200 opacity-20 blur-xl rounded-full -z-10"></div>
                    </div>
                    <div className="leading-relaxed mt-2">
                        <span className="font-medium text-2xl">meet your next </span>
                        <TypingText
                            texts={["best friend", "coach", "confidant", "life changer", "wingman", "motivator", "growth catalyst"]}
                            typingSpeed={100}
                            pauseDuration={1500}
                            showCursor={true}
                            cursorCharacter="_"
                            mainClassName="text-2xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
                            cursorClassName="text-blue-500 animate-pulse"
                        />
                    </div>
                    <div className="mt-4 text-sm text-gray-700 font-light leading-snug hover:font-normal transition-all max-w-xs text-center">
                        The First AI Journal App & your Personal Companion on the journey to self-discovery
                    </div>
                    <button
                        onClick={goToNextSection}
                        className="mt-8 px-8 py-4 bg-black text-white rounded-full flex items-center hover:bg-gray-800 transition-all transform hover:scale-105 shadow-lg group"
                    >
                        <span className="mr-2">Begin Your Journey</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                            <path
                                fillRule="evenodd"
                                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                    <div className="absolute bottom-10 w-full flex justify-center">
                        <div className="animate-bounce">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </div>
                    </div>
                </div>
            )}

            {/* Section 1 - Loading Animation */}
            {currentSection === 1 && (
                <motion.div
                    id="section1"
                    className="flex justify-center items-center min-h-screen flex-col bg-gradient-to-br from-gray-900 to-blue-900 text-white relative overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Animated background particles */}
                    <div className="absolute inset-0 z-0">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute rounded-full bg-white opacity-20"
                                style={{
                                    width: Math.random() * 6 + 2 + 'px',
                                    height: Math.random() * 6 + 2 + 'px',
                                    left: Math.random() * 100 + '%',
                                    top: Math.random() * 100 + '%',
                                }}
                                animate={{
                                    y: [0, -100],
                                    opacity: [0, 0.8, 0]
                                }}
                                transition={{
                                    duration: Math.random() * 8 + 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                        ))}
                    </div>

                    {loading ? (
                        <motion.div
                            className="flex flex-col items-center z-10"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <motion.div
                                className="text-9xl font-bold text-center relative"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                F
                                <motion.div
                                    className="absolute inset-0 blur-xl bg-blue-500 opacity-30"
                                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                ></motion.div>
                            </motion.div>
                            <div className="mt-6 h-2 w-36 bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-blue-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 2, ease: "easeInOut" }}
                                ></motion.div>
                            </div>
                            <div className="mt-3 text-sm text-gray-300 flex items-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating your personalized experience...
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            className="max-w-lg w-full mx-auto p-8 backdrop-blur-lg bg-white/10 rounded-xl shadow-2xl z-10 relative"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                        >
                            <Sparkles className="absolute top-4 right-4 text-blue-300 h-5 w-5" />

                            <motion.h2
                                className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-white"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                            >
                                {questions[0]}
                            </motion.h2>

                            <div className="space-y-4">
                                {[
                                    "Yes, frequently",
                                    "Sometimes, when I'm reflective",
                                    "Rarely, but I'd like to more",
                                    "I'm new to this practice"
                                ].map((answer, idx) => (
                                    <motion.div
                                        key={idx}
                                        onClick={() => { handleInputChange(questions[0], answer); goToNextSection(); }}
                                        className="w-full p-5 text-center bg-white/5 hover:bg-white/15 rounded-xl transition-all cursor-pointer border border-white/10 group"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + idx * 0.1, duration: 0.5 }}
                                        whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.15)" }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="flex-grow">{answer}</span>
                                            <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.div
                                className="mt-8 flex justify-between opacity-70 hover:opacity-100 transition-opacity"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.7 }}
                                transition={{ delay: 0.8, duration: 0.5 }}
                            >
                                <button
                                    onClick={goToPrevSection}
                                    className="text-sm flex items-center hover:text-blue-300 transition-colors"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-1" />
                                    Go back
                                </button>
                                <button
                                    onClick={goToNextSection}
                                    className="text-sm flex items-center hover:text-blue-300 transition-colors"
                                >
                                    Skip question
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </motion.div>
            )}


            {/* Section 2 - Question 2 */}
            {currentSection === 2 && (
                <div id="section2" className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-50 to-indigo-50 py-16">
                    <div className="max-w-lg w-full p-10 bg-white rounded-3xl shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-3 h-full bg-gradient-to-b from-purple-400 to-indigo-600"></div>

                        <h2 className="text-3xl font-bold mb-2 text-gray-800">{questions[1]}</h2>
                        <p className="text-gray-500 mb-8">Select all that apply to your current practice</p>

                        <div className="space-y-4">
                            {[
                                "Journal or diary",
                                "Notes on phone or computer",
                                "Voice memos",
                                "Meditation or mindfulness",
                                "I don't have a current practice"
                            ].map((option, index) => (
                                <label key={index} className="flex items-center p-4 border border-gray-100 rounded-xl hover:border-purple-200 hover:bg-purple-50 cursor-pointer transition-all">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-5 w-5 text-purple-600 rounded"
                                        onChange={(e) => handleCheckboxChange(questions[1], option, e.target.checked)}
                                    />
                                    <span className="ml-3 text-gray-800">{option}</span>
                                </label>
                            ))}
                        </div>

                        <div className="mt-10 flex justify-between">
                            <button onClick={goToPrevSection} className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-600">
                                Back
                            </button>
                            <button onClick={goToNextSection} className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition shadow-md">
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Section 3 - Question 3 */}
            {currentSection === 3 && (
                <motion.div
                    key="section3"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={containerVariants}
                    className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 flex items-center justify-center py-16 px-4"
                >
                    <motion.div
                        className="max-w-lg w-full p-8 bg-white rounded-2xl shadow-xl"
                        variants={itemVariants}
                    >
                        <motion.div
                            className="mb-8 text-center"
                            variants={itemVariants}
                        >
                            <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium mb-3">Question 3 of 7</span>
                            <h2 className="text-3xl font-bold text-gray-800">{questions[2]}</h2>
                        </motion.div>

                        <motion.div
                            className="bg-green-50 p-6 rounded-xl mb-6"
                            variants={itemVariants}
                        >
                            <textarea
                                rows={4}
                                placeholder="Share your current growth journey here..."
                                className="w-full bg-white rounded-lg border border-gray-200 p-4 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                onChange={(e) => handleInputChange(questions[2], e.target.value)}
                            ></textarea>
                        </motion.div>

                        <motion.div
                            className="space-y-2 mb-8"
                            variants={itemVariants}
                        >
                            <p className="text-sm text-gray-600 font-medium">Some areas you might consider:</p>
                            <div className="flex flex-wrap gap-2">
                                {['Career development', 'Emotional intelligence', 'Physical health', 'Relationships', 'Spirituality'].map((area, index) => (
                                    <motion.span
                                        key={index}
                                        whileHover={{ scale: 1.05 }}
                                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm cursor-pointer"
                                    >
                                        {area}
                                    </motion.span>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            className="flex justify-between"
                            variants={itemVariants}
                        >
                            <motion.button
                                onClick={goToPrevSection}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-5 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-600 flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </motion.button>

                            <motion.button
                                onClick={goToNextSection}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition shadow-md flex items-center gap-2"
                            >
                                Continue
                                <ChevronRight className="h-4 w-4" />
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}

            {/* Section 4 - Question 4 */}
            {currentSection === 4 && (
                <motion.div
                    key="section4"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={containerVariants}
                    className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 flex items-center justify-center py-16 px-4"
                >
                    <div className="max-w-lg w-full relative">
                        <motion.div
                            className="absolute -top-10 -left-10 w-20 h-20 bg-blue-200 rounded-full opacity-50"
                            animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.5, 0.3, 0.5]
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 4
                            }}
                        ></motion.div>

                        <motion.div
                            className="absolute -bottom-10 -right-10 w-24 h-24 bg-sky-200 rounded-full opacity-50"
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 0.3, 0.5]
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 5,
                                delay: 1
                            }}
                        ></motion.div>

                        <motion.div
                            className="bg-white backdrop-blur-md bg-opacity-90 p-10 rounded-2xl shadow-xl relative z-10"
                            variants={itemVariants}
                        >
                            <motion.h2
                                className="text-3xl font-bold mb-8 text-center text-gray-800"
                                variants={itemVariants}
                            >
                                {questions[3]}
                            </motion.h2>

                            <motion.div
                                className="relative mb-8"
                                variants={itemVariants}
                            >
                                <input
                                    type="text"
                                    placeholder="Type your question here..."
                                    className="w-full p-4 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    onChange={(e) => handleInputChange(questions[3], e.target.value)}
                                />
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500">
                                    <MessageCircle className="h-5 w-5" />
                                </div>
                            </motion.div>

                            <motion.div
                                className="mb-8 bg-blue-50 p-6 rounded-xl"
                                variants={itemVariants}
                            >
                                <p className="text-sm text-blue-700 mb-3 font-medium">Examples of powerful questions:</p>
                                <ul className="space-y-2 text-gray-700">
                                    {[
                                        "How can I find more meaning in my daily routine?",
                                        "What is the biggest obstacle I'm not facing?",
                                        "Where am I not being honest with myself?"
                                    ].map((example, index) => (
                                        <motion.li
                                            key={index}
                                            className="flex items-center"
                                            whileHover={{ x: 5 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                                            <span>{example}</span>
                                        </motion.li>
                                    ))}
                                </ul>
                            </motion.div>

                            <motion.div
                                className="flex justify-between"
                                variants={itemVariants}
                            >
                                <motion.button
                                    onClick={goToPrevSection}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-5 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-600 flex items-center gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back
                                </motion.button>

                                <motion.button
                                    onClick={goToNextSection}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-5 py-2 bg-gradient-to-r from-blue-500 to-sky-600 text-white rounded-lg hover:from-blue-600 hover:to-sky-700 transition shadow-md flex items-center gap-2"
                                >
                                    Continue
                                    <ChevronRight className="h-4 w-4" />
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
            )}

            {/* Section 5 - Question 5 */}
            {currentSection === 5 && (
                <motion.div
                    key="section5"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={containerVariants}
                    className="min-h-screen bg-gradient-to-tr from-amber-50 to-yellow-100 flex items-center justify-center py-16 px-4"
                >
                    <motion.div
                        className="max-w-lg w-full p-8 bg-white rounded-2xl shadow-xl"
                        variants={itemVariants}
                    >
                        <motion.div
                            className="flex items-center justify-center mb-8"
                            variants={itemVariants}
                        >
                            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                <Brain className="h-8 w-8" />
                            </div>
                        </motion.div>

                        <motion.h2
                            className="text-3xl font-bold mb-6 text-center text-gray-800"
                            variants={itemVariants}
                        >
                            {questions[4]}
                        </motion.h2>

                        <motion.p
                            className="text-gray-600 text-center mb-8"
                            variants={itemVariants}
                        >
                            Understanding our patterns can lead to powerful insights
                        </motion.p>

                        <div className="space-y-4">
                            {[
                                "Work-related stress responses",
                                "Decision-making processes",
                                "Reactions in relationships",
                                "Procrastination habits",
                                "Self-talk patterns",
                                "Energy management",
                                "Creative blocks"
                            ].map((pattern, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.02, x: 4 }}
                                    className="border border-gray-100 p-4 rounded-xl hover:border-amber-300 hover:bg-amber-50 cursor-pointer transition-all"
                                    onClick={() => handleInputChange(questions[4], pattern)}
                                >
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="pattern"
                                            className="form-radio h-5 w-5 text-amber-500"
                                            onChange={() => handleInputChange(questions[4], pattern)}
                                        />
                                        <span className="ml-3 text-gray-800">{pattern}</span>
                                    </label>
                                </motion.div>
                            ))}

                            <motion.div
                                variants={itemVariants}
                                whileHover={{ scale: 1.02, x: 4 }}
                                className="border border-gray-100 p-4 rounded-xl hover:border-amber-300 hover:bg-amber-50 cursor-pointer transition-all"
                            >
                                <label className="flex flex-col cursor-pointer w-full">
                                    <div className="flex items-center mb-2">
                                        <input
                                            type="radio"
                                            name="pattern"
                                            className="form-radio h-5 w-5 text-amber-500"
                                        />
                                        <span className="ml-3 text-gray-800">Other (please specify)</span>
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full ml-8 border-gray-200 rounded p-2 text-sm focus:ring-amber-500 focus:border-transparent"
                                        placeholder="Describe your pattern here..."
                                        onChange={(e) => handleInputChange(questions[4], "Other: " + e.target.value)}
                                    />
                                </label>
                            </motion.div>
                        </div>

                        <motion.div
                            className="flex justify-between mt-8"
                            variants={itemVariants}
                        >
                            <motion.button
                                onClick={goToPrevSection}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-5 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-600 flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </motion.button>

                            <motion.button
                                onClick={goToNextSection}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg hover:from-amber-600 hover:to-yellow-600 transition shadow-md flex items-center gap-2"
                            >
                                Continue
                                <ChevronRight className="h-4 w-4" />
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}

            {/* Section 6 - Question 6 */}
            {currentSection === 6 && (
                <div id="section6" className="min-h-screen bg-gradient-to-tl from-indigo-50 to-purple-100 flex items-center justify-center py-16">
                    <div className="max-w-lg w-full bg-white p-10 rounded-3xl shadow-xl relative">
                        <div className="absolute top-5 right-5 opacity-10">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                            </svg>
                        </div>

                        <h2 className="text-2xl font-bold mb-6 text-gray-800 leading-tight">{questions[5]}</h2>
                        <p className="text-gray-600 mb-8">Mind-body connection is a powerful aspect of self-awareness</p>

                        <div className="space-y-4">
                            <div className="relative">
                                <input
                                    type="range"
                                    min="1"
                                    max="7"
                                    step="1"
                                    defaultValue="4"
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />

                                <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                                    <span>Very separate</span>
                                    <span>Deeply connected</span>
                                </div>
                            </div>

                            <div className="bg-indigo-50 p-6 rounded-xl mt-6">
                                <textarea
                                    rows={4}
                                    placeholder="Describe your experience in more detail..."
                                    className="w-full bg-white rounded-lg border border-gray-200 p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    onChange={(e) => handleInputChange(questions[5], e.target.value)}
                                ></textarea>
                            </div>

                            <div className="mt-4 p-6 border border-gray-100 rounded-xl">
                                <p className="text-sm text-gray-700 mb-3 font-medium">Try noticing right now:</p>
                                <ul className="space-y-2 text-gray-600 text-sm">
                                    <li className="flex items-start">
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2 mt-1.5"></div>
                                        <span>Where in your body do you feel tension or relaxation?</span>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2 mt-1.5"></div>
                                        <span>How does your breathing change with different emotions?</span>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2 mt-1.5"></div>
                                        <span>What physical sensations arise when you feel stressed vs. calm?</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex justify-between mt-8">
                            <button onClick={goToPrevSection} className="px-5 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-600">
                                Back
                            </button>
                            <button onClick={goToNextSection} className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition shadow-md">
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}




            {/* Section 7 - Energy Practices */}
{currentSection === 7 && (
  <motion.div 
    id="section7"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="min-h-screen bg-gradient-to-bl from-teal-50 to-emerald-100 flex items-center justify-center py-16 px-4"
  >
    <motion.div 
      className="max-w-xl w-full bg-white p-10 rounded-3xl shadow-xl relative overflow-hidden"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      {/* Background decoration */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-teal-100 rounded-full opacity-50"></div>
      <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-emerald-100 rounded-full opacity-50"></div>
      
      <div className="relative z-10">
        {/* Question header with icon */}
        <div className="flex items-center mb-6">
          <div className="bg-gradient-to-r from-teal-400 to-emerald-500 p-2 rounded-lg mr-4">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{questions[6]}</h2>
            <p className="text-gray-500 text-sm mt-1">Discover your unique energy flow patterns</p>
          </div>
        </div>
        
        {/* Question description */}
        <motion.p 
          className="text-gray-600 mb-8 pl-4 border-l-2 border-teal-400"
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          We all experience energy blocks - your approaches will help us personalize FORCE specifically for you.
        </motion.p>
        
        {/* Options grid with animated entries */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Select all approaches that have worked for you:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { text: "Movement & exercise", icon: <Activity className="h-4 w-4" /> },
              { text: "Nature immersion", icon: <Compass className="h-4 w-4" /> },
              { text: "Creative expression", icon: <Sparkles className="h-4 w-4" /> },
              { text: "Meditation/mindfulness", icon: <Brain className="h-4 w-4" /> },
              { text: "Deep breathing", icon: <Heart className="h-4 w-4" /> },
              { text: "Social connection", icon: <MessageCircle className="h-4 w-4" /> },
              { text: "Music/sound therapy", icon: <FileText className="h-4 w-4" /> },
              { text: "Change of environment", icon: <Compass className="h-4 w-4" /> },
              { text: "Cold exposure/contrast", icon: <Zap className="h-4 w-4" /> }
            ].map((approach, index) => (
              <motion.label 
                key={index}
                className="flex items-center p-3 border border-gray-100 rounded-xl hover:border-teal-300 hover:bg-teal-50 cursor-pointer transition-all group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-teal-500 rounded border-gray-300 focus:ring-teal-500"
                    onChange={(e) => handleCheckboxChange(questions[6], approach.text, e.target.checked)}
                  />
                </div>
                <div className="ml-3 flex items-center text-gray-800">
                  <span className="mr-2 text-teal-500">{approach.icon}</span>
                  <span className="text-sm">{approach.text}</span>
                </div>
                <motion.div 
                  className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={{ x: -5 }}
                  whileHover={{ x: 0 }}
                >
                  <CheckCircle className="h-4 w-4 text-teal-400" />
                </motion.div>
              </motion.label>
            ))}
          </div>
        </div>
        
        {/* Custom approach input */}
        <motion.div 
          className="bg-gradient-to-r from-teal-50 to-emerald-50 p-6 rounded-2xl mb-8 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center text-teal-800 font-medium mb-3">
            <Sparkles className="h-4 w-4 mr-2" />
            <span>Share your unique approach:</span>
          </div>
          <textarea
            rows={3}
            placeholder="Describe any other methods that have helped you shift your energy state..."
            className="w-full bg-white rounded-xl border border-teal-100 p-4 focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm shadow-inner"
            onChange={(e) => handleInputChange(questions[6] + " (unique approach)", e.target.value)}
          ></textarea>
        </motion.div>
        
        {/* Navigation buttons with animated effects */}
        <motion.div 
          className="flex justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.button 
            onClick={goToPrevSection}
            className="px-5 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-600 flex items-center gap-2 group"
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="h-4 w-4 group-hover:animate-pulse" />
            <span>Previous</span>
          </motion.button>
          
          <motion.button 
            onClick={goToNextSection}
            className="px-5 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition flex items-center gap-2 group"
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Complete & Continue</span>
            <ArrowRight className="h-4 w-4 group-hover:animate-pulse" />
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  </motion.div>
)}

{/* Section 8 - Final Welcome */}
{currentSection === 8 && (
  <motion.div 
    id="section8" 
    className="h-screen bg-black flex items-center justify-center text-white overflow-hidden relative"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    {/* Animated background elements */}
    <motion.div className="absolute inset-0 z-0">
      <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full opacity-40">
        <defs>
          <radialGradient id="gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#gradient)" />
      </svg>
      
      {/* Animated particles */}
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-blue-500 rounded-full blur-md"
          style={{
            width: Math.random() * 10 + 2,
            height: Math.random() * 10 + 2,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: [
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
            ],
            y: [
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
            ],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: Math.random() * 15 + 15,
          }}
        />
      ))}
    </motion.div>
    
    {/* Main content */}
    <div className="max-w-lg text-center px-6 z-10 relative">
      <motion.div 
        className="mb-12"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 20,
          delay: 0.2
        }}
      >
        <div className="relative mb-2 flex justify-center">
          <motion.div 
            className="text-8xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500"
            animate={{ 
              textShadow: [
                "0 0 5px rgba(99, 102, 241, 0.5)",
                "0 0 20px rgba(99, 102, 241, 0.8)",
                "0 0 5px rgba(99, 102, 241, 0.5)"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            F
          </motion.div>
          <motion.div 
            className="text-6xl font-bold tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            ORCE
          </motion.div>
        </div>
        <motion.div 
          className="h-1 w-32 mx-auto bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 rounded-full"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "8rem", opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        />
      </motion.div>
      
      <motion.h2 
        className="text-3xl md:text-4xl font-bold mb-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        Welcome to your personal growth journey
      </motion.h2>
      
      <motion.p 
        className="text-xl opacity-80 mb-12 leading-relaxed"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.1 }}
      >
        Your AI companion is ready to help you reflect, grow, and unlock your true potential.
      </motion.p>
      
      <div className="flex flex-col items-center">
        <motion.a 
          href="/journal-entry" 
          className="group relative px-8 py-4 bg-white text-black rounded-lg font-bold text-lg hover:shadow-xl transition-all duration-300 mb-8 overflow-hidden"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.span 
            className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            animate={{ x: ["0%", "100%", "0%"] }}
            transition={{ 
              repeat: Infinity, 
              repeatType: "reverse", 
              duration: 15,
              ease: "linear" 
            }}
          />
          <span className="relative flex items-center justify-center gap-2 group-hover:text-white transition-colors duration-300">
            <span>Begin Your Journey</span>
            <Zap className="h-5 w-5 group-hover:animate-pulse" />
          </span>
        </motion.a>
        
        <motion.button 
          onClick={goToPrevSection}
          className="text-white/70 hover:text-white underline flex items-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          whileHover={{ y: -2 }}
        >
          <ArrowLeft className="h-3 w-3" />
          <span>Go back</span>
        </motion.button>
      </div>
    </div>
    
    {/* Floating shapes */}
    <motion.div
      className="absolute bottom-10 right-10 w-20 h-20 border border-indigo-500 rounded-full opacity-20"
      animate={{ 
        scale: [1, 1.2, 1],
        rotate: [0, 180, 0],
        opacity: [0.2, 0.4, 0.2]
      }}
      transition={{ 
        repeat: Infinity,
        duration: 15,
        ease: "easeInOut"
      }}
    />
    
    <motion.div
      className="absolute top-20 left-20 w-16 h-16 border border-blue-500 rounded-full opacity-20"
      animate={{ 
        scale: [1, 1.5, 1],
        rotate: [0, -180, 0],
        opacity: [0.2, 0.3, 0.2]
      }}
      transition={{ 
        repeat: Infinity,
        duration: 20,
        ease: "easeInOut"
      }}
    />
    
    {/* Progress completion indicator */}
    <motion.div 
      className="absolute bottom-6 left-0 right-0 flex justify-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.6 }}
    >
      <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full">
        <div className="flex items-center gap-2 text-xs text-white/70">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <span>Onboarding Complete</span>
        </div>
      </div>
    </motion.div>
  </motion.div>
)}
            {/* Progress Indicator */}
            {currentSection > 0 && currentSection < 8 && (
                <div className="fixed bottom-6 left-0 right-0 flex justify-center">
                    <div className="bg-white rounded-full px-4 py-2 shadow-md flex items-center gap-1">
                        {Array.from({ length: 7 }).map((_, index) => (
                            <div
                                key={index}
                                className={`w-2 h-2 rounded-full ${index + 1 < currentSection ? 'bg-blue-500' :
                                    index + 1 === currentSection ? 'bg-blue-300' : 'bg-gray-200'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Add global styles for the loader animation */}
            <style jsx>{`
        @keyframes progress {
          0% { width: 0% }
          100% { width: 100% }
        }
        .animate-progress {
          animation: progress 3s linear;
        }
      `}</style>
        </div>
    );
};

export default SnapStart;
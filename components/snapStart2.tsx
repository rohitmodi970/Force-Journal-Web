import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, ChevronRight, ChevronDown, ArrowLeft, 
  CheckCircle, Brain, FileText, Heart, ArrowRight,
  Sparkles, MessageCircle, Activity, Compass
} from 'lucide-react';
import TypingText from './ui/TypingText';

const SnapStart = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitStatus, setSubmitStatus] = useState<'loading' | 'success' | 'error' | null>(null);
  
  const goToNextSection = () => {
    if (currentSection === 0) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setCurrentSection(currentSection + 1);
      }, 2000);
    } else {
      window.scrollTo(0, 0);
      setCurrentSection(currentSection + 1);
    }
  };
  
  const goToPrevSection = () => {
    window.scrollTo(0, 0);
    setCurrentSection(currentSection - 1);
  };

  const handleInputChange = (question: string, answer: string) => {
    setFormData(prev => ({...prev, [question]: answer}));
  };

  const handleCheckboxChange = (question: string, option: string, checked: boolean) => {
    const currentAnswers = formData[question] || [];
    setFormData(prev => ({
      ...prev, 
      [question]: checked 
        ? [...currentAnswers, option]
        : currentAnswers.filter((item: string) => item !== option)
    }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitStatus('loading');
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitStatus('success');
      console.log('Data ready for submission:', formData);
      setTimeout(() => goToNextSection(), 500);
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus(null), 3000);
    }
  };

  const questions = [
    "Do you ever get drawn to explore your inner thoughts and patterns?",
    "How do you currently capture your ideas and reflections?",
    "What personal growth journey are you currently on?",
    "What's one question you've been asking yourself lately?",
    "If you could understand one pattern in your thinking better, what would it be?",
    "How would you describe the relationship between your thoughts and your physical sensations?",
    "When you feel 'stuck' energetically, what approaches have helped you shift that state?"
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { when: "beforeChildren", staggerChildren: 0.1 }
    },
    exit: { opacity: 0, transition: { duration: 0.3 } }
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
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-slate-50 to-slate-100">
      <AnimatePresence mode="wait">
        {/* Landing Section - currentSection 0 */}
        {currentSection === 0 && (
          <motion.div key="landing" initial="hidden" animate="visible" exit="exit" variants={containerVariants} className="flex justify-center items-center min-h-screen flex-col gap-6 p-4">
            <motion.div variants={itemVariants} className="text-center text-4xl font-bold leading-tight relative">
              <span className="text-7xl relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 inline-block mb-2">F</span>
              <span className="relative z-10">ORCE</span>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-200 to-purple-200 opacity-20 blur-xl rounded-full -z-10"></div>
            </motion.div>
            <motion.div variants={itemVariants} className="leading-relaxed">
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
            </motion.div>
            <motion.div variants={itemVariants} className="mt-2 text-sm text-gray-700 font-light leading-snug max-w-xs text-center">
              The First AI Journal App & your Personal Companion on the journey to self-discovery
            </motion.div>
            <motion.button variants={itemVariants} onClick={goToNextSection} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="mt-6 px-8 py-4 bg-black text-white rounded-full flex items-center hover:bg-gray-800 transition-colors shadow-lg group">
              <span className="mr-2">Begin Your Journey</span>
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.div variants={itemVariants} animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute bottom-10">
              <ChevronDown className="h-6 w-6 text-gray-400" />
            </motion.div>
          </motion.div>
        )}

        {/* Section 1 - Question 1 */}
        {currentSection === 1 && (
          <motion.div key="section1" initial="hidden" animate="visible" exit="exit" variants={containerVariants} className="flex justify-center items-center min-h-screen flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-800 text-white">
            {loading ? (
              <motion.div className="flex flex-col items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <motion.div className="text-9xl font-bold text-center relative" animate={{ scale: [1, 1.1, 1], opacity: [1, 0.8, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                  F
                  <div className="absolute inset-0 blur-xl bg-blue-500 opacity-30"></div>
                </motion.div>
                <div className="mt-6 h-2 w-36 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-blue-500" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 2 }}></motion.div>
                </div>
                <div className="mt-3 text-sm text-gray-300">Creating your personalized experience...</div>
              </motion.div>
            ) : (
              <motion.div className="max-w-lg w-full mx-auto p-8 backdrop-blur-lg bg-white/10 rounded-xl shadow-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <motion.h2 className="text-3xl font-bold mb-8 text-center" variants={itemVariants}>{questions[0]}</motion.h2>
                <div className="space-y-4">
                  {['Yes, frequently', 'Sometimes, when I\'m reflective', 'Rarely, but I\'d like to more', 'I\'m new to this practice'].map((answer, index) => (
                    <motion.div key={index} variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { handleInputChange(questions[0], answer); goToNextSection(); }} className="w-full p-5 text-center bg-white/5 hover:bg-white/15 rounded-xl transition-all cursor-pointer border border-white/10">
                      {answer}
                    </motion.div>
                  ))}
                </div>
                <motion.div variants={itemVariants} className="mt-8 flex justify-between opacity-70 hover:opacity-100 transition-opacity">
                  <button onClick={goToPrevSection} className="text-sm flex items-center gap-1">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Go back</span>
                  </button>
                  <button onClick={goToNextSection} className="text-sm">Skip question</button>
                </motion.div>
              </motion.div>
            )}
            
          </motion.div>
        )}

        {/* Section 2 - Question 2 */}
        {currentSection === 2 && (
          <motion.div key="section2" initial="hidden" animate="visible" exit="exit" variants={containerVariants} className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-50 to-indigo-50 py-16 px-4">
            <motion.div className="max-w-lg w-full p-10 bg-white rounded-3xl shadow-xl relative overflow-hidden" variants={itemVariants}>
              <div className="absolute top-0 left-0 w-3 h-full bg-gradient-to-b from-purple-400 to-indigo-600"></div>
              <motion.h2 className="text-3xl font-bold mb-2 text-gray-800" variants={itemVariants}>{questions[1]}</motion.h2>
              <motion.p className="text-gray-500 mb-8" variants={itemVariants}>Select all that apply to your current practice</motion.p>
              <div className="space-y-4">
                {['Journal or diary', 'Notes on phone or computer', 'Voice memos', 'Meditation or mindfulness', 'I don\'t have a current practice'].map((option, index) => (
                  <motion.label key={index} variants={itemVariants} whileHover={{ scale: 1.01, x: 4 }} className="flex items-center p-4 border border-gray-100 rounded-xl hover:border-purple-200 hover:bg-purple-50 cursor-pointer transition-all">
                    <input type="checkbox" className="form-checkbox h-5 w-5 text-purple-600 rounded" onChange={(e) => handleCheckboxChange(questions[1], option, e.target.checked)} />
                    <span className="ml-3 text-gray-800">{option}</span>
                  </motion.label>
                ))}
              </div>
              <motion.div className="mt-10 flex justify-between" variants={itemVariants}>
                <motion.button onClick={goToPrevSection} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-600 flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </motion.button>
                <motion.button onClick={goToNextSection} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition shadow-md flex items-center gap-2">
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* Section 3 - Question 3 */}
        {currentSection === 3 && (
          <motion.div key="section3" initial="hidden" animate="visible" exit="exit" variants={containerVariants} className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 flex items-center justify-center py-16 px-4">
            <motion.div className="max-w-lg w-full p-8 bg-white rounded-2xl shadow-xl" variants={itemVariants}>
              <motion.div className="mb-8 text-center" variants={itemVariants}>
                <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium mb-3">Question 3 of 7</span>
                <h2 className="text-3xl font-bold text-gray-800">{questions[2]}</h2>
              </motion.div>
              <motion.div className="bg-green-50 p-6 rounded-xl mb-6" variants={itemVariants}>
                <textarea rows={4} placeholder="Share your current growth journey here..." className="w-full bg-white rounded-lg border border-gray-200 p-4 focus:ring-2 focus:ring-green-500 focus:border-transparent" onChange={(e) => handleInputChange(questions[2], e.target.value)}></textarea>
              </motion.div>
              <motion.div className="space-y-2 mb-8" variants={itemVariants}>
                <p className="text-sm text-gray-600 font-medium">Some areas you might consider:</p>
                <div className="flex flex-wrap gap-2">
                  {['Career development', 'Emotional intelligence', 'Physical health', 'Relationships', 'Spirituality'].map((area, index) => (
                    <motion.span key={index} whileHover={{ scale: 1.05 }} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm cursor-pointer">{area}</motion.span>
                  ))}
                </div>
              </motion.div>
              <motion.div className="flex justify-between" variants={itemVariants}>
                <motion.button onClick={goToPrevSection} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-600 flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </motion.button>
                <motion.button onClick={goToNextSection} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition shadow-md flex items-center gap-2">
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* Section 4 - Question 4 */}
        {currentSection === 4 && (
          <motion.div key="section4" initial="hidden" animate="visible" exit="exit" variants={containerVariants} className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 flex items-center justify-center py-16 px-4">
            <div className="max-w-lg w-full relative">
              <motion.div className="absolute -top-10 -left-10 w-20 h-20 bg-blue-200 rounded-full opacity-50" animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.3, 0.5] }} transition={{ repeat: Infinity, duration: 4 }}></motion.div>
              <motion.div className="absolute -bottom-10 -right-10 w-24 h-24 bg-sky-200 rounded-full opacity-50" animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.3, 0.5] }} transition={{ repeat: Infinity, duration: 5, delay: 1 }}></motion.div>
              <motion.div className="bg-white backdrop-blur-md bg-opacity-90 p-10 rounded-2xl shadow-xl relative z-10" variants={itemVariants}>
                <motion.h2 className="text-3xl font-bold mb-8 text-center text-gray-800" variants={itemVariants}>{questions[3]}</motion.h2>
                <motion.div className="relative mb-8" variants={itemVariants}>
                  <input type="text" placeholder="Type your question here..." className="w-full p-4 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" onChange={(e) => handleInputChange(questions[3], e.target.value)} />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                </motion.div>
                <motion.div className="mb-8 bg-blue-50 p-6 rounded-xl" variants={itemVariants}>
                  <p className="text-sm text-blue-700 mb-3 font-medium">Examples of powerful questions:</p>
                  <ul className="space-y-2 text-gray-700">
                    {["How can I find more meaning in my daily routine?", "What is the biggest obstacle I'm not facing?", "Where am I not being honest with myself?"].map((example, index) => (
                      <motion.li key={index} className="flex items-center" whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                        <span>{example}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
                <motion.div className="flex justify-between" variants={itemVariants}>
                  <motion.button onClick={goToPrevSection} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-600 flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </motion.button>
                  <motion.button onClick={goToNextSection} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2 bg-gradient-to-r from-blue-500 to-sky-600 text-white rounded-lg hover:from-blue-600 hover:to-sky-700 transition shadow-md flex items-center gap-2">
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
          <motion.div key="section5" initial="hidden" animate="visible" exit="exit" variants={containerVariants} className="min-h-screen bg-gradient-to-tr from-amber-50 to-yellow-100 flex items-center justify-center py-16 px-4">
            <motion.div className="max-w-lg w-full p-8 bg-white rounded-2xl shadow-xl" variants={itemVariants}>
              <motion.div className="flex items-center justify-center mb-8" variants={itemVariants}>
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <Brain className="h-8 w-8" />
                </div>
              </motion.div>
              <motion.h2 className="text-3xl font-bold mb-6 text-center text-gray-800" variants={itemVariants}>{questions[4]}</motion.h2>
              <motion.p className="text-gray-600 text-center mb-8" variants={itemVariants}>Understanding our patterns can lead to powerful insights</motion.p>
              <div className="space-y-4">
                {["Work-related stress responses", "Decision-making processes", "Reactions in relationships", "Procrastination habits", "Self-talk patterns", "Energy management", "Creative blocks"].map((pattern, index) => (
                  <motion.div key={index} variants={itemVariants} whileHover={{ scale: 1.02, x: 4 }} className="border border-gray-100 p-4 rounded-xl hover:border-amber-300 hover:bg-amber-50 cursor-pointer transition-all" onClick={() => handleInputChange(questions[4], pattern)}>
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="pattern" className="form-radio h-5 w-5 text-amber-500" onChange={() => handleInputChange(questions[4], pattern)} />
                      <span className="ml-3 text-gray-800">{pattern}</span>
                    </label>
                  </motion.div>
                ))}
                <motion.div variants={itemVariants} whileHover={{ scale: 1.02, x: 4 }} className="border border-gray-100 p-4 rounded-xl hover:border-amber-300 hover:bg-amber-50 cursor-pointer transition-all">
                  <label className="flex flex-col cursor-pointer w-full">
                    <div className="flex items-center mb-2">
                      <input type="radio" name="pattern" className="form-radio h-5 w-5 text-amber-500" />
                      <span className="ml-3 text-gray-800">Other (please specify)</span>
                    </div>
                    <input type="text" className="w-full ml-8 border-gray-200 rounded p-2 text-sm focus:ring-amber-500 focus:border-transparent" placeholder="Describe your pattern here..." onChange={(e) => handleInputChange(questions[4], "Other: " + e.target.value)} />
                  </label>
                </motion.div>
              </div>
              <motion.div className="flex justify-between mt-8" variants={itemVariants}>
                <motion.button onClick={goToPrevSection} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-600 flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </motion.button>
                <motion.button onClick={goToNextSection} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg hover:from-amber-600 hover:to-yellow-600 transition shadow-md flex items-center gap-2">
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* Section 6 - Question 6 */}
        {currentSection === 6 && (
          <motion.div key="section6" initial="hidden" animate="visible" exit="exit" variants={containerVariants} className="min-h-screen bg-gradient-to-tl from-indigo-50 to-purple-100 flex items-center justify-center py-16 px-4">
            <motion.div className="max-w-lg w-full bg-white p-10 rounded-3xl shadow-xl relative" variants={itemVariants}>
              <div className="absolute top-5 right-5 opacity-10">
                <Heart className="h-32 w-32" />
              </div>
              <motion.h2 className="text-2xl font-bold mb-6 text-gray-800 leading-tight" variants={itemVariants}>{questions[5]}</motion.h2>
              <motion.p className="text-gray-600 mb-8" variants={itemVariants}>Mind-body connection is a powerful aspect of self-awareness</motion.p>
              <div className="space-y-4">
                <motion.div className="relative" variants={itemVariants}>
                  <input type="range" min="1" max="7" step="1" defaultValue="4" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" onChange={(e) => handleInputChange(questions[5], `Connection level: ${e.target.value}/7`)} />
                  <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                    <span>Very separate</span>
                    <span>Deeply connected</span>
                  </div>
                </motion.div>
                <motion.div className="bg-indigo-50 p-6 rounded-xl mt-6" variants={itemVariants}>
                  <textarea rows={4} placeholder="Describe your experience in more detail..." className="w-full bg-white rounded-lg border border-gray-200 p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" onChange={(e) => handleInputChange(questions[5], `${formData[questions[5]] || 'Connection level: 4/7'}\n${e.target.value}`)}></textarea>
                </motion.div>
                <motion.div className="mt-4 p-6 border border-gray-100 rounded-xl" variants={itemVariants}>
                  <p className="text-sm text-gray-700 mb-3 font-medium">Try noticing right now:</p>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    {["Where in your body do you feel tension or relaxation?", "How does your breathing change with different emotions?", "What physical sensations arise when you feel stressed vs. calm?"].map((item, index) => (
                      <motion.li key={index} className="flex items-start" whileHover={{ x: 5 }}>
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2 mt-1.5"></div>
                        <span>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </div>
              <motion.div className="flex justify-between mt-8" variants={itemVariants}>
                <motion.button onClick={goToPrevSection} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-600 flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </motion.button>
                <motion.button onClick={goToNextSection} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition shadow-md flex items-center gap-2">
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* Section 7 - Question 7 */}
        {currentSection === 7 && (
          <motion.div key="section7" initial="hidden" animate="visible" exit="exit" variants={containerVariants} className="min-h-screen bg-gradient-to-bl from-teal-50 to-emerald-100 flex items-center justify-center py-16 px-4">
            <motion.div className="max-w-lg w-full bg-white p-10 rounded-3xl shadow-xl" variants={itemVariants}>
              <motion.h2 className="text-2xl font-bold mb-6 text-gray-800" variants={itemVariants}>{questions[6]}</motion.h2>
              <motion.p className="text-gray-600 mb-8" variants={itemVariants}>We all experience energy blocks - your strategies help us personalize FORCE for you</motion.p>
              <motion.div className="grid grid-cols-2 gap-4 mb-8" variants={itemVariants}>
                <div className="col-span-2 text-sm text-gray-700 font-medium mb-2">Select all that have worked for you:</div>
                {["Movement & exercise", "Nature immersion", "Creative expression", "Meditation/mindfulness", "Deep breathing", "Social connection", "Music/sound therapy", "Change of environment", "Cold exposure/contrast therapy"].map((approach, index) => (
                  <motion.label key={index} variants={itemVariants} whileHover={{ scale: 1.02 }} className="flex items-center p-3 border border-gray-100 rounded-lg hover:border-teal-200 hover:bg-teal-50 cursor-pointer transition-all">
                    <input type="checkbox" className="form-checkbox h-4 w-4 text-teal-600 rounded" onChange={(e) => handleCheckboxChange(questions[6], approach, e.target.checked)} />
                    <span className="ml-2 text-sm text-gray-800">{approach}</span>
                  </motion.label>
                ))}
              </motion.div>
              <motion.div className="bg-teal-50 p-6 rounded-xl mb-8" variants={itemVariants}>
                <div className="text-sm text-teal-800 font-medium mb-3">Your unique approach:</div>
                <textarea rows={3} placeholder="Describe any other methods that have helped you shift your energy..." className="w-full bg-white rounded-lg border border-gray-200 p-4 focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm" onChange={(e) => handleInputChange(questions[6] + "_custom", e.target.value)}></textarea>
              </motion.div>
              <motion.div className="flex justify-between" variants={itemVariants}>
                <motion.button onClick={goToPrevSection} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-600 flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </motion.button>
                <motion.button onClick={handleSubmit} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg hover:from-teal-600 hover:to-emerald-700 transition shadow-md flex items-center gap-2 disabled:opacity-50" disabled={submitStatus === 'loading'}>
                  {submitStatus === 'loading' ? 'Processing...' : 'Complete & Continue'}
                  {submitStatus !== 'loading' && <ChevronRight className="h-4 w-4" />}
                </motion.button>
              </motion.div>
              {submitStatus === 'error' && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm mt-4 text-center">Something went wrong. Please try again.</motion.p>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Section 8 - Final Welcome */}
        {currentSection === 8 && (
          <motion.div key="welcome" initial="hidden" animate="visible" exit="exit" variants={containerVariants} className="h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-800 flex items-center justify-center text-white">
            <motion.div className="max-w-lg text-center px-6" variants={itemVariants}>
              <motion.div className="mb-6 text-6xl font-bold" variants={itemVariants}>
                <span className="text-8xl">F</span>ORCE
              </motion.div>
              <motion.h2 className="text-3xl font-bold mb-4" variants={itemVariants}>Welcome to your personal growth journey</motion.h2>
              <motion.p className="text-xl opacity-80 mb-10" variants={itemVariants}>Your AI companion is ready to help you reflect, grow, and thrive.</motion.p>
              <motion.div className="flex flex-col items-center" variants={itemVariants}>
                <motion.a href="/journal-entry" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-8 py-4 bg-white text-purple-900 rounded-lg font-bold text-lg hover:bg-gray-100 transition mb-4">
                  Start Your First Journal Entry
                </motion.a>
                <motion.button onClick={goToPrevSection} whileHover={{ scale: 1.05 }} className="text-white/70 hover:text-white transition-opacity underline">
                  Go back
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Indicator */}
      {currentSection > 0 && currentSection < 8 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed bottom-6 left-0 right-0 flex justify-center">
          <div className="bg-white rounded-full px-4 py-2 shadow-md flex items-center gap-1">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className={`w-2 h-2 rounded-full ${index + 1 < currentSection ? 'bg-blue-500' : index + 1 === currentSection ? 'bg-blue-300' : 'bg-gray-200'}`} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SnapStart;
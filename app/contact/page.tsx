import React from 'react'
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaRobot } from 'react-icons/fa'
import Link from 'next/link'

const Contact = () => {
    return (
        <section className="bg-gradient-to-b from-gray-100 to-white py-16">
            <div className="container mx-auto px-4"></div>
                <h1 className="text-4xl font-bold text-center mb-2">Contact Us</h1>
                <p className="text-gray-600 text-center mb-12">Get in touch with our team or use our AI assistant</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Contact Form */}
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <h2 className="text-2xl font-semibold mb-6">Send us a message</h2>
                        <form>
                            <div className="mb-4">
                                <label htmlFor="name" className="block text-gray-700 mb-2">Full Name</label>
                                <input 
                                    type="text" 
                                    id="name" 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Your name"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-gray-700 mb-2">Email Address</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="your.email@example.com"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="subject" className="block text-gray-700 mb-2">Subject</label>
                                <input 
                                    type="text" 
                                    id="subject" 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="What is this regarding?"
                                />
                            </div>
                            <div className="mb-6">
                                <label htmlFor="message" className="block text-gray-700 mb-2">Message</label>
                                <textarea 
                                    id="message" 
                                    rows={4} 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Your message here..."
                                ></textarea>
                            </div>
                            <button 
                                type="submit" 
                                className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition duration-300"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>

                    {/* AI Assistant & Contact Info */}
                    <div className="space-y-6">
                        {/* AI Assistant */}
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-8 text-white">
                            <div className="flex items-center mb-4">
                                <FaRobot className="text-2xl mr-3" />
                                <h2 className="text-2xl font-semibold">AI Assistant</h2>
                            </div>
                            <p className="mb-4">Get instant responses from our AI assistant. Ask questions about journal submissions, publication processes, or research guidance.</p>
                            <div className="bg-white rounded-lg p-4">
                                <div className="flex flex-col h-48 overflow-y-auto mb-4 bg-gray-100 rounded p-3">
                                    <div className="bg-indigo-100 p-3 rounded-lg mb-2 self-start max-w-[80%]">
                                        <p className="text-gray-800">Hello! How can I help you with FORCE Journal today?</p>
                                    </div>
                                    {/* Message history would appear here */}
                                </div>
                                <div className="flex">
                                    <input 
                                        type="text" 
                                        className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                                        placeholder="Ask the AI assistant..."
                                    />
                                    <button className="bg-indigo-600 px-4 py-2 rounded-r-md hover:bg-indigo-700 transition">
                                        Send
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-white rounded-lg shadow-lg p-8">
                            <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <FaEnvelope className="text-blue-600 mt-1 mr-3" />
                                    <div>
                                        <h3 className="font-medium">Email</h3>
                                        <p className="text-gray-600">contact@forcejournal.com</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <FaPhone className="text-blue-600 mt-1 mr-3" />
                                    <div>
                                        <h3 className="font-medium">Phone</h3>
                                        <p className="text-gray-600">+1 (123) 456-7890</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <FaMapMarkerAlt className="text-blue-600 mt-1 mr-3" />
                                    <div>
                                        <h3 className="font-medium">Office Address</h3>
                                        <p className="text-gray-600">123 Academic Avenue,<br />Research Park, CA 94103</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-16">
                    <h2 className="text-2xl font-semibold text-center mb-8">Frequently Asked Questions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="font-medium text-lg mb-2">How can I submit my research paper?</h3>
                            <p className="text-gray-600">You can submit your research through our online portal. Visit the "Submit" page and follow the step-by-step instructions.</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="font-medium text-lg mb-2">What is the review process?</h3>
                            <p className="text-gray-600">All submissions undergo a double-blind peer review process by experts in your field of research.</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="font-medium text-lg mb-2">How long does the review process take?</h3>
                            <p className="text-gray-600">Typically, the review process takes 4-6 weeks, depending on the complexity of the research and reviewer availability.</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="font-medium text-lg mb-2">Is there a fee for publication?</h3>
                            <p className="text-gray-600">Please check our "Publication Fees" page for the most current information about costs associated with publishing.</p>
                        </div>
                    </div>
                </div>
        </section>
    )
}

export default Contact

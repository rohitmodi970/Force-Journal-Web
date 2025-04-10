import React from 'react'
import Image from 'next/image'

const About = () => {
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-8 text-center">About FORCE</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                <div>
                    <Image 
                        src="/images/about-image.jpg" 
                        alt="FORCE Team" 
                        width={500} 
                        height={400} 
                        className="rounded-lg shadow-md"
                        priority
                    />
                </div>
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
                    <p className="text-lg mb-6">
                        FORCE is dedicated to delivering innovative solutions that empower businesses and individuals. 
                        We strive to create technology that makes a positive impact on the world.
                    </p>
                    <p className="text-lg">
                        Founded in [year], we have grown into a team of passionate professionals 
                        committed to excellence and continuous improvement.
                    </p>
                </div>
            </div>
            
            <div className="mb-16">
                <h2 className="text-2xl font-semibold mb-6 text-center">Our Values</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-gray-50 p-6 rounded-lg shadow">
                        <h3 className="text-xl font-medium mb-3">Innovation</h3>
                        <p>We embrace creativity and forward-thinking to develop cutting-edge solutions.</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg shadow">
                        <h3 className="text-xl font-medium mb-3">Integrity</h3>
                        <p>We maintain the highest ethical standards in all our business practices.</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg shadow">
                        <h3 className="text-xl font-medium mb-3">Collaboration</h3>
                        <p>We believe in the power of teamwork and partnership to achieve great results.</p>
                    </div>
                </div>
            </div>
            
            <div>
                <h2 className="text-2xl font-semibold mb-6 text-center">Our Team</h2>
                <p className="text-lg text-center mb-8">
                    Meet the dedicated professionals behind FORCE's success.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {/* Team members would go here */}
                    {/* Example of one team member */}
                    <div className="text-center">
                        <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto mb-4"></div>
                        <h3 className="font-medium">Shriyanshi </h3>
                        <p className="text-gray-600">CEO & Founder</p>
                    </div>
                    {/* Add more team members as needed */}
                </div>
            </div>
        </div>
    )
}

export default About

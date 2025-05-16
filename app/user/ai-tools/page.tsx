import React from 'react'
import Image from 'next/image'

const AItools = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">AI Tools</h1>
      <Image
      src="https://drive.google.com/thumbnail?authuser=0&sz=w2000&id=1A_2OB4bv196TnsERAxuybm0u8oosf4T9" 
      alt="AI Tools" 
      width={1000} 
      height={600}
      loading="lazy"
      className="rounded-lg shadow-md"
      />
    </div>
  )
}

export default AItools

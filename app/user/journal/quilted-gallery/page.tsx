import QuiltedGallery from '@/components/quilted-gallery'
import React from 'react'

const Gallery = () => {
  const journalId = "1J1"; 

  return (
    <div>
      <QuiltedGallery journalId={journalId}/>
    </div>
  )
}

export default Gallery 

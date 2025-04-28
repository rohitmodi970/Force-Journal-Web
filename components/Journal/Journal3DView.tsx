// src/app/journal/Journal3DView.tsx
"use client";
import React, { useRef, useState, useMemo, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Plane, Text, useTexture, Html } from "@react-three/drei";
import * as THREE from "three";
import { JournalEntry } from "./types";
import { ImageIcon, Film, FileAudio, FileText } from 'lucide-react';

interface Journal3DViewProps {
  entries: JournalEntry[];
  onSelectEntry: (index: number) => void;
}

// Helper to load texture and handle errors/loading
function EntryTexture({ url }: { url: string | null }) {
    if (!url) return null; // No URL, no texture
    // useTexture handles suspense automatically
    const texture = useTexture(url);
    texture.colorSpace = THREE.SRGBColorSpace; // Ensure correct color space
    return <meshBasicMaterial map={texture} side={THREE.DoubleSide} toneMapped={false} />;
}

// Placeholder for non-image media
function MediaPlaceholder({ icon: Icon }: { icon: React.ComponentType<any> }) {
    return (
        <Html center>
            <div className="w-16 h-16 bg-gray-600/80 rounded flex items-center justify-center">
                <Icon className="w-8 h-8 text-white" />
            </div>
        </Html>
    );
}


function EntryPlane({
    entry,
    index,
    totalEntries,
    radius,
    onSelect,
}: {
    entry: JournalEntry;
    index: number;
    totalEntries: number;
    radius: number;
    onSelect: (index: number) => void;
}) {
    const meshRef = useRef<THREE.Mesh>(null!);
    const [hovered, setHovered] = useState(false);
    const [isActive, setIsActive] = useState(false);

    // Calculate position in a circle
    const angle = (index / totalEntries) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = 0; // Adjust Y for vertical arrangement if needed

    // Determine preview type
    const imageUrl = entry.mediaUrl?.image?.[0]; // Use first image
    const hasVideo = (entry.mediaUrl?.video?.length ?? 0) > 0;
    const hasAudio = (entry.mediaUrl?.audio?.length ?? 0) > 0;
    const hasDoc = (entry.mediaUrl?.document?.length ?? 0) > 0;

    let previewIcon: React.ComponentType<any> | null = null;
    if (!imageUrl) {
        if (hasVideo) previewIcon = Film;
        else if (hasAudio) previewIcon = FileAudio;
        else if (hasDoc) previewIcon = FileText;
        else previewIcon = ImageIcon; // Default if absolutely nothing
    }


    useFrame((state, delta) => {
        // Hover effect: slight scale and lift
        meshRef.current.scale.lerp(
            hovered ? new THREE.Vector3(1.1, 1.1, 1.1) : new THREE.Vector3(1, 1, 1),
            0.1
        );
        meshRef.current.position.y = THREE.MathUtils.lerp(
            meshRef.current.position.y,
            hovered ? y + 0.2 : y,
            0.1
        );
        // Look towards the center (0,0,0)
        meshRef.current.lookAt(0, y, 0);

        // Optional: Gentle rotation
        meshRef.current.rotation.y += delta * 0.05;
    });

    return (
        <group position={[x, y, z]}>
            <Plane
                ref={meshRef}
                args={[1.8, 1.8 * (9/16)]} // Plane size (adjust aspect ratio as needed)
                onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
                onPointerOut={() => setHovered(false)}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsActive(true); // Optional active state visual
                    onSelect(index);
                    // Reset active state after a delay maybe
                    setTimeout(() => setIsActive(false), 300);
                }}
            >
                {/* Conditional rendering: Texture or Placeholder Icon */}
                {imageUrl ? (
                     <Suspense fallback={<meshBasicMaterial color="grey" side={THREE.DoubleSide} />}>
                         <EntryTexture url={imageUrl} />
                     </Suspense>
                 ) : (
                    <>
                        <meshBasicMaterial color={hovered ? "#555" : "#444"} side={THREE.DoubleSide} />
                        {previewIcon && <MediaPlaceholder icon={previewIcon} />}
                    </>
                 )}
            </Plane>
            {/* Title Text (optional) */}
            <Text
                position={[0, -1.1, 0.1]} // Position below the plane
                fontSize={0.15}
                color="white"
                anchorX="center"
                anchorY="middle"
                maxWidth={1.8} // Match plane width
                outlineWidth={0.005}
                outlineColor="black"
            >
                {entry.title || "Untitled"}
            </Text>
             {/* Media Icons Indicator (optional) */}
             {/* <group position={[0.8, 0.4, 0.1]}> ... add small icons here ... </group> */}
        </group>
    );
}


const Journal3DView: React.FC<Journal3DViewProps> = ({ entries, onSelectEntry }) => {
    const radius = 5; // Radius of the circle arrangement

    // Memoize entries to avoid re-calculating positions unnecessarily
    const entryElements = useMemo(() => {
        return entries.map((entry, index) => (
            <EntryPlane
                key={entry.journalId || `3d-${index}`}
                entry={entry}
                index={index}
                totalEntries={entries.length}
                radius={radius}
                onSelect={onSelectEntry}
            />
        ));
    }, [entries, onSelectEntry, radius]);


    return (
        <div className="w-full h-[60vh] md:h-[70vh] bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden relative">
             {/* Loading Indicator */}
             <Suspense fallback={
                 <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50">
                     <p className="text-white text-lg animate-pulse">Loading 3D View...</p>
                 </div>
             }>
                <Canvas
                    camera={{ position: [0, 2, radius * 1.8], fov: 60 }} // Adjust camera position/FOV
                    shadows // Enable shadows if using lights that cast them
                >
                    {/* Lighting */}
                    <ambientLight intensity={0.6} />
                    <pointLight position={[0, 5, 0]} intensity={1.5} castShadow />
                    <directionalLight position={[-5, 5, 5]} intensity={0.8} />

                    {/* Environment & Controls */}
                    <OrbitControls
                        enablePan={true}
                        enableZoom={true}
                        minDistance={radius * 0.5} // Prevent zooming too close
                        maxDistance={radius * 3} // Prevent zooming too far
                        target={[0, 0, 0]} // Focus on the center
                    />
                     <fog attach="fog" args={['#202025', radius * 1.5, radius * 3]} /> {/* Optional Fog */}
                    <color attach="background" args={['#15151a']} /> {/* Dark background */}

                    {/* Render Entries */}
                    {entryElements}

                    {/* Optional: Floor */}
                    <Plane args={[radius*3, radius*3]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
                       <meshStandardMaterial color="#333" />
                    </Plane>
                </Canvas>
             </Suspense>
        </div>
    );
};

export default Journal3DView;
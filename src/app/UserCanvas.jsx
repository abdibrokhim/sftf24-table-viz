// src/components/UserCanvas.jsx

'use client';

import React, { useState, useMemo } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { OrbitControls, Html } from '@react-three/drei';
import './Home.module.css';

const fallbackImage = "https://firebasestorage.googleapis.com/v0/b/chatwithpdf-30e42.appspot.com/o/images%2Fuser-image.png?alt=media&token=91b6490a-a445-454c-b09a-7255a43419f2";
// Utility function to extract URL from headshot string
const getHeadshotUrl = (headshot) => {
  const match = headshot.match(/\((https?:\/\/[^)]+)\)/);
  return match ? match[1] : "https://v5.airtableusercontent.com/v3/u/33/33/1728086400000/uN1WiendAhgci5j1pS7T9A/Syqz2tRFpOqBOvKXX8wKHGOCFs_FG4VPfMZBw_-2uaJnU2XVNIOO2sbt49Txrytssk_d9X7UVa_Wm1hFSOrjCkKDTay_CVzeGMaZrcgX8x6Be1kmBatLhm8ceWSCNz1reiLK9c2GcsR1ikpK_echouWhD9VGch8Q-IaxonX3IHI/C-WwJNJJAlo66KLW1vPf4PzmKxrEshtvN3WzKRi80oE"; // Fallback image
};

const UserSprite = ({ user, position }) => {
  const [hovered, setHovered] = useState(false);
  const headshotUrl = getHeadshotUrl(user.Headshot);
  const texture = useLoader(TextureLoader, headshotUrl, undefined, (error) => {
    console.error(`Error loading texture for user ${user.id}:`, error);
  });

  return (
    <sprite
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={[2, 2, 2]} // Adjust sprite size as needed
    >
      <spriteMaterial key={8} map={texture} />
      {hovered && (
        <Html distanceFactor={20} position={[0, 3, 0]}>
          <div className="tooltip">
            <strong>{user.Name}</strong>
            <p>{user['Field of Study']}</p>
          </div>
        </Html>
      )}
    </sprite>
  );
};

const UserCanvas = ({ users }) => {
  // Compute min and max for each of the first three embedding dimensions
  const { minMax } = useMemo(() => {
    const minMax = {
      x: { min: Infinity, max: -Infinity },
      y: { min: Infinity, max: -Infinity },
      z: { min: Infinity, max: -Infinity },
    };

    users.forEach((user) => {
      const [x, y, z] = user.embedding.slice(0, 3);
      if (x < minMax.x.min) minMax.x.min = x;
      if (x > minMax.x.max) minMax.x.max = x;
      if (y < minMax.y.min) minMax.y.min = y;
      if (y > minMax.y.max) minMax.y.max = y;
      if (z < minMax.z.min) minMax.z.min = z;
      if (z > minMax.z.max) minMax.z.max = z;
    });

    return { minMax };
  }, [users]);

  // Function to normalize a value to a specified scale
  const normalize = (value, min, max, scale = 100) => {
    if (max === min) return 0; // Prevent division by zero
    return ((value - min) / (max - min)) * scale - scale / 2; // Maps to [-scale/2, scale/2]
  };

  // Generate normalized positions for all users
  const usersWithPositions = useMemo(() => {
    return users.map((user) => {
      const [x, y, z] = user.embedding.slice(0, 3);
      const normX = normalize(x, minMax.x.min, minMax.x.max, 100); // Adjust scale as needed
      const normY = normalize(y, minMax.y.min, minMax.y.max, 100);
      const normZ = normalize(z, minMax.z.min, minMax.z.max, 100);
      return {
        ...user,
        position: [normX, normY, normZ],
      };
    });
  }, [users, minMax]);

  return (
    <Canvas camera={{ position: [0, 0, 150], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      {usersWithPositions.map((user) => (
        <UserSprite key={user.id} user={user} position={user.position} />
      ))}
      <OrbitControls />
    </Canvas>
  );
};

export default UserCanvas;
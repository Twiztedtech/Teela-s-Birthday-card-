/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Stars, ChevronRight, ChevronLeft, Volume2, VolumeX, Send, User, MessageSquareHeart, Camera, X } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Design Constants
const THEME = {
  bg: '#FDFCF6', // Warm cream
  accent: '#D4AF37', // Gold
  text: '#2C2C2C',
  serif: "'Cormorant Garamond', serif",
  display: "'Playfair Display', serif"
};

/**
 * PHOTO MAPPING:
 * These point to the images you uploaded. 
 * Change the order here to change where they appear in the card!
 */
const PHOTOS = [
  'https://res.cloudinary.com/savvyone/image/upload/v1777833624/C1CC7B7B-CC49-4C88-9B9E-00C65E5C5868_jhqpyz.jpg', 
  'https://res.cloudinary.com/savvyone/image/upload/v1777833624/IMG_20241008_165930_mwfcyn.jpg', 
  'https://res.cloudinary.com/savvyone/image/upload/v1777833624/IMG_0558_pftnl4.jpg', 
  'https://res.cloudinary.com/savvyone/image/upload/v1777833624/IMG_3386_kn2w7y.jpg'  
];

// High-quality, soulful background music options from reliable sources
const MUSIC_OPTIONS = [
  { 
    name: 'Slow_Cozy', 
    url: 'https://res.cloudinary.com/savvyone/video/upload/v1777835309/Slow_Cozy_Lo-Fi_Romantic_Hip-Hop_vitsif.wav',
    id: 'slow-cozy'
  },
  { 
    name: 'A Valentines Blues', 
    url: 'https://res.cloudinary.com/savvyone/video/upload/v1777835549/A_Valentines_Blues_i6qyuu.wav',
    id: 'valentines'
  },
  { 
    name: 'Uplifting Thoughts', 
    url: 'https://res.cloudinary.com/savvyone/video/upload/v1777835690/Uplifting_Thoughts_it2okm.wav',
    id: 'uplifting'
  }
];

export default function App() {
  const [page, setPage] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMusic, setCurrentMusic] = useState(MUSIC_OPTIONS[0]);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [showMusicMenu, setShowMusicMenu] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalPages = 5;

  const nextPage = () => setPage((prev) => (prev + 1) % totalPages);
  const prevPage = () => setPage((prev) => (prev - 1 + totalPages) % totalPages);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setAudioError(null);
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(e => {
          console.error("Playback failed:", e);
          // Only show error if it's not a user interaction issue
          if (e.name !== 'NotAllowedError') {
            setAudioError("Playback failed. Try again.");
          }
        });
      }
    }
  };

  const changeMusic = (option: typeof MUSIC_OPTIONS[0]) => {
    setAudioError(null);
    setCurrentMusic(option);
    setShowMusicMenu(false);
    
    // Ensure the audio element reloads with the new source
    if (audioRef.current) {
      audioRef.current.load();
      // If it was already playing, try to play the new one
      if (isPlaying) {
        setTimeout(() => {
          audioRef.current?.play().catch(e => {
            console.error("Change playback failed:", e);
            setIsPlaying(false);
          });
        }, 100);
      }
    }
  };

  // Start music when card is opened
  useEffect(() => {
    if (isOpen && audioRef.current && !isPlaying) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        console.log("Autoplay blocked");
      });
    }
  }, [isOpen]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 sm:p-8"
      style={{ backgroundColor: THEME.bg, color: THEME.text, fontFamily: THEME.serif }}
    >
      <audio 
        ref={audioRef} 
        src={currentMusic.url} 
        loop 
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={(e) => {
          console.error("Audio Load Error:", e);
          setAudioError("Unable to load track.");
          setIsPlaying(false);
        }}
      />
      {/* Font Imports */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&display=swap');
          
          .card-shadow {
            box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          }
          
          .gold-border {
            border: 1px solid #D4AF37;
          }
        `}
      </style>

      <div className="max-w-4xl w-full flex flex-col items-center">
        {!isOpen ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center space-y-6 sm:space-y-8"
          >
            <div className="relative">
              <motion.div 
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="w-56 h-72 sm:w-64 sm:h-80 bg-white rounded-lg card-shadow gold-border flex items-center justify-center p-4 relative overflow-hidden"
              >
                <img 
                  src={PHOTOS[1]} 
                  alt="Teela and Family" 
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale"
                />
                <div className="z-10 flex flex-col items-center px-4">
                  <Stars className="text-[#D4AF37] mb-2" size={32} />
                  <h1 style={{ fontFamily: THEME.display }} className="text-3xl sm:text-4xl font-bold italic text-gray-800 leading-tight">
                    To Teela
                  </h1>
                </div>
                <div 
                  className="z-50 absolute inset-0 cursor-zoom-in"
                  onClick={() => setZoomedImage(PHOTOS[1])}
                />
              </motion.div>
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-[#D4AF37] text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-md pointer-events-none"
              >
                51
              </motion.div>
            </div>

            <div className="space-y-3 px-4">
              <h2 style={{ fontFamily: THEME.display }} className="text-2xl sm:text-4xl text-[#D4AF37] tracking-wider uppercase leading-snug">
                A Special Birthday Message
              </h2>
              <p className="text-lg sm:text-xl italic opacity-70">Celebrating the mother of our children</p>
            </div>

            <motion.button
              id="open-card-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              className="px-10 py-4 bg-[#D4AF37] text-white rounded-full flex items-center gap-3 text-lg font-medium tracking-widest shadow-lg shadow-[#D4AF37]/30 cursor-pointer"
            >
              Open Card
              <ChevronRight size={20} />
            </motion.button>
          </motion.div>
        ) : (
          <div className="w-full">
            <div className="flex justify-between items-center mb-4 sm:mb-6 px-2">
              <button 
                id="back-button"
                onClick={() => setIsOpen(false)}
                className="py-2 pr-4 text-xs sm:text-sm uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <div className="flex gap-2 text-[10px] tracking-widest uppercase opacity-40 font-medium">
                Page {page + 1} / {totalPages}
              </div>
              <div className="flex gap-1.5 sm:gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${page === i ? 'bg-[#D4AF37]' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
            </div>

            <div className="relative h-[550px] sm:h-[600px] w-full overflow-hidden rounded-2xl bg-white card-shadow border border-gray-100">
              <AnimatePresence mode="wait">
                <motion.div
                  key={page}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5, ease: "anticipate" }}
                  className="absolute inset-0 flex flex-col"
                >
                  {page === 0 && <PageOne onZoom={setZoomedImage} />}
                  {page === 1 && <PageTwo onZoom={setZoomedImage} />}
                  {page === 2 && <PageThree onZoom={setZoomedImage} />}
                  {page === 3 && <PageFour onZoom={setZoomedImage} />}
                  {page === 4 && <Guestbook onZoom={setZoomedImage} />}
                </motion.div>
              </AnimatePresence>
              
              <button 
                id="prev-page-button"
                onClick={prevPage}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/90 border border-gray-200 text-gray-800 hover:bg-white shadow-sm transition-colors z-20 cursor-pointer"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button 
                id="next-page-button"
                onClick={nextPage}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/90 border border-gray-200 text-gray-800 hover:bg-white shadow-sm transition-colors z-20 cursor-pointer"
                aria-label="Next Page"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <p className="mt-6 text-center text-[10px] sm:text-xs opacity-40 tracking-widest uppercase italic">
              Tap the arrows to explore your birthday card
            </p>
          </div>
        )}
      </div>


      {/* Music Control - Floating */}
      <div className="fixed bottom-8 right-8 flex flex-col items-end gap-3 z-50">
        <AnimatePresence>
          {showMusicMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="bg-white border border-gray-100 rounded-2xl p-2 card-shadow flex flex-col gap-1 mb-2"
            >
              {MUSIC_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => changeMusic(option)}
                  className={`px-4 py-2 rounded-xl text-xs uppercase tracking-widest text-left transition-colors cursor-pointer whitespace-nowrap ${currentMusic.id === option.id ? 'bg-[#D4AF37] text-white' : 'hover:bg-gray-50 text-gray-600'}`}
                >
                  {option.name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col items-end gap-2">
          <AnimatePresence>
            {audioError && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-red-500 text-white text-[10px] px-2 py-1 rounded-md uppercase tracking-tighter mb-1"
              >
                {audioError}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex gap-2">
            <motion.button
              id="music-menu-toggle"
              onClick={() => setShowMusicMenu(!showMusicMenu)}
              className={`p-3 rounded-full shadow-lg flex items-center justify-center transition-all bg-white text-gray-400 border border-gray-200 hover:text-[#D4AF37] cursor-pointer`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Stars size={20} className={showMusicMenu ? 'text-[#D4AF37]' : ''} />
            </motion.button>

            <motion.button
              id="music-toggle"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={toggleMusic}
              className={`p-3 rounded-full shadow-lg flex items-center justify-center transition-all ${isPlaying ? 'bg-[#D4AF37] text-white' : 'bg-white text-gray-400 border border-gray-200'} cursor-pointer`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {isPlaying ? (
                  <motion.div
                    key="playing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Volume2 size={24} className="animate-pulse" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="paused"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <VolumeX size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.2em] opacity-40">
        Created for Teela with love
      </footer>

      {/* Lightbox Overlay */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomedImage(null)}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={zoomedImage} 
                alt="Enlarged view" 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setZoomedImage(null)}
                className="absolute -top-12 right-0 text-white hover:text-[#D4AF37] transition-colors p-2"
              >
                <X size={32} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PageOne({ onZoom }: { onZoom: (url: string) => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 text-center bg-gradient-to-br from-white to-[#FDFCF6]">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-6 sm:mb-10 cursor-zoom-in"
        onClick={() => onZoom(PHOTOS[0])}
      >
        <div className="relative w-48 h-48 sm:w-72 sm:h-72 rounded-full overflow-hidden border-4 sm:border-8 border-[#D4AF37] p-1.5 sm:p-3 bg-white card-shadow">
          <img 
            src={PHOTOS[0]} 
            alt="Celebrating You" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-full" 
          />
        </div>
      </motion.div>
      <h1 style={{ fontFamily: THEME.display }} className="text-4xl sm:text-7xl mb-2 sm:mb-4 font-black text-gray-800 tracking-tight leading-none">
        Happy 51st
      </h1>
      <h2 style={{ fontFamily: THEME.display }} className="text-2xl sm:text-4xl italic text-[#D4AF37] font-medium">
        Birthday, Teela
      </h2>
      <div className="mt-6 sm:mt-10 w-16 sm:w-32 h-0.5 bg-[#D4AF37] opacity-20" />
    </div>
  );
}


function PageTwo({ onZoom }: { onZoom: (url: string) => void }) {
  return (
    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 p-6 sm:p-12 overflow-y-auto sm:overflow-hidden">
      <div className="grid grid-cols-2 sm:grid-cols-1 sm:grid-rows-2 gap-3 sm:gap-4 order-2 sm:order-1">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="aspect-square sm:aspect-auto rounded-xl overflow-hidden border border-gray-100 bg-gray-50 card-shadow cursor-zoom-in"
          onClick={() => onZoom(PHOTOS[2])}
        >
          <img src={PHOTOS[2]} alt="The Legacy" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
        </motion.div>
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="aspect-square sm:aspect-auto rounded-xl overflow-hidden border border-gray-100 bg-gray-50 card-shadow cursor-zoom-in"
          onClick={() => onZoom(PHOTOS[0])}
        >
          <img src={PHOTOS[0]} alt="The Photos" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
        </motion.div>
      </div>
      <div className="flex flex-col justify-center space-y-4 sm:space-y-6 order-1 sm:order-2">
        <Heart className="text-red-400 fill-red-400 w-6 h-6 sm:w-8 sm:h-8" />
        <h3 style={{ fontFamily: THEME.display }} className="text-2xl sm:text-4xl text-gray-800 font-bold leading-tight">
          A Legacy of <br />
          <span className="text-[#D4AF37] italic">Motherhood</span>
        </h3>
        <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
          Through the years, the greatest joy has been seeing you bloom as a mother and now, an incredible grandmother. 
        </p>
        <div className="border-l-4 border-[#D4AF37] pl-4 py-2 bg-[#D4AF37]/5 rounded-r-lg">
          <p className="text-sm sm:text-lg text-gray-700 italic leading-snug">
            "A grandmother's love is a forever tie that bonds generations."
          </p>
        </div>
      </div>
    </div>
  );
}


function PageThree({ onZoom }: { onZoom: (url: string) => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 text-center relative overflow-y-auto scrollbar-hide">
       <div className="absolute top-4 right-4 w-24 h-24 sm:w-40 sm:h-40 opacity-10 pointer-events-none">
          <Stars size="100%" className="text-[#D4AF37]" />
       </div>
       
       <div className="max-w-xl space-y-4 sm:space-y-8 z-10 py-6">
         <h4 style={{ fontFamily: THEME.display }} className="text-sm sm:text-xl uppercase tracking-[0.3em] font-bold text-[#D4AF37]">
           From My Heart
         </h4>
         
         <div className="space-y-4 sm:space-y-6 text-base sm:text-2xl leading-relaxed text-gray-700 italic font-medium">
           <p className="px-2">
             On your 51st birthday, we celebrate the incredible woman you are. 
           </p>
           <p className="px-2">
             Although our paths as husband and wife have changed, the bond we share through our children and our beautiful grandchild remains as strong as ever.
           </p>
           <p className="px-2">
             Thank you for being the heart of this family. Wishing you a long life filled with the same happiness and love you give so freely as a mother and grandmother.
           </p>
         </div>
         
         <div className="pt-4 sm:pt-10">
           <p className="text-[#D4AF37] font-bold text-xl sm:text-3xl tracking-wide" style={{ fontFamily: THEME.display }}>
             Happy Birthday, Teela!
           </p>
         </div>
       </div>
    </div>
  );
}


function PageFour({ onZoom }: { onZoom: (url: string) => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 text-center bg-[#1a1a1a] text-white overflow-hidden relative">
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Heart size={300} className="sm:size-[400px] text-white opacity-5" />
      </motion.div>
      <div className="z-10 space-y-6 sm:space-y-10">
        <div className="relative inline-block cursor-zoom-in group" onClick={() => onZoom(PHOTOS[3])}>
          <div className="w-44 h-44 sm:w-72 sm:h-72 rounded-2xl overflow-hidden border-4 border-white/10 bg-gray-800 card-shadow transition-transform group-hover:scale-105 duration-500">
            <img src={PHOTOS[3]} alt="Family Collage" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          </div>
          <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
             className="absolute -bottom-3 -right-3 sm:-bottom-5 sm:-right-5 bg-[#D4AF37] p-2 sm:p-3 rounded-full text-white shadow-xl"
          >
            <Stars size={18} className="sm:size-6" />
          </motion.div>
        </div>
        
        <div className="space-y-3">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.5em] text-white/50 font-bold">Year Fifty One</p>
          <h2 style={{ fontFamily: THEME.display }} className="text-3xl sm:text-4xl text-[#D4AF37] font-bold tracking-wide">
            Long Life & Happiness
          </h2>
          <p className="text-base sm:text-xl italic opacity-70 font-light">May this new chapter be your best yet.</p>
        </div>
      </div>
    </div>
  );
}


interface Wish {
  id: string;
  name: string;
  message: string;
  photoBase64?: string;
  createdAt: Timestamp;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: any, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error?.message || String(error),
    authInfo: {
      userId: null, // Client-guest app, no auth instance here for now
      email: null,
      emailVerified: null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw error;
}

function Guestbook({ onZoom }: { onZoom: (url: string) => void }) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image compression helper
  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Photo is too large (max 5MB).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        const MAX_HEIGHT = 500;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.5); // Higher compression
        setPhoto(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!db) return;
    
    // Diagnostic: Check connection
    const checkConnection = async () => {
      try {
        const { doc, getDocFromServer } = await import('firebase/firestore');
        await getDocFromServer(doc(db, '_connection_test_', 'check'));
      } catch (err: any) {
        if (err.message?.includes('offline')) {
          console.error("Firebase is offline");
          setError("Connection error. Using cached data if available.");
        }
      }
    };
    checkConnection();

    const fetchWishes = (useOrderBy = true) => {
      const wishesCol = collection(db, 'wishes');
      const q = useOrderBy 
        ? query(wishesCol, orderBy('createdAt', 'desc'))
        : query(wishesCol);

      return onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Wish[];
        setWishes(docs);
        setError(null);
      }, (err) => {
        if (useOrderBy && (err.message?.includes('index') || err.code === 'failed-precondition')) {
          fetchWishes(false);
          return;
        }

        let friendlyError = "Wishes list could not be loaded.";
        if (err.message?.includes('permission-denied')) {
          friendlyError = "Access restricted. Please try again later.";
          handleFirestoreError(err, OperationType.LIST, 'wishes');
        } else if (err.code === 'resource-exhausted') {
          friendlyError = "High traffic. Quota exceeded.";
        }
        setError(friendlyError);
      });
    };

    const unsubscribe = fetchWishes(true);
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedMessage = message.trim();
    
    if (!trimmedName || !trimmedMessage) {
       setError("Please fill in both name and message.");
       return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const wishData: any = {
        name: trimmedName,
        message: trimmedMessage,
        createdAt: serverTimestamp()
      };
      
      if (photo) {
        if (photo.length > 990000) {
          throw new Error("Photo is too large. Try a smaller one.");
        }
        wishData.photoBase64 = photo;
      }

      console.log("Submitting wish:", { ...wishData, photoBase64: photo ? "exists" : "none" });
      await addDoc(collection(db, 'wishes'), wishData);
      console.log("Wish submitted successfully");
      
      setName('');
      setMessage('');
      setPhoto(null);
    } catch (err: any) {
      console.error("Submission error:", err);
      const errorMessage = err.message || "";
      
      if (errorMessage.includes('permission-denied')) {
        setError("Validation failed. Check your message length.");
        handleFirestoreError(err, OperationType.CREATE, 'wishes');
      } else if (err.code === 'resource-exhausted') {
        setError("Posts are full for today.");
      } else {
        setError(`Error: ${err.code || 'Unable to post'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
        <div className="flex items-center justify-center gap-2">
          <MessageSquareHeart className="text-[#D4AF37]" size={20} />
          <h2 style={{ fontFamily: THEME.display }} className="text-xl sm:text-2xl text-gray-800 font-bold tracking-tight">Family Guestbook</h2>
        </div>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
        {/* Form Section */}
        <div className="w-full sm:w-[45%] p-4 sm:p-6 border-b sm:border-b-0 sm:border-r border-gray-100 overflow-y-auto shrink-0 scrollbar-hide">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold mb-1.5 px-1">Your Name</label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Grandpa Mike"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all text-sm placeholder:text-gray-300"
                  maxLength={50}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold mb-1.5 px-1">Attach Photo</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all text-xs font-semibold cursor-pointer bg-gray-50/50"
                  aria-label="Upload Photo"
                >
                  <Camera size={16} />
                  {photo ? 'Change' : 'Click to Upload'}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                
                {photo && (
                  <div className="relative">
                    <img src={photo} alt="Preview" className="w-11 h-11 object-cover rounded-xl border-2 border-white shadow-md" />
                    <button 
                      type="button"
                      onClick={() => setPhoto(null)}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 shadow-lg ring-2 ring-white"
                    >
                      <X size={10} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold mb-1.5 px-1">Your Wish</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share a memory or a prayer..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all text-sm h-20 sm:h-24 resize-none placeholder:text-gray-300"
                maxLength={500}
                required
              />
            </div>
            
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-2 rounded-lg bg-red-50 text-red-500 text-[10px] font-bold uppercase text-center tracking-tight border border-red-100">
                {error}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
              type="submit"
              className="w-full py-3.5 bg-[#D4AF37] text-white rounded-xl font-bold tracking-[0.2em] uppercase text-xs flex items-center justify-center gap-2 shadow-xl shadow-[#D4AF37]/20 disabled:opacity-50 transition-shadow"
            >
              {isSubmitting ? 'Sending...' : 'Post Wish'}
              <Send size={14} />
            </motion.button>
          </form>
        </div>

        {/* List Section */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-gray-50/40 space-y-4 scrollbar-hide">
          <AnimatePresence mode="popLayout">
            {wishes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30 italic py-10">
                <Heart size={32} className="mb-2 text-gray-300" />
                <p className="text-xs">No wishes yet. <br /> Be the first to celebrate Teela!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {wishes.map((wish) => (
                  <motion.div
                    key={wish.id}
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#D4AF37] flex items-center justify-center text-white text-[10px] font-black shadow-sm">
                          {wish.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-bold text-gray-800 tracking-tight">{wish.name}</span>
                      </div>
                      <Stars className="text-[#D4AF37]/20" size={14} />
                    </div>
                    
                    {wish.photoBase64 && (
                      <div 
                        className="rounded-xl overflow-hidden border border-gray-50 cursor-pointer shadow-inner bg-gray-50"
                        onClick={() => onZoom(wish.photoBase64!)}
                      >
                        <img 
                          src={wish.photoBase64} 
                          alt={`From ${wish.name}`} 
                          className="w-full max-h-40 sm:max-h-48 object-cover hover:scale-105 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed italic font-serif">"{wish.message}"</p>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}


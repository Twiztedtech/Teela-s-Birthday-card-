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
            className="flex flex-col items-center text-center space-y-8"
          >
            <div className="relative">
              <motion.div 
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="w-48 h-64 sm:w-64 sm:h-80 bg-white rounded-lg card-shadow gold-border flex items-center justify-center p-4 relative overflow-hidden"
              >
                <img 
                  src={PHOTOS[1]} 
                  alt="Teela and Family" 
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale"
                />
                <div className="z-10 flex flex-col items-center">
                  <Stars className="text-[#D4AF37] mb-2" size={32} />
                  <h1 style={{ fontFamily: THEME.display }} className="text-3xl font-bold italic text-gray-800">
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
                className="absolute -top-4 -right-4 bg-[#D4AF37] text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg pointer-events-none"
              >
                51
              </motion.div>
            </div>

            <div className="space-y-4">
              <h2 style={{ fontFamily: THEME.display }} className="text-2xl sm:text-4xl text-[#D4AF37] tracking-wider uppercase">
                A Special Birthday Message
              </h2>
              <p className="text-xl italic opacity-70">Celebrating the mother of our children</p>
            </div>

            <motion.button
              id="open-card-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              className="px-8 py-3 bg-[#D4AF37] text-white rounded-full flex items-center gap-2 text-lg font-medium tracking-widest shadow-lg shadow-[#D4AF37]/20 cursor-pointer"
            >
              Open Card
              <ChevronRight size={20} />
            </motion.button>
          </motion.div>
        ) : (
          <div className="w-full">
            <div className="flex justify-between items-center mb-6">
              <button 
                id="back-button"
                onClick={() => setIsOpen(false)}
                className="text-sm uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={14} /> Back
              </button>
              <div className="flex gap-2 text-[10px] tracking-widest uppercase opacity-40">
                Page {page + 1} of {totalPages}
              </div>
              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-2 h-2 rounded-full transition-colors ${page === i ? 'bg-[#D4AF37]' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
            </div>

            <div className="relative h-[500px] sm:h-[600px] w-full overflow-hidden rounded-2xl bg-white card-shadow border border-gray-100">
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
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 border border-gray-200 text-gray-800 hover:bg-white transition-colors z-20 cursor-pointer"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                id="next-page-button"
                onClick={nextPage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 border border-gray-200 text-gray-800 hover:bg-white transition-colors z-20 cursor-pointer"
              >
                <ChevronRight size={24} />
              </button>
            </div>
            
            <p className="mt-4 text-center text-xs opacity-50 italic">
              Click the arrows to flip through the pages
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
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-white to-[#FDFCF6]">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-8 cursor-zoom-in"
        onClick={() => onZoom(PHOTOS[0])}
      >
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-full overflow-hidden border-4 border-[#D4AF37] p-2 bg-white card-shadow">
          <img 
            src={PHOTOS[0]} 
            alt="Celebrating You" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-full" 
          />
        </div>
      </motion.div>
      <h1 style={{ fontFamily: THEME.display }} className="text-5xl sm:text-7xl mb-4 font-black text-gray-800">
        Happy 51st
      </h1>
      <h2 style={{ fontFamily: THEME.display }} className="text-3xl sm:text-4xl italic text-[#D4AF37]">
        Birthday, Teela
      </h2>
      <div className="mt-8 w-24 h-0.5 bg-[#D4AF37] opacity-30" />
    </div>
  );
}

function PageTwo({ onZoom }: { onZoom: (url: string) => void }) {
  return (
    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-8">
      <div className="grid grid-cols-2 sm:grid-cols-1 sm:grid-rows-2 gap-4">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 cursor-zoom-in"
          onClick={() => onZoom(PHOTOS[2])}
        >
          <img src={PHOTOS[2]} alt="The Legacy" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
        </motion.div>
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 cursor-zoom-in"
          onClick={() => onZoom(PHOTOS[0])}
        >
          <img src={PHOTOS[0]} alt="The Photos" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
        </motion.div>
      </div>
      <div className="flex flex-col justify-center space-y-6">
        <Heart className="text-red-400 fill-red-400" />
        <h3 style={{ fontFamily: THEME.display }} className="text-3xl sm:text-4xl text-gray-800 leading-tight">
          A Legacy of <br />
          <span className="text-[#D4AF37] italic">Motherhood</span>
        </h3>
        <p className="text-lg opacity-80 leading-relaxed">
          Through the years, the greatest joy has been seeing you bloom as a mother and now, an incredible grandmother. 
        </p>
        <p className="text-lg opacity-80 italic border-l-2 border-[#D4AF37] pl-4 py-2 bg-gray-50/50">
          "A grandmother's love is a forever tie that bonds generations."
        </p>
      </div>
    </div>
  );
}

function PageThree({ onZoom }: { onZoom: (url: string) => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center relative overflow-y-auto">
       <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
          <Stars size={120} className="text-[#D4AF37]" />
       </div>
       
       <div className="max-w-xl space-y-6 z-10">
         <h4 style={{ fontFamily: THEME.display }} className="text-2xl uppercase tracking-widest text-[#D4AF37]">
           From My Heart
         </h4>
         
         <div className="space-y-6 text-xl sm:text-2xl leading-relaxed text-gray-700 italic">
           <p>
             On your 51st birthday, we celebrate the incredible woman you are. 
           </p>
           <p>
             Although our paths as husband and wife have changed, the bond we share through our children and our beautiful grandchild remains as strong as ever.
           </p>
           <p>
             Thank you for being the heart of this family. Wishing you a long life filled with the same happiness and love you give so freely as a mother and grandmother.
           </p>
         </div>
         
         <div className="pt-8">
           <p className="text-[#D4AF37] font-bold text-2xl" style={{ fontFamily: THEME.display }}>
             Happy Birthday, Teela!
           </p>
         </div>
       </div>
    </div>
  );
}

function PageFour({ onZoom }: { onZoom: (url: string) => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#1a1a1a] text-white overflow-hidden relative">
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Heart size={400} className="text-white opacity-10" />
      </motion.div>
      <div className="z-10 space-y-8">
        <div className="relative inline-block cursor-zoom-in" onClick={() => onZoom(PHOTOS[3])}>
          <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-2xl overflow-hidden border-4 border-white/20 bg-gray-800 card-shadow">
            <img src={PHOTOS[3]} alt="Family Collage" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          </div>
          <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
             className="absolute -bottom-4 -right-4 bg-[#D4AF37] p-2 rounded-full text-white"
          >
            <Stars size={24} />
          </motion.div>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.4em] opacity-60">Year Fifty One</p>
          <h2 style={{ fontFamily: THEME.display }} className="text-4xl text-[#D4AF37]">
            Long Life & Happiness
          </h2>
          <p className="text-lg italic opacity-80">May this new chapter be your best yet.</p>
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
      setError("Photo is too large. Please select a smaller image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
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
        
        // Convert to highly compressed JPEG to save space in Firestore
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        setPhoto(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'wishes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Wish[];
      setWishes(docs);
      setError(null);
    }, (err) => {
      console.error("Firestore List Error:", err);
      setError("Wishes list could not be loaded.");
      const errInfo = {
        error: err.message,
        operationType: 'list',
        path: 'wishes',
        authInfo: { userId: null }
      };
      console.error('Firestore Error: ', JSON.stringify(errInfo));
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const wishData: any = {
        name: name.trim(),
        message: message.trim(),
        createdAt: serverTimestamp()
      };
      
      if (photo) {
        // Pre-validate base64 size against 1MB Firestore limit (~1,333,333 chars)
        // and my specific rule limit (950,000 chars)
        if (photo.length > 990000) {
          throw new Error("The photo is too large after processing. Please try a smaller photo.");
        }
        wishData.photoBase64 = photo;
      }

      await addDoc(collection(db, 'wishes'), wishData);
      setName('');
      setMessage('');
      setPhoto(null);
      setError(null);
    } catch (err: any) {
      console.error("Firestore Write Error:", err);
      
      // Provide more helpful error messages
      const errorMessage = err.message || "";
      if (errorMessage.includes('permission-denied')) {
        setError("Post failed: Validation error. Please ensure you filled all fields correctly.");
      } else if (errorMessage.includes('too large')) {
        setError(errorMessage);
      } else if (err.code === 'resource-exhausted') {
        setError("Posts are currently unavailable due to high traffic (Quota exceeded).");
      } else {
        setError(`Error: ${err.code || 'Failed to send'}. Please try again.`);
      }

      const errInfo = {
        error: err instanceof Error ? err.message : String(err),
        operationType: 'create',
        path: 'wishes',
        authInfo: { userId: null }
      };
      console.error('Firestore Error: ', JSON.stringify(errInfo));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-center gap-2 mb-1">
          <MessageSquareHeart className="text-[#D4AF37]" size={24} />
          <h2 style={{ fontFamily: THEME.display }} className="text-2xl text-gray-800">Family Guestbook</h2>
        </div>
        <p className="text-center text-[10px] uppercase tracking-widest text-[#D4AF37] opacity-60 font-medium">Public Wishes for Teela's 51st</p>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
        {/* Form Section */}
        <div className="w-full sm:w-1/2 p-6 border-b sm:border-b-0 sm:border-r border-gray-100 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold mb-1">Your Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Grandpa Mike"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all text-sm"
                  maxLength={50}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold mb-1">Photo (Optional)</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-gray-300 text-gray-500 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all text-xs cursor-pointer"
                >
                  <Camera size={14} />
                  {photo ? 'Change Photo' : 'Attach Photo'}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                
                {photo && (
                  <div className="relative group">
                    <img src={photo} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-gray-200" />
                    <button 
                      type="button"
                      onClick={() => setPhoto(null)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold mb-1">Birthday Wish</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share a memory or a prayer..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all text-sm h-24 resize-none"
                maxLength={500}
                required
              />
            </div>
            {error && <p className="text-red-500 text-xs italic">{error}</p>}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
              type="submit"
              className="w-full py-3 bg-[#D4AF37] text-white rounded-xl font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Sending...' : 'Post Wish'}
              <Send size={14} />
            </motion.button>
          </form>
        </div>

        {/* List Section */}
        <div className="w-full sm:w-1/2 p-6 overflow-y-auto bg-gray-50/30">
          <AnimatePresence mode="popLayout">
            {wishes.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center opacity-40 italic py-12">
                <p>No wishes yet. <br /> Be the first to say happy birthday!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {wishes.map((wish) => (
                  <motion.div
                    key={wish.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-[10px] uppercase font-bold">
                        {wish.name.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-gray-800 tracking-tight">{wish.name}</span>
                    </div>
                    
                    {wish.photoBase64 && (
                      <div 
                        className="mb-3 rounded-lg overflow-hidden border border-gray-50 cursor-zoom-in"
                        onClick={() => onZoom(wish.photoBase64!)}
                      >
                        <img 
                          src={wish.photoBase64} 
                          alt={`From ${wish.name}`} 
                          className="w-full max-h-48 object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-600 leading-relaxed italic">"{wish.message}"</p>
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

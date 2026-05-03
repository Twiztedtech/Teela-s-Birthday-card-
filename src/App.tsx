/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Stars, ChevronRight, ChevronLeft } from 'lucide-react';

// Design Constants
const THEME = {
  bg: '#FDFCF6', // Warm cream
  accent: '#D4AF37', // Gold
  text: '#2C2C2C',
  serif: "'Cormorant Garamond', serif",
  display: "'Playfair Display', serif"
};

const PHOTOS = [
  'input_file_0.png',
  'input_file_1.png',
  'input_file_2.png',
  'input_file_3.png'
];

export default function App() {
  const [page, setPage] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const nextPage = () => setPage((prev) => (prev + 1) % 4);
  const prevPage = () => setPage((prev) => (prev - 1 + 4) % 4);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 sm:p-8"
      style={{ backgroundColor: THEME.bg, color: THEME.text, fontFamily: THEME.serif }}
    >
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
                  src={PHOTOS[2]} 
                  alt="Teela and Family" 
                  className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale"
                />
                <div className="z-10 flex flex-col items-center">
                  <Stars className="text-[#D4AF37] mb-2" size={32} />
                  <h1 style={{ fontFamily: THEME.display }} className="text-3xl font-bold italic">
                    To Teela
                  </h1>
                </div>
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
              <p className="text-xl italic opacity-70">From the heart of the family</p>
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
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((i) => (
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
                  {page === 0 && <PageOne />}
                  {page === 1 && <PageTwo />}
                  {page === 2 && <PageThree />}
                  {page === 3 && <PageFour />}
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
          </div>
        )}
      </div>

      <footer className="fixed bottom-4 text-[10px] uppercase tracking-[0.2em] opacity-40">
        Created for Teela with love
      </footer>
    </div>
  );
}

function PageOne() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-white to-[#FDFCF6]">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-8"
      >
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-full overflow-hidden border-4 border-[#D4AF37] p-2">
          <img src={PHOTOS[0]} alt="Youthful Days" className="w-full h-full object-cover rounded-full" />
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

function PageTwo() {
  return (
    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-8">
      <div className="grid grid-cols-2 sm:grid-cols-1 sm:grid-rows-2 gap-4">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl overflow-hidden border border-gray-100"
        >
          <img src={PHOTOS[3]} alt="Collage Photo 1" className="w-full h-full object-cover" />
        </motion.div>
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl overflow-hidden border border-gray-100"
        >
          <img src={PHOTOS[1]} alt="Collage Photo 2" className="w-full h-full object-cover" />
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
        <p className="text-lg opacity-80 italic">
          "A grandmother's love is a forever tie that bonds generations."
        </p>
      </div>
    </div>
  );
}

function PageThree() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center relative overflow-y-auto">
       <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
          <Stars size={120} className="text-[#D4AF37]" />
       </div>
       
       <div className="max-w-xl space-y-6 z-10">
         <h4 style={{ fontFamily: THEME.display }} className="text-2xl uppercase tracking-widest text-[#D4AF37]">
           From My Heart
         </h4>
         
         <div className="space-y-4 text-xl sm:text-2xl leading-relaxed text-gray-700">
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
             Happy Birthday!
           </p>
         </div>
       </div>
    </div>
  );
}

function PageFour() {
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
        <div className="relative inline-block">
          <img src={PHOTOS[2]} alt="Final Photo" className="w-48 h-48 sm:w-64 sm:h-64 object-cover rounded-2xl border-4 border-white/20" />
          <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
             className="absolute -bottom-4 -right-4 bg-white p-2 rounded-full text-[#1a1a1a]"
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


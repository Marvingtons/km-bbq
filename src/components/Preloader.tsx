"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Preloader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem("km-preloader-shown")) {
      document.documentElement.classList.add("preloading");
      setVisible(true);

      const timer = setTimeout(() => {
        setVisible(false);
        sessionStorage.setItem("km-preloader-shown", "1");
        document.documentElement.classList.remove("preloading");
      }, 2800);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-brand-cream"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.43, 0.13, 0.23, 0.96] }}
          aria-label="Loading KM.BBQ"
          role="status"
        >
          <div className="flex flex-col items-center gap-8">
            {/* Badge with animated ring */}
            <div
              className="relative flex items-center justify-center"
              style={{ width: "min(192px, 80vw)", height: "min(192px, 80vw)" }}
            >
              {/* Animated ring */}
              <motion.svg
                width="100%"
                height="100%"
                viewBox="0 0 110 110"
                className="absolute inset-0"
                aria-hidden="true"
              >
                <motion.circle
                  cx="55"
                  cy="55"
                  r="50"
                  fill="none"
                  stroke="#1A36AF"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeDasharray="314.16"
                  initial={{ strokeDashoffset: 314.16, opacity: 0 }}
                  animate={{ strokeDashoffset: 0, opacity: 0.5 }}
                  transition={{ duration: 1.6, ease: "easeOut", delay: 0.2 }}
                />
              </motion.svg>

              {/* Badge SVG — just the circular badge portion */}
              <motion.svg
                viewBox="64 177 52 46"
                width="75%"
                height="66%"
                aria-hidden="true"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <defs>
                  <linearGradient
                    id="pre-k-grad"
                    x1="79.2"
                    x2="100.6"
                    y1="-371"
                    y2="-371"
                    gradientTransform="matrix(1 0 0 -1 0 3)"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#EBA039" offset="0" />
                    <stop stopColor="#F58721" offset="1" />
                  </linearGradient>
                </defs>
                {/* Blue circle */}
                <path
                  fill="#1A36AF"
                  d="m85 179c-8.8 2.1-18.5 10-18.5 21 0 9.6 7.4 20.6 22.5 20.9 13.1 0.2 22.5-9.9 22.5-20.9s-9.4-24-26.5-21z"
                />
                {/* K letter */}
                <path
                  d="m80.2 184.8v20.2h5l0.4-4 2-1.9c0.6-0.7 3.2 3.8 5.4 5.9h5.5v-1l-6.8-8.4 8.9-9.4-0.1-0.5-5.8-0.1-8.9 9.8-0.2-10.4-5.4-0.2z"
                  fill="url(#pre-k-grad)"
                  stroke="#BD752E"
                  strokeWidth=".2"
                />
                {/* Animated flame */}
                <motion.path
                  fill="#EC2229"
                  stroke="#FFFFFF"
                  strokeWidth="0.8388"
                  d="m78.1 200c0.5 3.7-5.3 5-5.6 7.2-0.2 1.5 0.9 3.4 2 3.4s3.4-0.8 4.8 0.4c0.4 0.7-4 4 0.2 5.3 1.6 0.4 3.4 0.4 4.1-0.4 1.1-1.1 1.9-3.9 2.7-3.4 4.2 2.5 6.7 2.7 8.2 0.7 1-1.2 0.8-1.5 2.3-0.9 3.2 1.2 7.3 2.7 7-4.3 0-1.5 1.2-2.7 0.3-3.3-1.6-1.1-1.8 2.9-3.3 3.1-2 0 0.1-2.2-0.3-4.5-0.7-3.2-4.4-3.5-5.5-6.8-0.5-0.5-1.3 0.1-1.5 1.2-0.2 3.2 3.1 5.1 3 6.4l-2.5 2.2c-0.6-1.7-2.3-4.1-3.5-4.2-1-0.1 0 4.2-0.2 4.4-0.7 0.8-3.7 1.4-4.3 0.2-0.3-2.4 0.6-7.8-2-9.1-1-0.2-1.2 0.4-1 1.3 1 5-2 7.4-3.7 6.6-2.2-1.5 2-2.6 0.4-4.8-0.2-0.6-1.8-2.3-1.6-0.7z"
                  animate={{
                    scale: [1, 1.025, 0.975, 1.03, 0.98, 1],
                    opacity: [1, 0.88, 1, 0.82, 0.95, 1],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.6,
                  }}
                  style={{ transformOrigin: "85px 207px" }}
                />
              </motion.svg>
            </div>

            {/* Wordmark */}
            <motion.p
              className="font-serif text-4xl tracking-[0.25em] text-brand-blue/80 font-light"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              M.BBQ
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

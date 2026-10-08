import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Check, Award, Image as ImageIcon } from 'lucide-react';
import { playSelectSound } from '../utils/sound';
import { SIGNATURE_BASE64 } from '../assets/signatureBase64';

export default function Certificate({ playerName, relation, score, totalQuestions }) {
  const certificateRef = useRef(null);
  const exportRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadType, setDownloadType] = useState('pdf'); // 'pdf' | 'png'

  useEffect(() => {
    setMounted(true);
  }, []);

  const percentage = Math.round((score / totalQuestions) * 100);
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Capitalize name cleanly if lowercase
  const formattedName = (playerName || 'Worthy Friend')
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  const generateCanvas = async () => {
    if (!exportRef.current) return null;

    // Ensure all web fonts are fully loaded
    if (document.fonts) {
      await document.fonts.ready;
    }

    const exportEl = exportRef.current;

    // Zero-flicker: NEVER move exportEl into view in the live DOM!
    // html2canvas clones the DOM into a private sandbox, where we reposition it cleanly.
    const canvas = await html2canvas(exportEl, {
      scale: 2, // 1600 x 2262 Ultra HD Master Resolution
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 800,
      height: 1131,
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
      windowWidth: 800,
      windowHeight: 1131,
      onclone: (clonedDoc) => {
        const clone = clonedDoc.querySelector('[data-cert-export="true"]');
        if (clone) {
          clone.style.position = 'fixed';
          clone.style.left = '0px';
          clone.style.top = '0px';
          clone.style.zIndex = '99999';
        }
      },
    });

    return canvas;
  };

  const handleDownloadPdf = async () => {
    if (isDownloading) return;
    playSelectSound();
    setIsDownloading(true);
    setDownloadType('pdf');

    try {
      const canvas = await generateCanvas();
      if (!canvas) throw new Error('Canvas generation failed');

      const imgData = canvas.toDataURL('image/png', 1.0);
      // Standard A4 portrait: 210mm x 297mm
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Fit A4 page with zero margins and zero clipping
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
      const cleanFileName = `Certificate_of_Worthiness_${playerName.trim().replace(/\s+/g, '_')}.pdf`;
      pdf.save(cleanFileName);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadImage = async () => {
    if (isDownloading) return;
    playSelectSound();
    setIsDownloading(true);
    setDownloadType('png');

    try {
      const canvas = await generateCanvas();
      if (!canvas) throw new Error('Canvas generation failed');

      const imgData = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `Certificate_of_Worthiness_${playerName.trim().replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to generate Image:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-xl mx-auto">
      {/* 1. ON-SCREEN RESPONSIVE PREVIEW */}
      <div
        ref={certificateRef}
        className="relative bg-gradient-to-br from-[#caa049] via-[#fae588] to-[#996515] p-2.5 sm:p-4 rounded shadow-2xl overflow-hidden select-none"
        style={{
          width: '100%',
          aspectRatio: '1 / 1.414', // Portrait A4 Ratio
        }}
      >
        {/* Inner White Certificate Sheet */}
        <div className="relative w-full h-full bg-white text-slate-800 overflow-hidden flex flex-col justify-between shadow-inner">
          {/* Subtle Geometric Luxury Watermark */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M16 0l16 16-16 16L0 16zM16 4l12 12-12 12L4 16z' fill='%2392400e' fill-rule='evenodd'/%3E%3C/svg%3E")`,
              backgroundSize: '24px 24px',
            }}
          />

          {/* Inset Gold Border Line */}
          <div className="absolute inset-2 sm:inset-3 border-[1.5px] border-[#caa049]/70 pointer-events-none z-10" />

          {/* Top Vector SVG Header & Award Medallion */}
          <svg
            className="absolute top-0 left-0 w-full h-[34%] pointer-events-none z-10"
            viewBox="0 0 764 380"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="previewWineGrad" x1="0%" y1="0%" x2="100%" y2="80%">
                <stop offset="0%" stopColor="#46001a" />
                <stop offset="45%" stopColor="#64092f" />
                <stop offset="100%" stopColor="#3c0016" />
              </linearGradient>
              <linearGradient id="previewGoldRibbon" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#caa049" />
                <stop offset="25%" stopColor="#fae588" />
                <stop offset="50%" stopColor="#caa049" />
                <stop offset="75%" stopColor="#fae588" />
                <stop offset="100%" stopColor="#996515" />
              </linearGradient>
              <linearGradient id="previewGoldSeal" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fae588" />
                <stop offset="50%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#996515" />
              </linearGradient>
            </defs>

            {/* Deep Wine Diagonal Polygon */}
            <polygon points="0,0 764,0 764,75 0,250" fill="url(#previewWineGrad)" />
            <polygon points="0,225 764,68 764,75 0,250" fill="rgba(0,0,0,0.18)" />

            {/* Gold Metallic Ribbon Stripe */}
            <polygon points="0,250 764,75 764,95 0,270" fill="url(#previewGoldRibbon)" />
            <polygon points="0,270 764,95 764,103 0,278" fill="rgba(0,0,0,0.12)" />

            {/* Hanging Ribbon Tails */}
            <polygon points="565,115 595,115 585,215 565,190 545,215" fill="url(#previewGoldRibbon)" />
            <polygon points="615,115 645,115 665,215 645,190 625,215" fill="url(#previewGoldRibbon)" />

            {/* Scalloped Gold Medal Badge */}
            <polygon
              points="660.0,115.0 655.6,121.7 658.1,129.2 652.1,134.5 652.6,142.5 645.5,146.0 643.9,153.9 636.0,155.5 632.5,162.6 624.5,162.1 619.2,168.1 611.7,165.6 605.0,170.0 598.3,165.6 590.8,168.1 585.5,162.1 577.5,162.6 574.0,155.5 566.1,153.9 564.5,146.0 557.4,142.5 557.9,134.5 551.9,129.2 554.4,121.7 550.0,115.0 554.4,108.3 551.9,100.8 557.9,95.5 557.4,87.5 564.5,84.0 566.1,76.1 574.0,74.5 577.5,67.4 585.5,67.9 590.8,61.9 598.3,64.4 605.0,60.0 611.7,64.4 619.2,61.9 624.5,67.9 632.5,67.4 636.0,74.5 643.9,76.1 645.5,84.0 652.6,87.5 652.1,95.5 658.1,100.8 655.6,108.3"
              fill="url(#previewGoldSeal)"
            />
            <circle cx="605" cy="115" r="50" fill="none" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="605" cy="115" r="46" fill="url(#previewGoldRibbon)" />
            <circle cx="605" cy="115" r="40" fill="#500625" stroke="#fae588" strokeWidth="1.8" />
            <circle cx="605" cy="115" r="37" fill="none" stroke="#fae588" strokeWidth="0.75" strokeDasharray="2 2" />

            {/* Laurel Wreath Branches */}
            <path d="M 577,126 C 574,118 574,108 580,98" fill="none" stroke="#fae588" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 633,126 C 636,118 636,108 630,98" fill="none" stroke="#fae588" strokeWidth="1.5" strokeLinecap="round" />

            {/* Medal Text */}
            <text x="605" y="103" textAnchor="middle" fontFamily="'Cinzel', serif" fontSize="8.5" fontWeight="800" fill="#fae588" letterSpacing="2">
              WORTHY
            </text>
            <text x="605" y="118" textAnchor="middle" fontFamily="'Cinzel', serif" fontSize="12" fontWeight="900" fill="#ffffff" letterSpacing="1">
              AWARD
            </text>
            <text x="605" y="131" textAnchor="middle" fontSize="8" fill="#fae588">
              ★ ★ ★ ★ ★
            </text>
          </svg>

          {/* Certificate Main Content */}
          <div className="relative z-20 h-full flex flex-col justify-between pt-[20%] sm:pt-[22%] pb-3 sm:pb-5 px-3 sm:px-6 text-center">
            {/* Header Title */}
            <div className="mb-0.5 sm:mb-1">
              <h1 className="font-gothic text-2xl sm:text-4xl lg:text-5xl text-slate-900 leading-tight drop-shadow-sm">
                Certificate
              </h1>
              <p className="font-cinzel text-[8.5px] sm:text-[11px] font-bold text-slate-800 tracking-[0.28em] uppercase mt-1 sm:mt-1.5">
                OF WORTHINESS
              </p>
              <div className="w-12 sm:w-16 h-[1.5px] bg-[#caa049] mx-auto mt-1.5 sm:mt-2" />
            </div>

            {/* Subtitle */}
            <div className="my-2 sm:my-3 px-2">
              <p className="font-serif italic text-[7.5px] sm:text-[9.5px] text-slate-600 tracking-wider uppercase">
                THIS CERTIFICATE IS PROUDLY PRESENTED FOR HONORABLE ACHIEVEMENT TO
              </p>
            </div>

            {/* Recipient Name in Flowing Script Calligraphy with Generous Descender Clearance */}
            <div className="my-1 sm:my-2">
              <div className="font-script text-2xl sm:text-4xl lg:text-5xl text-slate-900 leading-[1.2] px-2 pb-1 sm:pb-2">
                {formattedName}
              </div>
              {/* Clean underline placed safely BELOW the name with ample margin so descenders never touch */}
              <div className="flex items-center justify-center gap-1.5 max-w-[130px] sm:max-w-[180px] mx-auto mt-3 sm:mt-4 mb-2 sm:mb-3">
                <div className="h-[1px] bg-gradient-to-r from-transparent via-[#caa049] to-[#caa049] flex-1" />
                <div className="w-1.5 h-1.5 rotate-45 bg-[#caa049]" />
                <div className="h-[1px] bg-gradient-to-l from-transparent via-[#caa049] to-[#caa049] flex-1" />
              </div>
            </div>

            {/* Citation Body Text with Generous Line Height and Clear Margin */}
            <div className="max-w-[92%] sm:max-w-md mx-auto my-1.5 sm:my-2.5 px-1">
              <p className="font-serif italic text-[8px] sm:text-[10.5px] text-slate-700 leading-relaxed sm:leading-[1.75]">
                In recognition of proving genuine loyalty, steadfast friendship, and scoring{' '}
                <strong className="text-slate-900 font-bold">{score}/{totalQuestions} ({percentage}%)</strong>{' '}
                on the test of worthiness as a true <strong className="text-slate-900 font-bold uppercase">{relation}</strong>{' '}
                on the occasion of Simanto's birthday celebration.
              </p>
            </div>

            {/* Bottom Footer: Date & Signature with Solid Separation */}
            <div className="pt-2 sm:pt-3 mt-1 sm:mt-2 border-t border-[#caa049]/40 flex items-end justify-between px-1 sm:px-3">
              {/* Date */}
              <div className="text-left w-24 sm:w-32">
                <div className="font-cinzel text-[7px] sm:text-[9px] font-bold text-slate-700 tracking-wider">
                  DATE
                </div>
                <div className="font-serif text-[8px] sm:text-[10px] text-slate-600 mt-0.5">
                  {currentDate}
                </div>
                <div className="w-16 sm:w-24 h-[1px] bg-[#caa049] mt-0.5" />
              </div>

              {/* Simanto's Single Signature Block */}
              <div className="text-right flex flex-col items-end w-28 sm:w-40">
                <div className="h-7 sm:h-10 flex items-end justify-end mb-0.5">
                  <img
                    src={SIGNATURE_BASE64}
                    alt="Simanto's Signature"
                    className="h-7 sm:h-9 w-auto object-contain filter drop-shadow-sm"
                  />
                </div>
                <div className="w-20 sm:w-32 h-[1px] bg-[#caa049]" />
                <div className="font-cinzel text-[7.5px] sm:text-[9.5px] font-bold text-slate-900 tracking-wider mt-0.5">
                  SIMANTO BISWAS JEET
                </div>
                <div className="font-serif italic text-[6.5px] sm:text-[8px] text-slate-500">
                  AUTHORIZING SIGNATURE
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DEDICATED MASTER EXPORT ELEMENT (Portaled to body for zero interference with modals or layout) */}
      {mounted && typeof document !== 'undefined' && createPortal(
        <div
          ref={exportRef}
          data-cert-export="true"
          style={{
            position: 'fixed',
            left: '-99999px',
            top: 0,
            width: '800px',
            height: '1131px',
            zIndex: -9999,
            pointerEvents: 'none',
            userSelect: 'none',
            overflow: 'hidden',
            backgroundColor: '#ffffff',
            boxSizing: 'border-box',
            padding: '18px',
            background: 'linear-gradient(135deg, #caa049 0%, #fae588 50%, #996515 100%)',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              backgroundColor: '#ffffff',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
        >
          {/* Subtle Watermark Pattern */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M16 0l16 16-16 16L0 16zM16 4l12 12-12 12L4 16z' fill='%2392400e' fill-rule='evenodd'/%3E%3C/svg%3E")`,
              backgroundSize: '24px 24px',
              opacity: 0.04,
              pointerEvents: 'none',
            }}
          />

          {/* Inset Gold Line */}
          <div
            style={{
              position: 'absolute',
              inset: '12px',
              border: '1.5px solid rgba(202, 160, 73, 0.7)',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          />

          {/* Vector SVG Top Header & Award Medallion */}
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '764px',
              height: '380px',
              pointerEvents: 'none',
              zIndex: 5,
            }}
            viewBox="0 0 764 380"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="exportWineGrad" x1="0%" y1="0%" x2="100%" y2="80%">
                <stop offset="0%" stopColor="#46001a" />
                <stop offset="45%" stopColor="#64092f" />
                <stop offset="100%" stopColor="#3c0016" />
              </linearGradient>
              <linearGradient id="exportGoldRibbon" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#caa049" />
                <stop offset="25%" stopColor="#fae588" />
                <stop offset="50%" stopColor="#caa049" />
                <stop offset="75%" stopColor="#fae588" />
                <stop offset="100%" stopColor="#996515" />
              </linearGradient>
              <linearGradient id="exportGoldSeal" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fae588" />
                <stop offset="50%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#996515" />
              </linearGradient>
              <filter id="exportShadow" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.35" />
              </filter>
            </defs>

            {/* Deep Wine Diagonal Wedge */}
            <polygon points="0,0 764,0 764,75 0,250" fill="url(#exportWineGrad)" />
            <polygon points="0,220 764,65 764,75 0,250" fill="rgba(0,0,0,0.18)" />

            {/* Gold Ribbon Stripe */}
            <polygon points="0,250 764,75 764,95 0,270" fill="url(#exportGoldRibbon)" filter="url(#exportShadow)" />
            <polygon points="0,270 764,95 764,103 0,278" fill="rgba(0,0,0,0.08)" />

            {/* Medal Ribbon Tails */}
            <g filter="url(#exportShadow)">
              <polygon points="565,115 595,115 585,215 565,190 545,215" fill="url(#exportGoldRibbon)" />
              <polygon points="615,115 645,115 665,215 645,190 625,215" fill="url(#exportGoldRibbon)" />
            </g>

            {/* Scalloped Gold Medal Badge */}
            <g filter="url(#exportShadow)">
              <polygon
                points="660.0,115.0 655.6,121.7 658.1,129.2 652.1,134.5 652.6,142.5 645.5,146.0 643.9,153.9 636.0,155.5 632.5,162.6 624.5,162.1 619.2,168.1 611.7,165.6 605.0,170.0 598.3,165.6 590.8,168.1 585.5,162.1 577.5,162.6 574.0,155.5 566.1,153.9 564.5,146.0 557.4,142.5 557.9,134.5 551.9,129.2 554.4,121.7 550.0,115.0 554.4,108.3 551.9,100.8 557.9,95.5 557.4,87.5 564.5,84.0 566.1,76.1 574.0,74.5 577.5,67.4 585.5,67.9 590.8,61.9 598.3,64.4 605.0,60.0 611.7,64.4 619.2,61.9 624.5,67.9 632.5,67.4 636.0,74.5 643.9,76.1 645.5,84.0 652.6,87.5 652.1,95.5 658.1,100.8 655.6,108.3"
                fill="url(#exportGoldSeal)"
              />
              <circle cx="605" cy="115" r="50" fill="none" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="605" cy="115" r="46" fill="url(#exportGoldRibbon)" />
              <circle cx="605" cy="115" r="40" fill="#500625" stroke="#fae588" strokeWidth="1.8" />
              <circle cx="605" cy="115" r="37" fill="none" stroke="#fae588" strokeWidth="0.75" strokeDasharray="2 2" />

              {/* Laurel Wreath */}
              <path d="M 577,126 C 574,118 574,108 580,98" fill="none" stroke="#fae588" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 633,126 C 636,118 636,108 630,98" fill="none" stroke="#fae588" strokeWidth="1.5" strokeLinecap="round" />

              <text x="605" y="103" textAnchor="middle" fontFamily="'Cinzel', serif" fontSize="8.5" fontWeight="800" fill="#fae588" letterSpacing="2">
                WORTHY
              </text>
              <text x="605" y="118" textAnchor="middle" fontFamily="'Cinzel', serif" fontSize="12" fontWeight="900" fill="#ffffff" letterSpacing="1">
                AWARD
              </text>
              <text x="605" y="131" textAnchor="middle" fontSize="8" fill="#fae588">
                ★ ★ ★ ★ ★
              </text>
            </g>
          </svg>

          {/* Master Content */}
          <div
            style={{
              position: 'relative',
              zIndex: 20,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '235px 50px 35px 50px',
              boxSizing: 'border-box',
              textAlign: 'center',
            }}
          >
            {/* Title */}
            <div>
              <h1
                style={{
                  fontFamily: '"UnifrakturMaguntia", cursive',
                  fontSize: '52px',
                  margin: 0,
                  color: '#111827',
                  lineHeight: 1.1,
                  fontWeight: 'normal',
                }}
              >
                Certificate
              </h1>
              <p
                style={{
                  fontFamily: '"Cinzel", serif',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#1f2937',
                  letterSpacing: '0.3em',
                  margin: '10px 0 0 0',
                  textTransform: 'uppercase',
                }}
              >
                OF WORTHINESS
              </p>
              <div style={{ width: '70px', height: '1.5px', background: '#caa049', margin: '10px auto 0 auto' }} />
            </div>

            {/* Subtitle */}
            <div style={{ margin: '18px 0 10px 0' }}>
              <p
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontStyle: 'italic',
                  fontSize: '11px',
                  color: '#4b5563',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  margin: 0,
                }}
              >
                THIS CERTIFICATE IS PROUDLY PRESENTED FOR HONORABLE ACHIEVEMENT TO
              </p>
            </div>

            {/* Recipient Name in Cursive Calligraphy with Generous Descender Clearance */}
            <div style={{ margin: '6px 0 0 0' }}>
              <div
                style={{
                  fontFamily: '"Great Vibes", cursive',
                  fontSize: '50px',
                  color: '#0f172a',
                  lineHeight: 1.2,
                  paddingBottom: '8px',
                }}
              >
                {formattedName}
              </div>
              {/* Clean Underline with Diamond, placed safely BELOW text so cursive descenders never collide */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '260px',
                  margin: '18px auto 22px auto',
                  gap: '8px',
                }}
              >
                <div style={{ height: '1.5px', background: 'linear-gradient(to right, transparent, #caa049)', flex: 1 }} />
                <div style={{ width: '6px', height: '6px', background: '#caa049', transform: 'rotate(45deg)' }} />
                <div style={{ height: '1.5px', background: 'linear-gradient(to left, transparent, #caa049)', flex: 1 }} />
              </div>
            </div>

            {/* Citation Text */}
            <div style={{ maxWidth: '520px', margin: '10px auto', padding: '0 10px' }}>
              <p
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontStyle: 'italic',
                  fontSize: '13.5px',
                  color: '#374151',
                  lineHeight: '1.85',
                  margin: 0,
                }}
              >
                In recognition of proving genuine loyalty, steadfast friendship, and scoring{' '}
                <strong style={{ color: '#0f172a', fontWeight: 700 }}>
                  {score}/{totalQuestions} ({percentage}%)
                </strong>{' '}
                on the test of worthiness as a true{' '}
                <strong style={{ color: '#0f172a', fontWeight: 700, textTransform: 'uppercase' }}>
                  {relation}
                </strong>{' '}
                on the occasion of Simanto's birthday celebration.
              </p>
            </div>

            {/* Footer: Date & Signature */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                padding: '20px 20px 0 20px',
                borderTop: '1px solid rgba(202, 160, 73, 0.4)',
                marginTop: '12px',
              }}
            >
              {/* Date Block */}
              <div style={{ textAlign: 'left', width: '180px' }}>
                <div
                  style={{
                    fontFamily: '"Cinzel", serif',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#334155',
                    letterSpacing: '0.1em',
                  }}
                >
                  DATE
                </div>
                <div
                  style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: '13px',
                    color: '#475569',
                    marginTop: '6px',
                  }}
                >
                  {currentDate}
                </div>
                <div style={{ width: '140px', height: '1.5px', background: '#caa049', marginTop: '6px' }} />
              </div>

              {/* Signature Block */}
              <div
                style={{
                  textAlign: 'right',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  width: '220px',
                }}
              >
                <div style={{ height: '50px', display: 'flex', alignItems: 'flex-end', marginBottom: '2px' }}>
                  <img
                    src={SIGNATURE_BASE64}
                    alt="Simanto's Signature"
                    style={{ height: '48px', objectFit: 'contain' }}
                  />
                </div>
                <div style={{ width: '200px', height: '1.5px', background: '#caa049' }} />
                <div
                  style={{
                    fontFamily: '"Cinzel", serif',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#0f172a',
                    letterSpacing: '0.1em',
                    marginTop: '6px',
                  }}
                >
                  SIMANTO BISWAS JEET
                </div>
                <div
                  style={{
                    fontFamily: '"Playfair Display", serif',
                    fontStyle: 'italic',
                    fontSize: '10px',
                    color: '#64748b',
                    marginTop: '2px',
                  }}
                >
                  AUTHORIZING SIGNATURE
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    )}

      {/* 3. DOWNLOAD ACTIONS */}
      <div className="space-y-2.5 pt-2">
        {/* Main Certificate Download Button (PDF) */}
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          className="retro-btn retro-btn-yellow w-full py-4 text-xs sm:text-sm font-pixel flex items-center justify-center gap-2 shadow-lg"
        >
          {downloadSuccess && downloadType === 'pdf' ? (
            <>
              <Check size={16} /> CERTIFICATE DOWNLOADED!
            </>
          ) : (
            <>
              <Download size={16} /> {isDownloading && downloadType === 'pdf' ? 'DOWNLOADING CERTIFICATE...' : 'DOWNLOAD CERTIFICATE'}
            </>
          )}
        </button>

        {/* Secondary Download Button (High-Res PNG image) for social sharing */}
        <button
          type="button"
          onClick={handleDownloadImage}
          disabled={isDownloading}
          className="w-full py-2.5 px-4 bg-slate-900 border-2 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-[11px] font-pixel flex items-center justify-center gap-2 transition-all active:translate-y-0.5"
          title="Download High-Resolution Image for WhatsApp / Instagram"
        >
          {downloadSuccess && downloadType === 'png' ? (
            <>
              <Check size={14} className="text-emerald-400" /> IMAGE SAVED!
            </>
          ) : (
            <>
              <ImageIcon size={14} className="text-retro-yellow" />
              <span>{isDownloading && downloadType === 'png' ? 'SAVING IMAGE...' : 'SAVE AS IMAGE (PNG)'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

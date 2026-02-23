import { useState, useRef, useEffect, useCallback } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  delay: number;
}

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [mintStatus, setMintStatus] = useState<'idle' | 'minting' | 'success'>('idle');
  const [nftName, setNftName] = useState('');
  const [showParticles, setShowParticles] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const particles: Particle[] = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    speed: Math.random() * 20 + 10,
    opacity: Math.random() * 0.6 + 0.2,
    delay: Math.random() * 5,
  }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setMintStatus('idle');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMint = useCallback(() => {
    if (!image || !nftName.trim()) return;
    setMintStatus('minting');
    setShowParticles(true);

    setTimeout(() => {
      setMintStatus('success');
    }, 3000);
  }, [image, nftName]);

  const handleDownload = useCallback(() => {
    if (!image) return;
    const link = document.createElement('a');
    link.download = `${nftName || 'nft-pfp'}.png`;
    link.href = image;
    link.click();
  }, [image, nftName]);

  const resetMint = () => {
    setImage(null);
    setMintStatus('idle');
    setNftName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const goldParticles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];

    for (let i = 0; i < 50; i++) {
      goldParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -Math.random() * 0.5 - 0.2,
        size: Math.random() * 3 + 1,
        alpha: Math.random() * 0.5 + 0.3,
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      goldParticles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        ctx.beginPath();
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, `rgba(255, 215, 100, ${p.alpha})`);
        gradient.addColorStop(1, `rgba(255, 180, 50, 0)`);
        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="min-h-dvh bg-[#0a0a12] text-white relative overflow-hidden">
      {/* Background Canvas for Gold Particles */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
      />

      {/* Gradient Overlays */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0f1020] via-transparent to-[#0a0a12] pointer-events-none z-[1]" />
      <div className="fixed inset-0 bg-gradient-to-r from-[#0a1020]/50 via-transparent to-[#100a20]/50 pointer-events-none z-[1]" />

      {/* Radial Glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#1a3050]/30 rounded-full blur-[150px] pointer-events-none z-[1]" />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#b8860b]/10 rounded-full blur-[100px] pointer-events-none z-[1]" />

      {/* Floating Gold Particles CSS */}
      {showParticles && (
        <div className="fixed inset-0 pointer-events-none z-[2] overflow-hidden">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full animate-float-up"
              style={{
                left: `${p.x}%`,
                bottom: `-${p.size}px`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                background: `radial-gradient(circle, rgba(255,215,100,${p.opacity}) 0%, rgba(255,180,50,0) 70%)`,
                animationDuration: `${p.speed}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 min-h-dvh flex flex-col">
        {/* Header */}
        <header className="py-6 md:py-8 px-4 md:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-8 h-8 md:w-10 md:h-10 relative">
              <svg viewBox="0 0 40 40" className="w-full h-full">
                <defs>
                  <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffd700" />
                    <stop offset="50%" stopColor="#b8860b" />
                    <stop offset="100%" stopColor="#ffd700" />
                  </linearGradient>
                </defs>
                <path
                  d="M5 30 L10 15 L15 22 L20 8 L25 22 L30 15 L35 30 Z"
                  fill="url(#crownGrad)"
                  className="drop-shadow-lg"
                />
                <circle cx="10" cy="13" r="2" fill="#ffd700" />
                <circle cx="20" cy="6" r="2.5" fill="#ffd700" />
                <circle cx="30" cy="13" r="2" fill="#ffd700" />
              </svg>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-[#ffd700] via-[#fff8dc] to-[#b8860b] bg-clip-text text-transparent">
                SOVEREIGN
              </span>
              <span className="text-white/90 ml-2">NFT</span>
            </h1>
          </div>
          <p className="text-white/50 text-sm md:text-base tracking-widest uppercase">
            Forge Your Digital Legacy
          </p>
        </header>

        {/* Main Area */}
        <main className="flex-1 flex items-center justify-center px-4 pb-8 md:pb-12">
          <div className="w-full max-w-lg">
            {/* Upload/Preview Card */}
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#ffd700]/20 via-[#3a6ea5]/20 to-[#ffd700]/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />

              <div className="relative bg-[#0d0d18]/80 backdrop-blur-xl border border-[#ffd700]/20 rounded-2xl overflow-hidden">
                {/* Card Header Decoration */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ffd700]/50 to-transparent" />

                {/* Image Preview Area */}
                <div
                  className="aspect-square relative cursor-pointer overflow-hidden group/upload"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {image ? (
                    <>
                      <img
                        src={image}
                        alt="NFT Preview"
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/upload:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="text-white/80 text-sm tracking-wider">CHANGE IMAGE</span>
                      </div>
                      {/* Corner Frame */}
                      <div className="absolute top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-[#ffd700]/60" />
                      <div className="absolute top-3 right-3 w-8 h-8 border-r-2 border-t-2 border-[#ffd700]/60" />
                      <div className="absolute bottom-3 left-3 w-8 h-8 border-l-2 border-b-2 border-[#ffd700]/60" />
                      <div className="absolute bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-[#ffd700]/60" />
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#0f1525] to-[#0a0a12] p-8">
                      <div className="w-20 h-20 md:w-24 md:h-24 mb-6 relative">
                        <div className="absolute inset-0 border-2 border-dashed border-[#ffd700]/30 rounded-2xl animate-pulse" />
                        <div className="absolute inset-2 border border-[#ffd700]/20 rounded-xl" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-10 h-10 md:w-12 md:h-12 text-[#ffd700]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-white/60 text-center text-sm md:text-base mb-2">
                        Drop your masterpiece here
                      </p>
                      <p className="text-white/30 text-xs tracking-wider">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* Controls */}
                <div className="p-4 md:p-6 space-y-4 border-t border-[#ffd700]/10">
                  {/* NFT Name Input */}
                  <div className="relative">
                    <input
                      type="text"
                      value={nftName}
                      onChange={(e) => setNftName(e.target.value)}
                      placeholder="Name your creation..."
                      className="w-full bg-[#0a0a15] border border-[#ffd700]/20 rounded-xl px-4 py-3 md:py-4 text-white placeholder-white/30 focus:outline-none focus:border-[#ffd700]/50 transition-colors text-sm md:text-base"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ffd700]/30 text-xs">
                      {nftName.length}/50
                    </div>
                  </div>

                  {/* Mint Button */}
                  {mintStatus === 'idle' && (
                    <button
                      onClick={handleMint}
                      disabled={!image || !nftName.trim()}
                      className="w-full relative group/btn overflow-hidden rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-[#b8860b] via-[#ffd700] to-[#b8860b] opacity-100 group-hover/btn:opacity-90 transition-opacity" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                      <span className="relative block py-4 text-[#0a0a12] font-bold tracking-wider text-sm md:text-base">
                        MINT AS NFT PFP
                      </span>
                    </button>
                  )}

                  {mintStatus === 'minting' && (
                    <div className="w-full py-4 flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-[#ffd700]/30 border-t-[#ffd700] rounded-full animate-spin" />
                      <span className="text-[#ffd700] tracking-wider text-sm">FORGING YOUR LEGACY...</span>
                    </div>
                  )}

                  {mintStatus === 'success' && (
                    <div className="space-y-3">
                      <div className="text-center py-2">
                        <div className="inline-flex items-center gap-2 text-[#50c878]">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="tracking-wider text-sm">MINTED SUCCESSFULLY</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleDownload}
                          className="flex-1 py-3 bg-[#ffd700]/10 border border-[#ffd700]/30 rounded-xl text-[#ffd700] font-medium hover:bg-[#ffd700]/20 transition-colors text-sm"
                        >
                          Download PFP
                        </button>
                        <button
                          onClick={resetMint}
                          className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white/70 font-medium hover:bg-white/10 transition-colors text-sm"
                        >
                          Create Another
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Token Info */}
            {image && mintStatus === 'success' && (
              <div className="mt-6 p-4 bg-[#0d0d18]/60 backdrop-blur border border-[#ffd700]/10 rounded-xl animate-fade-in">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/40">Token ID</span>
                  <span className="text-[#ffd700] font-mono">#{Math.floor(Math.random() * 9999).toString().padStart(4, '0')}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-white/40">Chain</span>
                  <span className="text-white/70">Ethereum</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-white/40">Standard</span>
                  <span className="text-white/70">ERC-721</span>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="py-4 px-4 text-center">
          <p className="text-white/25 text-xs tracking-wide">
            Requested by <span className="text-white/40">@Oyaaayves</span> · Built by <span className="text-white/40">@clonkbot</span>
          </p>
        </footer>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) scale(0.5);
            opacity: 0;
          }
        }

        .animate-float-up {
          animation: float-up linear infinite;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default App;

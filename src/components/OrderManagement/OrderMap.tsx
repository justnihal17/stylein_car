import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Navigation, 
  Layers, 
  Eye, 
  Search, 
  Plus, 
  Minus, 
  Compass, 
  Tv, 
  Info,
  Car,
  Play,
  Pause,
  RotateCcw,
  Maximize2
} from 'lucide-react';

interface OrderMapProps {
  order: {
    id: string;
    customer: {
      name: string;
    };
    driver?: {
      name: string;
      vehicle: string;
    };
    location: {
      address: string;
    };
    status: string;
    eta: string;
  };
}

export function OrderMap({ order }: OrderMapProps) {
  const [mapStyle, setMapStyle] = useState<'vector' | 'satellite' | 'terrain'>('vector');
  const [showTraffic, setShowTraffic] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [isSimulating, setIsSimulating] = useState(true);
  const [progress, setProgress] = useState(0.4); // 0 to 1 representing position along the route
  const [showLegend, setShowLegend] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFeedback, setSearchFeedback] = useState('');

  // Ref to handle simulation animation
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (isSimulating) {
      let lastTime = performance.now();
      const animate = (time: number) => {
        const delta = (time - lastTime) / 1000;
        lastTime = time;
        setProgress((prev) => {
          let next = prev + delta * 0.03; // Slowly advance
          if (next > 0.95) {
            next = 0.1; // Loop back or stop
          }
          return next;
        });
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSimulating]);

  // Coordinates on SVG canvas (0 to 800 width, 0 to 450 height)
  // Route is a spline / multi-segment path
  const routePoints = [
    { x: 120, y: 350 }, // Starting point / Depot
    { x: 220, y: 310 }, // Turn onto Highway
    { x: 380, y: 220 }, // Main highway stretch
    { x: 450, y: 170 }, // Flyover bridge
    { x: 550, y: 140 }, // Marina Entrance Road
    { x: 620, y: 190 }, // Canal Bridge
    { x: 680, y: 220 }, // Yacht Club Street
    { x: 720, y: 180 }  // Customer Location (Marina Gate 1)
  ];

  // Calculate coordinates at current progress along the route
  const getPositionOnRoute = (p: number) => {
    if (p <= 0) return routePoints[0];
    if (p >= 1) return routePoints[routePoints.length - 1];

    const segmentCount = routePoints.length - 1;
    const segmentIndex = Math.min(Math.floor(p * segmentCount), segmentCount - 1);
    const segmentProgress = (p * segmentCount) - segmentIndex;

    const start = routePoints[segmentIndex];
    const end = routePoints[segmentIndex + 1];

    return {
      x: start.x + (end.x - start.x) * segmentProgress,
      y: start.y + (end.y - start.y) * segmentProgress
    };
  };

  const agentPos = getPositionOnRoute(progress);
  const destPos = routePoints[routePoints.length - 1];
  const originPos = routePoints[0];

  // Theme colors based on map style
  const theme = {
    vector: {
      bg: 'bg-[#f4f3f0]',
      sea: '#aad3df',
      canal: '#b2d9e7',
      park: '#d2f1d2',
      highway: '#ffd17c',
      highwayBorder: '#f0be65',
      mainRoad: '#ffffff',
      mainRoadBorder: '#e0ded9',
      building: '#e3dfd8',
      buildingBorder: '#d5cfc5',
      text: 'text-slate-800',
      labelColor: '#475569',
      border: 'border-slate-200'
    },
    satellite: {
      bg: 'bg-[#0f1715]',
      sea: '#0b1d28',
      canal: '#0f2430',
      park: '#122d14',
      highway: '#52432a',
      highwayBorder: '#635338',
      mainRoad: '#2c3539',
      mainRoadBorder: '#3e484c',
      building: '#1c2421',
      buildingBorder: '#2b3632',
      text: 'text-slate-100',
      labelColor: '#94a3b8',
      border: 'border-emerald-950/30'
    },
    terrain: {
      bg: 'bg-[#e3ded2]',
      sea: '#a1cbd4',
      canal: '#abced6',
      park: '#c0dbb7',
      highway: '#eed3a2',
      highwayBorder: '#deb87b',
      mainRoad: '#ffffff',
      mainRoadBorder: '#d2ccbd',
      building: '#d4ccbf',
      buildingBorder: '#c2baa8',
      text: 'text-slate-800',
      labelColor: '#57534e',
      border: 'border-stone-300'
    }
  }[mapStyle];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchFeedback('Searching coordinates...');
    setTimeout(() => {
      setSearchFeedback(`Located: "${searchQuery}" in Dubai Marina Zone`);
      setTimeout(() => setSearchFeedback(''), 4000);
    }, 8000);
  };

  return (
    <div id="real-live-map-wrapper" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative h-[440px]">
      
      {/* Top Map Bar Controls */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pointer-events-none">
        
        {/* Real-time Address and Search bar */}
        <form onSubmit={handleSearch} className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg p-1.5 shadow-lg w-full max-w-sm pointer-events-auto">
          <div className="pl-2 text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input 
            type="text" 
            placeholder="Search address or enter GPS coordinates..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 text-xs bg-transparent outline-none border-none text-slate-800 placeholder-slate-400 font-medium py-1"
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-2.5 py-1 rounded-md transition-all shadow-sm">
            Search
          </button>
        </form>

        {/* Live Simulation Widget */}
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg p-1.5 shadow-lg pointer-events-auto text-xs self-end sm:self-auto">
          <span className="font-bold text-slate-700 flex items-center gap-1.5 px-1">
            <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
            Live Route Simulation
          </span>
          <div className="flex items-center border-l border-slate-200 pl-1.5 gap-1">
            <button 
              onClick={() => setIsSimulating(!isSimulating)}
              title={isSimulating ? 'Pause movement' : 'Play movement'}
              className="p-1 rounded hover:bg-slate-100 text-slate-600 transition-colors"
            >
              {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button 
              onClick={() => setProgress(0.1)}
              title="Reset location"
              className="p-1 rounded hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating status and search feedback */}
      {searchFeedback && (
        <div className="absolute top-16 left-3 z-20 bg-slate-900/90 text-white text-[10px] px-2.5 py-1.5 rounded-lg border border-slate-700 shadow-md animate-fade-in">
          {searchFeedback}
        </div>
      )}

      {/* Right Map Layer Controls */}
      <div className="absolute top-16 right-3 z-20 flex flex-col gap-2 pointer-events-auto">
        {/* Style Selector */}
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg p-1 shadow-lg flex flex-col gap-1">
          <button 
            onClick={() => setMapStyle('vector')}
            title="Standard Map View"
            className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all ${mapStyle === 'vector' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            MAP
          </button>
          <button 
            onClick={() => setMapStyle('satellite')}
            title="Satellite View"
            className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all ${mapStyle === 'satellite' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            SATELLITE
          </button>
          <button 
            onClick={() => setMapStyle('terrain')}
            title="Terrain View"
            className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all ${mapStyle === 'terrain' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            TERRAIN
          </button>
        </div>

        {/* Traffic Layer Button */}
        <button 
          onClick={() => setShowTraffic(!showTraffic)}
          title="Toggle Traffic View"
          className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all shadow-md ${showTraffic ? 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Main SVG Map Canvas */}
      <div className={`flex-1 relative ${theme.bg} overflow-hidden select-none transition-colors duration-300`}>
        <svg 
          viewBox={`${200 - 200 * zoom} ${100 - 100 * zoom} ${800 * zoom} ${450 * zoom}`}
          className="w-full h-full transition-transform duration-300 ease-out"
          style={{ transformOrigin: 'center center' }}
        >
          {/* DEFINITIONS FOR GRADIENTS AND FILTERS */}
          <defs>
            {/* Water gradient */}
            <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme.sea} stopOpacity="1" />
              <stop offset="100%" stopColor={mapStyle === 'satellite' ? '#040d12' : '#9fc3db'} stopOpacity="1" />
            </linearGradient>

            {/* Park gradient */}
            <linearGradient id="parkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={theme.park} />
              <stop offset="100%" stopColor={mapStyle === 'satellite' ? '#0b200d' : '#bfe8bf'} />
            </linearGradient>

            {/* Building Shadow Filter */}
            <filter id="dropShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="1.5" dy="2.5" stdDeviation="1" floodColor="#000000" floodOpacity={mapStyle === 'satellite' ? '0.5' : '0.12'} />
            </filter>

            {/* Route glow */}
            <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* SATELLITE BACKGROUND NOISE / GRIDS FOR HIGH REALISM */}
          {mapStyle === 'satellite' && (
            <g opacity="0.15">
              <rect x="0" y="0" width="800" height="450" fill="url(#satPattern)" />
              {/* Fake ocean textures */}
              <circle cx="200" cy="80" r="150" fill="#112933" opacity="0.3" filter="blur(20px)" />
              <circle cx="50" cy="180" r="200" fill="#0c1d25" opacity="0.4" filter="blur(30px)" />
            </g>
          )}

          {/* 1. LARGE SEA / HARBOR WATER (Dubai Marina Gulf Area) */}
          <path 
            d="M -50,-50 L 280,-50 L 190,120 L 70,200 L -50,150 Z" 
            fill="url(#waterGrad)" 
            stroke={mapStyle === 'satellite' ? '#0c222d' : '#8faec5'} 
            strokeWidth="1" 
          />
          
          {/* Dubai Marina Entry Channel (Water body) */}
          <path 
            d="M 190,120 L 230,170 Q 280,240 380,250 T 630,230 T 850,330 L 850,380 L 610,310 T 360,310 T 210,230 L 70,200 Z" 
            fill="url(#waterGrad)" 
            stroke={mapStyle === 'satellite' ? '#0c222d' : '#8faec5'} 
            strokeWidth="0.8" 
          />

          {/* 2. RECREATIONAL GREEN PARKS (Dubai Marina Walkways & JLT Parks) */}
          {/* JBR Beachfront park */}
          <path d="M 60,110 L 160,50 L 140,15 L 70,30 Z" fill="url(#parkGrad)" />
          {/* Marina Promenade Island Park */}
          <path d="M 410,260 Q 430,290 490,280 Q 450,320 400,300 Z" fill="url(#parkGrad)" />
          {/* JLT Park 1 */}
          <path d="M 520,380 L 590,390 L 560,430 L 500,420 Z" fill="url(#parkGrad)" />
          <path d="M 280,390 L 330,370 L 320,420 L 270,410 Z" fill="url(#parkGrad)" />

          {/* 3. CITY DISTRICT BLOCKS & BUILDINGS (Drawn beautifully with isometric 3D offsets!) */}
          <g filter="url(#dropShadow)">
            {/* Jumeirah Beach Residences (JBR Sector) */}
            <rect x="50" y="24" width="22" height="34" rx="2" fill={theme.building} stroke={theme.buildingBorder} strokeWidth="0.5" />
            <rect x="85" y="15" width="26" height="42" rx="2" fill={theme.building} stroke={theme.buildingBorder} strokeWidth="0.5" />
            <rect x="125" y="10" width="20" height="30" rx="2" fill={theme.building} stroke={theme.buildingBorder} strokeWidth="0.5" />
            <circle cx="170" cy="18" r="12" fill={theme.building} stroke={theme.buildingBorder} strokeWidth="0.5" />

            {/* Marina Gate Skyscrapers */}
            <rect x="740" y="110" width="28" height="28" rx="3" fill={theme.building} stroke={theme.buildingBorder} strokeWidth="0.5" />
            <rect x="710" y="130" width="24" height="24" rx="3" fill={theme.building} stroke={theme.buildingBorder} strokeWidth="0.5" />
            <rect x="760" y="80" width="30" height="30" rx="3" fill={theme.building} stroke={theme.buildingBorder} strokeWidth="0.5" />

            {/* Princess Tower and Cayan Tower Sector (Left of Marina entrance) */}
            <path d="M 270,70 L 295,80 L 285,110 L 260,100 Z" fill={theme.building} stroke={theme.buildingBorder} strokeWidth="0.5" />
            <circle cx="230" cy="95" r="14" fill={theme.building} stroke={theme.buildingBorder} strokeWidth="0.5" />
            <rect x="305" y="115" width="22" height="22" rx="3" fill={theme.building} stroke={theme.buildingBorder} strokeWidth="0.5" />

            {/* Dubai Marina Mall block (Mid marina right side) */}
            <path d="M 540,255 L 610,255 L 590,290 L 530,285 Z" fill={theme.building} stroke={theme.buildingBorder} strokeWidth="0.5" />

            {/* Jumeirah Lake Towers (JLT Block - South of Marina) */}
            <rect x="350" y="380" width="22" height="32" rx="2" fill={theme.building} stroke={theme.buildingBorder} strokeWidth="0.5" />
            <rect x="390" y="395" width="28" height="22" rx="2" fill={theme.building} stroke={theme.buildingBorder} strokeWidth="0.5" />
            <circle cx="450" cy="410" r="15" fill={theme.building} stroke={theme.buildingBorder} strokeWidth="0.5" />
            <rect x="630" y="375" width="26" height="36" rx="2" fill={theme.building} stroke={theme.buildingBorder} strokeWidth="0.5" />
          </g>

          {/* 4. REALISTIC STREET NETWORK & HIGHWAYS */}
          {/* A. Sheikh Zayed Road (E11 Highway) - Broad orange/yellow artery at the bottom */}
          <path 
            d="M -50,420 L 850,290" 
            fill="none" 
            stroke={theme.highwayBorder} 
            strokeWidth="12" 
            strokeLinecap="round" 
          />
          <path 
            d="M -50,420 L 850,290" 
            fill="none" 
            stroke={theme.highway} 
            strokeWidth="10" 
            strokeLinecap="round" 
          />
          {/* Highway dashed lines */}
          <path 
            d="M -50,420 L 850,290" 
            fill="none" 
            stroke={mapStyle === 'satellite' ? '#94a3b8' : '#ffffff'} 
            strokeWidth="1" 
            strokeDasharray="4 8" 
            opacity="0.6" 
          />

          {/* B. Al Marsa Street (Parallel to Highway, Marina Side) */}
          <path d="M -50,380 Q 400,320 850,240" fill="none" stroke={theme.mainRoadBorder} strokeWidth="6" strokeLinecap="round" />
          <path d="M -50,380 Q 400,320 850,240" fill="none" stroke={theme.mainRoad} strokeWidth="4.8" strokeLinecap="round" />

          {/* C. Marina Loop / Walkway road system */}
          {/* Bridge 1 (West Bridge over Canal) */}
          <path d="M 230,120 L 290,240" fill="none" stroke={theme.mainRoadBorder} strokeWidth="5.5" strokeLinecap="round" />
          <path d="M 230,120 L 290,240" fill="none" stroke={theme.mainRoad} strokeWidth="4" strokeLinecap="round" />

          {/* Bridge 2 (Main central interchange over Canal near Yacht Club) */}
          <path d="M 490,180 Q 560,200 630,230" fill="none" stroke={theme.mainRoadBorder} strokeWidth="6" strokeLinecap="round" />
          <path d="M 490,180 Q 560,200 630,230" fill="none" stroke={theme.mainRoad} strokeWidth="4.5" strokeLinecap="round" />

          {/* JBR Beach Road (Coastline) */}
          <path d="M -20,90 Q 150,20 280,120" fill="none" stroke={theme.mainRoadBorder} strokeWidth="4.5" strokeLinecap="round" />
          <path d="M -20,90 Q 150,20 280,120" fill="none" stroke={theme.mainRoad} strokeWidth="3" strokeLinecap="round" />

          {/* JLT District Streets (Bottom half) */}
          <path d="M 200,450 L 350,350 Q 550,330 850,410" fill="none" stroke={theme.mainRoadBorder} strokeWidth="4" />
          <path d="M 200,450 L 350,350 Q 550,330 850,410" fill="none" stroke={theme.mainRoad} strokeWidth="2.8" />

          {/* Local Streets feeding target */}
          <path d="M 630,230 L 740,150 L 850,170" fill="none" stroke={theme.mainRoadBorder} strokeWidth="4.5" />
          <path d="M 630,230 L 740,150 L 850,170" fill="none" stroke={theme.mainRoad} strokeWidth="3" />

          {/* 5. TRAFFIC DENSITY LAYER (Semi-transparent thick overlay showing live traffic levels) */}
          {showTraffic && (
            <g opacity="0.65">
              {/* E11 Highway - Red traffic near exit */}
              <path d="M 300,373 L 490,344" fill="none" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />
              {/* E11 Highway - Orange congestion */}
              <path d="M 120,401 L 300,373" fill="none" stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" />
              {/* E11 Highway - Green clear traffic */}
              <path d="M 490,344 L 800,297" fill="none" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" />
              
              {/* Canal Bridge traffic - Red */}
              <path d="M 525,190 Q 560,200 610,221" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
              {/* Beach Road - Green */}
              <path d="M 20,70 Q 150,20 240,90" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
            </g>
          )}

          {/* 6. SYSTEM DISPATCH ROUTE (Sleek, bright neon blue routing vector) */}
          <g>
            {/* Pulsing route underline/glow */}
            <path 
              d={`M ${routePoints.map(p => `${p.x},${p.y}`).join(' L ')}`} 
              fill="none" 
              stroke="#3b82f6" 
              strokeWidth="5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              opacity="0.35"
              filter="url(#routeGlow)"
            />
            {/* Sharp core route path */}
            <path 
              id="dispatch-route"
              d={`M ${routePoints.map(p => `${p.x},${p.y}`).join(' L ')}`} 
              fill="none" 
              stroke="#2563eb" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              strokeDasharray="5 4"
            />
          </g>

          {/* 7. GEOGRAPHICAL LANDMARK LABELS */}
          <g opacity={mapStyle === 'satellite' ? '0.75' : '0.9'}>
            <text x="65" y="45" fill={theme.labelColor} fontSize="8" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.5">JBR BEACH</text>
            <text x="210" y="80" fill={theme.labelColor} fontSize="7" fontWeight="semibold" fontFamily="sans-serif">CAYAN TOWER</text>
            <text x="455" y="240" fill={theme.labelColor} fontSize="8" fontWeight="bold" fontFamily="sans-serif">DUBAI MARINA</text>
            <text x="545" y="303" fill={theme.labelColor} fontSize="7.5" fontWeight="bold" fontFamily="sans-serif" opacity="0.8">MARINA MALL</text>
            <text x="380" y="405" fill={theme.labelColor} fontSize="8" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.5">JLT DISTRICT</text>
            <text x="590" y="315" fill={theme.highwayBorder} fontSize="7" fontWeight="bold" fontFamily="mono" transform="rotate(-9, 590, 315)">SHEIKH ZAYED RD (E11)</text>
          </g>

          {/* 8. ORIGIN DEPOT PIN */}
          <g transform={`translate(${originPos.x}, ${originPos.y})`}>
            <circle cx="0" cy="0" r="14" fill="#3b82f6" fillOpacity="0.15" />
            <circle cx="0" cy="0" r="7" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
            <text x="10" y="3" fill={theme.labelColor} fontSize="7" fontWeight="bold" fontFamily="sans-serif">CAFU DEPOT</text>
          </g>

          {/* 9. DESTINATION CLIENT PIN */}
          <g transform={`translate(${destPos.x}, ${destPos.y})`}>
            {/* Animated locator rings */}
            <circle cx="0" cy="0" r="18" fill="#ef4444" fillOpacity="0.2">
              <animate attributeName="r" values="8;20;8" dur="3s" repeatCount="indefinite" />
              <animate attributeName="fill-opacity" values="0.4;0;0.4" dur="3s" repeatCount="indefinite" />
            </circle>
            
            {/* Standard elegant map pin dropshadow */}
            <ellipse cx="0" cy="4" rx="5" ry="2" fill="#000" fillOpacity="0.2" />

            {/* Google-like Red Map Pin */}
            <path 
              d="M 0,0 C -5,-5 -8,-10 -8,-15 C -8,-20 -4,-24 0,-24 C 4,-24 8,-20 8,-15 C 8,-10 5,-5 0,0 Z" 
              fill="#ef4444" 
              stroke="#ffffff" 
              strokeWidth="1" 
            />
            {/* Small inner dot */}
            <circle cx="0" cy="-15" r="3.5" fill="#ffffff" />
            
            {/* Floating custom label card directly attached to the pin */}
            <g transform="translate(0, -32)">
              <rect x="-45" y="-14" width="90" height="18" rx="4" fill="#0f172a" stroke="#ef4444" strokeWidth="1" />
              <text x="0" y="-2" fill="#ffffff" fontSize="7" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
                Ahmed ({order.id.slice(-5)})
              </text>
            </g>
          </g>

          {/* 10. REAL-TIME ACTIVE AGENT VEHICLE AVATAR (Smooth sliding vector along route) */}
          <g transform={`translate(${agentPos.x}, ${agentPos.y})`} style={{ transition: 'transform 0.1s linear' }}>
            {/* Shadow circle */}
            <circle cx="0" cy="2" r="14" fill="#000000" fillOpacity="0.2" filter="blur(2px)" />
            
            {/* High-visibility Agent Pulse Ring */}
            <circle cx="0" cy="0" r="16" fill="#10b981" fillOpacity="0.15">
              <animate attributeName="r" values="12;22;12" dur="2s" repeatCount="indefinite" />
            </circle>

            {/* Beautiful Custom styled Agent Shield */}
            <g transform="translate(0, -4)">
              {/* Hexagon/shield marker badge */}
              <path 
                d="M -12,-8 L 12,-8 L 15,4 L 0,16 L -15,4 Z" 
                fill="#10b981" 
                stroke="#ffffff" 
                strokeWidth="1.5" 
              />
              {/* Inner symbol / vehicle icon */}
              <g transform="translate(-7, -4) scale(0.6)" stroke="#ffffff" strokeWidth="2" fill="none">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1 .4-1 1v7c0 .6.4 1 1 1h1M14 17h2" />
                <circle cx="7.5" cy="17.5" r="2.5" />
                <circle cx="17.5" cy="17.5" r="2.5" />
              </g>
            </g>

            {/* Micro Tag with ETA directly over active Agent */}
            <g transform="translate(0, 18)">
              <rect x="-35" y="-10" width="70" height="14" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="0.5" />
              <text x="0" y="0" fill="#10b981" fontSize="7" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
                AGENT • {order.eta}
              </text>
            </g>
          </g>
        </svg>

        {/* Dynamic Zoom Level Scale Indicator & Orientation overlays */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-md border border-slate-200 text-[10px] font-bold text-slate-500 shadow-sm">
          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] uppercase tracking-wider text-slate-400">Map Scale</span>
            <span className="font-mono">1 : 12,400</span>
          </div>
          <div className="w-px h-6 bg-slate-200"></div>
          {/* Legend indicator bar */}
          <div className="flex items-center gap-1">
            <div className="w-8 h-1 bg-blue-500 rounded"></div>
            <span>200 m</span>
          </div>
        </div>

        {/* Mini HUD Controls Overlay (Zoom & Compass) */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
          {/* Zoom In / Out */}
          <div className="flex flex-col bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
            <button 
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))}
              title="Zoom In"
              className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 border-b border-slate-100 text-slate-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}
              title="Zoom Out"
              className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          {/* Compass Orientation Indicator */}
          <button 
            onClick={() => setZoom(1)}
            title="Reset Orientation (North Up)"
            className="w-8 h-8 bg-white border border-slate-200 rounded-lg shadow-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Compass className="w-4 h-4 text-slate-500 animate-spin-slow" />
          </button>
        </div>

        {/* Left Side floating map details legend */}
        {showLegend && (
          <div className="absolute bottom-4 left-32 z-20 hidden md:flex items-center gap-4 bg-white/95 backdrop-blur-sm p-2 rounded-lg border border-slate-200 shadow-md text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 border border-white"></span>
              <span className="text-slate-600 font-medium">Route Path</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white"></span>
              <span className="text-slate-600 font-medium">Active Agent</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#ffd17c] border border-orange-300"></span>
              <span className="text-slate-600 font-medium">Highway</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#b2d9e7] border border-blue-200"></span>
              <span className="text-slate-600 font-medium">Marina Canal</span>
            </div>
          </div>
        )}
      </div>

      {/* Legal & Copyright overlay bar */}
      <div className="bg-slate-50 border-t border-slate-200 px-3 py-1.5 flex items-center justify-between text-[9px] text-slate-400 font-medium">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 tracking-tight">Google</span>
          <span>Map data ©2026 Dubai Municipality, Google</span>
        </div>
        <div className="flex gap-3">
          <a href="#" className="hover:underline">Report a map error</a>
          <a href="#" className="hover:underline">Terms of Use</a>
          <a href="#" className="hover:underline">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
}

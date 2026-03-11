'use client';
import { useRadarStore } from '@/lib/store';

export function RadarLogo({ size = 32 }: { size?: number }) {
  const theme = useRadarStore(s => s.theme);
  const color = theme === 'herald' ? '#C41E3A' : theme === 'terminal' ? '#0088CC' : '#CC4400';
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="14" stroke={color} strokeWidth="0.75" strokeDasharray="3 3" opacity="0.3"/>
      <circle cx="16" cy="16" r="9"  stroke={color} strokeWidth="0.75" opacity="0.55"/>
      <circle cx="16" cy="16" r="4"  stroke={color} strokeWidth="1.25" opacity="0.9"/>
      <line x1="16" y1="16" x2="16" y2="2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="16" cy="16" r="2.5" fill={color}/>
      <circle cx="23" cy="9" r="2.5" fill={color} opacity="0.75"/>
      <circle cx="23" cy="9" r="4.5" fill={color} opacity="0.1"/>
    </svg>
  );
}

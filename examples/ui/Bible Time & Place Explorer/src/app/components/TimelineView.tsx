import { useRef } from 'react';
import { EVENTS, CATEGORY_COLORS, CATEGORY_LABELS, type BibleEvent } from './bible-data';

interface TimelineViewProps {
  onSelectEvent: (event: BibleEvent) => void;
  selectedEventId: string | null;
}

const CERTAINTY_LABELS = {
  high: { label: 'Historically Fixed', color: '#4a8a6a', symbol: '◆' },
  medium: { label: 'Scholarly Consensus', color: '#c9922a', symbol: '◇' },
  speculative: { label: 'Speculative', color: '#7a6b4f', symbol: '○' },
};

const ERA_BANDS = [
  { start: 30, end: 36, label: 'Early Jerusalem Church', color: 'rgba(74,138,106,0.06)' },
  { start: 37, end: 45, label: 'Expansion to Gentiles', color: 'rgba(201,146,42,0.06)' },
  { start: 46, end: 49, label: 'First Missionary Journey', color: 'rgba(201,146,42,0.08)' },
  { start: 49, end: 52, label: 'Second Missionary Journey', color: 'rgba(122,90,154,0.07)' },
  { start: 52, end: 57, label: 'Third Missionary Journey', color: 'rgba(90,122,154,0.07)' },
  { start: 57, end: 62, label: 'Imprisonment & Rome', color: 'rgba(138,32,32,0.07)' },
];

export function TimelineView({ onSelectEvent, selectedEventId }: TimelineViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const sortedEvents = [...EVENTS].sort((a, b) => a.dateStart - b.dateStart);

  const minYear = 29;
  const maxYear = 63;
  const totalYears = maxYear - minYear;
  const PX_PER_YEAR = 100;
  const totalWidth = totalYears * PX_PER_YEAR;
  const TRACK_COUNT = 4;
  const trackAssignments: Record<string, number> = {};
  const trackOccupied: number[] = new Array(TRACK_COUNT).fill(minYear);

  for (const event of sortedEvents) {
    let assigned = 0;
    for (let t = 0; t < TRACK_COUNT; t++) {
      if (trackOccupied[t] <= event.dateStart - 0.5) {
        assigned = t;
        break;
      }
    }
    trackAssignments[event.id] = assigned;
    trackOccupied[assigned] = event.dateEnd + 1;
  }

  const TRACK_HEIGHT = 110;
  const HEADER_HEIGHT = 60;
  const svgHeight = HEADER_HEIGHT + TRACK_COUNT * TRACK_HEIGHT + 40;

  return (
    <div className="flex flex-col h-full">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 px-5 py-3 border-b border-border">
        {Object.entries(CERTAINTY_LABELS).map(([k, v]) => (
          <span key={k} className="flex items-center gap-1.5 text-xs" style={{ color: v.color, fontFamily: 'JetBrains Mono, monospace' }}>
            <span style={{ fontSize: '14px' }}>{v.symbol}</span> {v.label}
          </span>
        ))}
        <span className="ml-auto text-xs text-muted-foreground" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          Scroll horizontally · Click event to explore
        </span>
      </div>

      {/* Scrollable timeline */}
      <div ref={scrollRef} className="flex-1 overflow-x-auto overflow-y-hidden" style={{ cursor: 'default' }}>
        <svg
          width={totalWidth + 120}
          height={svgHeight}
          className="block"
          style={{ minWidth: '100%' }}
        >
          {/* Era bands */}
          {ERA_BANDS.map((era) => {
            const x1 = (era.start - minYear) * PX_PER_YEAR;
            const x2 = (era.end - minYear) * PX_PER_YEAR;
            return (
              <g key={era.label}>
                <rect
                  x={x1}
                  y={0}
                  width={x2 - x1}
                  height={svgHeight}
                  fill={era.color}
                />
                <text
                  x={(x1 + x2) / 2}
                  y={14}
                  fontSize="8.5"
                  textAnchor="middle"
                  fill="rgba(228,207,160,0.4)"
                  fontFamily="Cinzel, serif"
                  letterSpacing="0.06em"
                  style={{ userSelect: 'none' }}
                >
                  {era.label}
                </text>
              </g>
            );
          })}

          {/* Year axis */}
          {Array.from({ length: totalYears + 1 }, (_, i) => i + minYear).map((year) => {
            const x = (year - minYear) * PX_PER_YEAR;
            const isMajor = year % 5 === 0;
            return (
              <g key={year}>
                <line
                  x1={x}
                  y1={isMajor ? 20 : 28}
                  x2={x}
                  y2={svgHeight - 10}
                  stroke={isMajor ? 'rgba(201,146,42,0.2)' : 'rgba(201,146,42,0.08)'}
                  strokeWidth={isMajor ? 1 : 0.5}
                />
                {isMajor && (
                  <text
                    x={x}
                    y={38}
                    fontSize="10"
                    textAnchor="middle"
                    fill="rgba(201,146,42,0.65)"
                    fontFamily="JetBrains Mono, monospace"
                    style={{ userSelect: 'none' }}
                  >
                    {year} AD
                  </text>
                )}
              </g>
            );
          })}

          {/* Baseline */}
          <line
            x1={0}
            y1={HEADER_HEIGHT - 2}
            x2={totalWidth + 100}
            y2={HEADER_HEIGHT - 2}
            stroke="rgba(201,146,42,0.35)"
            strokeWidth="1"
          />

          {/* Events */}
          {sortedEvents.map((event) => {
            const track = trackAssignments[event.id] ?? 0;
            const x = (event.dateStart - minYear) * PX_PER_YEAR + 8;
            const width = Math.max((event.dateEnd - event.dateStart) * PX_PER_YEAR - 16, 60);
            const y = HEADER_HEIGHT + track * TRACK_HEIGHT + 8;
            const isSelected = event.id === selectedEventId;
            const catColor = CATEGORY_COLORS[event.category];
            const certainty = CERTAINTY_LABELS[event.certainty];

            return (
              <g
                key={event.id}
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectEvent(event)}
              >
                {/* Card */}
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={88}
                  rx={2}
                  fill={isSelected ? '#2a2010' : '#1a1510'}
                  stroke={isSelected ? catColor : 'rgba(201,146,42,0.2)'}
                  strokeWidth={isSelected ? 1.5 : 0.8}
                />
                {/* Category bar */}
                <rect x={x} y={y} width={3} height={88} rx={1} fill={catColor} />

                {/* Certainty dot */}
                <circle cx={x + width - 12} cy={y + 12} r={4} fill={certainty.color} opacity={0.8} />

                {/* Title */}
                <foreignObject x={x + 8} y={y + 4} width={width - 28} height={42}>
                  <div
                    style={{
                      fontFamily: 'Cinzel, serif',
                      fontSize: '10px',
                      color: isSelected ? '#e4cfa0' : '#c8b07a',
                      lineHeight: '1.35',
                      letterSpacing: '0.03em',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {event.title}
                  </div>
                </foreignObject>

                {/* Date */}
                <text
                  x={x + 8}
                  y={y + 56}
                  fontSize="8.5"
                  fill="rgba(201,146,42,0.7)"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {event.dateDisplay}
                </text>

                {/* Passage */}
                <text
                  x={x + 8}
                  y={y + 70}
                  fontSize="8"
                  fill="rgba(122,107,79,0.9)"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {event.passage}
                </text>

                {/* Category label */}
                <text
                  x={x + 8}
                  y={y + 82}
                  fontSize="7.5"
                  fill={catColor}
                  fontFamily="Cinzel, serif"
                  opacity="0.8"
                  letterSpacing="0.06em"
                >
                  {CATEGORY_LABELS[event.category].toUpperCase()}
                </text>

                {/* Connecting line to axis */}
                <line
                  x1={x + width / 2}
                  y1={HEADER_HEIGHT - 2}
                  x2={x + width / 2}
                  y2={y}
                  stroke={isSelected ? catColor : 'rgba(201,146,42,0.15)'}
                  strokeWidth={isSelected ? 1 : 0.5}
                  strokeDasharray="3,3"
                />
                <circle
                  cx={x + width / 2}
                  cy={HEADER_HEIGHT - 2}
                  r={isSelected ? 4 : 3}
                  fill={isSelected ? catColor : '#2a2010'}
                  stroke={isSelected ? catColor : 'rgba(201,146,42,0.4)'}
                  strokeWidth="1"
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

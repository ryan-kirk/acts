import { X, BookOpen, MapPin, Users, Link2, Shield, ShieldCheck, ShieldAlert, Clock } from 'lucide-react';
import { EVENTS, LOCATIONS, PEOPLE, CATEGORY_COLORS, CATEGORY_LABELS, type BibleEvent } from './bible-data';

interface EventDetailProps {
  event: BibleEvent;
  onClose: () => void;
  onSelectEvent: (event: BibleEvent) => void;
}

const CERTAINTY_CONFIG = {
  high: {
    label: 'Historically Fixed',
    description: 'Date/location supported by multiple independent sources or synchronized astronomical/epigraphic evidence.',
    icon: ShieldCheck,
    color: '#4a8a6a',
  },
  medium: {
    label: 'Scholarly Consensus',
    description: 'General agreement among historians based on internal evidence and relative chronology.',
    icon: Shield,
    color: '#c9922a',
  },
  speculative: {
    label: 'Speculative',
    description: 'Contested or inferred from limited evidence. Multiple plausible interpretations exist.',
    icon: ShieldAlert,
    color: '#7a6b4f',
  },
};

function Ornament() {
  return (
    <div className="flex items-center gap-2 my-1" aria-hidden="true">
      <div className="flex-1 border-t border-border" />
      <span style={{ color: '#c9922a', fontSize: '10px', fontFamily: 'serif', letterSpacing: '0.2em', opacity: 0.5 }}>✦ ✦ ✦</span>
      <div className="flex-1 border-t border-border" />
    </div>
  );
}

export function EventDetail({ event, onClose, onSelectEvent }: EventDetailProps) {
  const location = LOCATIONS[event.locationId];
  const certainty = CERTAINTY_CONFIG[event.certainty];
  const CertaintyIcon = certainty.icon;
  const catColor = CATEGORY_COLORS[event.category];

  const relatedEvents = event.relatedEventIds
    .map((id) => EVENTS.find((e) => e.id === id))
    .filter((e): e is BibleEvent => !!e);

  const people = event.personIds.map((id) => PEOPLE[id]).filter(Boolean);

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#15110c' }}>
      {/* Header */}
      <div className="relative px-5 pt-5 pb-4 border-b border-border">
        {/* Category + Close */}
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-xs px-2 py-0.5 rounded-sm uppercase tracking-widest"
            style={{
              fontFamily: 'Cinzel, serif',
              color: catColor,
              border: `1px solid ${catColor}40`,
              fontSize: '9px',
              letterSpacing: '0.12em',
            }}
          >
            {CATEGORY_LABELS[event.category]}
          </span>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
          >
            <X size={15} />
          </button>
        </div>

        {/* Title */}
        <h2
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '16px',
            fontWeight: 600,
            letterSpacing: '0.02em',
            color: '#e4cfa0',
            lineHeight: 1.35,
            marginBottom: '10px',
          }}
        >
          {event.title}
        </h2>

        {/* Meta row */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5" style={{ color: '#c9922a', fontFamily: 'JetBrains Mono', fontSize: '11px' }}>
            <Clock size={11} />
            {event.dateDisplay}
          </div>
          {location && (
            <div className="flex items-center gap-1.5" style={{ color: '#7a6b4f', fontFamily: 'JetBrains Mono', fontSize: '11px' }}>
              <MapPin size={11} />
              {location.name}
              <span className="opacity-50">· {location.region}</span>
            </div>
          )}
        </div>

        {/* Certainty */}
        <div
          className="flex items-start gap-2 mt-3 p-2 rounded-sm"
          style={{ background: `${certainty.color}12`, border: `1px solid ${certainty.color}22` }}
        >
          <CertaintyIcon size={13} style={{ color: certainty.color, flexShrink: 0, marginTop: 1 }} />
          <div>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: certainty.color, fontWeight: 500 }}>
              {certainty.label}
            </span>
            <p style={{ fontFamily: 'Crimson Pro, Georgia, serif', fontSize: '12px', color: '#7a6b4f', lineHeight: 1.4, marginTop: 2 }}>
              {certainty.description}
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

        {/* Description */}
        <div>
          <p style={{ fontFamily: 'Crimson Pro, Georgia, serif', fontSize: '14.5px', lineHeight: 1.7, color: '#c8b07a' }}>
            {event.description}
          </p>
        </div>

        <Ornament />

        {/* Passage */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={12} style={{ color: '#c9922a' }} />
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '10px', color: '#c9922a', letterSpacing: '0.1em' }}>
              PRIMARY PASSAGE
            </span>
          </div>
          <div
            className="px-3 py-2 rounded-sm"
            style={{ background: '#1a1510', border: '1px solid rgba(201,146,42,0.15)', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#c9922a' }}
          >
            {event.passage}
          </div>
        </div>

        {/* Sources */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={12} style={{ color: '#7a6b4f' }} />
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '10px', color: '#7a6b4f', letterSpacing: '0.1em' }}>
              SOURCES & ATTESTATION
            </span>
          </div>
          <div className="space-y-2">
            {event.sources.map((source, i) => (
              <div
                key={i}
                className="px-3 py-2 rounded-sm"
                style={{ background: '#1a1510', border: '1px solid rgba(201,146,42,0.1)' }}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-sm"
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '8.5px',
                      color: source.type === 'scripture' ? '#4a8a6a' : '#5a7a9a',
                      border: `1px solid ${source.type === 'scripture' ? '#4a8a6a' : '#5a7a9a'}40`,
                      letterSpacing: '0.06em',
                    }}
                  >
                    {source.type === 'scripture' ? 'SCRIPTURE' : 'EXTRA-BIBLICAL'}
                  </span>
                  {source.date && (
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#5a4a30' }}>
                      {source.date}
                    </span>
                  )}
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10.5px', color: '#c9922a', marginBottom: source.text || source.work ? 4 : 0 }}>
                  {source.reference}
                </div>
                {source.work && (
                  <div style={{ fontFamily: 'Crimson Pro, serif', fontSize: '11px', color: '#7a6b4f', fontStyle: 'italic' }}>
                    {source.author ? `${source.author}, ` : ''}{source.work}
                  </div>
                )}
                {source.text && (
                  <div style={{ fontFamily: 'Crimson Pro, serif', fontSize: '12px', color: '#9a8a65', fontStyle: 'italic', marginTop: 4, lineHeight: 1.5 }}>
                    "{source.text}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Location detail */}
        {location && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={12} style={{ color: '#7a6b4f' }} />
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: '10px', color: '#7a6b4f', letterSpacing: '0.1em' }}>
                LOCATION
              </span>
            </div>
            <div
              className="px-3 py-2 rounded-sm"
              style={{ background: '#1a1510', border: '1px solid rgba(201,146,42,0.1)' }}
            >
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: '12px', color: '#c8b07a', marginBottom: 4 }}>
                {location.name}
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#5a4a30', marginLeft: 8 }}>
                  {location.lat.toFixed(2)}°N · {location.lon.toFixed(2)}°E
                </span>
              </div>
              <p style={{ fontFamily: 'Crimson Pro, serif', fontSize: '12px', color: '#7a6b4f', lineHeight: 1.5 }}>
                {location.description}
              </p>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9.5px', color: '#5a4a30', marginTop: 4 }}>
                Modern: {location.modernName}
              </div>
            </div>
          </div>
        )}

        {/* People */}
        {people.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users size={12} style={{ color: '#7a6b4f' }} />
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: '10px', color: '#7a6b4f', letterSpacing: '0.1em' }}>
                PERSONS INVOLVED
              </span>
            </div>
            <div className="space-y-2">
              {people.map((person) => (
                <div
                  key={person.id}
                  className="px-3 py-2 rounded-sm"
                  style={{ background: '#1a1510', border: '1px solid rgba(201,146,42,0.1)' }}
                >
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: '12px', color: '#c8b07a', marginBottom: 2 }}>
                    {person.name}
                    {person.aliases && (
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#5a4a30', marginLeft: 8 }}>
                        also {person.aliases.join(', ')}
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9.5px', color: '#c9922a', marginBottom: 3 }}>
                    {person.role}
                  </div>
                  <p style={{ fontFamily: 'Crimson Pro, serif', fontSize: '12px', color: '#7a6b4f', lineHeight: 1.5 }}>
                    {person.description}
                  </p>
                  {person.died && (
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#5a4a30', marginTop: 3 }}>
                      d. {person.died}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related events */}
        {relatedEvents.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link2 size={12} style={{ color: '#7a6b4f' }} />
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: '10px', color: '#7a6b4f', letterSpacing: '0.1em' }}>
                RELATED EVENTS
              </span>
            </div>
            <div className="space-y-1.5">
              {relatedEvents.map((re) => (
                <button
                  key={re.id}
                  onClick={() => onSelectEvent(re)}
                  className="w-full text-left px-3 py-2 rounded-sm transition-all hover:border-primary/40"
                  style={{ background: '#1a1510', border: '1px solid rgba(201,146,42,0.12)' }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: '11px', color: '#c8b07a', lineHeight: 1.4 }}>
                      {re.title}
                    </span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#5a4a30', flexShrink: 0 }}>
                      {re.dateDisplay}
                    </span>
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9.5px', color: `${CATEGORY_COLORS[re.category]}99`, marginTop: 2 }}>
                    {re.passage}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  );
}

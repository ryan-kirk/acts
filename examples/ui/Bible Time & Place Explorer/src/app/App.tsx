import { useState } from 'react';
import { MapPin, Clock, Users, BookOpen, ChevronRight, X, Menu } from 'lucide-react';
import { MapView } from './components/MapView';
import { TimelineView } from './components/TimelineView';
import { PeopleView } from './components/PeopleView';
import { SourcesView } from './components/SourcesView';
import { EventDetail } from './components/EventDetail';
import { type BibleEvent, EVENTS, LOCATIONS } from './components/bible-data';

type View = 'map' | 'timeline' | 'people' | 'sources';

const VIEWS: { id: View; label: string; Icon: React.ElementType; description: string }[] = [
  { id: 'map', label: 'Map', Icon: MapPin, description: 'Interactive geographic explorer' },
  { id: 'timeline', label: 'Timeline', Icon: Clock, description: 'Chronological scroll' },
  { id: 'people', label: 'People', Icon: Users, description: 'Biographical records' },
  { id: 'sources', label: 'Sources', Icon: BookOpen, description: 'Attestation apparatus' },
];

function ScrollText({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <rect x="6" y="4" width="20" height="24" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="4" y="6" width="4" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="24" y="6" width="4" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="1" />
      <line x1="10" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <line x1="10" y1="14" x2="22" y2="14" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <line x1="10" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <line x1="10" y1="22" x2="18" y2="22" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

function EventListItem({ event, isSelected, onClick }: { event: BibleEvent; isSelected: boolean; onClick: () => void }) {
  const loc = LOCATIONS[event.locationId];
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2.5 border-b transition-all group"
      style={{
        borderColor: 'rgba(201,146,42,0.1)',
        background: isSelected ? 'rgba(201,146,42,0.08)' : 'transparent',
        borderLeft: isSelected ? '2px solid #c9922a' : '2px solid transparent',
      }}
    >
      <div style={{ fontFamily: 'Cinzel, serif', fontSize: '10.5px', color: isSelected ? '#e4cfa0' : '#c8b07a', lineHeight: 1.4, marginBottom: 3 }}>
        {event.title}
      </div>
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: '8.5px', color: '#7a6b4f' }}>
        {event.dateDisplay} · {loc?.name}
      </div>
    </button>
  );
}

export default function App() {
  const [view, setView] = useState<View>('map');
  const [selectedEvent, setSelectedEvent] = useState<BibleEvent | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');

  const sortedEvents = [...EVENTS].sort((a, b) => a.dateStart - b.dateStart);
  const filteredEvents = sortedEvents.filter(
    (e) =>
      search === '' ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.passage.toLowerCase().includes(search.toLowerCase()) ||
      LOCATIONS[e.locationId]?.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleSelectEvent(event: BibleEvent) {
    setSelectedEvent(event);
  }

  return (
    <div
      className="flex flex-col size-full overflow-hidden"
      style={{ background: '#100d08', color: '#e4cfa0', fontFamily: 'Crimson Pro, Georgia, serif' }}
    >
      {/* Top navigation */}
      <header
        className="flex items-center gap-0 px-4 flex-shrink-0 border-b"
        style={{ height: 52, borderColor: 'rgba(201,146,42,0.2)', background: '#15110c' }}
      >
        {/* Logo + title */}
        <div className="flex items-center gap-3 mr-6">
          <div style={{ color: '#c9922a' }}>
            <ScrollText size={24} />
          </div>
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '13px', fontWeight: 700, color: '#e4cfa0', letterSpacing: '0.06em', lineHeight: 1.2 }}>
              BIBLE TIME &amp; PLACE
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', color: '#7a6b4f', letterSpacing: '0.08em' }}>
              INTERACTIVE SCRIPTURE EXPLORER · BOOK OF ACTS
            </div>
          </div>
        </div>

        {/* View tabs */}
        <nav className="flex items-center gap-1 flex-1">
          {VIEWS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm transition-all"
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '10px',
                letterSpacing: '0.08em',
                color: view === id ? '#c9922a' : '#7a6b4f',
                background: view === id ? 'rgba(201,146,42,0.1)' : 'transparent',
                border: view === id ? '1px solid rgba(201,146,42,0.25)' : '1px solid transparent',
              }}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </nav>

        {/* Event count badge */}
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#5a4a30' }}>
            {EVENTS.length} EVENTS · ACTS 1–28
          </span>
          <button
            className="lg:hidden p-1"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ color: '#7a6b4f' }}
          >
            <Menu size={16} />
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left sidebar — event list */}
        <aside
          className="flex-col border-r flex-shrink-0 overflow-hidden"
          style={{
            width: 220,
            borderColor: 'rgba(201,146,42,0.15)',
            background: '#15110c',
            display: sidebarOpen ? 'flex' : 'none',
          }}
        >
          <div className="px-3 py-2 border-b" style={{ borderColor: 'rgba(201,146,42,0.15)' }}>
            <input
              type="text"
              placeholder="Search events…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-2 py-1.5 rounded-sm text-xs outline-none"
              style={{
                background: '#1a1510',
                border: '1px solid rgba(201,146,42,0.18)',
                color: '#e4cfa0',
                fontFamily: 'Crimson Pro, serif',
                fontSize: '12px',
              }}
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {filteredEvents.map((event) => (
              <EventListItem
                key={event.id}
                event={event}
                isSelected={selectedEvent?.id === event.id}
                onClick={() => handleSelectEvent(event)}
              />
            ))}
          </div>
          <div className="px-3 py-2 border-t" style={{ borderColor: 'rgba(201,146,42,0.1)' }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: '#5a4a30', lineHeight: 1.5, textAlign: 'center' }}>
              BOOK OF ACTS · FIRST DATASET<br />LUKE · GOSPELS · PAULINES COMING SOON
            </div>
          </div>
        </aside>

        {/* Desktop sidebar — always visible */}
        <aside
          className="hidden lg:flex flex-col border-r flex-shrink-0 overflow-hidden"
          style={{
            width: 220,
            borderColor: 'rgba(201,146,42,0.15)',
            background: '#15110c',
          }}
        >
          <div className="px-3 py-2 border-b" style={{ borderColor: 'rgba(201,146,42,0.15)' }}>
            <input
              type="text"
              placeholder="Search events…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-2 py-1.5 rounded-sm text-xs outline-none"
              style={{
                background: '#1a1510',
                border: '1px solid rgba(201,146,42,0.18)',
                color: '#e4cfa0',
                fontFamily: 'Crimson Pro, serif',
                fontSize: '12px',
              }}
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {filteredEvents.map((event) => (
              <EventListItem
                key={event.id}
                event={event}
                isSelected={selectedEvent?.id === event.id}
                onClick={() => handleSelectEvent(event)}
              />
            ))}
          </div>
          <div className="px-3 py-2 border-t" style={{ borderColor: 'rgba(201,146,42,0.1)' }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: '#5a4a30', lineHeight: 1.5, textAlign: 'center' }}>
              BOOK OF ACTS · FIRST DATASET<br />LUKE · GOSPELS · PAULINES COMING SOON
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {view === 'map' && (
            <MapView onSelectEvent={handleSelectEvent} selectedEventId={selectedEvent?.id ?? null} />
          )}
          {view === 'timeline' && (
            <TimelineView onSelectEvent={handleSelectEvent} selectedEventId={selectedEvent?.id ?? null} />
          )}
          {view === 'people' && (
            <PeopleView />
          )}
          {view === 'sources' && (
            <SourcesView />
          )}
        </main>

        {/* Right panel — event detail */}
        {selectedEvent && (
          <aside
            className="flex-col flex-shrink-0 border-l overflow-hidden flex"
            style={{
              width: 340,
              borderColor: 'rgba(201,146,42,0.18)',
              background: '#15110c',
            }}
          >
            <EventDetail
              event={selectedEvent}
              onClose={() => setSelectedEvent(null)}
              onSelectEvent={handleSelectEvent}
            />
          </aside>
        )}
      </div>
    </div>
  );
}

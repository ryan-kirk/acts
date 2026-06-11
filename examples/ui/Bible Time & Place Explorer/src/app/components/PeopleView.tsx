import { useState } from 'react';
import { PEOPLE, EVENTS, type Person } from './bible-data';

interface PeopleViewProps {
  onSelectPerson?: (person: Person) => void;
}

export function PeopleView({ onSelectPerson }: PeopleViewProps) {
  const [selected, setSelected] = useState<Person | null>(null);
  const [search, setSearch] = useState('');

  const personEventCount: Record<string, number> = {};
  for (const event of EVENTS) {
    for (const pid of event.personIds) {
      personEventCount[pid] = (personEventCount[pid] || 0) + 1;
    }
  }

  const people = Object.values(PEOPLE).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.role.toLowerCase().includes(search.toLowerCase())
  );

  const personEvents = selected
    ? EVENTS.filter((e) => e.personIds.includes(selected.id)).sort((a, b) => a.dateStart - b.dateStart)
    : [];

  return (
    <div className="flex h-full overflow-hidden">
      {/* People list */}
      <div className="flex flex-col w-full lg:w-80 border-r border-border flex-shrink-0">
        <div className="px-4 py-3 border-b border-border">
          <input
            type="text"
            placeholder="Search persons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 rounded-sm text-sm outline-none"
            style={{
              background: '#1a1510',
              border: '1px solid rgba(201,146,42,0.2)',
              color: '#e4cfa0',
              fontFamily: 'Crimson Pro, serif',
              fontSize: '14px',
            }}
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {people.map((person) => {
            const count = personEventCount[person.id] || 0;
            const isSelected = selected?.id === person.id;
            return (
              <button
                key={person.id}
                onClick={() => setSelected(isSelected ? null : person)}
                className="w-full text-left px-4 py-3 border-b transition-all"
                style={{
                  borderColor: 'rgba(201,146,42,0.12)',
                  background: isSelected ? '#231d12' : 'transparent',
                  borderLeft: isSelected ? '2px solid #c9922a' : '2px solid transparent',
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: '13px', color: isSelected ? '#e4cfa0' : '#c8b07a', fontWeight: isSelected ? 600 : 400 }}>
                    {person.name}
                  </span>
                  {count > 0 && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-sm"
                      style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#c9922a', border: '1px solid rgba(201,146,42,0.3)', flexShrink: 0 }}
                    >
                      {count} event{count !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9.5px', color: '#7a6b4f' }}>
                  {person.role}
                </div>
                {person.nationality && (
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: '#5a4a30', marginTop: 2 }}>
                    {person.nationality}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Person detail */}
      <div className="flex-1 overflow-y-auto px-6 py-6 hidden lg:block">
        {selected ? (
          <div className="max-w-xl">
            <div className="mb-1">
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#c9922a', letterSpacing: '0.1em' }}>
                BIOGRAPHICAL RECORD
              </span>
            </div>
            <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '22px', fontWeight: 700, color: '#e4cfa0', letterSpacing: '0.03em', marginBottom: 4 }}>
              {selected.name}
            </h2>
            {selected.aliases && (
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#7a6b4f', marginBottom: 12 }}>
                Also known as: {selected.aliases.join(' · ')}
              </div>
            )}

            <div className="flex flex-wrap gap-3 mb-5">
              <span className="px-2.5 py-1 rounded-sm text-xs" style={{ background: '#231d12', color: '#c9922a', fontFamily: 'JetBrains Mono', fontSize: '10px', border: '1px solid rgba(201,146,42,0.2)' }}>
                {selected.role}
              </span>
              {selected.nationality && (
                <span className="px-2.5 py-1 rounded-sm text-xs" style={{ background: '#1a1510', color: '#7a6b4f', fontFamily: 'JetBrains Mono', fontSize: '10px', border: '1px solid rgba(201,146,42,0.1)' }}>
                  {selected.nationality}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 border-t border-border" />
              <span style={{ color: '#c9922a', fontSize: '9px', opacity: 0.5 }}>✦</span>
              <div className="flex-1 border-t border-border" />
            </div>

            <p style={{ fontFamily: 'Crimson Pro, Georgia, serif', fontSize: '15px', lineHeight: 1.75, color: '#c8b07a', marginBottom: 20 }}>
              {selected.description}
            </p>

            {selected.died && (
              <div className="px-3 py-2 rounded-sm mb-5" style={{ background: '#1a1510', border: '1px solid rgba(138,32,32,0.25)' }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9.5px', color: '#8a2020', letterSpacing: '0.08em' }}>MARTYRDOM / DEATH: </span>
                <span style={{ fontFamily: 'Crimson Pro, serif', fontSize: '12px', color: '#7a6b4f' }}>{selected.died}</span>
              </div>
            )}

            {personEvents.length > 0 && (
              <>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: '10px', color: '#7a6b4f', letterSpacing: '0.1em', marginBottom: 10 }}>
                  APPEARANCES IN ACTS
                </div>
                <div className="space-y-2">
                  {personEvents.map((event) => (
                    <div
                      key={event.id}
                      className="px-3 py-2.5 rounded-sm"
                      style={{ background: '#1a1510', border: '1px solid rgba(201,146,42,0.12)' }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span style={{ fontFamily: 'Cinzel, serif', fontSize: '11.5px', color: '#c8b07a', lineHeight: 1.4 }}>
                          {event.title}
                        </span>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#5a4a30', flexShrink: 0 }}>
                          {event.dateDisplay}
                        </span>
                      </div>
                      <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9.5px', color: '#c9922a', marginTop: 3 }}>
                        {event.passage} · {event.locationId.replace(/_/g, ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full opacity-30">
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '40px', color: '#c9922a', marginBottom: 12 }}>☩</div>
            <p style={{ fontFamily: 'Crimson Pro, serif', fontSize: '14px', color: '#7a6b4f', fontStyle: 'italic' }}>
              Select a person to view their record
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

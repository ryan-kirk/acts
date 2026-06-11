import { EVENTS } from './bible-data';

interface SourceEntry {
  reference: string;
  type: 'scripture' | 'extrabiblical';
  author?: string;
  work?: string;
  date?: string;
  text?: string;
  eventIds: string[];
  certainty?: string;
}

function collectSources(): SourceEntry[] {
  const map: Record<string, SourceEntry> = {};
  for (const event of EVENTS) {
    for (const source of event.sources) {
      const key = source.reference;
      if (!map[key]) {
        map[key] = { ...source, eventIds: [] };
      }
      if (!map[key].eventIds.includes(event.id)) {
        map[key].eventIds.push(event.id);
      }
    }
  }
  return Object.values(map);
}

const SCRIPTURE_BOOKS = [
  'Acts', 'Galatians', '1 Thessalonians', '2 Thessalonians',
  '1 Corinthians', '2 Corinthians', 'Romans', 'Philippians',
  'Philemon', 'Colossians', 'Ephesians',
];

const EXTRABIBLICAL_AUTHORS = [
  { name: 'Josephus', dates: 'c. 37–100 AD', works: ['Antiquities of the Jews (93 AD)', 'Jewish War (c. 75 AD)'], description: 'Jewish historian who provides independent attestation for Herod Agrippa, James the brother of Jesus, John the Baptist, and other figures. His Testimonium Flavianum (Ant. 18.63–64) mentions Jesus, though the text as it stands is almost certainly partially interpolated.' },
  { name: 'Tacitus', dates: 'c. 56–120 AD', works: ['Annales (c. 117 AD)', 'Historiae'], description: 'Roman senator and historian. His Annales 15.44 describes Nero\'s persecution of Christians following the 64 AD fire, noting that "Christ, from whom the name had its origin, suffered the extreme penalty during the reign of Tiberius at the hands of one of our procurators, Pontius Pilatus."' },
  { name: 'Suetonius', dates: 'c. 69–122 AD', works: ['De Vita Caesarum (c. 121 AD)'], description: 'Roman biographer. His life of Claudius (25.4) mentions that the emperor expelled the Jews from Rome because of disturbances "at the instigation of Chrestus" — widely interpreted as a reference to disputes over Christ, providing an external anchor for the Claudian expulsion and Paul\'s encounter with Priscilla and Aquila (Acts 18:2).' },
  { name: 'Pliny the Younger', dates: 'c. 61–113 AD', works: ['Epistulae (c. 110 AD)'], description: 'Roman lawyer and author. His letter to Trajan (Ep. 10.96) describes Christian practice in Bithynia c. 112 AD, including that they gathered before dawn to sing hymns to Christ "as if to a god" — the earliest pagan description of Christian worship.' },
  { name: 'Eusebius', dates: 'c. 260–340 AD', works: ['Historia Ecclesiastica (c. 313 AD)', 'Chronicon'], description: 'Bishop of Caesarea, the "Father of Church History." His Historia Ecclesiastica preserves traditions about the apostolic period, including Paul\'s two Roman imprisonments, Peter\'s death, and the Jewish War\'s effect on the Jerusalem church.' },
  { name: 'Aratus of Soli', dates: 'c. 315–240 BC', works: ['Phaenomena (c. 275 BC)'], description: 'Greek didactic poet. Paul quotes his Phaenomena line 5 ("for we are also his offspring") in the Areopagus address (Acts 17:28), demonstrating his engagement with Stoic philosophical literature.' },
];

const INSCRIPTIONS = [
  {
    name: 'Gallio Inscription (Delphi)',
    date: 'c. 52 AD',
    significance: 'A fragmentary letter from Emperor Claudius to the city of Delphi mentions Junius Annaeus Gallio as proconsul of Achaia. Paul appeared before Gallio in Corinth (Acts 18:12). The inscription\'s date anchors Paul\'s Corinthian ministry to c. 51–52 AD — one of the most precise absolute dates in Pauline chronology.',
    location: 'Archaeological Museum of Delphi, Greece',
  },
  {
    name: 'Claudian Expulsion Edict',
    date: 'c. 49 AD',
    significance: 'Mentioned by Suetonius (Claud. 25.4) and confirmed by the Jewish historian Orosius (5th c.). Jews were expelled from Rome, forcing Aquila and Priscilla to relocate to Corinth (Acts 18:2). Orosius dates this to 49 AD.',
    location: 'Literary sources only',
  },
  {
    name: 'Pilate Stone (Caesarea Maritima)',
    date: 'c. 26–36 AD',
    significance: 'A limestone block inscribed with the names of Pontius Pilate and the emperor Tiberius, excavated at Caesarea Maritima in 1961. Provides direct epigraphic confirmation of Pilate as prefect of Judaea.',
    location: 'Israel Museum, Jerusalem',
  },
  {
    name: 'Temple Warning Inscription (Jerusalem)',
    date: 'c. 1st century AD',
    significance: 'Greek inscription forbidding Gentiles from entering beyond the Court of the Gentiles under penalty of death. Paul was accused of bringing Trophimus the Ephesian past this barrier (Acts 21:28–29), the act which triggered his arrest.',
    location: 'Istanbul Archaeological Museum / Israel Museum (fragmentary copy)',
  },
];

export function SourcesView() {
  const allSources = collectSources();
  const scriptural = allSources.filter((s) => s.type === 'scripture');
  const extrabiblical = allSources.filter((s) => s.type === 'extrabiblical');

  return (
    <div className="overflow-y-auto h-full px-6 py-6">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* Header */}
        <div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#c9922a', letterSpacing: '0.12em', marginBottom: 8 }}>
            SOURCE-CRITICAL APPARATUS
          </div>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '24px', fontWeight: 700, color: '#e4cfa0', letterSpacing: '0.02em', marginBottom: 10 }}>
            Sources & Attestation
          </h1>
          <p style={{ fontFamily: 'Crimson Pro, serif', fontSize: '15px', color: '#7a6b4f', lineHeight: 1.75 }}>
            Every event in this explorer is traced to its primary source — either a scriptural passage in Luke–Acts or an independent external witness. This page presents the full attestation framework, including the external sources that provide chronological anchors for the Acts narrative.
          </p>
        </div>

        <Divider />

        {/* Scripture sources */}
        <section>
          <SectionHeader label="I. SCRIPTURAL WITNESSES" />
          <p style={{ fontFamily: 'Crimson Pro, serif', fontSize: '13.5px', color: '#7a6b4f', lineHeight: 1.7, marginBottom: 14 }}>
            The primary source for all events in this dataset is the Acts of the Apostles, written by Luke c. 60–80 AD, alongside the Pauline letters which provide autobiographical cross-checks.
          </p>
          <div className="space-y-2">
            {SCRIPTURE_BOOKS.map((book) => {
              const relevant = scriptural.filter((s) => s.reference.startsWith(book));
              if (!relevant.length) return null;
              return (
                <div
                  key={book}
                  className="px-4 py-3 rounded-sm"
                  style={{ background: '#1a1510', border: '1px solid rgba(201,146,42,0.12)' }}
                >
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: '12px', color: '#c8b07a', marginBottom: 6 }}>
                    {book}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {relevant.map((s) => (
                      <span
                        key={s.reference}
                        className="px-2 py-0.5 rounded-sm"
                        style={{ fontFamily: 'JetBrains Mono', fontSize: '9.5px', color: '#4a8a6a', border: '1px solid rgba(74,138,106,0.25)', background: 'rgba(74,138,106,0.06)' }}
                      >
                        {s.reference}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <Divider />

        {/* Extra-biblical authors */}
        <section>
          <SectionHeader label="II. EXTRA-BIBLICAL WITNESSES" />
          <p style={{ fontFamily: 'Crimson Pro, serif', fontSize: '13.5px', color: '#7a6b4f', lineHeight: 1.7, marginBottom: 14 }}>
            External authors and documents that provide independent attestation, chronological anchors, or cultural context for events and figures mentioned in Acts.
          </p>
          <div className="space-y-4">
            {EXTRABIBLICAL_AUTHORS.map((author) => (
              <div
                key={author.name}
                className="px-4 py-4 rounded-sm"
                style={{ background: '#1a1510', border: '1px solid rgba(90,122,154,0.2)' }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: '13.5px', color: '#c8b07a', fontWeight: 600 }}>
                    {author.name}
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9.5px', color: '#5a7a9a', flexShrink: 0 }}>
                    {author.dates}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {author.works.map((w) => (
                    <span
                      key={w}
                      className="px-2 py-0.5 rounded-sm"
                      style={{ fontFamily: 'JetBrains Mono', fontSize: '8.5px', color: '#5a7a9a', border: '1px solid rgba(90,122,154,0.25)', fontStyle: 'italic' }}
                    >
                      {w}
                    </span>
                  ))}
                </div>
                <p style={{ fontFamily: 'Crimson Pro, serif', fontSize: '13px', color: '#7a6b4f', lineHeight: 1.7 }}>
                  {author.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* Inscriptions */}
        <section>
          <SectionHeader label="III. INSCRIPTIONS & ARCHAEOLOGICAL EVIDENCE" />
          <p style={{ fontFamily: 'Crimson Pro, serif', fontSize: '13.5px', color: '#7a6b4f', lineHeight: 1.7, marginBottom: 14 }}>
            Physical artifacts that corroborate or date events in Acts. Of particular chronological importance is the Gallio Inscription.
          </p>
          <div className="space-y-4">
            {INSCRIPTIONS.map((ins) => (
              <div
                key={ins.name}
                className="px-4 py-4 rounded-sm"
                style={{ background: '#1a1510', border: '1px solid rgba(138,122,69,0.25)' }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: '13px', color: '#c8b07a', fontWeight: 600 }}>
                    {ins.name}
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9.5px', color: '#8a7a45', flexShrink: 0 }}>
                    {ins.date}
                  </span>
                </div>
                <p style={{ fontFamily: 'Crimson Pro, serif', fontSize: '13px', color: '#7a6b4f', lineHeight: 1.7, marginBottom: 6 }}>
                  {ins.significance}
                </p>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#5a4a30' }}>
                  Location: {ins.location}
                </div>
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* Certainty framework */}
        <section>
          <SectionHeader label="IV. CERTAINTY CLASSIFICATION FRAMEWORK" />
          <div className="space-y-3">
            {[
              { level: 'Historically Fixed', symbol: '◆', color: '#4a8a6a', description: 'Supported by epigraphic, numismatic, or astronomical evidence that synchronizes with external chronology (e.g., the Gallio Inscription for the Corinthian ministry; Josephus\'s death date for Agrippa I anchoring James\'s martyrdom to 44 AD).' },
              { level: 'Scholarly Consensus', symbol: '◇', color: '#c9922a', description: 'Dates derived from relative chronology, comparative analysis of Paul\'s letters, and general agreement among specialists in NT chronology (e.g., Riesner, Jewett, Hemer). Wide consensus exists but precise year is uncertain by 1–3 years.' },
              { level: 'Speculative', symbol: '○', color: '#7a6b4f', description: 'Dates or interpretations where scholarly opinion is significantly divided. Multiple plausible readings of the evidence exist. Used sparingly; events with genuine epigraphic or literary anchor points are not labeled speculative.' },
            ].map((c) => (
              <div key={c.level} className="flex gap-4 px-4 py-3 rounded-sm" style={{ background: '#1a1510', border: `1px solid ${c.color}22` }}>
                <span style={{ fontSize: '18px', color: c.color, flexShrink: 0, marginTop: 2 }}>{c.symbol}</span>
                <div>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: '12px', color: c.color, marginBottom: 4 }}>{c.level}</div>
                  <p style={{ fontFamily: 'Crimson Pro, serif', fontSize: '13px', color: '#7a6b4f', lineHeight: 1.6 }}>{c.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="h-8" />
      </div>
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '13px', color: '#c9922a', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
        {label}
      </h2>
      <div className="flex-1 border-t border-border" />
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 border-t border-border" />
      <span style={{ color: '#c9922a', fontSize: '10px', opacity: 0.35, letterSpacing: '0.2em' }}>✦ ✦ ✦</span>
      <div className="flex-1 border-t border-border" />
    </div>
  );
}

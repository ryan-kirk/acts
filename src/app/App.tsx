function App() {
  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Bible Time &amp; Place Explorer</p>
        <h1>Scripture, geography, and chronology in one source-grounded workspace.</h1>
        <p className="lede">
          This project is building a trustworthy explorer for biblical events across
          time, place, people, and sources. The first dataset will focus on the Book
          of Acts before expanding into Luke and additional historical material.
        </p>
      </section>

      <section className="status-grid" aria-label="Current application status">
        <article className="panel">
          <h2>Current Phase</h2>
          <p>
            Phase 0 establishes the smallest useful application scaffold: a strict
            TypeScript React app, a verified test harness, and a clean foundation for
            future data validation work.
          </p>
        </article>

        <article className="panel">
          <h2>First Dataset</h2>
          <p>
            The first modeled dataset will focus on Acts so the application can grow
            from a concrete set of events, places, people, and missionary journeys.
          </p>
        </article>

        <article className="panel">
          <h2>Why It Matters</h2>
          <p>
            Every visible claim should eventually be traceable to a source citation,
            with clear handling for uncertainty, approximations, and later external
            historical claims.
          </p>
        </article>
      </section>
    </main>
  );
}

export default App;

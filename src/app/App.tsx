import { ExplorerShell } from "./ExplorerShell";
import { actsDatasetLoadState, type DatasetLoadState } from "./bootstrapActsDataset";

export interface AppProps {
  loadState?: DatasetLoadState;
}

function App({ loadState = actsDatasetLoadState }: AppProps) {
  if (loadState.status === "error") {
    return (
      <main className="app-shell">
        <section className="error-panel">
          <p className="eyebrow">Dataset Unavailable</p>
          <h1>The Acts explorer could not start from the canonical dataset.</h1>
          <p className="lede">
            Validation failed before rendering, so the app is showing the problem
            directly instead of silently dropping records or crashing in the UI.
          </p>
          <pre className="error-message">{loadState.message}</pre>
        </section>
      </main>
    );
  }

  return <ExplorerShell dataset={loadState.dataset} />;
}

export default App;

import { ExplorerShell } from "./ExplorerShell";
import {
  explorerDatasetLoadState,
  type ExplorerDatasetLoadState
} from "./bootstrapExplorerDataset";

export interface AppProps {
  loadState?: ExplorerDatasetLoadState;
}

function App({ loadState = explorerDatasetLoadState }: AppProps) {
  if (loadState.status === "error") {
    return (
      <main className="app-shell">
        <section className="error-panel">
          <p className="eyebrow">Dataset Unavailable</p>
          <h1>The Luke-Acts explorer could not start from the canonical datasets.</h1>
          <p className="lede">
            Validation failed before rendering, so the app is showing the problem
            directly instead of silently dropping records or crashing in the UI.
          </p>
          <pre className="error-message">{loadState.message}</pre>
        </section>
      </main>
    );
  }

  return (
    <ExplorerShell
      dataset={loadState.library.dataset}
      provenance={loadState.library.provenance}
    />
  );
}

export default App;

import { explorerViews, type ExplorerView } from "../domain/events";

interface ViewNavigationProps {
  activeView: ExplorerView;
  onViewChange: (view: ExplorerView) => void;
}

export function ViewNavigation({ activeView, onViewChange }: ViewNavigationProps) {
  return (
    <div className="view-navigation" role="tablist" aria-label="Explorer views">
      {explorerViews.map((view) => (
        <button
          key={view.id}
          type="button"
          role="tab"
          aria-selected={view.id === activeView}
          className={`view-tab ${view.id === activeView ? "is-active" : ""}`}
          onClick={() => onViewChange(view.id)}
        >
          <span className="view-tab-label">{view.label}</span>
          <span className="view-tab-description">{view.description}</span>
        </button>
      ))}
    </div>
  );
}

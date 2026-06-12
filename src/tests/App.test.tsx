import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("leaflet", async () => await import("../test/leafletMock"));

import App from "../app/App";
import { getLeafletMockState, resetLeafletMockState } from "../test/leafletMock";

describe("App", () => {
  beforeEach(() => {
    resetLeafletMockState();
  });

  it("renders the explorer shell from the canonical Luke-Acts library", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: /luke-acts explorer with shared navigation, filtering, and synchronized context/i
      })
    ).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: /event rail/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ascension of jesus/i })).toBeInTheDocument();
    expect(screen.getAllByText(/scope: acts/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/luke preview: 9 events/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /focus luke/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^luke$/i })).toBeInTheDocument();
  });

  it("keeps the selected event when switching views", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /shipwreck on malta/i }));

    const inspector = screen.getByLabelText(/selected event details/i);

    expect(within(inspector).getByRole("heading", { name: /shipwreck on malta/i }))
      .toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: /map/i }));
    fireEvent.click(screen.getByRole("tab", { name: /sources/i }));

    expect(within(inspector).getByRole("heading", { name: /shipwreck on malta/i }))
      .toBeInTheDocument();
    expect(screen.getByText(/source-backed events in view/i)).toBeInTheDocument();
  });

  it("renders source-grounded inspector context for the selected event", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /shipwreck on malta/i }));

    const inspector = screen.getByLabelText(/selected event details/i);

    expect(within(inspector).getByRole("heading", { name: /chronology note/i }))
      .toBeInTheDocument();
    expect(within(inspector).getByText(/best-fit year or short range/i)).toBeInTheDocument();
    expect(within(inspector).getByRole("heading", { name: /place context/i }))
      .toBeInTheDocument();
    expect(within(inspector).getAllByText(/traditional/i).length).toBeGreaterThan(0);
    expect(within(inspector).getByRole("heading", { name: /source support/i }))
      .toBeInTheDocument();
    expect(within(inspector).getAllByText(/scripture/i).length).toBeGreaterThan(0);
  });

  it("renders the default Acts-focused timeline in chronological order", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("tab", { name: /timeline/i }));

    const timeline = screen.getByLabelText(/scripture timeline/i);
    const eventItems = within(timeline).getAllByRole("listitem");

    expect(eventItems[0]).toHaveTextContent(/ascension of jesus/i);
    expect(eventItems[1]).toHaveTextContent(/selection of matthias/i);
    expect(eventItems[2]).toHaveTextContent(/pentecost/i);
    expect(eventItems[eventItems.length - 1]).toHaveTextContent(
      /paul under house arrest in rome/i
    );
  });

  it("filters the timeline and lets timeline selection update the inspector", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("tab", { name: /timeline/i }));

    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: "mission_journey" }
    });
    fireEvent.change(screen.getByLabelText(/^person$/i), {
      target: { value: "paul" }
    });
    fireEvent.change(screen.getByLabelText(/^place$/i), {
      target: { value: "philippi" }
    });
    fireEvent.change(screen.getByLabelText(/certainty/i), {
      target: { value: "estimated" }
    });
    fireEvent.change(screen.getByLabelText(/start year/i), {
      target: { value: "50" }
    });
    fireEvent.change(screen.getByLabelText(/end year/i), {
      target: { value: "51" }
    });

    const timeline = screen.getByLabelText(/scripture timeline/i);

    expect(within(timeline).getByRole("button", { name: /philippian jailer converted/i }))
      .toBeInTheDocument();
    expect(
      within(timeline).queryByRole("button", { name: /mars hill address/i })
    ).not.toBeInTheDocument();

    fireEvent.click(
      within(timeline).getByRole("button", { name: /philippian jailer converted/i })
    );

    const inspector = screen.getByLabelText(/selected event details/i);
    expect(
      within(inspector).getByRole("heading", { name: /philippian jailer converted/i })
    ).toBeInTheDocument();
    expect(within(inspector).getByText(/acts 16:22-34/i)).toBeInTheDocument();
  });

  it("lets related event links update the inspector", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /shipwreck on malta/i }));

    const inspector = screen.getByLabelText(/selected event details/i);

    fireEvent.click(
      within(inspector).getAllByRole("button", { name: /paul under house arrest in rome/i })[0]!
    );

    expect(
      within(inspector).getByRole("heading", { name: /paul under house arrest in rome/i })
    ).toBeInTheDocument();
    expect(within(inspector).getByText(/acts 28:16-31/i)).toBeInTheDocument();
  });

  it("lets person, place, and source actions open focused explorer surfaces", () => {
    render(<App />);

    const inspector = screen.getByLabelText(/selected event details/i);

    fireEvent.click(
      within(inspector).getByRole("button", { name: /open person focus for jesus christ/i })
    );
    expect(screen.getByLabelText(/scripture people explorer/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /jesus christ/i })).toBeInTheDocument();
    expect(screen.getAllByText(/risen lord/i).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /shipwreck on malta/i }));

    fireEvent.click(
      within(inspector).getByRole("button", { name: /open place focus for malta/i })
    );
    expect(screen.getAllByText(/mediterranean/i).length).toBeGreaterThan(0);

    fireEvent.click(
      within(inspector).getByRole("button", { name: /open source focus for book of acts/i })
    );
    expect(screen.getByText(/source-backed events in view/i)).toBeInTheDocument();
    expect(screen.getAllByText(/not applicable/i)[0]).toBeInTheDocument();
  });

  it("supports people search and cross-record navigation from biographical detail", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("tab", { name: /people/i }));

    const peopleExplorer = screen.getByLabelText(/scripture people explorer/i);

    fireEvent.change(within(peopleExplorer).getByLabelText(/search people/i), {
      target: { value: "Cornelius" }
    });

    fireEvent.click(within(peopleExplorer).getByRole("button", { name: /cornelius/i }));

    expect(within(peopleExplorer).getByRole("heading", { name: /cornelius/i }))
      .toBeInTheDocument();
    expect(within(peopleExplorer).getAllByText(/roman centurion/i).length).toBeGreaterThan(0);

    fireEvent.click(
      within(peopleExplorer).getByRole("button", { name: /conversion of cornelius/i })
    );

    const inspector = screen.getByLabelText(/selected event details/i);

    expect(
      within(inspector).getByRole("heading", { name: /conversion of cornelius/i })
    ).toBeInTheDocument();
    expect(within(peopleExplorer).getByRole("heading", { name: /cornelius/i }))
      .toBeInTheDocument();

    fireEvent.click(within(peopleExplorer).getByRole("button", { name: /open person focus/i }));

    expect(within(peopleExplorer).getByRole("heading", { name: /^peter$/i }))
      .toBeInTheDocument();
    expect(within(peopleExplorer).getAllByText(/apostle/i).length).toBeGreaterThan(0);
  });

  it("filters the event rail by location and keeps filtering deterministic", () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText(/search events/i), {
      target: { value: "Malta" }
    });

    expect(screen.getByRole("button", { name: /shipwreck on malta/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /ascension of jesus/i })
    ).not.toBeInTheDocument();
  });

  it("switches the explorer to Luke and updates the rail, timeline, and inspector context", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /focus luke/i }));

    expect(screen.getByRole("button", { name: /annunciation to mary/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /shipwreck on malta/i })
    ).not.toBeInTheDocument();

    const inspector = screen.getByLabelText(/selected event details/i);
    expect(within(inspector).getByText(/^luke$/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: /timeline/i }));

    const timeline = screen.getByLabelText(/scripture timeline/i);
    expect(within(timeline).getByText(/luke chronology/i)).toBeInTheDocument();
    expect(within(timeline).getByRole("button", { name: /birth of jesus in bethlehem/i }))
      .toBeInTheDocument();
  });

  it("renders external claims in the inspector without replacing canonical event detail", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /arrest of paul in jerusalem/i }));

    const inspector = screen.getByLabelText(/selected event details/i);

    expect(
      within(inspector).getByRole("heading", { name: /external attestation & claims/i })
    ).toBeInTheDocument();
    expect(
      within(inspector).getByText(/temple warning inscription gives concrete archaeological context/i)
    ).toBeInTheDocument();
    expect(
      within(inspector).getByRole("button", { name: /temple warning inscription/i })
    ).toBeInTheDocument();
    expect(within(inspector).getByRole("heading", { name: /arrest of paul in jerusalem/i }))
      .toBeInTheDocument();
  });

  it("renders the sources explorer with grouped witnesses, claims, and rights transparency", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /mars hill address/i }));
    fireEvent.click(screen.getByRole("tab", { name: /sources/i }));

    const sourcesExplorer = screen.getByLabelText(/scripture sources explorer/i);

    expect(
      within(sourcesExplorer).getByRole("heading", { name: /sources & attestation/i })
    ).toBeInTheDocument();
    expect(
      within(sourcesExplorer).getByRole("heading", { name: /scriptural witnesses/i })
    ).toBeInTheDocument();
    expect(
      within(sourcesExplorer).getByRole("heading", {
        name: /historical & scholarly witnesses/i
      })
    ).toBeInTheDocument();
    expect(within(sourcesExplorer).getByRole("heading", { name: /claims in view/i }))
      .toBeInTheDocument();
    expect(
      within(sourcesExplorer).getByText(
        /the gallio inscription provides the strongest fixed chronological anchor/i
      )
    ).toBeInTheDocument();

    fireEvent.click(
      within(sourcesExplorer).getAllByRole("button", { name: /gallio inscription/i })[0]!
    );

    expect(within(sourcesExplorer).getAllByText(/cleared/i).length).toBeGreaterThan(0);
    expect(
      within(sourcesExplorer).getAllByText(
        /delphi inscription, fouilles de delphes iii 4:286/i
      ).length
    ).toBeGreaterThan(0);
  });

  it("renders the map explorer controls, legend, and default place context", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("tab", { name: /map/i }));

    const mapExplorer = screen.getByLabelText(/scripture map explorer/i);

    expect(within(mapExplorer).getByRole("button", { name: /satellite/i }))
      .toBeInTheDocument();
    expect(within(mapExplorer).getByRole("button", { name: /topographic/i }))
      .toBeInTheDocument();
    expect(within(mapExplorer).getByRole("button", { name: /traditional/i }))
      .toBeInTheDocument();
    expect(within(mapExplorer).getByText(/validated places visible/i)).toBeInTheDocument();
    expect(within(mapExplorer).getByText(/marker tones reflect place certainty/i))
      .toBeInTheDocument();
    expect(within(mapExplorer).getByText(/event types/i)).toBeInTheDocument();
    expect(within(mapExplorer).getByRole("heading", { name: /first missionary journey/i }))
      .toBeInTheDocument();
    expect(within(mapExplorer).getByRole("heading", { name: /jerusalem/i }))
      .toBeInTheDocument();

    expect(getLeafletMockState().markers.length).toBeGreaterThan(0);
    expect(getLeafletMockState().polylines).toHaveLength(4);
  });

  it("lets overview claim-confidence controls filter shared claim surfaces", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /low \(2\)/i }));
    fireEvent.click(screen.getByRole("button", { name: /arrest of paul in jerusalem/i }));

    const inspector = screen.getByLabelText(/selected event details/i);

    expect(
      within(inspector).getByText(/no external claims for this event match the current confidence lens/i)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: /sources/i }));

    const sourcesExplorer = screen.getByLabelText(/scripture sources explorer/i);

    expect(within(sourcesExplorer).getByText(/2 claims in view/i)).toBeInTheDocument();
    expect(
      within(sourcesExplorer).queryByText(
        /the gallio inscription provides the strongest fixed chronological anchor/i
      )
    ).not.toBeInTheDocument();
  });

  it("lets journey visibility toggles hide unrelated routes without breaking the active focus", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("tab", { name: /map/i }));

    const mapExplorer = screen.getByLabelText(/scripture map explorer/i);
    const romeVoyageToggle = within(mapExplorer).getByRole("button", { name: /rome voyage/i });
    const map = getLeafletMockState().maps[0]!;
    const romeVoyageOverlay = getLeafletMockState().polylines[3]!;

    expect(romeVoyageToggle).toHaveAttribute("aria-pressed", "true");
    expect(within(mapExplorer).getByRole("heading", { name: /first missionary journey/i }))
      .toBeInTheDocument();

    fireEvent.click(romeVoyageToggle);

    expect(romeVoyageToggle).toHaveAttribute("aria-pressed", "false");
    expect(map.hasLayer(romeVoyageOverlay)).toBe(false);
    expect(within(mapExplorer).getByRole("heading", { name: /first missionary journey/i }))
      .toBeInTheDocument();

    fireEvent.click(romeVoyageToggle);

    expect(romeVoyageToggle).toHaveAttribute("aria-pressed", "true");
  });

  it("lets route selection drive journey detail, place focus, and shared event selection", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("tab", { name: /map/i }));

    const mapExplorer = screen.getByLabelText(/scripture map explorer/i);
    const secondJourneyOverlay = getLeafletMockState().polylines[1];

    expect(secondJourneyOverlay).toBeDefined();

    act(() => {
      secondJourneyOverlay!.fire("click");
    });

    expect(within(mapExplorer).getByRole("heading", { name: /second missionary journey/i }))
      .toBeInTheDocument();
    expect(within(mapExplorer).getByText(/4 stop/i)).toBeInTheDocument();

    fireEvent.click(within(mapExplorer).getByRole("button", { name: /2\. philippi/i }));

    expect(within(mapExplorer).getByRole("heading", { name: /philippi/i })).toBeInTheDocument();

    const inspector = screen.getByLabelText(/selected event details/i);
    expect(
      within(inspector).getByRole("heading", { name: /philippian jailer converted/i })
    ).toBeInTheDocument();

    fireEvent.click(
      within(mapExplorer).getAllByRole("button", { name: /mars hill address/i })[1]!
    );

    expect(within(inspector).getByRole("heading", { name: /mars hill address/i }))
      .toBeInTheDocument();
    expect(within(mapExplorer).getByRole("heading", { name: /second missionary journey/i }))
      .toBeInTheDocument();
  });

  it("keeps map markers, controls, and shared inspector state synchronized", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("tab", { name: /map/i }));

    const { maps, markers, polylines } = getLeafletMockState();
    const mapInstance = maps[0];
    const maltaMarker = markers.find(
      (marker) => marker.latlng[0] === 35.9375 && marker.latlng[1] === 14.3754
    );
    const firstJourneyOverlay = polylines[0];

    expect(mapInstance).toBeDefined();
    expect(maltaMarker).toBeDefined();
    expect(firstJourneyOverlay).toBeDefined();

    act(() => {
      maltaMarker!.fire("click");
    });

    const inspector = screen.getByLabelText(/selected event details/i);

    expect(within(inspector).getByRole("heading", { name: /shipwreck on malta/i }))
      .toBeInTheDocument();
    expect(
      within(screen.getByLabelText(/scripture map explorer/i)).getByRole("heading", {
        name: /malta/i
      })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /topographic/i }));
    expect(screen.getByText(/basemap: topographic/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^first$/i }));
    expect(mapInstance!.hasLayer(firstJourneyOverlay!)).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: /traditional/i }));
    await waitFor(() => {
      expect(mapInstance!.hasLayer(maltaMarker!)).toBe(false);
    });
  });

  it("keeps the same map instance when event selection changes on the map view", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("tab", { name: /map/i }));

    const firstMapInstance = getLeafletMockState().maps[0];

    expect(getLeafletMockState().maps).toHaveLength(1);
    expect(firstMapInstance).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: /shipwreck on malta/i }));

    const inspector = screen.getByLabelText(/selected event details/i);

    expect(within(inspector).getByRole("heading", { name: /shipwreck on malta/i }))
      .toBeInTheDocument();
    expect(getLeafletMockState().maps).toHaveLength(1);
    expect(firstMapInstance?.removed).toBe(false);
  });

  it("shows a clear failure state when dataset bootstrap fails", () => {
    render(
      <App
        loadState={{
          status: "error",
          message: "events.0.location_id: Unknown location_id"
        }}
      />
    );

    expect(
      screen.getByRole("heading", {
        name: /the luke-acts explorer could not start from the canonical datasets/i
      })
    ).toBeInTheDocument();

    expect(screen.getByText(/unknown location_id/i)).toBeInTheDocument();
  });
});

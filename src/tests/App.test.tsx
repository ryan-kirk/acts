import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("leaflet", async () => await import("../test/leafletMock"));

import App from "../app/App";
import { getLeafletMockState, resetLeafletMockState } from "../test/leafletMock";

describe("App", () => {
  beforeEach(() => {
    resetLeafletMockState();
  });

  it("renders the explorer shell from the canonical Acts dataset", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: /acts explorer with shared navigation, filtering, and a real chronology view/i
      })
    ).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: /event rail/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ascension of jesus/i })).toBeInTheDocument();
    expect(screen.getByText(/book of acts canonical dataset/i)).toBeInTheDocument();
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
    expect(screen.getByText(/source-backed acts events/i)).toBeInTheDocument();
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

  it("renders the Acts timeline in chronological order", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("tab", { name: /timeline/i }));

    const timeline = screen.getByLabelText(/acts timeline/i);
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

    const timeline = screen.getByLabelText(/acts timeline/i);

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
      within(inspector).getByRole("button", { name: /paul under house arrest in rome/i })
    );

    expect(
      within(inspector).getByRole("heading", { name: /paul under house arrest in rome/i })
    ).toBeInTheDocument();
    expect(within(inspector).getByText(/acts 28:16-31/i)).toBeInTheDocument();
  });

  it("lets person, place, and source actions open focused preview surfaces", () => {
    render(<App />);

    const inspector = screen.getByLabelText(/selected event details/i);

    fireEvent.click(
      within(inspector).getByRole("button", { name: /open person focus for jesus christ/i })
    );
    expect(screen.getAllByText(/risen lord/i).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /shipwreck on malta/i }));

    fireEvent.click(
      within(inspector).getByRole("button", { name: /open place focus for malta/i })
    );
    expect(screen.getAllByText(/mediterranean/i).length).toBeGreaterThan(0);

    fireEvent.click(
      within(inspector).getByRole("button", { name: /open source focus for book of acts/i })
    );
    expect(screen.getByText(/source-backed acts events/i)).toBeInTheDocument();
    expect(screen.getAllByText(/not_applicable/i)[0]).toBeInTheDocument();
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

  it("renders the map explorer controls, legend, and default place context", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("tab", { name: /map/i }));

    const mapExplorer = screen.getByLabelText(/acts map explorer/i);

    expect(within(mapExplorer).getByRole("button", { name: /satellite/i }))
      .toBeInTheDocument();
    expect(within(mapExplorer).getByRole("button", { name: /topographic/i }))
      .toBeInTheDocument();
    expect(within(mapExplorer).getByRole("button", { name: /traditional/i }))
      .toBeInTheDocument();
    expect(within(mapExplorer).getByText(/validated places visible/i)).toBeInTheDocument();
    expect(
      within(mapExplorer).getByText(
        /marker fill and edge styles stay tied to canonical place records/i
      )
    ).toBeInTheDocument();
    expect(within(mapExplorer).getByRole("heading", { name: /jerusalem/i }))
      .toBeInTheDocument();

    expect(getLeafletMockState().markers.length).toBeGreaterThan(0);
    expect(getLeafletMockState().polylines).toHaveLength(3);
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
      within(screen.getByLabelText(/acts map explorer/i)).getByRole("heading", {
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
        name: /the acts explorer could not start from the canonical dataset/i
      })
    ).toBeInTheDocument();

    expect(screen.getByText(/unknown location_id/i)).toBeInTheDocument();
  });
});

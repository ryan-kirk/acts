import { fireEvent, render, screen, within } from "@testing-library/react";

import App from "../app/App";

describe("App", () => {
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

  it("keeps the selected event when switching views", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /shipwreck on malta/i }));

    const inspector = screen.getByLabelText(/selected event details/i);

    expect(within(inspector).getByRole("heading", { name: /shipwreck on malta/i }))
      .toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: /map/i }));
    fireEvent.click(screen.getByRole("tab", { name: /sources/i }));

    expect(within(inspector).getByRole("heading", { name: /shipwreck on malta/i }))
      .toBeInTheDocument();
    expect(screen.getByText(/phase 11 will widen this into a source explorer/i))
      .toBeInTheDocument();
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
  });

  it("filters the event rail by location and keeps filtering deterministic", async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText(/search events/i), {
      target: { value: "Malta" }
    });

    expect(screen.getByRole("button", { name: /shipwreck on malta/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /ascension of jesus/i })
    ).not.toBeInTheDocument();
  });

  it("shows a clear failure state when dataset bootstrap fails", () => {
    render(<App loadState={{ status: "error", message: "events.0.location_id: Unknown location_id" }} />);

    expect(
      screen.getByRole("heading", {
        name: /the acts explorer could not start from the canonical dataset/i
      })
    ).toBeInTheDocument();

    expect(screen.getByText(/unknown location_id/i)).toBeInTheDocument();
  });
});

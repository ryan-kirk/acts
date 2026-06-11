import { fireEvent, render, screen, within } from "@testing-library/react";

import App from "../app/App";

describe("App", () => {
  it("renders the explorer shell from the canonical Acts dataset", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: /acts explorer shell with shared navigation and validated data bootstrap/i
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

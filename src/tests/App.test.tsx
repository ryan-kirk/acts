import { render, screen } from "@testing-library/react";

import App from "../app/App";

describe("App", () => {
  it("renders the landing page with the Acts focus", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: /scripture, geography, and chronology in one source-grounded workspace/i
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/the first dataset will focus on the book of acts/i)
    ).toBeInTheDocument();
  });
});

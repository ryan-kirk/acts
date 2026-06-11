import { describe, expect, it } from "vitest";

import { buildDatasetIndex, filterEventsByQuery, sortEventsChronologically } from "../domain/events";
import { createValidDataset } from "./fixtures/datasetFixtures";

describe("events domain helpers", () => {
  it("sorts events deterministically by date then title", () => {
    const dataset = createValidDataset();
    dataset.events = [
      {
        ...dataset.events[0]!,
        id: "acts_010",
        title: "Later Event",
        date: {
          start_year: 50,
          end_year: 50,
          certainty: "estimated"
        }
      },
      {
        ...dataset.events[0]!,
        id: "acts_009",
        title: "Earlier Event",
        date: {
          start_year: 30,
          end_year: 30,
          certainty: "estimated"
        }
      },
      {
        ...dataset.events[0]!,
        id: "acts_011",
        title: "Earlier Event B",
        date: {
          start_year: 30,
          end_year: 30,
          certainty: "estimated"
        }
      }
    ];

    const sortedEvents = sortEventsChronologically(dataset.events);

    expect(sortedEvents.map((event) => event.id)).toEqual([
      "acts_009",
      "acts_011",
      "acts_010"
    ]);
  });

  it("filters events by location, participant, and citation text", () => {
    const dataset = createValidDataset();
    const datasetIndex = buildDatasetIndex(dataset);

    expect(filterEventsByQuery(dataset.events, "Jerusalem", datasetIndex)).toHaveLength(1);
    expect(filterEventsByQuery(dataset.events, "Peter", datasetIndex)).toHaveLength(1);
    expect(filterEventsByQuery(dataset.events, "Acts 1:1-11", datasetIndex)).toHaveLength(1);
  });
});

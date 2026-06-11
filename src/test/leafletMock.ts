type LayerType = MockTileLayer | MockCircleMarker | MockPolyline;

export interface MockMap {
  container: HTMLElement;
  layers: Set<LayerType>;
  options: Record<string, unknown>;
  panes: Record<string, { style: Record<string, string> }>;
  removed: boolean;
  lastFitBounds: unknown;
  lastFlyTo: unknown;
  getPane: (name: string) => { style: Record<string, string> };
  hasLayer: (layer: LayerType) => boolean;
  removeLayer: (layer: LayerType) => MockMap;
  fitBounds: (bounds: unknown, options?: unknown) => MockMap;
  invalidateSize: () => MockMap;
  remove: () => void;
  flyTo: (latlng: [number, number], zoom: number, options?: unknown) => MockMap;
}

export interface MockTileLayer {
  kind: "tile";
  map: MockMap | null;
  options: Record<string, unknown>;
  url: string;
  addTo: (map: MockMap) => MockTileLayer;
}

export interface MockCircleMarker {
  kind: "marker";
  currentStyle: Record<string, unknown>;
  handlers: Record<string, () => void>;
  latlng: [number, number];
  map: MockMap | null;
  options: Record<string, unknown>;
  addTo: (map: MockMap) => MockCircleMarker;
  fire: (eventName: string) => void;
  on: (eventName: string, handler: () => void) => MockCircleMarker;
  setStyle: (nextStyle: Record<string, unknown>) => MockCircleMarker;
}

export interface MockPolyline {
  kind: "polyline";
  color: string | null;
  currentStyle: Record<string, unknown>;
  handlers: Record<string, () => void>;
  map: MockMap | null;
  options: Record<string, unknown>;
  points: Array<[number, number]>;
  addTo: (map: MockMap) => MockPolyline;
  fire: (eventName: string) => void;
  on: (eventName: string, handler: () => void) => MockPolyline;
  setStyle: (nextStyle: Record<string, unknown>) => MockPolyline;
}

interface LeafletMockState {
  maps: MockMap[];
  markers: MockCircleMarker[];
  polylines: MockPolyline[];
  tileLayers: MockTileLayer[];
}

const state: LeafletMockState = {
  maps: [],
  markers: [],
  polylines: [],
  tileLayers: []
};

function attachLayerToMap<T extends LayerType>(map: MockMap, layer: T): T {
  map.layers.add(layer);
  layer.map = map;
  return layer;
}

function createMockMap(container: HTMLElement, options: Record<string, unknown>): MockMap {
  return {
    container,
    options,
    panes: {
      tilePane: {
        style: {}
      }
    },
    layers: new Set<LayerType>(),
    removed: false,
    lastFitBounds: null,
    lastFlyTo: null,
    getPane(name: string) {
      if (!this.panes[name]) {
        this.panes[name] = {
          style: {}
        };
      }

      return this.panes[name]!;
    },
    hasLayer(layer: LayerType) {
      return this.layers.has(layer);
    },
    removeLayer(layer: LayerType) {
      this.layers.delete(layer);
      if (layer.map === this) {
        layer.map = null;
      }
      return this;
    },
    fitBounds(bounds: unknown, fitOptions?: unknown) {
      this.lastFitBounds = {
        bounds,
        options: fitOptions ?? null
      };
      return this;
    },
    invalidateSize() {
      return this;
    },
    remove() {
      this.removed = true;
      this.layers.clear();
    },
    flyTo(latlng: [number, number], zoom: number, flyOptions?: unknown) {
      this.lastFlyTo = {
        latlng,
        zoom,
        options: flyOptions ?? null
      };
      return this;
    }
  };
}

function createMockTileLayer(url: string, options: Record<string, unknown>): MockTileLayer {
  return {
    kind: "tile",
    url,
    options,
    map: null,
    addTo(map: MockMap) {
      return attachLayerToMap(map, this);
    }
  };
}

function createMockCircleMarker(
  latlng: [number, number],
  options: Record<string, unknown>
): MockCircleMarker {
  return {
    kind: "marker",
    latlng,
    options,
    currentStyle: {
      ...options
    },
    handlers: {},
    map: null,
    addTo(map: MockMap) {
      return attachLayerToMap(map, this);
    },
    on(eventName: string, handler: () => void) {
      this.handlers[eventName] = handler;
      return this;
    },
    fire(eventName: string) {
      this.handlers[eventName]?.();
    },
    setStyle(nextStyle: Record<string, unknown>) {
      this.currentStyle = {
        ...this.currentStyle,
        ...nextStyle
      };
      return this;
    }
  };
}

function createMockPolyline(
  points: Array<[number, number]>,
  options: Record<string, unknown>
): MockPolyline {
  return {
    kind: "polyline",
    points,
    options,
    color: typeof options.color === "string" ? options.color : null,
    currentStyle: {
      ...options
    },
    handlers: {},
    map: null,
    addTo(map: MockMap) {
      return attachLayerToMap(map, this);
    },
    on(eventName: string, handler: () => void) {
      this.handlers[eventName] = handler;
      return this;
    },
    fire(eventName: string) {
      this.handlers[eventName]?.();
    },
    setStyle(nextStyle: Record<string, unknown>) {
      this.currentStyle = {
        ...this.currentStyle,
        ...nextStyle
      };
      return this;
    }
  };
}

export function getLeafletMockState(): LeafletMockState {
  return state;
}

export function resetLeafletMockState(): void {
  state.maps.length = 0;
  state.markers.length = 0;
  state.polylines.length = 0;
  state.tileLayers.length = 0;
}

const leafletMock = {
  map(container: HTMLElement, options: Record<string, unknown>) {
    const map = createMockMap(container, options);
    state.maps.push(map);
    return map;
  },
  tileLayer(url: string, options: Record<string, unknown>) {
    const tileLayer = createMockTileLayer(url, options);
    state.tileLayers.push(tileLayer);
    return tileLayer;
  },
  circleMarker(latlng: [number, number], options: Record<string, unknown>) {
    const marker = createMockCircleMarker(latlng, options);
    state.markers.push(marker);
    return marker;
  },
  polyline(points: Array<[number, number]>, options: Record<string, unknown>) {
    const polyline = createMockPolyline(points, options);
    state.polylines.push(polyline);
    return polyline;
  }
};

export default leafletMock;

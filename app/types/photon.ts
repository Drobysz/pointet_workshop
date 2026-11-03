export interface PhotonResponse {
    features: PhotonFeature[];
}

export interface PhotonFeature {
    type: "Feature";
    geometry: PhotonGeometry;
    properties: PhotonProperties;
}

export interface PhotonGeometry {
    type: "Point";

    /**
     * GeoJSON order:
     * [longitude, latitude]
     */
    coordinates: [number, number];
}

export interface PhotonProperties {
    // General
    name?: string;
    type?: string;

    // Address
    housenumber?: string;
    street?: string;
    postcode?: string;

    // Administrative divisions
    locality?: string;
    district?: string;
    city?: string;
    county?: string;
    state?: string;

    // Country
    country?: string;
    countrycode?: string;

    // OSM
    osm_key?: string;
    osm_value?: string;
    osm_type?: PhotonOsmType;
    osm_id?: number;

    /**
     * Bounding box:
     * [minLon, minLat, maxLon, maxLat]
     */
    extent?: [number, number, number, number];

    // Additional OSM tags when available
    extra?: Record<string, string>;
}

export type PhotonOsmType =
    | "N" // Node
    | "W" // Way
    | "R"; // Relation
import { PhotonFeature } from "@/types/photon";

export class Photon {
    static toAddressString(feature: PhotonFeature) {
        const { properties } = feature;

        return (
            [
                [
                    properties.housenumber, 
                    properties.street ?? properties.name
                ].filter(Boolean).join(" "),
                properties.city,
                properties.postcode,
                properties.country
            ].filter(Boolean).join(", ")
        )
    }
}

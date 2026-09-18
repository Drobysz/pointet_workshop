export type ServiceType =
    | "custom hand bag knitting"
    | "your furniture restoration";

export type ContactForm = {
    service: ServiceType,
    description: string;
};

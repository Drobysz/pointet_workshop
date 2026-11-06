import type { ApiResponse, Id } from "./api";

/** JSON body accepted by the public POST /seller/requests endpoint. */
export interface SellerRequestType {
    first_name: string;
    last_name: string;
    tel_number: string;
    country: string;
    email: string;
    brand_name: string;
    company_address: string;
    description_of_contact: string;
    description_of_brand: string;
    is_resident_of_eu: boolean;
}

export type SellerApplicationStatus = "processing" | "approved" | "declined";

export interface SellerApplication extends Omit<SellerRequestType, "is_resident_of_eu"> {
    id: Id;
    // The existing API resource uses camelCase in its response only.
    isResidentOfEU: boolean;
    status: SellerApplicationStatus;
    reviewed_at: string | null;
    response_message: string | null;
    created_at: string | null;
}

export type SellerRequestResponse = ApiResponse<SellerApplication>;

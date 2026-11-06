import type { Messages } from "next-intl";
import type { SellerRequestFormState } from "../types";

type SellerFormMessages = Messages["seller"]["form"];

export interface SellerFormField {
    name: keyof SellerRequestFormState;
    type: "text" | "tel" | "email" | "textarea" | "checkbox";
    labelKey: keyof SellerFormMessages["labels"];
    placeholderKey?: keyof SellerFormMessages["placeholders"];
    /** Example value, shown as is in every language. */
    placeholder?: string;
    autoComplete?: string;
}

export const sellerFormFields: readonly SellerFormField[] = [
    {
        name: "first_name",
        type: "text",
        labelKey: "firstName",
        placeholderKey: "firstName",
        autoComplete: "given-name",
    },
    {
        name: "last_name",
        type: "text",
        labelKey: "lastName",
        placeholderKey: "lastName",
        autoComplete: "family-name",
    },
    {
        name: "tel_number",
        type: "tel",
        labelKey: "phone",
        placeholder: "+33612345678",
        autoComplete: "tel",
    },
    {
        name: "country",
        type: "text",
        labelKey: "country",
        placeholderKey: "country",
        autoComplete: "country-name",
    },
    {
        name: "email",
        type: "email",
        labelKey: "email",
        placeholder: "brand@example.com",
        autoComplete: "email",
    },
    {
        name: "brand_name",
        type: "text",
        labelKey: "brandName",
        placeholderKey: "brandName",
        autoComplete: "organization",
    },
    {
        name: "company_address",
        type: "textarea",
        labelKey: "companyAddress",
        placeholderKey: "companyAddress",
        autoComplete: "street-address",
    },
    {
        name: "description_of_contact",
        type: "textarea",
        labelKey: "contactDetails",
        placeholderKey: "contactDetails",
    },
    {
        name: "description_of_brand",
        type: "textarea",
        labelKey: "aboutBrand",
        placeholderKey: "aboutBrand",
    },
    {
        name: "is_resident_of_eu",
        type: "checkbox",
        labelKey: "euResident",
    },
];

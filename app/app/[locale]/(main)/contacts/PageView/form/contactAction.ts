import { ContactFormScheme, FormState } from "./FormScheme";
import { MessageService } from "@/helpers";
import { z } from "zod";

export async function contactAction(_:FormState, formData: FormData) {
    const contactData = {
        service: formData.get("service"),
        description: formData.get("description"),
    };

    const parsed = ContactFormScheme.safeParse(contactData);

    if (!parsed.success) {
        const errors = z.flattenError(parsed.error).fieldErrors;

        return {
            errors: {
                service: errors.service?.[0],
                description: errors.description?.[0],
            },
            message: "A field was filled incorrectly"
        }
    }

    const url = MessageService.sendMessageWhatsapp(parsed.data);

    return {
        errors: {},
        success: true,
        message: "The link was successfully created",
        redirectLink: url,
    }
}

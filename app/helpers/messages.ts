import { ContactForm } from "@/types";

export class MessageService {
    static sendMessageWhatsapp (data: ContactForm) {
        const message = `
Добрый день,

Новый запрос с сайта pointet.com

Тип проекта: ${data.service}

Описание проекта:
${data.description}
        `.trim();

        const phone = "33699407991"
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        return url;
    }
}

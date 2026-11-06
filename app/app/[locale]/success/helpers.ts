import { PreorderPaymentStatus } from "@/api/types/preorder";

type StatusMessageKeys = {
    [Status in PreorderPaymentStatus]: {
        title: `status.${Status}.title`;
        body: `status.${Status}.body`;
    };
};

/** Keys of the `checkout` namespace describing each payment status. */
export const statusMessages = {
    pending: {
        title: "status.pending.title",
        body: "status.pending.body",
    },
    paid: {
        title: "status.paid.title",
        body: "status.paid.body",
    },
    failed: {
        title: "status.failed.title",
        body: "status.failed.body",
    },
    canceled: {
        title: "status.canceled.title",
        body: "status.canceled.body",
    },
    refunded: {
        title: "status.refunded.title",
        body: "status.refunded.body",
    },
} as const satisfies StatusMessageKeys;

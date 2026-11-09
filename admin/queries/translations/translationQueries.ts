import { requestBackend } from "@/helpers";
import type { ApiEntity, TranslatableKind, TranslationUsage } from "@/interface/domain";

export function getTranslationUsage() {
  return requestBackend<ApiEntity<TranslationUsage>>("/translations/usage");
}

/** Queues fresh automatic translations of a record; manual translations are kept. */
export function regenerateTranslations(kind: TranslatableKind, id: number) {
  return requestBackend<ApiEntity<{ queued: boolean }>>(
    `/translations/${kind}/${id}/regenerate`,
    { method: "POST" },
  );
}

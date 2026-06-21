import { useConfirm } from "@/hooks/useConfirm";
import { useCredits } from "@/lib/pricing";
import { useT } from "@/hooks/useI18n";

/**
 * Returns an async `confirmCost(taskType)` that pops a confirmation showing how many credits the
 * operation uses. Returns true for free operations (no prompt) or when the user confirms.
 */
export function useCostConfirm() {
  const confirm = useConfirm();
  const { creditFor } = useCredits();
  const t = useT();

  return async (taskType) => {
    const credits = creditFor(taskType);
    if (!credits) return true; // free / not loaded -> no prompt
    return confirm({
      title: t("confirm.title"),
      message: `${t("confirm.creditMsg")} ${credits} ${t("confirm.creditsUnit")}`,
      confirmLabel: t("confirm.proceed"),
      cancelLabel: t("confirm.cancel"),
    });
  };
}

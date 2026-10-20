import { useConfirm } from "@/hooks/useConfirm";
import { useCredits } from "@/lib/pricing";
import { useT } from "@/hooks/useI18n";
import { membershipApi } from "@/lib/authApi";

/** Operations Studio auto-chains into a second billed step (see Studio.jsx autoChaining). */
const NEXT_STEP = { FIGURE_PROTOTYPE: "FIGURE_BUILD" };

/**
 * Returns an async `confirmCost(taskType)` that pops a confirmation showing what the operation
 * costs: one of the FREE plan's lifetime uses, or credits on a paid plan. For a multi-step chain
 * (Chibi figurine) it also shows the whole chain's total up front. Returns true for free operations
 * (no prompt) or when the user confirms.
 */
export function useCostConfirm() {
  const confirm = useConfirm();
  const { creditFor } = useCredits();
  const t = useT();

  return async (taskType) => {
    const credits = creditFor(taskType);
    if (!credits) return true; // free / not loaded -> no prompt
    const next = NEXT_STEP[taskType];

    // FREE plan spends uses, not credits (backend FreeQuotaCreditService). On error, show credits.
    const quota = await membershipApi.freeUses().catch(() => null);
    let message;
    if (quota?.freePlan) {
      const left = Math.max(0, quota.limit - quota.used);
      // FREE: a whole figurine (prototype + auto build) is one use (backend freeFigureBuild).
      message = t("confirm.freeUseMsg", { left, limit: quota.limit });
    } else {
      const nextCredits = next ? creditFor(next) || 0 : 0;
      message = nextCredits
        ? t("confirm.chainMsg", { total: credits + nextCredits, first: credits, second: nextCredits })
        : `${t("confirm.creditMsg")} ${credits} ${t("confirm.creditsUnit")}`;
    }

    return confirm({
      title: t("confirm.title"),
      message,
      confirmLabel: t("confirm.proceed"),
      cancelLabel: t("confirm.cancel"),
    });
  };
}

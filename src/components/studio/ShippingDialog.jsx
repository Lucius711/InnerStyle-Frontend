import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Truck, Loader2, Heart } from "lucide-react";
import Button from "@/components/ui/Button";
import { Field, TextInput, TextArea, SelectMenu } from "@/components/ui/FormControls";
import MapPicker from "@/components/maps/MapPicker";
import { fetchProvinces, fetchWards } from "@/lib/locationApi";
import { vnd, PRINT_SIZES, PRINT_MATERIALS, printPriceFor, couplePrice, COUPLE_DISCOUNT_PERCENT, loadCoupleDiscount } from "@/lib/pricing";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useT } from "@/hooks/useI18n";
import { useToast } from "@/hooks/useToast";

/**
 * Collects recipient + Vietnam shipping address (province/ward + detailed address + optional
 * map pin) before placing a 3D-print order. Calls `onSubmit(payload)` with everything the
 * backend needs; the parent then redirects to the payment gateway.
 */
export default function ShippingDialog({ open, taskId, submitting, onClose, onSubmit }) {
  const t = useT();
  const toast = useToast();
  const { user } = useAuth();

  const [form, setForm] = useState({
    recipientName: "",
    recipientEmail: "",
    recipientPhone: "",
    sizeCm: 12,
    material: "PLA",
    couple: false,
    pairTaskId: "",
    pairSizeCm: 12,
    provinceCode: "",
    wardCode: "",
    addressDetail: "",
    note: "",
    latitude: null,
    longitude: null,
  });
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingWards, setLoadingWards] = useState(false);
  const [pairModels, setPairModels] = useState(null);
  const [couplePercent, setCouplePercent] = useState(COUPLE_DISCOUNT_PERCENT);

  useEffect(() => {
    if (open) loadCoupleDiscount().then(setCouplePercent);
  }, [open]);

  // Couple Set: the buyer's other finished models, loaded the first time the toggle is switched on.
  useEffect(() => {
    if (!open || !form.couple || pairModels) return;
    api
      .listTasks({ status: "SUCCEEDED", size: 30 })
      // Only finished 3D models can be printed — e.g. a chibi concept (FIGURE_PROTOTYPE) is just a 2D image.
      .then((res) =>
        setPairModels(
          (res?.content || []).filter((m) => m.id !== taskId && m.modelUrls && Object.keys(m.modelUrls).length > 0)
        )
      )
      .catch(() => setPairModels([]));
  }, [open, form.couple, pairModels, taskId]);

  const unitPrice = (cm) =>
    (printPriceFor(cm) || 0) + (PRINT_MATERIALS.find((m) => m.code === form.material)?.surcharge || 0);
  const fullPrice = unitPrice(form.sizeCm) + (form.couple ? unitPrice(form.pairSizeCm) : 0);
  const total = form.couple ? couplePrice(fullPrice, couplePercent) : fullPrice;

  // Prefill from the signed-in account.
  useEffect(() => {
    if (open && user) {
      setForm((f) => ({
        ...f,
        recipientName: f.recipientName || user.fullName || "",
        recipientEmail: f.recipientEmail || user.email || "",
      }));
    }
  }, [open, user]);

  // Load provinces once the dialog opens.
  useEffect(() => {
    if (!open) return;
    fetchProvinces()
      .then(setProvinces)
      .catch(() => toast.error(t("shipping.loadFail"), t("shipping.provinceLoadFail")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Load wards whenever the province changes.
  useEffect(() => {
    if (!form.provinceCode) {
      setWards([]);
      return;
    }
    setLoadingWards(true);
    fetchWards(form.provinceCode)
      .then(setWards)
      .catch(() => toast.error(t("shipping.loadFail"), t("shipping.wardLoadFail")))
      .finally(() => setLoadingWards(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.provinceCode]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const provinceName = useMemo(
    () => provinces.find((p) => p.code === form.provinceCode)?.name || "",
    [provinces, form.provinceCode]
  );
  const wardName = useMemo(
    () => wards.find((w) => w.code === form.wardCode)?.name || "",
    [wards, form.wardCode]
  );

  const handlePick = ({ lat, lng, address }) => {
    setForm((f) => ({
      ...f,
      latitude: lat,
      longitude: lng,
      addressDetail: address && !f.addressDetail ? address : f.addressDetail,
    }));
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.recipientName.trim() || !form.recipientEmail.trim() || !form.recipientPhone.trim()) {
      toast.error(t("shipping.invalid"), t("shipping.contactRequired"));
      return;
    }
    if (form.couple && !form.pairTaskId) {
      toast.error(t("shipping.invalid"), t("shipping.pairRequired"));
      return;
    }
    if (!form.provinceCode || !form.wardCode || !form.addressDetail.trim()) {
      toast.error(t("shipping.invalid"), t("shipping.addressRequired"));
      return;
    }
    onSubmit({
      provider: "PAYOS",
      sizeCm: form.sizeCm,
      material: form.material,
      ...(form.couple ? { pairTaskId: form.pairTaskId, pairSizeCm: form.pairSizeCm } : {}),
      recipientName: form.recipientName.trim(),
      recipientEmail: form.recipientEmail.trim(),
      recipientPhone: form.recipientPhone.trim(),
      provinceCode: form.provinceCode,
      provinceName,
      wardCode: form.wardCode,
      wardName,
      addressDetail: form.addressDetail.trim(),
      latitude: form.latitude,
      longitude: form.longitude,
      note: form.note.trim() || undefined,
    });
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="glass max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl p-6 shadow-card"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-app-text">
                <Truck className="h-5 w-5 text-brand-violet" /> {t("shipping.title")}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1 text-app-muted hover:text-app-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-5 text-xs text-app-faint">{t("shipping.subtitle")}</p>

            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label={t("shipping.fullName")}>
                  <TextInput value={form.recipientName} onChange={set("recipientName")} required />
                </Field>
                <Field label={t("shipping.phone")}>
                  <TextInput
                    value={form.recipientPhone}
                    onChange={set("recipientPhone")}
                    placeholder="0901234567"
                    required
                  />
                </Field>
              </div>

              <Field label={t("shipping.email")}>
                <TextInput
                  type="email"
                  value={form.recipientEmail}
                  onChange={set("recipientEmail")}
                  required
                />
              </Field>

              <Field label={t("shipping.size")} hint={t("shipping.sizeHint")}>
                <div className="grid grid-cols-3 gap-2">
                  {PRINT_SIZES.map((s) => {
                    const active = form.sizeCm === s.cm;
                    return (
                      <button
                        key={s.cm}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, sizeCm: s.cm }))}
                        className={
                          "flex flex-col items-center rounded-xl border px-2 py-2.5 transition-colors " +
                          (active
                            ? "border-brand-violet bg-brand-violet/10 text-app-text"
                            : "border-app-line/15 text-app-muted hover:bg-app-line/5")
                        }
                      >
                        <span className="text-sm font-semibold">{s.cm} cm</span>
                        <span className="mt-0.5 text-[11px] text-app-faint">{vnd.format(s.price)}</span>
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label={t("shipping.material")} hint={t("shipping.materialHint")}>
                <div className="grid grid-cols-3 gap-2">
                  {PRINT_MATERIALS.map((m) => {
                    const active = form.material === m.code;
                    return (
                      <button
                        key={m.code}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setForm((f) => ({ ...f, material: m.code }))}
                        className={
                          "flex flex-col items-center rounded-xl border px-2 py-2.5 text-center transition-colors " +
                          (active
                            ? "border-brand-violet bg-brand-violet/10 text-app-text"
                            : "border-app-line/15 text-app-muted hover:bg-app-line/5")
                        }
                      >
                        <span className="text-sm font-semibold">{m.name}</span>
                        <span className="mt-0.5 text-[11px] text-app-faint">
                          {m.surcharge ? `+${vnd.format(m.surcharge)}` : t("shipping.materialBase")}
                        </span>
                        <span className="mt-1 text-[10px] leading-tight text-app-faint">
                          {t(`shipping.materials.${m.code}`)}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-sm text-app-muted">
                  {t("shipping.total")}:{" "}
                  <span className="font-semibold text-app-text">
                    {vnd.format(total)}
                  </span>
                  {form.couple && (
                    <span className="ml-2 text-xs text-emerald-400">
                      {t("shipping.coupleSaving", { amount: vnd.format(fullPrice - total) })}
                    </span>
                  )}
                </p>
              </Field>

              {/* Couple Set: a second model printed in the same order, discounted */}
              <div className="rounded-xl border border-app-line/15 p-3">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    id="couple-set"
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-[#8b6cff]"
                    checked={form.couple}
                    onChange={(e) => setForm((f) => ({ ...f, couple: e.target.checked }))}
                  />
                  <span>
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-app-text">
                      <Heart className="h-4 w-4 text-pink-400" /> {t("shipping.couple")}
                    </span>
                    <span className="text-xs text-app-faint">
                      {t("shipping.coupleHint", { percent: couplePercent })}
                    </span>
                  </span>
                </label>

                {form.couple && (
                  <div className="mt-3 space-y-3">
                    <p className="text-xs text-app-muted">{t("shipping.couplePick")}</p>
                    {!pairModels ? (
                      <Loader2 className="h-4 w-4 animate-spin text-app-muted" />
                    ) : pairModels.length === 0 ? (
                      <p className="text-xs text-amber-400">{t("shipping.coupleNoModels")}</p>
                    ) : (
                      <div className="grid max-h-48 grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-5">
                        {pairModels.map((m) => {
                          const active = form.pairTaskId === m.id;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              aria-pressed={active}
                              aria-label={t(`studio.types.${m.taskType}`)}
                              title={t(`studio.types.${m.taskType}`)}
                              onClick={() => setForm((f) => ({ ...f, pairTaskId: m.id }))}
                              className={
                                "aspect-square overflow-hidden rounded-lg border-2 bg-app-line/5 " +
                                (active ? "border-pink-400" : "border-transparent hover:border-app-line/30")
                              }
                            >
                              {m.thumbnailUrl ? (
                                <img src={api.mediaUrl(m.thumbnailUrl)} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <span className="px-1 text-[10px] leading-tight text-app-faint">
                                  {t(`studio.types.${m.taskType}`)}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    <p className="text-xs text-app-muted">{t("shipping.pairSize")}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {PRINT_SIZES.map((s) => (
                        <button
                          key={s.cm}
                          type="button"
                          aria-pressed={form.pairSizeCm === s.cm}
                          onClick={() => setForm((f) => ({ ...f, pairSizeCm: s.cm }))}
                          className={
                            "rounded-xl border px-2 py-2 text-sm font-semibold transition-colors " +
                            (form.pairSizeCm === s.cm
                              ? "border-pink-400 bg-pink-400/10 text-app-text"
                              : "border-app-line/15 text-app-muted hover:bg-app-line/5")
                          }
                        >
                          {s.cm} cm
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label={t("shipping.province")}>
                  <SelectMenu
                    value={form.provinceCode}
                    onChange={(code) =>
                      setForm((f) => ({ ...f, provinceCode: code, wardCode: "" }))
                    }
                    options={provinces.map((p) => ({ value: p.code, label: p.name }))}
                    placeholder={t("shipping.selectProvince")}
                    searchPlaceholder={t("shipping.selectProvince")}
                  />
                </Field>
                <Field label={t("shipping.ward")}>
                  <SelectMenu
                    value={form.wardCode}
                    onChange={(code) => setForm((f) => ({ ...f, wardCode: code }))}
                    options={wards.map((w) => ({
                      value: w.code,
                      label: w.districtName ? `${w.name} — ${w.districtName}` : w.name,
                    }))}
                    placeholder={loadingWards ? t("shipping.loading") : t("shipping.selectWard")}
                    searchPlaceholder={t("shipping.selectWard")}
                    disabled={!form.provinceCode || loadingWards}
                  />
                </Field>
              </div>

              <Field label={t("shipping.addressDetail")} hint={t("shipping.addressDetailHint")}>
                <TextInput
                  value={form.addressDetail}
                  onChange={set("addressDetail")}
                  placeholder={t("shipping.addressDetailPlaceholder")}
                  required
                />
              </Field>

              <Field label={t("shipping.mapLabel")}>
                <MapPicker
                  value={form.latitude ? { lat: form.latitude, lng: form.longitude } : null}
                  onPick={handlePick}
                />
              </Field>

              <Field label={t("shipping.note")}>
                <TextArea
                  value={form.note}
                  onChange={set("note")}
                  className="min-h-[70px]"
                  placeholder={t("shipping.notePlaceholder")}
                />
              </Field>

              <Button type="submit" className="w-full" loading={submitting} icon={submitting ? Loader2 : Truck}>
                {t("shipping.confirm")} · PAYOS
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

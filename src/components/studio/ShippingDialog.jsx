import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Truck, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { Field, TextInput, TextArea, SelectMenu } from "@/components/ui/FormControls";
import MapPicker from "@/components/maps/MapPicker";
import { fetchProvinces, fetchWards } from "@/lib/locationApi";
import { vnd, PRINT_SIZES, printPriceFor } from "@/lib/pricing";
import { useAuth } from "@/hooks/useAuth";
import { useT } from "@/hooks/useI18n";
import { useToast } from "@/hooks/useToast";

/**
 * Collects recipient + Vietnam shipping address (province/ward + detailed address + optional
 * map pin) before placing a 3D-print order. Calls `onSubmit(payload)` with everything the
 * backend needs; the parent then redirects to the payment gateway.
 */
export default function ShippingDialog({ open, provider, submitting, onClose, onSubmit }) {
  const t = useT();
  const toast = useToast();
  const { user } = useAuth();

  const [form, setForm] = useState({
    recipientName: "",
    recipientEmail: "",
    recipientPhone: "",
    sizeCm: 12,
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
    if (!form.provinceCode || !form.wardCode || !form.addressDetail.trim()) {
      toast.error(t("shipping.invalid"), t("shipping.addressRequired"));
      return;
    }
    onSubmit({
      provider,
      sizeCm: form.sizeCm,
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
                {t("shipping.confirm")} · {provider}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

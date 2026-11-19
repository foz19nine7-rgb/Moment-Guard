import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { FlaskConical, Loader2, Lock, ShieldCheck, Sparkles, UserRoundCheck, Zap } from "lucide-react";
import { toast } from "sonner";

import { FamilyContactSheet } from "@/components/guard/FamilyContactSheet";
import { ResultCard } from "@/components/guard/ResultCard";
import { UploadZone } from "@/components/guard/UploadZone";
import { Button } from "@/components/ui/button";
import { useFamilyPhone } from "@/hooks/use-family-phone";
import { formatFamilyPhone } from "@/lib/family-contact";
import { prepareImage } from "@/lib/image";
import { SAMPLE_MESSAGES } from "@/lib/samples";
import { MAX_TEXT_LENGTH, type ScanResult } from "@/lib/scan";
import { scanMessage } from "@/lib/scan.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "حارس اللحظة | افحص الرسائل والروابط المشبوهة في ثوانٍ" },
      {
        name: "description",
        content:
          "ارفع لقطة شاشة أو الصق رسالة أو رابطاً، ويخبرك حارس اللحظة فوراً إن كانت آمنة أو احتيالاً، وماذا تفعل الآن.",
      },
      { property: "og:title", content: "حارس اللحظة – مستشارك الفوري ضد الاحتيال" },
      {
        property: "og:description",
        content: "هل وصلك رابط أو رسالة تشك فيها؟ افحصها في ثوانٍ بالذكاء الاصطناعي.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type PreparedImage = { base64: string; mediaType: "image/jpeg"; previewUrl: string };

function Index() {
  const runScan = useServerFn(scanMessage);
  const [text, setText] = useState("");
  const [image, setImage] = useState<PreparedImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const family = useFamilyPhone();
  const [familyOpen, setFamilyOpen] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("الرجاء اختيار صورة (PNG أو JPG).");
      return;
    }
    try {
      setImage(await prepareImage(file));
    } catch {
      toast.error("تعذّر قراءة الصورة، جرّب صورة أخرى.");
    }
  }, []);

  // Allow pasting a screenshot directly from the clipboard.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const file = Array.from(e.clipboardData?.files ?? []).find((f) =>
        f.type.startsWith("image/"),
      );
      if (file) {
        e.preventDefault();
        void handleFile(file);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handleFile]);

  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result]);

  const canScan = (text.trim().length > 0 || !!image) && !loading;

  async function handleScan(override?: { text: string }) {
    const scanText = (override ? override.text : text).trim();
    const scanImage = override ? null : image;
    if (loading) return;
    if (!scanText && !scanImage) {
      toast.error("أضف لقطة شاشة أو الصق نص الرسالة أولاً.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await runScan({
        data: {
          text: scanText,
          image: scanImage ? { base64: scanImage.base64, mediaType: scanImage.mediaType } : null,
        },
      });
      if (res.ok) setResult(res.result);
      else toast.error(res.message);
    } catch {
      toast.error("تعذّر الاتصال بالخدمة. تحقق من الإنترنت وحاول مجدداً.");
    } finally {
      setLoading(false);
    }
  }

  // One tap: fill the box with a sample and scan it right away (text only).
  function trySample(sampleText: string) {
    if (loading) return;
    setText(sampleText);
    setImage(null);
    void handleScan({ text: sampleText });
  }

  function reset() {
    setResult(null);
    setText("");
    setImage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="relative overflow-hidden bg-gradient-hero pb-20 text-primary-foreground">
        <div className="hero-grid pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-md px-5 pt-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground/10 ring-1 ring-primary-foreground/20">
              <ShieldCheck className="size-6" strokeWidth={1.75} />
            </span>
            <div className="leading-tight">
              <p className="font-display text-lg font-bold">حارس اللحظة</p>
              <p className="text-xs opacity-70">Moment Guard</p>
            </div>
            <button
              type="button"
              onClick={() => setFamilyOpen(true)}
              className="ms-auto flex max-w-[11rem] cursor-pointer items-center gap-1.5 rounded-full bg-primary-foreground/10 px-3 py-2 text-xs font-medium ring-1 ring-primary-foreground/20 transition-colors hover:bg-primary-foreground/20"
              aria-label="رقم الشخص الموثوق في العائلة"
            >
              <UserRoundCheck className="size-4 shrink-0" />
              {family.phone ? (
                <span dir="ltr" className="truncate">
                  {formatFamilyPhone(family.phone)}
                </span>
              ) : (
                <span className="truncate">الشخص الموثوق</span>
              )}
            </button>
          </div>

          <h1 className="mt-9 text-[1.7rem] leading-[1.35] font-bold">
            هل وصلك رابط أو رسالة تشك فيها؟
            <span className="mt-1 block opacity-80">افحصها في ثوانٍ</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed opacity-75">
            ارفع لقطة شاشة أو الصق النص، وسيخبرك الذكاء الاصطناعي فوراً إن كانت آمنة، وماذا تفعل
            الآن.
          </p>
        </div>
      </header>

      <main className="relative mx-auto -mt-14 max-w-md space-y-5 px-4 pb-10">
        <section className="space-y-4 rounded-3xl border border-border bg-card p-4 shadow-soft">
          <UploadZone
            previewUrl={image?.previewUrl ?? null}
            onFile={handleFile}
            onClear={() => setImage(null)}
            disabled={loading}
          />

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            و / أو
            <span className="h-px flex-1 bg-border" />
          </div>

          <div>
            <label htmlFor="message" className="mb-1.5 block text-sm font-semibold">
              الصق الرسالة أو الرابط
            </label>
            <textarea
              id="message"
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT_LENGTH))}
              disabled={loading}
              rows={4}
              placeholder="مثال: عزيزي العميل، تم إيقاف بطاقتك، يرجى تحديث بياناتك عبر الرابط..."
              className="w-full resize-none rounded-2xl border border-input bg-background px-4 py-3 text-base leading-relaxed placeholder:text-muted-foreground/70 focus:border-primary-glow focus:ring-2 focus:ring-ring/20 focus:outline-none"
            />
            <div className="mt-2.5">
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <FlaskConical className="size-3.5" />
                جرّب بضغطة واحدة:
              </p>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_MESSAGES.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => trySample(sample.text)}
                    disabled={loading}
                    className="cursor-pointer rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:border-primary-glow/40 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button
            variant="hero"
            size="xl"
            className="relative w-full overflow-hidden"
            onClick={() => void handleScan()}
            disabled={!canScan}
          >
            {loading ? (
              <>
                <span className="animate-scan-sweep pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-primary-foreground/15 to-transparent" />
                <Loader2 className="animate-spin" />
                جارٍ الفحص...
              </>
            ) : (
              <>
                <Sparkles />
                افحص الآن بالذكاء الاصطناعي
              </>
            )}
          </Button>
        </section>

        <div ref={resultRef} className="scroll-mt-4">
          {result && (
            <ResultCard
              result={result}
              onReset={reset}
              familyPhone={family.phone}
              onEditFamilyPhone={() => setFamilyOpen(true)}
            />
          )}
        </div>

        {!result && (
          <ul className="grid grid-cols-3 gap-2 text-center">
            {[
              { icon: Zap, label: "نتيجة خلال ثوانٍ" },
              { icon: Lock, label: "لا نحفظ رسائلك" },
              { icon: ShieldCheck, label: "خطوات حماية عملية" },
            ].map(({ icon: Icon, label }) => (
              <li key={label} className="rounded-2xl bg-card p-3 shadow-soft">
                <Icon className="mx-auto mb-1.5 size-5 text-primary-glow" />
                <span className="text-xs leading-snug text-muted-foreground">{label}</span>
              </li>
            ))}
          </ul>
        )}

        <p className="px-2 text-center text-xs leading-relaxed text-muted-foreground">
          النتيجة استشارية وقد تخطئ أحياناً. عند الشك، تواصل مع الجهة مباشرة عبر تطبيقها أو رقمها
          الرسمي.
        </p>
      </main>

      <FamilyContactSheet
        open={familyOpen}
        onOpenChange={setFamilyOpen}
        phone={family.phone}
        onSave={(next) => {
          family.save(next);
          if (next) toast.success("تم حفظ رقم الشخص الموثوق.");
          else toast.success("تم حذف الرقم المحفوظ.");
        }}
      />
    </div>
  );
}

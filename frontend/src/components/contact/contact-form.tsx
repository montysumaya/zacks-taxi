"use client";

import { useState, type FormEvent } from "react";
import { MessageCircle, User } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, PhoneInput, Select, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { buildWhatsAppLink, buildWhatsAppMessage } from "@/lib/whatsapp";
import type { ContactTopic } from "@/types";

const topics: ContactTopic[] = ["general", "booking", "corporate", "feedback"];

type Values = { name: string; phone: string; topic: ContactTopic; message: string };
type Errors = Partial<Record<keyof Values, string>>;

const initialValues: Values = { name: "", phone: "", topic: "general", message: "" };

/** Opens WhatsApp with the message prefilled; customer service replies there. */
export function ContactForm() {
  const { dict } = useI18n();
  const { toast } = useToast();
  const t = dict.contactForm;
  const [values, setValues] = useState<Values>(initialValues);
  const [errors, setErrors] = useState<Errors>({});

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): Errors {
    const next: Errors = {};
    if (!values.name.trim()) next.name = t.errors.nameRequired;
    if (values.message.trim().length < 10) next.message = t.errors.messageShort;
    return next;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      const form = event.currentTarget;
      requestAnimationFrame(() => form.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }
    const phone = values.phone.trim();
    const message = buildWhatsAppMessage(t.greeting, [
      [t.name, values.name],
      [t.phone, phone && !phone.startsWith("+") ? `+961 ${phone}` : phone],
      [t.topic, t.topics[values.topic]],
      [t.message, values.message],
    ]);
    window.open(buildWhatsAppLink(message), "_blank", "noopener,noreferrer");
    toast({ tone: "success", title: dict.booking.sentTitle, description: dict.booking.sentBody });
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-h3 font-bold">{t.title}</h2>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.name} error={errors.name} required>
          <Input
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            autoComplete="name"
            startAdornment={<User aria-hidden />}
          />
        </Field>
        <Field label={t.phone} optionalLabel={dict.common.optional}>
          <PhoneInput value={values.phone} onChange={(e) => set("phone", e.target.value)} placeholder="70 000 000" />
        </Field>
      </div>
      <Field label={t.topic}>
        <Select value={values.topic} onChange={(e) => set("topic", e.target.value as ContactTopic)}>
          {topics.map((topic) => (
            <option key={topic} value={topic}>
              {t.topics[topic]}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t.message} error={errors.message} required>
        <Textarea
          value={values.message}
          onChange={(e) => set("message", e.target.value)}
          placeholder={t.messagePlaceholder}
          rows={5}
          maxLength={2000}
        />
      </Field>
      <Button type="submit" variant="accent" size="lg" className="self-start max-sm:w-full">
        <MessageCircle aria-hidden />
        {t.submit}
      </Button>
    </form>
  );
}

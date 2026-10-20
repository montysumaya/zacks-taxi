"use client";

import { useState, type FormEvent } from "react";
import { Mail, User } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/choice";
import { Field } from "@/components/ui/field";
import { Input, PhoneInput, Select, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { interpolate } from "@/i18n/interpolate";
import { services } from "@/services";
import type { ContactTopic } from "@/types";

const topics: ContactTopic[] = ["general", "booking", "corporate", "feedback"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Values = { name: string; email: string; phone: string; topic: ContactTopic; message: string; consent: boolean };
type Errors = Partial<Record<keyof Values, string>>;

const initialValues: Values = { name: "", email: "", phone: "", topic: "general", message: "", consent: false };

export function ContactForm() {
  const { dict } = useI18n();
  const { toast } = useToast();
  const t = dict.contactForm;
  const [values, setValues] = useState<Values>(initialValues);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): Errors {
    const next: Errors = {};
    if (!values.name.trim()) next.name = t.errors.nameRequired;
    if (!EMAIL_PATTERN.test(values.email.trim())) next.email = t.errors.emailInvalid;
    if (values.message.trim().length < 20) next.message = t.errors.messageShort;
    if (!values.consent) next.consent = t.errors.consentRequired;
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      const form = event.currentTarget;
      requestAnimationFrame(() => form.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }
    setSubmitting(true);
    try {
      const result = await services.contact.submit({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() ? `+961 ${values.phone.trim()}` : undefined,
        topic: values.topic,
        message: values.message.trim(),
      });
      toast({
        tone: "success",
        title: t.successTitle,
        description: interpolate(t.successBody, { reference: result.reference }),
      });
      setValues(initialValues);
    } catch {
      toast({ tone: "error", title: t.errors.failed });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-h3 font-bold">{t.title}</h2>
        <Badge tone="accent" size="sm">
          {dict.common.demo}
        </Badge>
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
        <Field label={t.email} error={errors.email} required>
          <Input
            type="email"
            dir="ltr"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            autoComplete="email"
            startAdornment={<Mail aria-hidden />}
            className="rtl:text-right"
          />
        </Field>
        <Field label={t.phone} optionalLabel={dict.common.optional}>
          <PhoneInput value={values.phone} onChange={(e) => set("phone", e.target.value)} placeholder="70 000 000" />
        </Field>
        <Field label={t.topic}>
          <Select value={values.topic} onChange={(e) => set("topic", e.target.value as ContactTopic)}>
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {t.topics[topic]}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label={t.message} error={errors.message} required>
        <Textarea
          value={values.message}
          onChange={(e) => set("message", e.target.value)}
          placeholder={t.messagePlaceholder}
          rows={5}
          maxLength={2000}
        />
      </Field>
      <div className="flex flex-col gap-1.5">
        <Checkbox
          label={t.consent}
          checked={values.consent}
          onChange={(e) => set("consent", e.target.checked)}
          aria-invalid={errors.consent ? true : undefined}
          aria-describedby={errors.consent ? "consent-error" : undefined}
        />
        {errors.consent && (
          <p id="consent-error" className="ps-8 text-sm text-danger">
            {errors.consent}
          </p>
        )}
      </div>
      <Button type="submit" size="lg" loading={submitting} className="self-start max-sm:w-full">
        {t.submit}
      </Button>
    </form>
  );
}

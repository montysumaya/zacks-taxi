"use client";

import { Mail, User } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Field } from "@/components/ui/field";
import { Input, PhoneInput, Textarea } from "@/components/ui/input";
import { TEXT_LIMITS } from "@/features/booking/validation";
import type { StepProps } from "./types";

export function CustomerStep({ draft, change, errorFor, t }: StepProps) {
  const { dict } = useI18n();
  const customer = draft.customer;
  const set = (patch: Partial<typeof customer>, field: Parameters<typeof errorFor>[0]) =>
    change({ customer: { ...customer, ...patch } }, [field]);

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label={t.fullName} error={errorFor("fullName")} required className="sm:col-span-2">
        <Input
          value={customer.fullName}
          onChange={(e) => set({ fullName: e.target.value }, "fullName")}
          autoComplete="name"
          startAdornment={<User aria-hidden />}
          maxLength={80}
        />
      </Field>
      <Field label={t.phone} hint={t.phoneHint} error={errorFor("phone")} required>
        <PhoneInput
          value={customer.phone}
          onChange={(e) => set({ phone: e.target.value }, "phone")}
          placeholder="70 123 456"
          maxLength={16}
        />
      </Field>
      <Field label={t.email} hint={t.emailHint} error={errorFor("email")} optionalLabel={dict.common.optional}>
        <Input
          type="email"
          dir="ltr"
          value={customer.email}
          onChange={(e) => set({ email: e.target.value }, "email")}
          autoComplete="email"
          startAdornment={<Mail aria-hidden />}
          className="rtl:text-right"
        />
      </Field>
      <Field
        label={t.specialInstructions}
        error={errorFor("specialInstructions")}
        optionalLabel={dict.common.optional}
        className="sm:col-span-2"
      >
        <Textarea
          value={customer.specialInstructions}
          onChange={(e) => set({ specialInstructions: e.target.value }, "specialInstructions")}
          placeholder={t.specialPlaceholder}
          maxLength={TEXT_LIMITS.specialInstructions}
          className="min-h-20"
        />
      </Field>
    </div>
  );
}

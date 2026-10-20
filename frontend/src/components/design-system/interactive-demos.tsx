"use client";

import { useState } from "react";
import { Mail, Search } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Checkbox, Radio, RadioGroup, Switch } from "@/components/ui/choice";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field } from "@/components/ui/field";
import { Input, PhoneInput, Select, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useToast } from "@/components/ui/toast";

export function FormDemo() {
  const { dict } = useI18n();
  const [mode, setMode] = useState<"now" | "scheduled">("now");
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Field label="Search" hint="Inputs support start and end adornments.">
        <Input placeholder="Search locations" startAdornment={<Search aria-hidden />} />
      </Field>
      <Field label="Email" error="Enter a valid email address." required>
        <Input type="email" defaultValue="lara@" startAdornment={<Mail aria-hidden />} dir="ltr" />
      </Field>
      <Field label="Phone" optionalLabel={dict.common.optional}>
        <PhoneInput placeholder="70 000 000" />
      </Field>
      <Field label="Vehicle class">
        <Select defaultValue="comfort">
          {(["economy", "comfort", "business", "van"] as const).map((c) => (
            <option key={c} value={c}>
              {dict.vehicleClass[c].name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Disabled" disabled>
        <Input defaultValue="Read only value" />
      </Field>
      <SegmentedControl
        legend="Segmented control"
        value={mode}
        onChange={setMode}
        options={[
          { value: "now", label: dict.booking.modeNow },
          { value: "scheduled", label: dict.booking.modeScheduled },
        ]}
      />
      <Field label="Notes" className="md:col-span-2">
        <Textarea placeholder={dict.booking.notesPlaceholder} />
      </Field>
      <div className="flex flex-col gap-4">
        <Checkbox label="Remember my pickup" description="Saved to your account." defaultChecked />
        <Switch label="Booking notifications" description="SMS and email updates." defaultChecked />
      </div>
      <RadioGroup legend={dict.booking.paymentMethod}>
        {(["cash", "card", "wallet"] as const).map((m, i) => (
          <Radio key={m} name="ds-payment" label={dict.paymentMethod[m]} defaultChecked={i === 0} />
        ))}
      </RadioGroup>
    </div>
  );
}

export function OverlayDemo() {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="secondary" onClick={() => setModalOpen(true)}>
        Open modal
      </Button>
      <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
        Open confirmation
      </Button>
      <Button variant="secondary" onClick={() => toast({ tone: "success", title: "Booking confirmed", description: "Reference MSR-7K2Q9." })}>
        Success toast
      </Button>
      <Button variant="secondary" onClick={() => toast({ tone: "error", title: "Payment failed", description: "Please try another method." })}>
        Error toast
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast({ tone: "info", title: "Driver assigned", action: { label: "View booking", onClick: () => undefined } })
        }
      >
        Toast with action
      </Button>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Modal title"
        description="Centered on desktop, bottom sheet on mobile."
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setModalOpen(false)}>Save</Button>
          </>
        }
      >
        <p className="text-muted-foreground">Focus is trapped inside; Escape and backdrop clicks close it.</p>
      </Modal>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        tone="danger"
        title="Cancel this booking?"
        description="Your driver will be notified. This can't be undone."
        confirmLabel="Cancel booking"
        loading={confirming}
        onConfirm={() => {
          setConfirming(true);
          setTimeout(() => {
            setConfirming(false);
            setConfirmOpen(false);
            toast({ tone: "success", title: "Booking cancelled" });
          }, 900);
        }}
      />
    </div>
  );
}

"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { paymentSchema, type PaymentFormValues } from "../zod-schema";
import { detectBrand, formatCardNumber, formatExpiry } from "../card-utils";
import { AcceptedCards } from "./accepted-cards";
import { BrandIcon } from "./brand-icon";

const COUNTRY_CODES = [
  { value: "+385", label: "HR +385" },
  { value: "+381", label: "RS +381" },
  { value: "+387", label: "BA +387" },
  { value: "+382", label: "ME +382" },
  { value: "+386", label: "SI +386" },
  { value: "+49", label: "DE +49" },
];

const SECTION = "text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground";

interface PaymentFormProps {
  onSubmit: (values: PaymentFormValues) => void;
  isSubmitting: boolean;
  /** Poruka greške sa servera (npr. sold_out) — prikazuje se iznad dugmeta. */
  errorMessage?: string;
}

/**
 * Payment forma (korak 4). Sva validacija ide preko Zod šeme + RHF.
 * Kartica/MM/YY se formatiraju u realnom vremenu; brend se prepoznaje po ciframa.
 */
export function PaymentForm({
  onSubmit,
  isSubmitting,
  errorMessage,
}: PaymentFormProps) {
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      countryCode: "+385",
      phone: "",
      comments: "",
      cardNumber: "",
      expiration: "",
      cvv: "",
      holderFirst: "",
      holderLast: "",
      newsletter: false,
      terms: false,
    },
  });

  // useWatch (umesto form.watch) je memo-safe — prati samo broj kartice.
  const cardNumber = useWatch({ control: form.control, name: "cardNumber" });
  const brand = detectBrand(cardNumber ?? "");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* GUEST DETAILS */}
          <div className="flex flex-col gap-4">
            <h3 className={SECTION}>Guest details</h3>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your e-mail address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Contact number</FormLabel>
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="countryCode"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-9 w-28 shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRY_CODES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <div className="flex-1">
                      <Input placeholder="Enter phone number" {...field} />
                      <FormMessage />
                    </div>
                  )}
                />
              </div>
            </FormItem>

            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional comments</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter any additional comments" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* PAYMENT METHOD */}
          <div className="flex flex-col gap-4">
            <h3 className={SECTION}>Payment method</h3>

            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        inputMode="numeric"
                        placeholder="Enter your credit card number"
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(formatCardNumber(e.target.value))
                        }
                        onBlur={field.onBlur}
                        className="pr-16"
                      />
                      {field.value && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2">
                          <BrandIcon brand={brand} />
                        </span>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="expiration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiration date</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        placeholder="MM/YY"
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(formatExpiry(e.target.value))
                        }
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cvv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CVV</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="---"
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(e.target.value.replace(/\D/g, ""))
                        }
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="holderFirst"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card holder first name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your card holder first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="holderLast"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card holder last name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your card holder last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Saglasnosti */}
        <div className="flex flex-col gap-3">
          <FormField
            control={form.control}
            name="newsletter"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-start gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(v) => field.onChange(v === true)}
                    />
                  </FormControl>
                  <FormLabel className="font-normal text-muted-foreground">
                    Newsletter / promo — želim povremene ponude i obaveštenja.
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-start gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(v) => field.onChange(v === true)}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    I have read and agree to the terms of use
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            Rezervacija nije uspela: {errorMessage}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "PROCESSING..." : "CONFIRM RESERVATION"}
        </Button>

        <AcceptedCards />
      </form>
    </Form>
  );
}

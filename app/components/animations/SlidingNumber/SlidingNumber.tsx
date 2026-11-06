"use client";

import {
  type ComponentProps,
  type CSSProperties,
  useEffect,
  useRef,
  useState,
} from "react";
import cn from "classnames";

export interface SlidingNumberProps
  extends Omit<ComponentProps<"span">, "children"> {
  /** How many digits after the decimal point, always shown. @default 0 */
  decimals?: number;
  /**
   * How long a digit takes to roll to its new value, in milliseconds.
   *
   * @default 600
   */
  duration?: number;
  /** Thousands separators (`12,480`). @default false */
  grouping?: boolean;
  /**
   * The locale the number is written in (its decimal point and grouping).
   * Fixed by default, so the server and the browser write it the same way.
   *
   * @default "en-US"
   */
  locale?: string;
  /** At least this many digits before the decimal point (`05`). @default 1 */
  pad?: number;
  /**
   * When it shows the value: at once, or rolling up from zero once it
   * scrolls into view.
   *
   * @default "mount"
   */
  trigger?: "mount" | "view";
  /** The number. Each change rolls the digits that changed. */
  value: number;
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

interface Part {
  digit?: number;
  key: string;
  value: string;
}

/**
 * The number's characters, each digit keyed by its place (integer places
 * leftward from the point, fraction places rightward), so a column keeps
 * rolling in place when the number gains a digit.
 */
const partsOf = (
  value: number,
  locale: string,
  options: Intl.NumberFormatOptions
) => {
  const parts = new Intl.NumberFormat(locale, options).formatToParts(value);
  let place = parts
    .filter((part) => part.type === "integer")
    .reduce((count, part) => count + part.value.length, 0);
  let fraction = 0;
  return parts.flatMap((part): Part[] => {
    if (part.type === "integer" || part.type === "fraction") {
      return [...part.value].map((char) => {
        const key = part.type === "integer" ? `i${place}` : `f${fraction}`;
        if (part.type === "integer") {
          place -= 1;
        } else {
          fraction += 1;
        }
        return { digit: Number(char), key, value: char };
      });
    }
    return [{ key: `${part.type}-${place}`, value: part.value }];
  });
};

/** The digits before the point: the zeros a view-triggered number waits on. */
const integerDigits = (value: number) =>
  String(Math.trunc(Math.abs(value))).length;

/**
 * A number whose digits roll like an odometer to each new value: every
 * digit is a column of 0 to 9 behind a one-digit window, moved by a CSS
 * transition on its `--sliding-number-digit`. It can wait at zero and roll
 * up once it scrolls into view. With reduced motion the digits change in
 * place.
 *
 * @cssvar --sliding-number-duration A digit's roll to its new value (`600ms`).
 * @cssvar --sliding-number-digit The digit a column shows, 0 to 9 (set per digit).
 */
export const SlidingNumber = (props: SlidingNumberProps) => {
  const {
    decimals = 0,
    duration,
    grouping = false,
    locale = "en-US",
    pad = 1,
    trigger = "mount",
    value,
    className,
    ...rest
  } = props;
  const root = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(trigger === "mount");

  useEffect(() => {
    const node = root.current;
    if (trigger !== "view" || !node) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          setVisible(true);
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [trigger]);

  const options: Intl.NumberFormatOptions = {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
    // Waiting for the view, zeros in every place the value will fill.
    minimumIntegerDigits: Math.max(pad, visible ? 1 : integerDigits(value)),
    useGrouping: grouping,
  };
  const shown = visible ? value : 0;
  const parts = partsOf(shown, locale, options);

  return (
    <span
      className={cn("inline-flex tabular-nums", className)}
      data-slot="sliding-number"
      ref={root}
      {...rest}
    >
      <span className="sr-only">
        {new Intl.NumberFormat(locale, {
          ...options,
          minimumIntegerDigits: pad,
        }).format(value)}
      </span>
      <span
        aria-hidden="true"
        className="inline-flex"
        dir="ltr"
        style={
          {
            "--sliding-number-duration":
              duration === undefined ? undefined : `${duration}ms`,
          } as CSSProperties
        }
      >
        {parts.map((part) =>
          part.digit === undefined ? (
            <span key={part.key}>{part.value}</span>
          ) : (
            <span
              className="relative inline-block [clip-path:inset(0)]"
              data-slot="sliding-number-digit"
              key={part.key}
              style={{ "--sliding-number-digit": part.digit } as CSSProperties}
            >
              {/* Sizes the window and gives it the text's baseline (a clip, not overflow, keeps it). */}
              <span className="invisible">0</span>
              <span className="absolute inset-x-0 top-0 flex translate-y-[calc(var(--sliding-number-digit)*-10%)] flex-col text-center transition-transform duration-(--sliding-number-duration,600ms) ease-[cubic-bezier(0.34,1.36,0.64,1)] motion-reduce:transition-none">
                {DIGITS.map((digit) => (
                  <span key={digit}>{digit}</span>
                ))}
              </span>
            </span>
          )
        )}
      </span>
    </span>
  );
};

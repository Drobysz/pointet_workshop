#!/usr/bin/env node
/**
 * Validates the translation files of a next-intl project.
 *
 *   node scripts/check-i18n.mjs                         # storefront (messages/, base "en")
 *   node scripts/check-i18n.mjs ../admin/messages fr    # any other messages directory
 *
 * For every locale it reports, relative to the base locale:
 *   - missing and unknown keys,
 *   - empty translations,
 *   - messages with invalid ICU syntax,
 *   - arguments / rich-text tags that differ from the base message,
 *   - plural and select messages without the mandatory `other` branch.
 *
 * Keys used in the code are already verified by TypeScript (see `global.d.ts`).
 * Exits with code 1 when a problem is found.
 */
import { readdirSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const messagesDir = resolve(process.argv[2] ?? "messages");
const baseLocale = process.argv[3] ?? "en";

// Ships with next-intl (dependency of `intl-messageformat`). Without it the
// script still runs, falling back to a simpler argument comparison.
const icuParser = await import("@formatjs/icu-messageformat-parser").catch(() => null);

const ARGUMENT_TYPES = ["argument", "number", "date", "time", "select", "plural"];

function flatten(tree, prefix = "", result = new Map()) {
    for (const [key, value] of Object.entries(tree)) {
        const path = prefix ? `${prefix}.${key}` : key;

        if (value !== null && typeof value === "object") {
            flatten(value, path, result);
        } else {
            result.set(path, value);
        }
    }

    return result;
}

/** Arguments and tags of a message, e.g. ["count:plural", "name:argument", "<link>"]. */
function describeMessage(message) {
    if (!icuParser) {
        const names = [...message.matchAll(/\{\s*([\w.]+)\s*[,}]/g)].map((m) => m[1]);
        const tags = [...message.matchAll(/<(\w+)>/g)].map((m) => `<${m[1]}>`);

        return { signature: [...new Set([...names, ...tags])].sort(), issues: [] };
    }

    const signature = new Set();
    const issues = [];

    const visit = (elements) => {
        for (const element of elements) {
            const type = icuParser.TYPE[element.type];

            if (type === "tag") {
                signature.add(`<${element.value}>`);
                visit(element.children);
            } else if (ARGUMENT_TYPES.includes(type)) {
                // `{count}` and `{count, number}` are interchangeable.
                const kind = type === "plural" || type === "select" ? type : "value";
                signature.add(`${element.value}:${kind}`);

                if (element.options) {
                    if (!("other" in element.options)) {
                        issues.push(`"${element.value}" has no "other" branch`);
                    }
                    for (const option of Object.values(element.options)) {
                        visit(option.value);
                    }
                }
            }
        }
    };

    visit(icuParser.parse(message));

    return { signature: [...signature].sort(), issues };
}

function loadLocale(locale) {
    const file = join(messagesDir, `${locale}.json`);

    return flatten(JSON.parse(readFileSync(file, "utf8")));
}

const locales = readdirSync(messagesDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => basename(file, ".json"));

if (!locales.includes(baseLocale)) {
    console.error(`Base locale file ${baseLocale}.json was not found in ${messagesDir}`);
    process.exit(1);
}

const base = loadLocale(baseLocale);
const baseDescriptions = new Map();
const problems = [];

const report = (locale, key, text) => problems.push(`[${locale}] ${key}: ${text}`);

for (const [key, message] of base) {
    if (typeof message !== "string" || message.trim() === "") {
        report(baseLocale, key, "empty message");
        continue;
    }

    try {
        const description = describeMessage(message);
        baseDescriptions.set(key, description);
        description.issues.forEach((issue) => report(baseLocale, key, issue));
    } catch (error) {
        report(baseLocale, key, `invalid ICU syntax (${error.message})`);
    }
}

for (const locale of locales) {
    if (locale === baseLocale) continue;

    const messages = loadLocale(locale);

    for (const key of base.keys()) {
        if (!messages.has(key)) report(locale, key, "missing translation");
    }

    for (const [key, message] of messages) {
        if (!base.has(key)) {
            report(locale, key, `unknown key (not in ${baseLocale}.json)`);
            continue;
        }

        if (typeof message !== "string" || message.trim() === "") {
            report(locale, key, "empty translation");
            continue;
        }

        const expected = baseDescriptions.get(key);
        if (!expected) continue;

        try {
            const actual = describeMessage(message);
            actual.issues.forEach((issue) => report(locale, key, issue));

            if (actual.signature.join("|") !== expected.signature.join("|")) {
                report(
                    locale,
                    key,
                    `arguments differ — expected [${expected.signature.join(", ")}], ` +
                    `found [${actual.signature.join(", ")}]`
                );
            }
        } catch (error) {
            report(locale, key, `invalid ICU syntax (${error.message})`);
        }
    }
}

if (problems.length > 0) {
    console.error(problems.join("\n"));
    console.error(`\n${problems.length} problem(s) in ${messagesDir}`);
    process.exit(1);
}

console.log(
    `OK — ${base.size} keys, locales: ${locales.join(", ")} ` +
    `(base: ${baseLocale}${icuParser ? "" : ", ICU parser unavailable: basic checks only"})`
);

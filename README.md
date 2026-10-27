# Math Lab

A calm, untimed first release connecting math facts to early algebraic thinking. Independent learning resource; not affiliated with Wilton Public Schools.

## Try it

Open `index.html` in a modern browser. No installation or build is needed. For reliable browser-local saving and a consistent origin, install Node.js and run `npm start`, then visit http://127.0.0.1:4173. There are no npm dependencies. Run `npm test` for mathematical and progress checks.

## First release: Facts into equations

Five lessons include worked examples, adjustable visual models, 30 authored practice questions, meaningful answer explanations, hints, reflections, and missed-question retries:

1. Parts & wholes: addition/subtraction, making ten, doubles, missing parts.
2. Groups & fact families: arrays, multiplication/division connections.
3. Find the unknown: missing quantities in different positions.
4. Same on both sides: equality and correcting invalid equation chains.
5. Split it, then connect it: distributive reasoning with arrays.

Connect offers six situations with selectable expressions, visual models, and related division facts. It accepts both multiplication orders and both related division facts. Its model instruction specifically asks for one row per group. Some choices therefore have equivalent totals but do not follow that representation instruction.

Use Explore to change quantities with keyboard-accessible select controls. Practice accepts numeric expressions with +, −, ×, ÷, /, *, parentheses, and decimals; it does not evaluate JavaScript, symbolic expressions, or full equations. Reasoning is for self-reflection or human review and is never automatically graded.

Print & keep opens a learning guide, five worksheets, and a separate answer key as printable HTML. Use Print / Save as PDF. Worksheets and answer keys are separate documents. Each lesson starts on a new printed page; actual pagination depends on paper and printer settings.

## What saves

Local storage key: `mathlab-v1`. Completed checks, support status totals, round totals, the selected lesson/tab, active Practice and Connect rounds, and Practice reflections survive reloads on the same browser profile and site address when storage is available. Explore scratch notes are deliberately not saved. Ending/restarting a round keeps completed checks in totals. Only continuing past the final question completes a round. Reset affects only Math Lab data.

First checks without in-question help, first checks with help, and retries are separate. Any displayed Practice model or hint marks that question supported. Connect is always supported. A retry never changes first-check totals. “Without help” is practice after instruction, not a controlled independent assessment. No score establishes mastery.

Data does not sync across devices, profiles, file URLs, localhost, or a deployed domain. Private mode, cleared site data, and browser restrictions can remove it. Storage failures show a message and practice continues in memory. Totals and reflections are shared by anyone using the browser profile. Do not enter personal details. The app makes no analytics or progress requests and uses no external fonts, accounts, cookies, or backend.

## Content & learning map

All original lesson text, prompts, answer keys, hints, feedback, prerequisite descriptions, and the longer map are in `content.js`, separate from application logic. Teachers can review this file and the printable key. The map is a proposed sequence for grades 3–8; only the first slice is playable. Fractions, decimals, order of operations, variable expressions, rational operations, ratios, proportional reasoning, and linear relationships are marked planned. See [CURRICULUM.md](CURRICULUM.md) for sources and limits.

`engine.js` contains the restricted numeric parser and scoring helpers; `app.js` contains UI and progress behavior. `print.js` renders the printable documents from the same question bank. `style.css` contains responsive layouts and keyboard-focus styling. The app runs without a build system.

## Verification

Node tests check authored numeric answers, independent substitution of missing quantities, equivalent answers, invalid numeric input, keyed choices and distractors, Connect alternatives, and separation of first checks, support, and retries. Browser QA covered a complete Practice round, an intentional error, hint use, invalid input, reload restoration of answers/reflections, summary totals, missed-only retry, and equivalent Connect selections. Desktop and narrow frame layouts were visually reviewed. `tests/responsive.html` provides manual 390px/768px views. Actual Chromebook, tablet touch, screen-reader, and printer testing remains part of a classroom pilot.

## Deploy on Azure Static Web Apps

Deployment has not been performed by this package. Connect this separate GitHub repository to a new Azure Static Web App, using your chosen subscription/resource group and the Free plan. Use Custom build settings: app location `/`, API location empty, output location empty. Because no build is required, set `skip_app_build: true` in Azure’s generated `Azure/static-web-apps-deploy` upload step. Keep Azure’s generated deployment-secret reference unchanged. No credentials belong in this repository.

```yaml
app_location: "/"
api_location: ""
output_location: ""
skip_app_build: true
```

Check the generated GitHub Actions run, then verify the Azure URL before adding a custom domain. A suggested hostname is `mathlab.silofire.com`; it is not configured by this repository. In Network Solutions, add the CNAME host `mathlab` to the exact generated Azure hostname, then complete Azure Custom domains validation. Azure supplies the HTTPS certificate after validation. Verify the custom HTTPS URL before announcing publication.

Microsoft documentation checked October 27, 2026: [build configuration](https://learn.microsoft.com/en-us/azure/static-web-apps/build-configuration) and [custom domain with external DNS](https://learn.microsoft.com/en-us/azure/static-web-apps/custom-domain-external).

## Reference

Inspected the live [Verb Lab](https://verblab.silofire.com/) and its [source](https://github.com/WilliamMaxwell/VerbLab) on October 27, 2026. Math Lab follows its navy/blue/white character, readable cards, untimed practice, hints, retries, and matching interaction. This is a separate implementation and repository with original math content.

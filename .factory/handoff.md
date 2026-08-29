# Matchbox Ledger — verification 7 handoff

## Outcome

**FAIL.** The requested candidate
`20fe840e99f5384136ea626c20aa1b5770ecde94` cannot be resolved locally or from
the named GitHub remote. GitHub returns HTTP 422 (“No commit found for SHA”),
and an exact fetch returns `upload-pack: not our ref`. Production therefore
cannot be proven to match that candidate.

The only available remote tip is
`20fe84da49e6c0a3402ba0c64bd7dd26e92ade84`. Its production build is
functionally healthy and all 14 compared live artifacts match it byte-for-byte.
This positive fallback evidence does not remove the candidate-identity blocker.

Full evidence and defect severity are in `.factory/verification-7.md`.

## Verification summary

```text
npm ci                                               PASS — 0 vulnerabilities
19/19 exact claims.json commands                     PASS
npm test                                             PASS — 20/20
npm run typecheck                                    PASS
npm run lint                                         PASS
npm run build                                        PASS
node --check dist/sw.js                              PASS
npm run test:e2e                                     PASS — 51/51 local
E2E_BASE_URL=<live> npm run test:e2e                 PASS — 51/51 live
verify-url.sh root and demo                          PASS
Live artifact identity vs available remote tip      PASS — 14/14
Live artifact identity vs requested candidate       FAIL — candidate absent
```

Cold first-read passed: the first screen says what the product does, names
freelancers using spreadsheets/offline tools, and exposes one-click **Try it
with sample data** with the result explained beside it.

Independent live checks covered normal matching/export, required manual notes,
leap-day and European amount input, invalid dates, malformed quotes, oversized
files, recovery, ambiguity, persistence, privacy traffic, cookies, desktop,
390 px mobile, keyboard, focus, reduced motion, axe, offline reload, and service
worker updates. Lighthouse scored 97/100/100/100. The external license API
allowed 30 rapid requests, then returned 429 with `Retry-After: 4` on request 31.

## Defects

- **Release-blocking:** requested candidate commit is unavailable, so live
  deployment identity against it cannot be established.
- **Minor:** `package.json` says `1.0.2`; the visible footer says
  `v1.0.3 · polish 1`.

## Next step

Provide and push the exact candidate object, or issue a corrected work order for
the actual commit intended for release. Then rerun identity verification. No
product-code repair is indicated by the available build's QA results.

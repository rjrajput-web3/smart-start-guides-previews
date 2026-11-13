# Legacy Modernization — EMPLOYEE-MANAGEMENT-PROGRAM (COBOL → TypeScript)

A complete 1:1 modernization package for one small public legacy COBOL program.
Local files only — nothing here is published or deployed.

## The original

`EMPLOYEE-MANAGEMENT-PROGRAM` (`Project1.cbl`, Arman Bhatia, Feb 10 2025) —
an interactive employee capture + long-service report program from
[`ArmanBhatia0100/COBOL_Employee_Management_Program`](https://github.com/ArmanBhatia0100/COBOL_Employee_Management_Program)
(README claims MIT; no `LICENSE` file in the repo — see `SOURCES.md`).
Verbatim copies: `original/`.

It prompts for employee ID / department / first name / last name / years of
service, writes each record to a 53-char line-sequential file, then prints a
table of the long-service employees.

## What is in this package

| File | Contents |
|---|---|
| `SPEC.md` | Functional spec: data dictionary, control flow, numbered business rules (R1–R14), numeric conversion rules (C1–C9), edge cases (E1–E22). |
| `src/employeeManagement.ts` | The translation (TypeScript, zero dependencies). Pure functions; exact decimal arithmetic via integer tenths. |
| `src/cli.ts` | Interactive driver (`node src/cli.ts [--file <path>]`). |
| `tests/employeeManagement.test.ts` | 33 tests (unit + CLI end-to-end). |
| `TEST-LOG.md` | Test results + the full GnuCOBOL execution transcripts that ground the spec. |
| `ROLLOUT.md` | Step-by-step migration, fallback gates G1–G5, regression checks, open decisions. |
| `SOURCES.md` | Original URL, commit, license caveat, references. |
| `original/` | Verbatim copies of `Project1.cbl`, `EMPLOYEE-FILE.txt`, `README.md`. |
| `tmp/cobc-verify/`, `tmp/diff/`, `tmp/diff2/` | Evidence: the compiled original, its outputs, and the differential batteries. |

## Run it

```bash
# tests (Node >= 22.6, no installs)
node --test tests/employeeManagement.test.ts   # expect: 33 pass, 0 fail

# interactive use (writes ./EMPLOYEE-FILE.txt in the working directory)
node src/cli.ts
# with the original's path:
node src/cli.ts --file ../EMPLOYEE-FILE.txt
```

## Two findings that matter (read SPEC.md §6.1 before judging the code)

1. **The effective report threshold is 11.0, not 10.5.** The source says
   `>= 10.5` and the README says "10.5+", but the program as compiled and run
   under GnuCOBOL 3.1.2 prints rows only for years >= 11.0 (30+ differential
   runs + generated-code inspection in `TEST-LOG.md §3`). The port reproduces
   the observed 11.0 (`LONG_SERVICE_THRESHOLD_TENTHS = 110`); changing it to
   10.5 is a one-constant, business-decision change (ROLLOUT.md O-2).
2. **DISPLAY prints full-width fields.** The README's sample row
   `123456 123  JohnSmith15.5` is wrong; the real row is
   `123456 123  John                Smith               15.5` (20-char name
   fields with padding, 80-char header with trailing spaces). The port
   reproduces the real output byte-for-byte (verified by `diff`).

## Safety note

Piped stdin that ends without an `N` continue answer makes the original loop
forever writing zero-records (measured: 50,138 records in 3 seconds). The port
reproduces this faithfully — always end piped input with an `N` line.
See ROLLOUT.md §4 (H1).

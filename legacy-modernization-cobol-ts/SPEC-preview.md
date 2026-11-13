# Functional Spec — EMPLOYEE-MANAGEMENT-PROGRAM (COBOL → TypeScript)

## 1. Source identity

| Item | Value |
|---|---|
| Original program | `EMPLOYEE-MANAGEMENT-PROGRAM` (`Project1.cbl`) |
| Author / date in source | Arman Bhatia / Feb 10, 2025 |
| Repository | `ArmanBhatia0100/COBOL_Employee_Management_Program` (see `SOURCES.md`) |
| Commit verified | `4de880b` ("Update README.md"); repo contains exactly `Project1.cbl`, `EMPLOYEE-FILE.txt`, `README.md` |
| Local copy | `original/Project1.cbl` (byte-identical copy of the cloned file) |
| Language / compiler assumed | COBOL, GnuCOBOL (`cobc -x`). No compiler directives in source. |
| Target language | **TypeScript (Node.js 24, no dependencies)** — see §9 for the choice |

## 2. What the program does (one paragraph)

An interactive batch program in two phases. **Phase 1 (capture):** it repeatedly prompts the
operator for one employee's ID, department code, first name, last name and years of service,
appends each record to a line-sequential text file, and stops only when the operator answers
the continue prompt with exactly `N`. **Phase 2 (report):** it re-opens the same file for
reading, prints a fixed header plus an 80-dash separator, then prints one row per record whose
years of service pass the filter — the source says `>= 10.5`, but the program **as compiled
and run under GnuCOBOL 3.1.2 actually filters at `>= 11.0`** (see R1 and §6.1; this is the
single most important finding of this package) — and stops at end-of-file. The file is
**overwritten on every run** — there is no append mode and no way to keep records from a
previous run.

## 3. Data dictionary (exact, from the DATA DIVISION)

### 3.1 File record — `EMPLOYEE-INFO` (FD `EMPLOYEES-FILE`)

| Field | COBOL picture | Size | Semantics |
|---|---|---|---|
| `EMP-ID` | `PIC 9(6)` | 6 chars | Unsigned integer, zero-padded on output (`000123`). Range 0–999999. |
| `EMP-DEP-CODE` | `PIC 9(3)` | 3 chars | Unsigned integer, zero-padded (`007`). Range 0–999. |
| `FIRST-NAME` | `PIC A(20)` | 20 chars | Alphabetic + space, left-justified, space-padded to 20. |
| `LAST-NAME` | `PIC A(20)` | 20 chars | As above. |
| `YEAR-OF-SERVICE` | `PIC 99.9` | 4 chars on disk | 2 integer digits, explicit decimal point, 1 fractional digit, e.g. `23.7`. Range 0.0–99.9. |

Logical record length on disk = 6 + 3 + 20 + 20 + 4 = **53 characters**, one record per line
(LINE SEQUENTIAL). There is no record separator/terminator field and no header row in the file.

Verified against the file committed in the repo (`original/EMPLOYEE-FILE.txt`):

```
001234123Arman               bh                  23.7
000565066a                   b                   65.9
```

i.e. `001234` + `123` + `Arman`+15 spaces + `bh`+18 spaces + `23.7`. The second line also shows
the program stores whatever was typed (`a`, `b`) — there is no validation.

### 3.2 Working storage

| Field | Picture | Initial value | Role |
|---|---|---|---|
| `EOF-FLAG` | `PIC X(1)` | `"N"` | Loop-control flag, reused by both phases. Reset to `"N"` in 101, 103 and 201. |
| `I-PROMPT` | `PIC A(1)` | *(none — uninitialised)* | Holds the continue answer; only its first character is ever read. |
| `I-EMP-ID` / `I-EMP-DEP-CODE` / `I-YEAR-OF-SERVICE` | `9(6)` / `9(3)` / `99.9` | *(none)* | ACCEPT buffers, then `MOVE`d 1:1 into the file record (same pictures, so the MOVE is a no-op copy). |
| `I-FIRST-NAME` / `I-LAST-NAME` | `A(20)` | *(none)* | ACCEPT buffers, `MOVE`d 1:1 into the file record. |
| `HEADER-LINE` | `PIC X(80)` | *(none)* | Built by `FUNCTION CONCATENATE` in 210-PRINT-HEADER. |
| `SEPARATOR-LINE` | `PIC X(80)` | `ALL "-"` | 80 hyphens. |

No other global state exists. No dates, clocks, random numbers, environment variables or
configuration are read.

## 4. Control flow (paragraph map, PROCEDURE DIVISION)

```
100-PRODUCE-EMPLOYEE-RECORDS            (main)
  ├─ 101-INITIALIZE-OUTPUT-FILE        OPEN OUTPUT EMPLOYEES-FILE; EOF-FLAG := "N"
  ├─ 102-GET-INPUT-FROM-USER  UNTIL EOF-FLAG = "Y"     (capture loop)
  ├─ 103-CLOSE-OUTPUT-FILE             CLOSE; EOF-FLAG := "N"
  ├─ 201-INITIALIZE-INPUT-FILE         OPEN INPUT EMPLOYEES-FILE; EOF-FLAG := "N"
  ├─ 210-PRINT-HEADER                  DISPLAY header line, then separator line
  ├─ 202-GET-RECORD-FROM-FILE UNTIL EOF-FLAG = "Y"     (report loop)
  ├─ 203-CLOSE-INPUT-FILE              CLOSE
  └─ STOP RUN
```


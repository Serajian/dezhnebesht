# Sources behind `base` — the one entry in the ACID topic with no blocks

<!-- markdownlint-disable -->

Every other claim in the ACID topic names an engine version and a sequence a
reader can re-run: PostgreSQL 18.6, MySQL 8.4.11, a transcript, an answer. The
`base` entry (`data/acid/entries/limits.json`) cannot work that way — its
MongoDB and DynamoDB claims are about *vendor documentation*, not about a
process anyone here can start. So it is the only entry whose claims are not
reproducible from the entry text, and this file is what stands in for that.

Each claim below was **read off the live page**, not recalled, on
**2026-08-30**, while stage 11 was being written and again during its review.
Neither vendor stamps a document version on these pages, which is precisely why
the entry could not carry an anchor and why the read date is recorded here
instead. Treat that date as the freshness of every row. The numeric half of
this table also lives in `tools/acid/check5.py`'s `ALLOWED` map (extended by
`check11.py`), which refuses any numeral in `base`'s prose that has no row —
so a number added later without a source turns that checker red.

| claim in `base` | source read |
|---|---|
| BASE was first defined in Fox, Gribble, Chawathe, Brewer and Gauthier, "Cluster-Based Scalable Network Services", SOSP, October 1997 — and defined *by negation*: anything not strictly ACID is BASE | the paper itself, page 3 |
| the same paper calls classifying a whole service as one or the other simplistic; its own services had an ACID component and mostly BASE data | same page |
| Dan Pritchett, "BASE: An Acid Alternative", ACM Queue 6(3), 2008 | dblp listing — venue, volume, year, pages 48–55, DOI |
| MongoDB has multi-document ACID transactions from 4.0 (2018), and across a sharded cluster from 4.2 (2019) | mongodb.com's own version history |
| the current manual states this as a minimum `featureCompatibilityVersion`: 4.0 for a replica set, 4.2 for a sharded cluster | MongoDB Manual, `core/transactions/` — the FCV table and the Important callout on that page |
| MongoDB's warning that a distributed transaction usually costs more than a single-document write and should not stand in for schema design | same page |
| DynamoDB got transactions on 27 November 2018 | AWS What's New, the November 2018 announcement page |
| `TransactWriteItems` / `TransactGetItems`, up to 100 actions on up to 100 distinct items, all-or-nothing, 4 MB aggregate ceiling, within one account and one Region | Amazon DynamoDB Developer Guide, `transaction-apis` page |
| serializable between a transactional operation and any single-item read or write; read committed for `Query` / `Scan` taken as a unit | the isolation table on that same page |
| the ACID guarantees hold only within the Region the write was invoked in, and a global table's other Region can observe a partially completed transaction | that same page, "Using transactional APIs with global tables" |

## What was cut rather than softened

The topic's standing rule is that an unmeasured claim is measured or removed —
never hedged. Three things went out of `base` under it, and they are recorded
here so nobody puts them back from memory:

- **MongoDB's transaction lifetime limit.** The parameters page fetched was
  truncated before `transactionLifetimeLimitSeconds`, and two different
  defaults (30 s and 60 s) are in circulation. Cut entirely — not turned into
  "about a minute".
- **A date range for when "NoSQL means no ACID" was true.** A draft said
  "roughly 2009 to 2012". That is an impression. What shipped names only the
  dates that were checked.
- **A claim that the vendors have dropped the BASE vocabulary.** Not checkable
  across "their documentation" as a whole. What shipped is the narrow observed
  fact: the DynamoDB transactions page talks in *serializable* and *read
  committed*.

One correction worth keeping: BASE is **not** a 2008 Pritchett coinage. Both
recall and web summaries said it was; the 1997 paper settled it, and 2008 is
when the acronym was popularised.

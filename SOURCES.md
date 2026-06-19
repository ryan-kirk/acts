# SOURCES

## Purpose

This document records the textual and external sources used by Bible Time & Place Explorer and shows what the application has currently extracted from each New Testament book.

The repository currently models Matthew, Mark, Luke, John, and Acts as canonical scripture datasets. Every other New Testament book listed below is included as a planned source entry with its present extraction status set to none.

## Phase 13 Progress

- Completed the first public source inventory for all `27` New Testament books.
- Confirmed the current app remains citation-only for scripture rather than embedding translation text.
- Defined the preferred `ESV` rights workflow for any future text excerpts.
- Published canonical source-metadata conventions and planned source IDs for the remaining books.

## Phase 14 Progress

- Added first-class canonical `books` records to the shared schema and current Luke or Acts datasets.
- Added modeled `literary_units` for both Luke and Acts so non-journey structure can be explored explicitly.
- Verified epistolary and apocalyptic modeling in tests with non-shipped Romans and Revelation fixtures.
- Structured scripture-source legal guardrails now include trademark and commercial-use notes in addition to citation-only rights status.

## Phase 15 Progress

- Added canonical Matthew and Mark datasets with shared-ID reuse for core people and places.
- Expanded Luke with additional synoptic anchor events so continuity claims can link across Matthew, Mark, and Luke.
- Added merged synoptic continuity claims for baptism, feeding, and Jerusalem-entry parallels without collapsing witness-specific event summaries.
- Expanded the embedded library to `4` canonical books, `45` events, `16` literary units, and `18` merged claims.

## Phase 16 Progress

- Added a canonical John dataset with `13` events, `6` places, `10` people, `4` literary units, `9` tags, and `6` Johannine claims.
- Expanded the embedded library to `5` canonical books, `58` events, `20` literary units, and `24` merged claims.
- Added Johannine narrative semantics for signs, discourses, and feast-linked chronology so John can be explored without flattening its structure into generic event cards.
- Added `carson_john_commentary` as a tracked external source backing Johannine literary and chronology claims without embedding copyrighted prose.

## Preferred Scripture Version

- Preferred scripture basis for future New Testament extraction: `ESV`
- Current repository behavior: the app stores scripture citations and canonical record summaries, not embedded Bible translation text
- Current scripture rights posture in dataset records: `usage_rights.status: not_applicable` because only citations are stored, while trademark and commercial-use notes are tracked for future `ESV` releases
- Required follow-up before any ESV text is embedded in the UI:
  - confirm allowed use
  - record attribution requirements
  - surface rights details to users
  - distinguish citation-only records from licensed text excerpts

## Current Canonical Coverage

Current modeled scripture datasets:

- [data/matthew.yaml](data/matthew.yaml): `1` book record, `4` literary units, `8` events, `7` places, `7` people, `2` relationships, `7` tags, `6` claims
- [data/mark.yaml](data/mark.yaml): `1` book record, `4` literary units, `8` events, `7` places, `7` people, `2` relationships, `7` tags, `4` claims
- [data/luke.yaml](data/luke.yaml): `1` book record, `4` literary units, `12` events, `9` places, `11` people, `3` relationships, `9` tags, `8` claims
- [data/john.yaml](data/john.yaml): `1` book record, `4` literary units, `13` events, `6` places, `10` people, `3` relationships, `9` tags, `6` claims
- [data/acts.yaml](data/acts.yaml): `1` book record, `4` literary units, `17` events, `20` places, `14` people, `4` journeys, `5` relationships, `15` tags, `7` claims

Fixture-only verification coverage:

- `Romans`: validated in tests as an epistolary fixture with sender, recipient, composition place, destination, and argument-unit modeling, but not yet shipped as `data/romans.yaml`
- `Revelation`: validated in tests as an apocalyptic fixture with recipient-network context and vision-unit modeling, but not yet shipped as `data/revelation.yaml`

## ESV Rights Workflow

### Current Mode

- The repository currently stores citation-backed records and dataset summaries only.
- No ESV verse text, paragraph text, or long quotation text is embedded in the app today.
- Scripture source records therefore remain `citation-only` and use `usage_rights.status: not_applicable`.

### Published ESV Quotation Limits

Based on Crossway's published `ESV` copyright guidance, direct quotation use without separate written permission must stay within all of these limits:

- no more than `500` consecutive verses
- less than one-half of any one biblical book
- less than `25%` of the total text of the work in which the quotation appears

These limits should be treated as cumulative release gates for any future in-app quotation, export, or downloadable artifact that includes direct `ESV` wording.

### What Counts As Embedded ESV Text

The following should be treated as licensed Bible-text usage and not as citation-only metadata:

- verse text copied into event summaries
- quotations rendered in inspector panels
- searchable passage text stored in datasets
- chapter or pericope excerpts shown in source panels
- downloadable exports that include ESV wording beyond brief allowed citations

### Required Workflow Before Any ESV Text Ships

1. Confirm the exact ESV permission terms that apply to the intended usage.
2. Record the permission basis and attribution requirements in the relevant scripture source record.
3. Update `usage_rights` fields so the dataset captures rights status, attribution text, usage notes, and review state.
4. Surface the required attribution and any usage limits to users in the sources UI and any text-bearing panels.
5. Keep a clear distinction between citation-only records and licensed text-bearing records in documentation and validation checks.
6. Re-review release content before deployment so no untracked ESV text slips into summaries, claims, or exports.
7. Verify that any quotation remains below the published verse-count, single-book, and total-work thresholds unless written permission is on file.
8. Block release of any commercial commentary or Bible reference feature that uses direct `ESV` text until written permission is documented.
9. Do not use `ESV`, `English Standard Version`, `Global Study Bible`, or the ESV logo as product branding without prior permission.

### Attribution And Trademark Notes

- Printed works and equivalent digital or visual media that quote direct `ESV` text require the published Crossway copyright notice in the corresponding location.
- When more than one translation is quoted, the product must distinguish `ESV` quotations clearly, such as by marking them with `(ESV)`.
- Non-saleable digital or print media may use the shorter notation rule, but `(ESV)` must still appear at the end of the quotation.
- `ESV`, `English Standard Version`, `Global Study Bible`, and the ESV logo are registered trademarks and are not available for app branding without permission.

### Suggested `usage_rights` States For Scripture Sources

| Scenario | Recommended Status | Notes |
| --- | --- | --- |
| Citation-only scripture source with no embedded translation text | `not_applicable` | Current Matthew, Mark, Luke, John, and Acts posture |
| Translation text approved for limited reuse and attribution is ready | `cleared` | Use only after rights review is complete |
| Translation text desired but permission terms still incomplete or restrictive | `restricted` | Do not ship the text yet |

## Canonical Scripture Source Metadata Conventions

Future New Testament scripture source records should follow these conventions:

| Field | Convention |
| --- | --- |
| `id` | Stable lowercase snake_case book ID such as `matthew`, `mark`, `john`, `romans`, or `1_corinthians` |
| `name` | Standard English book title such as `Gospel of Matthew` or `1 Corinthians` |
| `type` | Always `scripture` for canonical New Testament book records |
| `citation` | Book-level citation seed such as `New Testament, Matthew 1-28` or `New Testament, Romans 1-16` |
| `author` | Use a cautious attribution note when helpful, such as `Traditionally attributed to Paul` or `Author not named in the text` |
| `usage_rights.status` | Default to `not_applicable` while records remain citation-only |
| `usage_rights.attribution_text` | State clearly that the dataset stores citations and modeled records, not embedded translation text |
| `usage_rights.usage_notes` | Note what additional review would be needed before any translation text, quotation, or export is added |
| `usage_rights.trademark_usage_note` | Record any trademark restrictions, including that `ESV` names or logos are not branding-safe without permission |
| `usage_rights.commercial_use_note` | Record the commercial-release restriction for any future direct `ESV` text usage |
| `usage_rights.requires_written_permission_for_commercial_use` | Set to `true` for scripture sources when future direct commercial text use would require written permission |

### Suggested Source Record Template

```yaml
- id: matthew
  name: Gospel of Matthew
  type: scripture
  citation: New Testament, Matthew 1-28
  author: Traditionally attributed to Matthew
  usage_rights:
    status: not_applicable
    attribution_text: >
      This dataset stores canonical scripture citations and modeled records,
      not embedded ESV translation text.
    usage_notes: >
      Any future ESV quotation or passage display requires explicit rights
      review, attribution verification, and user-facing license surfacing.
    trademark_usage_note: >
      ESV names and logos must not be used as product branding without prior
      permission.
    commercial_use_note: >
      Any commercial Bible-reference workflow that embeds direct ESV text
      requires written permission before release.
    requires_written_permission_for_commercial_use: true
```

## Planned Canonical Scripture Source IDs

This registry is the recommended public-facing source-ID plan for the full New Testament library.

| Order | Book | Planned Source ID | Planned Source Name | Base Citation Seed |
| --- | --- | --- | --- | --- |
| 1 | Matthew | `matthew` | Gospel of Matthew | `New Testament, Matthew 1-28` |
| 2 | Mark | `mark` | Gospel of Mark | `New Testament, Mark 1-16` |
| 3 | Luke | `luke` | Gospel of Luke | `New Testament, Luke 1-24` |
| 4 | John | `john` | Gospel of John | `New Testament, John 1-21` |
| 5 | Acts | `acts` | Book of Acts | `New Testament, Acts 1-28` |
| 6 | Romans | `romans` | Romans | `New Testament, Romans 1-16` |
| 7 | 1 Corinthians | `1_corinthians` | 1 Corinthians | `New Testament, 1 Corinthians 1-16` |
| 8 | 2 Corinthians | `2_corinthians` | 2 Corinthians | `New Testament, 2 Corinthians 1-13` |
| 9 | Galatians | `galatians` | Galatians | `New Testament, Galatians 1-6` |
| 10 | Ephesians | `ephesians` | Ephesians | `New Testament, Ephesians 1-6` |
| 11 | Philippians | `philippians` | Philippians | `New Testament, Philippians 1-4` |
| 12 | Colossians | `colossians` | Colossians | `New Testament, Colossians 1-4` |
| 13 | 1 Thessalonians | `1_thessalonians` | 1 Thessalonians | `New Testament, 1 Thessalonians 1-5` |
| 14 | 2 Thessalonians | `2_thessalonians` | 2 Thessalonians | `New Testament, 2 Thessalonians 1-3` |
| 15 | 1 Timothy | `1_timothy` | 1 Timothy | `New Testament, 1 Timothy 1-6` |
| 16 | 2 Timothy | `2_timothy` | 2 Timothy | `New Testament, 2 Timothy 1-4` |
| 17 | Titus | `titus` | Titus | `New Testament, Titus 1-3` |
| 18 | Philemon | `philemon` | Philemon | `New Testament, Philemon 1` |
| 19 | Hebrews | `hebrews` | Hebrews | `New Testament, Hebrews 1-13` |
| 20 | James | `james` | James | `New Testament, James 1-5` |
| 21 | 1 Peter | `1_peter` | 1 Peter | `New Testament, 1 Peter 1-5` |
| 22 | 2 Peter | `2_peter` | 2 Peter | `New Testament, 2 Peter 1-3` |
| 23 | 1 John | `1_john` | 1 John | `New Testament, 1 John 1-5` |
| 24 | 2 John | `2_john` | 2 John | `New Testament, 2 John 1` |
| 25 | 3 John | `3_john` | 3 John | `New Testament, 3 John 1` |
| 26 | Jude | `jude` | Jude | `New Testament, Jude 1` |
| 27 | Revelation | `revelation` | Revelation | `New Testament, Revelation 1-22` |

## New Testament Book Inventory

### Gospels

| Order | Book | Corpus | Current Status | Current Extracted Data | Preferred Source Basis | Planned Extraction Focus |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Matthew | Gospel | Modeled | `8` events, `7` places, `7` people, `2` relationships, `7` tags, `6` claims; no journeys | Current source id `matthew`; citation-only scripture record now, ESV preferred for future text alignment | Continue expanding teaching blocks, passion, resurrection, and Matthean fulfillment or kingdom emphasis |
| 2 | Mark | Gospel | Modeled | `8` events, `7` places, `7` people, `2` relationships, `7` tags, `4` claims; no journeys | Current source id `mark`; citation-only scripture record now, ESV preferred for future text alignment | Continue expanding conflict scenes, passion chronology, and Markan literary or ending claims |
| 3 | Luke | Gospel | Modeled | `12` events, `9` places, `11` people, `3` relationships, `9` tags, `8` claims; no journeys | Current source id `luke`; citation-only scripture record now, ESV preferred for future text alignment | Continue expanding infancy, ministry, resurrection, and Luke-to-Acts continuity coverage |
| 4 | John | Gospel | Modeled | `13` events, `6` places, `10` people, `3` relationships, `9` tags, `6` claims; no journeys | Current source id `john`; citation-only scripture record now, ESV preferred for future text alignment | Continue expanding farewell discourse detail, passion chronology, resurrection witness, and Johannine continuity into the epistles |

### History

| Order | Book | Corpus | Current Status | Current Extracted Data | Preferred Source Basis | Planned Extraction Focus |
| --- | --- | --- | --- | --- | --- | --- |
| 5 | Acts | History | Modeled | `17` events, `20` places, `14` people, `4` journeys, `5` relationships, `15` tags, `7` claims | Current source id `acts`; citation-only scripture record now, ESV preferred for future text alignment | Continue filling narrative gaps, relationships, and external-source grounding across the full travel narrative |

### Pauline Epistles

| Order | Book | Corpus | Current Status | Current Extracted Data | Preferred Source Basis | Planned Extraction Focus |
| --- | --- | --- | --- | --- | --- | --- |
| 6 | Romans | Pauline Epistle | Planned | None yet extracted | ESV preferred; no source record yet | Letter composition context, sender-recipient network, Rome geography, argument units, and related historical claims |
| 7 | 1 Corinthians | Pauline Epistle | Planned | None yet extracted | ESV preferred; no source record yet | Corinthian church issues, co-workers, travel plans, resurrection tradition anchors, and local relationship context |
| 8 | 2 Corinthians | Pauline Epistle | Planned | None yet extracted | ESV preferred; no source record yet | Correspondence sequence, Macedonia and Achaia context, hardship and reconciliation themes, and ministry network links |
| 9 | Galatians | Pauline Epistle | Planned | None yet extracted | ESV preferred; no source record yet | Recipients, Antioch and Jerusalem controversy ties, chronology questions, and mission-network claims |
| 10 | Ephesians | Pauline Epistle | Planned | None yet extracted | ESV preferred; no source record yet | Captivity context, Asia Minor network, ecclesial themes, and letter metadata for sender, destination, and delivery |
| 11 | Philippians | Pauline Epistle | Planned | None yet extracted | ESV preferred; no source record yet | Imprisonment setting, Philippi ties, co-worker network, and dispatch context |
| 12 | Colossians | Pauline Epistle | Planned | None yet extracted | ESV preferred; no source record yet | Colossae and Laodicea network, co-senders, household context, and Christology-oriented claims |
| 13 | 1 Thessalonians | Pauline Epistle | Planned | None yet extracted | ESV preferred; no source record yet | Early Pauline chronology, Thessalonian recipients, mission aftermath, and pastoral encouragement context |
| 14 | 2 Thessalonians | Pauline Epistle | Planned | None yet extracted | ESV preferred; no source record yet | Thessalonian follow-up, eschatology claims, and authorship metadata with explicit uncertainty if needed |
| 15 | 1 Timothy | Pauline Epistle | Planned | None yet extracted | ESV preferred; no source record yet | Ephesus setting, church-order relationships, delegate network, and pastoral instruction context |
| 16 | 2 Timothy | Pauline Epistle | Planned | None yet extracted | ESV preferred; no source record yet | Imprisonment setting, final exhortation network, co-workers, and later Pauline chronology anchors |
| 17 | Titus | Pauline Epistle | Planned | None yet extracted | ESV preferred; no source record yet | Crete setting, elder appointment context, delegate network, and pastoral governance relationships |
| 18 | Philemon | Pauline Epistle | Planned | None yet extracted | ESV preferred; no source record yet | House-church context, Onesimus and Philemon relationship graph, co-senders, and local place metadata |

### General Epistles And Hebrews

| Order | Book | Corpus | Current Status | Current Extracted Data | Preferred Source Basis | Planned Extraction Focus |
| --- | --- | --- | --- | --- | --- | --- |
| 19 | Hebrews | General Epistle | Planned | None yet extracted | ESV preferred; no source record yet | Sermon-letter hybrid structure, uncertain destination or authorship claims, argument units, and Old Testament citation anchors |
| 20 | James | General Epistle | Planned | None yet extracted | ESV preferred; no source record yet | Jerusalem-linked network context, ethical instruction units, audience metadata, and wisdom-themed claims |
| 21 | 1 Peter | General Epistle | Planned | None yet extracted | ESV preferred; no source record yet | Diaspora audience mapping, suffering themes, Petrine network context, and Asia Minor place associations |
| 22 | 2 Peter | General Epistle | Planned | None yet extracted | ESV preferred; no source record yet | Authorship and dating uncertainty, thematic units, and relationship to Jude where relevant |
| 23 | 1 John | General Epistle | Planned | None yet extracted | ESV preferred; no source record yet | Johannine community relationships, thematic units, and linked people or church-network context where supportable |
| 24 | 2 John | General Epistle | Planned | None yet extracted | ESV preferred; no source record yet | Short-letter metadata, recipient uncertainty, and Johannine community linkage |
| 25 | 3 John | General Epistle | Planned | None yet extracted | ESV preferred; no source record yet | House-church relationships, named-person network, hospitality dispute context, and local church metadata |
| 26 | Jude | General Epistle | Planned | None yet extracted | ESV preferred; no source record yet | Polemical argument units, intertextual claims, and relationship to 2 Peter where relevant |

### Apocalypse

| Order | Book | Corpus | Current Status | Current Extracted Data | Preferred Source Basis | Planned Extraction Focus |
| --- | --- | --- | --- | --- | --- | --- |
| 27 | Revelation | Apocalypse | Planned | None yet extracted | ESV preferred; no source record yet | Patmos setting, seven churches, vision sequences, imperial context, symbolic claims, and apocalyptic timeline handling |

## Current External Sources Modeled In The App

These are the non-scripture sources currently present in the canonical Matthew, Mark, Luke, John, and Acts datasets.

| Source ID | Source | Type | Rights Status | Current Use In App | Current Linked Dataset(s) |
| --- | --- | --- | --- | --- | --- |
| `josephus_antiquities` | Antiquities of the Jews | Historical | `cleared` | Supports `1` modeled claim tied to Acts historical context | Acts |
| `gallio_inscription` | Gallio Inscription (Delphi) | Archaeological | `cleared` | Supports `1` chronology anchor claim | Acts |
| `temple_warning_inscription` | Temple Warning Inscription | Archaeological | `cleared` | Supports `1` Jerusalem arrest-context claim | Acts |
| `aratus_phaenomena` | Phaenomena | Book | `cleared` | Supports `1` literary-context claim around the Areopagus address | Acts |
| `eusebius_church_history` | Ecclesiastical History | Historical | `cleared` | Supports `1` later-tradition claim for Rome context | Acts |
| `barrington_atlas` | Barrington Atlas of the Greek and Roman World | Atlas | `restricted` | Supports `4` mapping-oriented claims across Luke and Acts | Luke and Acts |
| `codex_bezae` | Codex Bezae Cantabrigiensis | Manuscript | `cleared` | Supports `2` manuscript-witness claims across Luke and Acts | Luke and Acts |
| `winter_gallio_judgement` | Rehabilitating Gallio and his Judgement in Acts 18:14-15 | Scholarly article | `restricted` | Supports `1` Acts chronology and legal-context claim | Acts |
| `witherington_acts_commentary` | The Acts of the Apostles | Commentary | `restricted` | Supports `3` Acts interpretive claims | Acts |
| `france_matthew_commentary` | The Gospel of Matthew | Commentary | `restricted` | Supports `2` Matthew literary or mission claims | Matthew |
| `edwards_mark_commentary` | The Gospel According to Mark | Commentary | `restricted` | Supports `1` Mark ending-structure claim | Mark |
| `green_luke_commentary` | The Gospel of Luke | Commentary | `restricted` | Supports `4` Luke interpretive claims | Luke |
| `fitzmyer_luke_anchor` | The Gospel According to Luke | Book | `restricted` | Supports `2` Luke interpretive claims | Luke |
| `carson_john_commentary` | The Gospel According to John | Commentary | `restricted` | Supports `6` Johannine literary, chronology, and witness-context claims | John |

## Notes For Future Source Population

- Every future New Testament book should receive its own canonical scripture source entry even if the app continues to store citations rather than translation text.
- Narrative books should usually expand `events`, `places`, `people`, `relationships`, `tags`, and `claims`.
- Epistles will likely require stronger support for letter metadata, sender-recipient relationships, recipient churches, dispatch places, and thematic or literary units.
- Revelation will require explicit handling for vision sequences, symbolic layers, and church-location records without overstating chronology.

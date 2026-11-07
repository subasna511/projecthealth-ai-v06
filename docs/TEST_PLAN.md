# ProjectHealth AI v0.6 — Test plan and evidence log

Mark **PASS** only after observing the result locally. Record date, tester, evidence screenshot and defects.

| ID | Test | Expected result | Result | Evidence |
|---|---|---|---|---|
| T01 | Register then log out and log in | Same account works | Not run | |
| T02 | Restart Docker without `-v` | Account/projects persist | Not run | |
| T03 | Connect to Asana using OAuth | Connection shown | Previously demonstrated; recheck | |
| T04 | Import Asana project | Task titles appear | Previously demonstrated; recheck | |
| T05 | Change task in Asana, manually sync | Changed task appears locally | Not independently verified | |
| T06 | Change task locally, check Asana | Asana is **not** changed (read-only integration) | Not run | |
| T07 | Run automatic task assessment | New score/history entry appears | Previously demonstrated; recheck | |
| T08 | Enter all five factors as 0, 40, 70, 100 | High, Medium, Low, Low respectively | Not run | |
| T09 | Trigger high risk | Alert appears; can mark read | Not run | |
| T10 | Import invalid CSV/JSON | Helpful error, no crash | Not run | |
| T11 | Disconnect/reconnect Asana | OAuth flow works again | Not run | |
| T12 | Wait 15+ minutes after Asana edit | Scheduled sync updates imported task | Not run | |
| T13 | Review portfolio analytics | Bars match scored projects and risk labels | Not run | |
| T14 | Export score history CSV | CSV contains expected rows | Not run | |

Automated engine tests: `docker compose exec ai-engine python -m unittest -v test_engine` (after rebuilding v0.6). This command does not test OAuth, database persistence or browser interactions.

**Defect log:** ID | severity | steps to reproduce | expected | actual | resolution | retest.

# Technical overview

- **Frontend:** React + TypeScript (Vite), browser dashboard at port 5173.
- **Backend:** Express/Node.js REST API at port 3001, authentication, Asana OAuth, imports, sync, alerts, persistence.
- **AI engine:** FastAPI/Python at port 8000. Despite its name, it performs explainable weighted heuristic scoring, not predictive ML.
- **Database:** PostgreSQL, Docker named volume for persistence.
- **Asana:** OAuth 2.0 with read-only scopes. Client secret and tokens stay server-side; use `.env` only for local configuration.
- **Assessment weights:** task completion 30%, overdue tasks 25%, member activity 20%, workload equity 15%, communication 10%.
- **Risk thresholds:** Low >=70; Medium >=40 and <70; High <40. These are prototype policy thresholds, not validated statistical cutoffs.
- **Task heuristics:** completion fraction; overdue fraction; recent task modification proxy for activity; assignee count balance proxy for workload; neutral communication=50. Missing assignees/due dates reduce interpretability.
- **Known limitations:** no trained predictive model; read-only Asana integration; local status changes may be overwritten on subsequent sync; task-modification timestamps are a weak proxy for real team participation; no verified production hardening.

Architecture: Browser -> Express API -> PostgreSQL; Express API -> FastAPI scoring; Express API <-> Asana REST/OAuth.

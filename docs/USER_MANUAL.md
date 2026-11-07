# ProjectHealth AI v0.6 — User manual

1. Extract the ZIP, open the folder in VS Code, and copy `.env.example` to `.env`.
2. Enter Asana OAuth client ID/secret and strong, distinct JWT and token encryption keys in `.env`; never share them.
3. Start Docker Desktop; run `docker compose up --build` from this folder.
4. Open `http://localhost:5173`, register or sign in.
5. Click **Connect to Asana**, approve read-only access, then **Import & analyse** beside a project.
6. Select a project to view tasks and health score. **Sync imported projects now** reads the latest Asana data.
7. **Calculate automatically from tasks** saves a heuristic score; **Calculate & save assessment** uses the five manually entered factor scores instead.
8. Review portfolio analytics, recommendations, alert history, and export score history as CSV.
9. Stop with `docker compose down` (without `-v`) to retain data.

**Limitations:** The application is a development prototype. Local task edits do not write to Asana. The score is a weighted heuristic, not trained predictive machine learning. Communication is fixed at 50 for task-derived scores. The Asana connection requires OAuth credentials and an authorized workspace.

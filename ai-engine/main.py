from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title='ProjectHealth AI Engine')
WEIGHTS = {'task_completion': .30, 'overdue_tasks': .25, 'member_activity': .20, 'workload_equity': .15, 'communication': .10}
class Scores(BaseModel):
    task_completion: float = Field(ge=0, le=100)
    overdue_tasks: float = Field(ge=0, le=100)
    member_activity: float = Field(ge=0, le=100)
    workload_equity: float = Field(ge=0, le=100)
    communication: float = Field(ge=0, le=100)

@app.get('/health')
def health(): return {'status': 'ok'}

@app.post('/score')
def score(s: Scores):
    values = s.model_dump()
    health_score = round(sum(values[k]*w for k,w in WEIGHTS.items()), 2)
    risk = 'Low' if health_score >= 70 else 'Medium' if health_score >= 40 else 'High'
    weaknesses = sorted(values, key=lambda k: (100-values[k])*WEIGHTS[k], reverse=True)
    explanations = [f'{k.replace("_", " ").title()} score is {values[k]:g}/100 and contributes {WEIGHTS[k]*100:g}% to the health score.' for k in weaknesses[:3] if values[k] < 75]
    actions = {'task_completion':'Review unfinished tasks and assign owners.', 'overdue_tasks':'Prioritise overdue tasks and revise deadlines.', 'member_activity':'Contact inactive team members.', 'workload_equity':'Redistribute tasks across the team.', 'communication':'Schedule a team check-in.'}
    return {'health_score':health_score,'risk_level':risk,'contributing_factors':explanations,'recommendations':[actions[k] for k in weaknesses[:2]],'factor_scores':values,'method':'Transparent weighted scoring; not a trained ML model'}

from datetime import datetime, timezone, date
from typing import Any

class TaskBatch(BaseModel):
    tasks: list[dict[str, Any]] = Field(min_length=1, max_length=1000)

def derive_scores(tasks, today=None):
    """Heuristic demonstration: no predictive ML, no inferred communication history."""
    today = today or datetime.now(timezone.utc)
    n = len(tasks)
    done = sum(t.get('status') == 'done' for t in tasks)
    overdue = sum(t.get('status') != 'done' and t.get('due_date') and str(t['due_date'])[:10] < today.date().isoformat() for t in tasks)
    assignees = [str(t.get('assignee') or 'Unassigned') for t in tasks]
    counts = [assignees.count(x) for x in set(assignees) if x != 'Unassigned']
    equity = round(100 * min(counts) / max(counts), 2) if counts and max(counts) else 50
    active = 0
    for t in tasks:
        try:
            stamp = datetime.fromisoformat(str(t.get('last_activity', '')).replace('Z', '+00:00'))
            if stamp.tzinfo is None: stamp = stamp.replace(tzinfo=timezone.utc)
            if (today - stamp).total_seconds() <= 7 * 86400: active += 1
        except (ValueError, TypeError): pass
    scores = {'task_completion': round(100*done/n, 2),
              'overdue_tasks': round(100*(n-overdue)/n, 2),
              'member_activity': round(100*active/n, 2),
              'workload_equity': equity,
              'communication': 50.0}
    return scores

@app.post('/derive')
def derive(batch: TaskBatch):
    return {'factor_scores': derive_scores(batch.tasks), 'notes': [
        'Task completion and overdue factors are calculated from recorded tasks.',
        'Member activity is approximated from task last-modified timestamps.',
        'Workload equity is approximated from task counts per assignee.',
        'Communication is fixed at 50 because no message history is available.',
        'This is an explainable heuristic, not a validated prediction model.']}

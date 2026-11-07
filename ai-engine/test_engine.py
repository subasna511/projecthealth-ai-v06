import unittest
from datetime import datetime, timezone
from main import Scores, score, derive_scores

class EngineTests(unittest.TestCase):
    def test_weighted_score(self):
        result = score(Scores(task_completion=80, overdue_tasks=60, member_activity=70, workload_equity=90, communication=50))
        self.assertEqual(result['health_score'], 71.5)
        self.assertEqual(result['risk_level'], 'Low')
    def test_risk_boundaries(self):
        for n, risk in [(0,'High'),(39,'High'),(40,'Medium'),(69,'Medium'),(70,'Low'),(100,'Low')]:
            result=score(Scores(**{k:n for k in ['task_completion','overdue_tasks','member_activity','workload_equity','communication']}))
            self.assertEqual(result['risk_level'], risk)
    def test_task_heuristics(self):
        now=datetime(2026,11,8,tzinfo=timezone.utc)
        tasks=[{'status':'done','due_date':'2026-11-01','assignee':'A','last_activity':'2026-11-07T10:00:00Z'}, {'status':'todo','due_date':'2026-11-01','assignee':'B','last_activity':'2026-10-01T10:00:00Z'}]
        result=derive_scores(tasks,now)
        self.assertEqual(result['task_completion'],50)
        self.assertEqual(result['overdue_tasks'],50)
        self.assertEqual(result['member_activity'],50)
        self.assertEqual(result['workload_equity'],100)
        self.assertEqual(result['communication'],50)
    def test_invalid_factor(self):
        from pydantic import ValidationError
        with self.assertRaises(ValidationError):
            Scores(task_completion=101,overdue_tasks=0,member_activity=0,workload_equity=0,communication=0)

if __name__=='__main__':unittest.main()

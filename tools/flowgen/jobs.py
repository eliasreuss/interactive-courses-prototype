"""One generation at a time, on a worker thread, polled by the browser.

Nothing persists: jobs die with the server, because the output they produce
is already on disk by then. One concurrent job is deliberate — it is spend
control, not a scaling limit.
"""

import threading
import time
import uuid

from . import config, pipeline

MAX_KEEP = 20

_JOBS = {}
_ORDER = []
_LOCK = threading.Lock()


class Job:
    def __init__(self, prompt):
        self.id = uuid.uuid4().hex[:12]
        self.prompt = prompt
        self.status = "queued"
        self.phase_label = "Starting"
        self.progress = 0.0
        self.started_at = time.time()
        self.finished_at = None
        self.outline = None
        self.issues = []
        self.usage = {}
        self.result = None
        self.error = None
        self.draft = None
        self.cancel = threading.Event()

    def update(self, **fields):
        with _LOCK:
            for key, value in fields.items():
                setattr(self, key, value)

    @property
    def active(self):
        return self.status not in ("done", "error", "cancelled")

    def snapshot(self):
        with _LOCK:
            return {
                "job_id": self.id,
                "status": self.status,
                "phase_label": self.phase_label,
                "progress": round(self.progress, 3),
                "elapsed_s": round((self.finished_at or time.time()) - self.started_at, 1),
                "outline": self.outline,
                "issues": self.issues,
                "usage": self.usage,
                "result": self.result,
                "error": self.error,
                "has_draft": bool(self.draft),
            }


def current():
    with _LOCK:
        for job_id in reversed(_ORDER):
            job = _JOBS.get(job_id)
            if job and job.active:
                return job
    return None


def get(job_id):
    with _LOCK:
        return _JOBS.get(job_id)


def start(prompt):
    running = current()
    if running is not None:
        raise AlreadyRunning(running.id)

    job = Job(prompt)
    with _LOCK:
        _JOBS[job.id] = job
        _ORDER.append(job.id)
        while len(_ORDER) > MAX_KEEP:
            _JOBS.pop(_ORDER.pop(0), None)

    threading.Thread(target=_run, args=(job,), daemon=True).start()
    return job


def _run(job):
    from . import client  # local import: the SDK may not be installed

    try:
        result = pipeline.run(job.prompt, job=job)
    except client.Cancelled:
        job.update(status="cancelled", phase_label="Cancelled",
                   finished_at=time.time(), progress=0.0)
    except pipeline.GenerationFailed as exc:
        job.update(status="error", phase_label="Could not finish",
                   finished_at=time.time(),
                   issues=exc.issues, usage=exc.usage, draft=exc.draft,
                   error={"code": "validation_failed", "message": config.redact(exc)})
    except config.FlowgenUnavailable as exc:
        job.update(status="error", phase_label="Unavailable", finished_at=time.time(),
                   error={"code": "unavailable", "message": config.redact(exc)})
    except client.Refused as exc:
        job.update(status="error", phase_label="Declined", finished_at=time.time(),
                   error={"code": "refused", "message": config.redact(exc)})
    except Exception as exc:  # noqa: BLE001 — the browser needs *something* back
        job.update(status="error", phase_label="Something went wrong",
                   finished_at=time.time(),
                   error={"code": exc.__class__.__name__, "message": config.redact(exc)})
    else:
        job.update(status="done", phase_label="Ready", progress=1.0,
                   finished_at=time.time(),
                   result=result, issues=result.get("issues", []),
                   usage=result.get("usage", {}))


class AlreadyRunning(RuntimeError):
    def __init__(self, job_id):
        super().__init__("a generation is already running")
        self.job_id = job_id

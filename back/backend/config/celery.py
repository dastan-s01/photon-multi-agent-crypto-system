import os

from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("config")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

app.conf.beat_schedule = {
    "ai-agents-workflow": {
        "task": "trading.tasks.run_ai_agents_workflow",
        "schedule": 60.0,
    },
    # "periodic-market-update": {
    #     "task": "trading.tasks.periodic_market_update",
    # },
}
app.conf.timezone = "Asia/Almaty"


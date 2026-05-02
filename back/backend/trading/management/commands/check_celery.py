"""
Management command: verify Celery Beat and registered periodic tasks.
"""
from django.core.management.base import BaseCommand
from django_celery_beat.models import PeriodicTask
from celery import current_app


class Command(BaseCommand):
    help = "Check Celery Beat and periodic tasks"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("="*70))
        self.stdout.write(self.style.SUCCESS("CELERY BEAT CHECK"))
        self.stdout.write(self.style.SUCCESS("="*70))
        
        self.stdout.write("\n📅 PERIODIC TASKS:")
        try:
            tasks = PeriodicTask.objects.all()
            if tasks.exists():
                for task in tasks:
                    status = "✓ Enabled" if task.enabled else "✗ Disabled"
                    self.stdout.write(f"  {task.name:40} | {status}")
                    self.stdout.write(f"    Schedule: {task.schedule}")
                    self.stdout.write(f"    Task: {task.task}")
            else:
                self.stdout.write(self.style.WARNING("  No periodic tasks"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"  Error listing periodic tasks: {e}"))
        
        self.stdout.write("\n📋 REGISTERED TASKS:")
        try:
            registered_tasks = list(current_app.tasks.keys())
            ai_workflow_task = "trading.tasks.run_ai_agents_workflow"
            if ai_workflow_task in registered_tasks:
                self.stdout.write(self.style.SUCCESS(f"  ✓ {ai_workflow_task} is registered"))
            else:
                self.stdout.write(self.style.ERROR(f"  ✗ {ai_workflow_task} is NOT registered"))
                self.stdout.write(f"  Available tasks: {len(registered_tasks)}")
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"  Error checking registered tasks: {e}"))
        
        self.stdout.write("\n⚙️  CELERY SETTINGS:")
        try:
            from django.conf import settings
            broker_url = getattr(settings, "CELERY_BROKER_URL", "Not set")
            result_backend = getattr(settings, "CELERY_RESULT_BACKEND", "Not set")
            self.stdout.write(f"  Broker: {broker_url}")
            self.stdout.write(f"  Result backend: {result_backend}")
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"  Error reading settings: {e}"))
        
        self.stdout.write(self.style.SUCCESS("\n" + "="*70))
        self.stdout.write("\n💡 TIPS:")
        self.stdout.write("  1. Ensure Celery Beat is running:")
        self.stdout.write("     docker compose ps | grep celery-beat")
        self.stdout.write("  2. Inspect Beat logs:")
        self.stdout.write("     docker compose logs celery-beat | tail -50")
        self.stdout.write("  3. Inspect task logs:")
        self.stdout.write("     docker compose logs backend | grep 'ai agents workflow'")
        self.stdout.write("="*70)

# Copilot instructions for KinoPortal

This is a small Django project serving a simple film catalogue.  AI agents should read a few key files before making changes so they understand the architecture, data flows and existing conventions.

---

## Big picture

* Single Django project (`kinoportal`) with one app: `films`.
* `settings.py` uses SQLite, debug mode and serves static/media in `DEBUG`.  Media files live under `media/` and posters/videos are uploaded via `Film` model.
* Views are function‑based and live in `films/views.py`.  There are four public endpoints:
  * `/` ‑ the index page with optional filtering (`genre`, `year`, `min_rating`, `q`).
  * `/search/` ‑ search page; essentially the same filters as index with a `query` value passed back to template.
  * `/film/<slug>/` ‑ detail page where comments/ratings are posted and the view counter increments.
  * `/film/<slug>/play/` ‑ player page rendered from `player.html` at project root.
* URL patterns are declared in `films/urls.py` and included at the project level in `kinoportal/urls.py`.
* Templates are located under `templates/films/` plus a few shared ones (`base.html`, `player.html`).  Be careful: comparisons in templates **must** have spaces around `==` or Django's parser fails (see previously broken `index.html` and `search.html`).
* Static assets are in `static/` and served via `STATICFILES_DIRS`.  Custom CSS/JS for film cards live under `static/css` and `static/js`.

## Data model notes

* `Film`, `Genre`, `Rating`, `Comment` in `films/models.py`.  `Genre` is plain, `Film` contains both `video_file` and `video_url` fields (mutually exclusive).
* `Film` has convenience methods:
  * `get_absolute_url()` – used by views/templates.
  * `get_video_embed_url()` – converts a YouTube URL to its embeddable form.
  * `average_rating` property computes the average of related `Rating` records; the `rating` field is updated when a new rating is posted.
* `Rating.score` choices generated via `[(i, str(i)) for i in range(1,11)]`.
* There are no user accounts; comments/ratings are anonymous and stored as plain `CharField`/`IntegerField`.

## Coding patterns & conventions

* Filtering logic is duplicated in `index` and `search` views.  New features should keep these two views in sync or extract a helper function.
* When updating film rating or view count, `save(update_fields=[...])` is used to avoid unnecessary writes.
* Templates rely on context variables like `genres`, `years` and pass `selected_*` values back in the search page.
* Russian strings are used throughout templates and admin (project is Russian‑language).
* All templates load `{% load static %}` and extend `base.html`.
* The admin configuration in `films/admin.py` exposes all fields and prepopulates slugs from titles.

## Developer workflows

1. **Set up environment** – typical Django steps: `python -m venv venv`, `pip install -r requirements.txt` (none provided, just Django).  The code assumes Python 3.13 but will work on 3.11+.
2. **Migrations** – run `python manage.py migrate`.  `db.sqlite3` is the default database.
3. **Populate sample data** – either run `python manage.py shell -c "from populate import run; run()"` or execute the script inside the shell; it creates a few films, genres, ratings and comments.
4. **Run server** – `python manage.py runserver` (binds to localhost:8000).
5. **Create admin user** – `python manage.py createsuperuser` to manage films/genres/ratings/comments through /admin/.
6. **Checks** – use `python manage.py check` to surface Django configuration errors.  No unit tests exist; adding tests in `films/tests.py` is encouraged but not required.

## Common gotchas

* Template comparison spacing (see above).  Search for `==` in templates when debugging rendering errors.
* `Film.get_video_embed_url()` returns `None` if the URL isn't a YouTube link; calling code should handle that.
* The `populate.py` script imports models directly; if running outside Django (e.g. `python populate.py`) ensure `DJANGO_SETTINGS_MODULE=kinoportal.settings` and call `django.setup()` first.
* The `views.search` and `views.index` functions limit results to the latest 12 films on the front page; pagination is not implemented.
* Ratings and comments aren't rate‑limited; repeated POSTs will create many records.

## Extensibility points

* To add new filters (e.g. country), update both views and corresponding template selects.
* Switching to class‑based views is possible but not necessary given the small size.
* The `film_player` view is minimal – most logic lives in `player.html` and accompanying JS (`static/js/player.js`).
* Static asset building is manual; there is no webpack/ npm setup.  Add new CSS/JS under `static/` and reference via `{% static %}`.

---

### How to use these instructions

Agents should reference this file before editing code.  When creating new features or fixing bugs, point out any project‑specific behaviors (filters duplication, spacing in templates, reliance on `rating` field, etc.).  If you modify request handling or templates, verify the corresponding views/templates are kept consistent.

Feedback welcome if something isn't clear or needs more detail.
# HTMX Practice - Dua Collection

A Django project for practicing HTMX with a collection of duas (Islamic prayers).

## Setup

1. Install dependencies:
   ```bash
   uv sync
   ```

2. Run migrations:
   ```bash
   python manage.py migrate
   ```

3. Load initial data (if available):
   ```bash
   python manage.py loaddata fixtures/dua-collections-data.json
   ```

4. Run the development server:
   ```bash
   python manage.py runserver
   ```

## Data Management

### Updating Duas Data

To export/update the duas data from the database to the fixtures file, use:

```bash
python manage.py dumpdata --indent 2 > fixtures/dua-collections-data.json
```

This command will:
- Export all data from the database
- Format it with proper indentation (2 spaces)
- Save it to the fixtures file for version control and sharing

### Loading Data

To load the duas data into the database:

```bash
python manage.py loaddata fixtures/dua-collections-data.json
```

## Project Structure

- `dua_collection/` - Main Django app containing models, views, and admin configuration
- `fixtures/` - Contains JSON fixtures for database seeding
- `htmx_practice/` - Django project settings and configuration
- `db.sqlite3` - SQLite database file
- `manage.py` - Django management script
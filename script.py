from types import SimpleNamespace
import json

from dua_collection.models import Dua, Tag, Translation

def import_duas_from_json(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        all_duas = json.load(f, object_hook=lambda d: SimpleNamespace(**d))

    return all_duas

def save_duas_to_db(duas):
    for dua_data in duas:
        dua, created = Dua.objects.get_or_create(
            title=dua_data.title,
            defaults={
                'text': dua_data.content,
                'source': dua_data.referenceLink
            }
        )
        Translation.objects.get_or_create(
            dua=dua,
            language='en',
            defaults={'text': dua_data.translation}
        )

        for tag_name in dua_data.tags:
            tag, _ = Tag.objects.get_or_create(name=tag_name)
            dua.tags.add(tag)

file_path = 'duas.json'
duas = import_duas_from_json(file_path)
save_duas_to_db(duas)
print("Duas imported successfully.")


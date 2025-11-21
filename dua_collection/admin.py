from django.contrib import admin

from .models import Dua, Tag, Translation


class TranslationInline(admin.TabularInline):
    model = Translation
    extra = 1
    fields = ("language", "text")
    verbose_name = "Translation"
    verbose_name_plural = "Translations"


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("name", "dua_count")
    search_fields = ("name",)
    ordering = ("name",)

    def dua_count(self, obj):
        return obj.dua_set.count()

    dua_count.short_description = "Number of Duas"


@admin.register(Dua)
class DuaAdmin(admin.ModelAdmin):
    list_display = ("title", "get_tags", "translation_count", "source_link")
    list_filter = ("tags",)
    search_fields = ("title", "text")
    filter_horizontal = ("tags",)
    inlines = [TranslationInline]

    fieldsets = (
        (None, {"fields": ("title", "text")}),
        ("Metadata", {"fields": ("tags", "source"), "classes": ("collapse",)}),
    )

    def get_tags(self, obj):
        return ", ".join([tag.name for tag in obj.tags.all()[:3]]) + (
            "..." if obj.tags.count() > 3 else ""
        )

    get_tags.short_description = "Tags"

    def translation_count(self, obj):
        count = obj.translations.count()
        if count > 0:
            from django.urls import reverse
            from django.utils.html import format_html

            url = (
                reverse("admin:dua_collection_translation_changelist")
                + f"?dua__id__exact={obj.id}"
            )
            return format_html(
                '<a href="{}">{} translation{}</a>',
                url,
                count,
                "s" if count != 1 else "",
            )
        return "0"

    translation_count.short_description = "Translations"
    translation_count.allow_tags = True

    def source_link(self, obj):
        if obj.source:
            from django.utils.html import format_html

            return format_html(
                '<a href="{}" target="_blank">{}</a>',
                obj.source,
                obj.source[:50] + "..." if len(obj.source) > 50 else obj.source,
            )
        return "-"

    source_link.short_description = "Source"
    source_link.allow_tags = True


@admin.register(Translation)
class TranslationAdmin(admin.ModelAdmin):
    list_display = ("dua", "language", "text_preview")
    list_filter = ("language",)
    search_fields = ("dua__title", "text")
    ordering = ("dua__title", "language")

    def text_preview(self, obj):
        return obj.text[:50] + "..." if len(obj.text) > 50 else obj.text

    text_preview.short_description = "Text Preview"

from django.urls import path

from dua_collection.views import DuaListView, dua_translations_view, tag_search_view

app_name = "dua_collection"

urlpatterns = [
    path("", DuaListView.as_view(), name="dua_list"),
    path("tag-search/", tag_search_view, name="tag_search"),
    path(
        "dua/<int:dua_id>/translations/", dua_translations_view, name="dua_translations"
    ),
]

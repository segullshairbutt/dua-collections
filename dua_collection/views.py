from django.db.models import Count
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from django.views.generic.list import ListView

from .models import Dua, Tag


class DuaListView(ListView):
    model = Dua
    paginate_by = 10
    template_name = "dua_collection/dua_list.html"
    context_object_name = "duas"

    def get_queryset(self):
        queryset = Dua.objects.prefetch_related("tags").order_by("title")

        # Get tag IDs from query parameters
        tag_ids = self.request.GET.getlist("tags")
        if tag_ids:
            # Filter duas that have ALL selected tags
            for tag_id in tag_ids:
                queryset = queryset.filter(tags__id=tag_id)

        return queryset.distinct()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # Add all available tags to context, ordered by number of duas (most used first)
        from django.db.models import Count

        context["all_tags"] = Tag.objects.annotate(dua_count=Count("dua")).order_by(
            "-dua_count", "name"
        )

        # Add selected tag IDs to context
        selected_tag_ids = [
            int(tag_id)
            for tag_id in self.request.GET.getlist("tags")
            if tag_id.isdigit()
        ]
        context["selected_tag_ids"] = selected_tag_ids

        # Add selected tags objects to context
        if selected_tag_ids:
            context["selected_tags"] = Tag.objects.filter(id__in=selected_tag_ids)
        else:
            context["selected_tags"] = []

        return context


def tag_search_view(request):
    """HTMX view for expandable tag search"""

    search_query = request.GET.get("search", "")
    selected_tag_ids = [
        int(tag_id) for tag_id in request.GET.getlist("tags") if tag_id.isdigit()
    ]

    if search_query:
        tags = (
            Tag.objects.filter(name__icontains=search_query)
            .annotate(dua_count=Count("dua"))
            .order_by("-dua_count", "name")
        )
    else:
        tags = Tag.objects.annotate(dua_count=Count("dua")).order_by(
            "-dua_count", "name"
        )

    # Preserve current URL parameters
    current_params = dict(request.GET.items())
    if "search" in current_params:
        del current_params["search"]

    context = {
        "tags": tags,
        "search_query": search_query,
        "selected_tag_ids": selected_tag_ids,
        "current_params": current_params,
    }

    html = render_to_string(
        "dua_collection/partials/tag_search_expanded.html", context, request=request
    )
    return HttpResponse(html)


def dua_translations_view(request, dua_id):
    """HTMX view for loading dua translations with show/hide toggle"""

    try:
        dua = get_object_or_404(Dua, id=dua_id)
        action = request.GET.get("action", "show")

        if action == "hide":
            # Return collapsed state
            context = {"dua": dua, "action": "collapsed"}
            template = "dua_collection/partials/dua_translations_collapsed.html"
        else:
            # Return expanded state with translations
            translations = dua.translations.all().order_by("language")
            context = {"dua": dua, "translations": translations, "action": "expanded"}
            template = "dua_collection/partials/dua_translations_expanded.html"

        html = render_to_string(template, context, request=request)
        return HttpResponse(html)
    except Dua.DoesNotExist:
        return HttpResponse('<div class="alert alert-warning">Dua not found.</div>')

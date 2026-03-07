from django.contrib import admin
from .models import Film, Genre, Favorite, Review, Series, Season, Episode, ViewingHistory


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Film)
class FilmAdmin(admin.ModelAdmin):
    list_display = ('title', 'year', 'rating', 'views', 'is_published')
    list_filter = ('year', 'genre', 'is_published')
    search_fields = ('title', 'title_en', 'director')
    prepopulated_fields = {'slug': ('title',)}


@admin.register(Series)
class SeriesAdmin(admin.ModelAdmin):
    list_display = ('title', 'year_start', 'year_end', 'rating', 'views', 'is_published')
    list_filter = ('year_start', 'genre', 'is_published')
    search_fields = ('title', 'title_en', 'director')
    prepopulated_fields = {'slug': ('title',)}


@admin.register(Season)
class SeasonAdmin(admin.ModelAdmin):
    list_display = ('series', 'number', 'title', 'year')
    list_filter = ('series', 'year')
    search_fields = ('series__title', 'title')


@admin.register(Episode)
class EpisodeAdmin(admin.ModelAdmin):
    list_display = ('season', 'number', 'title', 'duration', 'views')
    list_filter = ('season', 'season__series')
    search_fields = ('title', 'season__series__title')


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'film', 'added_at')
    list_filter = ('user', 'film')
    search_fields = ('user__username', 'film__title')


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('user', 'film', 'rating', 'created_at')
    list_filter = ('rating', 'film')
    search_fields = ('user__username', 'film__title', 'text')


@admin.register(ViewingHistory)
class ViewingHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'get_content', 'last_position', 'duration', 'get_progress', 'is_completed', 'watched_at')
    list_filter = ('is_completed', 'watched_at')
    search_fields = ('user__username', 'film__title', 'episode__title')
    
    def get_content(self, obj):
        if obj.episode:
            return str(obj.episode)
        elif obj.film:
            return obj.film.title
        return "—"
    get_content.short_description = "Контент"
    
    def get_progress(self, obj):
        return f"{obj.get_progress()}%"
    get_progress.short_description = "Прогресс"
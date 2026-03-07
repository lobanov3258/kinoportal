from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from .models import Film, Series


class StaticViewSitemap(Sitemap):
    priority = 1.0
    changefreq = 'daily'

    def items(self):
        return ['home', 'series_list', 'search', 'login', 'register']

    def location(self, item):
        return reverse(item)


class FilmSitemap(Sitemap):
    changefreq = 'weekly'
    priority = 0.9

    def items(self):
        return Film.objects.filter(is_published=True)

    def lastmod(self, obj):
        return obj.created_at


class SeriesSitemap(Sitemap):
    changefreq = 'weekly'
    priority = 0.9

    def items(self):
        return Series.objects.filter(is_published=True)

    def lastmod(self, obj):
        return obj.created_at
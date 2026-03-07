from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='home'),
    path('film/<slug:slug>/', views.film_detail, name='film_detail'),
    path('watch/<slug:slug>/', views.film_player, name='film_player'),
    path('search/', views.search, name='search'),
    path('add-favorite/<int:film_id>/', views.add_to_favorites, name='add_to_favorites'),
    path('favorites/', views.favorites_list, name='favorites'),
    path('film/<int:film_id>/review/', views.add_review, name='add_review'),
    path('history/', views.viewing_history, name='viewing_history'),
    path('series/', views.series_list, name='series_list'),
    path('series/<slug:slug>/', views.series_detail, name='series_detail'),
    path('episode/<int:episode_id>/', views.episode_player, name='episode_player'),
]
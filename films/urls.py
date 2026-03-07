from django.urls import path
from .views import *

urlpatterns = [
    path('', index, name='home'),
    path('film/<slug:slug>/', film_detail, name='film_detail'),
    path('watch/<slug:slug>/', film_player, name='film_player'),
    path('search/', search, name='search'),
    path('favorites/', favorites_list, name='favorites'),
    path('film/<slug:slug>/toggle-favorite/', toggle_favorite, name='toggle_favorite'),
    path('film/<slug:slug>/review/', add_review, name='add_review'),
    
    # Сериалы
    path('series/', series_list, name='series_list'),
    path('series/<slug:slug>/', series_detail, name='series_detail'),
    path('episode/<int:episode_id>/', episode_player, name='episode_player'),
    
    # История просмотров
    path('api/update-history/', update_history, name='update_history'),
    path('continue-watching/', continue_watching, name='continue_watching'),
]
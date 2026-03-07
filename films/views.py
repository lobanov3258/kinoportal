from django.shortcuts import render, get_object_or_404, redirect
from django.db.models import Q, Avg
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.urls import reverse
from django.views.decorators.http import require_POST
import json
from .models import Film, Genre, Favorite, Review, Series, Episode, ViewingHistory
from .forms import ReviewForm


def index(request):
    films = Film.objects.filter(is_published=True)
    genres = Genre.objects.all()
    genre_slug = request.GET.get('genre')

    if genre_slug:
        films = films.filter(genre__slug=genre_slug)

    history_items = []
    if request.user.is_authenticated:
        history_items = ViewingHistory.objects.filter(user=request.user).select_related(
            'film',
            'episode__season__series'
        ).order_by('-watched_at')[:6]

    return render(request, 'films/index.html', {
        'films': films,
        'genres': genres,
        'active_genre': genre_slug,
        'history_items': history_items,
    })


def film_detail(request, slug):
    film = get_object_or_404(Film, slug=slug, is_published=True)
    film.views += 1
    film.save(update_fields=['views'])
    
    reviews = film.reviews.all().select_related('user')
    avg_rating = film.reviews.aggregate(avg=Avg('rating'))['avg'] or 0
    
    user_review = None
    if request.user.is_authenticated:
        user_review = Review.objects.filter(user=request.user, film=film).first()
    
    return render(request, 'films/film_detail.html', {
        'film': film,
        'reviews': reviews,
        'avg_rating': round(avg_rating, 1),
        'user_review': user_review
    })


@login_required
def film_player(request, slug):
    film = get_object_or_404(Film, slug=slug, is_published=True)
    
    ViewingHistory.objects.update_or_create(
        user=request.user,
        film=film,
        episode=None,
        defaults={'last_position': 0}
    )

    return render(request, 'films/player.html', {'film': film})


def search(request):
    query = request.GET.get('q')
    films = []
    if query:
        films = Film.objects.filter(
            Q(title__icontains=query) | 
            Q(title_en__icontains=query) |
            Q(director__icontains=query),
            is_published=True
        )
    return render(request, 'films/search.html', {'films': films, 'query': query})


@login_required
def toggle_favorite(request, slug):
    film = get_object_or_404(Film, slug=slug)
    favorite, created = Favorite.objects.get_or_create(user=request.user, film=film)
    
    if not created:
        favorite.delete()
        is_favorite = False
    else:
        is_favorite = True
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({
            'is_favorite': is_favorite,
            'count': request.user.favorites.count()
        })
    
    return redirect('film_detail', slug=slug)


@login_required
def favorites_list(request):
    favorites = request.user.favorites.all().select_related('film')
    return render(request, 'films/favorites.html', {'favorites': favorites})


@login_required
def add_review(request, slug):
    film = get_object_or_404(Film, slug=slug)
    if request.method == 'POST':
        rating = request.POST.get('rating')
        text = request.POST.get('text', '')
        
        if rating:
            try:
                rating = int(rating)
                if 1 <= rating <= 10:
                    review, created = Review.objects.get_or_create(
                        user=request.user,
                        film=film,
                        defaults={'rating': rating, 'text': text}
                    )
                    
                    if not created:
                        review.rating = rating
                        review.text = text
                        review.save()
            except (ValueError, TypeError):
                pass
        
        return redirect(f'/film/{slug}/#reviews')
    
    return redirect('film_detail', slug=slug)


@login_required
def viewing_history(request):
    history = ViewingHistory.objects.filter(user=request.user).select_related(
        'film',
        'episode__season__series'
    ).order_by('-watched_at')[:50]
    return render(request, 'films/history.html', {'history': history})


@login_required
@require_POST
def update_history(request):
    try:
        data = json.loads(request.body)
        content_type = data.get('type')
        content_id = data.get('id')
        position = int(data.get('position', 0))
        duration = int(data.get('duration', 0))
        
        if content_type == 'film':
            film = get_object_or_404(Film, id=content_id)
            episode = None
        elif content_type == 'episode':
            episode = get_object_or_404(Episode, id=content_id)
            film = None
        else:
            return JsonResponse({'success': False})
        
        ViewingHistory.objects.update_or_create(
            user=request.user,
            film=film,
            episode=episode,
            defaults={
                'last_position': position,
                'duration': duration,
                'is_completed': position >= duration * 0.9
            }
        )
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})


def series_list(request):
    series = Series.objects.filter(is_published=True)
    return render(request, 'films/series_list.html', {'series': series})


def series_detail(request, slug):
    series = get_object_or_404(Series, slug=slug, is_published=True)
    series.views += 1
    series.save(update_fields=['views'])
    
    seasons = series.seasons.prefetch_related('episodes').all()
    return render(request, 'films/series_detail.html', {
        'series': series,
        'seasons': seasons
    })


@login_required
def episode_player(request, episode_id):
    episode = get_object_or_404(Episode, id=episode_id)
    episode.views += 1
    episode.save(update_fields=['views'])

    ViewingHistory.objects.update_or_create(
        user=request.user,
        film=None,
        episode=episode,
        defaults={'last_position': 0}
    )

    next_episode = Episode.objects.filter(
        season=episode.season,
        number__gt=episode.number
    ).order_by('number').first()

    prev_episode = Episode.objects.filter(
        season=episode.season,
        number__lt=episode.number
    ).order_by('-number').first()

    return render(request, 'films/episode_player.html', {
        'episode': episode,
        'next_episode': next_episode,
        'prev_episode': prev_episode
    })

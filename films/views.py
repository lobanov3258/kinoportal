from django.shortcuts import render, get_object_or_404, redirect
from django.db.models import Q
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.urls import reverse
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
    film = get_object_or_404(Film, slug=slug)
    return render(request, 'films/film_detail.html', {'film': film})


@login_required
def film_player(request, slug):
    film = get_object_or_404(Film, slug=slug, is_published=True)

    ViewingHistory.objects.update_or_create(
        user=request.user,
        film=film,
        episode=None,
    )

    return render(request, 'films/player.html', {'film': film})


def search(request):
    query = request.GET.get('q')
    films = Film.objects.filter(Q(title__icontains=query)) if query else []
    return render(request, 'films/search.html', {'films': films, 'query': query})


@login_required
def add_to_favorites(request, film_id):
    film = get_object_or_404(Film, id=film_id)
    Favorite.objects.get_or_create(user=request.user, film=film)
    return redirect('film_detail', slug=film.slug)


@login_required
def favorites_list(request):
    favorites = Favorite.objects.filter(user=request.user)
    return render(request, 'films/favorites.html', {'favorites': favorites})


@login_required
def add_review(request, film_id):
    film = get_object_or_404(Film, id=film_id)
    if request.method == 'POST':
        form = ReviewForm(request.POST)
        if form.is_valid():
            review = form.save(commit=False)
            review.film = film
            review.user = request.user
            review.save()
            messages.success(request, 'Отзыв добавлен!')
            url = reverse('film_detail', kwargs={'slug': film.slug})
            return redirect(f"{url}#reviews")
    return redirect('film_detail', slug=film.slug)


@login_required
def viewing_history(request):
    history = ViewingHistory.objects.filter(user=request.user).select_related(
        'film',
        'episode__season__series'
    ).order_by('-watched_at')[:50]
    return render(request, 'films/history.html', {'history': history})


def series_list(request):
    series = Series.objects.filter(is_published=True)
    return render(request, 'films/series_list.html', {'series': series})


@login_required
def series_detail(request, slug):
    series = get_object_or_404(Series, slug=slug, is_published=True)
    series.views += 1
    series.save(update_fields=['views'])
    seasons = series.seasons.prefetch_related('episodes').all()
    return render(request, 'films/series_detail.html', {'series': series, 'seasons': seasons})


@login_required
def episode_player(request, episode_id):
    episode = get_object_or_404(Episode, id=episode_id, is_published=True)
    episode.views += 1
    episode.save(update_fields=['views'])

    ViewingHistory.objects.update_or_create(
        user=request.user,
        film=None,
        episode=episode,
    )

    next_episode = Episode.objects.filter(
        season=episode.season,
        number__gt=episode.number,
        is_published=True
    ).first()

    return render(request, 'films/episode_player.html', {
        'episode': episode,
        'next_episode': next_episode
    })
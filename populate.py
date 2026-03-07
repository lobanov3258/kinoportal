from films.models import Genre, Film, Rating, Comment
from django.db import models

# минимальный набор данных для тестирования фильтрации, оценок и комментариев

def run():
    # жанры
    action, _ = Genre.objects.get_or_create(name='Action')
    drama, _ = Genre.objects.get_or_create(name='Drama')
    comedy, _ = Genre.objects.get_or_create(name='Comedy')
    sci, _ = Genre.objects.get_or_create(name='Sci-Fi')

    data = [
        {
            'slug': 'sample-film',
            'title': 'Sample Film',
            'description': 'A test movie',
            'poster': 'posters/sample.jpg',
            'year': 2025,
            'country': 'USA',
            'director': 'Director Name',
            'duration': 120,
            'rating': 8.5,
            'genres': [action],
        },
        {
            'slug': 'old-drama',
            'title': 'Old Drama',
            'description': 'A touching story from the past.',
            'poster': 'posters/drama.jpg',
            'year': 1995,
            'country': 'UK',
            'director': 'Jane Director',
            'duration': 140,
            'rating': 7.2,
            'genres': [drama],
        },
        {
            'slug': 'space-comedy',
            'title': 'Space Comedy',
            'description': 'Laughs in zero gravity.',
            'poster': 'posters/space.jpg',
            'year': 2022,
            'country': 'Canada',
            'director': 'John Space',
            'duration': 95,
            'rating': 6.9,
            'genres': [comedy, sci],
        },
    ]

    for item in data:
        film, created = Film.objects.get_or_create(slug=item['slug'], defaults={
            'title': item['title'],
            'description': item['description'],
            'poster': item['poster'],
            'year': item['year'],
            'country': item['country'],
            'director': item['director'],
            'duration': item['duration'],
            'rating': item['rating'],
            'is_published': True,
        })
        if created:
            for g in item['genres']:
                film.genre.add(g)
            print(f"Created {film.title}")
        else:
            print(f"{film.title} already exists")

    # добавить несколько оценок и комментариев к sample-film
    sample = Film.objects.get(slug='sample-film')
    Rating.objects.create(film=sample, score=9)
    Rating.objects.create(film=sample, score=8)
    Comment.objects.create(film=sample, author='Alice', text='Очень понравилось!')
    Comment.objects.create(film=sample, author='Bob', text='Могло быть лучше.')

    # обновляем рейтинг
    avg = sample.ratings.aggregate(models.Avg('score'))['score__avg'] or 0
    sample.rating = avg
    sample.save(update_fields=['rating'])

if __name__=='__main__':
    run()

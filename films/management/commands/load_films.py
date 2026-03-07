from django.core.management.base import BaseCommand
from films.models import Film, Genre
import requests
from django.core.files.base import ContentFile
from io import BytesIO

class Command(BaseCommand):
    help = 'Загружает тестовые фильмы в базу данных'

    def handle(self, *args, **kwargs):
        # Создаём жанры
        genres_data = [
            {'name': 'Фантастика', 'slug': 'fantasy'},
            {'name': 'Драма', 'slug': 'drama'},
            {'name': 'Триллер', 'slug': 'thriller'},
            {'name': 'Боевик', 'slug': 'action'},
        ]

        for genre in genres_data:
            Genre.objects.get_or_create(slug=genre['slug'], defaults={'name': genre['name']})
            self.stdout.write(f"✅ Жанр: {genre['name']}")

        # Фильмы
        films_data = [
            {
                'title': 'Интерстеллар',
                'title_en': 'Interstellar',
                'slug': 'interstellar',
                'description': 'Команда исследователей отправляется сквозь червоточину в космосе чтобы найти новый дом для человечества.',
                'year': 2014,
                'country': 'США',
                'director': 'Кристофер Нолан',
                'duration': 169,
                'rating': 8.9,
                'genres': ['fantasy', 'drama'],
                'poster_url': 'https://image.tmdb.org/t/p/w500/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg',
            },
            {
                'title': 'Джокер',
                'title_en': 'Joker',
                'slug': 'joker',
                'description': 'История Артура Флека, неудачливого комика который сходит с ума и становится легендарным преступником Джокером.',
                'year': 2019,
                'country': 'США',
                'director': 'Тодд Филлипс',
                'duration': 122,
                'rating': 8.4,
                'genres': ['drama', 'thriller'],
                'poster_url': 'https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg',
            },
            {
                'title': 'Дюна: Часть вторая',
                'title_en': 'Dune: Part Two',
                'slug': 'dune-part-two',
                'description': 'Пол Атридес объединяет народы Арракиса чтобы отомстить за убийство своего отца.',
                'year': 2024,
                'country': 'США',
                'director': 'Дени Вильнёв',
                'duration': 166,
                'rating': 8.7,
                'genres': ['fantasy', 'action'],
                'poster_url': 'https://image.tmdb.org/t/p/w500/8uO0gUM8aNqYLs1OsTBQiXu0fEv.jpg',
            },
            {
                'title': 'Опенгеймер',
                'title_en': 'Oppenheimer',
                'slug': 'oppenheimer',
                'description': 'История создания атомной бомбы и учёного Роберта Опенгеймера.',
                'year': 2023,
                'country': 'США',
                'director': 'Кристофер Нолан',
                'duration': 180,
                'rating': 8.5,
                'genres': ['drama'],
                'poster_url': 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
            }
        ]

        for film_data in films_data:
            film, created = Film.objects.get_or_create(
                slug=film_data['slug'],
                defaults={
                    'title': film_data['title'],
                    'title_en': film_data['title_en'],
                    'description': film_data['description'],
                    'year': film_data['year'],
                    'country': film_data['country'],
                    'director': film_data['director'],
                    'duration': film_data['duration'],
                    'rating': film_data['rating'],
                    'is_published': True
                }
            )
            
            if created:
                # Добавляем жанры
                for genre_slug in film_data['genres']:
                    try:
                        genre = Genre.objects.get(slug=genre_slug)
                        film.genre.add(genre)
                    except Genre.DoesNotExist:
                        self.stdout.write(f'❌ Жанр не найден: {genre_slug}')
                
                # Скачиваем постер
                try:
                    response = requests.get(film_data['poster_url'])
                    if response.status_code == 200:
                        image_name = film_data['poster_url'].split('/')[-1]
                        film.poster.save(image_name, ContentFile(response.content), save=True)
                        self.stdout.write(f'✅ Добавлен: {film.title}')
                except Exception as e:
                    self.stdout.write(f'❌ Ошибка загрузки постера для {film.title}: {e}')
            else:
                self.stdout.write(f'⚠️ Уже существует: {film.title}')

        self.stdout.write(self.style.SUCCESS('\n🎉 Все фильмы загружены!'))
from django.db import models
from django.urls import reverse


class Genre(models.Model):
    name = models.CharField(max_length=200, verbose_name="Название жанра")
    slug = models.SlugField(max_length=200, unique=True, verbose_name="URL")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Жанр"
        verbose_name_plural = "Жанры"


class Film(models.Model):
    title = models.CharField(max_length=300, verbose_name="Название фильма")
    title_en = models.CharField(max_length=300, blank=True, verbose_name="Название (англ.)")
    slug = models.SlugField(max_length=300, unique=True, verbose_name="URL-адрес")
    description = models.TextField(verbose_name="Описание")
    poster = models.ImageField(upload_to="posters/", verbose_name="Постер")
    trailer = models.URLField(verbose_name="Ссылка на трейлер", blank=True)
    video_file = models.FileField(upload_to="videos/", verbose_name="Видео файл", blank=True, null=True)
    video_url = models.URLField(verbose_name="Ссылка на видео", blank=True, null=True)
    year = models.PositiveIntegerField(verbose_name="Год выпуска")
    country = models.CharField(max_length=100, verbose_name="Страна")
    director = models.CharField(max_length=200, verbose_name="Режиссёр")
    genre = models.ManyToManyField(Genre, verbose_name="Жанр")
    duration = models.PositiveIntegerField(verbose_name="Длительность (мин.)")
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0, verbose_name="Рейтинг")
    views = models.PositiveIntegerField(default=0, verbose_name="Просмотры")
    is_published = models.BooleanField(default=True, verbose_name="Опубликован")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата добавления")

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse('film_detail', kwargs={'slug': self.slug})

    def get_video_embed_url(self):
        """Возвращает embed ссылку ТОЛЬКО для YouTube. Для всего остального None."""
        if not self.video_url:
            return None
        
        url = self.video_url.strip()
        
        # Обработка YouTube
        if 'youtube.com/watch?v=' in url:
            video_id = url.split('v=')[-1].split('&')[0]
            return f'https://www.youtube.com/embed/{video_id}'
        
        if 'youtu.be/' in url:
            video_id = url.split('youtu.be/')[-1].split('?')[0]
            return f'https://www.youtube.com/embed/{video_id}'
            
        # Если это не YouTube, возвращаем None
        return None

    class Meta:
        verbose_name = "Фильм"
        verbose_name_plural = "Фильмы"
        ordering = ['-created_at']


class Favorite(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='favorites')
    film = models.ForeignKey(Film, on_delete=models.CASCADE, related_name='favorited_by')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'film')
        ordering = ['-added_at']

    def __str__(self):
        return f"{self.user.username} - {self.film.title}"


class Review(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='reviews')
    film = models.ForeignKey(Film, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 11)], verbose_name="Оценка")
    text = models.TextField(verbose_name="Текст отзыва", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'film')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.film.title} ({self.rating}/10)"


class Series(models.Model):
    title = models.CharField(max_length=300, verbose_name="Название сериала")
    title_en = models.CharField(max_length=300, blank=True, verbose_name="Название (англ.)")
    slug = models.SlugField(max_length=300, unique=True, verbose_name="URL-адрес")
    description = models.TextField(verbose_name="Описание")
    poster = models.ImageField(upload_to="posters/", verbose_name="Постер")
    trailer = models.URLField(verbose_name="Ссылка на трейлер", blank=True)
    year_start = models.PositiveIntegerField(verbose_name="Год начала")
    year_end = models.PositiveIntegerField(verbose_name="Год окончания", blank=True, null=True)
    country = models.CharField(max_length=100, verbose_name="Страна")
    director = models.CharField(max_length=200, verbose_name="Режиссёр")
    genre = models.ManyToManyField(Genre, verbose_name="Жанр")
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0, verbose_name="Рейтинг")
    views = models.PositiveIntegerField(default=0, verbose_name="Просмотры")
    is_published = models.BooleanField(default=True, verbose_name="Опубликован")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата добавления")

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse('series_detail', kwargs={'slug': self.slug})

    class Meta:
        verbose_name = "Сериал"
        verbose_name_plural = "Сериалы"
        ordering = ['-created_at']


class Season(models.Model):
    series = models.ForeignKey(Series, on_delete=models.CASCADE, related_name='seasons')
    number = models.PositiveIntegerField(verbose_name="Номер сезона")
    title = models.CharField(max_length=200, blank=True, verbose_name="Название сезона")
    year = models.PositiveIntegerField(verbose_name="Год выпуска")

    def __str__(self):
        return f"{self.series.title} - Сезон {self.number}"

    class Meta:
        verbose_name = "Сезон"
        verbose_name_plural = "Сезоны"
        ordering = ['number']
        unique_together = ('series', 'number')


class Episode(models.Model):
    season = models.ForeignKey(Season, on_delete=models.CASCADE, related_name='episodes')
    number = models.PositiveIntegerField(verbose_name="Номер серии")
    title = models.CharField(max_length=200, blank=True, verbose_name="Название серии")
    description = models.TextField(verbose_name="Описание", blank=True)
    video_file = models.FileField(upload_to="episodes/", verbose_name="Видео файл", blank=True, null=True)
    video_url = models.URLField(verbose_name="Ссылка на видео", blank=True, null=True)
    duration = models.PositiveIntegerField(verbose_name="Длительность (мин.)", default=45)
    views = models.PositiveIntegerField(default=0, verbose_name="Просмотры")

    def __str__(self):
        return f"{self.season.series.title} - S{self.season.number}E{self.number}"

    def get_video_embed_url(self):
        """Возвращает embed ссылку ТОЛЬКО для YouTube."""
        if not self.video_url:
            return None
        
        url = self.video_url.strip()
        
        if 'youtube.com/watch?v=' in url:
            video_id = url.split('v=')[-1].split('&')[0]
            return f'https://www.youtube.com/embed/{video_id}'
        
        if 'youtu.be/' in url:
            video_id = url.split('youtu.be/')[-1].split('?')[0]
            return f'https://www.youtube.com/embed/{video_id}'
            
        return None

    class Meta:
        verbose_name = "Серия"
        verbose_name_plural = "Серии"
        ordering = ['number']
        unique_together = ('season', 'number')


class ViewingHistory(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='viewing_history')
    film = models.ForeignKey(Film, on_delete=models.CASCADE, related_name='viewers', blank=True, null=True)
    episode = models.ForeignKey(Episode, on_delete=models.CASCADE, related_name='viewers', blank=True, null=True)
    watched_at = models.DateTimeField(auto_now_add=True)
    last_position = models.PositiveIntegerField(default=0, verbose_name="Последняя позиция (сек)")
    duration = models.PositiveIntegerField(default=0, verbose_name="Общая длительность (сек)")
    is_completed = models.BooleanField(default=False, verbose_name="Просмотрено полностью")

    def __str__(self):
        if self.episode:
            return f"{self.user.username} - {self.episode}"
        elif self.film:
            return f"{self.user.username} - {self.film.title}"
        return f"{self.user.username} - неизвестно"

    def get_progress(self):
        if self.duration > 0:
            return int((self.last_position / self.duration) * 100)
        return 0

    class Meta:
        verbose_name = "История просмотров"
        verbose_name_plural = "История просмотров"
        ordering = ['-watched_at']
        unique_together = ('user', 'film', 'episode')
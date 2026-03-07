from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth.models import User


def login_view(request):
    """Страница входа на сайт"""
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            return redirect('home')
        else:
            messages.error(request, 'Неверное имя пользователя или пароль')
    
    return render(request, 'accounts/login.html')


def logout_view(request):
    """Выход из аккаунта"""
    logout(request)
    return redirect('home')


def register_view(request):
    """Страница регистрации"""
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        password2 = request.POST.get('password2')
        
        if password != password2:
            messages.error(request, 'Пароли не совпадают')
            return render(request, 'accounts/register.html')
        
        if User.objects.filter(username=username).exists():
            messages.error(request, 'Пользователь с таким именем уже существует')
            return render(request, 'accounts/register.html')
        
        if email and User.objects.filter(email=email).exists():
            messages.error(request, 'Email уже используется')
            return render(request, 'accounts/register.html')
        
        user = User.objects.create_user(username=username, email=email, password=password)
        login(request, user)
        return redirect('home')
    
    return render(request, 'accounts/register.html')


@login_required
def profile_view(request):
    """Личный кабинет пользователя"""
    favorites = request.user.favorites.all().select_related('film')[:12]
    return render(request, 'accounts/profile.html', {
        'favorites': favorites
    })
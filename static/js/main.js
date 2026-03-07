// utilities for managing favorites cookie
function getFavorites() {
    const cookie = document.cookie.split('; ').find(row => row.startsWith('favorites='));
    if (!cookie) return [];
    const val = cookie.split('=')[1];
    try {
        return val ? val.split(',').filter(s=>s) : [];
    } catch (e) {
        return [];
    }
}
function setFavorites(list) {
    document.cookie = 'favorites=' + list.join(',') + '; path=/; max-age=' + 60*60*24*365;
}
function toggleFavorite(slug, element) {
    let fav = getFavorites();
    if (fav.includes(slug)) {
        fav = fav.filter(s => s !== slug);
        element.classList.remove('active');
    } else {
        fav.push(slug);
        element.classList.add('active');
    }
    setFavorites(fav);
}

document.addEventListener('DOMContentLoaded', function() {
    // set initial state on film cards
    document.querySelectorAll('.film-card').forEach(card => {
        const slug = card.dataset.slug;
        const heart = card.querySelector('.favorite');
        if (heart) {
            const fav = getFavorites();
            if (fav.includes(slug)) heart.classList.add('active');
            heart.addEventListener('click', function(e) {
                e.preventDefault();
                toggleFavorite(slug, heart);
            });
        }
    });
});
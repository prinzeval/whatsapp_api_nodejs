const fetch = require('node-fetch');
const apiKey = 'YOUR_TMDB_API_KEY';
const imdbID = 'tt0099785';

// Fetch movie details by IMDb ID
fetch(`https://api.themoviedb.org/3/find/${imdbID}?api_key=${apiKey}&external_source=imdb_id`)
  .then(response => response.json())
  .then(data => {
    if (data.movie_results && data.movie_results.length > 0) {
      const movieId = data.movie_results[0].id;

      // Fetch where to watch the movie
      fetch(`https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${apiKey}`)
        .then(response => response.json())
        .then(providers => {
          console.log(`Where to watch 'Home Alone':`, providers.results);
        });
    } else {
      console.log('Movie not found');
    }
  })
  .catch(error => console.error('Error:', error));

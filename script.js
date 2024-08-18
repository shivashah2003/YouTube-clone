

function search(loadMore = false) {
  const query = document.getElementById('search-bar').value;
  const API_KEY = 'AIzaSyCOkPAM34rF2qvce4-SYkQIWB_rOhZePP4';
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${query}&key=${API_KEY}`;

  fetch(url)
      .then(response => response.json())
      .then(data => {
          console.log(data);
          // displayResults(data.items);
          const channelIds = data.items.map(video => video.snippet.channelId).join(',');
          fetchChannelDetails(channelIds, data.items);

          localStorage.setItem('lastSearchResults', JSON.stringify(data.items));
      })
      .catch(error => console.error('Error fetching data:', error));
}


function fetchChannelDetails(channelIds, videos) {
  const API_KEY = 'AIzaSyCOkPAM34rF2qvce4-SYkQIWB_rOhZePP4';
  const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelIds}&key=${API_KEY}`;

  fetch(url)
      .then(response => response.json())
      .then(data => {
          const channels = data.items.reduce((acc, channel) => {
              acc[channel.id] = channel.snippet.thumbnails.default.url;
              return acc;
          }, {});

          // Map the channel thumbnails to the videos and display results
          videos.forEach(video => {
              video.channelThumbnail = channels[video.snippet.channelId];
          });

          displayResults(videos);
          localStorage.setItem('lastSearchResults', JSON.stringify(videos));
      })
      .catch(error => console.error('Error fetching channel details:', error));
}

function displayResults(videos) {
  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = ''; // Clear previous results
  videos.forEach(video => {
      const videoElement = document.createElement('div');
      videoElement.classList.add('video-item');
      videoElement.innerHTML = `
      
         <div class="video-preview">
          <div class="thumbnail-row">
            <img class = "thumbnail" src="${video.snippet.thumbnails.medium.url}" alt="${video.snippet.title}">
          </div>
          <div class ="video-info">
            <div class="channel-picture">
                <img class="channel-avatar" src="${video.channelThumbnail}" alt="${video.snippet.channelTitle}">
            </div>
            <div class="channel-text">
                <h3 class="video-title">${video.snippet.title}</h3>
                <p class="video-author">${video.snippet.channelTitle}</p>
                <p class="video-stats">1M views • ${new Date(video.snippet.publishedAt).toLocaleDateString()}</p>
            </div>   
          </div>
        </div>
  
      `;
      videoElement.addEventListener('click', () => {
        window.open(`https://www.youtube.com/watch?v=${video.id.videoId}`, '_blank');
    });
      resultsContainer.appendChild(videoElement);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const savedResults = localStorage.getItem('lastSearchResults');
  if (savedResults) {
      displayResults(JSON.parse(savedResults));
  }
});

// Function to handle voice search
function startVoiceRecognition() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onresult = (event) => {
      const voiceQuery = event.results[0][0].transcript;
      document.getElementById('search-bar').value = voiceQuery;
      search(); // Trigger the search function with the recognized voice query
  };

  recognition.onerror = (event) => {
      console.error('Voice recognition error:', event.error);
  };
}

// Event listener for voice search button
document.getElementById('voice-search-btn').addEventListener('click', startVoiceRecognition);


// Function to start the search and show the overlay
function startSearch() {
  // Show the overlay
  document.getElementById('search-overlay').classList.add('show-overlay');

  // Start the search (simulated with a timeout here for demonstration)
  search();
}



document.addEventListener("DOMContentLoaded", function() {
  // Cache DOM elements for better performance
  const elements = {
    pageBody: document.getElementById('page-body'),
    radioStations: document.querySelectorAll('radio-item'),
    stopButton: document.querySelector('stop-button'),
    radioName: document.querySelector('.radio-name'),
    radioLabel: document.querySelector('.radio-label'),
    filterList: document.querySelector('filter-list'),
    searchFilter: document.querySelector('.filter-search'),
    searchFilterInput: document.querySelector('.filter-search input'),
    playinFilter: document.querySelector('.filter-playin'),
    allFilter: document.querySelector('.filter-all'),
    listOfRadios: document.querySelector('.list-of-radios')
  };

  // INIT FUNCTIONS 
  playRadio();
  stopRadio();
  filterRadioStations();

  // Helper functions
  function clearPlayingState() {
    elements.radioStations.forEach(station => station.classList.remove('playin', 'loadin'));
  }

  function updatePlayingState(clickedElement, clickedName, radioCover) {
    elements.radioName.textContent = clickedName;
    elements.radioLabel.textContent = "Radio";
    elements.stopButton.classList.add('stopin');
    audioNavigator(clickedName, "r.a.d.i.o", radioCover);
    elements.filterList.classList.add('playin-some-stuff');
    document.title = '♫♪.♪♫.♪♫ Now playing: ' + clickedName + ' radio station ♪♫.♫♪.♫♪';
  }

  //  LOGIC
  function playRadio() {
    elements.radioStations.forEach((radio) => {
      radio.addEventListener('click', handleRadioClick);
    });
  }

  function handleRadioClick(e) {
    const clickedElement = e.target;

    if (!elements.pageBody.classList.contains('show-playin') && !clickedElement.classList.contains('playin') && !clickedElement.classList.contains('loadin')) {
      const clickedUrl = clickedElement.getAttribute('data-url');
      const clickedName = clickedElement.getAttribute('data-name');
      const radioCover = clickedElement.getAttribute('data-cover');
      const rndID = Math.floor(Math.random() * 999999989) + 10;
      const audioPlayer = videojs('videojs-audio');
      
      // Determine audio type more efficiently
      const audioType = clickedUrl.includes('.m3u8') ? 'application/x-mpegURL' : 'audio/mpeg';

      // Clear previous playing state
      clearPlayingState();
      
      // Clear previous event listeners to avoid duplicates
      audioPlayer.off('loadstart');
      audioPlayer.off('canplay');
      audioPlayer.off('playing');
      audioPlayer.off('error');
      
      // Set up the stream
      console.log('Starting stream for:', clickedUrl);
      
      audioPlayer.src({ 
        type: audioType, 
        src: `${clickedUrl}?rndid=${rndID}` 
      });

      audioPlayer.on('loadstart', () => {
        audioPlayer.addClass('vjs-waiting');
        clickedElement.classList.add('loadin');
      });

      audioPlayer.on('canplay', () => {
        audioPlayer.removeClass('vjs-waiting');
      });

      audioPlayer.on('playing', () => {
        audioPlayer.removeClass('vjs-waiting');
        audioPlayer.addClass('vjs-playing');
        clickedElement.classList.add('playin');
        clickedElement.classList.remove('loadin');
      });

      audioPlayer.on('error', () => {
        audioPlayer.error('Unable to play this stream');
      });

      // Start playback
      audioPlayer.play();
      
      // Update UI
      updatePlayingState(clickedElement, clickedName, radioCover);
    }
  }

  function stopRadio() {
    elements.stopButton.addEventListener('click', function(e) {
      const audioPlayer = videojs('videojs-audio');

      // Clear playing state and reset UI
      clearPlayingState();
      resetPlayerUI(audioPlayer);
    });
  }

  function resetPlayerUI(audioPlayer) {
    elements.radioName.textContent = "Play That";
    elements.radioLabel.textContent = "Funky Music";
    elements.stopButton.classList.remove('stopin');
    
    audioPlayer.pause();
    audioPlayer.src('');
    elements.pageBody.classList.remove('show-playin', 'show-favs');
    elements.filterList.classList.remove('playin-some-stuff');
    document.title = '.░C░.░P░.░8░.░.░.░P░.░A░.░4░.░I░.░O░.';
  }

  function audioNavigator(title, artist, cover) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: title,
        artist: artist,
        artwork: [
          { src: cover, sizes: '96x96',   type: 'image/png' },
          { src: cover, sizes: '128x128', type: 'image/png' },
          { src: cover, sizes: '192x192', type: 'image/png' },
          { src: cover, sizes: '256x256', type: 'image/png' },
          { src: cover, sizes: '384x384', type: 'image/png' },
          { src: cover, sizes: '512x512', type: 'image/png' },
        ]
      });

      const audioPlayer = videojs('videojs-audio');

      navigator.mediaSession.setActionHandler('play', () => audioPlayer.play());
      navigator.mediaSession.setActionHandler('pause', () => audioPlayer.pause());
      navigator.mediaSession.setActionHandler('stop', () => {
        clearPlayingState();
        resetPlayerUI(audioPlayer);
      });
    }
  }

  function filterRadioStations() {
    elements.playinFilter.addEventListener('click', function(e) {
      elements.pageBody.classList.add('show-playin');
      elements.pageBody.classList.remove('show-favs');
      elements.searchFilter.classList.remove('show-search');
      elements.searchFilterInput.value = '';
      elements.radioStations.forEach(station => { station.classList.remove('search-hide'); });
    });

    // favsFilter.addEventListener('click', function(e) {
    //   pageBody.classList.add('show-favs');
    //   pageBody.classList.remove('show-playin');
    // });

    elements.allFilter.addEventListener('click', function(e) {
      elements.pageBody.classList.remove('show-playin', 'show-favs');
      elements.searchFilter.classList.remove('show-search');
      elements.searchFilterInput.value = '';

      if (elements.filterList.classList.contains('playin-some-stuff')) {
        const playingRadioStation = document.querySelector('.playin');
        elements.radioStations.forEach(station => { station.classList.remove('search-hide'); });
        
        if (playingRadioStation) {
          const positionFromTopOfScrollableDiv = playingRadioStation.offsetTop;
          elements.listOfRadios.scrollTop = positionFromTopOfScrollableDiv - 80;
        }
      }
    });

    elements.searchFilter.addEventListener('click', function(e) {
      elements.searchFilter.classList.add('show-search');
      elements.searchFilterInput.focus();
    });

    // Debounce search for better performance
    let searchTimeout;
    elements.searchFilterInput.addEventListener('keyup', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        if (e.target.value.length > 0) {
          elements.pageBody.classList.remove('show-playin', 'show-favs');
          const filters = e.target.value.split(/\s/)
            .filter(s => s.trim().length > 0)
            .map(s => new RegExp(s, 'gi'));
          
          elements.radioStations.forEach(station => 
            station.classList.toggle('search-hide', 
              !filters.some(regex => station.dataset.name.match(regex))
            )
          );
        } else {
          elements.radioStations.forEach(station => {
            station.classList.remove('search-hide');
          });
        }
      }, 150); // 150ms debounce
    });
  }
});
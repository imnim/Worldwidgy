const CACHE_NAME = 'world-widgy-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/metadata.json',
  '/App.tsx',
  '/components/Clock.tsx',
  '/components/TimezoneSelector.tsx',
  '/components/SettingsPage.tsx',
  '/components/NavigationBar.tsx',
  '/components/TopAppBar.tsx',
  '/components/FloatingActionButton.tsx',
  '/components/ColorPicker.tsx',
  '/components/Icons.tsx',
  '/components/AnalogueClockFace.tsx',
  '/components/ExpressiveSegmentedControl.tsx',
  '/components/SwipeToDelete.tsx',
  '/components/Slider.tsx',
  '/components/PresetColorPicker.tsx',
  '/contexts/SettingsContext.tsx',
  '/types.ts',
  '/utils/motion.ts',
  '/utils/date.ts',
  '/utils/theme.ts',
  '/utils/weatherApi.ts',
  '/data/timezonesWithCoords.ts',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
  'https://esm.sh/react@^19.1.0',
  'https://esm.sh/react-dom@^19.1.0/',
  'https://esm.sh/react@^19.1.0/',
  'https://esm.sh/framer-motion@^11.0.0'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Use no-cors for cross-origin requests like fonts
        const cachePromises = URLS_TO_CACHE.map(urlToCache => {
            const request = new Request(urlToCache, { mode: 'no-cors' });
            return fetch(request).then(response => cache.put(request, response));
        });
        return Promise.all(cachePromises).catch(err => {
          console.error('Failed to cache URLs:', err);
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request to use it both for fetch and for caching
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Check if we received a valid response
            if(!response || response.status !== 200) {
              return response;
            }
            // Opaque responses (type 'opaque') are for cross-origin resources.
            // We can cache them but cannot read their content or status.
            
            if (event.request.method === 'GET') {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(event.request, responseToCache);
                    });
            }

            return response;
          }
        );
      })
    );
});

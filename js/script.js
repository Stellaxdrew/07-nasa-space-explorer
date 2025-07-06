// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Get the gallery container and button from the page
const gallery = document.getElementById('gallery');
const getImagesButton = document.querySelector('.filters button');

// NASA API key
const API_KEY = '29RrTrVwPZeP4wIFKfxtyHzN7JY5FMigb0NSxVgr'; // Use your own key from https://api.nasa.gov

// Get modal elements
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');
const modalClose = document.getElementById('modalClose');

// Function to open the modal with image or video details
function openModal(item) {
  // If it's an image, show the image
  if (item.media_type === 'image') {
    modalImg.style.display = 'block';
    modalImg.src = item.hdurl || item.url;
    modalImg.alt = item.title;
    // Remove any previous video iframe
    const oldIframe = document.getElementById('modalVideo');
    if (oldIframe) oldIframe.remove();
  } else if (item.media_type === 'video') {
    // Hide the image element
    modalImg.style.display = 'none';
    // Remove any previous video iframe
    const oldIframe = document.getElementById('modalVideo');
    if (oldIframe) oldIframe.remove();
    // Create and insert a video iframe (YouTube or other)
    const iframe = document.createElement('iframe');
    iframe.id = 'modalVideo';
    iframe.src = item.url;
    iframe.width = '100%';
    iframe.height = '340';
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.style.borderRadius = '10px';
    iframe.style.marginBottom = '18px';
    // Insert before the title
    modalTitle.parentNode.insertBefore(iframe, modalTitle);
  }

  modalTitle.textContent = item.title;
  modalDate.textContent = `Date: ${item.date}`;
  modalExplanation.textContent = item.explanation;

  // Show the modal
  modal.style.display = 'flex';
}

// Function to close the modal
function closeModal() {
  modal.style.display = 'none';
  modalImg.src = '';
  modalTitle.textContent = '';
  modalDate.textContent = '';
  modalExplanation.textContent = '';
}

// Close modal when clicking the close button or outside the modal content
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

// Function to fetch and display images for a given date range
function fetchAndDisplayImages(startDate, endDate) {
  // Build the API URL using template literals
  const url = `https://api.nasa.gov/planetary/apod?start_date=${startDate}&end_date=${endDate}&api_key=${API_KEY}`;

  // Show a loading message while fetching
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">🚀</div>
      <p>Loading images...</p>
    </div>
  `;

  // Fetch data from NASA's API
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // Clear the gallery before adding new items
      gallery.innerHTML = '';

      // Loop through each item in the API response
      data.forEach(item => {
        // Create a div for each gallery item
        const itemDiv = document.createElement('div');
        itemDiv.className = 'gallery-item';

        if (item.media_type === 'image') {
          // Create an image element
          const img = document.createElement('img');
          img.src = item.url;
          img.alt = item.title;
          itemDiv.appendChild(img);
        } else if (item.media_type === 'video') {
          // Show a video thumbnail or a styled video box
          const videoBox = document.createElement('div');
          videoBox.style.position = 'relative';
          videoBox.style.width = '100%';
          videoBox.style.height = '200px';
          videoBox.style.background = '#0b3d91';
          videoBox.style.display = 'flex';
          videoBox.style.alignItems = 'center';
          videoBox.style.justifyContent = 'center';
          videoBox.style.borderRadius = '6px';
          videoBox.style.overflow = 'hidden';
          videoBox.style.boxShadow = '0 0 12px #0b3d91';
          // Try to get a YouTube thumbnail if possible
          let thumbUrl = '';
          if (item.url.includes('youtube.com') || item.url.includes('youtu.be')) {
            // Extract YouTube video ID
            let videoId = '';
            const ytMatch = item.url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^&?/]+)/);
            if (ytMatch) {
              videoId = ytMatch[1];
              thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            }
          }
          if (thumbUrl) {
            const thumbImg = document.createElement('img');
            thumbImg.src = thumbUrl;
            thumbImg.alt = item.title;
            thumbImg.style.width = '100%';
            thumbImg.style.height = '100%';
            thumbImg.style.objectFit = 'cover';
            videoBox.appendChild(thumbImg);
          }
          // Add a play icon overlay
          const playIcon = document.createElement('span');
          playIcon.textContent = '▶';
          playIcon.style.position = 'absolute';
          playIcon.style.left = '50%';
          playIcon.style.top = '50%';
          playIcon.style.transform = 'translate(-50%, -50%)';
          playIcon.style.fontSize = '3em';
          playIcon.style.color = '#fc3d21';
          playIcon.style.textShadow = '0 0 16px #fff, 0 0 8px #0b3d91';
          playIcon.style.pointerEvents = 'none';
          videoBox.appendChild(playIcon);

          itemDiv.appendChild(videoBox);
        }

        // Create a title element
        const title = document.createElement('h2');
        title.textContent = item.title;

        // Create a date element
        const date = document.createElement('p');
        date.textContent = `Date: ${item.date}`;

        // Add title and date to the gallery item
        itemDiv.appendChild(title);
        itemDiv.appendChild(date);

        // If it's a video, add a clear link to the video
        if (item.media_type === 'video') {
          const videoLink = document.createElement('a');
          videoLink.href = item.url;
          videoLink.target = '_blank';
          videoLink.rel = 'noopener noreferrer';
          videoLink.textContent = 'Watch Video';
          videoLink.style.display = 'inline-block';
          videoLink.style.margin = '10px auto 0 auto';
          videoLink.style.padding = '7px 18px';
          videoLink.style.background = 'linear-gradient(90deg, #0b3d91 0%, #fc3d21 100%)';
          videoLink.style.color = '#fff';
          videoLink.style.fontWeight = 'bold';
          videoLink.style.borderRadius = '5px';
          videoLink.style.textDecoration = 'none';
          videoLink.style.letterSpacing = '0.04em';
          videoLink.style.boxShadow = '0 0 8px #0b3d91';
          videoLink.style.transition = 'background 0.2s, color 0.2s';
          videoLink.onmouseover = () => {
            videoLink.style.background = 'linear-gradient(90deg, #fc3d21 0%, #0b3d91 100%)';
            videoLink.style.color = '#fff';
          };
          videoLink.onmouseout = () => {
            videoLink.style.background = 'linear-gradient(90deg, #0b3d91 0%, #fc3d21 100%)';
            videoLink.style.color = '#fff';
          };
          itemDiv.appendChild(videoLink);
        }

        // When the gallery item is clicked, open the modal with details
        itemDiv.addEventListener('click', (event) => {
          // Prevent opening modal if the user clicked the video link
          if (event.target.tagName === 'A') return;
          openModal(item);
        });

        // Add the gallery item to the gallery container
        gallery.appendChild(itemDiv);
      });

      // If no images were added, show a placeholder message
      if (gallery.children.length === 0) {
        gallery.innerHTML = `
          <div class="placeholder">
            <div class="placeholder-icon">🔭</div>
            <p>No images found for this date range.</p>
          </div>
        `;
      }
    })
    .catch(error => {
      // Show an error message in the gallery if something goes wrong
      gallery.innerHTML = `
        <div class="placeholder">
          <div class="placeholder-icon">🚨</div>
          <p>Error fetching APOD data: ${error.message}</p>
        </div>
      `;
      console.error('Error fetching APOD data:', error);
    });
}

// When the button is clicked, get the selected dates and fetch images
getImagesButton.addEventListener('click', () => {
  // Get the values from the date inputs
  const startDate = startInput.value;
  const endDate = endInput.value;

  // Check if both dates are selected
  if (!startDate || !endDate) {
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">📅</div>
        <p>Please select both a start and end date.</p>
      </div>
    `;
    return;
  }

  // Fetch and display images for the selected date range
  fetchAndDisplayImages(startDate, endDate);
});

// Array of fun space facts
const spaceFacts = [
  "A day on Venus is longer than a year on Venus!",
  "Neutron stars can spin at a rate of 600 rotations per second.",
  "Jupiter is so big that all the other planets in the Solar System could fit inside it.",
  "There are more stars in the universe than grains of sand on all the beaches on Earth.",
  "The footprints on the Moon will be there for millions of years.",
  "A spoonful of a neutron star weighs about a billion tons.",
  "Saturn could float in water because it’s mostly made of gas.",
  "The Sun makes up more than 99% of the mass of our solar system.",
  "Mars has the tallest volcano in the solar system: Olympus Mons.",
  "Space is completely silent—there’s no air for sound to travel through!"
];

// Pick a random fact and display it
const spaceFactDiv = document.getElementById('spaceFact');
if (spaceFactDiv) {
  const randomIndex = Math.floor(Math.random() * spaceFacts.length);
  spaceFactDiv.textContent = spaceFacts[randomIndex];
}

// Optionally, fetch images for the default date range on page load
// fetchAndDisplayImages(startInput.value, endInput.value);
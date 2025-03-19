const API_URL = "https://api.freeapi.app/api/v1/public/youtube/videos";
const videoContainer = document.getElementById("video-container");
const searchInput = document.getElementById("search-input");
const loader = document.getElementById("loader");
const noVideosMessage = document.getElementById("no-videos-message");

let videos = [];

// Fetch videos from API
async function fetchVideos() {
  try {
    loader.style.display = "block";
    videoContainer.style.display = "none";
    noVideosMessage.style.display = "none";

    const response = await fetch(API_URL);
    const data = await response.json();

    console.log("API Response:", data);

    if (data.statusCode === 200 && data.data && Array.isArray(data.data.data)) {
      videos = data.data.data
        .map((item) => {
          if (!item.items || !item.items.snippet || !item.items.id) return null;

          return {
            id: item.items.id,
            title: item.items.snippet.title,
            channel: item.items.snippet.channelTitle,
            thumbnail: item.items.snippet.thumbnails.high.url,
            url: `https://www.youtube.com/watch?v=${item.items.id}`,
            views: item.items.statistics?.viewCount || "N/A",
            likes: item.items.statistics?.likeCount || "N/A",
            comments: item.items.statistics?.commentCount || "N/A",
            duration: item.items.contentDetails?.duration || "N/A",
            uploadYear: new Date(item.items.snippet.publishedAt).getFullYear(),
          };
        })
        .filter((video) => video !== null);

      displayVideos(videos);
    } else {
      throw new Error("Invalid API response format");
    }
  } catch (error) {
    console.error("Error fetching videos:", error);
    videoContainer.innerHTML =
      "<p>Error loading videos. Please try again later.</p>";
  } finally {
    loader.style.display = "none";
    videoContainer.style.display = "grid";
  }
}

// Display Fetch videos
function displayVideos(videosToDisplay) {
  if (videosToDisplay.length === 0) {
    noVideosMessage.style.display = "block";
    videoContainer.style.display = "none";
    return;
  } else {
    noVideosMessage.style.display = "none";
    videoContainer.style.display = "grid";
  }

  videoContainer.innerHTML = videosToDisplay
    .map(
      (video) => `
        <div class="video-card" onclick="window.open('${video.url}', '_blank')">
            <img class="thumbnail" src="${video.thumbnail}" alt="${video.title}">
            <div class="video-info">
                <h3 class="video-title">${video.title}</h3>
                <p class="channel-name">${video.channel}</p>
                <p class="video-stats">Views: ${video.views} | Likes: ${video.likes} | Comments: ${video.comments} |Year ${video.uploadYear}</p>
            </div>
        </div>
    `
    )
    .join("");
}

// Handle search Input
searchInput.addEventListener("input", function () {
  const searchTerm = searchInput.value.toLowerCase();
  const filteredVideos = videos.filter(
    (video) =>
      video.title.toLowerCase().includes(searchTerm) ||
      video.channel.toLowerCase().includes(searchTerm)
  );
  displayVideos(filteredVideos);
});

fetchVideos();

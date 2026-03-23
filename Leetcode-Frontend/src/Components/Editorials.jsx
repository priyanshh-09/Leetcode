import React, { useEffect, useRef, useState } from "react";

export default function Editorials({ secureUrl, thumbnailUrl, duration }) {
  const videoRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // ⏱ Format Time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // ▶️ Play / Pause
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // ⏳ Update time
  useEffect(() => {
    const video = videoRef.current;

    const handleTimeUpdate = () => {
      if (video) setCurrentTime(video.currentTime); // FIXED
    };

    if (video) {
      video.addEventListener("timeupdate", handleTimeUpdate);
    }

    return () => {
      if (video) {
        video.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };
  }, []);

  // 📊 Progress %
  const progress = videoRef.current
    ? (currentTime / videoRef.current.duration) * 100
    : 0;

  // 🎯 Seek video
  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.target.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    const newTime = (clickX / width) * video.duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div
      className="relative w-full max-w-xl mx-auto"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* 🎥 Video */}
      <video
        ref={videoRef}
        src={secureUrl}
        poster={thumbnailUrl}
        className="w-full rounded-xl"
        onClick={togglePlayPause} // 👈 add this
      />

      {/* ▶️ Play Button Overlay */}
      {!isPlaying && (
        <div
          onClick={togglePlayPause}
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
        >
          <button className="bg-black/60 text-white px-4 py-2 rounded-full text-xl">
            ▶
          </button>
        </div>
      )}

      {/* 🎛 Controls */}
      {isHovering && (
        <div className="absolute bottom-0 left-0 w-full bg-black/60 p-2 rounded-b-xl">
          {/* ⏳ Progress Bar */}
          <div
            className="w-full h-2 bg-gray-400 rounded cursor-pointer"
            onClick={handleSeek}
          >
            <div
              className="h-2 bg-red-500 rounded"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* ⏱ Time + Play */}
          <div className="flex items-center justify-between text-white text-sm mt-1">
            <button onClick={togglePlayPause}>{isPlaying ? "❚❚" : "▶"}</button>

            <span>
              {formatTime(currentTime)} /{" "}
              {videoRef.current
                ? formatTime(videoRef.current.duration || 0)
                : "0:00"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

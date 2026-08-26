import React, { useEffect, useRef, useState } from 'react';
import { Lock, CheckCircle2 } from 'lucide-react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface ModulePlayerProps {
  videoId: string;
  moduleTitle: string;
  onComplete: () => void;
  isAlreadyCompleted?: boolean;
}

export function ModulePlayer({ videoId, moduleTitle, onComplete, isAlreadyCompleted = false }: ModulePlayerProps) {
  const [isVideoEnded, setIsVideoEnded] = useState<boolean>(isAlreadyCompleted);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // Reset locked state when switching to an uncompleted module
    if (!isAlreadyCompleted) {
      setIsVideoEnded(false);
    } else {
      setIsVideoEnded(true);
    }

    // Load YouTube API script if not present
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player(`youtube-player-${videoId}`, {
        videoId: videoId,
        playerVars: {
          enablejsapi: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onStateChange: (event: any) => {
            // YT.PlayerState.ENDED = 0
            if (event.data === 0) {
              setIsVideoEnded(true);
            } else if (event.data === 1) { // PLAYING
              setIsPlaying(true);
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId, isAlreadyCompleted]);

  return (
    <div className="space-y-4">
      {/* 16:9 HD Video Container */}
      <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-black">
        <div id={`youtube-player-${videoId}`} className="w-full h-full" />
      </div>

      {/* Completion Action Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-900">{moduleTitle}</h3>
          <p className="text-xs text-slate-500 font-medium">
            {isVideoEnded ? "Module complete! You can proceed." : "Watch the complete video to unlock the next step."}
          </p>
        </div>

        {/* Dynamic Locked / Unlocked Button */}
        <button
          onClick={onComplete}
          disabled={!isVideoEnded}
          className={`shrink-0 px-6 py-3 rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 select-none ${
            isVideoEnded
              ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer active:scale-95"
              : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60"
          }`}
        >
          {isVideoEnded ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white"/>
              Mark Completed & Next
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 text-slate-400"/>
              Locked (Watch to Complete)
            </>
          )}
        </button>
      </div>
    </div>
  );
}

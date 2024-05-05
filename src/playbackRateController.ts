// ==UserScript==
// @name         Playback rate controller
// @version      0.0.2
// @match        https://www.bilibili.com/video/*
// @match        https://www.bilibili.com/bangumi/play/*
// @match        https://www.bilibili.com/list/*
// ==/UserScript==

const videoElement: HTMLVideoElement = await selectElementAsync(".bpx-player-video-wrap video")
const video = {
  get playbackRate() {
    return videoElement.playbackRate
  },
  set playbackRate(rate: number) {
    videoElement.playbackRate = rate
  },
  togglePlayBackRate(rate1: number, rate2: number) {
    videoElement.playbackRate = videoElement.playbackRate === rate1 ? rate2 : rate1
  },
  basePlaybackRate: videoElement.playbackRate,
  toggleBasePlayBackRate(rate1: number, rate2: number) {
    this.basePlaybackRate = this.basePlaybackRate === rate1 ? rate2 : rate1
  },
}

enableTogglingPlaybackRate()
enableHoldingDownToControlPlaybackRate()

function enableTogglingPlaybackRate() {
  const presetOfRates = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  window.addEventListener(
    "keydown",
    (event) => {
      if (presetOfRates.includes(Number(event.key))) {
        video.togglePlayBackRate(Number(event.key), video.basePlaybackRate)
        return
      }

      switch (event.key) {
        case "s": {
          video.toggleBasePlayBackRate(1, 2)
          break
        }
        default:
          return
      }
    },
    true
  )
}

function enableHoldingDownToControlPlaybackRate() {
  window.addEventListener(
    "keydown",
    (event) => {
      switch (event.key) {
        case "a": {
          video.playbackRate = 4
          break
        }
        default:
          return
      }
    },
    true
  )
  window.addEventListener(
    "keyup",
    (event) => {
      switch (event.key) {
        case "a":
          video.playbackRate = video.basePlaybackRate
          break
        default:
          return
      }
    },
    true
  )
}

//

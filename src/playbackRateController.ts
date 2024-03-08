// ==UserScript==
// @name         Playback rate controller
// @namespace    http://tampermonkey.net/
// @version      0.0.2
// @description  try to take over the world!
// @author       You
// @match        https://www.bilibili.com/video/*
// @match        https://www.bilibili.com/bangumi/play/*
// @grant        none
// ==/UserScript==

import selectElementAsync from "./utils/selectElementAsync"
;(async function () {
  const videoElement = (await selectElementAsync(
    ".bpx-player-video-wrap video"
  )) as HTMLVideoElement
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
    const presetOfRates: string[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9"]
    window.addEventListener(
      "keydown",
      (event) => {
        if (presetOfRates.includes(event.key)) {
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
          case "r": {
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
          case "r":
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
})()

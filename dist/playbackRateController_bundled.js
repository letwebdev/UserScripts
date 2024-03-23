"use strict"
/**
 * Promise-based `setTimeout`
 */
async function wait(time) {
    function execute(resolve) {
        setTimeout(resolve, time);
    }
    return new Promise(execute);
}

async function selectElementAsync(querySelector, options = {
    intervalOfRetry: 1000,
    parent: document,
}) {
    const intervalOfRetry = options.intervalOfRetry || 1000;
    const parent = options.parent || document;
    const element = parent.querySelector(querySelector);
    if (element === null) {
        await wait(intervalOfRetry);
        return selectElementAsync(querySelector, options);
    }
    else {
        return element;
    }
}

// ==UserScript==
// @name         Playback rate controller
// @namespace    http://tampermonkey.net/
// @version      0.0.2
// @description  try to take over the world!
// @author       You
// @match        https://www.bilibili.com/video/*
// @match        https://www.bilibili.com/bangumi/play/*
// @match        https://www.bilibili.com/list/*
// @grant        none
// ==/UserScript==
(async function () {
    const videoElement = (await selectElementAsync(".bpx-player-video-wrap video"));
    const video = {
        get playbackRate() {
            return videoElement.playbackRate;
        },
        set playbackRate(rate) {
            videoElement.playbackRate = rate;
        },
        togglePlayBackRate(rate1, rate2) {
            videoElement.playbackRate = videoElement.playbackRate === rate1 ? rate2 : rate1;
        },
        basePlaybackRate: videoElement.playbackRate,
        toggleBasePlayBackRate(rate1, rate2) {
            this.basePlaybackRate = this.basePlaybackRate === rate1 ? rate2 : rate1;
        },
    };
    enableTogglingPlaybackRate();
    enableHoldingDownToControlPlaybackRate();
    function enableTogglingPlaybackRate() {
        const presetOfRates = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
        window.addEventListener("keydown", (event) => {
            if (presetOfRates.includes(event.key)) {
                video.togglePlayBackRate(Number(event.key), video.basePlaybackRate);
                return;
            }
            switch (event.key) {
                case "s": {
                    video.toggleBasePlayBackRate(1, 2);
                    break;
                }
                default:
                    return;
            }
        }, true);
    }
    function enableHoldingDownToControlPlaybackRate() {
        window.addEventListener("keydown", (event) => {
            switch (event.key) {
                case "a": {
                    video.playbackRate = 4;
                    break;
                }
                default:
                    return;
            }
        }, true);
        window.addEventListener("keyup", (event) => {
            switch (event.key) {
                case "a":
                    video.playbackRate = video.basePlaybackRate;
                    break;
                default:
                    return;
            }
        }, true);
    }
    //
})();

// ==UserScript==
// @name         Playback rate controller
// @version      0.0.2
// @match        https://www.bilibili.com/video/*
// @match        https://www.bilibili.com/bangumi/play/*
// @match        https://www.bilibili.com/list/*
// @grant        none
// @description
// ==/UserScript==
"use strict";
/**
 * Promise-based `setTimeout`
 */
async function wait(time) {
    function execute(resolve) {
        setTimeout(resolve, time);
    }
    return new Promise(execute);
}

/**
 * @param options.intervalOfRetry * Will retry at `a later time` if the element is null(e.g. not loaded in page yet)
 * @warn This may cause an observer relying on the element to not work properly
 * @default 1000
 */
async function selectElementAsync(selectors, options) {
    const { intervalOfRetry = 1000, parent = document, expectingTheElementToExist = true, patient = false, } = { ...options };
    let timesTried = 0;
    while (true) {
        if (expectingTheElementToExist && timesTried === 10) {
            const prompt = `\`selectElementAsync\` for "${selectors}" failed ${timesTried} times`;
            if (patient) {
                console.info(prompt);
            }
            else {
                console.warn(prompt);
            }
        }
        timesTried += 1;
        const element = parent.querySelector(selectors);
        if (element === null) {
            await wait(intervalOfRetry);
        }
        else {
            return element;
        }
    }
}

const videoElement = await selectElementAsync(".bpx-player-video-wrap video");
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
    const presetOfRates = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    window.addEventListener("keydown", (event) => {
        if (presetOfRates.includes(Number(event.key))) {
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

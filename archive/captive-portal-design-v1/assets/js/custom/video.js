

window.addEventListener('load', videoScroll);
window.addEventListener('scroll', videoScroll);

function videoScroll() {
	if (document.querySelectorAll('video[autoplay]').length > 0) {
		var windowHeight = window.innerHeight,
			videoEl = document.querySelectorAll('video[autoplay]');

		for (var i = 0; i < videoEl.length; i++) {
			var thisVideoEl = videoEl[ i ],
				videoHeight = thisVideoEl.clientHeight,
				videoClientRect = thisVideoEl.getBoundingClientRect().top;

			// if (videoClientRect <= windowHeight - videoHeight * 0.5 && videoClientRect >= 0 - videoHeight * 0.5) {
			// 	thisVideoEl.play();
			// } else {
			// 	thisVideoEl.pause();
			// }
		}
	}
}

let videoOpener = document.querySelector('#openVideo');
let videoCloseBtn = document.querySelector('#showVideoPopupClose');
let showVideoVideo = document.querySelector('#showVideoVideo');
let videoPopup = document.querySelector('#showVideoPopup');
let isVideoPopupVisisble = false;
let scrollBarPosition;

var tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
var firstScriptTag = document.getElementsByTagName('script')[ 0 ];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var ytPlayer;

function onYouTubeIframeAPIReady() {
	ytPlayer = new YT.Player('showVideoVideo', {
		events: {
			onReady: playVideo,
		},
	});
}

function playVideo() {
	ytPlayer.playVideo();
}
function stopVideo() {
	ytPlayer.stopVideo();
}

videoOpener.addEventListener('click', openVideoPopup);

videoCloseBtn.addEventListener('click', closeVideoPopup);

function openVideoPopup(event) {
	videoPopup.classList.add('popup-active');
	// ytPlayer.playVideo();
	isVideoPopupVisisble = true;
	scrollBarPosition = window.pageYOffset | document.body.scrollTop;
}


// $(document).ready(function () {
// 	$('#video-link').click(function (event) {
// 		event.preventDefault();
// 		openVideoPopup();
// 	});
// });

function closeVideoPopup() {
	videoPopup.classList.remove('popup-active');
	ytPlayer.stopVideo();
	isVideoPopupVisisble = false;
	scrollBarPosition = 0;
}

window.addEventListener(
	'scroll',
	(event) => {
		let scrollValue = window.pageYOffset | document.body.scrollTop;

		if (!isVideoPopupVisisble) return;

		if (scrollValue - scrollBarPosition >= 200) {
			closeVideoPopup();
		}
	},
	{ passive: true },
);
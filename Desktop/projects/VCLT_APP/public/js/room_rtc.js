const APP_ID = "acfe33308b7040beb8d22822d438123f"
let memberCount = 0;

let uid = sessionStorage.getItem('uid')
if (!uid) {
    uid = String(Math.floor(Math.random() * 10000))
    sessionStorage.setItem('uid', uid)
}

let token = null;
let client;

let rtmClient;
let channel;

const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
let roomId = urlParams.get('room')
console.log("===================================");
console.log(roomId);
console.log("===================================");
if (!roomId) {
    roomId = 'main'
}

let displayName = sessionStorage.getItem('display_name')
if (!displayName) {
    window.location = ''
}

let captionlanguage = sessionStorage.getItem('captionlanguage');
let captioncode;
if (!captionlanguage) {
    fetch(`/caption-language/${displayName}`)
        .then(response => response.json())
        .then(result => {
            console.log('Caption language:', result.captionLanguage);
            captionlanguage = result.captionLanguage;
            switch (captionlanguage) {
                case "English": captioncode = "en"; break;
                case "Hindi": captioncode = "hi"; break;
                case "Marathi": captioncode = "mr"; break;
                case "Tamil": captioncode = "ta"; break;
                case "Gujrati": captioncode = "gu"; break;
                default: captioncode = "en";
            }
            sessionStorage.setItem('captionlanguage', captionlanguage);
            sessionStorage.setItem('captioncode', captioncode);
        })
        .catch(err => {
            console.error('Error fetching translation:', err);
        });
}

let localTracks = []
let remoteUsers = {}

let localScreenTracks;
let sharingScreen = false;

let joinRoomInit = async () => {
    rtmClient = await AgoraRTM.createInstance(APP_ID)
    await rtmClient.login({ uid, token })

    await rtmClient.addOrUpdateLocalUserAttributes({ 'name': displayName })

    channel = await rtmClient.createChannel(roomId)
    await channel.join()

    channel.on('MemberJoined', handleMemberJoined);
    channel.on('MemberLeft', handleUserLeft);
    channel.on('ChannelMessage', handleChannelMessage);

    getMembers();
    addBotMessageToDom(`Welcome to the room ${displayName}! 👋`);

    client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    await client.join(APP_ID, roomId, token, uid);

    client.on('user-published', handleUserPublished);
    client.on('user-left', handleUserLeft);
    joinStream();
}


let joinStream = async () => {
    document.getElementsByClassName('stream__actions')[0].style.display = 'flex'
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks({}, {
        encoderConfig: {
            width: { min: 640, ideal: 1920, max: 1920 },
            height: { min: 480, ideal: 1080, max: 1080 }
        }
    });

    let player = `<div class="video__container" id="user-container-${uid}">
                    <div class="video-player" id="user-${uid}"></div>
                 </div>`;

    document.getElementById('streams__container').insertAdjacentHTML('beforeend', player);
    document.getElementById(`user-container-${uid}`).addEventListener('click', expandVideoFrame)

    localTracks[1].play(`user-${uid}`)
    console.log("===================================\nlocalTracks[0] : ", localTracks[0]); // testing purpose
    console.log("===================================\nlocalTracks[1] : ", localTracks[1]); // testing purpose

    await client.publish([localTracks[0], localTracks[1]])
}

let switchToCamera = async () => {
    let player = `<div class="video__container" id="user-container-${uid}">
                    <div class="video-player" id="user-${uid}"></div>
                 </div>`
    displayFrame.insertAdjacentHTML('beforeend', player)
    await localTracks[0].setMuted(true)
    await localTracks[1].setMuted(true)

    document.getElementById('mic-btn').classList.remove('active')
    document.getElementById('screen-btn').classList.remove('active')

    localTracks[1].play(`user-${uid}`)
    await client.publish([localTracks[1]])
}

let handleUserPublished = async (user, mediaType) => {
    remoteUsers[user.uid] = user
    // console.log("Length of RemoteUsers : ", remoteUsers, "\n===================");
    // const isTwoProperties = Object.keys(remoteUsers).length;
    // console.log(isTwoProperties);
    // console.log("===================================\nremoteUsers[user.uid] : ", remoteUsers[user.uid]); // testing purpose

    await client.subscribe(user, mediaType)
    let player = document.getElementById(`user-container-${user.uid}`)
    console.log("===================================\nplayer : ", player); // testing purpose
    if (player === null) {
        player = `<div class="video__container" id="user-container-${user.uid}">
                <div class="video-player" id="user-${user.uid}"></div>
            </div>`

        document.getElementById('streams__container').insertAdjacentHTML('beforeend', player)
        document.getElementById(`user-container-${user.uid}`).addEventListener('click', expandVideoFrame)

    }

    if (displayFrame.style.display) {
        let videoFrame = document.getElementById(`user-container-${user.uid}`)
        videoFrame.style.height = '100px'
        videoFrame.style.width = '100px'
    }

    if (mediaType === 'video') {
        user.videoTrack.play(`user-${user.uid}`)
    }

    if (mediaType === 'audio') {
        user.audioTrack.play()
    }

}

let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid]
    let item = document.getElementById(`user-container-${user.uid}`)
    if (item) {
        item.remove()
    }

    if (userIdInDisplayFrame === `user-container-${user.uid}`) {
        displayFrame.style.display = null

        let videoFrames = document.getElementsByClassName('video__container')

        for (let i = 0; videoFrames.length > i; i++) {
            videoFrames[i].style.height = '300px'
            videoFrames[i].style.width = '300px'
        }
    }
}

let toggleMic = async (e) => {
    let button = e.currentTarget

    if (localTracks[0].muted) {
        await localTracks[0].setMuted(false)
        button.classList.add('active')
        startSpeechRecog();
    } else {
        await localTracks[0].setMuted(true)
        button.classList.remove('active')
    }
}

let toggleCamera = async (e) => {
    let button = e.currentTarget
    if (localTracks[1].muted) {
        console.log("Switching on the camera");
        await localTracks[1].setMuted(false)
        button.classList.add('active')
    } else {
        console.log("Switching off the camera");
        await localTracks[1].setMuted(true)
        button.classList.remove('active')
    }
}

let toggleScreen = async (e) => {
    let screenButton = e.currentTarget
    let cameraButton = document.getElementById('camera-btn')
    if (!sharingScreen) {
        sharingScreen = true

        screenButton.classList.add('active')
        cameraButton.classList.remove('active')
        cameraButton.style.display = 'none'

        localScreenTracks = await AgoraRTC.createScreenVideoTrack()
        document.getElementById(`user-container-${uid}`).remove()
        displayFrame.style.display = 'block'
        let player = `<div class="video__container" id="user-container-${uid}">
                <div class="video-player" id="user-${uid}"></div>
            </div>`

        displayFrame.insertAdjacentHTML('beforeend', player)
        document.getElementById(`user-container-${uid}`).addEventListener('click', expandVideoFrame)

        userIdInDisplayFrame = `user-container-${uid}`
        localScreenTracks.play(`user-${uid}`)

        await client.unpublish([localTracks[1]])
        await client.publish([localScreenTracks])

        let videoFrames = document.getElementsByClassName('video__container')
        for (let i = 0; videoFrames.length > i; i++) {
            if (videoFrames[i].id != userIdInDisplayFrame) {
                videoFrames[i].style.height = '100px'
                videoFrames[i].style.width = '100px'
            }
        }
    } else {
        sharingScreen = false
        cameraButton.style.display = 'block'
        document.getElementById(`user-container-${uid}`).remove()
        await client.unpublish([localScreenTracks])
        switchToCamera()
    }
}

let leaveStream = async (e) => {
    e.preventDefault()
    document.getElementsByClassName('stream__actions')[0].style.display = 'none'
    for (let i = 0; localTracks.length > i; i++) {
        localTracks[i].stop()
        localTracks[i].close()
    }

    await client.unpublish([localTracks[0], localTracks[1]])
    if (localScreenTracks) {
        await client.unpublish([localScreenTracks])
    }

    document.getElementById(`user-container-${uid}`).remove()

    // if (userIdInDisplayFrame === `user-container-${uid}`) {
    //     displayFrame.style.display = null

    //     for (let i = 0; videoFrames.length > i; i++) {
    //         videoFrames[i].style.height = '300px'
    //         videoFrames[i].style.width = '300px'
    //     }
    // }

    channel.sendMessage({ text: JSON.stringify({ 'type': 'user_left', 'uid': uid }) })
    window.location = `/lobby`;
}

function startSpeechRecog() {
    var speechRecongnition = window.webkitSpeechRecognition
    var recognition = new speechRecongnition();
    var button = document.getElementById("mic-btn")
    var textbox = $("#textbox")
    var content = "";
    recognition.continuous = true;
    var speechcode;
    fetch(`/spoken-language/${displayName}`)
        .then(response => response.json())
        .then(data => {
            const spokenLanguage = data.spokenLanguage;
            console.log(spokenLanguage);
            switch (spokenLanguage) {
                case "English": speechcode = "en-US"; break;
                case "Hindi": speechcode = "hi-IN"; break;
                case "Marathi": speechcode = "mr-IN"; break;
                case "Tamil": speechcode = "ta-IN"; break;
                case "Gujrati": speechcode = "gu-IN"; break;
                default: speechcode = "en-US";
            }
            console.log("Speechcode: ", speechcode);
            recognition.lang = speechcode;
            console.log("recognition.lang: ", recognition.lang);

            recognition.onstart = function () {
                console.log("started");
            }

            recognition.onspeechend = function () {
                console.log("Ended");
            }

            recognition.onerror = function () {
                console.log("try again");
            }

            recognition.onresult = function (event) {
                var current = event.resultIndex;
                var transcript = event.results[current][0].transcript;
                content += transcript;
                textbox.val(content);
                let message = content;
                console.log(message);
                channel.sendMessage({ text: JSON.stringify({ 'type': 'speech', 'message': message, 'displayName': displayName, 'speechCode': speechcode }) });
            }

            if (button.classList.contains("active")) {
                console.log("Activated");
                if (content.length) {
                    content += '';
                }
                recognition.start();
            } else {
                console.log("De-activated");
                if (content.length) {
                    content += '';
                }
                recognition.stop();
            }

            textbox.on('input', function () {
                content = $(this).val()
            })
        })
        .catch(error => {
            console.error('Error fetching spokenLanguage:', error);
        });
}

document.getElementById('camera-btn').addEventListener('click', toggleCamera)
document.getElementById('mic-btn').addEventListener('click', toggleMic)
document.getElementById('screen-btn').addEventListener('click', toggleScreen)
document.getElementById('leave-btn').addEventListener('click', leaveStream)

joinRoomInit();

window.addEventListener('beforeunload', leaveChannel);


/*

ROOM NAME  CREATION DATE  CREATION TIME END TIME PARTICIPANTS 

roomdetail{
    roomname:"FirstRoom",
    creationdate:"11/09/2023",
    creationtime:"5:07 PM",
    endtime:"5:15 PM",
    participants:{
        user1:"vishnitin51@gmail.com",
        user2:"vishnitin51@gmail.com",
        user3:"vishnitin51@gmail.com",
        .....
    }
}

*/
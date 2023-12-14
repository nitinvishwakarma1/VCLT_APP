let memberCount1 = 1;

let handleMemberJoined = async (MemberId) => {
    console.log("===================");
    console.log(memberCount1++);
    console.log("===================");
    console.log('A new member has joined the room:', MemberId)
    await addMemberToDom(MemberId)
    let members = await channel.getMembers()
    updateMemberTotal(members)
    let { name } = await rtmClient.getUserAttributesByKeys(MemberId, ['name'])
    addBotMessageToDom(`Welcome to the room ${name}! 👋`)
}

let addMemberToDom = async (MemberId) => {
    let { name } = await rtmClient.getUserAttributesByKeys(MemberId, ['name'])

    let membersWrapper = document.getElementById('member__list')
    let memberItem = `<div class="member__wrapper" id="member__${MemberId}__wrapper">
                        <span class="green__icon" style="background-color:green"></span>
                        <p class="member_name">${name}</p>
                    </div>`

    membersWrapper.insertAdjacentHTML('beforeend', memberItem)
}

let updateMemberTotal = async (members) => {
    let total = document.getElementById('members__count')
    total.innerText = members.length
}

let handleMemberLeft = async (MemberId) => {
    removeMemberFromDom(MemberId)

    let members = await channel.getMembers()
    updateMemberTotal(members)
}

let removeMemberFromDom = async (MemberId) => {
    let memberWrapper = document.getElementById(`member__${MemberId}__wrapper`)
    let name = memberWrapper.getElementsByClassName('member_name')[0].textContent
    addBotMessageToDom(`${name} has left the room.`)

    memberWrapper.remove()
}

let getMembers = async () => {
    let members = await channel.getMembers()
    updateMemberTotal(members)
    for (let i = 0; members.length > i; i++) {
        addMemberToDom(members[i])
    }
}

let handleChannelMessage = async (messageData, MemberId) => {
    console.log('A new message was received')
    let data = JSON.parse(messageData.text)
    console.log(data);
    let captionCode = sessionStorage.getItem('captioncode');

    if (data.type === 'chat') {
        let specialSymbols = data.message.match(/[^A-Za-z\s]+/g);
        let messageWithoutSpecialSymbols = data.message.replace(/[^A-Za-z\s]/g, '');
        if(messageWithoutSpecialSymbols == ""){
            addMessageToDom(data.displayName, specialSymbols);
        }
        else{
            fetch(`/translate/${messageWithoutSpecialSymbols}/${data.speechCode}/${captionCode}`)
                .then(response => response.json())
                .then(translationResult => {
                    console.log('Translation Result:', translationResult.text);
                    translatedMessage = translationResult.text;

                    // Add emojis and special symbols back to the translated message
                    if (specialSymbols) {
                        translatedMessage += ' ' + specialSymbols.join(' ');
                    }

                    console.log("msg : ", translatedMessage);
                    data.message = translatedMessage;
                    console.log("data.message : ", data.message);
                    addMessageToDom(data.displayName, data.message);

                })
                .catch(err => {
                    console.error('Error fetching translation:', err);
                });
        }
    
    }else{
        fetch(`/translate/${data.message}/${data.speechCode}/${captionCode}`)
            .then(response => response.json())
            .then(translationResult => {
                console.log('Translation Result:', translationResult.text);
                translatedMessage = translationResult.text;
                console.log("msg : ", translatedMessage);
                data.message = translatedMessage;
                console.log("data.message : ", data.message);
                addCaptionToDom(data.displayName, data.message);
            })
            .catch(err => {
                console.error('Error fetching translation:', err);
            });
    }

    if (data.type === 'user_left') {
        document.getElementById(`user-container-${data.uid}`).remove()

        if (userIdInDisplayFrame === `user-container-${uid}`) {
            displayFrame.style.display = null

            for (let i = 0; videoFrames.length > i; i++) {
                videoFrames[i].style.height = '300px'
                videoFrames[i].style.width = '300px'
            }
        }
    }
}

let addMessageToDom = (name, message) => {
    let messagesWrapper = document.getElementById('messages')
    let newMessage = `<div class="message__wrapper">
                        <div class="message__body">
                            <strong class="message__author">${name}</strong>
                            <p class="message__text">${message}</p>
                        </div>
                    </div>`

    messagesWrapper.insertAdjacentHTML('beforeend', newMessage)
    let lastMessage = document.querySelector('#messages .message__wrapper:last-child')
    if (lastMessage) {
        lastMessage.scrollIntoView()
    }
}
let addCaptionToDom = (name, message) => {
    let captionWrapper = document.getElementById('captions')
    let newCaption = `<div class="caption__wrapper">
                        <div class="caption__body">
                            <strong class="message__author">${name}</strong>
                            <p class="message__text">${message}</p>
                        </div>
                    </div>`

    captionWrapper.insertAdjacentHTML('beforeend', newCaption)
    let lastCaption = document.querySelector('#captions .caption__wrapper:last-child')
    if (lastCaption) {
        lastMessage.scrollIntoView()
    }
}


let addBotMessageToDom = (botMessage) => {
    let messagesWrapper = document.getElementById('messages')

    let newMessage = `<div class="message__wrapper">
                        <div class="message__body__bot">
                            <strong class="message__author__bot">VCLT BOT</strong>
                            <p class="message__text__bot">${botMessage}</p>
                        </div>
                    </div>`

    messagesWrapper.insertAdjacentHTML('beforeend', newMessage)

    let lastMessage = document.querySelector('#messages .message__wrapper:last-child')
    if (lastMessage) {
        lastMessage.scrollIntoView()
    }
}

let leaveChannel = async () => {
    await channel.leave()
    await rtmClient.logout()
}

let sendMessage = async (e) => {
    e.preventDefault()

    let message = e.target.message.value
    channel.sendMessage({text:JSON.stringify({'type':'chat', 'message':message, 'displayName':displayName, 'speechCode': 'en-US' })})
    addMessageToDom(displayName, message)
    e.target.reset()
}

window.addEventListener('beforeunload', leaveChannel)
let messageForm = document.getElementById('message__form')
messageForm.addEventListener('submit', sendMessage)


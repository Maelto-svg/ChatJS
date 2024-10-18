let displayedMessages = []; // Liste des messages dÃ©jÃ  affichÃ©s

// Fonction pour gÃ©nÃ©rer un identifiant unique basÃ© sur l'auteur et le contenu original du message
function generateMessageId(author, originalMessage) {
  return `${author}-${originalMessage}`;
}

async function fetchChatMessages() {
  try {
    const response = await fetch('http://localhost:3014/chat');
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const chatMessages = await response.json();
    const chatWindow = document.querySelector('.chat-window');

    for (let message of chatMessages) {
      const messageId = generateMessageId(message.author, message.message);
      const isMessageDisplayed = displayedMessages.includes(messageId);

      if (!isMessageDisplayed) {
        try {
          const censorResponse = await fetch(`http://localhost:3014/censorMessage?message=${encodeURIComponent(message.message)}`);
          
          if (!censorResponse.ok) {
            throw new Error(`Censorship error! Status: ${censorResponse.status}`);
          }

          const censorData = await censorResponse.json();
          const censoredMessage = censorData.censoredMessage;

          const chatEntry = document.createElement('div');
          chatEntry.classList.add('chat-entry');

          const author = document.createElement('span');
          author.classList.add('author');
          author.textContent = message.author;

          const delimiter = document.createElement('span');
          delimiter.textContent = ': ';

          const messageContent = document.createElement('span');
          messageContent.classList.add('message');
          messageContent.textContent = censoredMessage;

          chatEntry.appendChild(author);
          chatEntry.appendChild(delimiter);
          chatEntry.appendChild(messageContent);

          chatWindow.appendChild(chatEntry);

          displayedMessages.push(messageId);

        } catch (censorshipError) {
          console.error('Erreur lors de la censure du message :', censorshipError);
          showErrorPopup(`Censorship Error: ${censorshipError.message}`);
        }
      }
    }
  } catch (error) {
    console.error('Erreur lors de la rÃ©cupÃ©ration des messages du chat :', error);
    showErrorPopup(`Network Error: ${error.message}`);
  }
}

// Appel de la fonction pour rÃ©cupÃ©rer les messages au chargement de la page
document.addEventListener('DOMContentLoaded', fetchChatMessages);

// Mettre Ã  jour rÃ©guliÃ¨rement la chatroom (optionnel, si tu veux des mises Ã  jour automatiques)
setInterval(fetchChatMessages, 5000); // Met Ã  jour les messages toutes les 5 secondes








async function sendMessage() {
  const messageInput = document.querySelector('.new-message-input');
  const messageText = messageInput.value.trim();
  const usernameInput = document.querySelector('.username-input');
  const alias = usernameInput.value.trim();

  if (!alias) {
    alert('Please enter an alias before sending a message.');
    return;
  }

  if (!messageText) {
    alert('Please enter a message before sending.');
    return;
  }

  const messagePayload = {
    author: alias,
    message: messageText
  };

  try {
    const response = await fetch('http://localhost:3014/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messagePayload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    messageInput.value = '';
    fetchChatMessages();

  } catch (error) {
    console.error('Erreur lors de l\'envoi du message :', error);
    showErrorPopup(`Network Error: ${error.message}`);
  }
}


// Ajouter un Ã©vÃ©nement au bouton Send
const sendButton = document.querySelector('.send-message-btn');
sendButton.addEventListener('click', sendMessage);

// Optionnel : Envoi avec "Enter" lorsqu'il n'y a pas de "Shift"
document.querySelector('.new-message-input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});










// Fonction pour vider le chat (requÃªte DELETE)
async function clearChat() {
  try {
    const response = await fetch('http://localhost:3014/chat', {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const chatWindow = document.querySelector('.chat-window');
    chatWindow.innerHTML = '<p>The chat has been cleared.</p>';
    displayedMessages = [];

  } catch (error) {
    console.error('Erreur lors de la suppression du chat :', error);
    showErrorPopup(`Network Error: ${error.message}`);
  }
}


// Associer la fonction clearChat Ã  l'Ã©vÃ©nement "click" du bouton Clear Chat
const clearChatButton = document.querySelector('.clear-chat-btn');
clearChatButton.addEventListener('click', clearChat);













// Function to show the error popup
function showErrorPopup(errorMessage) {
  const errorPopup = document.querySelector('.error-message-popup');
  const errorMessageElement = errorPopup.querySelector('.message');
  
  // Mettre Ã  jour le message d'erreur dans la popup
  errorMessageElement.textContent = errorMessage;
  
  // Ajouter la classe "active" pour rendre la popup visible
  errorPopup.classList.add('active');
}

// Function to close the error popup
function closeErrorPopup() {
  const errorPopup = document.querySelector('.error-message-popup');
  errorPopup.classList.remove('active'); // Removes the "active" class to hide the popup
}

// Attach the closeErrorPopup function to the "Close" button
const closeButton = document.querySelector('.close-btn');
closeButton.addEventListener('click', closeErrorPopup);
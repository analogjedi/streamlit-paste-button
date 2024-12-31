function sendValue(value) {
  Streamlit.setComponentValue(value);
}

async function parseClipboardData() {
  try {
    const items = await navigator.clipboard.read();
    const clipboardData = items[0];
    
    if (clipboardData.types.includes('image/png')) {
      const blob = await clipboardData.getType('image/png');
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = function () {
        const base64data = reader.result;
        sendValue({
          type: 'image',
          data: base64data
        });
      };
    } else {
      console.error('No image found in clipboard.');
      sendValue({
        type: 'error',
        message: 'No image found in clipboard'
      });
    }
  } catch (error) {
    console.error('Error reading clipboard:', error);
    sendValue({
      type: 'error',
      message: error.toString()
    });
  }
}

function clearImage() {
  sendValue({
    type: 'clear'
  });
}

function onRender(event) {
    if (!window.rendered) {
        document.body.style.backgroundColor = event.detail.theme.backgroundColor;
        const {label, text_color, background_color, hover_background_color, key} = event.detail.args;
        
        // Create paste button
        const pasteButton = document.getElementById('paste_button');
        pasteButton.innerHTML = label;
        pasteButton.style.color = text_color;
        pasteButton.id = key;
        pasteButton.addEventListener('click', parseClipboardData);

        // Style the paste button
        pasteButton.style.backgroundColor = background_color;
        pasteButton.addEventListener('mouseover', function() {
          pasteButton.style.backgroundColor = hover_background_color;
        });
        pasteButton.addEventListener('mouseout', function() {
          pasteButton.style.backgroundColor = background_color;
        });
        pasteButton.style.fontFamily = event.detail.theme.font;

        // Setup clear button functionality
        const clearButton = document.getElementById('clear_button');
        clearButton.addEventListener('click', clearImage);
        clearButton.style.fontFamily = event.detail.theme.font;

        window.rendered = true;
    }
}

Streamlit.events.addEventListener(Streamlit.RENDER_EVENT, onRender);
Streamlit.setComponentReady();
Streamlit.setFrameHeight(40);

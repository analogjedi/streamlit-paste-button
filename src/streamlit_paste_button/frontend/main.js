function sendValue(value) {
  Streamlit.setComponentValue(value);
}

function showClearButton() {
  const clearButton = document.getElementById('clear_button');
  if (clearButton) {
    clearButton.style.display = 'inline-flex';
  }
}

function hideClearButton() {
  const clearButton = document.getElementById('clear_button');
  if (clearButton) {
    clearButton.style.display = 'none';
  }
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
        showClearButton();
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
  hideClearButton();
}

// Add global keyboard event listener for Ctrl+V
document.addEventListener('keydown', async (e) => {
  // Check if the paste button exists in the DOM
  const pasteButton = document.getElementById('paste_button');
  if (!pasteButton) return;

  // Check for Ctrl+V or Cmd+V (Mac)
  if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
    // Visual feedback - briefly highlight the button
    const originalColor = pasteButton.style.backgroundColor;
    pasteButton.style.backgroundColor = '#2980b9';
    setTimeout(() => {
      pasteButton.style.backgroundColor = originalColor;
    }, 200);

    await parseClipboardData();
  }
});

function onRender(event) {
    if (!window.rendered) {
        document.body.style.backgroundColor = event.detail.theme.backgroundColor;
        const {label, text_color, background_color, hover_background_color, key, has_image} = event.detail.args;
        
        // Setup paste button
        const pasteButton = document.getElementById('paste_button');
        pasteButton.innerHTML = label; //+ ' (Ctrl+V)';  // Add keyboard shortcut hint
        pasteButton.style.color = text_color;
        pasteButton.id = key;
        pasteButton.addEventListener('click', parseClipboardData);
        pasteButton.style.backgroundColor = background_color;
        pasteButton.addEventListener('mouseover', function() {
          pasteButton.style.backgroundColor = hover_background_color;
        });
        pasteButton.addEventListener('mouseout', function() {
          pasteButton.style.backgroundColor = background_color;
        });
        pasteButton.style.fontFamily = event.detail.theme.font;

        // Setup clear button
        const clearButton = document.getElementById('clear_button');
        clearButton.addEventListener('click', clearImage);
        clearButton.style.fontFamily = event.detail.theme.font;
        
        // Show clear button if there's an existing image
        if (has_image) {
          showClearButton();
        }

        window.rendered = true;
    }
}

Streamlit.events.addEventListener(Streamlit.RENDER_EVENT, onRender);
Streamlit.setComponentReady();
Streamlit.setFrameHeight(40);

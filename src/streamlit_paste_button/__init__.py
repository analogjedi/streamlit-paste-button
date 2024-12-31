from pathlib import Path
from typing import Optional

import streamlit as st
import streamlit.components.v1 as components

from dataclasses import dataclass
from PIL import Image
import io
import base64
import re

# Tell streamlit that there is a component called streamlit_paste_button,
# and that the code to display that component is in the "frontend" folder
frontend_dir = (Path(__file__).parent / "frontend").absolute()
_component_func = components.declare_component(
    "streamlit_paste_button", path=str(frontend_dir)
)


@dataclass
class PasteResult:
    """Dataclass to store output of Javascript Component.

    Attributes
    ----------
    image_data: PIL.Image
        The image data.
    action: str
        The action type ('paste', 'clear', or None)
    """
    image_data: Image = None
    action: str = None

    def is_clear(self) -> bool:
        """Check if this is a clear action"""
        return self.action == 'clear'

    def is_paste(self) -> bool:
        """Check if this is a successful paste"""
        return self.image_data is not None


def _data_url_to_image(data_url: str) -> Image:
    """Convert base64 data string an Pillow Image"""
    _, _data_url = data_url.split(";base64,")
    return Image.open(io.BytesIO(base64.b64decode(_data_url)))


# Create the python function that will be called
def paste_image_button(
        label: str,
        text_color: Optional[str] = "#ffffff",
        background_color: Optional[str] = "#3498db",
        hover_background_color: Optional[str] = "#2980b9",
        key: Optional[str] = 'paste_button',
        errors: Optional[str] = 'ignore'
) -> PasteResult:
    """
    Create a button that can be used to paste an image from the clipboard.
    """
    # Check if there's already a pasted image
    has_image = False
    if 'session_state' in st.__dict__:
        if 'session_image_array' in st.session_state:
            has_image = "pasted png image file" in st.session_state['session_image_array']

    component_value = _component_func(
        label=label,
        text_color=text_color,
        background_color=background_color,
        hover_background_color=hover_background_color,
        key=key,
        has_image=has_image  # Pass the image state to the component
    )
    
    if component_value is None:
        return PasteResult()
    
    # Handle the new dictionary response structure
    if isinstance(component_value, dict):
        if component_value.get('type') == 'clear':
            return PasteResult(action='clear')
        elif component_value.get('type') == 'error':
            if errors == 'raise':
                error_message = component_value.get('message', 'Unknown error')
                if 'no image found in clipboard' in error_message.lower():
                    st.error('**Error**: No image found in clipboard', icon='🚨')
                else:
                    st.error(re.sub('(.+)(: .+)', r'**\1**\2', error_message), icon='🚨')
            return PasteResult()
        elif component_value.get('type') == 'image':
            image_data = component_value.get('data')
            if image_data:
                return PasteResult(
                    image_data=_data_url_to_image(image_data),
                    action='paste'
                )
    
    # Fallback for legacy string format
    elif isinstance(component_value, str):
        if component_value.startswith('error'):
            if errors == 'raise':
                if component_value.startswith('error: no image'):
                    st.error('**Error**: No image found in clipboard', icon='🚨')
                else:
                    st.error(re.sub('error: (.+)(: .+)', r'**\1**\2', component_value), icon='🚨')
            return PasteResult()
        return PasteResult(
            image_data=_data_url_to_image(component_value),
            action='paste'
        )
    
    return PasteResult()

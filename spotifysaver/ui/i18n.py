"""
Internationalization (i18n) module for SpotifySaver UI.

This module provides translation functionality for the web interface,
supporting English and Spanish languages.
"""

import os
from typing import Dict, Optional
from spotifysaver.config import Config


class I18n:
    """Simple internationalization class for the web UI."""

    def __init__(self):
        self.current_language = Config.UI_LANGUAGE.lower()
        self.translations = self._load_translations()

    def _load_translations(self) -> Dict[str, Dict[str, str]]:
        """Load translation dictionaries for supported languages."""
        return {
            'en': {
                'title': 'SpotifySaver - Music Downloader',
                'subtitle': 'Download music from Spotify with complete metadata',
                'download_config': 'Download Configuration',
                'spotify_url': 'Spotify URL:',
                'spotify_url_placeholder': 'https://open.spotify.com/playlist/...',
                'output_directory': 'Output Directory:',
                'output_directory_placeholder': 'Music',
                'audio_format': 'Audio Format:',
                'm4a_recommended': 'M4A (Recommended)',
                'mp3': 'MP3',
                'bitrate': 'Bitrate:',
                'best_quality': 'Best Quality',
                'include_lyrics': 'Include Lyrics',
                'create_nfo': 'Create NFO files (Jellyfin/Kodi)',
                'start_download': 'Start Download',
                'download_status': 'Download Status',
                'waiting': 'Waiting...',
                'activity_log': 'Activity Log',
                'html_lang': 'en'
            },
            'es': {
                'title': 'SpotifySaver - Descargador de Música',
                'subtitle': 'Descarga música de Spotify con metadatos completos',
                'download_config': 'Configuración de Descarga',
                'spotify_url': 'URL de Spotify:',
                'spotify_url_placeholder': 'https://open.spotify.com/playlist/...',
                'output_directory': 'Directorio de Salida:',
                'output_directory_placeholder': 'Music',
                'audio_format': 'Formato de Audio:',
                'm4a_recommended': 'M4A (Recomendado)',
                'mp3': 'MP3',
                'bitrate': 'Bitrate:',
                'best_quality': 'Mejor Calidad',
                'include_lyrics': 'Incluir Letras',
                'create_nfo': 'Crear archivos NFO (Jellyfin/Kodi)',
                'start_download': 'Iniciar Descarga',
                'download_status': 'Estado de la Descarga',
                'waiting': 'Esperando...',
                'activity_log': 'Registro de Actividad',
                'html_lang': 'es'
            }
        }

    def get_translation(self, key: str, language: Optional[str] = None) -> str:
        """Get translation for a given key.

        Args:
            key: Translation key
            language: Target language (defaults to current language)

        Returns:
            Translated string or key if not found
        """
        lang = (language or self.current_language).lower()
        if lang not in self.translations:
            lang = 'en'  # Fallback to English

        return self.translations[lang].get(key, key)

    def get_current_language(self) -> str:
        """Get the current language code."""
        return self.current_language

    def set_language(self, language: str) -> None:
        """Set the current language.

        Args:
            language: Language code ('en' or 'es')
        """
        if language.lower() in self.translations:
            self.current_language = language.lower()

    def get_all_translations(self) -> Dict[str, str]:
        """Get all translations for the current language.

        Returns:
            Dictionary of all translations for current language
        """
        lang = self.current_language
        if lang not in self.translations:
            lang = 'en'  # Fallback to English

        return self.translations[lang]


# Global i18n instance
i18n = I18n()
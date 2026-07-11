import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SECRET_KEY = os.getenv('SECRET_KEY')
    JWT_SECRET_KEY = os.getenv('SECRET_KEY')

    # Upload foto profil
    PROFILE_UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'profile')

    # Maksimal 5 MB
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024

    # Format yang diizinkan
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
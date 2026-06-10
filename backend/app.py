from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import db, migrate
from models import User, DefaultWardrobe, PersonalWardrobe

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)
db.init_app(app)
migrate.init_app(app, db)

@app.route('/')
def index():
    return {'message': 'Outfit Recommender API is running!'}

if __name__ == '__main__':
    app.run(debug=True)
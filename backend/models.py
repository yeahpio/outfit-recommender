from extensions import db

class User(db.Model):
    __tablename__ = 'users'

    id_user = db.Column(db.Integer, primary_key=True)
    nama = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)

    personal_wardrobe = db.relationship('PersonalWardrobe', backref='user', lazy=True, cascade='all, delete')

class DefaultWardrobe(db.Model):
    __tablename__ = 'default_wardrobe'

    id_default = db.Column(db.Integer, primary_key=True)
    nama_pakaian = db.Column(db.String(100), nullable=False)
    kategori = db.Column(db.String(20), nullable=False)
    style = db.Column(db.String(20), nullable=False)
    warna_grup = db.Column(db.String(20), nullable=False)
    image_url = db.Column(db.String(255))

class PersonalWardrobe(db.Model):
    __tablename__ = 'personal_wardrobe'

    id_personal = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id_user'), nullable=False)
    nama_pakaian = db.Column(db.String(100), nullable=False)
    kategori = db.Column(db.String(20), nullable=False)
    style = db.Column(db.String(20), nullable=False)
    warna_grup = db.Column(db.String(20), nullable=False)
    image_path = db.Column(db.String(255))
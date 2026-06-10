from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from extensions import db, bcrypt
from models import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    nama = data.get('nama')
    username = data.get('username')
    password = data.get('password')

    if not nama or not username or not password:
        return jsonify({'message': 'nama, username, dan password wajib diisi'}), 400

    existing_user = User.query.filter_by(username=username).first()

    if existing_user:
        return jsonify({'message': 'username sudah digunakan'}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    new_user = User(
        nama=nama,
        username=username,
        password=hashed_password
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        'message': 'registrasi berhasil',
        'user': {
            'id_user': new_user.id_user,
            'nama': new_user.nama,
            'username': new_user.username
        }
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'username dan password wajib diisi'}), 400

    user = User.query.filter_by(username=username).first()

    if not user:
        return jsonify({'message': 'username atau password salah'}), 401

    password_valid = bcrypt.check_password_hash(user.password, password)

    if not password_valid:
        return jsonify({'message': 'username atau password salah'}), 401

    token = create_access_token(identity=str(user.id_user))

    return jsonify({
        'message': 'login berhasil',
        'token': token,
        'user': {
            'id_user': user.id_user,
            'nama': user.nama,
            'username': user.username
        }
    }), 200
from flask import Blueprint, jsonify, request, current_app
from models import DefaultWardrobe, PersonalWardrobe
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
import os
import uuid
from werkzeug.utils import secure_filename

wardrobe_bp = Blueprint('wardrobe', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'avif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@wardrobe_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_image():
    if 'image' not in request.files:
        return jsonify({'message': 'No file uploaded'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'message': 'Filename is empty'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        ext = filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4().hex}.{ext}"
        
        upload_folder = os.path.join(current_app.root_path, 'static', 'uploads')
        os.makedirs(upload_folder, exist_ok=True)
        
        filepath = os.path.join(upload_folder, unique_filename)
        file.save(filepath)
        
        relative_path = f"static/uploads/{unique_filename}"
        full_url = request.host_url.rstrip('/') + '/' + relative_path
        
        return jsonify({
            'message': 'File uploaded successfully',
            'image_path': relative_path,
            'image_url': full_url
        }), 200
        
    return jsonify({'message': 'File format not supported'}), 400


@wardrobe_bp.route('/default', methods=['GET'])
def get_default_wardrobe():
    items = DefaultWardrobe.query.all()

    result = []

    for item in items:
        image_url = item.image_url

        if image_url and not image_url.startswith(('http://', 'https://')):
            image_url = request.host_url.rstrip('/') + '/' + image_url

        result.append({
            'id_default': item.id_default,
            'nama_pakaian': item.nama_pakaian,
            'kategori': item.kategori,
            'style': item.style,
            'warna_grup': item.warna_grup,
            'image_url': image_url
        })

    return jsonify({
        'message': 'Default wardrobe data retrieved successfully',
        'data': result
    }), 200

@wardrobe_bp.route('/personal', methods=['GET'])
@jwt_required()
def get_personal_wardrobe():
    user_id = get_jwt_identity()

    items = PersonalWardrobe.query.filter_by(user_id=int(user_id)).all()

    result = []

    for item in items:
        image_path = item.image_path
        if image_path and not image_path.startswith(('http://', 'https://')):
            image_path = request.host_url + image_path

        result.append({
            'id_personal': item.id_personal,
            'user_id': item.user_id,
            'nama_pakaian': item.nama_pakaian,
            'kategori': item.kategori,
            'style': item.style,
            'warna_grup': item.warna_grup,
            'image_path': image_path
        })

    return jsonify({
        'message': 'Personal wardrobe data retrieved successfully',
        'data': result
    }), 200

@wardrobe_bp.route('/personal', methods=['POST'])
@jwt_required()
def add_personal_wardrobe():
    user_id = get_jwt_identity()
    data = request.get_json()

    nama_pakaian = data.get('nama_pakaian')
    kategori = data.get('kategori')
    style = data.get('style')
    warna_grup = data.get('warna_grup')
    image_path = data.get('image_path')

    if not nama_pakaian or not kategori or not style or not warna_grup:
        return jsonify({
            'message': 'Clothing name, category, style, and color group are required'
        }), 400
    
    valid_kategori = ['atasan', 'bawahan', 'sepatu']
    valid_style = ['casual', 'formal', 'sporty']
    valid_warna = ['neutral', 'warm', 'cool']

    if kategori not in valid_kategori:
        return jsonify({'message': 'Invalid category'}), 400

    if style not in valid_style:
        return jsonify({'message': 'Invalid style'}), 400

    if warna_grup not in valid_warna:
        return jsonify({'message': 'Invalid color group'}), 400

    new_item = PersonalWardrobe(
        user_id=int(user_id),
        nama_pakaian=nama_pakaian,
        kategori=kategori,
        style=style,
        warna_grup=warna_grup,
        image_path=image_path
    )

    db.session.add(new_item)
    db.session.commit()

    resp_image_path = new_item.image_path
    if resp_image_path and not resp_image_path.startswith(('http://', 'https://')):
        resp_image_path = request.host_url + resp_image_path

    return jsonify({
        'message': 'Personal wardrobe data added successfully',
        'data': {
            'id_personal': new_item.id_personal,
            'user_id': new_item.user_id,
            'nama_pakaian': new_item.nama_pakaian,
            'kategori': new_item.kategori,
            'style': new_item.style,
            'warna_grup': new_item.warna_grup,
            'image_path': resp_image_path
        }
    }), 201

@wardrobe_bp.route('/personal/<int:id_personal>', methods=['PUT'])
@jwt_required()
def update_personal_wardrobe(id_personal):
    user_id = get_jwt_identity()
    data = request.get_json()

    item = PersonalWardrobe.query.filter_by(
        id_personal=id_personal,
        user_id=int(user_id)
    ).first()

    if not item:
        return jsonify({'message': 'Personal wardrobe data not found'}), 404

    nama_pakaian = data.get('nama_pakaian')
    kategori = data.get('kategori')
    style = data.get('style')
    warna_grup = data.get('warna_grup')
    image_path = data.get('image_path')

    if not nama_pakaian or not kategori or not style or not warna_grup:
        return jsonify({
            'message': 'Clothing name, category, style, and color group are required'
        }), 400

    valid_kategori = ['atasan', 'bawahan', 'sepatu']
    valid_style = ['casual', 'formal', 'sporty']
    valid_warna = ['neutral', 'warm', 'cool']

    if kategori not in valid_kategori:
        return jsonify({'message': 'Invalid category'}), 400

    if style not in valid_style:
        return jsonify({'message': 'Invalid style'}), 400

    if warna_grup not in valid_warna:
        return jsonify({'message': 'Invalid color group'}), 400

    item.nama_pakaian = nama_pakaian
    item.kategori = kategori
    item.style = style
    item.warna_grup = warna_grup
    item.image_path = image_path

    db.session.commit()

    return jsonify({
        'message': 'Personal wardrobe data updated successfully'
    }), 200

@wardrobe_bp.route('/personal/<int:id_personal>', methods=['DELETE'])
@jwt_required()
def delete_personal_wardrobe(id_personal):
    user_id = get_jwt_identity()

    item = PersonalWardrobe.query.filter_by(
        id_personal=id_personal,
        user_id=int(user_id)
    ).first()

    if not item:
        return jsonify({
            'message': 'Personal wardrobe data not found'
        }), 404

    # Hapus file gambar jika ada
    if item.image_path and not item.image_path.startswith(('http://', 'https://')):
        file_path = os.path.join(current_app.root_path, item.image_path)

        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                current_app.logger.warning(f"Gagal menghapus file: {e}")

    db.session.delete(item)
    db.session.commit()

    return jsonify({
        'message': 'Personal wardrobe data deleted successfully'
    }), 200
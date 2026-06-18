from flask import Blueprint, jsonify, request
from models import DefaultWardrobe, PersonalWardrobe
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db

wardrobe_bp = Blueprint('wardrobe', __name__)


@wardrobe_bp.route('/default', methods=['GET'])
def get_default_wardrobe():
    items = DefaultWardrobe.query.all()

    result = []

    for item in items:
        result.append({
            'id_default': item.id_default,
            'nama_pakaian': item.nama_pakaian,
            'kategori': item.kategori,
            'style': item.style,
            'warna_grup': item.warna_grup,
            'image_url': item.image_url
        })

    return jsonify({
        'message': 'data default wardrobe berhasil diambil',
        'data': result
    }), 200

@wardrobe_bp.route('/personal', methods=['GET'])
@jwt_required()
def get_personal_wardrobe():
    user_id = get_jwt_identity()

    items = PersonalWardrobe.query.filter_by(user_id=int(user_id)).all()

    result = []

    for item in items:
        result.append({
            'id_personal': item.id_personal,
            'user_id': item.user_id,
            'nama_pakaian': item.nama_pakaian,
            'kategori': item.kategori,
            'style': item.style,
            'warna_grup': item.warna_grup,
            'image_path': item.image_path
        })

    return jsonify({
        'message': 'data personal wardrobe berhasil diambil',
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
            'message': 'nama pakaian, kategori, style, dan warna grup wajib diisi'
        }), 400
    
    valid_kategori = ['atasan', 'bawahan', 'sepatu']
    valid_style = ['casual', 'formal', 'sporty']
    valid_warna = ['neutral', 'warm', 'cool']

    if kategori not in valid_kategori:
        return jsonify({'message': 'kategori tidak valid'}), 400

    if style not in valid_style:
        return jsonify({'message': 'style tidak valid'}), 400

    if warna_grup not in valid_warna:
        return jsonify({'message': 'warna grup tidak valid'}), 400

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

    return jsonify({
        'message': 'data personal wardrobe berhasil ditambahkan',
        'data': {
            'id_personal': new_item.id_personal,
            'user_id': new_item.user_id,
            'nama_pakaian': new_item.nama_pakaian,
            'kategori': new_item.kategori,
            'style': new_item.style,
            'warna_grup': new_item.warna_grup,
            'image_path': new_item.image_path
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
            return jsonify({'message': 'data personal wardrobe tidak ditemukan'}), 404

        nama_pakaian = data.get('nama_pakaian')
        kategori = data.get('kategori')
        style = data.get('style')
        warna_grup = data.get('warna_grup')
        image_path = data.get('image_path')

        if not nama_pakaian or not kategori or not style or not warna_grup:
            return jsonify({
                'message': 'nama pakaian, kategori, style, dan warna grup wajib diisi'
            }), 400

        valid_kategori = ['atasan', 'bawahan', 'sepatu']
        valid_style = ['casual', 'formal', 'sporty']
        valid_warna = ['neutral', 'warm', 'cool']

        if kategori not in valid_kategori:
            return jsonify({'message': 'kategori tidak valid'}), 400

        if style not in valid_style:
            return jsonify({'message': 'style tidak valid'}), 400

        if warna_grup not in valid_warna:
            return jsonify({'message': 'warna grup tidak valid'}), 400

        item.nama_pakaian = nama_pakaian
        item.kategori = kategori
        item.style = style
        item.warna_grup = warna_grup
        item.image_path = image_path

        db.session.commit()

        return jsonify({
            'message': 'data personal wardrobe berhasil diperbarui'
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
            return jsonify({'message': 'data personal wardrobe tidak ditemukan'}), 404

        db.session.delete(item)
        db.session.commit()

        return jsonify({
            'message': 'data personal wardrobe berhasil dihapus'
        }), 200
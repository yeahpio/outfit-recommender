from flask import Blueprint, jsonify, request
from models import DefaultWardrobe, PersonalWardrobe

recommendation_bp = Blueprint(
    'recommendation',
    __name__
)

def warna_valid(warna1, warna2, warna3):

    warna = {warna1, warna2, warna3}

    if 'warm' in warna and 'cool' in warna:
        return False

    return True

@recommendation_bp.route('/generate', methods=['POST'])
def generate_recommendation():

    data = request.get_json()

    source = data.get('source')
    style = data.get('style')
    warna_grup = data.get('warna_grup')

    valid_sources = ['default', 'personal', 'both']

    if source not in valid_sources:
        return jsonify({
            'message': 'Source tidak valid'
        }), 400
    
    valid_styles = ['casual', 'formal', 'sporty']

    if style and style not in valid_styles:
        return jsonify({
            'message': 'Style tidak valid'
        }), 400

    valid_warna = ['neutral', 'warm', 'cool']

    if warna_grup and warna_grup not in valid_warna:
        return jsonify({
            'message': 'Warna grup tidak valid'
        }), 400
    
    if source == 'default':
        clothes = DefaultWardrobe.query.all()

    elif source == 'personal':
        clothes = PersonalWardrobe.query.all()

    else:
        default_clothes = DefaultWardrobe.query.all()
        personal_clothes = PersonalWardrobe.query.all()

        clothes = default_clothes + personal_clothes

    atasan = []
    bawahan = []
    sepatu = []

    for item in clothes:

        if item.kategori == 'atasan':
            atasan.append(item)

        elif item.kategori == 'bawahan':
            bawahan.append(item)

        elif item.kategori == 'sepatu':
            sepatu.append(item)

    if not atasan or not bawahan or not sepatu:
        return jsonify({
            'message': 'Data wardrobe belum lengkap'
        }), 400
    
    if style:
        atasan = [item for item in atasan if item.style == style]
        bawahan = [item for item in bawahan if item.style == style]
        sepatu = [item for item in sepatu if item.style == style]

    if warna_grup:
        atasan = [item for item in atasan if item.warna_grup == warna_grup]
        bawahan = [item for item in bawahan if item.warna_grup == warna_grup]
        sepatu = [item for item in sepatu if item.warna_grup == warna_grup]

    if not atasan or not bawahan or not sepatu:
        return jsonify({
            'message': 'Tidak ada kombinasi yang sesuai filter'
        }), 400

    outfits = []
    for a in atasan:
        for b in bawahan:
            for s in sepatu:

                outfits.append({
                    'atasan': a,
                    'bawahan': b,
                    'sepatu': s
                })

    valid_style_outfits = []
    for outfit in outfits:
        a = outfit['atasan']
        b = outfit['bawahan']
        s = outfit['sepatu']

        if a.style == b.style == s.style:
            valid_style_outfits.append(outfit)

    valid_outfits = []
    for outfit in valid_style_outfits:
        a = outfit['atasan']
        b = outfit['bawahan']
        s = outfit['sepatu']

        if warna_valid(
            a.warna_grup,
            b.warna_grup,
            s.warna_grup
        ):
            valid_outfits.append(outfit)

    result = []
    for outfit in valid_outfits:
        result.append({
            'atasan': outfit['atasan'].nama_pakaian,
            'bawahan': outfit['bawahan'].nama_pakaian,
            'sepatu': outfit['sepatu'].nama_pakaian
        })

    return jsonify({
        'total_outfit': len(result),
        'outfits': result
    }), 200
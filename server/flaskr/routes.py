from flask import Blueprint, render_template, abort, request, Response, current_app
from flask.json import jsonify
from jinja2 import TemplateNotFound
from flaskr.db import mongo
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.wsgi import wrap_file
from werkzeug.utils import secure_filename
import os
from bson import json_util
from bson.objectid import ObjectId
from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    jwt_refresh_token_required, create_refresh_token,
    get_jwt_identity, set_access_cookies,
    set_refresh_cookies, unset_jwt_cookies,
)
from bson.objectid import ObjectId
from gridfs import GridFS, NoFile
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'jfif', 'svg', 'pjp', 'pjpeg'}


environment = os.environ['FLASK_ENV']
if environment == "production":
    bp = Blueprint("routes", __name__, template_folder='../../client/build')
else:
    bp = Blueprint("routes", __name__)

@bp.route('/api/register', methods=["POST"])
def register():
    try:
        if not all(k in request.json for k in ('username', 'password', 'name', 'email')):
            return "Missing parameters", 404

        username = request.json['username']
        password = request.json['password']
        name = request.json['name']
        email = request.json['email']

        if (not username) or (not password) or (not name) or (not email):
            return "Missing/Incorrect Information", 422
        if mongo.db.users.find_one({'username': username}):
            return "Username Already Exists", 403
        mongo.db.users.insert_one({'username': username, 'password': generate_password_hash(
            password), 'name': name, 'email': email, 'images': []})
        return "User successfully created", 201
    except:
        return "There was an Error", 400

@bp.route('/api/logout', methods=['POST'])
def logout():
    try:
        resp = jsonify({})
        unset_jwt_cookies(resp)
        return resp, 200
    except:
        return "There was an Error", 400

@bp.route('/api/login', methods=('GET', 'POST'))
def login():
    try:
        if request.method == 'POST':
            if not all(k in request.json for k in ('username', 'password')):
                return "Missing parameters", 404

            username = request.json['username']
            password = request.json['password']

            user = mongo.db.users.find_one({'username': username})
            if user:
                if check_password_hash(user['password'], password):
                    access_token = create_access_token(
                        identity=str(user['_id']))
                    resp = jsonify({})
                    set_access_cookies(resp, access_token)
                    return resp, 200
            return "Incorrect credentials", 403
        return "Could not login,", 400

    except:
        return "There was an Error", 400

@bp.route('/api/checkauth', methods=["GET"])
@jwt_required
def checkAuthentication():
    if request.method == 'GET':
        return "Success", 200
    return "Failure", 400


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@bp.route('/api/uploadImages', methods=["POST"])
@jwt_required
def uploadImage():
    if request.method == 'POST':
        if 'files[]' not in request.files:
            return "No Files Upload", 400
        userID = get_jwt_identity()
        files = request.files.getlist('files[]')
        allImageID = []
        allImageData = []
        for file in files:
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                print(file)
                kwargs = {"user": ObjectId(userID), "privacy": "private"}
                imageID = mongo.save_file(filename, file,**kwargs)
                imageData = mongo.db.fs.files.find_one({"_id": ObjectId(imageID)})
                allImageID.append(imageID)
                allImageData.append(imageData)
        mongo.db.users.update(
            {'_id': ObjectId(userID)}, 
            {'$push': 
                {"images" : 
                    {'$each' : allImageID} 
                }
            })
        return Response(json_util.dumps(allImageData), mimetype='application/json'), 200
    return "Failure", 400


def retrieve_image(file_id, mongo):
    storage = GridFS(mongo.db, "fs")
    try:
        fileobj = storage.get(file_id=ObjectId(file_id))
    except NoFile:
        return "Failed To Retrieve Image"
    data = wrap_file(request.environ, fileobj, buffer_size=1024 * 255)
    response = current_app.response_class(
        data,
        mimetype=fileobj.content_type,
        direct_passthrough=True,
        )
    response.content_length = fileobj.length
    response.last_modified = fileobj.upload_date
    response.set_etag(fileobj.md5)
    response.cache_control.max_age = 31536000
    response.cache_control.public = True
    response.make_conditional(request)
    return response

@bp.route('/api/getImage/<string:imageID>', methods=["GET"])
@jwt_required
def getImage(imageID=""):
    if request.method == 'GET':
        userID = get_jwt_identity()
        image = mongo.db.fs.files.find_one({"_id": ObjectId(imageID)})
        if (image['privacy'] == "private" and image['user'] == ObjectId(userID)) or image['privacy'] == "public":
            return retrieve_image(imageID, mongo), 200
        return "Unable To Get Image", 400
    return "Failure", 400

@bp.route('/api/deleteImages', methods=["PATCH"])
@jwt_required
def deleteImage():
    if request.method == 'PATCH':
        req = request.get_json()
        imagesToDelete = req['imagesToDelete']
        imageToDeleteIDs = []
        for imageID in imagesToDelete:
            imageToDeleteIDs.append(ObjectId(imageID))
        userID = get_jwt_identity()
        mongo.db.fs.files.remove({'_id' : { '$in' : imageToDeleteIDs }})
        mongo.db.users.update(
            {'_id': ObjectId(userID)}, 
            {'$pull': 
                {"images" : { '$in' : imageToDeleteIDs }}
            })
        mongo.db.fs.chunks.remove({"files_id":{ '$in' : imageToDeleteIDs }})
        return "Deleted Images", 200
    return "Failed To Delete Image", 400

@bp.route('/api/getUserImageData', methods=["GET"])
@bp.route('/api/getUserImageData/<string:searchterm>', methods=["GET"])
@jwt_required
def getImageData(searchterm=""):
    if request.method == 'GET':
        userID = get_jwt_identity()
        imageIDs = list(mongo.db.users.find_one({'_id': ObjectId(userID)})["images"])
        images = list(mongo.db.fs.files.find({'filename': {'$regex': searchterm, '$options': 'i'}, '_id' : { '$in' : imageIDs } } ))
        return Response(json_util.dumps(images), mimetype='application/json'), 200
    return "Failure", 400

@bp.route("/api/getAllUserImageData", methods=["GET"])
@bp.route('/api/getAllUserImageData/<string:searchterm>', methods=["GET"])
@bp.route('/api/getAllUserImageData/<int:num>', methods=["GET"])
@bp.route('/api/getAllUserImageData/<string:searchterm>/<int:num>', methods=["GET"])
@jwt_required
def getAllUserImageData(searchterm="",num=0):
    if request.method == 'GET':
        images = list(mongo.db.fs.files.find({'filename': {'$regex': searchterm, '$options': 'i'}, 'privacy': "public"}).limit(num))
        return Response(json_util.dumps(images), mimetype='application/json'), 200
    return "Failure", 400

@bp.route("/api/changeImagePrivacy", methods=["PATCH"])
@jwt_required
def changeImagePrivacy():
    if request.method == 'PATCH':
        req = request.get_json()
        imagesToChangePrivacy = req['imagesToChangePrivacy']
        privacy = req['privacy']
        if privacy != "public" and privacy != "private":
            return "Incorrect Privacy Setting", 400
        userID = get_jwt_identity()
        imagesToChangePrivacyIDs = []
        for imageID in imagesToChangePrivacy:
            imagesToChangePrivacyIDs.append(ObjectId(imageID))
        mongo.db.fs.files.update({'_id': { '$in' : imagesToChangePrivacyIDs}, 'user': ObjectId(userID)}, {'$set' : {"privacy" : privacy}}, multi=True)
        return "Changed Privacy Of Image", 200
    return "Failure", 400
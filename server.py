# Import settings
#   python3.5
import datetime
import os

from flask import Flask, request, jsonify, abort, render_template, session, redirect, url_for, g, make_response
from flask_debugtoolbar import DebugToolbarExtension
from jinja2 import StrictUndefined

import geofuntcions as gf
from models import connect_to_db, db, User, SavedPlaces

from flask_debugtoolbar import DebugToolbarExtension
# ----------------------
# Max distance btw 2 locations
# it will be to compare the distance
# it is in meters

RADIUS_CIRCLE = 10   # distance used to be same place
RADIUS_SAVED_PLACES = 30000  # considering closed places in radius of 30km

# ------------------------------------------------

# Create a flask app and set a random secret key
# Create the app
app = Flask(__name__)
app.secret_key = os.urandom(24)


# raises error if you use an undefined variable in Jinja2
#app.jinja_env.undefined = StrictUndefined

# ================================================================================
#  Registration, Login, and User Profile
# ================================================================================
# @app.before_request
# def before_request():
#     g.user = None
#     if 'username' in session:
#         g.user = session['username']

@app.route('/register/', methods=['POST','GET'])
def register():
    error = None

    if request.method == 'POST':

        email = request.form.get('email')
        # check if the email was already used in the database
        pending_user_email = User.query.filter_by(email=email).first()

        if pending_user_email is not None:

            # Create function to inform that email was already used

            # pass error saying that email already in the database
            error = "Email already in the database, please, log in!"

            return redirect(url_for('login'))
        else:

            password = request.form['password']
            pending_user = request.form['username']
            created_timestamp = datetime.datetime.utcnow()

            user = User(email=email, pw_hash=password, username=pending_user, created_timestamp=created_timestamp)

            current_session = db.session  # open database session

            try:
                current_session.add(user)  # add opened statement to opened session
                current_session.commit()  # commit changes

                # initiate the session with the current user
                # create a user_id session
                session['user_id'] = user.id
                session['username'] = pending_user

            except:
                current_session.rollback()
                current_session.flush()  # for resetting non-commited .add()

                # In case of fail not start the session with
                session['user_id'] = None
                session['username'] = None

            finally:
                current_session.close()

        return render_template('map.html')
    else:
        #error = "405  Method not allowed"
        return render_template('register.html')


@app.route('/login/', methods=['POST', 'GET'])
def login():
    error = None
    if request.method == 'POST':

        password = request.form['password']
        email = request.form['email']

        possible_user = User.query.filter_by(email=email).first()

        if possible_user and possible_user.verify_password(password):

            session['username'] = possible_user.username
            session['user_id'] = possible_user.id
            return render_template("map.html")

        else:
            error = "Invalid Credentials. Please try again."
            return render_template("login.html", error=error)

    else:
        # error = "405  Method not allowed"
        return render_template("login.html", error=error)


@app.route('/logout/')
def logout():
    session.pop('username', None)
    # this remove the entire session dictionary
    session.clear()
    return render_template("map.html")

# Homepage
@app.route('/')
def home():
    return render_template("map.html")


# ------------------------------------------------------
# ------------------------------------------------------
# Inserting data
# Using Method Post
# ------------------------------------------------------
# ------------------------------------------------------
#   Endpoints related to User Table
# ------------------------------------------------------
# get all previous saved places
@app.route('/get_favorite_places/<int:user_id>', methods=['GET'])
def get_all_favorite_laces():
    """
    Query data related to all previous saved places and return as a json object

    """
    if request.method == 'GET':
        # code to update all waiting time columns
        # create function to update waiting time all rows

        user_id = request.args.get('user_id')
        current_location_lat = float(request.args.get('location_lat'))
        current_location_long = float(request.args.get('location_long'))

        allsavedplaces = SavedPlaces.query.filter_by(id=user_id).all()

        #TODO evaluate use the user current location to display just the saved places in a range closer to user current location

        # if allsavedplaces is not None:

        return jsonify(savedplaces_json=[SavedPlaces.serialize for allsavedplace in allsavedplaces])


# - End of points related to User Table
# ------------------------------------------------------
#   POST /create_save_place/ - create a new favorite place place in the database
@app.route('/save_favorite_place/', methods=['POST'])
def save_favorite_place():
    """ Save user's favorite spot to db """
    if not request.json or not 'location_lat' in request.json or not 'location_long' in request.json or not 'user_id' in request.json:
        abort(404)

    # parsing request data
    # -------------------------
    content = request.get_json(force=True)
    created_timestamp = datetime.datetime.now()
    modified_timestamp = datetime.datetime.now()
    user_id = content["user_id"]
    locationlat = content["location_lat"]
    locationlong = content["location_long"]
    waiting_time = content["waiting_time"]
    address = content["address"]

    # create object to insert in the database
    # prepare query statement

    # create query to confirm that username already exists in the table user
    # otherwise insert in the table

    current_session = db.session  # open database session
    owner_id = current_session.query(User).filter_by(username=username).first().username

    if owner_id is not None:

        querysavedplaces = current_session.query(SavedPlaces).filter_by(user_id=owner_id).all()

        if querysavedplaces is not None:
            # parsing previous locations to confirm if it is unique the new entry
            for location in querysavedplaces:

                distance_location, same_location = gf.verify_distance(float(locationlat), float(locationlong),
                                                                      float(location.location_lat),
                                                                      float(location.location_long), RADIUS_CIRCLE)
                # if the user is inserting a place already saved, previous location will be kept,
                # and modified_stamp will be changed
                if same_location is True:
                    location.modified_timestamp = modified_timestamp
                    # then commit that change
                    try:
                        # current_session.add(querysavedplaces)  # add opened statement to opened session
                        current_session.commit()  # commit changes
                    except Exception as e:
                        current_session.rollback()
                        current_session.flush()  # for resetting non-commited .add()
                        print(e)
                    finally:
                        current_session.close()
                    return "OK modified timestamp update"  # exit function

        savedplaces = SavedPlaces(created_timestamp=created_timestamp, modified_timestamp=modified_timestamp,
                                  location_lat=locationlat, location_long=locationlong,
                                  address=address, waiting_time=waiting_time, user_id=owner_id)
        try:
            current_session.add(savedplaces)  # add opened statement to opened session
            current_session.commit()  # commit changes
        except:
            current_session.rollback()
            current_session.flush()  # for resetting non-commited .add()
        finally:
            current_session.close()

    return "new_favorite_location_inserted"

# route to remove favorite place
@app.route('/remove_favorite_place/', methods=['POST'])
def remove_favorite_place():
    """ Remove user's favorite spot to db """

    user_id = request.form.get("user_id")
    locationlat = request.form.get["location_lat"]
    locationlong = request.form.get["location_long"]

    current_session = db.session  # open database session
    #TODO finish query to see the lat and long and remove place from database

    return "Done"


# ----------------------------------------------------------------------
# route to update the waiting time
@app.route('/update_waiting_time/', methods=['POST'])
def update_waiting_time():
    if not request.json or not 'location_lat' in request.json or not 'location_long' in request.json or not 'username' in request.json:
        abort(404)

    # parsing request data
    # -------------------------

    content = request.get_json(force=True)
    created_timestamp = datetime.datetime.now()
    modified_timestamp = datetime.datetime.now()  # get a new data to update
    username = content["username"]
    locationlat = content["location_lat"]
    locationlong = content["location_long"]
    waiting_time = content["waiting_time"]
    address = content["address"]
    # ---------------------------

    current_session = db.session  # open database session

    # query table USer to get username and then query by user
    owner_id = current_session.query(User).filter_by(username=username).first().username

    if owner_id is not None:

        # get all saved places by all users
        querysavedplaces = current_session.query(SavedPlaces).filter_by().all()

        if querysavedplaces is not None:

            # parsing query
            for location in querysavedplaces:
                # verify if the distance of the newlocation is already in the database, or if there is a close location
                # verifying that calculating distance of 2 points, it will be considered as same place if the distance btw 2 points is smaller than 10 m
                distance_location, same_location = gf.verify_distance(float(locationlat), float(locationlong),
                                                                      float(location.location_lat),
                                                                      float(location.location_long), RADIUS_CIRCLE)
                if same_location is True:
                    location.modified_timestamp = modified_timestamp
                    location.waiting_time = waiting_time
                    try:
                        current_session.commit()  # commit changes
                    except:
                        current_session.rollback()
                        current_session.flush()  # for resetting non-commited .add()

    current_session.close()

    return "update_waiting_time_done"


'''

# Delete saved place
@app.route('/delete_saved_place/', method = ['POST'])
def delete_saved_place():
    if not request.json or not 'location_lat' in request.json or not 'location_long' in request.json or not 'username' in request.json:
        abort(404)

    return "ok"



'''
# ----------------------


# catch page error
# ----------------------
@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Not found'}), 404)
# -----------------------------

#lat = request.args.get('lat')
#long = request.args.get('long')

if __name__ == '__main__':


    connect_to_db(app)

    app.debug = True
    #pdb.set_trace()
    # Use the DebugToolbar
    #DebugToolbarExtension(app)

    app.run()

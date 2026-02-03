from flask import Flask, jsonify, render_template, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import Integer, String, Boolean, select
import random
import os
from dotenv import load_dotenv
load_dotenv()


app = Flask(__name__)

API_KEY = os.environ.get("API_KEY")


# CREATE DB
class Base(DeclarativeBase):
    pass
# Connect to Database
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{os.path.join(BASE_DIR, 'cafes.db')}"
db = SQLAlchemy(model_class=Base)
db.init_app(app)


# Cafe TABLE Configuration
class Cafe(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(250), unique=True, nullable=False)
    map_url: Mapped[str] = mapped_column(String(500), nullable=False)
    img_url: Mapped[str] = mapped_column(String(500), nullable=False)
    location: Mapped[str] = mapped_column(String(250), nullable=False)
    seats: Mapped[str] = mapped_column(String(250), nullable=False)
    has_toilet: Mapped[bool] = mapped_column(Boolean, nullable=False)
    has_wifi: Mapped[bool] = mapped_column(Boolean, nullable=False)
    has_sockets: Mapped[bool] = mapped_column(Boolean, nullable=False)
    can_take_calls: Mapped[bool] = mapped_column(Boolean, nullable=False)
    coffee_price: Mapped[str] = mapped_column(String(250), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "img_url": self.img_url,
            "map_url": self.map_url,
            "location": self.location,
            "can_take_calls": self.can_take_calls,
            "coffee_price": self.coffee_price,
            "has_sockets": self.has_sockets,
            "has_toilet": self.has_toilet,
            "has_wifi": self.has_wifi,
            "seats": self.seats
        }
    
    def make_dict(self):
        dictionary = {}
        for column in self.__table__.columns:
            dictionary[column.name] = getattr(self, column.name)
        return dictionary



with app.app_context():
    db.create_all()


@app.route("/")
def home():
    return render_template("index.html")


# HTTP GET - Read Record
@app.route("/random", methods=["GET"])
def get_random_cafe():
    all_cafes = db.session.execute(db.select(Cafe)).scalars().all()
    random_cafe = random.choice(all_cafes)
    return jsonify(cafe= random_cafe.to_dict())
    # return jsonify(cafe={
    #     "id": random_cafe.id,
    #     "name": random_cafe.name,
    #     "map_url": random_cafe.map_url,
    #     "img_url": random_cafe.img_url,
    #     "location": random_cafe.location,
    #     "seats": random_cafe.seats,
    #     "has_toilet": random_cafe.has_toilet,
    #     "has_wifi": random_cafe.has_wifi,
    #     "has_sockets": random_cafe.has_sockets,
    #     "can_take_calls": random_cafe.can_take_calls,
    #     "coffee_price": random_cafe.coffee_price
    # })
    
@app.route("/all")
def get_all_cafes():
    all_cafes = db.session.execute(db.select(Cafe)).scalars().all()
    return jsonify(cafes = [cafe.to_dict() for cafe in all_cafes])


@app.route("/search")
def search_cafe():
    location = request.args.get("loc")
    all_cafes = db.session.execute(db.select(Cafe).where(Cafe.location == location)).scalars().all()
    if all_cafes:
        return jsonify(cafes = [cafe.to_dict() for cafe in all_cafes])
    else:
        return jsonify(error={"Not found": "Sorry we dont have a cafe at that location"})



# HTTP POST - Create Record
@app.route("/add", methods=["POST"])
def add_cafe():
    new_cafe = Cafe(
        name=request.form.get("name"),
        map_url=request.form.get("map_url"),
        img_url=request.form.get("img_url"),
        location=request.form.get("location"),
        seats=request.form.get("seats"),
        has_toilet=bool(request.form.get("toilet")),
        has_wifi=bool(request.form.get("wifi")),
        has_sockets=bool(request.form.get("sockets")),
        can_take_calls=bool(request.form.get("calls")),
        coffee_price=request.form.get("coffee_price")
    )
    db.session.add(new_cafe)
    db.session.commit()
    return jsonify(response = {"Succes": "Succesfully added the new cafe"})

# HTTP PUT/PATCH - Update Record
@app.route("/update-price/<int:cafe_id>", methods=["PATCH"])
def update_price(cafe_id):
    new_price = request.args.get("new_price")
    cafe = db.session.execute(db.select(Cafe).where(Cafe.id == cafe_id)).scalar()
    if cafe:
        cafe.coffee_price = new_price
        db.session.commit()
        return jsonify({"Succes": "Succesfully updated the price."})
    else:
        return jsonify(error = {"Not found": "Sorry a cafe with that id was not found in the database"})

# HTTP DELETE - Delete Record
@app.route("/report-closed/<int:cafe_id>", methods=["DELETE"])
def delete(cafe_id):
    api_key = request.args.get("api-key")
    try:
        cafe = db.session.execute(db.select(Cafe).where(Cafe.id == cafe_id)).scalar()
    except AttributeError:
        return jsonify(error = {"Not found": "Sorry a cafe with that id was not found in the database"})

    if api_key == API_KEY:
        db.session.delete(cafe)
        db.session.commit()
        return jsonify({"Succes": "Succesfully deleted the cafe"})
    else:
        return jsonify({"Error": "Sorry,that's not allowed. Make sure you have the correct api_key"})




if __name__ == '__main__':
    app.run(debug=True)

from flask import Flask, render_template, redirect, url_for, request
from flask_bootstrap import Bootstrap5
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import Integer, String, Float
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
from wtforms.validators import DataRequired
import requests
from dotenv import load_dotenv
import os
load_dotenv()

API_KEY = os.environ.get("API_KEY")
SECRET_KEY = os.environ.get("SECRET_KEY")

app = Flask(__name__)
app.config["SECRET_KEY"] = SECRET_KEY
Bootstrap5(app)

class Base(DeclarativeBase):
    pass

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{os.path.join(BASE_DIR, 'top-movies.db')}"
db = SQLAlchemy(model_class=Base)
db.init_app(app)

class Movie(db.Model):
    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    title:Mapped[str] = mapped_column(String(250), unique=True)
    year:Mapped[int] = mapped_column(Integer, nullable=False)
    description:Mapped[str] = mapped_column(String(750), nullable=False)
    rating:Mapped[float] = mapped_column(Float, nullable=True)
    ranking:Mapped[int] = mapped_column(Integer,  nullable=True)
    review:Mapped[str] = mapped_column(String(250), nullable=True)
    img_url:Mapped[str] = mapped_column(String(250), nullable=False)

class RateMovieForm(FlaskForm):
    rating = StringField("Your rating out of 10 e.g. 7.4")
    review = StringField("Your review")
    submit = SubmitField("Submit")

class FindMovie(FlaskForm):
    title = StringField("Movie title", validators=[DataRequired()])
    submit = SubmitField("Add Movie")
with app.app_context():
    db.create_all()

# After adding the new_movie the code needs to be commented out/deleted.
# new_movie = Movie(
#     title="Phone Booth",
#     year=2002,
#     description="Publicist Stuart Shepard finds himself trapped in a phone booth, pinned down by an extortionist's sniper rifle. Unable to leave or receive outside help, Stuart's negotiation with the caller leads to a jaw-dropping climax.",
#     rating=7.3,
#     ranking=10,
#     review="My favourite character was the caller.",
#     img_url="https://image.tmdb.org/t/p/w500/tjrX2oWRCM3Tvarz38zlZM7Uc10.jpg"
# )



@app.route("/")
def home():
    all_movies = db.session.execute(db.select(Movie).order_by(Movie.rating.desc().nulls_last())).scalars().all()
    rank = 1
    for movie in all_movies:
        movie.ranking = rank
        rank += 1
    db.session.commit()
    return render_template("index.html", movies=all_movies)


@app.route("/edit/<int:movie_id>", methods=["GET", "POST"])
def edit(movie_id):
    form = RateMovieForm()
    movie = db.session.get(Movie, movie_id)
    if form.validate_on_submit():
        movie.rating = float(request.form.get("rating"))
        movie.review = request.form.get("review")
        db.session.commit()
        return redirect(url_for("home"))
    return render_template("edit.html", movie=movie, form=form)

@app.route("/delete/<int:movie_id>", methods=["GET", "POST"])
def delete(movie_id):
    movie = db.session.get(Movie, movie_id)
    db.session.delete(movie)
    db.session.commit()
    return redirect(url_for("home"))

@app.route("/add", methods=["GET", "POST"])
def add():
    form = FindMovie()
    if form.validate_on_submit():
        movie_title = form.title.data
        response = requests.get(url="https://api.themoviedb.org/3/search/movie", params={"api_key": API_KEY, "query": movie_title})
        data = response.json()["results"]
        return render_template("select.html", options=data)
    return render_template("add.html", form=form)

@app.route("/find/<int:movie_id>")
def find(movie_id):
    response = requests.get(url=f"https://api.themoviedb.org/3/movie/{movie_id}", params={"api_key": API_KEY})
    movie_data = response.json()
    new_movie = Movie(
        title=movie_data["title"],
        year = int(movie_data["release_date"][:4]),
        description=movie_data["overview"],
        img_url=f"https://image.tmdb.org/t/p/w500{movie_data['poster_path']}"
    )
    db.session.add(new_movie)
    db.session.commit()
    return redirect(url_for("edit", movie_id=new_movie.id))

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)

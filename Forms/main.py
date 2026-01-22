from flask import Flask, render_template
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Email, Length
from flask_bootstrap import Bootstrap5


class MyForm(FlaskForm):
    email=StringField(label="email", validators=[DataRequired(), Email(message="Please enter a valid email address")]) 
    password=PasswordField(label="password",  validators=[DataRequired(), Length(min = 8, message="Password needs to be at least be 8 characters long")])
    submit=SubmitField(label="Log In")

app = Flask(__name__)
app.secret_key = ""

bootstrap = Bootstrap5(app)

@app.route("/")
def home():
    return render_template('index.html')

@app.route("/login", methods=["GET", "POST"])
def login():
    login_form = MyForm()
    if login_form.validate_on_submit():
        entered_email = login_form.email.data
        entered_password = login_form.password.data

        stored_email = "admin@email.com"
        stored_password = "12345678"
        if entered_email == stored_email and entered_password == stored_password:
            return render_template("success.html")
        else:
            return render_template("denied.html")
    return render_template("login.html", form=login_form)


if __name__ == '__main__':
    app.run(debug=True)

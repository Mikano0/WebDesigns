const randomNumber1 = Math.floor(Math.random() * 6) + 1;
const randomNumber2 = Math.floor(Math.random() * 6) + 1;
console.log(randomNumber1)

const firstImage = document.querySelectorAll("img")[0];
firstImage.src = `./images/dice${randomNumber1}.png`;

const secondImage = document.querySelectorAll("img")[1];
secondImage.src = `./images/dice${randomNumber2}.png`;

let heading = document.querySelector("h1");


if (randomNumber1 > randomNumber2){
    heading.innerHTML = "Player 1 wins"
} else if (randomNumber1 === randomNumber2){
    heading.innerHTML = "Draw!"
} else{
    heading.innerHTML = "Player 2 wins"
}

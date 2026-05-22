buttonColors = ["red", "blue", "green", "yellow"];
gamePattern =[];
userClickPattern = [];
gameOn = false;
level = 0

function nextSequence(){
    level += 1;
    const randomNumber = Math.floor(Math.random() * 4);
    const randomChosenColor = buttonColors[randomNumber];
    gamePattern.push(randomChosenColor);

    let nextButton = $("#" + randomChosenColor)
    nextButton.fadeOut(100).fadeIn(100)

    jQuery("h1").text("Level " + level)
    playSound(randomChosenColor)
};

function playSound(name){
    let audio = new Audio("./sounds/" + name + ".mp3");
    audio.play();
}

function animatePress(pressedColor){
    jQuery("#" + pressedColor).addClass("pressed")
    setTimeout(() => {
        jQuery("#" + pressedColor).removeClass("pressed")
    }, 100);
}

function checkAnswer(){
    const lastIndex = userClickPattern.length -1

    if (userClickPattern[lastIndex] === gamePattern[lastIndex]){
        if (userClickPattern.length === gamePattern.length)
            setTimeout(() => {
                nextSequence()
                userClickPattern = [];
            }, 1000);

    }else{
        gameOn = false;
        userClickPattern = [];
        gamePattern = [];

        let failAudio = new Audio("./sounds/wrong.mp3");
        failAudio.play();

        jQuery("body").addClass("game-over");
        setTimeout(() => {
            jQuery("h1").text("Game Over, Press Any Key to Restart")
            jQuery("body").removeClass("game-over")
        }, 200);
    }
}

function startOver(){
    level = 0;
    gamePattern = [];
    userClickPattern = [];
    gameOn = false; 
}


jQuery(".btn").click(function(){
    const clickedButton = jQuery(this);
    let userChosenColor = clickedButton.attr("id");
    userClickPattern.push(userChosenColor);
    animatePress(userChosenColor);
    playSound(userChosenColor);

    checkAnswer();
    console.log(userClickPattern);
});

jQuery("body").keypress(function(){
    if(gameOn === false){
        startOver()
        nextSequence();
        gameOn = true;
    } 
})

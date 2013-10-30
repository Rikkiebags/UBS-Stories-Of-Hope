//Shared functions between mobile & desktop

function trackEvent(event) {
    if (typeof s != 'undefined')
    {
        var base = "/stories/"
        if (typeof event != 'undefined') base = base + event; 
        s.tl(this, 'o', base);
    }
}

function getRandom(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

function shuffle(arr) {
    var shuffled = arr.slice(0), i = arr.length, temp, index;
    while (i--) {
        index = Math.floor(i * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled;
}

function randomiseArray(num) {
    // Create the array
    var i = num, arr = [];
    while (i--) arr[i] = i;
    
    // Shuffle it
    arr = shuffle(arr);
    
    return arr;
}   
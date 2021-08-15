

exports.getNiceTime = (durationSeconds) => {
    return new Date(durationSeconds * 1000).toISOString().substr(11, 8);
}


exports.getSecondsFromTimeString = (timeString) => {
    let parts = timeString.split(':');
    if (timeString.split(':').length === 2) {
        timeString = `00:${parts[0]}:${parts[1]}`;
    }
    
    var a = timeString.split(':'); // split it at the colons

    
    // minutes are worth 60 seconds. Hours are worth 60 minutes.
    var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 

    console.log(seconds);
    return seconds;
}
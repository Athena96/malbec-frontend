

exports.getNiceTime = (durationSeconds) => {
    function str_pad_left(string,pad,length) {
        return (new Array(length+1).join(pad)+string).slice(-length);
    }
    var minutes = Math.floor(durationSeconds / 60);
    var seconds = durationSeconds - minutes * 60;
    var hours = seconds >= 60*60 ? Math.floor(durationSeconds / 3600) : null;

    var finalTime = hours ? str_pad_left(hours,'0',2) + ":" + str_pad_left(minutes,'0',2)+':'+str_pad_left(seconds,'0',2) : str_pad_left(minutes,'0',2)+':'+str_pad_left(seconds,'0',2);
    return finalTime;
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
export const baseUrl = 'http://localhost:5000/';
export const timeFormat = (seconds) => {
    var hours = Math.floor(seconds/3600);
    var newSeconds = seconds - (hours * 3600)
    var min = Math.floor(newSeconds/60);
    return `${hours}h ${min}min`
};

export const convertToLocal = (epoch, detailed) => {
    var d = new Date(0);
    d.setUTCSeconds(epoch);

    if (!detailed) return d.toLocaleDateString();
    return d.toLocaleDateString() + " at " + d.toLocaleTimeString();
};

export const filterString = (string, filterArray, replaceWith)  => {
    for (var i = 0; i < filterArray.length; i++) {
        string = string.replace(filterArray[i], replaceWith);
    }
    return string;
}; 

export const getWeek = () => {
    const currentDate = new Date();
    const firstDay = new Date(currentDate.getFullYear(), 0, 1);
    const week = Math.ceil((((currentDate.getTime() - firstDay.getTime()) / 86400000) + firstDay.getDay() + 1) / 7);

    return week;
}
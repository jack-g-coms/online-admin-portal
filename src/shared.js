import moment from "moment";

export const baseUrl = 'https://portal.romestaff.com/api';
export const timeFormat = (seconds) => {
    var hours = Math.floor(seconds/3600);
    var newSeconds = seconds - (hours * 3600)
    var min = Math.floor(newSeconds/60);
    return `${hours}h ${min}min`
};

export const convertToLocal = (epoch, detailed, separate) => {
    var d = new Date(0);
    d.setUTCSeconds(epoch);

    if (!detailed) return d.toLocaleDateString();
    if (separate) {
        return [d.toLocaleDateString(), d.toLocaleTimeString()];
    } else {
        return d.toLocaleDateString() + " at " + d.toLocaleTimeString();
    }
};

export const filterString = (string, filterArray, replaceWith)  => {
    for (var i = 0; i < filterArray.length; i++) {
        string = string.replace(filterArray[i], replaceWith);
    }
    return string;
}; 

export const getWeek = () => {
    return moment().isoWeek();
};

export const getMonth = () => {
    return moment().month() + 1;
};
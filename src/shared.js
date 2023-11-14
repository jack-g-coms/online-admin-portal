export const baseUrl = 'http://localhost:5000/';
export const timeFormat = (seconds) => {
    var hours = Math.floor(seconds/3600);
    var newSeconds = seconds - (hours * 3600)
    var min = Math.floor(newSeconds/60);
    return `${hours}h ${min}min`
};

export const convertToLocal = (epoch) => {
    var d = new Date(0);
    d.setUTCSeconds(epoch);
    return d.toLocaleDateString();
};
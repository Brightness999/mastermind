export const url = "http://kyniema4.hopto.org:3090/"

export const socketUrl = url+'api'
export const socketUrlJSFile = url + "socket.io/socket.io.js"

export const switchPathWithRole = (role) =>{
    if(role == 30) return 'provider/';
    if(role == 3) return 'clients/';
    if(role == 60) return 'schools/';
    return '';
}

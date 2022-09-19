export const url = "http://localhost:3090/"

export const socketUrl = url+'api'
export const socketUrlJSFile = url + "socket.io/socket.io.js"

export const switchPathWithRole = (role) =>{
    if(role == 30) return 'provider/';
    if(role == 3) return 'clients/';
    if(role == 60) return 'schools/';
    if(role >900) return 'administratorapicontrol/'
    return '';
}

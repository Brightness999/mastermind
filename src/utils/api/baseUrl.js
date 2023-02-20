export const url = "https://hmghbackend.onrender.com/"
// export const url = "http://localhost:3090/"

export const socketUrl = url + 'api'
export const socketUrlJSFile = url + "socket.io/socket.io.js"

export const switchPathWithRole = (role) => {
    if (role == 30) return 'providers/';
    if (role == 3) return 'clients/';
    if (role == 60) return 'schools/';
    if (role == 100) return 'consultants/';
    if (role == 999) return 'admin/'
    if (role == 1000) return 'admin/'
    return '';
}

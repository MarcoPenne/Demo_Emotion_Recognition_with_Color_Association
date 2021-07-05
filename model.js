//import * as tf from './tfjs.js';

let model;
async function init(){

    model = await tf.loadGraphModel('graph_ResNet_finetuned/model.json');

    document.getElementById("loading").hidden = true;
    // JavaScript

    var video = document.getElementById("video");
    try{
        const s = await navigator.mediaDevices.getUserMedia({video: {width:600, height:600}})
        console.log(s)
        handleVideo(s);
    }
    catch(e){
        console.log(e.toString())
    }
    function handleVideo(stream){
        //window.URL.createObjectURL()
        window.stream = stream;
        video.srcObject = stream;
    }
    function videoError(e){

    }

    const canvas = document.getElementById("canvas");

    // scale the canvas accordingly
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    // draw the video at that frame
    canvas.getContext('2d')
    .drawImage(video, 0, 0, canvas.width, canvas.height);
    // convert it to a usable data URL
    const dataURL = canvas.toDataURL();

}

init()

setInterval(function(){
    var video = document.getElementById("video")


    const canvas = document.getElementById("canvas");

    //canvas.width = window.innerWidth;
    //canvas.height = window.innerHeight;

    const ctx = canvas.getContext("2d");

    // scale the canvas accordingly
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // draw the video at that frame
    canvas.getContext('2d')
    .drawImage(video, 0, 0, canvas.width, canvas.height);
    // convert it to a usable data URL
    const dataURL = canvas.toDataURL();


    var img = new Image;
    img.src = dataURL;
    img.onload = () => {
        ctx.drawImage(img, 0, 0);

        tf.engine().startScope()

        var t = tf.browser.fromPixels(img, 1)
        var t = t.resizeBilinear([48,48])
        
        t= t.tile([1, 1, 3])
        t = t.expandDims()
        
        const b = tf.scalar(255);
        t = t.div(b);
        
        let pred = model.predict(t)
        
        let index = pred.argMax(1)
        const tensorData = index.dataSync();
        pred.print(true)
        console.log(pred[0])
        let classnames = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']
        let answer = classnames[tensorData[0]]
        let div = document.getElementById("answer");
        div.textContent = answer;

        const tensorData2 = pred.dataSync()
        
        tf.engine().endScope()
        
        let backcolor = setColor(tensorData2)
        console.log(backcolor)
        div.style.color = backcolor;
        document.body.style.backgroundColor = backcolor;

    }
    
}, 500)

function setColor(logits) {
    let colors = [[231, 30, 36], //angry
    [97, 45, 145], //disgust
    [246, 145, 31], //fear
    [74, 184, 71], //happy
    [255, 255, 255], //neutral
    [26, 97, 175], //sad
    [251, 233, 37]] //surprise

    let R = 0
    for(let i=0; i<7; i++){
        R += logits[i]*colors[i][0]; 
    }

    let G = 0
    for(let i=0; i<7; i++){
        G += logits[i]*colors[i][1]; 
    }

    let B = 0
    for(let i=0; i<7; i++){
        B += logits[i]*colors[i][2]; 
    }

    return "#" + componentToHex(Math.round(R)) + componentToHex(Math.round(G)) + componentToHex(Math.round(B));
    
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }


var imgView = document.getElementById("imgView");

var canvas1 = document.createElement("canvas");
canvas1.setAttribute("id","canvas1");
var ctx1 = canvas1.getContext('2d');
imgView.appendChild(canvas1);


var canvas2 = document.createElement("canvas");
canvas2.setAttribute("id","canvas2");
canvas2.setAttribute("style","left:50px; top:50px; position: absolute;");
var ctx2 = canvas2.getContext('2d');
imgView.appendChild(canvas2);


var allbirdsImg = new Image();
allbirdsImg.src = "../images/bird/allbirds.png";



allbirdsImg.onload = function(){
  canvas1.width = allbirdsImg.width;
  canvas1.height = allbirdsImg.height;
  ctx1.drawImage(allbirdsImg,0,0);
};


canvas1.click(function(e){
  console.log(111);
});


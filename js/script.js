var svgwidth = window.innerWidth;
var svgheight = window.innerHeight-document.getElementById("footer").offsetHeight-document.getElementById("generalsettings").offsetHeight-10;
var kbwidth = document.getElementById("kbwidth").value=Math.floor(svgwidth*0.97);
var kbheight = document.getElementById("kbheight").value=Math.floor(svgheight*0.7);
var kbratio = kbwidth/kbheight;
var svgratio = svgwidth/svgheight;
var	kbXpos = (svgwidth-kbwidth)/2;
var	kbYpos = svgheight-kbheight;

document.getElementById("kbwidth").max = "3840";
document.getElementById("kbwidth").min = "400";
document.getElementById("kbheight").max = "2160";
document.getElementById("kbheight").min = "200";

var svg = d3.select("#appbody")
	.append("svg")
	.attr("preserveAspectRatio", "xMinYMin meet")
	.attr("id","svgID")
	.attr("viewBox", "0 0 "+svgwidth+" "+svgheight);

var keyboardFrame = svg.append("rect")
	.attr("id","keyboardFrame")
	.attr("fill","#e6e6e6")
	.attr("stroke","black")
	.attr("stroke-width","0.5px")
	.attr("x",kbXpos)
	.attr("y",kbYpos)
	.attr("width",kbwidth)
	.attr("height",kbheight);

var keyboard = svg.append("g").attr("transform", "translate("+kbXpos+", "+kbYpos+")");

function updateKeyboardFrame(){
	keyboardFrame
		.attr("x",kbXpos)
		.attr("y",kbYpos)
		.attr("width",kbwidth)
		.attr("height",kbheight);
}

function updateKeyboardPosition(){
	kbXpos = (svgwidth-kbwidth)/2;
	kbYpos = svgheight-kbheight;	
	keyboard
		.attr("transform", "translate("+kbXpos+", "+kbYpos+")");
}

function setKeyboardFrame() {
	kbwidth=parseInt($('#kbwidth').val());
	kbheight=parseInt($('#kbheight').val());	
	var maxW = parseInt($('#kbwidth').attr('max'));
	var minW = parseInt($('#kbwidth').attr('min'));
	var maxH = parseInt($('#kbheight').attr('max'));
	var minH = parseInt($('#kbheight').attr('min'));
	if(kbwidth<minW) {$('#kbwidth').val(minW); kbwidth=minW;}
	if(kbwidth>maxW) {$('#kbwidth').val(maxW); kbwidth=maxW;}
	if(kbheight<minH) {$('#kbheight').val(minH); kbheight=minH;}
	if(kbheight>maxH) {$('#kbheight').val(maxH); kbheight=maxH;}	
	
	if((kbwidth+kbwidth*0.03)/(kbheight+kbheight*0.3)>svgratio){
		svgwidth=kbwidth+kbwidth*0.03;
		svgheight=svgwidth/svgratio;
		svg.attr("viewBox", "0 0 "+svgwidth+" "+svgheight);
	}else{
		svgheight=kbheight+kbheight*0.3;
		svgwidth=svgheight*svgratio;
		svg.attr("viewBox", "0 0 "+svgwidth+" "+svgheight);
	}
	kbXpos = (svgwidth-kbwidth)/2;
	kbYpos = svgheight-kbheight;
	
	updateKeyboardPosition();
	updateKeyboardFrame();	
}

window.onresize = function(){
	svgwidth = window.innerWidth;
    svgheight = window.innerHeight-document.getElementById("footer").offsetHeight-document.getElementById("generalsettings").offsetHeight-10;
	svgratio = svgwidth/svgheight;
	setKeyboardFrame();
};
$('#kbsize').click(setKeyboardFrame);	
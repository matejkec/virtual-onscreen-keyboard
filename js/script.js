//Postavlja minimalnu i maksimalnu veličinu tipkovnice
document.getElementById("kbwidth").max = "3840";
document.getElementById("kbwidth").min = "400";
document.getElementById("kbheight").max = "2160";
document.getElementById("kbheight").min = "200";

//Inicijalizacija osnovnih varijabli
var svgwidth = window.innerWidth;
var svgheight = window.innerHeight-document.getElementById("footer").offsetHeight-document.getElementById("generalsettings").offsetHeight-10;
var keyboardJSON = {
	"kbwidth": document.getElementById("kbwidth").value=Math.floor(svgwidth*0.97),
	"kbheight": document.getElementById("kbheight").value=Math.floor(svgheight*0.7),
	"keyboard": []
};
var defKeys =[];
var init = {};
var svgratio = svgwidth/svgheight;
var	kbXpos = (svgwidth-keyboardJSON.kbwidth)/2;
var	kbYpos = svgheight-keyboardJSON.kbheight;
var last = null;
var font;
var lastSelection = null;

//Kreira osnovni SVG u kojem će se iscrtavati sav program
var svg = d3.select("#appbody")
	.append("svg")
	.attr("preserveAspectRatio", "xMinYMin meet")
	.attr("id","svgID")
	.attr("viewBox", "0 0 "+svgwidth+" "+svgheight);

//Prilikom povlačenja okvira tipkovnice ili bilo koje tipke mišom pozivaju se odgovarajuće funkcije
var dragFrame = d3.drag()
	.on("drag", frameDragged);
var drag_behavior = d3.drag()
	.on("start", dragstarted)
	.on("drag", dragged)
	.on("end", dragended);

//Deklaracija varijable za iscrtavanje okvira tipkovnice
var keyboardFrame = svg.selectAll("rect")
	.data([{"x":kbXpos,"y":kbYpos}])
	.enter()
	.append("rect")
	.attr("id","keyboardFrame")
	.attr("fill","#e6e6e6")
	.attr("stroke","black")
	.attr("stroke-width","0.5px")
	.attr("rx",5)
	.attr("ry",5)
	.attr("x",function(d){return (d.x);})
	.attr("y",function(d){return (d.y);})
	.attr("width",keyboardJSON.kbwidth)
	.attr("height",keyboardJSON.kbheight)
	.call(dragFrame);

//Grupiranje i odvajanje "default"-nih tipki i tipki tipkovnice
var keyboard = svg.append("g").attr("id", "keySpace").attr("transform", "translate("+kbXpos+", "+kbYpos+")");
var defSpace = svg.append("g").attr("id", "defSpace");

var text = keyboard.selectAll("text")
	.data(keyboardJSON.keyboard).enter().append("text");

//Funkcija koja povećava dimenzije svg-a i time daje dojam "odzumiranja" program
function zoomOut(){
	svgwidth=svgwidth*1.1;
	svgheight=svgwidth/svgratio;
	svg.attr("viewBox", "0 0 "+svgwidth+" "+svgheight);
	kbXpos = (svgwidth-keyboardJSON.kbwidth)/2;
	kbYpos = svgheight-keyboardJSON.kbheight; 	
	updateKeyboardFrame();
}

//Sakriva postavke za promjenu dimenzija tipkovnica te prikazuje "button" za kreiranje novih tipaka
function start(){
	$('#saveKeyboard').show();
	$('#addkey').show();
	$('#gSettings').hide();
	$('#keyOption').show();
}

//Ažurira veličinu i poziciju okvira tipkovnice
function updateKeyboardFrame(){
	keyboardFrame
		.data([{"x":kbXpos,"y":kbYpos}])
		.attr("x",kbXpos)
		.attr("y",kbYpos)
		.attr("width",keyboardJSON.kbwidth)
		.attr("height",keyboardJSON.kbheight);
	keyboard
		.attr("transform", "translate("+kbXpos+", "+kbYpos+")");
}

//Izračunava poziciju za iscrtavanje okvira tipkovnice te postavlja njenu veličinu
function setKeyboardFrame() {
	keyboardJSON.kbwidth=parseInt($('#kbwidth').val());
	keyboardJSON.kbheight=parseInt($('#kbheight').val());	
	var maxW = parseInt($('#kbwidth').attr('max'));
	var minW = parseInt($('#kbwidth').attr('min'));
	var maxH = parseInt($('#kbheight').attr('max'));
	var minH = parseInt($('#kbheight').attr('min'));
	if(keyboardJSON.kbwidth<minW) {$('#kbwidth').val(minW); keyboardJSON.kbwidth=minW;}
	if(keyboardJSON.kbwidth>maxW) {$('#kbwidth').val(maxW); keyboardJSON.kbwidth=maxW;}
	if(keyboardJSON.kbheight<minH) {$('#kbheight').val(minH); keyboardJSON.kbheight=minH;}
	if(keyboardJSON.kbheight>maxH) {$('#kbheight').val(maxH); keyboardJSON.kbheight=maxH;}	
	
	if((keyboardJSON.kbwidth+keyboardJSON.kbwidth*0.03)/(keyboardJSON.kbheight+keyboardJSON.kbheight*0.3)>svgratio){
		svgwidth=keyboardJSON.kbwidth+keyboardJSON.kbwidth*0.03;
		svgheight=svgwidth/svgratio;
		svg.attr("viewBox", "0 0 "+svgwidth+" "+svgheight);
	}else{
		svgheight=keyboardJSON.kbheight+keyboardJSON.kbheight*0.4;
		svgwidth=svgheight*svgratio;
		svg.attr("viewBox", "0 0 "+svgwidth+" "+svgheight);
	}
	kbXpos = (svgwidth-keyboardJSON.kbwidth)/2;
	kbYpos = svgheight-keyboardJSON.kbheight; 	
	updateKeyboardFrame();	
}

//Dodaje novu "default" tipku
function addDefKey(){
	defKeys.push({"shape":"rect", "x":parseInt((keyboardJSON.kbheight)/7),"y":parseInt((keyboardJSON.kbheight)/7),"width":parseInt((keyboardJSON.kbheight)/7),"height":parseInt((keyboardJSON.kbheight)/7),"br":5,"rotation":0,"char":""})
	update(defSpace,defKeys);
}

//Iscrtavanje novih i ažuriranje već postojećih tipki
function update(space,keys){
	var rect = space.selectAll("rect")
		.data(keys.filter(function(d){ return d.shape == "rect"; }));
	var circle = space.selectAll("circle")
		.data(keys.filter(function(d){ return d.shape == "circle"; }));
	var pie = space.selectAll("path")
		.data(keys.filter(function(d){ return d.shape == "pie"; }));
	
	//Iscrtanje novih	
	rect.enter()
		.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", function (d) {return (d.width);})
		.attr("height", function (d) {return (d.height);})
		.attr("rx", function (d) {return (d.br);})
		.attr("ry", function (d) {return (d.br);})
		.classed("key",true)
		.classed("def",function(d){if (space==defSpace) return true; else return false;})
		.attr("transform", function(d){return "translate("+(d.x-d.width/2)+" "+(d.y-d.height/2)+") rotate("+(d.rotation*90)+" "+(d.width/2)+" "+(d.height/2)+")"})
		.call(drag_behavior);	
	circle.enter()
		.append("circle")
		.attr("cx", function (d) {return (d.x);})
		.attr("cy", function (d) {return (d.y);})
		.attr("r", function (d) {return (d.r);})
		.attr("class",function(){if (space==defSpace) return "key def"; else return "key";})
		.call(drag_behavior);
	pie.enter()
		.append("path")
		.attr("class",function(){if (space==defSpace) return "key def"; else return "key";})
		.attr("d",function(d){return "M0 0 A"+d.r+" "+d.r+" 0 0 1 "+d.r+" "+d.r+" L0 "+d.r+" 0 0";})
		.attr("transform", function(d){return "translate("+(d.x-d.r/2)+" "+(d.y-d.r/2)+") rotate("+(d.rotation*90)+" "+(d.r/2)+" "+(d.r/2)+")"})
		.call(drag_behavior);
	
	//Ažuriranje postojećih
	rect.attr("width", function (d) {return (d.width);})
		.attr("height", function (d) {return (d.height);})
		.attr("rx", function (d) {return (d.br);})
		.attr("ry", function (d) {return (d.br);})
		.attr("transform", function(d){return "translate("+(d.x-d.width/2)+" "+(d.y-d.height/2)+") rotate("+(d.rotation*90)+" "+(d.width/2)+" "+(d.height/2)+")"});
	circle.attr("cx", function (d) {return (d.x);})
		.attr("cy", function (d) {return (d.y);})
		.attr("r", function (d) {return (d.r);});
	pie.attr("d",function(d){return "M0 0 A"+d.r+" "+d.r+" 0 0 1 "+d.r+" "+d.r+" L0 "+d.r+" 0 0";})
		.attr("transform", function(d){return "translate("+(d.x-d.r/2)+" "+(d.y-d.r/2)+") rotate("+(d.rotation*90)+" "+(d.r/2)+" "+(d.r/2)+")"});
	
	//Ispisuje slova na tipke
	font=fontSize();
	d3.selectAll("text").remove();
	text = keyboard.selectAll("text")
		.data(keyboardJSON.keyboard).enter().append("text");
	text.attr("x", function(d) { return d.x-10; })
		.attr("y", function(d) { return d.y+5; })
		.text( function (d) { return d.char; })
		.attr("class", "fontKey")
		.attr("font-size", font)
		.attr("fill", "white");

	if(space==defSpace){
		rect.classed("def",true);
		circle.classed("def",true);
		pie.classed("def",true);
	}

	//Brisanje uklonjenih tipki 
	rect.exit().remove();
	circle.exit().remove();
	pie.exit().remove();
}

//Računa veličinu fonta (trećina najmanje tipke)
function fontSize(){
	if (keyboardJSON.keyboard.length!=0){
		var min;
		if (keyboardJSON.keyboard[0].shape=="rect")min=keyboardJSON.keyboard[0].width;
		if (keyboardJSON.keyboard[0].shape=="circle")min=keyboardJSON.keyboard[0].r*2;
		if (keyboardJSON.keyboard[0].shape=="pie")min=keyboardJSON.keyboard[0].r;
		for (var i = 0; i < keyboardJSON.keyboard.length; i++) {
			if (keyboardJSON.keyboard[i].shape=="rect"){
				if (keyboardJSON.keyboard[i].width<min)min=keyboardJSON.keyboard[i].width;
				if (keyboardJSON.keyboard[i].height<min)min=keyboardJSON.keyboard[i].height;
			}
			if (keyboardJSON.keyboard[i].shape=="circle"){
				if ((keyboardJSON.keyboard[i].r*2)<min)min=keyboardJSON.keyboard[i].r*2;
			}
			if (keyboardJSON.keyboard[i].shape=="pie"){
				if (keyboardJSON.keyboard[i].r<min)min=keyboardJSON.keyboard[i].r;
			}
		}
		return min/3;
	}else return "20px";
}

//Funkcija za povlačenje tipkovnice po ekranu
function frameDragged(d){
	if(!d3.select('#disableKbMoving').property('checked')){
		d.x = d3.event.x;
		d.y = d3.event.y;
		if(d.x<0)d.x=0;
		if(d.y<0)d.y=0;
		if((d.x+keyboardJSON.kbwidth)>svgwidth)d.x=svgwidth-keyboardJSON.kbwidth;
		if((d.y+keyboardJSON.kbheight)>svgheight)d.y=svgheight-keyboardJSON.kbheight;
		d3.select(this)
			.attr("x", d.x)
			.attr("y", d.y);
		kbXpos=d.x;
		kbYpos=d.y;
		updateKeyboardFrame();
	}
}

function dragstarted(d) {
	d3.select(this).classed("active", true).raise();
	init.x=d.x;
	init.y=d.y;
}

//Funkcija za povlačenje tipke po ekranu
function dragged(d) {
	if (d.shape=="rect"){
		d.x=d3.event.x;
		d.y=d3.event.y;
		text.attr("x", function(data) { return data.x-10; })
			.attr("y", function(data) { return data.y+5; });
		d3.select(this)
			.attr("transform", function(d){return "translate("+(d.x-d.width/2)+" "+(d.y-d.height/2)+") rotate("+(d.rotation*90)+" "+(d.width/2)+" "+(d.height/2)+")"})
	}
	if (d.shape=="circle"){
		text.attr("x", function(data) { return data.x-10; })
			.attr("y", function(data) { return data.y+5; });
		d3.select(this)
			.attr("cx", d.x = d3.event.x)
			.attr("cy", d.y = d3.event.y);
	}
	if (d.shape=="pie"){
		text.attr("x", function(data) { return data.x-10; })
			.attr("y", function(data) { return data.y+5; });
		d.x=d3.event.x;
		d.y=d3.event.y;
		d3.select(this)
			.attr("transform", function(d){return "translate("+(d.x-d.r/2)+" "+(d.y-d.r/2)+") rotate("+(d.rotation*90)+" "+(d.r/2)+" "+(d.r/2)+")"})

	}
}

function dragended(d, i) {
	let tmp_this = d3.select(this); 
	tmp_this.classed("active", false);
	var tmp_width;
	var tmp_height;
	//Ukoliko je pravokutna tipka rotirana za 90 ili 270 visina postaje širina a širina visina
	if (d.shape=="rect"){
		if(d.rotation%2){
			tmp_width=d.height;
			tmp_height=d.width;
		}else{
			tmp_width=d.width;
			tmp_height=d.height;
		}
	}
	//Ukoliko je povućena neka tipka s tipkovnice 
	if (!tmp_this.classed("def")){
		if (d.shape=="rect"){
			if(d.x<tmp_width/2 || d.x>(keyboardJSON.kbwidth-tmp_width/2) || d.y<tmp_height/2 || d.y>(keyboardJSON.kbheight-tmp_height/2)){
				d.x=init.x; d.y=init.y;
			}
		}
		if (d.shape=="circle"){
			if(d.x<d.r || d.x>(keyboardJSON.kbwidth-d.r) || d.y<d.r || d.y>(keyboardJSON.kbheight-d.r)){
				d.x=init.x; d.y=init.y;
			}
		}
		if (d.shape=="pie"){
			if(d.x<d.r/2 || d.x>(keyboardJSON.kbwidth-d.r/2) || d.y<d.r/2 || d.y>(keyboardJSON.kbheight-d.r/2)){
				d.x=init.x; d.y=init.y;
			}
		}
	}
	//Ukoliko je povućena jedna od "default" tipki
	else{
		if (d.shape=="rect"){
			//Ako je tipka ispuštena unutar granica tipkovnice dodaj ju na tipkovnicu
			if(d.x>(kbXpos+(tmp_width/2)) && d.y>(kbYpos+(tmp_height/2)) && d.x<(kbXpos+keyboardJSON.kbwidth-tmp_width/2) && d.y<(kbYpos+keyboardJSON.kbheight-tmp_height/2)){
				keyboardJSON.keyboard.push({"shape":"rect", "x":(d.x-kbXpos),"y":(d.y-kbYpos),"width":d.width,"height":d.height,"br":d.br,"rotation":d.rotation,"char":""});
				d.x=init.x; d.y=init.y;
			}else{
			//Ako je tipka ispuštena na granici tipkovnice vraća ju na prijašnje mjesto
				if(d.x>(kbXpos-tmp_width/2) && d.y>(kbYpos-tmp_height/2) && d.x<(kbXpos+keyboardJSON.kbwidth+tmp_width/2) && d.y<(kbYpos+keyboardJSON.kbheight+tmp_height/2)){
					d.x=init.x; d.y=init.y;
				}
			}
			//Poništi i vrati tipku ukoliko je ispuštena van granica programa
			if((d.x-d.width/2)<0 || (d.x+d.width/2)>svgwidth ||(d.y-d.height/2)<0 ||(d.y+d.height/2)>svgheight){
				d.x=init.x; d.y=init.y;
			}
		}
		if (d.shape=="circle"){
			//Ako je tipka ispuštena unutar granica tipkovnice dodaj ju na tipkovnicu
			if(d.x>(kbXpos+d.r) && d.y>(kbYpos+d.r) && d.x<(kbXpos+keyboardJSON.kbwidth-d.r) && d.y<(kbYpos+keyboardJSON.kbheight-d.r)){
				keyboardJSON.keyboard.push({"shape":"circle", "x":(d.x-kbXpos),"y":(d.y-kbYpos),"r":d.r,"char":""});
				d.x=init.x; d.y=init.y;
			}else{
			//Ako je tipka ispuštena na granici tipkovnice vraća ju na prijašnje mjesto
				if(d.x>(kbXpos-d.r) && d.y>(kbYpos-d.r) && d.x<(kbXpos+keyboardJSON.kbwidth+d.r) && d.y<(kbYpos+keyboardJSON.kbheight+d.r)){
					d.x=init.x; d.y=init.y;
				}
			}
			//Poništi i vrati tipku ukoliko je ispuštena van granica programa
			if((d.x-d.r)<0 || (d.x+d.r)>svgwidth ||(d.y-d.r)<0 ||(d.y+d.r)>svgheight){
				d.x=init.x; d.y=init.y;
			}
		}
		if (d.shape=="pie"){
			if(d.x>(kbXpos+d.r/2) && d.y>(kbYpos+d.r/2) && d.x<(kbXpos+keyboardJSON.kbwidth-d.r/2) && d.y<(kbYpos+keyboardJSON.kbheight-d.r/2)){
				keyboardJSON.keyboard.push({"shape":"pie", "x":(d.x-kbXpos),"y":(d.y-kbYpos),"r":d.r,"rotation":d.rotation,"char":""});
				d.x=init.x; d.y=init.y;
			}else{
				//Ako je tipka ispuštena na granici tipkovnice vraća ju na prijašnje mjesto
				if(d.x>(kbXpos-d.r/2) && d.y>(kbYpos-d.r/2) && d.x<(kbXpos+keyboardJSON.kbwidth+d.r/2) && d.y<(kbYpos+keyboardJSON.kbheight+d.r/2)){
					d.x=init.x; d.y=init.y;
				}
			}
			//Poništi i vrati tipku ukoliko je ispuštena van granica programa
			if((d.x-d.r/2)<0 || (d.x+d.r/2)>svgwidth ||(d.y-d.r/2)<0 ||(d.y+d.r/2)>svgheight){
				d.x=init.x; d.y=init.y;
			}
		}
	}
	lastSelection = d3.select(this);
	last = d;
	editOption();
	update(defSpace,defKeys);
	update(keyboard,keyboardJSON.keyboard);
}

//Prikazuje odgovarajuće opcije za posljednje kliknutu tipku
function editOption(){
	if (lastSelection.classed('def')){
		if ($("#charDiv").is(":visible")){$('#charDiv').hide();}
		if ($("#setChar").is(":visible")){$('#setChar').hide();}
	}else{
		if ($("#charDiv").is(":hidden")){$('#charDiv').show();}
		if ($("#setChar").is(":hidden")){$('#setChar').show();}
	}
	if ($("#keyOption").is(":hidden")){$('#keyOption').show();}
	if ($("#editKey").is(":hidden")){$('#editKey').show();}
	if ($("#rotate").is(":hidden")){$('#rotate').show();}
	if ($("#delete").is(":hidden")){$('#delete').show();}
	if(last!=null){
		document.getElementById("kchar").value=last.char;
	}
}

//Postavlja slovo/slova na tipku
function setChar(){
	if(last!=null && !lastSelection.classed("def")){
		last.char = document.getElementById("kchar").value;
		update(defSpace,defKeys);
		update(keyboard,keyboardJSON.keyboard);
	}
}

//Rotira tipku
function rotate(){
	if(last!=null && last.shape!="circle"){
		last.rotation=(last.rotation+1)%4;
		update(defSpace,defKeys);
		update(keyboard,keyboardJSON.keyboard);
	}
}

//Briše tipku
function deleteKey(){
	if(last!=null){
		last.shape="delete";
		keyboardJSON.keyboard=keyboardJSON.keyboard.filter(function(item) {return item.shape !== "delete";});
		$('#charDiv').hide();
		$('#setChar').hide();
		$('#editKey').hide();
		$('#rotate').hide();
		$('#delete').hide();
		last = null;
		update(defSpace,defKeys);
		update(keyboard,keyboardJSON.keyboard);
	}
}

//Prikaz odgovarajućih opcija za podešavanje dimenzija i oblika tipke
function editKey(){
	$('#selectShape').val(last.shape);
	if(last.shape=="rect"){
		$('#selectShape').val('rect');
		$('#editCirclePie').hide();
		$('#editRect').show();
		$('#keyWidth').val(last.width);
		$('#keyHeight').val(last.height);
		$('#keyBRadius').val(last.br);		
	}
	if(last.shape=="circle"){
		$('#selectShape').val('circle');
		$('#editRect').hide();
		$('#editCirclePie').show();
		$('#keyRadius').val(last.r);
	}
	if(last.shape=="pie"){
		$('#selectShape').val('pie');
		$('#editRect').hide();
		$('#editCirclePie').show();
		$('#keyRadius').val(last.r);
	}
	//Prilikom promjene oblika tipke prikazuju se odgovarajuće postavke za taj konkretan oblik
	$('#selectShape').on('change', function() {
		if($('#selectShape').val()=="rect"){
			$('#editCirclePie').hide();
			$('#editRect').show();
			//Iz "pie" u pravokutnik
			if(last.shape=="pie"){
				$('#keyWidth').val(last.r);
				$('#keyHeight').val(last.r);
				$('#keyBRadius').val(0);	
			}
			//Iz kruga u pravokutnik
			if(last.shape=="circle"){
				$('#keyWidth').val(last.r*2);
				$('#keyHeight').val(last.r*2);
				$('#keyBRadius').val(0);	
			}
		}
		if($('#selectShape').val()=="circle"){
			$('#editRect').hide();
			$('#editCirclePie').show();
			//Iz "pie" u krug
			if(last.shape=="pie"){
				$('#keyRadius').val(last.r/2);	
			}
			//Iz pravokutnika u krug
			if(last.shape=="rect"){
				$('#keyRadius').val(last.width/2);	
			}
		}
		if($('#selectShape').val()=="pie"){
			$('#editRect').hide();
			$('#editCirclePie').show();
			//Iz kruga u "pie"
			if(last.shape=="circle"){
				$('#keyRadius').val(last.r*2);	
			}
			//Iz pravokutnika u "pie"
			if(last.shape=="rect"){
				$('#keyRadius').val(last.width);	
			}
		}
	});
}

//Ažurira oblik i dimenzije tipke u skladu sa odabranim vrijednostima
function submitKeyEdit(){
	var minVal = (keyboardJSON.kbwidth<keyboardJSON.kbheight) ? keyboardJSON.kbwidth : keyboardJSON.kbheight;
	if($('#selectShape').val()=="rect"){
		if(last.shape=="rect"){		
			last.width=($('#keyWidth').val()>0 && $('#keyWidth').val()<keyboardJSON.kbwidth) ? parseInt($('#keyWidth').val()) : 20;
			last.height=($('#keyHeight').val()>0 && $('#keyHeight').val()<keyboardJSON.kbheight) ? parseInt($('#keyHeight').val()) : 20;
			last.br=($('#keyBRadius').val()>0) ? parseInt($('#keyBRadius').val()) : 0;
		}
		if(last.shape=="circle"){
			last.shape="rect";
			last.width=($('#keyWidth').val()>0 && $('#keyWidth').val()<keyboardJSON.kbwidth) ? parseInt($('#keyWidth').val()) : 20;
			last.height=($('#keyHeight').val()>0 && $('#keyHeight').val()<keyboardJSON.kbheight) ? parseInt($('#keyHeight').val()) : 20;
			last.br=($('#keyBRadius').val()>0) ? parseInt($('#keyBRadius').val()) : 0;
			last.rotation=0;
			delete last['r'];
		}
		if(last.shape=="pie"){
			last.shape="rect";
			last.width=($('#keyWidth').val()>0 && $('#keyWidth').val()<keyboardJSON.kbwidth) ? parseInt($('#keyWidth').val()) : 20;
			last.height=($('#keyHeight').val()>0 && $('#keyHeight').val()<keyboardJSON.kbheight) ? parseInt($('#keyHeight').val()) : 20;
			last.br=($('#keyBRadius').val()>0) ? parseInt($('#keyBRadius').val()) : 0;
			delete last['r'];
		}
	}
	if($('#selectShape').val()=="circle"){
		if(last.shape=="rect"){
			last.shape="circle";
			last.r=($('#keyRadius').val()>0 && $('#keyRadius').val()<minVal/2) ? parseInt($('#keyRadius').val()) : 10;
			delete last['width'];
			delete last['height'];
			delete last['br'];
			delete last['rotation'];
		}
		if(last.shape=="circle"){
			last.r=($('#keyRadius').val()>0 && $('#keyRadius').val()<minVal/2) ? parseInt($('#keyRadius').val()) : 10;
		}
		if(last.shape=="pie"){
			last.shape="circle";
			last.r=($('#keyRadius').val()>0 && $('#keyRadius').val()<minVal/2) ? parseInt($('#keyRadius').val()) : 10;
			delete last['rotation'];
		}
	}
	if($('#selectShape').val()=="pie"){
		if(last.shape=="rect"){
			last.shape="pie";
			last.r=($('#keyRadius').val()>0 && $('#keyRadius').val()<minVal) ? parseInt($('#keyRadius').val()) : 20;
			delete last['width'];
			delete last['height'];
			delete last['br'];
		}
		if(last.shape=="circle"){
			last.shape="pie"
			last.r=($('#keyRadius').val()>0 && $('#keyRadius').val()<minVal) ? parseInt($('#keyRadius').val()) : 20;
			last.rotation=0;
		}
		if(last.shape=="pie"){
			last.r=($('#keyRadius').val()>0 && $('#keyRadius').val()<minVal) ? parseInt($('#keyRadius').val()) : 20;
		}
	}
	update(defSpace,defKeys);
	update(keyboard,keyboardJSON.keyboard);
}

//Učitavanje ranije spremljene tipkovnice s računala
function loadKeyboard(evt) {
	var selectedFile = evt.target.files[0];
	var reader = new FileReader();
	var fileUpload=document.getElementById("loadKeyboard").files[0];
	//Ako je odabrana .json datoteka
	if (selectedFile.type=="application/json"){
		reader.readAsText(fileUpload/*, "UTF-8"*/);
		reader.onload = (function(theFile) {
			return function(e) {
				keyboardJSON = JSON.parse(e.target.result);
				$('#kbwidth').val(keyboardJSON.kbwidth);
				$('#kbheight').val(keyboardJSON.kbheight);
				setKeyboardFrame();
				if ($("#start").is(":visible")){
					document.getElementById("start").click();
				}else{
					defKeys=[];
					keyboard.selectAll("*").remove();
					defSpace.selectAll("*").remove();
					keyboard = svg.append("g").attr("id", "keySpace").attr("transform", "translate("+kbXpos+", "+kbYpos+")");
					defSpace = svg.append("g").attr("id", "defSpace");
				}
				document.getElementById("loadKeyboard").value = "";
				update(defSpace,defKeys);
				update(keyboard,keyboardJSON.keyboard);};
		})(selectedFile);
	}else{
		alert("Please Select .json file")
	}
}

//Funkcija koja sprema konfiguraciju kreirane tipkovnice na računalo
function saveKeyboard(){
	var data = JSON.stringify(keyboardJSON, null, 4);
	
    var blob = new Blob( [ data ], {type: 'application/octet-stream'});   
    url = URL.createObjectURL( blob );
    var link = document.createElement( 'a' );
    link.setAttribute( 'href', url );
    link.setAttribute( 'download', 'keyboard.json' );
    
    var event = document.createEvent( 'MouseEvents' );
    event.initMouseEvent( 'click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
    link.dispatchEvent( event );
}

//Pridruživanje odgovarajućih funkcija tipkama
$('#kbsize').click(setKeyboardFrame);
$('#start').click(start);
$('#zoomout').click(zoomOut);
$('#zoomin').click(setKeyboardFrame);
$('#addkey').click(addDefKey);
$('#setChar').click(setChar);
$('#editKey').click(editKey);
$('#submitKeyEdit').click(submitKeyEdit);
$('#rotate').click(rotate);
$('#delete').click(deleteKey);
document.getElementById('loadKeyboard').addEventListener('change', loadKeyboard, false);
document.getElementById('saveKeyboard').addEventListener('click', saveKeyboard);

//Samo iz estetskog razloga
zoomOut();
zoomOut();
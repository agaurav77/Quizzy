// Let us have some basic functions

function moveStr(x1, y1, x2, y2) {
    // This function draws a simple path from x1,y1 to x2,y2
    return 'M'+x1.toString()+' '+y1.toString()+'L'+x2.toString()+' '+y2.toString()+'Z';
}

function transformAllLobes(somePath, animTime, style, arr) {
    // recursive algorithm can be improved upon ?
    // This function recursively animates all lobes to go to some point using transform path.    
    if (arr.type == 'circle') {
        arr.animate({transform:somePath}, animTime, style);
    } else {
        for (var di = 0; di < arr.length; di++) {
            transformAllLobes(somePath, animTime, style, arr[di]);
        }
    }
}

function transformAllPaths(somePath, animTime, style, arr) {
    // recursive algorithm can be improved upon ?
    // This function recursively animates all paths to go to some point using transform path.
    if (arr.type == 'path') {
        arr.animate({transform:somePath}, animTime, '<>');
    } else {
        for (var di = 0; di < arr.length; di++) {
            transformAllPaths(somePath, animTime, style, arr[di]);
        }
    }
}


function doStuff(n, i, k) {
    if (k === 0) {    
        // k = 0 is the initial stuff       
        if (n < divisions) {
            if (i === 0) {
                if (n === 0) {
                    tempLobes.push(lobeCenter);
                    allLobes.push(tempLobes);
                    tempLobes = [];
                }
                defAngle = angle+Math.random()*incAngle/2;
                newLength = avgLength*(1.9+Math.random()/2);
                x2i = x+avgLength*Math.cos(defAngle);
                x2 = x+newLength*Math.cos(defAngle);
                y2i = y+avgLength*Math.sin(defAngle);
                y2 = y+newLength*Math.sin(defAngle);        
                tempPaths.push(paper.path(moveStr(x, y, x2i, y2i)).attr({stroke:'#ffffff', 'stroke-width':4, opacity:0}).animate({path:moveStr(x, y, x2, y2), opacity:1}, animTime, '>'));
                tempPaths[n].attrs.level = [0,n];                
                i = 1;
            } else {
                tempLobes.push(paper.circle(x2, y2, 0).attr({fill:'#ffffff', stroke:'#ffffff',opacity:0}).animate({opacity:1, r:stdRadius}, animTime, '>'));
                tempLobes[n].attrs.level = [1, n];tempLobes[n].attrs.done = false;tempLobes[n].attrs.degree = defAngle/deg;             
                i = 0;
                n++;        
                angle += incAngle;        
            }
            setTimeout(function() {doStuff(n, i, 0);}, animDelay);
        }
        if (n == divisions) {
            // finally at the end of starting lobes, so do final work
            allLobes.push(tempLobes);tempLobes = [];
            allPaths.push(tempPaths);tempPaths = [];
            allLobes[0][0].toFront();
            setTimeout(function() {doStuff(0, [], 2);}, 1);            
            setTimeout(function() {doStuff(1, [], 2);}, 1);            
        }
    } else if (k == 1) {
        // k = 1 moves the objects to center of screen
        neededLobe = allLobes[n];
        currLobe = allLobes;
        for (var j = 0; j < currPos.length; j++) {
            currLobe = currLobe[currPos[j]];
        }
        currPos = [n];
        for (var j = 0; j < i.length; j++) {
            neededLobe = neededLobe[i[j]];
            currPos.push(i[j]);
        }
        currLobe.animate({r:stdRadius}, animTime);
        var xMove = width/2-neededLobe.attrs.cx;
        var yMove = height/2-neededLobe.attrs.cy;
        var somePath = 't'+xMove.toString()+','+yMove.toString();

        // animate the changes        
        transformAllLobes(somePath, animTime, '<>', allLobes);
        transformAllPaths(somePath, animTime, '<>', allPaths);

        neededLobe.animate({r:lobeRadius}, animTime);
        //paper.circle(width/2, height/2, 0).attr({fill:'#ffffff', stroke:'#ffffff',opacity:0}).animate({opacity:1, r:stdRadius}, animTime, '>');

    } else if (k == 2) {    
        // k = 2 assigns the handlers to all the objects at ith array (inclusive)
        var somePos = allLobes[n];
        for (var j = 0; j < i.length; j++) {
            somePos = somePos[i[j]];
        }        
        for (var j = 0; j < somePos.length; j++) {       
            somePos[j].attr({cursor:'pointer'
                }).mouseover(function() {
                    if (currPos[0] == this.attrs.level[0] && currPos[1] == this.attrs.level[1]) {
                        this.animate({r:lobeRadius*1.2}, animTime);
                    } else {
                        this.animate({r:stdRadius*1.2}, animTime);
                    }                        
                }).mouseout(function() {
                    if (currPos[0] == this.attrs.level[0] && currPos[1] == this.attrs.level[1]) {
                        this.animate({r:lobeRadius}, animTime);
                    } else {
                        this.animate({r:stdRadius}, animTime);
                    }
                }).mouseup(function() {
                    var levelCopy = this.attrs.level.slice(0);
                    levelCopy.shift();
                    doStuff(this.attrs.level[0], levelCopy, 1);
                });                
        } 
            
    } else if (k == 3) {
        // k = 3 draws further nodes, depending on the lobe's angle with respect to its parent lobe.
        // 45 to 135 makes bottom nodes, 135 to 225 makes left nodes, 225 to 315 makes top nodes, 315 to 45 makes right nodes
        


    }
        
}

// This sets the paper_quizzy div to center in the page
var somediv = document.getElementById('paper_quizzy');

var height = $(document.body).height();
var width = $(document.body).width();

// kinda pink background
document.body.style.backgroundColor = '#fba8f2';
// draw the central circle
var paper = Raphael('paper_quizzy', width, height);
var lobeRadius = height/6;
var stdRadius = lobeRadius/2;
var lobeCenter = paper.circle(width/2, height/2, lobeRadius).attr({fill:'#ffffff', stroke:'#ffffff'});
lobeCenter.attrs.level = [0, 0];lobeCenter.attrs.done = true;

// Lets have some serious stuff
var x = width/2;
var y = height/2;
var divisions = 6;
var angle = 0;
var animTime = 300; // animation time in ms
var animDelay = animTime; // the animation delay
var avgLength = height/6;
var deg = Math.PI/180;
var allPaths = [], tempPaths = [], allLobes = [], tempLobes = [], defAngle, newLength, x2, y2, x2i, y2i, i = 0;
var currLobe, neededLobe;
var currPos = [0, 0]; // the current position
var incAngle = 360/divisions*deg; // the angle which is increasing
angle += incAngle/4;
doStuff(0, 0, 0);

// Source till line 25 : StackExchange (http://stackoverflow.com/questions/7837456/comparing-two-arrays-in-javascript)
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}; 

// Let us have some basic functions

function Node(lobe, path, children, level) {
    // this is the Node class
    this.lobe = lobe;
    this.path = path;
    this.children = children;
}

function moveStr(x1, y1, x2, y2) {
    // This function draws a simple path from x1,y1 to x2,y2
    return 'M'+x1.toString()+' '+y1.toString()+'L'+x2.toString()+' '+y2.toString()+'Z';
}

    // generates a simple translation string by x,y
function transStr([x, y]) {
    return '..t'+x.toString()+','+y.toString();
}

function transformAll(somePath, animTime, style, arr) {
    // recursive algorithm can be improved upon ?
    // This function recursively animates all lobes to go to some point using transform path.   
    var newX = arr.lobe.attrs.cx+somePath[0];
    var newY = arr.lobe.attrs.cy+somePath[1];
    arr.lobe.animate({cx:newX, cy:newY}, animTime, style);
    arr.lobe.attrs.cx += somePath[0];
    arr.lobe.attrs.cy += somePath[1];
    if (arr.path !== undefined) {
        var newPath = arr.path.attrs.path.slice(0);
        newPath[0][1] += somePath[0];
        newPath[0][2] += somePath[1];
        newPath[1][1] += somePath[0];
        newPath[1][2] += somePath[1];
        
        arr.path.animate({path:newPath}, animTime, style);
        arr.path.attrs.path = newPath;
        
    }
    for (var di = 0; di < arr.children.length; di++) {
        transformAll(somePath, animTime, style, arr.children[di]);
    }
}

function doStuff(n, i, k) {
    if (k === 0) {    
        // k = 0 is the initial stuff       
        if (n < divisions) {
            if (i === 0) {
                // assume that before all this starting, rootNode exists with no children and is on the front [ESSENTIAL][NOT IMPLEMENTED]
                defAngle = angle+Math.random()*incAngle/2;
                newLength = avgLength*(1.9+Math.random()/2);
                x2i = x+avgLength*Math.cos(defAngle);
                x2 = x+newLength*Math.cos(defAngle);
                y2i = y+avgLength*Math.sin(defAngle);
                y2 = y+newLength*Math.sin(defAngle);        
                rootNode.children.push(new Node(undefined, undefined, []));
                rootNode.children[n].path = paper.path(moveStr(x, y, x2i, y2i)).attr({stroke:'#ffffff', 'stroke-width':4, opacity:0}).animate({path:moveStr(x, y, x2, y2), opacity:1}, animTime, '>');
                i = 1;
            } else {
                rootNode.children[n].lobe = paper.circle(x2, y2, 0).attr({fill:'#ffffff', stroke:'#ffffff', opacity:0}).animate({opacity:1, r:stdRadius}, animTime, '>');
                rootNode.children[n].lobe.attrs.level = [n];
                rootNode.children[n].lobe.attr({cursor:'pointer'
                }).mouseover(function() {
                    if (currPos.equals(this.attrs.level)) {
                        this.animate({r:lobeRadius*1.2}, animTime);
                    } else {
                        this.animate({r:stdRadius*1.2}, animTime);
                    }                        
                }).mouseout(function() {
                    if (currPos.equals(this.attrs.level)) {
                        this.animate({r:lobeRadius}, animTime);
                    } else {
                        this.animate({r:stdRadius}, animTime);
                    }
                }).mouseup(function() {
                    doStuff(this.attrs.level, -1, 1);
                });
                
                
                angle += incAngle;        
                rootNode.children[n].lobe.attrs.degree = defAngle/deg;             
                i = 0;
                n++;        
            }
            setTimeout(function() {doStuff(n, i, 0);}, animDelay);
        }
    } else if (k == 1) {
        // k = 1 moves the objects to center of screen
        // jQuery functions just clone the object appearing as third argument
        neededNode = jQuery.extend(true, {}, rootNode);
        currNode = jQuery.extend(true, {}, rootNode);
        for (var j = 0; j < currPos.length; j++) {
            currNode = currNode.children[currPos[j]];
        }
        currPos = n.slice(0);
        for (var j = 0; j < n.length; j++) {
            neededNode = neededNode.children[n[j]];
        }
        currNode.lobe.animate({r:stdRadius}, animTime);
        // change variable currNode, neededNode [NOT IMPLEMENTED]
        var xMove = width/2-neededNode.lobe.attrs.cx;
        var yMove = height/2-neededNode.lobe.attrs.cy;
        
        // animate the changes        
        transformAll([xMove, yMove], animTime, '<>', rootNode);
        neededNode.lobe.animate({r:lobeRadius}, animTime);
        
        // choose out bottom, left, top, right
        angle = neededNode.lobe.attrs.degree;
        //if (angle >= 45 && angle < 135) {
        //    angle = 0;
        //    alert(1);
        //} else if (angle >= 135 && angle < 225) {
        //    angle = 90;
        //    alert(2);
        //    increasing = false;
        //} else if (angle >= 225 && angle < 315) {
        //    angle = 180;
        //    alert(3);
        //} else {
        //    angle = 270;
        //    alert(4);
        //    increasing = false;
        //}
        angle -= 90;
        angle *= deg;
        setTimeout(function() {doStuff(0, 0, 2);}, animDelay);
        
    } else if (k == 2) {
        // k = 2 draws further nodes(and assigns them handlers), depending on the lobe's angle with respect to its parent lobe.
        // 45 to 135 makes bottom nodes, 135 to 225 makes left nodes, 225 to 315 makes top nodes, 315 to 45 makes right nodes
        if (neededNode.children.equals([]) || n !== 0) {
            while (n < branchDivisions) {
                if (i == 0) {
                    defAngle = angle+Math.random()*incAngle2/2;
                    newLength = avgLength*(1.9+Math.random()/2);
                    x2i = x+avgLength*Math.cos(defAngle);
                    x2 = x+newLength*Math.cos(defAngle);
                    y2i = y+avgLength*Math.sin(defAngle);
                    y2 = y+newLength*Math.sin(defAngle);        
                    neededNode.children.push(new Node(undefined, undefined, []));
                    neededNode.children[n].path = paper.path(moveStr(x, y, x2i, y2i)).attr({stroke:'#ffffff', 'stroke-width':4, opacity:0}).animate({path:moveStr(x, y, x2, y2), opacity:1}, animTime, '>');
                    i = 1;
                } else {
                    neededNode.children[n].lobe = paper.circle(x2, y2, 0).attr({fill:'#ffffff', stroke:'#ffffff', opacity:0}).animate({opacity:1, r:stdRadius}, animTime, '>');
                    levelCopy = neededNode.lobe.attrs.level.slice(0);
                    levelCopy.push(n);
                    neededNode.children[n].lobe.attrs.level = levelCopy;
                    neededNode.children[n].lobe.attr({cursor:'pointer'
                    }).mouseover(function() {
                        if (currPos.equals(this.attrs.level)) {
                            this.animate({r:lobeRadius*1.2}, animTime);
                        } else {
                            this.animate({r:stdRadius*1.2}, animTime);
                        }                        
                    }).mouseout(function() {
                        if (currPos.equals(this.attrs.level)) {
                            this.animate({r:lobeRadius}, animTime);
                        } else {
                            this.animate({r:stdRadius}, animTime);
                        }
                    }).mouseup(function() {
                        doStuff(this.attrs.level, -1, 1);
                    });
                    
                    angle += incAngle2;        
                    neededNode.children[n].lobe.attrs.degree = defAngle/deg;             
                    i = 0;
                    n++;        
                }
        
                setTimeout(function() {doStuff(n, i, 3);}, animDelay);
            }
        }   
    }
        
}

// This sets the paper_quizzy div to center in the page

var height = $(document.body).height();
var width = $(document.body).width();

// kinda pink background
document.body.style.backgroundColor = '#fba8f2';
// draw the central circle
var paper = Raphael('paper_quizzy', width, height);
var lobeRadius = height/12;// change this and next line
var stdRadius = lobeRadius;// and see the difference!!!
var lobeCenter = paper.circle(width/2, height/2, lobeRadius).attr({fill:'#ffffff', stroke:'#ffffff'});
lobeCenter.attrs.level = [];lobeCenter.toFront();
lobeCenter.attr({cursor:'pointer'
                }).mouseover(function() {
                    if (currPos.equals(this.attrs.level)) {
                        this.animate({r:lobeRadius*1.2}, animTime);
                    } else {
                        this.animate({r:stdRadius*1.2}, animTime);
                    }                        
                }).mouseout(function() {
                    if (currPos.equals(this.attrs.level)) {
                        this.animate({r:lobeRadius}, animTime);
                    } else {
                        this.animate({r:stdRadius}, animTime);
                    }
                }).mouseup(function() {
                    doStuff(this.attrs.level, branchDivisions, 1);
                });

// Lets have some serious stuff
var x = width/2;
var y = height/2;
var divisions = 6, branchDivisions = 3;
var angle = 0;
var animTime = 300; // animation time in ms
var animDelay = animTime*2; // the animation delay
var avgLength = height/6;
var deg = Math.PI/180;
var rootNode = new Node(lobeCenter, undefined, [], []), defAngle, newLength, x2, y2, x2i, y2i, i = 0;
var currNode, neededNode;
var currPos = []; // the current position
var incAngle = 360/divisions*deg, incAngle2 = 180/branchDivisions*deg; // the angle 18which is increasing
var increasing = true;
angle += incAngle/4;
doStuff(0, 0, 0);

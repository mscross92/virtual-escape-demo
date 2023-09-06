var canvasHeight = 1001;
var canvasWidth = 1001;
var canvasEdit;
var drawingEdit;
var pedigree;
// var selectedDoodleIndex;
var activeRelationship = null;
var lastNodeIndex = 0;
var lastRelationshipIndex = 0;
var lastDisorderIndex = 0;
var inter;
var draggingCanvas = false;
var counter = 0;

var memberSet = [
	[0, '', "U", '', true, null, false, false, false, true, true, false, 0, new PD.Vector(0.5 * canvasWidth, 0.75 * canvasHeight)],
];

var relationshipSet = [
];

var disorderSet = [];

var geneSet = [];


function logData() {
// _index, _name, _gender, _dob, _isProband, _disorders, _deceased, _IUFD, _adopted, _orphan, _generationRank, _p
	console.log('Members:\n_index\t_gender\t_deceased\t_orphan\t_generationRank\t_pX\t_pY');
	for (var i=0; i<pedigree.memberArray.length; i++) {
		var m = pedigree.memberArray[i];
		console.log(m.index + '\t' + m.gender + '\t' + m.deceased + '\t' + m.orphan + '\t' + m.generationRank + '\t' + m.p.x + '\t' + m.p.y);
	}
	console.log('\nRelationships:\n_from\t_to\t_type\n');
	for (var j=0; j<pedigree.relationshipArray.length; j++) {
		var r = pedigree.relationshipArray[j];
		console.log(r.from + '\t' + r.to + '\t' + r.type);
	}
}


function savePedigree() {
	var cnvs = document.getElementById(pedigree.drawing.canvas.id);
    // set canvasImg image src to dataURL
	var dataURL = cnvs.toDataURL();

    this.href = dataURL;
}

function dragCanvas(_point,_pedigree) {

	if (!_pedigree.draggingCanvas) {
		_pedigree.oldPx = _point.x;
		_pedigree.oldPy = _point.y;
		_pedigree.draggingCanvas = true;
		
		var x = (_pedigree.oldPx - _point.x) / 10;
		if (Math.abs(x)>3) pedigree.xDisplacement += x;
		//pedigree.yDisplacement += (oldPy - _point.y) / 10 * pedigree.drawing.scale;
		pedigree.drawFamily();
	}
	if (_pedigree.draggingCanvas) {
		_pedigree.xDisplacement -= (_pedigree.oldPx - _point.x);
		_pedigree.yDisplacement -= (_pedigree.oldPy - _point.y);
		_pedigree.drawFamily();
		_pedigree.oldPx = _point.x;
		_pedigree.oldPy = _point.y;
	}
}

function createFamily() {
    // Create a pedigree object from member data
    pedigree = new PD.Pedigree(memberSet, relationshipSet, disorderSet, canvasEdit, drawingEdit, canvasWidth, canvasHeight);
    

	// add member doodles
    for (var k=0; k<pedigree.memberArray.length; k++) {
		var member = pedigree.memberArray[k];
		// add doodle to canvas and link to node
        var doodle = pedigree.drawing.addDoodle('FamilyMember');
        member.doodle = doodle;
		doodle.setNode(member);
// 		doodle.setPropertyDefaults();
	}
	// add relationship doodles
	for (var i=0; i<pedigree.relationshipArray.length; i++) {
		var rShip = pedigree.relationshipArray[i];
		var doodle = pedigree.drawing.addDoodle('MemberConnector');
		doodle.setEdge(rShip);
	}
	// add disorder key doodle
// 	pedigree.drawing.addDoodle('PedigreeDisordersKey');
	pedigree.drawing.addDoodle('PedigreeGenerations');
	pedigree.generationsDoodle = pedigree.drawing.lastDoodleOfClass('PedigreeGenerations');
	pedigree.generationsDoodle.originX = -0.5*pedigree.drawing.canvas.width/pedigree.drawing.scale+20;
	
	// autozoom canvas
	
	pedigree.drawing.selectDoodle(pedigree.drawing.lastDoodleOfClass("FamilyMember"));
}       



function addSibling(_gender, _order) {
	var siblingIndex = drawingEdit.selectedDoodle.pedigreeId;
	var sibling = drawingEdit.selectedDoodle.node;
	
	var newMember = sibling.addRelative('sib',_gender, pedigree);
	
	pedigree.drawFamily(newMember).done(function() {
		pedigree.drawing.deselectDoodles();
		var i = pedigree.drawing.doodleArray.length - 1;
		var doodle = pedigree.drawing.doodleArray[i];
// 		doodle.node.ensureVisibleOnCanvas();
		pedigree.drawing.selectDoodle(doodle);
	});
}

function addSpouse() {
	var spouseIndex = drawingEdit.selectedDoodle.pedigreeId;
	var spouseGender = drawingEdit.selectedDoodle.gender;
	var gender = (spouseGender == "Male") ? "F" : "M";
	
	var spouse = drawingEdit.selectedDoodle.node;
	var newMember = spouse.addRelative('mate', gender, pedigree);
	
	pedigree.drawFamily(newMember).done(function() {
		pedigree.drawing.deselectDoodles();
		var i = pedigree.drawing.doodleArray.length - 1;
		var doodle = pedigree.drawing.doodleArray[i];
		pedigree.drawing.selectDoodle(doodle);
	});
}

function addChild(_gender) {
	var parentId = drawingEdit.selectedDoodle.pedigreeId;
	var parent = drawingEdit.selectedDoodle.node;
	var newMember = parent.addRelative('child', _gender, pedigree);
	
	pedigree.drawFamily(newMember).done(function() {
		pedigree.drawing.deselectDoodles();
		var i = pedigree.drawing.doodleArray.length - 1;
		var doodle = pedigree.drawing.doodleArray[i];
		pedigree.drawing.selectDoodle(doodle);
	});
}

function addParents() {
	var childIndex = drawingEdit.selectedDoodle.pedigreeId;
	var child = drawingEdit.selectedDoodle.node;
	
	var newMember = child.addRelative('parents', "M", pedigree);
	
	pedigree.drawFamily(newMember).done(function() {
		pedigree.drawing.deselectDoodles();
		var i = pedigree.drawing.doodleArray.length - 1;
		var doodle = pedigree.drawing.doodleArray[i];
		pedigree.drawing.selectDoodle(doodle);
	});
}




function toggleShowAllMembers(_this) {
	var status;
	if ($(_this).hasClass("show")) {
		status = false;
		$(_this).removeClass("show");
	}
	else {
		status = true;
		// check all disorder keys checked
		$(".PD-condition-row").addClass("show");
	}
	pedigree.setVisibility("all", status);
}



// Controller class
function eyeDrawController() {
    drawingEdit = ED.Checker.getInstanceByIdSuffix('Hx');
    this.drawing = drawingEdit;

    // Specify call back function
    this.callBack = callBack;
    
    // Register for notifications with drawing object
    this.drawing.registerForNotifications(this, 'callBack', []);

    // Method called for notification
    function callBack(_messageArray) {
        switch (_messageArray['eventName']) {
            // Eye draw image files all loaded
            case 'ready':
                break;
                
            case 'doodleAdded':
//                 console.log('doodle added');
                break;					

            case 'doodleDeleted':

                break;	
                                        
            case 'parameterChanged':
                //console.log('parameterChanged');
                var param = _messageArray['object']['parameter'];
                var doodle = _messageArray['selectedDoodle'];
//                 console.log(doodle.parameterValidationArray[param]['attribute']);
                break;
                
            case 'mouseup':
                //console.log('mouseUp');
                break;
              
            case 'doodleSelected':
            	var dood = _messageArray['selectedDoodle'];            	
				break;
			
			case 'doodleDeselected':
				break;
        }
    }
	createFamily();

}
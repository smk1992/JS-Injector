trie = function () {
	this._mainNode = this.makeNode({'value':''});
}

trie.prototype.addData = function (node) {
	var currentNode = this._mainNode;
	var value = node.value;

	// start from main. If branch from currentNode is defined take it otherwise create a Branch
	for (var i = 0; i < value.length; i++) {		
		if (currentNode.branches[value[i]]) {
			currentNode = currentNode.branches[value[i]];
		}
		else {
			//extend node once it reaches it location within tree. Otherwise create new branch node
			if (i === (value.length - 1)) {
				currentNode.branches[value[i]] = this.makeNode(node);
			} else {
				currentNode.branches[value[i]] = this.makeNode({'value': currentNode.value + value[i]});
			}

			currentNode = currentNode.branches[value[i]];
		}
	}
	
	if (this._mainNode !== currentNode) {
		currentNode.isWord = true;		
	} 

	return currentNode;
};

// Node needs to be an object, extend to not overwrite existing properties
trie.prototype.makeNode = function (node) {	
	node['branches'] = {};
	node['isWord'] =  false;
	return node;
};

trie.prototype.breadthFirst = function (value) {		
	var currentNode;
	if (value !== '') {
		currentNode = this.search(value);			
	} else {
		currentNode = this._mainNode;
	}	

	var results = [];
	var queue = [currentNode];
	var node;
	while (queue.length) {
		node = queue.shift();
		for (var key in node.branches) {
			queue.push(node.branches[key]);			
		}
		if (node.isWord && node.value.indexOf(value) === 0) {
			results.push(node);			
		}
	}

	return results;
};

trie.prototype.search = function (value) {
	var currentNode = this._mainNode;	
	for (var i = 0; i < value.length; i++) {
		if (currentNode.branches[value[i]]) {
			currentNode = currentNode.branches[value[i]];
		}
		else {
			break;			
		}
	}

	return currentNode;
};


trie.prototype.map = function(data) {
	for (var i = 0; i < data.length; i++) {
		this.addData(data[i]);
	}	
}
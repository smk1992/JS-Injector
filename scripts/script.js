(function () {
	var prefix = new trie();
	$(document).ready(function () {		
		LoadScripts();				

		$('.input').focus();
		
		$('.input').blur(function () {
			$('.input').focus();
		});		
		

		$('.input').on('input', function () { 
			DisplayLeads($(this).val());
			var current = $('.selected').removeClass('selected');
			$('.list').scrollTop(0);			
		});

		$(document).keydown(function (e) {

			if (e.keyCode === 40) { // Down Key
				e.preventDefault();
				goToNext();
			} else if (e.keyCode === 38) { // Up Key
				e.preventDefault();
				goToPrev();
			} else if (e.keyCode === 13) { // Enter Key
				$('.selected').trigger('click');
			} else if (e.keyCode === 34) {
				goToNext(14);
			} else if (e.keyCode === 33) {
				goToPrev(14);
			}
		});		
	});

	

	function LoadScripts() {				
		getPackages(function (scripts) {			
			if (scripts) {			
				for (var i = 0; i < scripts.length; i++) {					
					scripts[i]['$node'] = CreateItem(scripts[i], i % 4);
					$('.list').append(scripts[i].$node);
				}

				prefix.map(scripts); 

				$('.loading').remove();
				DisplayLeads('');				
			} else {
				showErrorMessage();
			}
		});		
	};

	
	function CreateItem (data, color) {
		var colors = ['#338888','#22cc88', '#eecc33', '#5599cc'];
		var $node = $('<li></li>');
		$node.text(data.value);
		$node.attr('version', data.version).attr('filename', data.filename)
				 .addClass('link hidden').css('background', colors[color]);		
		
		$node.click(function (e) {								
			try {
				var scriptAddr = "https://cdnjs.cloudflare.com/ajax/libs/" + $(this).text() + "/" + $(this).attr('version') + '/' + $(this).attr('filename');		
				if ($(this).attr('filename').substring($(this).attr('filename').length -2) === 'js') { 
					chrome.tabs.executeScript(null,{code:"var script = document.createElement('script'); script.src = '" + scriptAddr + "'; var head = document.getElementsByTagName('head')[0]; head.appendChild(script)"});	
				} else {
					chrome.tabs.executeScript(null,{code:"var link = document.createElement('link'); link.rel='stylesheet'; link.href = '" + scriptAddr + "';var head = document.getElementsByTagName('head')[0]; head.appendChild(link)"});	
				}

				toolTip('Injected', $(this).position(), true);				
			} catch(err) {						
				toolTip('Failed', $(this).position(), false);
			}			
		});

		return $node;	
	};


	function DisplayLeads(value) {
		$('li.searched').removeClass('searched');	

		var results;
		if (typeof(value) === 'string') {
			results =	prefix.breadthFirst(value);
			results.sort();
			for (var i = results.length - 1; i >= 0; i--) {
				$(results[i].$node).addClass('searched');
			}
		}
	}

	function getPackages(callback) {		
		var scripts = [];
		var timeout = parseInt(localStorage['timeout']) || 10000;
		$.ajax( {			
			url:'http://cdnjs.com/packages.json',			
			timeout: timeout,
			success: function (data) {					
					// pre-sort in order to improve filter search
					var packages = data.packages;
					packages.sort(function (a,b) {
						if (a.name > b.name) return 1;
						else if (a.name < b.name) return -1;
						else return 0;				
					});

					for (var i = 0; i < packages.length; i++) {
						scripts[i] = {'value':packages[i].name, 'version':packages[i].version, 'filename':packages[i].filename};
					}

					localStorage.setItem('timeout', '2500');
					localStorage.setItem('packages', JSON.stringify(scripts));
			},
			error: function (err) {				
				var scriptsString = localStorage.getItem('packages');
				scripts = scriptsString ? JSON.parse(scriptsString) : undefined;				
			},
			complete: function (data) {
				callback(scripts)
			}
		});
	}


	function goToNext(by) {
		by = by || 1;
		for (var i = 0; i < by; i++) {
			var current = $('.selected');				
			if (current.length) {
				current.removeClass('selected');
				current = current.next('.searched'); 
				current.addClass('selected');					
			}	else {				
				var first = $('.list').children('.searched')[0];	
				$(first).addClass('selected');
				current = $(first);
			}

			if ($('.list').outerHeight() + 10 <= current.position().top) {
				$('.list').scrollTop($('.list').scrollTop() + current.outerHeight()); 				
			}
		}
	}

	function goToPrev(by) {
		by = by || 1;

		for (var i = 0; i < by; i++) {
			var current = $('.selected');				
			if (current.length) {
				current.removeClass('selected');
				current.prev('.searched').addClass('selected'); 					
				if (current.position().top  < $('.list').position().top + 10) { 
					$('.list').scrollTop($('.list').scrollTop() - current.outerHeight());					
				}
			}
		}		
	}

	function toolTip(msg, position, positive) {		
		var $tooltip = $('.tooltip');
		$tooltip.find('.tool-message').text(msg);
		
		$tooltip.fadeIn();

		$tooltip.css({'top':position.top - 28});
		if (positive) {
			$tooltip.css('background-color', 'green');
		} else {
			$tooltip.css('background-color', 'red');
		}
		
		setTimeout(function () {
			$tooltip.fadeOut();
		}, 1000);
	}


	function showErrorMessage() {
		// incase No Packages Period----->-->--->---->
		$("body").append("TRY AGAIN!");
	}
})();	
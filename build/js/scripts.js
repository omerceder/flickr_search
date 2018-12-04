const FLICKR_API  = "https://api.flickr.com/services/rest/";
const API_KEY 	  = '82815f73e042c15ef2549c8f499a71d6';

var search_results;

jQuery( document ).ready(function() {

	// Get search params from GET...
	console.log(getUrlParameter('check'));

	sticky_header_on_scroll();
	select2_init();
});

function sticky_header_on_scroll() {
	jQuery(window).on('scroll', function(){

		var header 	  = jQuery('.header');
		var search_wrapper = jQuery('.search_wrapper');
		var scrollTop = jQuery(window).scrollTop();

		if (scrollTop >= 90) {
			header.addClass('fixed');
			search_wrapper.addClass('fixed');
		} else {
			header.removeClass('fixed');
			search_wrapper.removeClass('fixed');
		}

	});
}

function select2_init() {
	jQuery('#flickr_search').select2({
		ajax				: {
			url 	 : FLICKR_API,
			type	 : "GET",
			data 	 : function (params) {
				// setCookie( params.term );
				return {
					method 		: 'flickr.photos.search',
					api_key 	: API_KEY,
					text 		: params.term
				};
			},
			processResults : function (data) {
				search_results  = xmlToJson(data);
				photos 			= search_results.rsp.photos.photo;
				html 			= imgLoop(photos);
				jQuery('.photos_wrapper .row').html(html);
				// setTimeout(function() {
				// 	jQuery('.flickr-img-wrapper').matchHeight()
				// }, 300);
				setTimeout(function() {
					jQuery(window).trigger('resize');
				}, 500);
				return {
					results : data
				};
			}
		},
		placeholder 		: 'Search Flickr',
		escapeMarkup 		: function (markup) { return markup; }, // let our custom formatter work
		minimumInputLength 	: 3,
		dropdownParent 		: jQuery('.searchbar')
		// templateResult 		: formatRepo,
		// templateSelection 	: formatRepoSelection
	});
}

// function setCookie(search_term) {
//
// 	document.cookie =
//   'ppkcookie1="'+search_term+'"; expires=Thu, 2 Aug 2001 20:47:11 UTC; path=/'
//
// 	console.log(document.cookie);
// }

function imgLoop(img_array){
	var html='';
	img_array.forEach(function(item) {
		html+=buildImgHtml(item);
	});
	return html;
}

function buildImgHtml(img_obj) {
	var html = "<div class=column><div class='flickr-img-wrapper' data-img='"+JSON.stringify(img_obj)+"'>"+
			   	"<img src='"+imageUrl(img_obj)+"' alt='"+img_obj.title+"'>"+
				"</div></div>";
	return html;
}

function imageUrl(img_obj) {
	var img_url = 'https://farm'+img_obj.farm+'.staticflickr.com/'+img_obj.server+'/'+img_obj.id+'_'+img_obj.secret+'.jpg';
	return img_url;
}

function formatRepo(repo) {
	if (repo.loading) {
		return repo.text;
	}

	var markup = "<div class='select2-result-repository clearfix'>" +
		"<div class='select2-result-repository__avatar'><img src='" + repo.owner.avatar_url + "' /></div>" +
		"<div class='select2-result-repository__meta'>" +
		"<div class='select2-result-repository__title'>" + repo.full_name + "</div>";

	if (repo.description) {
		markup += "<div class='select2-result-repository__description'>" + repo.description + "</div>";
	}

	markup += "<div class='select2-result-repository__statistics'>" +
		"<div class='select2-result-repository__forks'><i class='fa fa-flash'></i> " + repo.forks_count + " Forks</div>" +
		"<div class='select2-result-repository__stargazers'><i class='fa fa-star'></i> " + repo.stargazers_count + " Stars</div>" +
		"<div class='select2-result-repository__watchers'><i class='fa fa-eye'></i> " + repo.watchers_count + " Watchers</div>" +
		"</div>" +
		"</div></div>";

	return markup;
}

function formatRepoSelection(repo) {
	return repo.full_name || repo.text;
}

function xmlToJson(xml) {

	// Create the return object
	var obj = {};

	if (xml.nodeType == 1) { // element
		// do attributes
		if (xml.attributes.length > 0) {
		obj = {};
			for (var j = 0; j < xml.attributes.length; j++) {
				var attribute = xml.attributes.item(j);
				obj[attribute.nodeName] = attribute.nodeValue;
			}
		}
	} else if (xml.nodeType == 3) { // text
		obj = xml.nodeValue;
	}

	// do children
	if (xml.hasChildNodes()) {
		for(var i = 0; i < xml.childNodes.length; i++) {
			var item = xml.childNodes.item(i);
			var nodeName = item.nodeName;
			if (typeof(obj[nodeName]) == "undefined") {
				obj[nodeName] = xmlToJson(item);
			} else {
				if (typeof(obj[nodeName].push) == "undefined") {
					var old = obj[nodeName];
					obj[nodeName] = [];
					obj[nodeName].push(old);
				}
				obj[nodeName].push(xmlToJson(item));
			}
		}
	}
	return obj;
}

function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
};

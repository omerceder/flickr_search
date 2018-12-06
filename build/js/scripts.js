const FLICKR_API  = "https://api.flickr.com/services/rest/";
const API_KEY 	  = '82815f73e042c15ef2549c8f499a71d6';

var search_term;
var search_results;
var number_of_results;
var current_datetime = new Date();

var search_obj = {};

jQuery( document ).ready(function() {
	select2_init();
	popup_toggle();
	sticky_header_on_scroll();
});

function popup_toggle() {
	jQuery('.popup_toggle').on('click', function(){
		jQuery('.popup_table').toggleClass('visible');
	});
}

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
				search_term = params.term;
				return {
					method 		: 'flickr.photos.search',
					api_key 	: API_KEY,
					text 		: search_term
				};
			},
			processResults : function (data) {
				search_results    = xmlToJson(data);
				photos 			  = search_results.rsp.photos.photo;
				number_of_results = search_results.rsp.photos.total;
				html 			  = imgLoop(photos);

				jQuery('.search_term').html(search_term); // Print the Search Term
				jQuery('.number_of_results').html( new Intl.NumberFormat().format(number_of_results) ); // Print the # of Results (with comma)
				jQuery('.number_of_results_text').addClass('visible');  // Show Header Text
				jQuery('.photos_wrapper .row').html(html); // Print Images on DOM

				search_obj = {
					term 			: search_term,
					results 		: number_of_results,
					search_datetime : current_datetime
				}

				return {
					results : data
				};
			}
		},
		placeholder 		: 'Search Flickr',
		escapeMarkup 		: function (markup) { return markup; },
		minimumInputLength 	: 3,
		dropdownParent 		: jQuery('.searchbar')
	});
}

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
}

const FLICKR_API  = "https://api.flickr.com/services/rest/";
const API_KEY 	  = 'c0501ecb6aa7e477667f27b5ffe7402e';

var search_results;

jQuery( document ).ready(function() {
	select2_init();
});

function select2_init() {
	jQuery('#flickr_search').select2({
		ajax				: {
			url 	 : FLICKR_API,
			dataType : "XML",
			type	 : "GET",
			data 	 : function (params) {
				return {
					method 		: 'flickr.photos.search',
					api_key 	: API_KEY,
					text 		: params.term,
					// format 		: 'rest',
					// auth_token  : '72157674179183727-37d3cb4726f7a9cc',
					// api_sig 	: '060dbfdf7b026069b4306463410ee2cf'
				};
			},
			processResults : function (data) {
				search_results  = xmlToJson(data);
				photos 			= search_results.rsp.photos.photo;
				html 			= imgLoop(photos);
				jQuery('.photos-wrapper').html(html);
				console.log(html);
				return {
					results : data
				};
			}
		},
		placeholder 		: 'Search Flickr',
		escapeMarkup 		: function (markup) { return markup; }, // let our custom formatter work
		minimumInputLength 	: 3,
		templateResult 		: formatRepo,
		templateSelection 	: formatRepoSelection
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
	var html = "<div class='flickr-img-wrapper' data-img='"+JSON.stringify(img_obj)+"'>"+
			   	"<img src='"+imageUrl(img_obj)+"' alt='"+img_obj.title+"'>"+
				"</div>";
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

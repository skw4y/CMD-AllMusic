// ==UserScript==
// @name        CMD AllMusic
// @namespace   skw4y
// @description Display AllMusic informations on the page
// @require      http://code.jquery.com/jquery-2.1.1.min.js
// @include     http://le-club-des-mangeurs-de-disques.blogspot.fr/*
// @version     1.0
// @grant       none
// ==/UserScript==

var title=GetTitle();

//Only retrieve AllMusic rating on article page
if (CheckUrl() && ((title.indexOf("[")!=-1 ) || (title.indexOf("~")!=-1)))
{
	//Title transformation
	title=TransformTitle(title);

	//AllMusic final url  
	var AllMusicUrl="http://allmusic.com/search/albums/"+title;

	//Cross domain query to retrieve the first search result
	var queryurl='http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from html where url="' + AllMusicUrl + '" and xpath="//li[@class=\'album\']/div[2]/div[1]/a"') + '&format=xml&callback=?';
	
	$.getJSON(queryurl,
        function(data)
        {
			var firstLink=data.results[0];

			if(firstLink)
			{
				//Adding AllMusic link after the post title
				$("<br><div id=\"allmusic\"><div id=\"lien-album-allmusic\"> Lien album AllMusic : "+ firstLink + "</div></div>").insertAfter("h3.post-title.entry-title");

				var albumLink=$(firstLink).attr('href');
				GetRatingAndGenre(albumLink);
			}
        }
	);
}

function GetRatingAndGenre(albumLink)
{
	albumLink=albumLink.replace("www.","");

	//Cross domain query to retrieve the album genres and rating
	var queryurl='http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from html where url="' + albumLink + '"') + '&format=xml&callback=?';

	$.getJSON(queryurl,
        function(data){
			var allMusicHtml=data.results[0];
			if(allMusicHtml){
				//Retrieve rating
				var rating=$(allMusicHtml).find('div[class*="allmusic-rating"]').first().text();
				//Retrieve genres
				var genres=$(allMusicHtml).find('div.genre').first().find('a');

				if (rating)
				{
					//Adding AllMusic rating inside the div
					$("div#allmusic").append("<div id=\"note-allmusic\"><p> Note AllMusic :" + rating + "/10</p></div>");
				}

				//Adding AllMusic genre inside the div
				$("div#allmusic").append("<div id=\"genre-allmusic\"><p> Genre AllMusic :  </p></div>");

				var len = genres.length;
				genres.each(function( index ) {
					//Adding AllMusic genre inside the genre-allmusic div
					$("div#genre-allmusic p").append($(this).text() + ((index == len - 1) ? "" : ", "));
				});
			}
        }
      );
}


function GetTitle()
{
	var title=$("h3.post-title.entry-title").html();
	return title;
}

function CheckUrl()
{
	var url=window.location.toString();
	return (url.indexOf(".html")!=-1 && url.indexOf("search?")==-1);
}

function TransformTitle(title)
{
	title=title.replace(title.substring(title.indexOf("["),title.length),"").trim();
	title=title.replace("~"," ");
	title=title.replace(/\s+/g, '+');
	return title;
}

function FilterData(data)
{
    data = data.replace(/<?\/body[^>]*>/g,'');
    data = data.replace(/[\r|\n]+/g,'');
    data = data.replace(/<--[\S\s]*?-->/g,'');
    data = data.replace(/<noscript[^>]*>[\S\s]*?<\/noscript>/g,'');
    data = data.replace(/<script[^>]*>[\S\s]*?<\/script>/g,'');
    data = data.replace(/<script.*\/>/,'');
    return data;
}

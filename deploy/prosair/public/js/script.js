function infoMessageBox(message, title){
	$("#info-body").html(message);
	$("#info-title").html(title);
	$("#info-popup").modal('show');
}

function infoMessageBoxLg(message, title){
	$("#info-body-lg").html(message);
	$("#info-title-lg").html(title);
	$("#info-popup-lg").modal('show');
}

function messageBox(body, title, ok_text, close_text, callback){
	$("#modal-body").html(body);
	$("#modal-title").html(title);
	if (ok_text) $("#modal-button").html(ok_text);
	if(close_text) $("#modal-close-button").html(close_text);
	$("#modal-button").unbind("click"); // remove existing events attached to this
	$("#modal-button").click(callback);
	$("#popup").modal("show");
}

function my_location(){
		FB.api('/me/tagged_places', 'GET', (data) => {
			data = data.data;
			var output = "<div class='list-group'>";
			for (var i=0; i<data.length; i++){
				output += `<a href="#" class="list-group-item ` + (i%2==0? "active" : "") + `">
				<b class="list-group-item-heading">` + data[i].place.name+ `</b>
				<p class="list-group-item-text">` + data[i].place.location.city + `</p>
				</a>`;
			}
			output += "</div>";
			console.log(data);
			infoMessageBoxLg(output, "My Locations");
		});
}

function set_username(){
	FB.api('/me', 'get', (data)=>{
		document.getElementById("username").innerHTML = data.name ? data.name : "";
	});
}

function put_url_data(){
	var data = {};
	FB.api('/me', 'get', (user) => {
		data.name = user.name;
		data.id= user.id;
		FB.api('/me/tagged_places', 'get', (places) => {
			console.log("TAGGED PLACESSSSSS:: ")
			console.log(places);
			data.places = places;
			FB.api("/me/friends", "GET", (friends) => {
				data.friends = friends;
				console.log("FRIENDS:: ")
				console.log(friends);
				$.post( "/", data, function() {}, "json");
			});
		});
	});
}

function get_trip_plan(source,destination)
{
	initMap(source, destination);
	setTimeout(()=>{
		document.getElementById("map").style.position = "static";
		google.maps.event.trigger(document.getElementById("map"), 'resize');
	}, 1000);
	document.getElementById("places_in_location").style.display = "inline";
	document.getElementById("places_in_itinenary").style.display = "inline";
	document.getElementById("location").innerHTML = destination;
	document.getElementById("place_list").innerHTML = "";
	document.getElementById("place_itinenary").innerHTML = "";

}


function plan_trip_form(){
	let body = `<form><input placeholder="From" type="text" required="" id="plan_trip_source"></form>`;
	if (FB.getAccessToken() != null) {	
		messageBox(body, "Plan Trip", "Search", "Cancel", () => {
			console.log("clicked")
			FB.api('/me', 'get', (user) => {
				console.log(user)
				$.get(routes.recommend + "?uid="+ user.id, function(data) {
						console.log(data.matches);
						document.getElementById("trip_switcher").innerHTML = "";

						if (data.matches.length > 0)
						{
							let a = document.createElement("li");
							a.className = "mdl-mega-footer__link-list";
							a.innerHTML = "<b>Suggestions</b>";
							document.getElementById("trip_switcher").appendChild(a);
						}
						for (let i=0; i<data.matches.length; i++)
						{
							let a = document.createElement("li");
							a.className = "mdl-mega-footer__link-list";
							a.innerHTML = data.matches[i];
							document.getElementById("trip_switcher").appendChild(a);
							a.onclick = function()
							{
								get_trip_plan(document.getElementById('plan_trip_source').value,data.matches[i])
							};
						}
	
							
	
					});
					//
				});
			});
	}
	else
	{
		messageBox(body, "Plan Trip", "Search", "Cancel", () => {
        document.getElementById("trip_switcher").innerHTML = "";
		$.ajax({
               		 method: "POST",
               		 url: 'https://mighty-coast-61519.herokuapp.com/auto',
               		 data: JSON.stringify({fromCity : document.getElementById('plan_trip_source').value}),
               		 contentType: 'application/json',
               		 success: function(data2){
			     var origin = data2[0].value;
			     if(data2.length > 1) { 
				for(let i = 0; i < data2.length; i++) 
				{ 
					if(document.getElementById("plan_trip_source").value.startsWith(data2[i].value.slice(0,1)))
					{ 
						origin = data2[i].value;
					}
				}
				} 
               		     console.log(data2[0].value);
			     var today = new Date();
			     today.setMonth(today.getMonth() - 3);
			     var ym = today.toISOString().substring(0, 7);
			     console.log(ym);
		              $.ajax({
                         	method: "POST",
                         	url: 'https://mighty-coast-61519.herokuapp.com/topten',
                         	data: JSON.stringify({period : ym , fromAirp: origin }),
                         	contentType: 'application/json',
                         	success: function(data3){
                             	console.log(data3);
				if (data3["results"].length > 0)
                                                {
                                                        let a = document.createElement("li");
                                                        a.className = "mdl-mega-footer__link-list";
                                                        a.innerHTML = "<b>Suggestions</b>";
                                                        document.getElementById("trip_switcher").appendChild(a);
                                                }
                                                for (let i=0; i<data3["results"].length; i++)
                                                {
                                                        let a = document.createElement("li");
                                                        a.className = "mdl-mega-footer__link-list";
							var destination;
							$.ajax({
                                				method: "POST",
                                				url: 'https://mighty-coast-61519.herokuapp.com/location',
                                				data: JSON.stringify({fromCity: data3["results"][i].destination }),
                                				contentType: 'application/json',
                                				success: function(data4){
                                					console.log(data4);
									destination = data4["city"].name;
                                                        		a.innerHTML = destination;
                                                        		document.getElementById("trip_switcher").appendChild(a);
                                                        		a.onclick = function()
                                                        		{
                                                                		get_trip_plan(document.getElementById('plan_trip_source').value,data4["city"].name);
                                                        		};
								}
							});
                                                }
                             	}
                         	});			
               		     }
               		 });
            	});		
	}
}

function add_to_place_list(place, click){
	let li = document.createElement("li");
	li.innerHTML = place;
	li.onclick = click;
	li.className = "mdl-menu__item";
	document.getElementById("place_list").appendChild(li);
}

function add_to_itinenary_list(place, click){
	let li = document.createElement("li");
	li.innerHTML = place;
	li.onclick = click;
	li.className = "mdl-menu__item";
	document.getElementById("place_itinenary").appendChild(li);
}

function show_progress_bar(){
	document.getElementById("progress_bar").style.visibility = "visible";
}
function hide_progress_bar(){
	document.getElementById("progress_bar").style.visibility = "hidden";
}
function set_price(value){
	document.getElementById("price").innerHTML = "$"+value;
}

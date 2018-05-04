var results = []; // global array of most recent search results
$(document).ready(function() {
    $( "#temp-range" ).slider({
        range: true,
        min: 5,
        max: 90,
        values: [ 5, 90 ],
        slide: function( event, ui ) {
            if (ui.values[ 0 ] > 70)
                ui.values[ 0 ] = 70;

            if (ui.values[ 1 ] < 20)
                ui.values[ 1 ] = 20;

            $("#low-temp-value").text(ui.values[ 0 ]);
            $("#high-temp-value").text(ui.values[ 1 ]);
        }
    });



    $( ".detail-slider" ).each(function(){
        $(this).slider({
            value:100,
            min: 0,
            max: 100,
            step: 1,
            slide: function( event, ui ) {
                $(this).next(".detail-slider-value").text(ui.value);
            }
        });
    });

    // $( ".climate-slider" ).each(function(){
    //     $(this).slider({
    //         value:100,
    //         min: 0,
    //         max: 100,
    //         step: 1,
    //         slide: function( event, ui ) {
    //             $(this).next("#climate-slider-value").text(ui.value);
    //         }
    //     });
    // });
    $( "#climate-dropdown" ).change(function(){
        if ($(this).val() == 'Hotter'){
            $("#rain-dropdown-").show();
            $("#snow-dropdown").hide();
        } else if ($(this).val() == "Colder"){
            $("#rain-dropdown").hide();
            $("#snow-dropdown").show();
        } else {
            $("#rain-dropdown").show();
            $("#snow-dropdown").show();
        }
    });

    $( ".commute-slider" ).slider({
        value:60,
        min: 0,
        max: 60,
        step: 1,
        slide: function( event, ui ) {
            $(this).next("#commute-slider-value").text(ui.value);
        }
    });

    $(".toggle-menu-option").each(function(){
        $(this).prop('checked', true);
    });

    $(".checkbox").on("change", function(){
        $(this).next(".detailed-criteria").toggle();
        setActiveSearch();
    });
    setActiveSearch();
    setScope()

    $(".toggle-menu-option").each(function(){
        $(this).click();
    });

    $(function () {
      $('[data-toggle="tooltip"]').tooltip()
    });

    $("#search-button").on("click", function() {
        console.log(JSON.stringify(buildPost()));
        $.ajax({
            type: "POST",
            //url: "http://52.53.103.102/code_fury/controllers/search.php", // AWS database
            url: "/controllers/search.php",                            // local database
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(buildPost()),
            success: function(resp) {
                results = resp; // update this global variable
                // TODO: delete all existing pins
                console.log("there are " + results.length + " results");
                for(var i=0; i<results.length; i++) {
                    // show a pin for the current county
                    var str = results[i].county + " " + results[i].state;
                    makeRequest(str);
                }
                //makeRequest('Montgomery County MD')

            },
            error: function(resp) {
                console.log(resp);
            }
        });
    });
});

function setActiveSearch(){
    var active = "<div class=\"columns\"><ul>";
    $(".toggle-menu-option").each(function(){
        if($(this).is(':checked')){
                active += "<li>" + $(this).attr("id") + "</li> ";
        }
    });
    active += "</ul></div>";
    $("#active-criteria").html(active.slice(0, -2));
}

function setScope(){
    var scope = "states";
    var otherScope = "counties";

    if (scope == "states")
        var direction = "in";
    else
        var direction = "out";

    $("#scope").html("Currently searching for matching <b>" + scope + "</b>. Zoom " + direction + " on the map to change search to <b>" + otherScope + "</b>.");
}

function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";
}

$("#close-nav").on("click", function() {
    closeNav();
});

function openNav() {
    document.getElementById("mySidenav").style.width = "450px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}
//made it global so we can call on search success
var service;
// callback when google maps api loads
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 37.09024, lng: -100.712891}, //initially centered in the middle of the US, quickly replaced with current location
        zoom: 4
//        mapTypeId: google.maps.MapTypeId.ROADMAP
    });


    // see getBounds() from: https://developers.google.com/maps/documentation/javascript/reference/3/#Map
    map.addListener('bounds_changed', function () {
        console.log(map.getBounds());
    });

	//https://developers.google.com/places/place-id
	// set up places service to search for counties and drop pins
	service = new google.maps.places.PlacesService(map);

	//makeRequest('Montgomery County Maryland');

    // attempt to get user location with W3C Geolocation (Preferred). see: tinyurl.com/gmproj3
//    var initialLocation;
//    if(navigator.geolocation) {
//        navigator.geolocation.getCurrentPosition(function(position) {
//            initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
//            map.setCenter(initialLocation);
//            map.setZoom(11);
//        });
//    }
}

function buildPost(){
    var post = {"schools":{}, "transportation":{}, "crime":{}, "recreation":{}, "climate":{}, "healthcare":{}, "commute":{}};
    post.schools["enabled"] = $("#Public_Schools").is(':checked');
    post.schools["value"] = parseInt($( "#public-schools-dropdown option:selected" ).val());
    post.transportation["enabled"] = $("#Public_Transportation").is(':checked');
    post.transportation["value"] = parseInt($( "#public-transportation-dropdown option:selected" ).val());
    post.crime["enabled"] = $("#Crime").is(':checked');
    post.crime["value"] = parseInt($( "#crime-dropdown option:selected" ).val());
    post.recreation["enabled"] = $("#Outdoor_Recreation").is(':checked');
    post.recreation["value"] = {"has_biking":$("#biking").is(':checked'), "has_climbing":$("#climbing").is(':checked'),
                                "has_camping":$("#camping").is(':checked'), "has_hiking":$("#hiking").is(':checked'),
                                "has_hunting":$("#hunting").is(':checked'), "has_wilderness":$("#wilderness").is(':checked'),
                                "has_swimming":$("#swimming").is(':checked')};
    post.climate["enabled"] = $("#Climate").is(':checked');
    post.climate["value"] = {"temperature": parseInt($( "#climate-dropdown option:selected" ).val()), "precipitation": parseInt($( "#rain-dropdown option:selected" ).val()),
                             "snowfall": parseInt($( "#snow-dropdown option:selected" ).val())};
    post.healthcare["enabled"] = $("#Health_Care").is(':checked');
    post.healthcare["value"] = parseInt($( "#healthcare-dropdown option:selected" ).val());
    post.commute["enabled"] = $("#Commute_Time").is(':checked');
    post.commute["value"] = parseInt($( "#commute-slider-value" ).text());
    return post;
}

//from https://developers.google.com/places/place-id
function makeRequest(countyName){
	var request = {
		location: map.getCenter(),
		radius: '500',
		query: countyName
	};
	service.textSearch(request, callback);
}

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    var marker = new google.maps.Marker({
      map: map,
      place: {
        placeId: results[0].place_id,
        location: results[0].geometry.location
      }
    });
  }
}

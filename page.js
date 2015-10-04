/*
   Overview:  This lab is the last in three labs for the course
              jQuery - DEV208X presented by Microsoft and edX.
              
              The lab's goal is to provide a hands-on review
              of the material presented in the video lectures and
              written material.
              
              In doing these labs, I have added more features than
              required by the instructor.  Mostly, because after
              a while coding in javaScript and jQuery became "fun".
              
              Anyway, read this for your own purposes but this code,
              page.js, is copyrighted.  However, the page.html and
              page.css files were provided by the instructor and are
              not copyrighted.
              
              copyright, 2015 by Jack C. Coleman 
              
              Currently, there are 358 lines in this file, so it's 
              not too time consuming to read!!
*/

//
// Enhancement Notes.
//
// Problem:  The rating should NOT be submitted if NO ratings value
// was chosen.  
//
// Solution: unlock the Submit button after a ratings is entered.
// Also, the submit button can be unlocked multiple (!) times
// before a ratings datum is sent to the server.
//
// Problem:  The elements "flash" when the mouse pointer
// is moved between elements, especially when moving from the 
// top of one circle to another.
//
// Solution:  Set a timer when leaving an element so that the
// mouse leaving event logic does NOT take effect, unless the
// user takes longer than the timer to traverse from one
// circle to another.  Also, in the mouse entry event
// cancel the timer and continue with the mouse entry event logic.
// To test this use a 3-second timer and then reduce it to 
// 250 ms or less for actual production use.
//
// Note.  A FSM was tried, but it is much easier to implement
// a non-deterministic solution by simply
// retaining the rating value across events.
//
 
/*
    The following global variables are set by main() at the end of this file
*/
    
// rating is one-based
var rating;

var mouseLeaveLatency_ID;

// latency is set in main() to a nice leirsurely pace so that 
// the use can "bounce" the cursor from one circle to another
//
var mouseLeaveLatency;   // latency in milli-seconds

// address of ratings server
var serverURL;

//
// end of globals, start of code:
//

// mouse has entered a ratings circle
function mouseEnter() {
    
    window.clearTimeout(mouseLeaveLatency_ID);
        
    //IF here because mouse was too fast
    // then doubly ensure that there are no hover classes.
    
    // avoid storge leak!! addClass ONLY adds to list of classes
    $('.rating-circle').removeClass('rating-hover rating-chosen rating-prev-chosen');

    var possible_rating = $('.rating-circle').index($(this)) + 1;
    
    if (possible_rating >= rating) {
        //
        // user is pointing to a higher rating
        // a rating > 0 implies that some elements were chosen, thus
        // elements to left and inclusive of rating should be set
        // to prev-chosen
        //
        if (rating > 0) {
        var oD = $('.rating-circle').get(rating - 1);
        $(oD).prevAll().addClass('rating-prev-chosen');
        $(oD).addClass('rating-prev-chosen');
        }
    
    } else {
        // user is pointing to a potentially lower rating
        // set all prior and inclusive of potential rating
        // to prev-chosen.
        $(this).prevAll().addClass('rating-prev-chosen');
        $(this).addClass('rating-prev-chosen');
        
    }
        
    // all elements to left of and inclusive of $(this) should
    // changed to hover, unless they are already prev-chosen
    //
    // Speical BUG note.  Watch out for dots, selectors require
    // them for classes, but addClass/hasClass require just the class name!!
    //
    $(this).prevAll().not('.rating-prev-chosen').addClass('rating-hover');
    if (! $(this).hasClass('rating-prev-chosen')) {
        $(this).addClass('rating-hover');
    }
    
    // Another invariant test :
    // on exit, only rating-prev-chosen and rating-hover should
    // exist AND they should sum to the potential rating!!
    //
    if ($('.rating-prev-chosen').length + $('.rating-hover').length !== possible_rating) {
        alert("error 2 in mouseEnter event, possible rating = " + possible_rating +
        "\n nr of prev-chosen = " + $('.rating-prev-chosen').length + 
        " nr of hover = " + $('.rating-hover').length);   
    }
}

// user has clicked on a rating ("i.e. a 'circle'")
// mouse has already "entered" the element and has set the
// appropriate background colors of the elements
function elementSelected() {
    
    // avoid storge leaks and ambiguity, just remove all classes
    // from all elements for setting a rating.
    $('.rating-circle').removeClass('rating-prev-chosen rating-chosen rating-hover');
    
    $(this).prevAll().addClass('rating-chosen');
    $(this).addClass('rating-chosen');
    
    rating = $('.rating-circle').index($(this)) + 1;
    
    // NO logic to avoid re-setting what is already set, IF
    // user selects same rating multiple times in a row
    // i.e. there are NO Big O considerations in this case and
    // logic bugs are avoided!
    
    // order matters, avoid simualtaneous displays of stuff
    $('#output').attr("style", "display: none");    
    $('#save-rating').attr("style", "display: inline");
    
}

// mouse has left a ratings circle
function mouseHasLeft() {
    
    // clear timer and its ID to indicate that mouseLeave logic
    // was completely executed.
    window.clearTimeout(mouseLeaveLatency_ID);
    
    // chosen elements do NOT persist after leaving an element
    $('.rating-circle').removeClass('rating-hover rating-prev-chosen');
            
    if (rating > 0) {
        // avoid storage leaks, addClass ALWAYS adds
        $('.rating-circle').removeClass('rating-chosen');
        
        var jH = $('.rating-circle').get(rating - 1);
        $(jH).prevAll().addClass('rating-chosen');
        $(jH).addClass('rating-chosen');
    
    } // end if (rating > 0)
    
    // for purpose of debugging/regression tests,
    // check for invariant conditions:
    // none of these classes should exist on our elements
    if ($('.rating-chosen').length > 0) {
        if (rating === 0) {
            alert("error 1 in mouseLeave event");
        }
    }
     
    if ($('.rating-hover').length > 0) {
        alert("error 2 in mouseLeave event");
    }      
    
} // end of mouseHasLeft

// mouse has left a ratings circle
function mouseLeave() {
            
    mouseLeaveLatency_ID = window.setTimeout(mouseHasLeft, mouseLeaveLatency);

}

//
// Note to reviewer.  It would be possible to use
// the .delegate method of jQuery, however, in this
// case it is NOT necessary, as the scripts never
// lose track of when .rating-circle div's are added
// or removed.  Also, the overhead inherent in .delegate
// monitoring for changes to .rating-circle is avoided.
//
function assignMouseEvents() {
        
    $('.rating-circle').hover(mouseEnter, mouseLeave);
    $('.rating-circle').click(elementSelected);

}

function checkMaxValue() {
    var newMaxValue = parseInt($('#max-value').val());
     
    // remember, javaScript uses short-circuiting
    if ((isNaN(newMaxValue)) || 
        ((newMaxValue <= 0) || (newMaxValue > 20))) {
        alert("Must enter a numeric max value between 1 and 20");
        
        // keep the focus on this numeric field
        $('#max-value').focus();
        
        return false;
    }
    
    return true;
}
//
// User has entered a new max number of rating slots.
// Clear the decks of relavant prior info. and re-build the display
function updateMaxValue() {
    
    var priorMaxValue = $('#rating-container').attr("max-value");
    var newMaxValue = parseInt($('#max-value').val());
         
    if (! checkMaxValue(newMaxValue)) { return; }
    
    // remove previously entered max-value from screen
    $('#max-value').val("");
    
    $('#rating-container').attr("max-value", newMaxValue);
    
    // remove all divs used as ratings circles, add new ones
     $('.rating-circle').remove();
     
    // this code is embedded in the html as javascript
    // this was done to experiment with how easy/hard it is to
    // maintain some js localized within the html
    appendDivs();
    
    // could use ".delegate" but not necessary
    assignMouseEvents();
    
    // rebase the rating based on partials
    if (rating > 0) {
        var pct_rating = rating / priorMaxValue;
        
        rating = Math.floor((pct_rating * newMaxValue) + 0.5);
        
        // remember, rating is one-based
        var oD = $('.rating-circle').get(rating - 1);
        
        // remember, get returns a DOM object
        $(oD).trigger("click");
        
    }
    
} // end of updateMaxValue

// locally global variables!  Should use a class for all of this!!
var gl_lock;
var gl_selfID;

// This synchronizing mechanism uses polling (boo, hiss).
// The polls occur at 40ms intervals ONLY AFTER THE SERVER REQUEST
// COMPLETES.  If the average server completion time is 500 ms, then
// only one poll is initiated by the Ajax success callback.
//
// Using Events to synchronize is overkill for this simple problem.
//
function poll_lock(message) {
    if (! gl_lock) {
        $('#output').text('Message from \"' + serverURL + '\" :: ' + message).fadeIn(200);
        window.clearTimeout(gl_selfID);
    }
}

function submitRating() {
    
    // block re-display of #output until at least fadeOut of 
    // the save-rating button completes
    gl_lock = true;
    
    //
    // Usage of JSON is somewhat invisible!?
    //
    // The objectForPost is a manual build of what is
    // produced by $.parsonJSON('text string')
    //
    // Also, the dataFromPost is an object similar to objectForPost,
    // except that it only has one field: "message".
    //
    var objectForPost = { value: rating,
                          maxValue:  parseInt($('#rating-container').attr("max-value"))};
    
    $.post(serverURL, objectForPost, function(data) { 
        gl_selfID = window.setInterval(poll_lock, 40, data.message);
     },
    "json");
    
    // Note, in general, but NOT guarenteed, the following code
    // executes before the success callback of $.post, hence
    // gl_lock is set before $.post
    
    // Also, do NOT simultaneously display the submit button and
    // server result at the same time
    $('#save-rating').fadeOut(400,function() {gl_lock = false;});
    
    
} // end of submitRating

//
// Enhancement beyond the problem statement:
//    when a "hover" occurs over previously selected
//    elements, then those elements should turn "blue"
//    and any previously non-selected elements remain yellow.
//
function main() {

    // set values of ALL global variables :
    
    rating = 0;
  
    // set latency to a nice leirsurely pace so that the user
    // can "bounce" the cursor from one circle to another
    mouseLeaveLatency = 300;   // latency in milli-seconds
    
    // customize here, if using your own local server
    serverURL = "http://jquery-edx.azurewebsites.net/api/Rating";
    
    // continue to initialize . . .
    assignMouseEvents();
    
    // Allow for dynamic changes to ratings list/array
    $('#update-max-value').click(updateMaxValue);
    
    // Set click event for submit button
    $('#save-rating').click(submitRating);
    
    // Set keyup event for checking actual max value
    $('#max-value').keyup(checkMaxValue);

}

//
// As usual, the last line of code is the most interesting:
//
// Ich sprechen scriptish...
jQuery(document).ready(main);

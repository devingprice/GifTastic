var topics = ['cat', 'dog']
var activeTopic = null; 

// Search Buttons
function createButtons(items){
    for(var i=0;i< items.length; i++){
        var button = createButton(items[i])
        renderButton(button)
    }
}
function createButton(item){
    return $('<button>', {class: 'buttonTopic'}).text(item).attr('data-topic', item)
}
function renderButton(button){
    $('#buttonRow').append(button)
}
function addTopic(topicString){
    topics.push( topicString )

    var button = createButton(topicString)
    addButtonClick( button )
    renderButton( button )

    // Also go ahead and create response
    activeTopic = topicString;
    clearImages();
    requestGiphyImages( activeTopic, $('.giphyImg').length )
}
function addButtonClick(individual = null){
    if( individual ){
        console.log(individual)
        individual.on('click', buttonClick )
    } else {
        $('.buttonTopic').on('click', buttonClick )
    }
}
function buttonClick(){
    var buttonTopic = $(this).attr('data-topic');
    if ( activeTopic !== buttonTopic){
        activeTopic = $(this).attr('data-topic');
        clearImages();
    }
    requestGiphyImages( activeTopic, $('.giphyImg').length )
}
function clearImages() {
    $('#images').empty()
}


// Loading Giphy Data
function requestGiphyImages(q, page) {
    console.log(page)
    var giphyKey = 'qtUSsO1JbI1y0sSA1bhlWpmA29SW2dkr';
    var url = '//api.giphy.com/v1/gifs/search?q=' + q +
        '&api_key=' + giphyKey + '&limit=10&offset=' + page;
    return $.ajax({
        url,
        type: 'GET'
    }).then(response => {
        console.log(response)
        for (var i = 0; i < response.data.length; i++) {
            renderImages(response.data[i], '#images')
        }
        addImageClick()
        loadMoreButton(q)
    })
}

// Image Card
function addImageClick() {
    $('.giphyImg').on('click', function () {
        //toggle animate
        console.log('click')
        var url = $(this).attr('src');
        var gif = $(this).attr('data-gif');
        if (url === gif) {
            $(this).attr('src', $(this).attr('data-still'))
        } else {
            $(this).attr('src', $(this).attr('data-gif'))
        }
    })
}
function renderImages(imageData, destination) {
    var container = $('<div>', { class: 'imgCard' });

    $('<img>', {
        class: 'giphyImg',
        src: imageData.images.original_still.url,
        'data-still': imageData.images.original_still.url,
        'data-gif': imageData.images.original.url
    }).appendTo(container)

    createImageInfo(imageData).appendTo(container)

    container.appendTo(destination)
}
function createImageInfo(imageData) {
    var rating = imageData.rating;
    var title = imageData.title;
    var score = imageData._score;
    var time = imageData.trending_datetime;
    var source = imageData.source_post_url;

    var imageUrl = imageData.images.original.url;

    return $('<div>', { class: 'img-info' }).append(
        $('<h3>').text(title),
        $('<div>').text('rating: ' + rating),
        $('<div>').text('score: ' + score),
        $('<div>').text('time: ' + time),
        $('<a>').attr('href', source).text('source'),
        $('<a>').attr({
            'target': "_blank",
            'href': imageUrl,
            'download': ''
        }).text('Download'),
        addFavoritesButton(imageData)
    )
}
function downloadClick(url, title) {
    window.downloads.download({
        url,
        filename: title
    })
}

// Load More Button
function loadMoreButton(q = null){
    $('#loadMore').show()
    if( q ){
        $('#loadMore').attr('data-topic', q)
    }
}

function hideLoadMore(){
    $('#loadMore').hide();
}

//TABS
function clickFavoritesTab() {
    console.log('clicked fav')
    $('#images').removeClass('active')
    $('#images').addClass('hidden') //images has display flex set by id so it has to be overwritten with display:none!important
    $('#favorites').addClass('active')
    $('#buttonRow').hide();

    $('#favorites').empty();
    $('#favorites').append($('<button>').text('Clear').on('click', function () {
        clearFavorites()
    }));
    var favorites = retrieveFavorites();
    for (var i = 0; i < favorites.length; i++) {
        renderImages(favorites[i], "#favorites")
    }
    addImageClick();
    hideLoadMore();
}
function clickSearchTab() {
    console.log('clicked search')
    $('#favorites').removeClass('active')
    $('#images').addClass('active')
    $('#images').removeClass('hidden')
    $('#buttonRow').show();

    loadMoreButton();
}

// FAVORITES
function storeFavorites(item){
    var currentFavorites = retrieveFavorites();
    console.log( currentFavorites)
    currentFavorites.push(item);
    localStorage.setItem('favorites', JSON.stringify(currentFavorites));
}
function retrieveFavorites(){
    var favorites = [];
    var retrievedFavorites = JSON.parse(localStorage.getItem('favorites'));
    if (retrievedFavorites){
        favorites = retrievedFavorites;
    }
    return favorites;
}
function clearFavorites(){
    localStorage.clear();
    $('#favorites').empty();
    $('.favButton').html('<i class="far fa-heart"></i>')
}
function addFavoritesButton(imageData){
    var favButton =  $('<div>', {class: 'favButton'})
        .html('<i class="far fa-heart"></i>')
        .on('click', function(){
            if( !containedInFavorites(imageData.url) ){
                storeFavorites(imageData)
                $(this).html('<i class="fas fa-heart"></i>')
            }
            
        });
    if( containedInFavorites(imageData.url) ){
        favButton.html('<i class="fas fa-heart"></i>')
    }
    return favButton;
}
function containedInFavorites(url){
    var favorites = retrieveFavorites();
    
    for(var i=0; i< favorites.length; i++){
        if( favorites[i].url === url){
            return true;
        }
    }
    return false;
}


// STARTUP 

function initialize(){
    createButtons(topics);
    addButtonClick();
    $('#loadMore').on('click', buttonClick )
    $('#searchNav').on('click', clickSearchTab )
    $('#favoritesNav').on('click', clickFavoritesTab )

    $('#addTopic').submit(function(event){
        event.preventDefault();
        var text = $('#newTopic').val();
        addTopic(text);
        $('#newTopic').val("")
    })
}
console.log('js');
initialize()
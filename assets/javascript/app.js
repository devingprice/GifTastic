var topics = ['cat', 'dog']
var activeTopic = null; 

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
function requestGiphyImages(q, page){
    console.log(page)
    var giphyKey = 'qtUSsO1JbI1y0sSA1bhlWpmA29SW2dkr';
    var url = '//api.giphy.com/v1/gifs/search?q='+q+
    '&api_key='+giphyKey+'&limit=10&offset='+page;
    return $.ajax({
        url,
        type : 'GET'
    }).then(response => {
        console.log(response)
        for(var i = 0; i < response.data.length; i++){
            renderImages(response.data[i], '#images')
        }
        addImageClick()
        loadMoreButton(q)
    })
}
function renderImages(imageData, destination){
    var container = $('<div>');

    $('<img>', {
        class: 'giphyImg',
        src: imageData.images.original_still.url,
        'data-still': imageData.images.original_still.url,
        'data-gif': imageData.images.original.url
    }).appendTo(container)

    createImageInfo(imageData).appendTo(container)

    container.appendTo( destination )
}
function createImageInfo(imageData){
    var rating = imageData.rating;
    var title = imageData.title;
    var score = imageData._score;
    var time = imageData.trending_datetime;
    var source = imageData.source_post_url;

    var imageUrl = imageData.images.original.url;

    return $('<div>', { class: 'img-info'}).append(
        $('<h3>').text( title ),
        $('<div>').text( 'rating: '+ rating ),
        $('<div>').text( 'score: '+ score ),
        $('<div>').text( 'time: '+ time ),
        $('<a>').attr('href', source).text( 'source' ),
        $('<a>').attr({
            'target':"_blank",
            'href':  imageUrl ,
            'download':''
        }).text('Download'),
        addFavoritesButton(imageData)
    )
}

function downloadClick(url, title){
    window.downloads.download({
        url,
        filename: title
    })
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
function addImageClick(){
    $('.giphyImg').on('click', function(){
        //toggle animate
        console.log('click')
        var url = $(this).attr('src');
        var gif = $(this).attr('data-gif');
        if( url === gif ){
            $(this).attr('src', $(this).attr('data-still'))
        } else {
            $(this).attr('src', $(this).attr('data-gif'))
        }
    })
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
function clearImages(){
    $('#images').empty()
}
function loadMoreButton(q){
    $('#loadMore').attr('data-topic', q).show();
}

var favorites = {'favorites': []};
function storeFavorites(item){
    var currentFavorites = favorites;//retrieveFavorites();
    currentFavorites.favorites.push(item);
    console.log(favorites)
    localStorage.setItem('favorites', currentFavorites);
}
function retrieveFavorites(){
    return localStorage.getItem('favorites');
}
function clearFavorites(){
    localStorage.clear();
}


function addFavoritesButton(imageData){
    return $('<button>').text('Fav').on('click', function(){
        storeFavorites(imageData)
    })
}
function clickFavoritesTab(){
    console.log('clicked fav')
    $('#images').removeClass('active')
    $('#images').addClass('hidden')
    $('#favorites').addClass('active')

    $('#favorites').empty();
    for( var i = 0; i < favorites.favorites.length;i++){
        renderImages( favorites.favorites[i], "#favorites")
    }
    addImageClick();
}
function clickSearchTab(){
    console.log('clicked search')
    $('#favorites').removeClass('active')
    $('#images').addClass('active')
    $('#images').removeClass('hidden')
}

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
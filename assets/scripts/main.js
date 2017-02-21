var $ = $;
var defaultTileWidth = 0;
var anime = window.anime;

$(document).ready(function() {
  configurateSearch();
  configurateTiles();
});

/**
 * Make input width to size of placeholder
 */
function configurateInput() {
  let searchInput = $('#search-input')[0];
  searchInput.setAttribute('size', searchInput.getAttribute('placeholder').length);
}

/**
 * Set max height for Tiles
 */
function configurateHeightTiles() {
  let tiles = $('.tile');
  let maxHeight = 0;
  tiles.toArray().forEach(tile => {
    maxHeight = maxHeight < $(tile).height() ? $(tile).height() : maxHeight;
  });
  tiles.css('min-height', maxHeight);
}

/**
 * Open google search when clicked on 'search' icon or 'Enter' in search input
 */
function configurateSearch() {
  let goSearch = () => {
    let serchText = encodeURIComponent($('#search-input').val());
    document.location.href =`https://www.google.com/search?q=${serchText}`;
  };

  $('div.search i').click(goSearch);
  $('div.search input').keypress((e) => {
    if (e.which == 13) {
      goSearch();
    }
  });
}

/**
 * Configurate Tiles in content row for animation
 */
function configurateTiles() {
  let $tiles = $('.tile');
  defaultTileWidth = Math.round($tiles.width());

  $tiles.click(event => {
    let tile = event.currentTarget;
    let $activeTile = $('.tile.active');

    if (tile == $activeTile[0] || $activeTile.length == 0) {
      if ($(tile).hasClass('active')) {
        closeTile(event.currentTarget);
      } else {
        openTile(tile);
      }
    } else {
      // Has opened tiles but clicked on another closed
      closeTile($activeTile[0], true).then(() => {
        openTile(tile);
      });
    }
  });
}

/**
 * Open Tile
 * @param {Element} tileToOpen
 */
function openTile(tileToOpen) {
  let $tiles = $('.tile');
  let afterClicked = false;
  let clickedIndex = -1;
  $tiles.toArray().forEach(function(tile, i) {
    if (tile !== tileToOpen && i !== 0) {
      let left = defaultTileWidth / 2 * (clickedIndex == -1 ? i : (i - clickedIndex - 1));

      // Offset for Tiles after opened Tile
      if (afterClicked && clickedIndex > 0) {
        left = left + (clickedIndex - 1) * defaultTileWidth / 2 ;
      }
      anime({
        targets: tile,
        right: `${left}px`,
        duration: 1000
      });
    } else if (tile == tileToOpen) {
      afterClicked = true;
      clickedIndex = i;
      blurTile(clickedIndex);
      anime({
        targets: tile,
        width: '870px',
        right: i == 0 ? null : `${defaultTileWidth / 2 * (clickedIndex - 1)}px`,
        duration: 300,
        complete: () => {
          anime({
            targets: $(tileToOpen).find('.info')[0],
            color: ['#FFF','#000'],
            duration: 1500
          });
          $(tileToOpen).addClass('active');
        }
      });
    }
  });
}

/**
 * Blur Tile after one expand
 * @param {Number} clickedIndex
 */
function blurTile(clickedIndex) {
  let tiles = $('.tile').toArray();
  let leftTargets = [];
  let rightTargets = [];

  // Tiles left of expanded tile
  if (clickedIndex >= 2) {
    leftTargets = tiles.slice(0, clickedIndex - 1);
  }

  // Tiles right of expanded tile
  if ((tiles.length - (clickedIndex + 1))>= 2) {
    rightTargets = tiles.slice(clickedIndex + 2, tiles.length);
    rightTargets.forEach((tile, i) => {
      rightTargets[i] = $(tile).css('z-index', `${100 - i}`)[0];
    })
  }

  leftTargets.concat(rightTargets).forEach(tile => {
    let width = $(tile).width();
    let height = $(tile).height();
    $(tile).append(`<div class="tile-blur" style="width: ${width}px; height: ${height}px; "></div>`);
  });

  leftTargets.forEach((tile, i) => {
    $(tile).find('.tile-blur').css('background-color', `rgba(0, 0, 0, 0.${clickedIndex - 1 - i})`);
  });

  rightTargets.forEach((tile, i) => {
    $(tile).find('.tile-blur').css('background-color', `rgba(0, 0, 0, 0.${i+1})`);
  });
}

function removeBlur() {
  $('.tile .tile-blur').remove();
  $('.tile').css('z-index', '200');
}

/**
 * Close Tile
 * @param {Element} tile
 * @returns {Promise}
 */
function closeTile(tile, hasOpened = false) {
  return new Promise(function (resolve) {
    removeBlur();
    anime({
      targets: tile,
      width: `${defaultTileWidth}px`,
      duration: 50,
      begin: () => {
        $(tile).removeClass('active');
      },
      complete: () => {
        if (!hasOpened) {
          unexpandTiles().complete = () => resolve(true);
        } else {
          resolve(true);
        }
      }
    });
  });
}

/**
 * Unexpand Tiles
 * @returns {callBacks} callBacks
 */
function unexpandTiles() {
  let tiles = $('.tile');
  let callBacks = anime({
    targets: tiles.toArray(),
    right: `0px`,
    duration: 400
  });

  return callBacks;
}
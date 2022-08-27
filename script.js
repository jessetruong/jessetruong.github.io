const http = new XMLHttpRequest();
const url='https://cd-static.bamgrid.com/dp-117731241344/home.json';
http.open("GET", url);
http.send();

document.onkeydown = handleKeyNavigation;

let focusedSet = 0;
let focusedImage = 0;

let selectedImagePosition = 0;
let beginRowScrolling = false;

let imagesPerPage;

window.addEventListener('resize', handleWindowResize);
window.onload = handleWindowOnLoad;

// Disable mouse navigation
window.onmousedown = function(e) {
    e.preventDefault();
}

function handleWindowOnLoad() {
    handleWindowResize();
}

function handleWindowResize() {
    imagesPerPage = Math.floor(window.innerWidth/320);
    console.log('Window resize', window.innerWidth, imagesPerPage);
}

function handleKeyNavigation(e) {
    let horizonalIncrement = 0;
    let verticalIncrement = 0;
    switch (e.keyCode) {
        case 37:
            horizonalIncrement--;
            break;
        case 38:
            verticalIncrement--;
            break;
        case 39:
            horizonalIncrement++;   
            break;
        case 40:
            verticalIncrement++;
            break;
        default:
            break;
    }

    if (e.keyCode >= 37 && e.keyCode <= 40) {
        cleanCurrentSelection();
        focusedSet += verticalIncrement;
        focusedImage += horizonalIncrement;
        selectedImagePosition += horizonalIncrement;
        focusOnNewSelection(horizonalIncrement, verticalIncrement);
    }
}


function cleanCurrentSelection() {
    if (focusedSet >= 0 && focusedImage >= 0) {
        const setImagesContainer = document.getElementById(`set_${focusedSet}_container`);        
        setImagesContainer.querySelector('.left-arrow').style.display = 'none';
        setImagesContainer.querySelector('.right-arrow').style.display = 'none';
    }
}

function focusOnNewSelection(horizonalIncrement, verticalIncrement) {
    const numTotalSets = document.querySelectorAll('.set-container').length; 
    const contentSection = document.querySelector('#content-selector');
    if (focusedSet < 0) {
        contentSection.prepend(contentSection.lastChild);
        focusedSet = numTotalSets - 1;
    } else if (focusedSet >= numTotalSets) {
        contentSection.append(contentSection.firstChild);
        focusedSet = 0;
    }

    const setImagesContainer = document.getElementById(`set_${focusedSet}_container`);
    setImagesContainer.querySelector('.left-arrow').style.display = 'block';
    setImagesContainer.querySelector('.right-arrow').style.display = 'block';

    const images = document.getElementById(`set_${focusedSet}_container`).querySelector('.set-images');
    
    if (selectedImagePosition < 0 || selectedImagePosition >= Math.ceil(imagesPerPage/2)) {
        beginRowScrolling = true;
    }

    // const index = Array.from(images.children).indexOf(document.getElementById(`set_${focusedSet}_image_${focusedImage}`) );
    // if (!images.children[index + Math.ceil(imagesPerPage/2)]) {
    //     images.prepend(createPlaceholderImage());
    //     console.log('before', index + Math.ceil(imagesPerPage/2), images.children[index + Math.ceil(imagesPerPage/2)])
    //     images.appendChild(images.querySelector('.preview-image'));
    //     console.log('after', index + Math.ceil(imagesPerPage/2), images.children[index + Math.ceil(imagesPerPage/2)])
    // }

    if (focusedImage < 0) {
        focusedImage = images.querySelectorAll('.preview-image').length - 1;
        // while (images.querySelectorAll('.preview-image')[selectedImagePosition].getAttribute('id') !== `set_${focusedSet}_image_${focusedImage}`) {
        //     console.log(images.querySelectorAll('.preview-image')[selectedImagePosition].getAttribute('id'), `set_${focusedSet}_image_${focusedImage}`);
        //     images.prepend(images.lastChild);
        // }
    } else if (focusedImage > images.querySelectorAll('.preview-image').length - 1) {
        focusedImage = 0;
    }
    
    if (beginRowScrolling) {
        let currentScrollPosition = parseInt(getComputedStyle(images).getPropertyValue('--scroll-distance'), 10) || 0;
        images.style.setProperty('--current-scroll-position',  currentScrollPosition + 'px');
        
        const scrollAnimationFinished = () => {
            images.classList.add('scrolled');
            images.classList.remove('scrolling-image');
            images.removeEventListener('animationend', scrollAnimationFinished);
        }
        images.addEventListener('animationend', scrollAnimationFinished);
        

        console.log('Selected image position', selectedImagePosition);
        scrollDistance = focusedImage <= Math.floor(imagesPerPage/2) ? 0 : (Math.floor(imagesPerPage/2) - focusedImage) * 320;


        if (focusedImage === images.querySelectorAll('.preview-image').length - 2 && horizonalIncrement === -1) {
            currentScrollPosition = (Math.floor(imagesPerPage/2) - focusedImage - 1) * 320;
            images.style.setProperty('--current-scroll-position',  currentScrollPosition + 'px');
        }

        // Loop backward from the beginning to the end
        if (selectedImagePosition < 0) {
            scrollDistance = -390;
        }
        
        console.log('Scroll distance', currentScrollPosition, (selectedImagePosition - imagesPerPage), scrollDistance);
        images.style.setProperty('--scroll-distance',  scrollDistance + 'px');
        images.classList.add('scrolling-image');

        selectedImagePosition = focusedImage < Math.floor(imagesPerPage/2) && focusedImage >= 0 ?
            focusedImage : Math.floor(imagesPerPage/2);
        console.log('Selected image position', selectedImagePosition);
    }
   
    
    document.getElementById(`set_${focusedSet}_image_${focusedImage}`).focus();
}

function createPlaceholderImage() {
    const img = document.createElement('input');
    img.setAttribute('type', 'image');
    img.classList.add('placeholder-image');
    img.src = 'images/loop.png';
    return img;
}

http.onreadystatechange = (e) => {

    const contentSection = document.querySelector('#content-selector');
    if (http.readyState === 4) {
        const responseJSON = JSON.parse(http.responseText)
        if (responseJSON?.data?.StandardCollection?.containers) {
            responseJSON.data.StandardCollection.containers.forEach((container, index) => {
                if (container.set?.items) {
                    let setContainer = createSetContainer(container.set.text.title.full.set.default.content, index);
                    setContainer.appendChild(createSetOptionImagesSection(container.set.items, /(set_)(\d*)/.exec(setContainer.getAttribute('id'))[2]));
                    contentSection.appendChild(setContainer);
                }   
            });
        }
    }
   
}

const observer = new MutationObserver((mutations, obs) => {
    const firstSelectedImage = document.getElementById(`set_${focusedSet}_image_${focusedImage}`);
    if (firstSelectedImage) {
        firstSelectedImage.focus();
        const setImagesContainer = document.getElementById(`set_${focusedSet}_container`);
        setImagesContainer.querySelector('.left-arrow').style.display = 'block';
        setImagesContainer.querySelector('.right-arrow').style.display = 'block';
        obs.disconnect();
        return;
    }
});

observer.observe(document, {
    childList: true,
    subtree: true
});

const createSetContainer = (setName, index) => {
    const newSet = document.createElement('div');
    newSet.setAttribute('id', `set_${index}`)
    newSet.classList.add('set-container');
    const label = document.createElement('label');
    label.setAttribute('for',setName);
    label.innerHTML = setName;
    newSet.appendChild(label);
    return newSet
}

function createLeftArrow(distanceFromTop) {
    const leftArrow = document.createElement('div');
    leftArrow.classList.add('page-arrow', 'left-arrow');
    leftArrow.style.setProperty('--distance-from-top', distanceFromTop + 'px');
    leftArrow.style.display = 'none';
    leftArrow.appendChild(document.createTextNode('\u276E'));
    return leftArrow;
}

function createRightArrow(distanceFromTop) {
    const rightArrow = document.createElement('div');
    rightArrow.classList.add('page-arrow', 'right-arrow');
    rightArrow.style.setProperty('--distance-from-top', distanceFromTop + 'px');
    rightArrow.style.display = 'none';
    rightArrow.appendChild(document.createTextNode('\u276F'));
    return rightArrow;
}


const createSetOptionImagesSection = (items, setIndex) => {
    const setImagesContainer = document.createElement('div');
    setImagesContainer.classList.add('set-images-container');
    setImagesContainer.setAttribute('id', `set_${setIndex}_container`);

    
    setImagesContainer.appendChild(createLeftArrow(110 + 260 * setIndex));
    setImagesContainer.appendChild(createRightArrow(110 + 260 * setIndex));
    
    const setOptions = document.createElement('div');
    setOptions.classList.add('set-images')
    setImagesContainer.appendChild(setOptions);
    if (items) {
        const loopBackImage = createPlaceholderImage()
        setOptions.appendChild(loopBackImage);

        let index = 0;
        items.forEach((item) => {
            const tile = item?.image.tile['1.78'];

            // There has to be a better way to do this
            const itemImageURL = tile?.series?.default?.url ||
                tile?.program?.default?.url ||
                tile?.default?.default?.url
            if (itemImageURL) {
                checkIfImageExists(itemImageURL, (exists) => {
                    if (exists) {
                        const img = document.createElement('input');
                        img.setAttribute('type', 'image');
                        img.setAttribute('id', `set_${setIndex}_image_${index}`)
                        img.classList.add('preview-image');
                        img.src = itemImageURL
                        // setOptions.appendChild(img);
                        loopBackImage.before(img);
                        index++;
                    } else {
                        console.log('Image does not exist', itemImageURL)
                    }
                });
            }        
        });
    }
    return setImagesContainer;
}

function checkIfImageExists(url, callback) {
    const img = new Image();
    img.src = url;

    if (img.complete) {
      callback(true);
    } else {
      img.onload = () => {
        callback(true);
      };
      
      img.onerror = () => {
        callback(false);
      };
    }
  }
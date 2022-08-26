const http = new XMLHttpRequest();
const url='https://cd-static.bamgrid.com/dp-117731241344/home.json';
http.open("GET", url);
http.send();

document.onkeydown = handleKeyNavigation;

let focusedSet = -1;
let focusedImage = -1;

let imagesPerPage;

window.addEventListener('resize', handleWindowResize)
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
    switch (e.keyCode) {
        case 37:
            console.log('left')
            cleanCurrentSelection();
            focusedImage--;
            navigateToNewSelection();
            break;
        case 38:
            console.log('up')
            cleanCurrentSelection();
            focusedSet--;
            navigateToNewSelection();
            break;
        case 39:
            console.log('right')
            cleanCurrentSelection();
            focusedImage++;  
            navigateToNewSelection();      
            break;
        case 40:
            console.log('down')
            cleanCurrentSelection();
            focusedSet++;
            navigateToNewSelection();
            break;
        default:
            break;
    }
}

function cleanCurrentSelection() {
    if (focusedSet >= 0 && focusedImage >= 0) {
        const setImagesContainer = document.getElementById(`set_${focusedSet}_container`);        
        setImagesContainer.querySelector('.left-arrow').style.display = 'none';
        setImagesContainer.querySelector('.right-arrow').style.display = 'none';
    }
}

function navigateToNewSelection() {

    let scrollWidth = 0;
    focusedSet = Math.min(Math.max(0, focusedSet), 3);

    const setImagesContainer = document.getElementById(`set_${focusedSet}_container`);
    const images = document.getElementById(`set_${focusedSet}_container`).querySelector('.set-images');

    focusedImage = Math.min(Math.max(0, focusedImage), images.children.length - 1);
    
    if(focusedImage > imagesPerPage - 1) {
        setImagesContainer.querySelector('.left-arrow').style.display = 'block';
    } else {
        setImagesContainer.querySelector('.left-arrow').style.display = 'none';
    }
    if(focusedImage < images.children.length - 1) {
        setImagesContainer.querySelector('.right-arrow').style.display = 'block';
    } else {
        setImagesContainer.querySelector('.right-arrow').style.display = 'none';
    }
        // setContainerImages.forEach(image => {
            
            console.log(images.children.length)
            images.addEventListener('animationend', () => {
                console.log('Animation end');
                images.classList.add('scrolled');
                images.classList.remove('scroll-image')
            });
            const currentScrollWidth = parseInt(getComputedStyle(images).getPropertyValue('--scroll-width'), 10) || 0;
            images.style.setProperty('--current-scroll-position',  currentScrollWidth + 'px')
            scrollWidth = Math.max(focusedImage - imagesPerPage + 1, 0) * 320
            images.style.setProperty('--scroll-width',  -scrollWidth + 'px')
            images.classList.add('scroll-image');
        // })
    
    document.getElementById(`set_${focusedSet}_image_${focusedImage}`).focus();
}

http.onreadystatechange = (e) => {

    const contentSection = document.querySelector('#content-selector');
    if (http.readyState === 4) {
        const responseJSON = JSON.parse(http.responseText)
        if (responseJSON?.data?.StandardCollection?.containers) {
            responseJSON.data.StandardCollection.containers.forEach((container, index) => {
                if (container.set?.items) {
                    let setContainer = createSetContainer(container.set.text.title.full.set.default.content, index);
                    setContainer.appendChild(createSetOptionImagesSection(container.set?.items, /(set_)(\d*)/.exec(setContainer.getAttribute('id'))[2]));
                    contentSection.appendChild(setContainer);
                }
                
            });
        }
    }
   
}

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
                        setOptions.appendChild(img);
                        index++;
                    } else {
                        console.log('Image does not exist', itemImageURL)
                    }
                });
            }        
        })
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
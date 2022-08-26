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

function handleWindowOnLoad() {
    handleWindowResize();
}

function handleWindowResize() {
    console.log('Window resize');
}

function handleKeyNavigation(e) {
    let scrollWidth = 0;
    switch (e.keyCode) {
        case 37:
            console.log('left')
            focusedImage--;
            scrollWidth = -320;
            break;
        case 38:
            console.log('up')
            focusedSet--;
            break;
        case 39:
            console.log('right')
            focusedImage++;
            if (focusedImage >= 5) {
                scrollWidth = 320;
            }
            
            break;
        case 40:
            console.log('down')
            focusedSet++;
            break;
        default:
            break;
    }

    focusedSet = Math.min(Math.max(0, focusedSet), 3);
    focusedImage = Math.min(Math.max(0, focusedImage), 14);

    console.log(focusedSet, focusedImage)
    const setContainerImages = document.getElementById(`set_${focusedSet}_container`).childNodes;
    // setContainerImages.forEach(image => {
    //     image.addEventListener('animationend', () => {
    //         console.log('Animation end');
    //         image.classList.add('scrolled');
    //         image.classList.remove('scroll-image')
    //     });
    //     const currentScrollWidth = parseInt(getComputedStyle(image).getPropertyValue('--scroll-width'), 10) || 0;
    //     image.style.setProperty('--scroll-width',  currentScrollWidth-scrollWidth + 'px')
    //     image.classList.add('scroll-image');
    // })
    setContainerImages.scrollLeft += scrollWidth;
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
                    setContainer.appendChild(createSetOptionImagesSection(container.set?.items, setContainer.getAttribute('id')));
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

const createSetOptionImagesSection = (items, setID) => {
    const setImagesContainer = document.createElement('div');
    setImagesContainer.classList.add('set-images-container');
    setImagesContainer.setAttribute('id', `${setID}_container`);
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
                        img.setAttribute('id', `${setID}_image_${index}`)
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
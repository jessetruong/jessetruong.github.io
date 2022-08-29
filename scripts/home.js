export const generateHomePage = () => {
    // Constants and global variables
    const url='https://cd-static.bamgrid.com/dp-117731241344/home.json';
    const arrowVerticalOffset = 110;
    const setHeight = 260;

    // Fetch homepage data from API and generate HTML
    fetch(url).then(async (response) => {
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        populateContentSelector(await response.json());
    }).catch((error) => {
        console.error('Unable to load homepage data', error);
    });


    function populateContentSelector(response) {
        const contentSection = document.querySelector('#content-selector');
            if (response?.data?.StandardCollection?.containers) {
                response.data.StandardCollection.containers.forEach((container, index) => {
                    if (container.set?.items) {
                        let setContainer = createSetContainer(container.set, index);
                        setContainer.appendChild(createSetOptionImagesSection(container.set.items, setContainer.dataset.set));
                        contentSection.appendChild(setContainer);
                    }   
                });
            } 
    }

    function createSetContainer(setData, index) {
        const setName = setData.text.title.full.set.default.content;
        const setContainer = document.createElement('div');
        setContainer.setAttribute('id', `set_${index}`)
        setContainer.setAttribute('data-set', index);
        setContainer.setAttribute('data-set-id', setData.setId);
        setContainer.classList.add('set-container');
        const label = document.createElement('label');
        label.innerHTML = setName;
        setContainer.appendChild(label);
        return setContainer
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

    function createLoopbackImage() {
        const img = document.createElement('input');
        img.setAttribute('type', 'image');
        img.classList.add('loopback-image');
        img.src = 'images/loop.png';
        return img;
    }

    function createSetOptionImagesSection(items, setIndex) {
        const setImagesContainer = document.createElement('div');
        setImagesContainer.classList.add('set-images-container');
        setImagesContainer.setAttribute('id', `set_${setIndex}_container`);

        
        setImagesContainer.appendChild(createLeftArrow(arrowVerticalOffset + setHeight * setIndex));
        setImagesContainer.appendChild(createRightArrow(arrowVerticalOffset + setHeight * setIndex));
        
        const setOptions = document.createElement('div');
        setOptions.classList.add('set-images')
        setImagesContainer.appendChild(setOptions);
        if (items) {
            // Start with the last image of the row, loopback icon to go to beginning
            const loopBackImage = createLoopbackImage()
            setOptions.appendChild(loopBackImage);

            let index = 0;
            items.forEach((item) => {
                const tile = item?.image.tile['1.78'];

                // There has to be a better way to do this
                let contentType = 'default';
                let id = item.contentId;
                if (item.collectionId) {
                    id = item.collectionId;
                    contentType = 'collection';
                } else if (item.programId) {
                    id = item.programId;
                    contentType = 'program';
                } else if (item.seriesId) {
                    id = item.seriesId;
                    contentType = 'series';
                }

                const itemImageURL = tile.default?.default?.url || tile[contentType].default?.url;

                if (itemImageURL) {
                    checkIfImageExists(itemImageURL, (exists) => {
                        if (exists) {
                            const img = createPreviewImageElement(item, contentType, id, setIndex, index, itemImageURL);
                            loopBackImage.before(img);
                            index++;
                        } else {
                            console.error('Image does not exist', itemImageURL)
                        }
                    });
                }        
            });
        }
        return setImagesContainer;
    }

    function createPreviewImageElement(item, contentType, id, setIndex, index, itemImageURL) {
        const img = document.createElement('input');
        img.setAttribute('type', 'image');
        img.setAttribute('id', `set_${setIndex}_image_${index}`)
        img.setAttribute('data-set', setIndex);
        img.setAttribute('data-image-index', index);
        img.setAttribute('data-title', item.text?.title?.full[contentType]?.default?.content);
        img.setAttribute('data-id', id);
        img.setAttribute('data-video-url', item.videoArt[0]?.mediaMetadata?.urls[0]?.url);
        img.classList.add('preview-image');
        img.src = itemImageURL;
        return img;
    }

    // Helper function to determine if provided image URL is valid
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

    // Once the page is loaded, select the first image of the first row
    const observer = new MutationObserver((mutations, obs) => {
        const firstSelectedImage = document.getElementById(`set_0_image_0`);
        if (firstSelectedImage) {
            firstSelectedImage.focus();
            const setImagesContainer = document.getElementById(`set_0_container`);
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

}